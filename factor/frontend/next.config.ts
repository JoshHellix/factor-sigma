import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zama-season3/shared"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

export default nextConfig;
