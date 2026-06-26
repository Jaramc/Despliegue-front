'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { DashboardSummary, PropertySummary } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { formatPrice, cn } from '@/lib/utils';
import Button from './Button';
import Skeleton, { CardGridSkeleton } from './Skeleton';
import PropertyCard from './PropertyCard';
import EmptyState from './EmptyState';
import NewPropertyModal from './NewPropertyModal';
import { BuildingIcon, WalletIcon, ChartIcon, DownloadIcon } from './Icons';

const OWNED_PAGE_SIZE = 100;

function parseFilename(header: string | null): string {
  if (!header) return 'reservas.xlsx';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match ? decodeURIComponent(match[1]) : 'reservas.xlsx';
}

function averageRevenue(value: DashboardSummary['revenuePerProperty']): number {
  if (Array.isArray(value)) {
    if (value.length === 0) return 0;
    return value.reduce((sum, item) => sum + item, 0) / value.length;
  }
  return value ?? 0;
}

export default function DashboardView() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.tokens?.accessToken);
  const toast = useToast();

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadSummary = useCallback(async () => {
    const result = await api.getDashboard();
    if (result.ok) setData(result.data);
    setLoading(false);
  }, []);

  const loadProperties = useCallback(async () => {
    if (!user?.id) {
      setProperties([]);
      setPropertiesLoading(false);
      return;
    }
    setPropertiesLoading(true);
    const result = await api.listProperties({ ownerId: user.id, pageSize: OWNED_PAGE_SIZE });
    const items = result.ok ? result.data.items ?? [] : [];
    setProperties(items.filter((property) => property.ownerId == null || property.ownerId === user.id));
    setPropertiesLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleCreated = useCallback(() => {
    loadSummary();
    loadProperties();
  }, [loadSummary, loadProperties]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(api.exportBookingsUrl(), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = parseFilename(response.headers.get('Content-Disposition'));
      link.click();
      URL.revokeObjectURL(url);
      toast('Exportacion lista', 'success');
    } catch {
      toast('No se pudo exportar el Excel', 'error');
    } finally {
      setExporting(false);
    }
  };

  const cards = [
    {
      label: 'Inmuebles',
      value: data?.totalProperties ?? 0,
      icon: <BuildingIcon className="h-6 w-6" />,
      gradient: 'from-brand-purple/30 to-brand-violet/20',
    },
    {
      label: 'Ocupacion',
      value: `${Math.round((data?.occupancyRate ?? 0) * 100)}%`,
      icon: <ChartIcon className="h-6 w-6" />,
      gradient: 'from-brand-green/30 to-brand-blue/20',
    },
    {
      label: 'Ingresos',
      value: formatPrice(data?.totalRevenue ?? 0),
      icon: <WalletIcon className="h-6 w-6" />,
      gradient: 'from-brand-mint/30 to-brand-green/20',
    },
    {
      label: 'Ingreso por inmueble',
      value: formatPrice(averageRevenue(data?.revenuePerProperty ?? 0)),
      icon: <WalletIcon className="h-6 w-6" />,
      gradient: 'from-brand-blue/30 to-brand-mint/20',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.email?.split('@')[0] ?? 'anfitrion'}
          </h1>
          <p className="mt-1 text-gray-500">Asi va tu actividad en RentalAI.</p>
        </div>
        <Button onClick={handleExport} loading={exporting}>
          {!exporting && <DownloadIcon className="h-5 w-5" />}
          {exporting ? 'Exportando...' : 'Exportar Excel'}
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Mis inmuebles</h2>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            Nuevo inmueble
          </Button>
        </div>

        <div className="mt-4">
          {propertiesLoading ? (
            <CardGridSkeleton count={3} />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={<BuildingIcon className="h-10 w-10" />}
              title="Aun no has publicado inmuebles"
              description="Publica tu primer inmueble y empieza a recibir reservas."
              action={<Button onClick={() => setModalOpen(true)}>Publicar inmueble</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>

      <NewPropertyModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
}
