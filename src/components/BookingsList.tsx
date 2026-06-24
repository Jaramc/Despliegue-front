'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { FALLBACK_PROPERTY_IMAGE } from '@/lib/constants';
import BookingStatusBadge from './BookingStatusBadge';
import EmptyState from './EmptyState';
import Button from './Button';
import Skeleton from './Skeleton';
import { CalendarIcon, PinIcon } from './Icons';

export default function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listBookings().then((result) => {
      if (result.ok) setBookings(result.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Mis reservas</h1>
      <p className="mt-2 text-gray-500">Gestiona tus estancias pasadas y futuras.</p>

      <div className="mt-8 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="row" />)
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No tienes reservas aun"
            description="Cuando reserves un inmueble aparecera aqui con todos los detalles."
            action={
              <Link href="/">
                <Button>Explorar inmuebles</Button>
              </Link>
            }
          />
        ) : (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-xl sm:h-24 sm:w-36">
                <Image
                  src={booking.property?.images?.[0] ?? FALLBACK_PROPERTY_IMAGE}
                  alt={booking.property?.title ?? 'Inmueble'}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{booking.property?.title}</h3>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <PinIcon className="h-4 w-4" />
                  {booking.property?.city}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(booking.totalPrice, booking.property?.currency)}
                </p>
                <p className="text-xs text-gray-500">{booking.nights} noches</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
