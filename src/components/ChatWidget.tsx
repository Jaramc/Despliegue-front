'use client';

import { useEffect, useRef, useState } from 'react';
import '@n8n/chat/style.css';
import { cn } from '@/lib/utils';
import { CloseIcon } from './Icons';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_CHAT_URL;

const INITIAL_MESSAGE =
  '¡Hola! Soy el asistente de RentalAI. Puedo ayudarte a buscar inmuebles, ver disponibilidad y consultar tus reservas. Escríbeme en español, English or français.';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const mountRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!open || initialized.current || !mountRef.current) return;
    initialized.current = true;
    const target = mountRef.current;
    import('@n8n/chat').then(({ createChat }) => {
      createChat({
        webhookUrl: WEBHOOK_URL as string,
        target,
        mode: 'fullscreen',
        showWelcomeScreen: false,
        loadPreviousSession: true,
        defaultLanguage: 'en',
        initialMessages: [INITIAL_MESSAGE],
        i18n: {
          en: {
            title: 'Asistente RentalAI',
            subtitle: '',
            footer: '',
            getStarted: 'Nueva conversación',
            inputPlaceholder: 'Escribe tu mensaje...',
            closeButtonTooltip: 'Cerrar',
          },
        },
      });
    });
  }, [open]);

  if (!WEBHOOK_URL) return null;

  const toggle = () => {
    setOpen((value) => !value);
    setUnread(false);
  };

  return (
    <>
      <button
        onClick={toggle}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        className={cn(
          'fixed bottom-4 right-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-brand-purple text-gray-900 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-brand-violet',
          open && 'rotate-90',
        )}
      >
        {open ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        )}
        {!open && unread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            1
          </span>
        )}
      </button>

      <div
        className={cn(
          'fixed bottom-20 right-4 z-[80] flex h-[600px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-chat-up',
          !open && 'hidden',
        )}
      >
        <div className="flex items-center justify-between bg-brand-purple px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-gray-900">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Asistente RentalAI</p>
              <p className="flex items-center gap-1.5 text-xs text-gray-800">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                En línea
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            aria-label="Cerrar asistente"
            className="rounded-lg p-1 text-gray-900 transition-colors hover:bg-white/30"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div ref={mountRef} className="rentalai-chat flex-1 overflow-hidden" />
      </div>
    </>
  );
}
