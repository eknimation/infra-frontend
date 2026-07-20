# Production image for the VPS. The demo deploys to Cloudflare Workers instead
# and does not use this file — it exists so the move back to compose is a
# config change rather than new work.
#
# Unlike the Go API, this image is NOT cross-compiled: Next pulls in
# arch-specific native binaries (@next/swc), so each arch is built natively.
# GitHub Actions provides free arm64 runners for public repos.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# `output: "standalone"` emits a self-contained server plus a trimmed
# node_modules; static assets must be copied alongside it.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
