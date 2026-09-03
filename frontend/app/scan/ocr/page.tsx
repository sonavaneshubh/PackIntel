import { Suspense } from 'react';
import { OcrAnalysisView } from '@/features/ocr/OcrAnalysisView';

export default function OcrPage() {
  return (
    <Suspense fallback={null}>
      <OcrAnalysisView />
    </Suspense>
  );
}
