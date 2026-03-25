# High-Level Design - Portfolio Platform

**Document Version:** 1.0
**TOGAF 10 Alignment:** Architecture Vision, Business Architecture, Information Systems Architecture, Technology Architecture
**Last Updated:** 2026-03-25

---

## 1. System Context

The portfolio platform is a personal website with a content management system, multilingual support, and AI-powered translation.

### 1.1 System Context Diagram

```
                                    ┌─────────────────┐
                                    │  Cloudflare CDN  │
                                    │   & DNS/Tunnel   │
                                    └────────┬────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                    ┌─────────▼──┐  ┌────────▼───┐  ┌──────▼───────┐
                    │  Public    │  │   Admin    │  │   API        │
                    │  Visitors  │  │   (Owner)  │  │   Consumers  │
                    └─────────┬──┘  └────────┬───┘  └──────┬───────┘
                              │              │              │
                    khoadangnguyen.com  admin.khoa...  api.khoa...
                              │              │              │
                    ┌─────────▼──────────────▼──────────────▼──────┐
                    │                  Caddy Reverse Proxy          │
                    │               (TLS termination, routing)     │
                    └─────┬──────────────┬──────────────┬──────────┘
                          │              │              │
               ┌──────────▼──┐  ┌───────▼────┐  ┌─────▼───────┐
               │  Frontend   │  │   Admin    │  │   Backend   │
               │  (Vite SSR) │  │   Panel    │  │   (Go/Gin)  │
               │  :3000      │  │   :3001    │  │   :8080     │
               └─────────────┘  └────────────┘  └──────┬──────┘
                                                       │
                          ┌────────────────────────────┬┼──────────┐
                          │                            ││          │
                   ┌──────▼──────┐  ┌──────────┐  ┌───▼▼───┐  ┌──▼───┐
                   │ PostgreSQL  │  │  Redis   │  │  NATS  │  │LiteLLM│
                   │   :5432     │  │  :6379   │  │ :4222  │  │:4000  │
                   └─────────────┘  └──────────┘  └────────┘  └──┬───┘
                                                                  │
                                                           ┌──────▼──────┐
                                                           │  LLM APIs   │
                                                           │ (Private)   │
                                                           └─────────────┘

    External Services:
    ┌──────────┐  ┌──────────────────┐
    │  Resend  │  │ Vultr Container  │
    │  (Email) │  │   Registry       │
    └──────────┘  └──────────────────┘
```

### 1.2 Actors

| Actor | Description |
|-------|-------------|
| Public Visitor | Reads blog posts, views portfolio, browses in preferred language |
| Admin (Owner) | Manages content, writes blog posts, monitors system via CMS |
| API Consumer | Programmatic access to public APIs |

---

## 2. Component Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Go / Gin)                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  Handlers   │  │  Middleware  │  │   Background       │  │
│  │             │  │             │  │   Workers           │  │
│  │ - Post      │  │ - Auth/JWT  │  │                     │  │
│  │ - Auth      │  │ - CORS      │  │ - Translation       │  │
│  │ - User      │  │ - RateLimit │  │   Worker            │  │
│  │ - Contact   │  │ - Logging   │  │ - Event             │  │
│  │ - Translate │  │ - Recovery  │  │   Processor         │  │
│  └──────┬──────┘  └─────────────┘  └─────────┬──────────┘  │
│         │                                      │            │
│  ┌──────▼──────────────────────────────────────▼─────────┐  │
│  │                    Use Cases                          │  │
│  │                                                       │  │
│  │  - ManagePost    - Authenticate   - ManageContact    │  │
│  │  - TranslatePost - SendEmail                         │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │                    Domain Layer                        │  │
│  │                                                       │  │
│  │  Entities: Post, User, Translation, Contact           │  │
│  │  Interfaces: Repository, EventBus, Cache, EmailSvc   │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │                  Infrastructure                       │  │
│  │                                                       │  │
│  │  ┌──────────┐ ┌───────┐ ┌──────┐ ┌───────┐ ┌──────┐ │  │
│  │  │PostgreSQL│ │ Redis │ │ NATS │ │Resend │ │LiteLLM│ │  │
│  │  │  Repo    │ │ Cache │ │ Bus  │ │ Email │ │  AI   │ │  │
│  │  └──────────┘ └───────┘ └──────┘ └───────┘ └──────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Frontend Architecture

