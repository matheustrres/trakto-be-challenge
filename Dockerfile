# ---------- Builder ----------
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.3.0 --activate
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build && echo "── Dist content ──" \
  && ls -R dist | head -n 20

RUN pnpm prune --prod --ignore-scripts && pnpm store prune

# ---------- Production ----------
FROM gcr.io/distroless/nodejs22-debian12 AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

EXPOSE 3000

CMD [ "./dist/main.js" ]

# ---------- Development ----------
FROM node:22-slim AS dev

RUN corepack enable && corepack prepare pnpm@9.3.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=development

EXPOSE 3000 9229

CMD [ "pnpm", "run", "start:dev" ]

######## Worker ########
FROM node:22-slim AS worker

RUN corepack enable && corepack prepare pnpm@9.3.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY --from=builder /app/dist ./dist   

ENV NODE_ENV=production

CMD ["node", "dist/workers/main-worker.js"]

