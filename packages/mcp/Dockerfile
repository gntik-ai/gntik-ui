# syntax=docker/dockerfile:1
# ============================================================================
# gntik-ui-mcp — imagen para Kubernetes/OpenShift
# Contexto de build: la RAÍZ del monorepo →  docker build -f packages/mcp/Dockerfile .
# La imagen empaqueta registry.json (el índice generado del catálogo) y blocks/;
# GNTIK_UI_REPO permite seguir una rama en vivo sin reconstruir.
# ============================================================================

FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/mcp/package.json packages/mcp/
RUN pnpm install --frozen-lockfile --filter @gntik-ai/gntik-ui-mcp
COPY packages/mcp/tsconfig.json packages/mcp/
COPY packages/mcp/src packages/mcp/src
RUN pnpm --filter @gntik-ai/gntik-ui-mcp build \
 && pnpm --filter @gntik-ai/gntik-ui-mcp deploy --legacy --prod /out

FROM node:24-alpine
RUN apk add --no-cache git tini
ENV NODE_ENV=production \
    GNTIK_UI_DIR=/app/design-system \
    MCP_TRANSPORT=http \
    PORT=8080
WORKDIR /app

# catálogo (snapshot del build): índice generado + referencias HTML + docs
COPY registry.json kit-registry.json *.md /app/design-system/
# Kit sources so get_component / get_block / get_template can return file contents.
COPY packages /app/design-system/packages
COPY blocks /app/design-system/blocks

# server
COPY --from=build /out /app/mcp

# OpenShift-friendly: uid arbitrario con grupo 0
RUN chgrp -R 0 /app && chmod -R g=u /app
USER 1001

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
ENTRYPOINT ["/sbin/tini", "--", "node", "/app/mcp/dist/index.js"]
CMD ["--http"]
