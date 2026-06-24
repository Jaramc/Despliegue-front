# RentalAI — Frontend

Interfaz web de la plataforma RentalAI: catálogo de inmuebles, reservas,
validación de identidad por IA y dashboard de propietarios.

Construida con **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
y **Zustand**.

---

## Repositorios del proyecto

| Repo | Descripción |
|------|-------------|
| [rental-ai-backend](https://github.com/TU_USUARIO/rental-ai-backend) | Monolito modular .NET 10, worker Laravel, infraestructura |
| **rental-ai-frontend** *(este repo)* | Aplicación Next.js 14 |

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |
| Git | 2.x | `git --version` |

> El backend debe estar corriendo (`docker compose up -d` en `rental-ai-backend`)
> para que la API esté disponible en `http://localhost:5000`.

---

## Instalación

```bash
git clone https://github.com/TU_USUARIO/rental-ai-frontend.git
cd rental-ai-frontend
cp .env.example .env.local
npm install
npm run dev
```

La app abre en **http://localhost:3000**.

---

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=           # opcional, solo si usas Google Maps
```

> Solo las variables con prefijo `NEXT_PUBLIC_` son accesibles en el navegador.
> Nunca pongas secretos aquí.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS |
| Estado global | Zustand |
| Mapas | Leaflet + OpenStreetMap |
| HTTP | Fetch API (cliente tipado) |

---

## Estructura

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx            # Catálogo público
│   ├── properties/[id]/    # Detalle de inmueble
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── kyc/
│   ├── bookings/
│   │   └── [id]/
│   ├── wishlist/
│   └── dashboard/
├── components/             # Componentes reutilizables
├── hooks/                  # Custom hooks
├── lib/                    # API client, utilidades
└── stores/                 # Zustand stores
```

---

## Decisiones técnicas

**Autenticación diferida:** el catálogo y el detalle de inmuebles son públicos
(Server Components, sin JWT). El login se solicita únicamente al reservar, al
persistir favoritos o al acceder a páginas protegidas.

**Wishlist mixta:** sin login, los favoritos se guardan en localStorage y se
muestran desde el estado local. Al hacer login, se sincronizan con el backend
y se limpia la copia local.

**Monolito modular como backend:** un solo endpoint base
(`NEXT_PUBLIC_API_URL`) sirve todas las rutas de la API. No hay múltiples
servicios que apuntar.

---

## Contribuir

1. Crear una rama desde `develop`: `git checkout -b feature/nombre`
2. Commits en inglés, en imperativo (`Add catalog filters`)
3. Pull Request hacia `develop`

---

## Licencia

[MIT](LICENSE)