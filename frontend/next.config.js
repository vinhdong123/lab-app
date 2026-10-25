/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

module.exports = {
  output: "standalone",
  async rewrites() {
    // Trình duyệt gọi /api/... trên Next.js, Next.js chuyển tiếp sang backend Python
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};
