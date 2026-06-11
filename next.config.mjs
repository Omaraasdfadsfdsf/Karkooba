/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // 4 photos x ~1MB compressed JPEG, plus form fields
      bodySizeLimit: '8mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
