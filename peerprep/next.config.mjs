/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
 
  async rewrites(){
    return [
      {
        source: '/api/:path*',
        destination: 'http://fastapi:8080/:path*'
      }
    ]
  }
};

export default nextConfig;
