# Electromon API — Infrastructure

Docker Compose stack for the **API project** (Postgres, Redis, RabbitMQ, MinIO, optional API container, observability).

Run all commands from the **`electromon-api/`** project root.

## Quick start

```bash
cp infra/env/local.env.example .env
make infra-up          # deps only — then `make dev` on host
make infra-full        # API + deps in Docker
```

## Layout

```
infra/
├── compose/
│   ├── base.yml              # Postgres, Redis, RabbitMQ, MinIO
│   ├── local.yml             # Expose ports
│   ├── local.full.yml        # API container ports
│   ├── apps.yml              # migrate + api
│   ├── observability.yml     # Prometheus, Grafana, Loki
│   ├── staging.yml
│   ├── production.yml
│   └── production.external.yml
├── dockerfiles/
│   ├── api.Dockerfile
│   └── migrate.Dockerfile
├── observability/
├── scripts/
└── env/
```

## Observability

```bash
make infra-up
make dev                 # API on host so Prometheus can scrape :3001
make infra-obs-up
```

Grafana: http://localhost:3030 (`admin` / `electromon`)

## Migrations

```bash
make infra-migrate
# Flow: postgres → migrate → api (when using infra-full)
```

## Troubleshooting

**Container name conflict** after moving the repo:

```bash
make infra-reset
make infra-up
```

The **web app** has its own infra in `../electromon-web/infra/`.
