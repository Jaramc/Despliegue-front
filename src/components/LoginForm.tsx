'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useToast } from '@/hooks/useToast';
import Input from './Input';
import Button from './Button';

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const login = useAuthStore((state) => state.login);
  const syncWishlist = useWishlistStore((state) => state.syncOnLogin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const result = await login({ email, password });
    if (result.ok) {
      await syncWishlist();
      toast(`Bienvenido de nuevo, ${result.data.user.name}`, 'success');
      router.push(result.data.user.role === 'Owner' ? '/dashboard' : '/');
    } else {
      toast(
        result.error.status === 401 ? 'Credenciales invalidas' : result.error.message,
        'error',
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        placeholder="••••••••"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button type="submit" fullWidth size="lg" loading={loading}>
        Iniciar sesion
      </Button>
      <p className="text-center text-xs text-gray-400">
        Al continuar aceptas nuestros terminos y politica de privacidad.
      </p>
      <Link
        href="/"
        className="block text-center text-sm font-medium text-gray-500 hover:text-brand-purple"
      >
        Seguir explorando sin cuenta
      </Link>
    </form>
  );
}
