'use client';

import { useToastStore, type ToastVariant } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

const VARIANT_BORDER: Record<ToastVariant, string> = {
  success: 'border-l-brand-mint',
  error: 'border-l-red-500',
  info: 'border-l-brand-blue',
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-lg animate-toast-in',
            VARIANT_BORDER[toast.variant],
          )}
        >
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={VARIANT_ICON[toast.variant]} />
          </svg>
          <p className="flex-1 text-sm leading-relaxed text-gray-800">{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Cerrar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
