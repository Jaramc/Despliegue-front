'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Input from './Input';
import { SearchIcon, PinIcon } from './Icons';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-2xl bg-gray-200" />,
});

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  region?: string;
  country?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
}

export interface LocationValue {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const LATAM_COUNTRIES = 'ar,bo,br,cl,co,cr,cu,do,ec,gt,hn,mx,ni,pa,py,pe,pr,sv,uy,ve';

function resolveCity(address: NominatimAddress) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    ''
  );
}

function resolveRegion(address: NominatimAddress) {
  return address.state || address.region || address.county || '';
}

function primaryLabel(result: NominatimResult) {
  return resolveCity(result.address) || result.display_name.split(',')[0];
}

function secondaryLabel(result: NominatimResult) {
  return [resolveRegion(result.address), result.address.country].filter(Boolean).join(', ');
}

function highlight(text: string, term: string): ReactNode {
  const query = term.trim();
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-transparent font-semibold text-brand-purple">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounced = useDebouncedValue(query, 400);
  const selected = Boolean(value.latitude && value.longitude);

  useEffect(() => {
    const term = debounced.trim();
    setActive(-1);
    if (term.length < 3) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');
    const url =
      'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&accept-language=es' +
      `&countrycodes=${LATAM_COUNTRIES}&q=${encodeURIComponent(term)}`;

    fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((data: NominatimResult[]) => {
        setResults(data);
        setOpen(true);
        setError(data.length === 0 ? 'Sin resultados' : '');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setResults([]);
        setError(
          err instanceof Error && err.message === '429'
            ? 'Demasiadas busquedas, intenta de nuevo en unos segundos'
            : 'No se pudo buscar la ubicacion',
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    if (active >= 0) itemRefs.current[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (result: NominatimResult) => {
    onChange({
      city: resolveCity(result.address),
      country: result.address.country || '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const changeLocation = () => {
    onChange({ city: '', country: '', latitude: 0, longitude: 0 });
    setQuery('');
    setResults([]);
    setError('');
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      if (open && active >= 0 && results[active]) {
        event.preventDefault();
        select(results[active]);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleDrag = (latitude: number, longitude: number) =>
    onChange({ ...value, latitude, longitude });

  return (
    <div ref={containerRef} className="space-y-2">
      {!selected && (
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Ubicacion
          </label>
          <p className="mt-0.5 text-xs text-gray-500">
            Busca la ciudad o direccion; el pais y las coordenadas se completan solos
          </p>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon className="h-4 w-4" />
            </span>
            <Input
              id="location"
              role="combobox"
              aria-expanded={open}
              aria-controls="location-results"
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `location-option-${active}` : undefined}
              placeholder="Busca una direccion o ciudad"
              autoComplete="off"
              className="pl-9 pr-9"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => results.length > 0 && setOpen(true)}
              onKeyDown={handleKeyDown}
            />
            {loading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 animate-spin text-brand-blue" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </span>
            )}
            {open && (loading || error || results.length > 0) && (
              <ul
                id="location-results"
                role="listbox"
                className="absolute z-[1200] mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              >
                {loading && <li className="px-4 py-2 text-sm text-gray-500">Buscando...</li>}
                {!loading && error && <li className="px-4 py-2 text-sm text-gray-500">{error}</li>}
                {!loading &&
                  results.map((result, index) => (
                    <li
                      key={`${result.lat}-${result.lon}`}
                      id={`location-option-${index}`}
                      ref={(node) => {
                        itemRefs.current[index] = node;
                      }}
                      role="option"
                      aria-selected={index === active}
                    >
                      <button
                        type="button"
                        onClick={() => select(result)}
                        onMouseEnter={() => setActive(index)}
                        className={cn(
                          'block w-full px-4 py-2 text-left transition-colors',
                          index === active ? 'bg-brand-blue/10' : 'hover:bg-brand-blue/10',
                        )}
                      >
                        <span className="block truncate text-sm text-gray-800">
                          {highlight(primaryLabel(result), query)}
                        </span>
                        {secondaryLabel(result) && (
                          <span className="block truncate text-xs text-gray-500">
                            {secondaryLabel(result)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <LocationPickerMap latitude={value.latitude} longitude={value.longitude} onChange={handleDrag} />

      {selected ? (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3">
          <div className="flex items-start gap-2">
            <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {value.city || 'Sin ciudad'}
                {value.country ? `, ${value.country}` : ''}
              </p>
              <p className="text-xs text-gray-500">
                {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={changeLocation}
            className="shrink-0 text-xs font-medium text-brand-purple hover:underline"
          >
            Cambiar ubicacion
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Arrastra el marcador o elige una sugerencia para fijar las coordenadas
        </p>
      )}
    </div>
  );
}
