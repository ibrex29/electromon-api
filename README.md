# Electromon API

NestJS backend with Prisma (PostgreSQL).

Includes **`infra/`** for local Docker services and production deployment.

## Setup

```bash
make setup
# or: make install && make env && make infra-up && pnpm db:migrate:deploy && pnpm db:seed
```

## Development

```bash
make infra-up     # Postgres, Redis, RabbitMQ, MinIO
make dev          # API on http://localhost:3001
make db-studio    # Prisma Studio
```

## Structure

```
electromon-api/
├── src/           NestJS application
├── db/            Prisma schema, migrations, seed
├── shared/        Enums and types
├── infra/         Docker Compose, Dockerfiles, observability
└── test/
```

Infrastructure details: [infra/README.md](./infra/README.md)

Full docs: [../docs/README.md](../docs/README.md) · [API reference](../docs/API.md)
