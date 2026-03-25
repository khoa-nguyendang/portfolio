# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build client and server
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production deps only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built files
COPY --from=build /app/dist ./dist

# Create cache directory and non-root user
RUN mkdir -p /app/dist/cache && \
    addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app/dist/cache

USER appuser

EXPOSE 3000

CMD ["node", "dist/server.js"]
