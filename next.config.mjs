import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [

      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Strapi media uploads (localhost)
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
      },
      {
        // Strapi media uploads (IP)
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337',
      },

    ],
  },
}

export default withNextIntl(nextConfig)
