import type { Metadata } from 'next';
import WishlistView from '@/components/WishlistView';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Tus inmuebles favoritos guardados en RentalAI.',
};

export default function WishlistPage() {
  return <WishlistView />;
}
