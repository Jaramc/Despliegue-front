'use client';

import type { PropertyFilters } from '@/lib/types';
import { todayIso } from '@/lib/utils';
import Button from './Button';
import { SearchIcon, PinIcon, CalendarIcon, UsersIcon } from './Icons';

interface Props {
  draft: PropertyFilters;
  onChange: (patch: Partial<PropertyFilters>) => void;
  onSubmit: () => void;
}

export default function CatalogFilters({ draft, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] lg:items-end"
    >
      <Field label="Ciudad" icon={<PinIcon className="h-4 w-4" />}>
        <input
          type="text"
          placeholder="Madrid, Barcelona..."
          value={draft.city ?? ''}
          onChange={(event) => onChange({ city: event.target.value })}
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </Field>

      <Field label="Entrada" icon={<CalendarIcon className="h-4 w-4" />}>
        <input
          type="date"
          min={todayIso()}
          value={draft.checkIn ?? ''}
          onChange={(event) => onChange({ checkIn: event.target.value })}
          className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
        />
      </Field>

      <Field label="Salida" icon={<CalendarIcon className="h-4 w-4" />}>
        <input
          type="date"
          min={draft.checkIn ?? todayIso()}
          value={draft.checkOut ?? ''}
          onChange={(event) => onChange({ checkOut: event.target.value })}
          className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
        />
      </Field>

      <Field label="Huespedes" icon={<UsersIcon className="h-4 w-4" />}>
        <input
          type="number"
          min={1}
          placeholder="2"
          value={draft.guests ?? ''}
          onChange={(event) =>
            onChange({ guests: event.target.value ? Number(event.target.value) : undefined })
          }
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </Field>

      <Button type="submit" size="lg" className="h-[58px] w-full lg:w-auto">
        <SearchIcon className="h-5 w-5" />
        Buscar
      </Button>
    </form>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-gray-200 px-4 py-2.5 transition-colors focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/40">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
