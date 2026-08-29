/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allows local network IP access during development
  },
  allowedDevOrigins: ["172.20.10.4", "localhost:3000"],
};

export default nextConfig;
