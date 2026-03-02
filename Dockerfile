# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# ── Build-time environment variables ──────────────────────────────────────────
# These VITE_ vars are inlined into the JS bundle by Vite at build time.
# They are NOT available at runtime — changing them requires a new image build.
# Pass them via --build-arg in CI/CD (or set them in docker-compose.yml).
ARG VITE_API_URL=/api/v1
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV NODE_ENV=production

# ── Install dependencies ───────────────────────────────────────────────────────
# Done before COPY . . so Docker reuses this layer on source-only changes.
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── Copy source ────────────────────────────────────────────────────────────────
COPY . .

# ── Write .env so Vite picks up the build args ────────────────────────────────
# NOTE: Each line is written separately to avoid any leading-space issues
# from shell line continuations (a common printf multi-line gotcha).
RUN echo "VITE_API_URL=$VITE_API_URL"                               > .env \
    && echo "VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY"      >> .env \
    && echo "VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY"            >> .env \
    && echo "VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN"    >> .env \
    && echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID"      >> .env \
    && echo "VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET" >> .env \
    && echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID" >> .env \
    && echo "VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID"              >> .env

RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Install curl for the healthcheck (wget is not bundled in nginx:alpine)
RUN apk add --no-cache curl

# Drop root — required for ECS/K8s security policies
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Clear the default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built app
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Copy nginx config and entrypoint script
COPY nginx.conf             /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh   /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Grant appuser write access to nginx runtime dirs
RUN chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown appuser:appgroup /var/run/nginx.pid

# ── Runtime environment ────────────────────────────────────────────────────────
# BACKEND_URL controls where /api/* requests are proxied.
# Unlike VITE_ vars, this CAN be changed without rebuilding the image.
# Override it in your ECS task definition, k8s Deployment, or docker-compose.
ENV BACKEND_URL=http://backend:8000

EXPOSE 80

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost/healthz || exit 1

# Entrypoint injects BACKEND_URL into nginx.conf, then starts nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