```
┌───────────────────────────────────────────┐
│           Frontend (Vite SSR)             │
│                                           │
│  ┌─────────────┐  ┌───────────────────┐   │
│  │   Pages     │  │   Components      │   │
│  │             │  │                   │   │
│  │ - Home      │  │ - Header/Footer   │   │
│  │ - Blog      │  │ - PostCard        │   │
│  │ - Post      │  │ - LanguagePicker  │   │
│  │ - About     │  │ - SEOHead         │   │
│  │ - Contact   │  │ - ContactForm     │   │
│  └──────┬──────┘  └───────────────────┘   │
│         │                                 │
│  ┌──────▼──────────────────────────────┐  │
│  │  API Client  |  i18n  |  Router    │  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│         Admin Panel (Vite + Nginx)        │
│                                           │
│  ┌─────────────┐  ┌───────────────────┐   │
│  │   Pages     │  │   Components      │   │
│  │             │  │                   │   │
│  │ - Login     │  │ - PostEditor      │   │
│  │ - Dashboard │  │ - MediaUpload     │   │
│  │ - Posts     │  │ - TranslationMgr  │   │
│  │ - Settings  │  │                   │   │
│  └──────┬──────┘  └───────────────────┘   │
│         │                                 │
│  ┌──────▼──────────────────────────────┐  │
│  │  Auth Context | API Client | Router│  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

---

## 3. Technology Stack Overview

### 3.1 Application Layer

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Backend API | Go (gin-gonic) | 1.24 | RESTful API server |
| Frontend | React + Vite SSR | Latest | Public-facing website with SEO |
| Admin Panel | React + Vite | Latest | CMS for content management |
| Styling | TailwindCSS | Latest | Utility-first CSS framework |
| Icons | Lucide | Latest | Icon library |
| Language | TypeScript | Latest | Type-safe frontend development |

### 3.2 Data Layer

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Primary Database | PostgreSQL | 17 | Persistent data storage |
| Cache | Redis | 7 | Session cache, query cache, rate limiting |
| Message Broker | NATS | 2 | Async event-driven communication |

### 3.3 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| AI/LLM Proxy | LiteLLM (self-hosted) | Content translation, AI analysis |
| Email | Resend | Transactional emails, contact form |
| DNS/CDN | Cloudflare | DNS, DDoS protection, Tunnel |
| Container Registry | Vultr (sgp.vultrcr.com/bestnhadat) | Docker image storage |
| Secrets Management | Doppler | Environment variable injection |

### 3.4 Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Compute | Hetzner Cloud VM | Application hosting |
| Reverse Proxy | Caddy | TLS, routing, security headers |
| Containerization | Docker + Compose | Service orchestration |
| CI/CD | GitHub Actions | Build, test, deploy pipelines |
| VPN | WireGuard | Secure deployment access |

---

## 4. Deployment Architecture

### 4.1 Production Topology

```
┌────────────────────────────────────────────────────────┐
│                     Internet                           │
└───────────────────────┬────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │   Cloudflare   │
                │   (DNS + CDN   │
                │   + Tunnel)    │
                └───────┬────────┘
                        │ Cloudflare Tunnel (encrypted)
                        │
