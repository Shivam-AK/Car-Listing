/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // Default to true
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nqcdnvymwfopixgfqhxz.supabase.co",
      },
    ],
  },
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
