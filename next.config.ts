import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the production Docker image on the VPS. Set from day one so
  // the move off Cloudflare is a config change, not a rebuild.
  output: "standalone",
};

export default nextConfig;
