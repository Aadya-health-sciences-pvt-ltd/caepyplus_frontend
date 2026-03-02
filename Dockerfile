# Stage 1: Install dependencies (including devDependencies for build)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm ci when lock file exists and is valid; otherwise npm install (e.g. if lock not committed or out of sync)
RUN if [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# VITE_* vars must be passed at build time (--build-arg); Vite embeds them into the static bundle
ARG VITE_API_URL=/api/v1
ARG VITE_BASE_PATH=
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# Set as ENV so Vite build can read them directly
ENV VITE_API_URL=$VITE_API_URL \
    VITE_BASE_PATH=$VITE_BASE_PATH \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Bust cache so every CI build does a fresh build
ARG BUILD_SHA
ENV BUILD_SHA=$BUILD_SHA

ENV NODE_ENV=production
RUN rm -rf dist && npm run build

# Stage 3: Production image (standalone node server using serve)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install serve to run the static site
RUN npm install -g serve

# Install curl for the healthcheck
RUN apk add --no-cache curl

# Drop root - required for ECS/K8s security policies
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the built artifacts from builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

EXPOSE 3000

# healthz.json is generated at build time (npm run generate-healthz) and
# served as a static file by `serve`. It contains build SHA, version, and
# timestamp — confirming the *correct* build is deployed, not just the server.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -sf http://localhost:3000/healthz.json | grep '"status":' || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]