┌───────────────────────▼────────────────────────────────┐
│              Hetzner Private VM                        │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Docker Compose                      │  │
│  │                                                  │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────┐ ┌────────┐ │  │
│  │  │  Caddy  │ │ Frontend │ │ Admin │ │Backend │ │  │
│  │  │  :80/443│ │  :3000   │ │ :3001 │ │ :8080  │ │  │
│  │  └────┬────┘ └──────────┘ └───────┘ └───┬────┘ │  │
│  │       │                                  │      │  │
│  │  ┌────▼──────────────────────────────────▼───┐  │  │
│  │  │          portfolio-network (bridge)       │  │  │
│  │  └──────────────────┬────────────────────────┘  │  │
│  │                     │                           │  │
│  │               ┌─────▼─────┐                     │  │
│  │               │   NATS    │                     │  │
│  │               │   :4222   │                     │  │
│  │               └───────────┘                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Connections to external data servers:                  │
│  ── PostgreSQL (separate server) ──►                   │
│  ── Redis (separate server) ──►                        │
│  ── LiteLLM (private server) ──►                       │
└────────────────────────────────────────────────────────┘
```

### 4.2 CI/CD Pipeline

```
Developer Push
      │
      ▼
┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  Build & Push    │────►│  Approval Gate  │────►│  Deploy to VM    │
│  (GitHub Actions)│     │  (prod only)    │     │  (GitHub Actions)│
│                  │     └─────────────────┘     │                  │
│ 1. Run tests     │                             │ 1. WireGuard VPN │
│ 2. Build images  │                             │ 2. SSH to VM     │
│ 3. Push to VCR   │                             │ 3. docker pull   │
│ 4. Update Doppler│                             │ 4. docker up     │
└──────────────────┘                             │ 5. Health check  │
                                                 └──────────────────┘
```

---

## 5. Security Architecture

### 5.1 Zero-Trust Principles

| Principle | Implementation |
|-----------|---------------|
| Network Isolation | VM hidden behind Cloudflare Tunnel; no public IP exposed |
| Encrypted Transit | TLS everywhere (Cloudflare edge, Caddy internal) |
| Secret Management | All secrets in Doppler; never in code or compose files |
| Authentication | JWT tokens with expiry; bcrypt password hashing |
| Authorization | Role-based access; admin endpoints protected |
| Input Validation | Server-side validation on all endpoints |
| CORS | Strict origin allowlisting |
| Security Headers | X-Frame-Options, CSP, HSTS, X-Content-Type-Options |
| Deployment Access | WireGuard VPN + SSH key authentication |
| Rate Limiting | Redis-backed rate limiting on API endpoints |

### 5.2 Authentication Flow

```
┌────────┐         ┌─────────┐         ┌──────────┐
│ Admin  │         │ Backend │         │PostgreSQL│
│ Panel  │         │   API   │         │          │
└───┬────┘         └────┬────┘         └────┬─────┘
    │  POST /auth/login  │                   │
    │───────────────────►│                   │
    │                    │  Verify password  │
    │                    │──────────────────►│
    │                    │  User record      │
    │                    │◄──────────────────│
    │                    │                   │
    │  JWT token         │  Generate JWT     │
    │◄───────────────────│                   │
    │                    │                   │
    │  API request       │                   │
    │  + Bearer token    │                   │
    │───────────────────►│                   │
    │                    │  Validate JWT     │
    │                    │  (middleware)     │
    │  Response          │                   │
    │◄───────────────────│                   │
```

### 5.3 CMS Security Measures

- Admin panel served on separate subdomain with strict CSP
- X-Frame-Options: DENY prevents clickjacking
- CSRF protection via SameSite cookie attributes
- Rate limiting on login attempts
- Session invalidation on password change
- Input sanitization to prevent XSS and SQL injection

---

## 6. Data Flow

### 6.1 Content Publishing Flow

```
┌───────┐    ┌──────┐    ┌────────┐    ┌──────┐    ┌────────┐    ┌─────────┐
│ Admin │───►│ API  │───►│Postgres│    │ NATS │───►│Worker  │───►│ LiteLLM │
│ Panel │    │      │    │(save)  │    │(event)│   │(translate)│  │  (AI)   │
└───────┘    └──┬───┘    └────────┘    └───┬──┘    └───┬────┘    └────┬────┘
                │                          │           │              │
                │  Publish post ──────────►│           │              │
                │                    post.created ────►│              │
                │                                      │  Translate   │
                │                                      │─────────────►│
                │                                      │  Translated  │
                │                                      │◄─────────────│
                │                                      │              │
                │                               ┌──────▼──────┐      │
                │                               │  PostgreSQL  │      │
                │                               │(save transl.)│      │
                │                               └──────┬──────┘      │
                │                                      │              │
                │                               ┌──────▼──────┐      │
                │                               │    Redis     │      │
                │                               │(invalidate  │      │
                │                               │   cache)    │      │
                │                               └─────────────┘      │
