# syntax=docker/dockerfile:1
# ============================================================================
# gntik-ui-mcp — imagen para Kubernetes/OpenShift
# Contexto de build: la RAÍZ del repo gntik-ui →  docker build -f mcp/Dockerfile .
# La imagen empaqueta un snapshot del catálogo; GNTIK_UI_REPO permite seguir
# una rama en vivo sin reconstruir (con GNTIK_UI_SYNC_MINUTES).
# ============================================================================

FROM node:22-alpine AS build
WORKDIR /build
COPY mcp/package.json mcp/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY mcp/tsconfig.json ./
COPY mcp/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
RUN apk add --no-cache git tini
ENV NODE_ENV=production \
    GNTIK_UI_DIR=/app/design-system \
    MCP_TRANSPORT=http \
    PORT=8080
WORKDIR /app

# catálogo (snapshot del build)
COPY *.jsx *.md index.html /app/design-system/
COPY tokens /app/design-system/tokens
COPY blocks /app/design-system/blocks
COPY assets /app/design-system/assets

# server
COPY mcp/package.json /app/mcp/package.json
COPY --from=build /build/node_modules /app/mcp/node_modules
COPY --from=build /build/dist /app/mcp/dist

# OpenShift-friendly: uid arbitrario con grupo 0
RUN chgrp -R 0 /app && chmod -R g=u /app
USER 1001

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
ENTRYPOINT ["/sbin/tini", "--", "node", "/app/mcp/dist/index.js"]
CMD ["--http"]
