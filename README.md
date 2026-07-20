# infra-frontend

Next.js frontend for the aKe infrastructure smoke test.

The browser never calls the Go API directly. It calls a Next.js route handler,
which fetches the API **server-side**:

```
Browser  ->  /api/message (Next route handler)  ->  Go API  ->  Postgres
```

This keeps the API private and means it needs no CORS configuration.

Part of a two-phase plan (see `aKe/server/stack.md`):

- **Demo** — runs on Cloudflare Workers
- **Production** — runs in `docker compose` on a single VPS

## Configuration

| Variable | Required | Description |
|---|---|---|
| `API_BASE_URL` | yes | Base URL of the Go API, no trailing slash |

Per phase:

| Phase | Value |
|---|---|
| Local | `http://localhost:8080` |
| Demo | the Cloud Run service URL |
| Production | `http://api:8080` (compose service name) |

## Requirements

**Node 22 or newer** — Wrangler refuses to start on older versions. `.nvmrc`
pins 24; run `nvm use` before working in this repo.

## Run locally

Start the API first (in `../infra-api`):

```sh
cd ../infra-api && docker compose up -d
```

Then:

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 — the page shows the message from Postgres and the
round-trip time, with a button to re-run the request.

## Deploying the demo (Cloudflare Workers)

Next.js does not run on Workers directly; `@opennextjs/cloudflare` builds a
Worker bundle from the Next output.

```sh
nvm use                    # Node 22+
npx wrangler login
npm run cf:preview         # runs the real Worker locally on workerd
npm run cf:deploy          # deploys
```

Before deploying, set `API_BASE_URL` in `wrangler.jsonc` to the Cloud Run URL of
`infra-api`. It is a public HTTPS endpoint, not a secret, so it lives in config
rather than in a Worker secret.

`npm run cf:preview` runs the same runtime Cloudflare runs, so it catches
Workers-specific breakage that `npm run dev` does not.

If a build fails with `ENOTEMPTY ... rmdir '.next/server'`, remove the stale
output first: `rm -rf .next .open-next`.

## Notes

- `output: "standalone"` is set from day one so the production Docker image
  works without a rebuild of the config. Verified that it does **not** conflict
  with the Cloudflare adapter, which drives its own build output.
- `global_fetch_strictly_public` is required: without it, `fetch()` from the
  Worker to our own hostname would loop back inside the Worker instead of
  going out to the network.
- No R2 incremental cache override. This app has one dynamic route and nothing
  worth caching, so it would only add another account to configure.
- The Docker image is **not** cross-compiled. Next pulls in arch-specific native
  binaries (`@next/swc`), so each arch is built on a native runner. GitHub
  Actions provides free arm64 runners for public repos.
- `npm audit` reports a moderate `postcss` advisory that is transitive inside
  Next itself. npm's only "fix" is downgrading to Next 9; it is a build-time
  CSS-stringify issue and does not affect this app.
