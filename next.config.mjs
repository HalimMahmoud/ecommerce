/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Strapi media uploads
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
      },
    ],
  },
}

export default nextConfig
