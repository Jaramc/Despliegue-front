'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import type { KycStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import Button from './Button';
import Skeleton from './Skeleton';
import { UploadIcon, CheckIcon } from './Icons';

export default function KycView() {
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const setKycStatus = useAuthStore((state) => state.setKycStatus);
  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<KycStatus>('NotSubmitted');
  const [reason, setReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    api.getKycStatus().then((result) => {
      if (result.ok) {
        setStatus(result.data.status);
        setReason(result.data.reason);
      } else if (user) {
        setStatus(user.kycStatus);
      }
      setLoading(false);
    });
  }, [user]);

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('Sube una imagen del documento', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setSubmitting(true);
    const base64 = preview.split(',')[1] ?? preview;
    const result = await api.submitKyc(base64, 'IdentityDocument');
    setSubmitting(false);
    if (result.ok) {
      setStatus(result.data.status);
      setReason(result.data.reason);
      setKycStatus(result.data.status);
      if (result.data.status === 'Approved') toast('Identidad verificada', 'success');
      else if (result.data.status === 'Rejected') toast('No pudimos verificar tu identidad', 'error');
      else toast('Documento enviado, en revision', 'info');
    } else {
      toast(result.error.message, 'error');
    }
  };

  const reset = () => {
    setStatus('NotSubmitted');
    setReason(undefined);
    setPreview(null);
    setFileName('');
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Verificacion de identidad</h1>
      <p className="mt-2 text-gray-500">
        Verifica tu identidad para poder reservar inmuebles de forma segura.
      </p>

      <div className="mt-8">
        {status === 'Approved' ? (
          <div className="flex flex-col items-center rounded-2xl border border-brand-mint bg-brand-mint/20 px-6 py-12 text-center animate-fade-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-mint text-gray-900 animate-heart-pop">
              <CheckIcon className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Tu identidad esta verificada</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ya puedes reservar cualquier inmueble del catalogo.
            </p>
            <span className="mt-4 rounded-full bg-brand-mint px-4 py-1.5 text-sm font-semibold text-gray-900">
              Verificado
            </span>
          </div>
        ) : status === 'Rejected' ? (
          <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center animate-fade-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">No pudimos verificarte</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-600">
              {reason ?? 'El documento no era legible o no coincidia con tus datos. Intentalo de nuevo.'}
            </p>
            <Button className="mt-6" onClick={reset}>
              Reintentar
            </Button>
          </div>
        ) : status === 'Pending' ? (
          <div className="flex flex-col items-center rounded-2xl border border-yellow-200 bg-yellow-50 px-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Documento en revision</h2>
            <p className="mt-2 text-sm text-gray-600">Te avisaremos cuando completemos la verificacion.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) readFile(file);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                dragging ? 'border-brand-purple bg-brand-purple/5' : 'border-brand-blue bg-brand-blue/5',
              )}
            >
              {preview ? (
                <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-xl">
                  <Image src={preview} alt="Documento" fill className="object-contain" />
                </div>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/20 text-brand-blue">
                    <UploadIcon className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-700">
                    Arrastra tu documento aqui o haz clic para seleccionar
                  </p>
                  <p className="mt-1 text-xs text-gray-400">JPG o PNG, maximo 5MB</p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) readFile(file);
                }}
              />
            </div>

            {fileName && <p className="mt-3 text-sm text-gray-500">Seleccionado: {fileName}</p>}

            <div className="mt-6">
              <Button fullWidth size="lg" disabled={!preview} loading={submitting} onClick={handleSubmit}>
                Verificar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
