import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Required for the production Docker image on the VPS. The Cloudflare
  // adapter drives its own build output and ignores this.
  output: "standalone",
};

// Makes Cloudflare bindings available during `next dev`.
void initOpenNextCloudflareForDev();

export default nextConfig;
