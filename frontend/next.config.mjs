/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["ipfs.io", "gateway.pinata.cloud", "cloudflare-ipfs.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" }],
      },
    ];
  },
};

export default nextConfig;
