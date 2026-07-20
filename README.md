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

## Notes

- `output: "standalone"` is set from day one so the production Docker image
  works without a rebuild of the config.
- The Docker image is **not** cross-compiled. Next pulls in arch-specific native
  binaries (`@next/swc`), so each arch is built on a native runner. GitHub
  Actions provides free arm64 runners for public repos.
- `npm audit` reports a moderate `postcss` advisory that is transitive inside
  Next itself. npm's only "fix" is downgrading to Next 9; it is a build-time
  CSS-stringify issue and does not affect this app.
