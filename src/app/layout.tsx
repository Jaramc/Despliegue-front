import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'RentalAI — Encuentra tu lugar ideal',
    template: '%s | RentalAI',
  },
  description:
    'Plataforma inteligente de alquiler de inmuebles. Explora, reserva y gestiona estancias con una experiencia simple y pulida.',
  openGraph: {
    title: 'RentalAI — Encuentra tu lugar ideal',
    description: 'Explora y reserva inmuebles con una experiencia simple y pulida.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#DC97E9',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastContainer />
        <ChatWidget />
      </body>
    </html>
  );
}
