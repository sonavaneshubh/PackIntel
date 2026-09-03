import { Suspense } from 'react';
import { DeclarationsView } from '@/features/declarations/DeclarationsView';

export default function DeclarationsPage() {
  return (
    <Suspense fallback={null}>
      <DeclarationsView />
    </Suspense>
  );
}
