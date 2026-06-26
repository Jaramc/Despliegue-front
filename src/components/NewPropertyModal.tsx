'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { CreatePropertyRequest, Property } from '@/lib/types';
import { useToast } from '@/hooks/useToast';
import { cn, dataUrlToFile } from '@/lib/utils';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import LocationPicker from './LocationPicker';
import { UploadIcon, CloseIcon, UsersIcon, BedIcon, BathIcon, WalletIcon, StarIcon } from './Icons';

const EMPTY: CreatePropertyRequest = {
  title: '',
  description: '',
  city: '',
  country: '',
  address: '',
  pricePerNight: 0,
  maxGuests: 1,
  bedrooms: 1,
  bathrooms: 1,
  latitude: 0,
  longitude: 0,
  images: [],
};

const MAX_IMAGE_MB = 5;
const MAX_IMAGE_SIZE = MAX_IMAGE_MB * 1024 * 1024;

async function uploadPhotos(id: string, images: string[]): Promise<number> {
  const results = await Promise.all(
    images.map((image, index) =>
      api.addPropertyPhoto(id, dataUrlToFile(image, `photo-${index + 1}.jpg`)),
    ),
  );
  return results.filter((result) => result.ok).length;
}

function Stepper({
  id,
  label,
  icon,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <span className="text-gray-500">{icon}</span>
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand-blue">
        <button
          type="button"
          aria-label={`Disminuir ${label}`}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - 1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-lg leading-none text-gray-500 transition-colors hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>&minus;</span>
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          value={text}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '');
            setText(digits);
            if (digits) onChange(clamp(Number(digits)));
          }}
          onBlur={() => {
            const next = clamp(Number(text) || min);
            onChange(next);
            setText(String(next));
          }}
          className="w-full min-w-0 border-0 bg-transparent p-0 text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          disabled={value >= max}
          onClick={() => onChange(clamp(value + 1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-lg leading-none text-gray-500 transition-colors hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden>+</span>
        </button>
      </div>
    </div>
  );
}

export default function NewPropertyModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (property: Property) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CreatePropertyRequest>(EMPTY);
  const [priceText, setPriceText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (patch: Partial<CreatePropertyRequest>) =>
    setForm((current) => ({ ...current, ...patch }));

  const markTouched = (field: string) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const errors = {
    title: form.title.trim() ? '' : 'El titulo es obligatorio',
    description: form.description.trim() ? '' : 'Anade una descripcion',
    address: form.address.trim() ? '' : 'La direccion es obligatoria',
    location: form.latitude && form.longitude ? '' : 'Selecciona una ubicacion valida',
    pricePerNight: form.pricePerNight > 0 ? '' : 'El precio debe ser mayor que 0',
  };
  const reason = Object.values(errors).find(Boolean);
  const isValid = !reason;

  const handlePrice = (raw: string) => {
    let value = raw.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = `${parts[0]}.${parts.slice(1).join('')}`;
    setPriceText(value);
    update({ pricePerNight: Number(value) || 0 });
  };

  const resetForm = () => {
    setForm(EMPTY);
    setPriceText('');
    setTouched({});
    setImageError('');
    setUploading(false);
  };

  const addFiles = (files: FileList) => {
    const rejected: string[] = [];
    const accepted = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        rejected.push(file.name);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        rejected.push(file.name);
        return false;
      }
      return true;
    });
    setImageError(
      rejected.length
        ? `Solo imagenes de hasta ${MAX_IMAGE_MB} MB: ${rejected.join(', ')}`
        : '',
    );
    accepted.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setForm((current) => ({ ...current, images: [...current.images, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) =>
    setForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));

  const makeCover = (index: number) =>
    setForm((current) => {
      const images = [...current.images];
      const [picked] = images.splice(index, 1);
      return { ...current, images: [picked, ...images] };
    });

  const openPicker = () => inputRef.current?.click();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) {
      setTouched({ title: true, description: true, address: true, location: true, pricePerNight: true });
      return;
    }
    setLoading(true);
    const result = await api.createProperty(form);
    if (!result.ok) {
      setLoading(false);
      toast(result.error.message, 'error');
      return;
    }

    let property = result.data;
    if (form.images.length > 0) {
      setUploading(true);
      const uploaded = await uploadPhotos(property.id, form.images);
      setUploading(false);
      if (uploaded > 0) {
        const refreshed = await api.getProperty(property.id);
        if (refreshed.ok) property = refreshed.data;
      }
      if (uploaded < form.images.length) {
        toast('No se pudieron subir algunas fotos', 'error');
      }
    }
    setLoading(false);

    toast('Inmueble publicado', 'success');
    onCreated(property);
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo inmueble">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <Input
            id="title"
            label="Titulo"
            required
            value={form.title}
            onChange={(event) => update({ title: event.target.value })}
            onBlur={() => markTouched('title')}
            aria-invalid={Boolean(touched.title && errors.title)}
          />
          {touched.title && errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
            Descripcion
          </label>
          <textarea
            id="description"
            rows={3}
            required
            value={form.description}
            onChange={(event) => update({ description: event.target.value })}
            onBlur={() => markTouched('description')}
            aria-invalid={Boolean(touched.description && errors.description)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {touched.description && errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <LocationPicker
            value={{
              city: form.city,
              country: form.country,
              latitude: form.latitude,
              longitude: form.longitude,
            }}
            onChange={(location) => {
              update(location);
              markTouched('location');
            }}
          />
          {touched.location && errors.location && (
            <p className="mt-1 text-xs text-red-500">{errors.location}</p>
          )}
        </div>

        <div>
          <Input
            id="address"
            label="Direccion"
            required
            value={form.address}
            onChange={(event) => update({ address: event.target.value })}
            onBlur={() => markTouched('address')}
            aria-invalid={Boolean(touched.address && errors.address)}
          />
          {touched.address && errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address}</p>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
          <div>
            <label htmlFor="price" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <WalletIcon className="h-4 w-4 text-gray-500" />
              Precio/noche
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                &euro;
              </span>
              <input
                id="price"
                inputMode="decimal"
                required
                placeholder="0"
                value={priceText}
                onChange={(event) => handlePrice(event.target.value)}
                onBlur={() => markTouched('pricePerNight')}
                aria-invalid={Boolean(touched.pricePerNight && errors.pricePerNight)}
                aria-describedby="price-hint"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-16 text-right text-sm font-medium text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <span
                id="price-hint"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400"
              >
                por noche
              </span>
            </div>
            {touched.pricePerNight && errors.pricePerNight && (
              <p className="mt-1 text-xs text-red-500">{errors.pricePerNight}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stepper
              id="guests"
              label="Huespedes"
              icon={<UsersIcon className="h-4 w-4" />}
              value={form.maxGuests}
              min={1}
              max={30}
              onChange={(value) => update({ maxGuests: value })}
            />
            <Stepper
              id="bedrooms"
              label="Habitaciones"
              icon={<BedIcon className="h-4 w-4" />}
              value={form.bedrooms}
              min={1}
              max={20}
              onChange={(value) => update({ bedrooms: value })}
            />
            <Stepper
              id="bathrooms"
              label="Banos"
              icon={<BathIcon className="h-4 w-4" />}
              value={form.bathrooms}
              min={1}
              max={20}
              onChange={(value) => update({ bathrooms: value })}
            />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Fotos</span>
          <div
            role="button"
            tabIndex={0}
            aria-label="Subir fotos"
            onClick={openPicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPicker();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
              dragging ? 'border-brand-purple bg-brand-purple/5' : 'border-brand-blue bg-brand-blue/5',
            )}
          >
            <UploadIcon className="h-6 w-6 text-brand-blue" />
            <p className="mt-2 text-sm text-gray-600">Arrastra fotos aqui o haz clic para subir</p>
            <p className="mt-0.5 text-xs text-gray-400">Imagenes de hasta {MAX_IMAGE_MB} MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => event.target.files && addFiles(event.target.files)}
            />
          </div>

          {imageError && <p className="mt-1 text-xs text-red-500">{imageError}</p>}

          {form.images.length > 0 && (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {form.images.map((src, index) => (
                  <div
                    key={index}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200"
                  >
                    <Image src={src} alt={`Foto ${index + 1}`} fill className="object-cover" />
                    {index === 0 ? (
                      <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-full bg-brand-purple px-2 py-0.5 text-[10px] font-semibold text-gray-900">
                        <StarIcon className="h-3 w-3" />
                        Foto principal
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => makeCover(index)}
                        title="Hacer principal"
                        className="absolute left-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-600 opacity-0 shadow transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        Hacer principal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Quitar foto ${index + 1}`}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-gray-600 shadow"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {uploading && <p className="mt-2 text-xs text-gray-500">Subiendo fotos...</p>}
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth loading={loading} disabled={!isValid} title={reason}>
            Publicar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
