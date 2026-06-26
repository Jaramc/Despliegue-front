import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar sesion',
  description: 'Accede a tu cuenta de RentalAI.',
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesion"
      subtitle="Bienvenido de nuevo, accede a tu cuenta"
      footer={
        <>
          No tienes cuenta?{' '}
          <Link href="/auth/register" className="font-semibold text-brand-purple hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
