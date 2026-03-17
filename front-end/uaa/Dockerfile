# syntax=docker/dockerfile:1.7

FROM node:20.19-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS builder

ARG BUILD_SCRIPT=build:prod
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml .npmrc ./

RUN --mount=type=cache,id=uaa-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm run ${BUILD_SCRIPT}

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
