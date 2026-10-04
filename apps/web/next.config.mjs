/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@scholarflow/shared',
    '@scholarflow/matching',
    '@scholarflow/rules',
    '@scholarflow/extraction',
    '@scholarflow/adapters',
    '@scholarflow/db',
  ],
};

export default nextConfig;
