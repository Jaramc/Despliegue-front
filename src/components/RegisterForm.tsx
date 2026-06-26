'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useToast } from '@/hooks/useToast';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import Input from './Input';
import Button from './Button';
import { UsersIcon, BuildingIcon } from './Icons';

const ROLES: { value: UserRole; title: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'Guest',
    title: 'Huesped',
    description: 'Quiero reservar inmuebles',
    icon: <UsersIcon className="h-6 w-6" />,
  },
  {
    value: 'Owner',
    title: 'Anfitrion',
    description: 'Quiero publicar inmuebles',
    icon: <BuildingIcon className="h-6 w-6" />,
  },
];

export default function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const register = useAuthStore((state) => state.register);
  const syncWishlist = useWishlistStore((state) => state.syncOnLogin);

  const [role, setRole] = useState<UserRole>('Guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Introduce un correo valido', 'error');
      return;
    }
    if (password.length < 6) {
      toast('La contrasena debe tener al menos 6 caracteres', 'error');
      return;
    }
    if (password !== confirm) {
      toast('Las contrasenas no coinciden', 'error');
      return;
    }

    setLoading(true);
    const result = await register({ email, password, role });
    if (result.ok) {
      await syncWishlist();
      toast('Cuenta creada con exito', 'success');
      router.push('/auth/login');
    } else {
      toast(result.error.message, 'error');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => setRole(option.value)}
            className={cn(
              'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200',
              role === option.value
                ? 'border-brand-purple bg-brand-purple/10'
                : 'border-gray-200 hover:border-gray-300',
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                role === option.value ? 'bg-brand-purple text-gray-900' : 'bg-gray-100 text-gray-500',
              )}
            >
              {option.icon}
            </span>
            <span className="text-sm font-semibold text-gray-900">{option.title}</span>
            <span className="text-xs text-gray-500">{option.description}</span>
          </button>
        ))}
      </div>

      <Input
        id="email"
        type="email"
        label="Correo electronico"
        placeholder="tu@email.com"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        id="password"
        type="password"
        label="Contrasena"
        placeholder="Minimo 6 caracteres"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Input
        id="confirm"
        type="password"
        label="Confirmar contrasena"
        placeholder="Repite la contrasena"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
      />
      <Button type="submit" fullWidth size="lg" loading={loading}>
        Crear cuenta
      </Button>
    </form>
  );
}
