import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/legal/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/legal/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/legal/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/cancellation-policy",
        destination: "/legal/cancellation-policy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
