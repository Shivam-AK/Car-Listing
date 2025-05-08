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
        hostname: "gfdxhaqrhjxerzydifms.supabase.co",
      },
    ],
  },
};

export default nextConfig;
