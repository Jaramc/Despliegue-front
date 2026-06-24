'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/lib/types';

export function useRequireAuth(role?: UserRole) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const tokens = useAuthStore((state) => state.tokens);
  const user = useAuthStore((state) => state.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!tokens) {
      router.replace('/auth/login');
      return;
    }
    if (role && user?.role !== role) {
      router.replace('/');
      return;
    }
    setReady(true);
  }, [hydrated, tokens, user, role, router]);

  return { ready, user };
}
