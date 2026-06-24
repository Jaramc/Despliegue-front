import type { BookingStatus } from '@/lib/types';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        BOOKING_STATUS_STYLES[status],
      )}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
