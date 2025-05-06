/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // Default to true
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
