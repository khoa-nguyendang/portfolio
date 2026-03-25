# Low-Level Design - CMS Feature

**Document Version:** 1.0
**TOGAF 10 Alignment:** Application Architecture, Data Architecture
**Last Updated:** 2026-03-25
**Related:** [High-Level Design](high-level-design.md)

---

## 1. Entity Model

### 1.1 Entity Diagram

```
┌──────────────────────┐       ┌──────────────────────────┐
│        User          │       │          Post            │
├──────────────────────┤       ├──────────────────────────┤
│ id          UUID PK  │       │ id            UUID PK    │
│ email       VARCHAR  │       │ author_id     UUID FK    │──┐
│ password    VARCHAR  │       │ slug          VARCHAR    │  │
│ role        VARCHAR  │       │ status        VARCHAR    │  │
│ created_at  TIMESTAMP│       │ featured_image TEXT      │  │
│ updated_at  TIMESTAMP│       │ published_at  TIMESTAMP  │  │
└──────────┬───────────┘       │ created_at    TIMESTAMP  │  │
           │                   │ updated_at    TIMESTAMP  │  │
           │ 1:N               └──────────┬───────────────┘  │
           │                              │                  │
           └──────────────────────────────┼──────────────────┘
                                          │ 1:N
                                          │
                               ┌──────────▼───────────────┐
                               │    PostTranslation       │
                               ├──────────────────────────┤
                               │ id          UUID PK      │
                               │ post_id     UUID FK      │
                               │ language    VARCHAR(5)   │
                               │ title       VARCHAR      │
                               │ content     TEXT         │
                               │ excerpt     TEXT         │
                               │ meta_title  VARCHAR      │
                               │ meta_desc   VARCHAR      │
                               │ status      VARCHAR      │
                               │ created_at  TIMESTAMP    │
                               │ updated_at  TIMESTAMP    │
                               └──────────────────────────┘

┌──────────────────────┐       ┌──────────────────────────┐
│      PostTag         │       │         Tag              │
├──────────────────────┤       ├──────────────────────────┤
│ post_id   UUID FK    │──────►│ id          UUID PK      │
│ tag_id    UUID FK    │       │ slug        VARCHAR      │
│                      │       │ name        VARCHAR      │
└──────────────────────┘       │ created_at  TIMESTAMP    │
                               └──────────────────────────┘

┌──────────────────────────┐
│     ContactMessage       │
├──────────────────────────┤
│ id          UUID PK      │
│ name        VARCHAR      │
│ email       VARCHAR      │
│ subject     VARCHAR      │
│ message     TEXT         │
│ read        BOOLEAN      │
│ created_at  TIMESTAMP    │
└──────────────────────────┘
```

### 1.2 Entity Definitions

**User**
- `role`: One of `admin`, `editor`. Only `admin` can manage users.
- `password`: bcrypt-hashed, minimum 12 characters.

**Post**
- `status`: One of `draft`, `published`, `archived`.
- `slug`: URL-friendly identifier, unique, auto-generated from English title.
- `featured_image`: URL to the post's featured image.

**PostTranslation**
- `language`: ISO 639-1 code (e.g., `en`, `vi`, `ja`).
- `status`: One of `pending`, `translating`, `completed`, `failed`.
- Composite unique constraint on `(post_id, language)`.

---

## 2. Database Schema

### 2.1 SQL Definitions

```sql
-- Users table
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'editor',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Posts table
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID NOT NULL REFERENCES users(id),
    slug            VARCHAR(255) NOT NULL UNIQUE,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    featured_image  TEXT,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_posts_author ON posts(author_id);

-- Post translations table
CREATE TABLE post_translations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    language    VARCHAR(5) NOT NULL,
    title       VARCHAR(500) NOT NULL,
    content     TEXT NOT NULL,
    excerpt     TEXT,
    meta_title  VARCHAR(200),
    meta_desc   VARCHAR(300),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (post_id, language)
);

CREATE INDEX idx_translations_post_lang ON post_translations(post_id, language);
CREATE INDEX idx_translations_status ON post_translations(status);

-- Tags table
CREATE TABLE tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(100) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post-tag junction table
CREATE TABLE post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Contact messages table
CREATE TABLE contact_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    subject     VARCHAR(500) NOT NULL,
    message     TEXT NOT NULL,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_read ON contact_messages(read, created_at DESC);
```

---

## 3. API Endpoint Specifications

### 3.1 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Authenticate and receive JWT |
| POST | `/api/auth/refresh` | JWT | Refresh access token |
| POST | `/api/auth/logout` | JWT | Invalidate session |

#### POST /api/auth/login

