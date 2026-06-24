import type { Metadata } from 'next';
import { api } from '@/lib/api';
import PropertyDetail from '@/components/PropertyDetail';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const result = await api.getProperty(params.id);
  if (!result.ok) {
    return { title: 'Inmueble' };
  }
  return {
    title: result.data.title,
    description: result.data.description?.slice(0, 160),
    openGraph: {
      title: result.data.title,
      images: result.data.images?.[0] ? [result.data.images[0]] : undefined,
    },
  };
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  return <PropertyDetail id={params.id} />;
}
