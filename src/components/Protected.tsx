'use client';

import type { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { UserRole } from '@/lib/types';

export default function Protected({
  role,
  children,
}: {
  role?: UserRole;
  children: ReactNode;
}) {
  const { ready } = useRequireAuth(role);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-brand-purple" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  return <>{children}</>;
}
