// Supabase service layer for inspections
// All operations use the authenticated Supabase client — inspector_id is ALWAYS
// derived from the server-side auth session, never from client input.

import { supabase } from '@/lib/supabase/client';
import {
  Inspection,
  InspectionInsert,
  InspectionUpdate,
  ExtractedLabel,
  ExtractedLabelInsert,
  ExtractedLabelUpdate,
  ComplianceResultRow,
  ComplianceResultInsert,
  InspectionImage,
  InspectionImageInsert,
  InspectionReport,
  InspectionReportInsert,
  DashboardStats,
} from '@/types/database';

// ─── Inspection Number Generator ─────────────────────────────────────────────
// Generates a unique inspection number: INS-YYYYMMDD-XXXXXX
export function generateInspectionNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `INS-${date}-${random}`;
}

// ─── Inspections ──────────────────────────────────────────────────────────────

export async function createInspection(
  fields: Omit<InspectionInsert, 'inspector_id'>
): Promise<{ data: Inspection | null; error: string | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'You must be authenticated to create an inspection.' };
  }

  const payload: InspectionInsert = {
    ...fields,
    inspector_id: user.id,                       // always from auth, never from client
    inspection_number: fields.inspection_number || generateInspectionNumber(),
    status: fields.status || 'draft',
  };

  const { data, error } = await supabase
    .from('inspections')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[createInspection]', error.message);
    return { data: null, error: 'Failed to create inspection record.' };
  }
  return { data, error: null };
}

export async function updateInspection(
  inspectionId: string,
  updates: InspectionUpdate
): Promise<{ data: Inspection | null; error: string | null }> {
  const { data, error } = await supabase
    .from('inspections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', inspectionId)
    .select()
    .single();

  if (error) {
    console.error('[updateInspection]', error.message);
    return { data: null, error: 'Failed to update inspection.' };
  }
  return { data, error: null };
}

