# Portfolio - khoadangnguyen.com

Personal portfolio and blog platform with a CMS admin panel, multilingual content support, and AI-powered translation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go 1.24 (gin-gonic), Clean Architecture |
| Frontend | React, Vite (SSR), TailwindCSS, TypeScript |
| Admin Panel | React, Vite, TailwindCSS, TypeScript |
| Database | PostgreSQL 17 |
| Cache | Redis 7 |
| Messaging | NATS 2 |
| AI/LLM | LiteLLM (private proxy) |
| Email | Resend |
| Reverse Proxy | Caddy (production) |
| Container Registry | Vultr (sgp.vultrcr.com/bestnhadat) |
| Hosting | Hetzner VM (behind Cloudflare Tunnel) |
| Secrets | Doppler |
| CI/CD | GitHub Actions |

## Prerequisites

- Docker and Docker Compose v2+
- Go 1.24+ (for local backend development)
- Node.js 20+ and pnpm (for local frontend development)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/khoa-nguyendang/portfolio.git
cd portfolio

# Start all services
docker compose up --build

# Or use Make
make dev
```

Services will be available at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Admin Panel | http://localhost:3001 |
| Backend API | http://localhost:8080 |
| NATS Monitoring | http://localhost:8222 |

Default admin credentials: `admin@khoadangnguyen.com` / `admin123`

## Development Setup

### Backend (Go)

```bash
cd backend
go mod download
go run ./cmd/server
```

### Frontend (React SSR)

```bash
cd frontend
pnpm install
pnpm dev
```

### Admin Panel

```bash
cd admin
pnpm install
pnpm dev
```

### Running Tests

```bash
make test            # Backend unit tests
make test-coverage   # With coverage report
make lint            # Go vet
```

## Project Structure

```
portfolio/
├── backend/              # Go API server
│   ├── cmd/              # Entry points
│   │   └── server/       # Main server binary
│   ├── internal/         # Application code (Clean Architecture)
│   │   ├── domain/       # Entities and interfaces
│   │   ├── usecase/      # Business logic
│   │   ├── handler/      # HTTP handlers
│   │   ├── repository/   # Data access
│   │   └── middleware/   # HTTP middleware
│   └── migrations/       # SQL migration files
├── frontend/             # Public-facing React app (Vite SSR)
│   ├── src/
│   └── server.ts         # SSR entry point
├── admin/                # CMS admin panel (React + Vite)
│   └── src/
├── docs/
│   └── design/           # TOGAF-aligned architecture docs
│       ├── high-level-design.md
│       └── low-level-design-cms.md
├── .github/workflows/    # CI/CD pipelines
│   ├── build-push.yml    # Build and push images to VCR
│   └── deploy-vm.yml     # Deploy to Hetzner VM
├── docker-compose.yml        # Development environment
├── docker-compose.prod.yml   # Production environment
├── Caddyfile                 # Production reverse proxy config
├── Makefile                  # Development shortcuts
└── CLAUDE.md                 # AI coding assistant context
```

## Deployment

### Overview

Production runs on a private Hetzner VM exposed through Cloudflare Tunnel. The deployment pipeline:

1. **Build**: GitHub Actions builds Docker images and pushes to Vultr Container Registry
2. **Deploy**: GitHub Actions connects via WireGuard VPN, SSHs to the VM, pulls new images
3. **Secrets**: Doppler injects all environment variables at runtime

### Steps

1. Go to **GitHub Actions** > **Build and Push Images**
   - Select environment (`dev`, `stg`, `prod`)
   - Optionally set a version tag (e.g., `v1.0.0`)
   - Check "Update Doppler IMAGE_TAG" to auto-update the deploy tag

2. Go to **GitHub Actions** > **Deploy to VM**
   - Select environment and target VMs
   - The workflow syncs compose + Caddyfile, then runs `doppler run -- docker compose up -d`

3. Verify:
   - https://khoadangnguyen.com (frontend)
   - https://admin.khoadangnguyen.com (CMS)
   - https://api.khoadangnguyen.com/health (backend)

### Production URLs

| Domain | Service |
|--------|---------|
| khoadangnguyen.com | Frontend (SSR) |
| admin.khoadangnguyen.com | CMS Admin Panel |
| api.khoadangnguyen.com | Backend API |

## Environment Variables

See [`.env.example`](.env.example) for all available variables with descriptions.

Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection URL |
| `NATS_URL` | NATS server URL |
| `JWT_SECRET` | JWT signing secret |
| `RESEND_API_KEY` | Resend email service API key |
| `LITELLM_BASE_URL` | LiteLLM proxy URL for AI features |
| `VITE_API_URL` | Backend API URL for frontend |

## Multilingual Support

The platform supports 20 languages. Content is translated asynchronously via a background service that uses LiteLLM to process translations, following a pattern similar to Reddit's approach -- translations are pre-computed and cached rather than generated on-the-fly.

Supported languages: English, Chinese, German, Japanese, Hindi, French, Spanish, Italian, Russian, Portuguese, Korean, Turkish, Indonesian, Dutch, Arabic, Polish, Swedish, Thai, Vietnamese, Hebrew.

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the existing code style
3. Write tests for new functionality
4. Run `make test` and `make lint` before committing
5. Open a pull request with a clear description
