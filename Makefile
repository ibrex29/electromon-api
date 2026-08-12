.PHONY: help install setup env dev build test test-e2e test-cov \
        infra-up infra-down infra-logs infra-ps infra-full infra-full-down \
        infra-obs-up infra-obs-down infra-staging-up infra-staging-down \
        infra-prod-up infra-prod-down infra-prod-external-up \
        infra-migrate infra-reset infra-backup infra-deploy-staging infra-deploy-prod \
        db-generate db-migrate db-migrate-deploy db-seed db-seed-production-apc db-studio db-reset

PNPM := COREPACK_ENABLE_STRICT=0 pnpm
# --project-directory . loads repo-root .env (COMPOSE_PROJECT_NAME, secrets, etc.)
DOCKER := docker compose --project-directory .

COMPOSE_LOCAL      := -f infra/compose/base.yml -f infra/compose/local.yml
COMPOSE_FULL       := $(COMPOSE_LOCAL) -f infra/compose/local.full.yml -f infra/compose/apps.yml --profile apps
COMPOSE_OBS        := $(COMPOSE_LOCAL) -f infra/compose/observability.yml -f infra/compose/observability.local.yml --profile observability
OBS_SERVICES       := prometheus alertmanager loki promtail grafana redis-exporter postgres-exporter
COMPOSE_STAGING    := -f infra/compose/base.yml -f infra/compose/staging.yml \
	-f infra/compose/apps.yml -f infra/compose/edge.yml \
	-f infra/compose/observability.yml -f infra/compose/observability.secure.yml \
	--profile apps --profile edge --profile observability
COMPOSE_PROD       := -f infra/compose/base.yml -f infra/compose/production.yml \
	-f infra/compose/apps.yml -f infra/compose/edge.yml \
	-f infra/compose/observability.yml -f infra/compose/observability.secure.yml \
	--profile apps --profile edge --profile observability
COMPOSE_PROD_EXT   := -f infra/compose/base.yml -f infra/compose/production.yml \
	-f infra/compose/production.external.yml -f infra/compose/apps.yml \
	-f infra/compose/edge.yml \
	-f infra/compose/observability.yml -f infra/compose/observability.secure.yml \
	--profile apps --profile edge --profile observability

help:
	@echo "Electromon API"
	@echo ""
	@echo "  make setup                     First-time: install, env, infra, migrate, seed"
	@echo "  make dev                       Start API on host (:3001)"
	@echo "  make infra-up                  Start Postgres, Redis, RabbitMQ, MinIO"
	@echo "  make infra-full                Run API + deps fully in Docker"
	@echo "  make infra-staging-up          Staging: apps + Caddy edge + obs"
	@echo "  make infra-prod-up             Production: apps + Caddy edge + obs"
	@echo "  make infra-prod-external-up    Prod with managed Postgres/Spaces"
	@echo "  make infra-backup              pg_dump → infra/backups/"
	@echo "  make infra-deploy-staging      Deploy script (staging)"
	@echo "  make db-seed                   Dev/demo seed"
	@echo "  make db-seed-production-apc    Production APC bootstrap"

install:
	$(PNPM) install

env:
	@test -f .env || cp infra/env/local.env.example .env
	@cp .env db/.env 2>/dev/null || true
	@chmod +x infra/scripts/*.sh

setup: install env infra-up db-generate db-migrate-deploy db-seed

dev:
	$(PNPM) dev

build:
	$(PNPM) build

test:
	$(PNPM) test

test-e2e:
	$(PNPM) test:e2e

test-cov:
	$(PNPM) test:cov

infra-up:
	@chmod +x infra/scripts/*.sh
	@test -f .env || cp infra/env/local.env.example .env
	$(DOCKER) $(COMPOSE_LOCAL) up -d

infra-down:
	$(DOCKER) $(COMPOSE_LOCAL) down

infra-logs:
	$(DOCKER) $(COMPOSE_LOCAL) logs -f

infra-ps:
	$(DOCKER) $(COMPOSE_LOCAL) ps

infra-full:
	@chmod +x infra/scripts/*.sh
	$(DOCKER) $(COMPOSE_FULL) up -d --build

infra-full-down:
	$(DOCKER) $(COMPOSE_FULL) down

infra-obs-up:
	$(DOCKER) $(COMPOSE_OBS) up -d $(OBS_SERVICES)

infra-obs-down:
	$(DOCKER) $(COMPOSE_OBS) stop $(OBS_SERVICES)
	$(DOCKER) $(COMPOSE_OBS) rm -f $(OBS_SERVICES)

infra-staging-up:
	@chmod +x infra/scripts/*.sh
	$(DOCKER) $(COMPOSE_STAGING) up -d --build

infra-staging-down:
	$(DOCKER) $(COMPOSE_STAGING) down

infra-prod-up:
	@chmod +x infra/scripts/*.sh
	$(DOCKER) $(COMPOSE_PROD) up -d --build

infra-prod-down:
	$(DOCKER) $(COMPOSE_PROD) down

infra-prod-external-up:
	@chmod +x infra/scripts/*.sh
	$(DOCKER) $(COMPOSE_PROD_EXT) up -d --build redis rabbitmq migrate api caddy \
		prometheus alertmanager loki promtail grafana redis-exporter

infra-migrate:
	$(DOCKER) -f infra/compose/base.yml -f infra/compose/local.yml -f infra/compose/apps.yml --profile apps run --rm migrate

infra-backup:
	@chmod +x infra/scripts/backup-postgres.sh
	./infra/scripts/backup-postgres.sh

infra-deploy-staging:
	@chmod +x infra/scripts/deploy.sh
	ENV=staging ./infra/scripts/deploy.sh

infra-deploy-prod:
	@chmod +x infra/scripts/deploy.sh
	ENV=production ./infra/scripts/deploy.sh

infra-reset:
	-$(DOCKER) $(COMPOSE_FULL) down -v --remove-orphans
	-$(DOCKER) $(COMPOSE_LOCAL) down -v --remove-orphans
	@for c in $$(docker ps -aq --filter name=electromon-local-); do docker rm -f $$c 2>/dev/null || true; done

db-generate:
	$(PNPM) db:generate

db-migrate:
	$(PNPM) db:migrate

db-migrate-deploy:
	$(PNPM) db:migrate:deploy

db-seed:
	$(PNPM) db:seed

# Production APC bootstrap (geography + campaign + director). Requires SEED_ADMIN_PASSWORD.
# Does not invent collation results, incidents, or demo agents.
db-seed-production-apc:
	$(PNPM) db:seed:production:apc

db-studio:
	$(PNPM) db:studio

db-reset:
	cd db && $(PNPM) exec prisma migrate reset --force