export async function getInspectionById(inspectionId: string): Promise<{
  data: (Inspection & {
    extracted_labels: ExtractedLabel | null;
    compliance_results: ComplianceResultRow[];
    inspection_images: InspectionImage[];
    inspection_reports: InspectionReport[];
  }) | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      extracted_labels (*),
      compliance_results (*),
      inspection_images (*),
      inspection_reports (*)
    `)
    .eq('id', inspectionId)
    .single();

  if (error) {
    console.error('[getInspectionById]', error.message);
    return { data: null, error: 'Failed to load inspection details.' };
  }
  return { data, error: null };
}

export async function getMyInspections(options?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ data: Inspection[]; error: string | null; count: number }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: [], error: 'Not authenticated.', count: 0 };
  }

  let query = supabase
    .from('inspections')
    .select('*', { count: 'exact' })
    .eq('inspector_id', user.id)
    .order('created_at', { ascending: false });

  if (options?.status && options.status !== 'ALL') {
    query = query.eq('overall_result', options.status.toLowerCase());
  }
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[getMyInspections]', error.message);
    return { data: [], error: 'Failed to load inspection history.', count: 0 };
  }
  return { data: data || [], error: null, count: count || 0 };
}

// ─── Dashboard Statistics ─────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<{
  data: DashboardStats;
  error: string | null;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: { total: 0, compliant: 0, needsReview: 0, nonCompliant: 0, highPriority: 0, avgRiskScore: 0 },
      error: 'Not authenticated.',
    };
  }

  const { data, error } = await supabase
    .from('inspections')
    .select('overall_result, risk_score, status')
    .eq('inspector_id', user.id);

  if (error) {
    console.error('[getDashboardStats]', error.message);
    return {
      data: { total: 0, compliant: 0, needsReview: 0, nonCompliant: 0, highPriority: 0, avgRiskScore: 0 },
      error: 'Failed to load dashboard statistics.',
    };
  }

  const rows = data || [];
  const completed = rows.filter((r) => r.status === 'completed');
  const compliant = completed.filter((r) => r.overall_result === 'pass').length;
  const needsReview = completed.filter((r) => r.overall_result === 'review').length;
  const nonCompliant = completed.filter((r) => r.overall_result === 'fail').length;
  const highPriority = completed.filter((r) => (r.risk_score ?? 0) >= 76).length;
  const riskScores = completed
    .map((r) => r.risk_score)
    .filter((s): s is number => s !== null);
  const avgRiskScore =
    riskScores.length > 0
      ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length)
      : 0;

  return {
    data: {
      total: rows.length,
      compliant,
      needsReview,
      nonCompliant,
      highPriority,
      avgRiskScore,
    },
    error: null,
  };
}

// ─── Inspector Profile ────────────────────────────────────────────────────────

export async function getMyProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { data: null, error: 'Not authenticated.' };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('[getMyProfile]', error.message);
    return { data: null, error: 'Failed to load profile.' };
  }
  return { data, error: null };
}

// ─── Extracted Labels ─────────────────────────────────────────────────────────

export async function saveExtractedLabel(
  label: Omit<ExtractedLabelInsert, never>
): Promise<{ data: ExtractedLabel | null; error: string | null }> {
  const { data, error } = await supabase
    .from('extracted_labels')
    .upsert(label, { onConflict: 'inspection_id' })
    .select()
    .single();

  if (error) {
    console.error('[saveExtractedLabel]', error.message);
    return { data: null, error: 'Failed to save extracted label data.' };
  }
  return { data, error: null };
}

export async function updateExtractedLabel(
  inspectionId: string,
  updates: ExtractedLabelUpdate
): Promise<{ data: ExtractedLabel | null; error: string | null }> {
  const { data, error } = await supabase
    .from('extracted_labels')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('inspection_id', inspectionId)
    .select()
    .single();

  if (error) {
    console.error('[updateExtractedLabel]', error.message);
    return { data: null, error: 'Failed to update label data.' };
  }
  return { data, error: null };
}

// ─── Compliance Results ───────────────────────────────────────────────────────

export async function saveComplianceResults(
  results: ComplianceResultInsert[]
): Promise<{ error: string | null }> {
  if (!results.length) return { error: null };

  const { error } = await supabase.from('compliance_results').insert(results);

  if (error) {
    console.error('[saveComplianceResults]', error.message);
    return { error: 'Failed to save compliance results.' };
  }
  return { error: null };
}

export async function getComplianceResults(
  inspectionId: string
): Promise<{ data: ComplianceResultRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('compliance_results')
    .select('*')
    .eq('inspection_id', inspectionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getComplianceResults]', error.message);
    return { data: [], error: 'Failed to load compliance results.' };
  }
  return { data: data || [], error: null };
}

// ─── Image Storage ────────────────────────────────────────────────────────────

const IMAGE_BUCKET = 'inspection-images';
const REPORT_BUCKET = 'inspection-reports';

export async function uploadInspectionImage(
  inspectionId: string,
  file: File,
  imageType: InspectionImage['image_type'] = 'label_front'
): Promise<{ data: InspectionImage | null; error: string | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'Not authenticated.' };
  }

  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${imageType}_${Date.now()}.${ext}`;
  const storagePath = `${user.id}/${inspectionId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('[uploadInspectionImage]', uploadError.message);
    return { data: null, error: 'Image upload failed. Please try again.' };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath);

  const imageRecord: InspectionImageInsert = {
    inspection_id: inspectionId,
    storage_path: storagePath,
    public_url: publicUrl || null,
    image_type: imageType,
    file_name: file.name,
    file_size_bytes: file.size,
    mime_type: file.type,
  };

  const { data, error: dbError } = await supabase
    .from('inspection_images')
    .insert(imageRecord)
    .select()
    .single();

  if (dbError) {
    console.error('[uploadInspectionImage:db]', dbError.message);
    return { data: null, error: 'Image saved to storage but failed to record in database.' };
  }

  return { data, error: null };
}

export async function getSignedImageUrl(
  storagePath: string
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(storagePath, 3600); // 1 hour

  if (error) {
    return { url: null, error: 'Failed to generate secure image URL.' };
  }
  return { url: data.signedUrl, error: null };
}

// ─── Report Storage ───────────────────────────────────────────────────────────

export async function saveInspectionReport(
  inspectionId: string,
  pdfBlob: Blob,
  reportType: string = 'pdf'
): Promise<{ data: InspectionReport | null; error: string | null }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'Not authenticated.' };
  }

  const storagePath = `${user.id}/${inspectionId}/report.${reportType}`;

  const { error: uploadError } = await supabase.storage
    .from(REPORT_BUCKET)
    .upload(storagePath, pdfBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf',
    });

  if (uploadError) {
    console.error('[saveInspectionReport]', uploadError.message);
    return { data: null, error: 'Failed to upload report.' };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(REPORT_BUCKET).getPublicUrl(storagePath);

  const record: InspectionReportInsert = {
    inspection_id: inspectionId,
    storage_path: storagePath,
    public_url: publicUrl || null,
    report_type: reportType,
    file_size_bytes: pdfBlob.size,
  };

  const { data, error: dbError } = await supabase
    .from('inspection_reports')
    .insert(record)
    .select()
    .single();

  if (dbError) {
    console.error('[saveInspectionReport:db]', dbError.message);
    return { data: null, error: 'Report uploaded but failed to record in database.' };
  }

  return { data, error: null };
}
