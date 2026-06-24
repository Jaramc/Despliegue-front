import type { BookingStatus } from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export const AUTH_STORAGE_KEY = 'rentalai-auth';
export const WISHLIST_STORAGE_KEY = 'rentalai-wishlist';

export const PAGE_SIZE = 12;

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-brand-mint text-gray-900',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-gray-100 text-gray-700',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
  Completed: 'Completada',
};

export const FALLBACK_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80';

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80';
