import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_HOST!],
  },
  /* config options here */
};

export default nextConfig;
