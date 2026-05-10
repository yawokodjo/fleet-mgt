.PHONY: dev prod down logs migrate seed test lint build push

# ── Développement ─────────────────────────────────────────────────
dev:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

# ── Production locale ─────────────────────────────────────────────
prod:
	docker compose -f docker-compose.prod.yml up --build -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

# ── Laravel ───────────────────────────────────────────────────────
migrate:
	docker compose exec laravel php artisan migrate

seed:
	docker compose exec laravel php artisan db:seed

test:
	docker compose exec laravel php artisan test

lint:
	docker compose exec laravel vendor/bin/pint

# ── Frontend ──────────────────────────────────────────────────────
build-frontend:
	docker compose -f docker-compose.prod.yml build frontend

# ── Images Docker (CI/CD) ─────────────────────────────────────────
build:
	docker build --target prod -t fleet-api:local ./fleet-mgt-api
	docker build --target prod -t fleet-frontend:local ./fleet-mgt-frontend

# ── Artisan shell ─────────────────────────────────────────────────
shell:
	docker compose exec laravel bash

shell-prod:
	docker compose -f docker-compose.prod.yml exec api bash
