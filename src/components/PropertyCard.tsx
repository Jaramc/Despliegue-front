import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { FALLBACK_PROPERTY_IMAGE } from '@/lib/constants';
import WishlistButton from './WishlistButton';
import { PinIcon, UsersIcon, StarIcon } from './Icons';

export default function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.[0] ?? FALLBACK_PROPERTY_IMAGE;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        <Image
          src={image}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <WishlistButton propertyId={property.id} />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-800 backdrop-blur">
          <UsersIcon className="h-3.5 w-3.5" />
          {property.maxGuests} huespedes
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900">{property.title}</h3>
          {property.rating ? (
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <StarIcon className="h-4 w-4 text-brand-purple" />
              {property.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <PinIcon className="h-4 w-4" />
          {property.city}, {property.country}
        </p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(property.pricePerNight, property.currency)}
          </span>
          <span className="text-sm text-gray-500">/ noche</span>
        </div>
      </div>
    </Link>
  );
}
