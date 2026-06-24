import type { Metadata } from 'next';
import Protected from '@/components/Protected';
import KycView from '@/components/KycView';

export const metadata: Metadata = {
  title: 'Verificacion de identidad',
  description: 'Verifica tu identidad para reservar inmuebles.',
};

export default function KycPage() {
  return (
    <Protected>
      <KycView />
    </Protected>
  );
}
