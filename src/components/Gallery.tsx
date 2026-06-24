'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FALLBACK_PROPERTY_IMAGE } from '@/lib/constants';

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const photos = images.length > 0 ? images : [FALLBACK_PROPERTY_IMAGE];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
        {photos.map((photo, index) => (
          <Image
            key={photo + index}
            src={photo}
            alt={`${title} ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={cn(
              'object-cover transition-opacity duration-500',
              index === active ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <button
              key={photo + index}
              onClick={() => setActive(index)}
              className={cn(
                'relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200',
                index === active
                  ? 'ring-2 ring-brand-purple ring-offset-2'
                  : 'opacity-70 hover:opacity-100',
              )}
            >
              <Image src={photo} alt={`Miniatura ${index + 1}`} fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
