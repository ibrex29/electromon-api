# syntax=docker/dockerfile:1

# Electromon Migrate — one-shot migration container (build context: api project root)

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apk add --no-cache libc6-compat netcat-openbsd

WORKDIR /app

COPY db/package.json db/prisma.config.ts db/tsconfig.json ./
COPY db/prisma ./prisma/
COPY db/src ./src/

RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

RUN npx prisma generate

COPY infra/scripts/entrypoint-migrate.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
