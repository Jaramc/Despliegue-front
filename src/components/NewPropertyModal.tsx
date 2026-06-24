'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { CreatePropertyRequest, Property } from '@/lib/types';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { UploadIcon, CloseIcon } from './Icons';

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
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (patch: Partial<CreatePropertyRequest>) =>
    setForm((current) => ({ ...current, ...patch }));

  const addFiles = (files: FileList) => {
    Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () =>
          setForm((current) => ({ ...current, images: [...current.images, reader.result as string] }));
        reader.readAsDataURL(file);
      });
  };

  const removeImage = (index: number) =>
    setForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.images.length === 0) {
      toast('Anade al menos una foto', 'error');
      return;
    }
    setLoading(true);
    const result = await api.createProperty(form);
    setLoading(false);
    if (result.ok) {
      toast('Inmueble publicado', 'success');
      onCreated(result.data);
      setForm(EMPTY);
      onClose();
    } else {
      toast(result.error.message, 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo inmueble">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <Input
          id="title"
          label="Titulo"
          required
          value={form.title}
          onChange={(event) => update({ title: event.target.value })}
        />
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input id="city" label="Ciudad" required value={form.city} onChange={(e) => update({ city: e.target.value })} />
          <Input id="country" label="Pais" required value={form.country} onChange={(e) => update({ country: e.target.value })} />
        </div>
        <Input id="address" label="Direccion" required value={form.address} onChange={(e) => update({ address: e.target.value })} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input id="price" label="Precio/noche" type="number" min={0} required value={form.pricePerNight || ''} onChange={(e) => update({ pricePerNight: Number(e.target.value) })} />
          <Input id="guests" label="Huespedes" type="number" min={1} required value={form.maxGuests} onChange={(e) => update({ maxGuests: Number(e.target.value) })} />
          <Input id="bedrooms" label="Habitaciones" type="number" min={0} required value={form.bedrooms} onChange={(e) => update({ bedrooms: Number(e.target.value) })} />
          <Input id="bathrooms" label="Banos" type="number" min={0} required value={form.bathrooms} onChange={(e) => update({ bathrooms: Number(e.target.value) })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input id="lat" label="Latitud" type="number" step="any" value={form.latitude || ''} onChange={(e) => update({ latitude: Number(e.target.value) })} />
          <Input id="lng" label="Longitud" type="number" step="any" value={form.longitude || ''} onChange={(e) => update({ longitude: Number(e.target.value) })} />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Fotos</span>
          <div
            onClick={() => inputRef.current?.click()}
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
            <p className="mt-2 text-sm text-gray-600">Arrastra fotos o haz clic para subir</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => event.target.files && addFiles(event.target.files)}
            />
          </div>

          {form.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.images.map((src, index) => (
                <div key={index} className="relative h-16 w-20 overflow-hidden rounded-lg">
                  <Image src={src} alt={`Foto ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-gray-600 shadow"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            Publicar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
