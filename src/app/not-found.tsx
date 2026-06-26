import Link from 'next/link';
import Button from '@/components/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <span className="text-[120px] font-bold leading-none text-brand-purple/30">404</span>
        <svg
          className="absolute inset-0 m-auto h-20 w-20 text-brand-purple"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Esta pagina no existe</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Puede que el enlace este roto o que la pagina se haya movido. Volvamos a un lugar conocido.
      </p>
      <Link href="/" className="mt-6">
        <Button size="lg">Volver al catalogo</Button>
      </Link>
    </div>
  );
}
