/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig
