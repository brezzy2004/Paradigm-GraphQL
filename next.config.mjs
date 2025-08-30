/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['*'] } },

  async rewrites() {
    const base = (process.env.N8N_BASE_URL || 'http://localhost:5678').replace(/\/$/, '');
    return [
      {
        // Anything under /webhook/* will be forwarded to n8n
        source: '/webhook/:path*',
        destination: `${base}/webhook/:path*`,
      },
    ];
  },
};

export default nextConfig;
