import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults only. No incremental cache override: this app renders one dynamic
// route and has nothing to cache, so adding R2 here would be one more account
// to configure for no benefit.
export default defineCloudflareConfig();
