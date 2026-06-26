'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Property } from '@/lib/types';
import { photoUrls } from '@/lib/utils';
import Gallery from './Gallery';
import BookingCard from './BookingCard';
import WishlistButton from './WishlistButton';
import EmptyState from './EmptyState';
import Button from './Button';
import Skeleton from './Skeleton';
import { PinIcon, UsersIcon, BedIcon, BathIcon, StarIcon } from './Icons';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />,
});

export default function PropertyDetail({ id }: { id: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getProperty(id).then((result) => {
      if (!active) return;
      if (result.ok) setProperty(result.data);
      else setNotFound(true);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          title="Inmueble no disponible"
          description="No pudimos encontrar este inmueble. Puede que haya sido retirado o que el enlace no sea valido."
          action={
            <Link href="/">
              <Button>Volver al catalogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const features = [
    { icon: <UsersIcon className="h-5 w-5" />, label: 'Huespedes', value: property.maxGuests },
    { icon: <BedIcon className="h-5 w-5" />, label: 'Habitaciones', value: property.bedrooms },
    { icon: <BathIcon className="h-5 w-5" />, label: 'Banos', value: property.bathrooms },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 lg:pb-12">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-purple">
            Catalogo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{property.city}</span>
        </nav>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-gray-500">
              <PinIcon className="h-4 w-4" />
              {property.address}, {property.city}, {property.country}
              {property.rating ? (
                <span className="ml-2 flex items-center gap-1 text-gray-700">
                  <StarIcon className="h-4 w-4 text-brand-purple" />
                  {property.rating.toFixed(1)}
                </span>
              ) : null}
            </p>
          </div>
          <WishlistButton propertyId={property.id} className="h-11 w-11" />
        </div>

        <Gallery images={photoUrls(property.photos)} title={property.title} />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <div className="grid grid-cols-3 gap-4">
              {features.map((feature) => (
                <div key={feature.label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/20 text-brand-blue">
                    {feature.icon}
                  </div>
                  <p className="mt-2 text-lg font-bold text-gray-900">{feature.value}</p>
                  <p className="text-xs text-gray-500">{feature.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Sobre este lugar</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">
                {property.description}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">Ubicacion</h2>
              <PropertyMap properties={[property]} height="320px" />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingCard property={property} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <BookingCard property={property} variant="bar" />
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-6 h-8 w-2/3" />
      <div className="aspect-[16/10] animate-pulse rounded-2xl bg-gray-200" />
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
