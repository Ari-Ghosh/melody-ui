# ─── Melody UI Makefile ─────────────────────────────────────────────────
# Next.js 16 frontend (React 19, Tailwind v4) — self-contained; backend
# runs separately with its own Makefile + docker-compose.

.DEFAULT_GOAL := help

.PHONY: help dev build start test lint

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Development ────────────────────────────────────────────────────────

dev: ## Start dev server (http://localhost:3000)
	npm run dev

# ─── Build ──────────────────────────────────────────────────────────────

build: ## Build production bundle
	npm run build

start: ## Start production server (must build first)
	npm start

# ─── Testing ────────────────────────────────────────────────────────────

test: ## Run tests (vitest)
	npm test

# ─── Linting ────────────────────────────────────────────────────────────

lint: ## Run linter (eslint)
	npm run lint
