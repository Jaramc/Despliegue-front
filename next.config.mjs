/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000' },
      { protocol: 'http', hostname: '161.97.136.42', port: '9000' },
      { protocol: 'https', hostname: '**.jaramc.dev' },
      { protocol: 'https', hostname: 'api.rentalai.jaramc.dev', port: '9000', pathname: '/property-photos/**' },
    ],
  },
};

export default nextConfig;
