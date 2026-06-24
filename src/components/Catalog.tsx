'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { PropertyFilters, Property } from '@/lib/types';
import { PAGE_SIZE, HERO_IMAGE } from '@/lib/constants';
import { useToast } from '@/hooks/useToast';
import PropertyCard from './PropertyCard';
import CatalogFilters from './CatalogFilters';
import EmptyState from './EmptyState';
import Button from './Button';
import { CardGridSkeleton } from './Skeleton';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full min-h-[400px] animate-pulse rounded-2xl bg-gray-200" />,
});

const EMPTY_FILTERS: PropertyFilters = { page: 1, pageSize: PAGE_SIZE };

export default function Catalog() {
  const [draft, setDraft] = useState<PropertyFilters>({ pageSize: PAGE_SIZE });
  const [applied, setApplied] = useState<PropertyFilters>(EMPTY_FILTERS);
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = useCallback(
    async (filters: PropertyFilters) => {
      setLoading(true);
      const result = await api.listProperties(filters);
      if (result.ok) {
        setProperties(result.data.items ?? []);
        setTotal(result.data.total ?? result.data.items?.length ?? 0);
      } else {
        setProperties([]);
        setTotal(0);
        if (result.error.status !== 0) toast(result.error.message, 'error');
      }
      setLoading(false);
    },
    [toast],
  );

  useEffect(() => {
    load(applied);
  }, [applied, load]);

  const updateDraft = (patch: Partial<PropertyFilters>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const submit = () => setApplied({ ...draft, page: 1, pageSize: PAGE_SIZE });

  const clear = () => {
    setDraft({ pageSize: PAGE_SIZE });
    setApplied(EMPTY_FILTERS);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = applied.page ?? 1;

  const goToPage = (page: number) =>
    setApplied((current) => ({ ...current, page }));

  const hasFilters = useMemo(
    () => Boolean(applied.city || applied.checkIn || applied.guests || applied.minPrice || applied.maxPrice),
    [applied],
  );

  return (
    <div>
      <section className="relative h-[520px] w-full overflow-hidden">
        <Image src={HERO_IMAGE} alt="Inmueble destacado" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/30 to-gray-900/70" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              Mas de 1.000 inmuebles verificados
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Encuentra tu lugar ideal
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/90">
              Explora estancias unicas, reserva en segundos y vive cada ciudad como en casa.
            </p>
          </div>
          <div className="mt-8 animate-fade-up">
            <CatalogFilters draft={draft} onChange={updateDraft} onSubmit={submit} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inmuebles disponibles</h2>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Buscando...' : `${total} ${total === 1 ? 'resultado' : 'resultados'}`}
            </p>
          </div>
          <div className="flex items-end gap-3">
            <PriceInput
              label="Min €"
              value={draft.minPrice}
              onChange={(value) => updateDraft({ minPrice: value })}
            />
            <PriceInput
              label="Max €"
              value={draft.maxPrice}
              onChange={(value) => updateDraft({ maxPrice: value })}
            />
            <Button variant="outline" size="md" onClick={submit}>
              Aplicar
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="md" onClick={clear}>
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {loading ? (
              <CardGridSkeleton count={6} />
            ) : properties.length === 0 ? (
              <EmptyState
                title="No encontramos inmuebles con esos filtros"
                description="Prueba a ampliar las fechas, cambiar de ciudad o limpiar los filtros para ver mas opciones."
                action={
                  <Button onClick={clear} variant="primary">
                    Limpiar filtros
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={
                        page === currentPage
                          ? 'h-10 w-10 rounded-xl bg-brand-purple text-sm font-semibold text-gray-900'
                          : 'h-10 w-10 rounded-xl text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100'
                      }
                    >
                      {page}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <PropertyMap properties={properties} />
            </div>
          </div>
        </div>

        {!loading && properties.length > 0 && (
          <div className="mt-8 lg:hidden">
            <PropertyMap properties={properties} height="400px" />
          </div>
        )}
      </section>
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <input
        type="number"
        min={0}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)}
        className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
      />
    </label>
  );
}