```

### 6.2 Public Content Request Flow

```
┌─────────┐    ┌───────────┐    ┌───────┐    ┌──────────┐    ┌──────────┐
│ Visitor │───►│ Frontend  │───►│  API  │───►│  Redis   │    │PostgreSQL│
│         │    │ (SSR)     │    │       │    │ (cache?) │    │          │
└─────────┘    └───────────┘    └───┬───┘    └────┬─────┘    └────┬─────┘
                                    │             │               │
                                    │  GET post   │               │
                                    │  + lang=vi  │               │
                                    │────────────►│               │
                                    │  Cache hit? │               │
                                    │◄────────────│               │
                                    │             │  Cache miss   │
                                    │             │──────────────►│
                                    │             │  Translation  │
                                    │             │◄──────────────│
                                    │  Response   │  Cache set    │
                                    │◄────────────│               │
```

---

## 7. Integration Points

### 7.1 LiteLLM (AI/LLM)

- **Purpose:** Content translation, AI-powered analysis features
- **Protocol:** REST API (OpenAI-compatible)
- **Integration:** Backend calls LiteLLM proxy which routes to private LLM servers
- **Error Handling:** Retry with exponential backoff; fallback to cached translations

### 7.2 Resend (Email)

- **Purpose:** Contact form submissions, system notifications
- **Protocol:** REST API
- **Integration:** Backend sends emails via Resend API
- **Error Handling:** Queue failed emails for retry via NATS

### 7.3 NATS (Event Bus)

- **Purpose:** Async communication between services
- **Subjects:**
  - `post.created` - Triggers translation pipeline
  - `post.updated` - Re-translates changed content
  - `post.deleted` - Cleans up translations and cache
  - `translation.completed` - Invalidates Redis cache
  - `contact.received` - Triggers email notification

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Target |
|--------|--------|
| Page load (SSR) | < 1.5s (first contentful paint) |
| API response (cached) | < 50ms |
| API response (uncached) | < 200ms |
| Translation processing | < 30s per language per post |
| Lighthouse score | > 90 (Performance, SEO, Accessibility) |

### 8.2 Scalability

| Aspect | Strategy |
|--------|----------|
| Read scaling | Redis caching, CDN (Cloudflare) |
| Write scaling | Async processing via NATS workers |
| Translation scaling | Parallel processing across languages |
| Data growth | PostgreSQL partitioning (future), archival strategy |

### 8.3 Security

| Aspect | Measure |
|--------|---------|
| Authentication | JWT with short expiry, refresh token rotation |
| Authorization | Role-based access control (RBAC) |
| Data protection | Encryption at rest (PostgreSQL), TLS in transit |
| Secret management | Doppler (zero secrets in code) |
| Vulnerability scanning | Dependabot, Go security advisories |
| Attack surface | Cloudflare Tunnel (no exposed ports) |

### 8.4 Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% (personal project) |
| Recovery time (RTO) | < 1 hour |
| Recovery point (RPO) | < 24 hours |
| Backup strategy | PostgreSQL daily backups, Docker volume snapshots |
| Monitoring | NATS monitoring (:8222), application health endpoints |

### 8.5 Observability

| Aspect | Tool |
|--------|------|
| Health checks | /health endpoint on backend |
| Logging | Structured JSON logging (zerolog) |
| Metrics | NATS built-in monitoring |
| Error tracking | Structured error responses with correlation IDs |
