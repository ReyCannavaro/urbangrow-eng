# Multi-stage Dockerfile for UrbanGrow ElysiaJS Backend
FROM oven/bun:1.3-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy application source
COPY tsconfig.json ./
COPY src ./src

# Production runner image
FROM oven/bun:1.3-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./

USER bun
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "run", "src/index.ts"]
