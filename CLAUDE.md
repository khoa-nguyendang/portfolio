A. General Design

- Use Golang backend service following DDD patterns, Clean Architecture, and Clean Code.
- Database: PostgreSQL, Databases must follow best practices.
- Follow zero-trust security best practices.
- All system design must comply with TOGAF 10 standards and need to provide Highlevel design, Low Level Design for paticular feature separately, do update instead of duplicates multiple files, could do versioning by postfix.
- Backend built with Golang (gin-gonic), frontend with ReactJS, Vite, server side render for top SEO, all using the latest versions.
- Deploy via Docker Compose for both localhost and production.
- GitHub CI/CD to build and push images to Vultr Container Registry, and a deploy action to deploy to Hetzner. Could reference existing working version. /home/anhcoder/repos/github.com/khoa-nguyendang/oidea-customer-service/.github/workflows/build-push.yml
  /home/anhcoder/repos/github.com/khoa-nguyendang/oidea-customer-service/.github/workflows/deploy-vm.yml
  Remember that there is only single share Container Registry, image must has prefix of portfolio.
- Front-end Use Lucide icons, TailwindCSS, and server-side rendering with Vite, Typescript all are latest version.
- Send email via Resend
- Support multi language - Support multi language [
  "en", "zh", "de", "ja", "hi",
  "fr", "es", "it", "ru", "pt",
  "ko", "tr", "id", "nl", "ar",
  "pl", "sv", "th", "vi", "he"
  ]
- There is a background service for handling translate posts in multi language via llm(to quickly), so when user load content, we don't need to retranslate frequently, similar Reddit's approach.
- Homepage must following best SEO practices
- Target of Prod deployment would be a private VM, expose through Cloudflare tunnel to hide the server, all microservices run inside docker-compose, docker-compose prod run with `portfolio.env` as environment file. image pull from Vultr container registry
- This product is a basic portfolio of myself.
  There is a private CMS app, require access at sub path admin.khoadangnguyen.com with login feature, secure to manage content of blog posts.
  Ensure the CRM system is following best secure practise to avoid hijacking, xss attack
  Use a modern layout
