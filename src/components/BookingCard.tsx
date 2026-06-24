'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Property } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { formatPrice, nightsBetween, todayIso } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Button from './Button';
import Modal from './Modal';
import { CalendarIcon, UsersIcon } from './Icons';

export default function BookingCard({
  property,
  variant = 'panel',
}: {
  property: Property;
  variant?: 'panel' | 'bar';
}) {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => Boolean(state.tokens));

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * property.pricePerNight;
  const fees = Math.round(subtotal * 0.1);
  const total = subtotal + fees;

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast('Inicia sesion para reservar', 'info');
      router.push('/auth/login');
      return;
    }
    if (user && user.kycStatus !== 'Approved') {
      setKycOpen(true);
      return;
    }
    if (nights <= 0) {
      toast('Selecciona fechas validas', 'error');
      return;
    }

    setLoading(true);
    const result = await api.createBooking({
      propertyId: property.id,
      checkIn,
      checkOut,
      guests,
    });
    setLoading(false);

    if (result.ok) {
      toast('Reserva creada con exito', 'success');
      router.push(`/bookings/${result.data.id}`);
      return;
    }
    if (result.error.status === 409) {
      toast('Fechas no disponibles para este inmueble', 'error');
      return;
    }
    toast(result.error.message, 'error');
  };

  if (variant === 'bar') {
    return (
      <>
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(property.pricePerNight, property.currency)}
            </p>
            <p className="text-xs text-gray-500">por noche</p>
          </div>
          <Button onClick={handleReserve} loading={loading} size="lg">
            Reservar
          </Button>
        </div>
        <KycPrompt open={kycOpen} onClose={() => setKycOpen(false)} onGo={() => router.push('/kyc')} />
      </>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {formatPrice(property.pricePerNight, property.currency)}
        </span>
        <span className="text-gray-500">/ noche</span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <DateField label="Entrada" icon={<CalendarIcon className="h-4 w-4" />}>
            <input
              type="date"
              min={todayIso()}
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
            />
          </DateField>
          <DateField label="Salida" icon={<CalendarIcon className="h-4 w-4" />}>
            <input
              type="date"
              min={checkIn || todayIso()}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
            />
          </DateField>
        </div>
        <DateField label="Huespedes" icon={<UsersIcon className="h-4 w-4" />}>
          <input
            type="number"
            min={1}
            max={property.maxGuests}
            value={guests}
            onChange={(event) => setGuests(Math.max(1, Number(event.target.value)))}
            className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
          />
        </DateField>
      </div>

      {nights > 0 && (
        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>
              {formatPrice(property.pricePerNight, property.currency)} × {nights}{' '}
              {nights === 1 ? 'noche' : 'noches'}
            </span>
            <span>{formatPrice(subtotal, property.currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tarifa de servicio</span>
            <span>{formatPrice(fees, property.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(total, property.currency)}</span>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button onClick={handleReserve} loading={loading} fullWidth size="lg">
          Reservar
        </Button>
      </div>

      {isAuthenticated && user && user.kycStatus !== 'Approved' && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Necesitas verificar tu identidad (KYC) para completar la reserva.
        </p>
      )}

      <KycPrompt open={kycOpen} onClose={() => setKycOpen(false)} onGo={() => router.push('/kyc')} />
    </div>
  );
}

function DateField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex flex-col gap-1 rounded-xl border border-gray-200 px-3 py-2',
        'transition-colors focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/40',
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function KycPrompt({
  open,
  onClose,
  onGo,
}: {
  open: boolean;
  onClose: () => void;
  onGo: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Verificacion requerida">
      <p className="text-sm leading-relaxed text-gray-600">
        Para reservar necesitamos verificar tu identidad. Es un paso rapido: sube un documento y
        confirmaremos tu cuenta.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose}>
          Ahora no
        </Button>
        <Button fullWidth onClick={onGo}>
          Verificar identidad
        </Button>
      </div>
    </Modal>
  );
}
