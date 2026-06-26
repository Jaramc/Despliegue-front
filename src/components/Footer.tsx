import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Explorar',
    links: [
      { href: '/', label: 'Catalogo' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/bookings', label: 'Mis reservas' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { href: '/auth/login', label: 'Iniciar sesion' },
      { href: '/auth/register', label: 'Registrarse' },
      { href: '/kyc', label: 'Verificacion' },
    ],
  },
  {
    title: 'Anfitriones',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/auth/register', label: 'Publica tu inmueble' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-purple text-lg font-bold text-gray-900">
                R
              </span>
              <span className="text-xl font-bold text-brand-purple">RentalAI</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              La plataforma inteligente para encontrar y reservar tu lugar ideal.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-gray-900">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-brand-purple"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-sm text-gray-400">© 2026 RentalAI. Todos los derechos reservados.</p>
          <p className="text-sm text-gray-400">Hecho con cuidado para tu proxima estancia.</p>
        </div>
      </div>
    </footer>
  );
}
