import type { Property, PropertyPhoto, PropertySummary } from './types';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

// Devuelve las URLs de las fotos ordenadas por displayOrder. Tolera photos undefined.
export function photoUrls(photos?: PropertyPhoto[]): string[] {
  return [...(photos ?? [])]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((photo) => photo.url)
    .filter(Boolean);
}

// URL de la foto principal de un inmueble (la de menor displayOrder).
export function mainPhotoUrl(photos?: PropertyPhoto[]): string | undefined {
  return photoUrls(photos)[0];
}

export function dataUrlToFile(dataUrl: string, name: string): File {
  const [header, base64] = dataUrl.split(',');
  const type = header.match(/data:(.*);base64/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], name, { type });
}

// Convierte el detalle de inmueble en el resumen que consumen las tarjetas/mapa.
export function toSummary(property: Property): PropertySummary {
  return {
    id: property.id,
    title: property.title,
    city: property.city,
    country: property.country,
    nightlyRate: property.nightlyRate,
    maxGuests: property.maxGuests,
    mainPhotoUrl: mainPhotoUrl(property.photos),
    latitude: property.latitude,
    longitude: property.longitude,
    rating: property.rating,
  };
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}
