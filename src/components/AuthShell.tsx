import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-brand-purple/10 via-white to-brand-blue/10 px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-purple text-xl font-bold text-gray-900">
            R
          </span>
          <span className="text-2xl font-bold text-brand-purple">RentalAI</span>
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>
      </div>
    </div>
  );
}
