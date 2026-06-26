'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { cn } from '@/lib/utils';
import { MenuIcon, CloseIcon, HeartIcon } from './Icons';

const LINKS = [
  { href: '/', label: 'Catalogo' },
  { href: '/wishlist', label: 'Wishlist' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => Boolean(state.tokens));
  const logout = useAuthStore((state) => state.logout);
  const wishlistCount = useWishlistStore((state) => state.ids.length);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple text-lg font-bold text-gray-900">
            R
          </span>
          <span className="text-xl font-bold tracking-tight text-brand-purple">RentalAI</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'text-brand-purple'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {link.label}
              {link.href === '/wishlist' && wishlistCount > 0 && (
                <span className="ml-1 rounded-full bg-brand-purple px-1.5 py-0.5 text-xs font-semibold text-gray-900">
                  {wishlistCount}
                </span>
              )}
              {isActive(link.href) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-purple" />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated && user ? (
            <>
              {user.role === 'Owner' && (
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/bookings"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Reservas
              </Link>
              <div className="flex items-center gap-2 rounded-full bg-gray-100 py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-violet text-sm font-semibold text-gray-900">
                  {user.email?.charAt(0).toUpperCase() ?? '?'}
                </span>
                <span className="text-sm font-medium text-gray-800">{user.email?.split('@')[0] ?? 'Mi cuenta'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-red-500"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-brand-purple"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl bg-brand-purple px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-brand-violet"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
          aria-label="Abrir menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white p-6 shadow-2xl animate-slide-in-right">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-bold text-brand-purple">RentalAI</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar menu"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-brand-purple/15 text-brand-purple'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {link.label}
                  {link.href === '/wishlist' && wishlistCount > 0 && (
                    <HeartIcon filled className="h-4 w-4 text-brand-purple" />
                  )}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  {user.role === 'Owner' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/bookings"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Reservas
                  </Link>
                  <Link
                    href="/kyc"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Verificacion KYC
                  </Link>
                </>
              ) : null}
            </div>

            <div className="mt-auto border-t border-gray-100 pt-6">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-violet font-semibold text-gray-900">
                      {user.email?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.email?.split('@')[0] ?? 'Mi cuenta'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Cerrar sesion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700"
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-brand-purple px-4 py-3 text-center text-sm font-semibold text-gray-900"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
