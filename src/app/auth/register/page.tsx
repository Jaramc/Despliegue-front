import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import RegisterForm from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Registrate en RentalAI como huesped o anfitrion.',
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Unete a RentalAI en menos de un minuto"
      footer={
        <>
          Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="font-semibold text-brand-purple hover:underline">
            Inicia sesion
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