**Request:**
```json
{
  "email": "admin@khoadangnguyen.com",
  "password": "********"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_at": "2026-03-26T12:00:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@khoadangnguyen.com",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "error": "invalid_credentials",
  "message": "Invalid email or password"
}
```

### 3.2 Posts (CMS)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | No | List published posts (public) |
| GET | `/api/posts/:slug` | No | Get post by slug (public) |
| GET | `/api/admin/posts` | JWT | List all posts (admin) |
| GET | `/api/admin/posts/:id` | JWT | Get post by ID (admin) |
| POST | `/api/admin/posts` | JWT | Create post |
| PUT | `/api/admin/posts/:id` | JWT | Update post |
| DELETE | `/api/admin/posts/:id` | JWT | Delete post |
| POST | `/api/admin/posts/:id/publish` | JWT | Publish draft |
| POST | `/api/admin/posts/:id/translate` | JWT | Trigger translation |

#### GET /api/posts

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lang` | string | `en` | Language code |
| `page` | int | `1` | Page number |
| `per_page` | int | `10` | Items per page (max 50) |
| `tag` | string | | Filter by tag slug |

**Response (200):**
```json
{
  "posts": [
    {
      "id": "550e8400-...",
      "slug": "building-portfolio-with-go",
      "title": "Building a Portfolio with Go",
      "excerpt": "A guide to building...",
      "featured_image": "https://...",
      "published_at": "2026-03-20T10:00:00Z",
      "tags": ["go", "web-development"],
      "language": "en"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 42,
    "total_pages": 5
  }
}
```

#### POST /api/admin/posts

**Request:**
```json
{
  "title": "Building a Portfolio with Go",
  "content": "# Introduction\n\nThis post covers...",
  "excerpt": "A guide to building a portfolio website using Go and React",
  "featured_image": "https://images.example.com/cover.jpg",
  "meta_title": "Building a Portfolio with Go | Khoa Nguyen",
  "meta_desc": "Learn how to build a modern portfolio...",
  "tags": ["go", "web-development"],
  "status": "draft"
}
```

**Response (201):**
```json
{
  "id": "550e8400-...",
  "slug": "building-portfolio-with-go",
  "status": "draft",
  "created_at": "2026-03-25T10:00:00Z"
}
```

#### POST /api/admin/posts/:id/translate

**Request:**
```json
{
  "languages": ["vi", "ja", "de"]
}
```

**Response (202):**
```json
{
  "message": "Translation queued",
  "post_id": "550e8400-...",
  "languages": ["vi", "ja", "de"],
  "estimated_time_seconds": 90
}
```

### 3.3 Translations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/posts/:id/translations` | JWT | List translations for a post |
| GET | `/api/admin/posts/:id/translations/:lang` | JWT | Get specific translation |
| PUT | `/api/admin/posts/:id/translations/:lang` | JWT | Edit translation manually |
| DELETE | `/api/admin/posts/:id/translations/:lang` | JWT | Delete translation |

### 3.4 Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | No | Submit contact form (rate limited) |
| GET | `/api/admin/contacts` | JWT | List contact messages |
| PUT | `/api/admin/contacts/:id/read` | JWT | Mark as read |
| DELETE | `/api/admin/contacts/:id` | JWT | Delete message |

### 3.5 System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/languages` | No | List supported languages |

---

## 4. Authentication Flow

### 4.1 Login Sequence

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌────────┐
│  Admin   │          │ Backend  │          │PostgreSQL│          │ Redis  │
│  Panel   │          │   API    │          │          │          │        │
└────┬─────┘          └────┬─────┘          └────┬─────┘          └───┬────┘
     │                     │                     │                    │
     │ POST /auth/login    │                     │                    │
     │ {email, password}   │                     │                    │
     │────────────────────►│                     │                    │
     │                     │                     │                    │
     │                     │ Check rate limit     │                    │
     │                     │────────────────────────────────────────►│
     │                     │ OK / Rate limited    │                    │
     │                     │◄────────────────────────────────────────│
     │                     │                     │                    │
     │                     │ SELECT user          │                    │
     │                     │ WHERE email = ?      │                    │
     │                     │────────────────────►│                    │
     │                     │ User record          │                    │
     │                     │◄────────────────────│                    │
     │                     │                     │                    │
     │                     │ bcrypt.Compare       │                    │
     │                     │ (password, hash)     │                    │
     │                     │                     │                    │
     │                     │ Generate JWT         │                    │
     │                     │ (HS256, 24h expiry)  │                    │
     │                     │                     │                    │
     │                     │ Store session        │                    │
     │                     │────────────────────────────────────────►│
     │                     │                     │                    │
     │ 200 {token, user}   │                     │                    │
     │◄────────────────────│                     │                    │
     │                     │                     │                    │
     │ Store token          │                     │                    │
     │ (localStorage)      │                     │                    │
```

### 4.2 JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@khoadangnguyen.com",
    "role": "admin",
    "iat": 1711353600,
    "exp": 1711440000
  }
}
```

### 4.3 Middleware Chain

```
Request
  │
  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   Recovery   │────►│   Logging    │────►│     CORS     │────►│  Route   │
│  (panic)     │     │  (zerolog)   │     │              │     │ Handler  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────┘
                                                                     │
                                          For /api/admin/* routes:   │
                                          ┌──────────────┐           │
                                          │  Auth/JWT    │◄──────────┘
                                          │  Middleware   │
                                          └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │  Rate Limit  │
                                          │  Middleware   │
                                          └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │   Handler    │
                                          └──────────────┘
```

---

## 5. Translation Pipeline

### 5.1 Translation Flow

```
┌───────────┐
│  Admin    │
│  Panel    │
└─────┬─────┘
      │ POST /admin/posts/:id/translate
      │ {"languages": ["vi", "ja", "de"]}
      ▼
┌───────────┐    publish event     ┌──────────┐
│  Backend  │─────────────────────►│   NATS   │
│   API     │  "post.translate"    │          │
└───────────┘  {post_id, langs}    └────┬─────┘
                                        │
                                        │ subscribe
                                        ▼
                                  ┌───────────────┐
                                  │  Translation  │
                                  │    Worker     │
                                  └───────┬───────┘
                                          │
                            ┌─────────────┼─────────────┐
                            │             │             │
                            ▼             ▼             ▼
                     ┌──────────┐  ┌──────────┐  ┌──────────┐
                     │ Translate│  │ Translate│  │ Translate│
                     │  to vi   │  │  to ja   │  │  to de   │
                     └────┬─────┘  └────┬─────┘  └────┬─────┘
                          │             │             │
                          │    ┌────────▼────────┐    │
                          └───►│    LiteLLM      │◄───┘
                               │  (POST /chat/   │
                               │   completions)  │
                               └────────┬────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │   Save to DB    │
                               │ post_translations│
                               └────────┬────────┘
                                        │
                            publish "translation.completed"
                                        │
                                        ▼
                               ┌─────────────────┐
                               │  Invalidate     │
                               │  Redis Cache    │
                               └─────────────────┘
```

### 5.2 Translation Worker Logic

```
FUNCTION processTranslation(event):
    post = db.GetPost(event.post_id)
    sourceTranslation = db.GetTranslation(post.id, "en")

    FOR EACH lang IN event.languages:
        // Update status to "translating"
        db.UpdateTranslationStatus(post.id, lang, "translating")

        TRY:
            prompt = buildTranslationPrompt(
                sourceTitle: sourceTranslation.title,
                sourceContent: sourceTranslation.content,
                sourceExcerpt: sourceTranslation.excerpt,
                targetLanguage: lang
            )

            response = litellm.ChatCompletion(prompt)
            parsed = parseTranslationResponse(response)

            db.UpsertTranslation({
                post_id:    post.id,
                language:   lang,
                title:      parsed.title,
                content:    parsed.content,
                excerpt:    parsed.excerpt,
                meta_title: parsed.meta_title,
                meta_desc:  parsed.meta_desc,
                status:     "completed"
            })

            nats.Publish("translation.completed", {
                post_id:  post.id,
                language: lang
            })

        CATCH error:
            db.UpdateTranslationStatus(post.id, lang, "failed")
            log.Error("Translation failed", post.id, lang, error)

    // Invalidate cached post data
    redis.Delete("post:" + post.slug + ":*")
```

### 5.3 LLM Prompt Structure

```
System: You are a professional translator. Translate the following blog post
content from English to {target_language}. Maintain the original formatting
(Markdown), tone, and technical accuracy. Return a JSON object with the
translated fields.

User:
Translate to {target_language_name}:

Title: {title}
Excerpt: {excerpt}
Content:
{content}

Return JSON:
{
  "title": "translated title",
  "excerpt": "translated excerpt (max 300 chars)",
  "content": "translated content (preserve markdown)",
  "meta_title": "SEO title (max 60 chars)",
  "meta_desc": "SEO description (max 155 chars)"
}
```

---

## 6. Sequence Diagrams

### 6.1 Create and Publish Post

```
┌──────┐     ┌────────┐     ┌──────────┐     ┌──────┐     ┌────────┐
│Admin │     │Backend │     │PostgreSQL│     │ NATS │     │ Worker │
└──┬───┘     └───┬────┘     └────┬─────┘     └──┬───┘     └───┬────┘
   │             │               │               │             │
   │ POST /admin/posts           │               │             │
   │ {title, content, tags}      │               │             │
   │────────────►│               │               │             │
   │             │               │               │             │
   │             │ BEGIN TX       │               │             │
   │             │──────────────►│               │             │
   │             │ INSERT post   │               │             │
   │             │──────────────►│               │             │
   │             │ INSERT tags   │               │             │
   │             │──────────────►│               │             │
   │             │ INSERT en     │               │             │
   │             │ translation   │               │             │
   │             │──────────────►│               │             │
   │             │ COMMIT        │               │             │
   │             │──────────────►│               │             │
   │             │               │               │             │
   │ 201 Created │               │               │             │
   │◄────────────│               │               │             │
   │             │               │               │             │
   │ POST /admin/posts/:id/publish               │             │
   │────────────►│               │               │             │
   │             │ UPDATE status │               │             │
   │             │ = 'published' │               │             │
   │             │──────────────►│               │             │
   │             │               │               │             │
   │             │ Publish       │               │             │
   │             │ "post.created"│               │             │
   │             │──────────────────────────────►│             │
   │             │               │               │             │
   │ 200 OK      │               │  Deliver      │             │
   │◄────────────│               │               │────────────►│
   │             │               │               │             │
   │             │               │               │  (translate │
   │             │               │               │   all langs)│
```

### 6.2 Public Post Retrieval with Language

```
┌─────────┐     ┌──────────┐     ┌────────┐     ┌──────────┐     ┌──────────┐
│ Visitor │     │ Frontend │     │Backend │     │  Redis   │     │PostgreSQL│
└────┬────┘     └────┬─────┘     └───┬────┘     └────┬─────┘     └────┬─────┘
     │               │               │               │                │
     │ GET /blog/    │               │               │                │
     │ building-     │               │               │                │
     │ portfolio     │               │               │                │
     │ ?lang=vi      │               │               │                │
     │──────────────►│               │               │                │
     │               │               │               │                │
     │               │ GET /api/posts│               │                │
     │               │ /building-    │               │                │
     │               │ portfolio     │               │                │
     │               │ ?lang=vi      │               │                │
     │               │──────────────►│               │                │
     │               │               │               │                │
     │               │               │ GET cache     │                │
     │               │               │ "post:building│                │
     │               │               │ -portfolio:vi"│                │
     │               │               │──────────────►│                │
     │               │               │               │                │
     │               │               │ Cache MISS    │                │
     │               │               │◄──────────────│                │
     │               │               │               │                │
     │               │               │ SELECT post + translation      │
     │               │               │ WHERE slug AND lang            │
     │               │               │───────────────────────────────►│
     │               │               │               │                │
     │               │               │ Post data     │                │
     │               │               │◄───────────────────────────────│
     │               │               │               │                │
     │               │               │ SET cache     │                │
     │               │               │ TTL 3600s     │                │
     │               │               │──────────────►│                │
     │               │               │               │                │
     │               │ Post JSON     │               │                │
     │               │◄──────────────│               │                │
     │               │               │               │                │
     │ SSR HTML       │               │               │                │
     │ (with meta     │               │               │                │
     │  tags for SEO) │               │               │                │
     │◄──────────────│               │               │                │
```

---

## 7. Caching Strategy

### 7.1 Cache Keys

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `post:{slug}:{lang}` | 1 hour | Single post with translation |
| `posts:list:{lang}:{page}:{tag}` | 5 min | Paginated post list |
| `post:{slug}:meta` | 1 hour | Post metadata (for SSR head) |
| `languages:supported` | 24 hours | List of supported languages |
| `tags:all` | 15 min | All tags |
| `rate:login:{ip}` | 15 min | Login rate limit counter |
| `rate:contact:{ip}` | 1 hour | Contact form rate limit |

### 7.2 Cache Invalidation

Triggered via NATS events:
- `post.created` / `post.updated` / `post.deleted`: Invalidate `post:{slug}:*` and `posts:list:*`
- `translation.completed`: Invalidate `post:{slug}:{lang}`
- `tag.updated`: Invalidate `tags:all` and `posts:list:*`

---

## 8. Error Handling

### 8.1 Error Response Format

```json
{
  "error": "error_code",
  "message": "Human-readable description",
  "details": {}
}
```

### 8.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_credentials` | 401 | Wrong email or password |
| `unauthorized` | 401 | Missing or invalid JWT |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `validation_error` | 422 | Request validation failed |
| `rate_limited` | 429 | Too many requests |
| `conflict` | 409 | Duplicate resource (e.g., slug) |
| `internal_error` | 500 | Unexpected server error |
| `translation_failed` | 500 | LLM translation error |
