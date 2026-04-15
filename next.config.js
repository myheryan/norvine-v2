import('next').NextConfig
module.exports = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'api.sandbox.midtrans.com',
      },
      {
        protocol: 'https',
        hostname: 'api.midtrans.com',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['@base-ui/react'],
  reactStrictMode: true,
  bundlePagesRouterDependencies: true, // Opsional, jika kamu masih pakai folder pages
    transpilePackages: [], // Jika ada package eksternal
    
    // Konfigurasi Turbopack yang benar:
    experimental: {
      // Jangan letakkan turbopack di sini lagi
    },
    
    // Jika versi Next.js kamu sudah mendukung turbopack.root secara langsung:
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  
}
