# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.19-alpine
ARG NGINX_VERSION=1.27-alpine

FROM node:${NODE_VERSION} AS base

ENV PNPM_HOME="/pnpm" \
    PNPM_STORE_DIR="/pnpm/store" \
    PATH="$PNPM_HOME:$PATH" \
    CI=true

RUN corepack enable

FROM base AS gra-helper

ARG LIB_DIR=library/gra-helper

WORKDIR /workspace/library/gra-helper

COPY ${LIB_DIR}/package.json ./package.json
COPY ${LIB_DIR}/pnpm-lock.yaml ./pnpm-lock.yaml
COPY ${LIB_DIR}/tsconfig.json ./tsconfig.json
COPY ${LIB_DIR}/tsconfig.esm.json ./tsconfig.esm.json
COPY ${LIB_DIR}/src ./src

RUN --mount=type=cache,id=gra-helper-pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile && \
    pnpm build

FROM base AS builder

WORKDIR /workspace/front-end/uaa

ARG APP_DIR=front-end/uaa
ARG LIB_DIR=library/gra-helper
ARG BUILD_SCRIPT=build:prod
ARG VITE_BASEURL=http://localhost:8080/api/
ARG VITE_BASEURL_AI=http://localhost:8082/
ARG ENVIRONMENT=production
ENV VITE_BASEURL=${VITE_BASEURL}
ENV VITE_BASEURL_AI=${VITE_BASEURL_AI}
ENV ENVIRONMENT=${ENVIRONMENT}

COPY ${APP_DIR}/package.json ./package.json
COPY ${APP_DIR}/pnpm-lock.yaml ./pnpm-lock.yaml
COPY ${APP_DIR}/.npmrc ./.npmrc

COPY --from=gra-helper /workspace/library/gra-helper /workspace/library/gra-helper

RUN --mount=type=cache,id=uaa-pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile

COPY ${APP_DIR}/index.html ./index.html
COPY ${APP_DIR}/public ./public
COPY ${APP_DIR}/src ./src
COPY ${APP_DIR}/tailwind.config.js ./tailwind.config.js
COPY ${APP_DIR}/tsconfig.json ./tsconfig.json
COPY ${APP_DIR}/tsconfig.app.json ./tsconfig.app.json
COPY ${APP_DIR}/tsconfig.node.json ./tsconfig.node.json
COPY ${APP_DIR}/vite.config.ts ./vite.config.ts

ENV NODE_ENV=production
RUN pnpm run ${BUILD_SCRIPT}

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner

ARG APP_DIR=front-end/uaa

COPY ${APP_DIR}/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /workspace/front-end/uaa/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
