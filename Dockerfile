# syntax=docker/dockerfile:1
FROM oven/bun:1.1.34 AS base
WORKDIR /app

# Copy only dependency manifests first for better layer caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY src ./src
COPY tsconfig.json ./

EXPOSE 3000

# Default command (assumes src/index.ts starts the server)
CMD ["bun", "run", "src/index.ts"]
