FROM oven/bun:1.4.2-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile --production --omit=peer
COPY src src
RUN bun build src/index.ts --target=bun --production --splitting --outdir=dist

FROM oven/bun:1.4.2-alpine
WORKDIR /app/dist
ENV NODE_ENV=production
COPY public ../public
COPY --from=build /app/dist .
USER bun
EXPOSE 3000
CMD ["bun", "index.js"]
