'use client';

import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { HeartIcon } from './Icons';

export default function WishlistButton({
  propertyId,
  className,
}: {
  propertyId: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [bounce, setBounce] = useState(false);
  const toggle = useWishlistStore((state) => state.toggle);
  const active = useWishlistStore((state) => state.ids.includes(propertyId));
  const toast = useToast();

  useEffect(() => setMounted(true), []);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(propertyId);
    setBounce(true);
    toast(active ? 'Eliminado de tu wishlist' : 'Anadido a tu wishlist', active ? 'info' : 'success');
  };

  const filled = mounted && active;

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={() => setBounce(false)}
      aria-label={filled ? 'Quitar de wishlist' : 'Anadir a wishlist'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all duration-200 hover:scale-110',
        bounce && 'animate-heart-pop',
        className,
      )}
    >
      <HeartIcon filled={filled} className={cn('h-5 w-5', filled ? 'text-brand-purple' : 'text-gray-500')} />
    </button>
  );
}
