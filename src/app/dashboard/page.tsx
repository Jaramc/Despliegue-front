import type { Metadata } from 'next';
import Protected from '@/components/Protected';
import DashboardView from '@/components/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Gestiona tus inmuebles, reservas e ingresos como anfitrion.',
};

export default function DashboardPage() {
  return (
    <Protected role="Owner">
      <DashboardView />
    </Protected>
  );
}
