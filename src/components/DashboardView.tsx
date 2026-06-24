'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { DashboardSummary, Property } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatPrice, cn } from '@/lib/utils';
import { FALLBACK_PROPERTY_IMAGE } from '@/lib/constants';
import BookingStatusBadge from './BookingStatusBadge';
import EmptyState from './EmptyState';
import Button from './Button';
import Skeleton from './Skeleton';
import NewPropertyModal from './NewPropertyModal';
import { BuildingIcon, CalendarIcon, WalletIcon, ChartIcon, DownloadIcon } from './Icons';

export default function DashboardView() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const toast = useToast();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.getDashboard().then((result) => {
      if (result.ok) setData(result.data);
      setLoading(false);
    });
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(api.exportUrl(), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reservas.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      toast('Exportacion lista', 'success');
    } catch {
      toast('No se pudo exportar el Excel', 'error');
    } finally {
      setExporting(false);
    }
  };

  const addProperty = (property: Property) =>
    setData((current) =>
      current
        ? {
            ...current,
            properties: [property, ...current.properties],
            kpis: { ...current.kpis, totalProperties: current.kpis.totalProperties + 1 },
          }
        : current,
    );

  const kpis = data?.kpis;

  const cards = [
    {
      label: 'Inmuebles',
      value: kpis?.totalProperties ?? 0,
      icon: <BuildingIcon className="h-6 w-6" />,
      gradient: 'from-brand-purple/30 to-brand-violet/20',
    },
    {
      label: 'Reservas',
      value: kpis?.totalBookings ?? 0,
      icon: <CalendarIcon className="h-6 w-6" />,
      gradient: 'from-brand-blue/30 to-brand-mint/20',
    },
    {
      label: 'Ingresos',
      value: formatPrice(kpis?.totalRevenue ?? 0),
      icon: <WalletIcon className="h-6 w-6" />,
      gradient: 'from-brand-mint/30 to-brand-green/20',
    },
    {
      label: 'Ocupacion',
      value: `${Math.round((kpis?.occupancyRate ?? 0) * 100)}%`,
      icon: <ChartIcon className="h-6 w-6" />,
      gradient: 'from-brand-green/30 to-brand-blue/20',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.name ?? 'anfitrion'}
          </h1>
          <p className="mt-1 text-gray-500">Asi va tu actividad en RentalAI.</p>
        </div>
        <Button onClick={handleExport} loading={exporting}>
          <DownloadIcon className="h-5 w-5" />
          Exportar Excel
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn('rounded-2xl border border-white bg-gradient-to-br p-6 shadow-sm', card.gradient)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 text-gray-800">
              {card.icon}
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900">
              {loading ? <Skeleton className="h-8 w-20" /> : card.value}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900">Reservas recientes</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : !data || data.recentBookings.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Aun no hay reservas"
                description="Cuando los huespedes reserven tus inmuebles, las veras aqui."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-4 font-semibold">Inmueble</th>
                    <th className="px-6 py-4 font-semibold">Fechas</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((booking, index) => (
                    <tr key={booking.id} className={cn('border-b border-gray-50', index % 2 === 1 && 'bg-gray-50/60')}>
                      <td className="px-6 py-4 font-medium text-gray-900">{booking.property?.title}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(booking.totalPrice, booking.property?.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Mis inmuebles</h2>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Nuevo inmueble
          </Button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} variant="card" />
              ))}
            </div>
          ) : !data || data.properties.length === 0 ? (
            <EmptyState
              icon={<BuildingIcon className="h-10 w-10" />}
              title="Aun no has publicado inmuebles"
              description="Publica tu primer inmueble y empieza a recibir reservas."
              action={<Button onClick={() => setModalOpen(true)}>Publicar inmueble</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.properties.map((property) => (
                <div key={property.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={property.images?.[0] ?? FALLBACK_PROPERTY_IMAGE}
                      alt={property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{property.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(property.pricePerNight, property.currency)} / noche
                      </p>
                    </div>
                    <Link
                      href={`/properties/${property.id}`}
                      className="text-sm font-semibold text-brand-purple hover:underline"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewPropertyModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={addProperty} />
    </div>
  );
}
