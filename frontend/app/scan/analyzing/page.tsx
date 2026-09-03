import { Suspense } from 'react';
import { AnalyzingView } from '@/features/scan/AnalyzingView';

export default function AnalyzingPage() {
  return (
    <Suspense fallback={null}>
      <AnalyzingView />
    </Suspense>
  );
}
