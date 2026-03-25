# ─── Stage 1: Build ──────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# ─── Stage 2: Serve ──────────────────────────────────────
FROM nginx:alpine-slim

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
