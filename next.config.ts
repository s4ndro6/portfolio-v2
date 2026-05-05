import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [50, 75, 90],
  },
  experimental: {
    optimizePackageImports: [
      "@react-three/drei",
      "@react-three/postprocessing",
      "framer-motion",
      "gsap",
    ],
  },
};

export default nextConfig;
