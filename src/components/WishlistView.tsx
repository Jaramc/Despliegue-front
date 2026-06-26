'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { PropertySummary } from '@/lib/types';
import { toSummary } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import PropertyCard from './PropertyCard';
import EmptyState from './EmptyState';
import Button from './Button';
import { CardGridSkeleton } from './Skeleton';
import { HeartIcon } from './Icons';

export default function WishlistView() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.tokens));
  const hydrated = useWishlistStore((state) => state.hydrated);
  const ids = useWishlistStore((state) => state.ids);

  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      if (isAuthenticated) {
        const result = await api.getWishlist();
        if (active && result.ok) setProperties(result.data.map(toSummary));
      } else if (ids.length > 0) {
        const results = await Promise.all(ids.map((id) => api.getProperty(id)));
        if (active) {
          setProperties(
            results
              .map((r) => (r.ok ? toSummary(r.data) : null))
              .filter(Boolean) as PropertySummary[],
          );
        }
      } else {
        setProperties([]);
      }
      if (active) setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [hydrated, isAuthenticated, ids]);

  const visible = properties.filter((property) => ids.includes(property.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center gap-3">
        <HeartIcon filled className="h-7 w-7 text-brand-purple" />
        <h1 className="text-3xl font-bold text-gray-900">Tu wishlist</h1>
      </div>
      <p className="mt-2 text-gray-500">Los inmuebles que has guardado para mas tarde.</p>

      <div className="mt-8">
        {loading || !hydrated ? (
          <CardGridSkeleton count={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<HeartIcon className="h-10 w-10" />}
            title="Tu wishlist esta vacia"
            description="Guarda tus inmuebles favoritos con el corazon y los encontraras aqui, listos para reservar."
            action={
              <Link href="/">
                <Button>Explorar inmuebles</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
