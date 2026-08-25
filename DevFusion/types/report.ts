export interface Report {
  id: string;
  title: string;
  date: string;
  size: string;
  type: string;
  scansIncluded: number;
  status: 'Generated' | 'Archived' | 'Processing';
}

export interface ComplianceScore {
  score: number;
  status: 'PASS' | 'REVIEW' | 'FAIL';
  label: string;
}

export interface ViolationSummary {
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  penalty: string;
}