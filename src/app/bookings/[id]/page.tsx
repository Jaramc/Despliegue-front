import type { Metadata } from 'next';
import Protected from '@/components/Protected';
import BookingDetail from '@/components/BookingDetail';

export const metadata: Metadata = {
  title: 'Detalle de reserva',
};

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <Protected>
      <BookingDetail id={params.id} />
    </Protected>
  );
}
