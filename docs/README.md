# Electromon API — Documentation

This repo is the **NestJS backend** for Electromon. The dashboard lives in a separate repo: [electromon-web](https://github.com/ibrex29/electromon-web).

---

## Index

| Document | Description |
|----------|-------------|
| [../README.md](../README.md) | **Start here** — run locally with/without Docker |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, module map, deployment |
| [API.md](./API.md) | REST API reference |
| [TESTING.md](./TESTING.md) | Unit and e2e tests |
| [PHASE-0.md](./PHASE-0.md) | Phase 0 foundation (historical) |

| Infrastructure | [../infra/README.md](../infra/README.md) |

---

## How to run (summary)

### Local — Docker for deps only (recommended)

```bash
make setup          # install, env, infra, migrate, seed
make dev            # http://localhost:3001
```

### Local — no Docker

Provide your own PostgreSQL; set `DATABASE_URL` in `.env`, then:

```bash
make install
pnpm db:migrate:deploy && pnpm db:seed
make dev
```

### With Docker

| Goal | Command |
|------|---------|
| Postgres, Redis, RabbitMQ, MinIO | `make infra-up` |
| API + deps in containers | `make infra-full` |
| Grafana / Prometheus | `make infra-obs-up` |

---

## Web dashboard

Clone and run separately:

```bash
git clone git@github.com:ibrex29/electromon-web.git
cd electromon-web
make install && make env && make dev   # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3001` in the web `.env`.

---

## Demo login

**Password:** `ChangeMe123!`

- `director@electromon.ng` — campaign director
- `pu.officer@electromon.ng` — submit PU results
- `ward.officer@electromon.ng` — ward review
- `lga.officer@electromon.ng` — LGA review
- `state.officer@electromon.ng` — state collation
- `national.officer@electromon.ng` — national collation
