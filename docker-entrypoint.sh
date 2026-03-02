#!/bin/sh
# docker-entrypoint.sh
# Replaces ${BACKEND_URL} in nginx.conf at container startup,
# then hands off to nginx. This keeps the Dockerfile CMD readable.
#
# To point at a different backend, just set the env var:
#   docker run -e BACKEND_URL=http://my-api:8000 ...

set -e

# Substitute the BACKEND_URL placeholder in the nginx config
envsubst '${BACKEND_URL}' \
  < /etc/nginx/conf.d/default.conf \
  > /tmp/nginx-resolved.conf

# Overwrite with resolved config
cp /tmp/nginx-resolved.conf /etc/nginx/conf.d/default.conf

echo "→ Backend proxied to: $BACKEND_URL"
echo "→ Starting nginx..."

exec nginx -g "daemon off;"
