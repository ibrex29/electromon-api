# Electromon API — Infrastructure

Docker Compose stack for the **API project**: PostgreSQL, Redis, RabbitMQ, MinIO, optional API container, and observability.

Run all commands from the **project root** (not from inside `infra/`).

---

## Quick start

### Without Docker for the API app (recommended)

```bash
cp infra/env/local.env.example .env
make infra-up          # start postgres, redis, rabbitmq, minio
make dev               # API on host :3001
```

### Full stack in Docker

```bash
cp infra/env/local.env.example .env
make infra-full        # deps + migrate + API container
```

---

## Compose profiles

| Makefile target | What runs |
|-----------------|-----------|
| `make infra-up` | `base.yml` + `local.yml` — **deps only** |
| `make infra-full` | deps + **migrate** + **api** container |
| `make infra-obs-up` | Prometheus, Grafana, Loki, … |
| `make infra-staging-up` | Staging overlay + apps |
| `make infra-prod-up` | Production overlay + apps |

---

## Services (local deps)

| Service | Host port | Notes |
|---------|-----------|--------|
| PostgreSQL | 5432 | `DATABASE_URL` in `.env` |
| Redis | 6379 | |
| RabbitMQ | 5672 | Management UI 15672 |
| MinIO (S3) | 9000 | Console 9001 |
| API (infra-full) | 3001 | NestJS in container |
| Grafana (obs) | 3030 | `admin` / `electromon` |
| Prometheus (obs) | 9090 | |

---

## Layout

```
infra/
├── compose/
│   ├── base.yml              # Postgres, Redis, RabbitMQ, MinIO
│   ├── local.yml             # Expose ports to host
│   ├── local.full.yml        # API container ports
│   ├── apps.yml              # migrate + api services
│   ├── observability.yml     # Prometheus, Grafana, Loki
│   ├── staging.yml
│   ├── production.yml
│   └── production.external.yml
├── dockerfiles/
│   ├── api.Dockerfile
│   └── migrate.Dockerfile
├── observability/            # Grafana dashboards, Prometheus rules
├── scripts/
└── env/
    └── local.env.example     # Copy to electromon-api/.env
```

---

## Environment

```bash
make env    # from electromon-api/ — copies infra/env/local.env.example → .env
```

For first `make infra-full`, you may set `RUN_SEED=true` in `.env` to seed inside the migrate container (otherwise seed on host with `pnpm db:seed`).

---

## Migrations in Docker

```bash
make infra-migrate     # run migrate service once
```

With `infra-full`, order is: **postgres → migrate → api**.

On host (typical dev):

```bash
pnpm db:migrate:deploy
pnpm db:seed
```

---

## Observability

```bash
make infra-up
make dev                 # API must run on host :3001 for scraping
make infra-obs-up
```

- Grafana: http://localhost:3030
- Prometheus: http://localhost:9090

```bash
make infra-obs-down
```

---

## Troubleshooting

**Port already in use**

Stop other Postgres/Redis instances or change ports in `.env`.

**Container name conflict** (after moving the repo)

```bash
make infra-reset
make infra-up
```

**API can't connect to Postgres from host**

Ensure `DATABASE_URL` uses `localhost:5432` (not `postgres` hostname) when API runs on host and DB runs in Docker.

---

## Web app

The Next.js dashboard is a **separate repo**: [electromon-web](https://github.com/ibrex29/electromon-web).

Typical local stack:

1. In this repo: `make infra-up && make dev` → API on :3001
2. In the web repo: `make install && make env && make dev` → Web on :3000
