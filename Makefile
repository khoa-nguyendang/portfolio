.PHONY: dev dev-down build test migrate lint clean prod-deploy

# ── Development ───────────────────────────────────────────────

## Start all services in development mode
dev:
	docker compose up --build

## Stop all development services
dev-down:
	docker compose down

## Start services in detached mode
dev-detach:
	docker compose up --build -d

## View logs for a specific service (usage: make logs SVC=backend)
logs:
	docker compose logs -f $(SVC)

# ── Build ─────────────────────────────────────────────────────

## Build all Docker images without starting
build:
	docker compose build

## Build backend binary locally
build-backend:
	cd backend && go build -o bin/server ./cmd/server

# ── Testing ───────────────────────────────────────────────────

## Run backend tests
test:
	cd backend && go test ./... -short -count=1

## Run backend tests with coverage
test-coverage:
	cd backend && go test ./... -coverprofile=coverage.out -count=1
	cd backend && go tool cover -html=coverage.out -o coverage.html

# ── Database ──────────────────────────────────────────────────

## Run database migrations (requires running postgres)
migrate:
	cd backend && go run ./cmd/migrate

## Connect to local PostgreSQL
db-shell:
	docker compose exec postgres psql -U portfolio -d portfolio

# ── Code Quality ──────────────────────────────────────────────

## Run linters
lint:
	cd backend && go vet ./...
	@echo "Backend lint passed"

## Format Go code
fmt:
	cd backend && gofmt -w .

# ── Cleanup ───────────────────────────────────────────────────

## Clean build artifacts and stopped containers
clean:
	cd backend && rm -rf bin/ tmp/ coverage.out coverage.html
	cd frontend && rm -rf dist/ node_modules/.cache
	cd admin && rm -rf dist/ node_modules/.cache
	docker compose down --volumes --remove-orphans 2>/dev/null || true

# ── Production ────────────────────────────────────────────────

## Show production deployment instructions
prod-deploy:
	@echo "========================================"
	@echo "  Production Deployment"
	@echo "========================================"
	@echo ""
	@echo "1. Build and push images:"
	@echo "   Go to GitHub Actions -> 'Build and Push Images'"
	@echo "   Select environment: prod"
	@echo "   Optionally set a version tag (e.g. v1.0.0)"
	@echo "   Check 'Update Doppler IMAGE_TAG'"
	@echo ""
	@echo "2. Deploy to VM:"
	@echo "   Go to GitHub Actions -> 'Deploy to VM'"
	@echo "   Select environment: prod"
	@echo "   Target VMs: 10.0.0.2 (or 'all')"
	@echo ""
	@echo "3. Verify:"
	@echo "   https://khoadangnguyen.com"
	@echo "   https://admin.khoadangnguyen.com"
	@echo "   https://api.khoadangnguyen.com/health"
	@echo ""

# ── Help ──────────────────────────────────────────────────────

## Show this help
help:
	@echo "Available targets:"
	@echo ""
	@echo "  dev            Start all services (docker compose up --build)"
	@echo "  dev-down       Stop all services"
	@echo "  dev-detach     Start services in background"
	@echo "  logs SVC=x     Follow logs for a service"
	@echo "  build          Build all Docker images"
	@echo "  build-backend  Build backend binary locally"
	@echo "  test           Run backend tests"
	@echo "  test-coverage  Run tests with coverage report"
	@echo "  migrate        Run database migrations"
	@echo "  db-shell       Connect to local PostgreSQL"
	@echo "  lint           Run linters"
	@echo "  fmt            Format Go code"
	@echo "  clean          Clean build artifacts and containers"
	@echo "  prod-deploy    Show production deployment instructions"
