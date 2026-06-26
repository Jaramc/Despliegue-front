import type { Metadata } from 'next';
import Protected from '@/components/Protected';
import BookingsList from '@/components/BookingsList';

export const metadata: Metadata = {
  title: 'Mis reservas',
  description: 'Consulta y gestiona tus reservas en RentalAI.',
};

export default function BookingsPage() {
  return (
    <Protected>
      <BookingsList />
    </Protected>
  );
}
