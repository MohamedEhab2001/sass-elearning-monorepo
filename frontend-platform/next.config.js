/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  // Support for next-intl
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
  },
};

module.exports = nextConfig;
