'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

function priceIcon(label: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#DC97E9;color:#111827;font-weight:600;font-size:12px;padding:4px 10px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.2);white-space:nowrap">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function PropertyMap({
  properties,
  height = '100%',
}: {
  properties: Property[];
  height?: string;
}) {
  const center = useMemo<[number, number]>(() => {
    const valid = properties.filter((p) => p.latitude && p.longitude);
    if (valid.length === 0) return [40.4168, -3.7038];
    const lat = valid.reduce((sum, p) => sum + p.latitude, 0) / valid.length;
    const lng = valid.reduce((sum, p) => sum + p.longitude, 0) / valid.length;
    return [lat, lng];
  }, [properties]);

  return (
    <div className="overflow-hidden rounded-2xl shadow-sm" style={{ height }}>
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties
          .filter((property) => property.latitude && property.longitude)
          .map((property) => (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude]}
              icon={priceIcon(formatPrice(property.pricePerNight, property.currency))}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{property.title}</p>
                  <p className="text-sm text-gray-500">{property.city}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatPrice(property.pricePerNight, property.currency)} / noche
                  </p>
                  <Link
                    href={`/properties/${property.id}`}
                    className="inline-block text-sm font-semibold text-brand-purple"
                  >
                    Ver detalle
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
