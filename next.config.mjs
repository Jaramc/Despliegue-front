/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      // MinIO en desarrollo
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000' },
      // MinIO en el servidor
      { protocol: 'http', hostname: '161.97.136.42', port: '9000' },
      // Almacenamiento de imagenes en produccion
      { protocol: 'https', hostname: '**.jaramc.dev' },
    ],
  },
};

export default nextConfig;
