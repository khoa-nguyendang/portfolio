-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    author_id TEXT NOT NULL REFERENCES users(id),
    category_id TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags TEXT[] NOT NULL DEFAULT '{}',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, language)
);

CREATE INDEX IF NOT EXISTS idx_translations_post_lang ON translations(post_id, language);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts(is_read);

-- Site configs table
CREATE TABLE IF NOT EXISTS site_configs (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_configs_key ON site_configs(key);

-- Default site configuration values
INSERT INTO site_configs (id, key, value, updated_at) VALUES
    ('sc-001', 'hero_title', 'Welcome to My Space', NOW()),
    ('sc-002', 'hero_subtitle', 'Senior Solution Architect & Full-Stack Engineer with 11+ years of experience designing & implementing large-scale distributed systems', NOW()),
    ('sc-003', 'about_text', 'With over 11 years of experience in the IT industry, specializing in .NET, Golang, Python, Cloud, AI/ML, Data. Expert in cloud architecture, microservices design, and AI/ML integration.', NOW()),
    ('sc-004', 'contact_email', 'contact@khoanguyen.dev', NOW()),
    ('sc-005', 'social_github', 'https://github.com/khoa-nguyendang', NOW()),
    ('sc-006', 'social_linkedin', 'https://linkedin.com/in/khoa-nguyendang', NOW())
ON CONFLICT (key) DO NOTHING;
