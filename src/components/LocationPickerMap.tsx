'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FALLBACK_CENTER: [number, number] = [19.4326, -99.1332];

const pinIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#DC97E9;border:3px solid #fff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function Recenter({ position, zoom }: { position: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, zoom);
  }, [map, position, zoom]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
  height = '260px',
}: {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  height?: string;
}) {
  const hasPoint = Boolean(latitude && longitude);
  const position: [number, number] = hasPoint ? [latitude, longitude] : FALLBACK_CENTER;
  const zoom = hasPoint ? 14 : 4;

  return (
    <div className="overflow-hidden rounded-2xl shadow-sm" style={{ height }}>
      <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter position={position} zoom={zoom} />
        {hasPoint && (
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const { lat, lng } = event.target.getLatLng();
                onChange(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
