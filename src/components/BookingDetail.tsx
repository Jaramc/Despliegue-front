'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Booking, BookingStatus, Property } from '@/lib/types';
import { formatDate, formatPrice, mainPhotoUrl, nightsBetween, cn } from '@/lib/utils';
import { FALLBACK_PROPERTY_IMAGE } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import BookingStatusBadge from './BookingStatusBadge';
import EmptyState from './EmptyState';
import Button from './Button';
import Modal from './Modal';
import Skeleton from './Skeleton';
import { CalendarIcon, PinIcon, UsersIcon, CheckIcon } from './Icons';

const TIMELINE: BookingStatus[] = ['Pending', 'Confirmed', 'Completed'];

export default function BookingDetail({ id }: { id: string }) {
  const toast = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    api.getBooking(id).then(async (result) => {
      if (!active) return;
      if (result.ok) {
        setBooking(result.data);
        // El backend no anida el inmueble: lo cargamos aparte por su id.
        const propertyResult = await api.getProperty(result.data.propertyId);
        if (active && propertyResult.ok) setProperty(propertyResult.data);
      } else {
        setNotFound(true);
      }
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    const result = await api.cancelBooking(id);
    setCancelling(false);
    setCancelOpen(false);
    if (result.ok) {
      setBooking(result.data);
      toast('Reserva cancelada', 'info');
    } else {
      toast(result.error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="mb-6 h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Reserva no encontrada"
          description="No pudimos cargar esta reserva."
          action={
            <Link href="/bookings">
              <Button>Ver mis reservas</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const cancelled = booking.status === 'Cancelled';
  const activeIndex = cancelled ? -1 : TIMELINE.indexOf(booking.status);
  const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/bookings" className="hover:text-brand-purple">
          Mis reservas
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Detalle</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{property?.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-gray-500">
            <PinIcon className="h-4 w-4" />
            {property?.city}, {property?.country}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-sm">
            <Image
              src={mainPhotoUrl(property?.photos) ?? FALLBACK_PROPERTY_IMAGE}
              alt={property?.title ?? 'Inmueble'}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Estado de la reserva</h2>
            {cancelled ? (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                Esta reserva fue cancelada.
              </div>
            ) : (
              <ol className="mt-6 flex items-center">
                {TIMELINE.map((step, index) => {
                  const done = index <= activeIndex;
                  return (
                    <li key={step} className={cn('flex flex-1 items-center', index === TIMELINE.length - 1 && 'flex-none')}>
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                            done ? 'bg-brand-purple text-gray-900' : 'bg-gray-100 text-gray-400',
                          )}
                        >
                          {done ? <CheckIcon className="h-5 w-5" /> : index + 1}
                        </span>
                        <span className={cn('mt-2 text-xs font-medium', done ? 'text-gray-900' : 'text-gray-400')}>
                          {step === 'Pending' ? 'Pendiente' : step === 'Confirmed' ? 'Confirmada' : 'Completada'}
                        </span>
                      </div>
                      {index < TIMELINE.length - 1 && (
                        <div className={cn('mx-2 h-0.5 flex-1', index < activeIndex ? 'bg-brand-purple' : 'bg-gray-200')} />
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row icon={<CalendarIcon className="h-4 w-4" />} label="Entrada" value={formatDate(booking.checkIn)} />
              <Row icon={<CalendarIcon className="h-4 w-4" />} label="Salida" value={formatDate(booking.checkOut)} />
              <Row icon={<UsersIcon className="h-4 w-4" />} label="Capacidad" value={property ? `${property.maxGuests} huespedes` : '—'} />
              <Row icon={<CalendarIcon className="h-4 w-4" />} label="Noches" value={String(nights)} />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(booking.totalPrice)}
              </span>
            </div>
          </div>

          <Link href={`/properties/${booking.propertyId}`}>
            <Button variant="outline" fullWidth>
              Ver inmueble
            </Button>
          </Link>

          {canCancel && (
            <Button variant="ghost" fullWidth className="text-red-500 hover:bg-red-50" onClick={() => setCancelOpen(true)}>
              Cancelar reserva
            </Button>
          )}
        </div>
      </div>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar reserva">
        <p className="text-sm leading-relaxed text-gray-600">
          Esta accion no se puede deshacer. Tu reserva en {property?.title} quedara cancelada.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setCancelOpen(false)}>
            Volver
          </Button>
          <Button
            fullWidth
            loading={cancelling}
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={handleCancel}
          >
            Si, cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-2 text-gray-500">
        {icon}
        {label}
      </dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
