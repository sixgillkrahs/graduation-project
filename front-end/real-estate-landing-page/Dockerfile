# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base

ARG APP_DIR=front-end/real-estate-landing-page
ARG LIB_DIR=library/gra-helper

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat && corepack enable

FROM base AS gra-helper
WORKDIR /workspace/library/gra-helper
ARG LIB_DIR

COPY ${LIB_DIR}/package.json ./
COPY ${LIB_DIR}/pnpm-lock.yaml ./
COPY ${LIB_DIR}/tsconfig.json ./
COPY ${LIB_DIR}/tsconfig.esm.json ./
COPY ${LIB_DIR}/src ./src

RUN --mount=type=cache,id=pnpm-gra-helper-store,target=/pnpm/store \
    pnpm install --frozen-lockfile && \
    pnpm build && \
    rm -rf node_modules src pnpm-lock.yaml tsconfig.json tsconfig.esm.json

FROM base AS deps
WORKDIR /workspace/front-end/real-estate-landing-page
ARG APP_DIR

COPY ${APP_DIR}/package.json ./
COPY ${APP_DIR}/pnpm-lock.yaml ./
COPY --from=gra-helper /workspace/library/gra-helper /workspace/library/gra-helper

RUN --mount=type=cache,id=pnpm-landing-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /workspace/front-end/real-estate-landing-page
ARG APP_DIR
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_API_BASE_SOCKET=http://localhost:8000
ARG INTERNAL_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_BASEURLAI=http://localhost:8082
ARG INTERNAL_AI_BASE_URL=http://host.docker.internal:8082
ARG NEXT_PUBLIC_ENVIRONMENT=production
ARG NEXT_PUBLIC_ANALYTICS_ID=
ARG NEXT_PUBLIC_MODERATION_API_URL=
ARG NEXT_OUTPUT_MODE=standalone

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_BASE_SOCKET=${NEXT_PUBLIC_API_BASE_SOCKET}
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}
ENV NEXT_PUBLIC_BASEURLAI=${NEXT_PUBLIC_BASEURLAI}
ENV INTERNAL_AI_BASE_URL=${INTERNAL_AI_BASE_URL}
ENV NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}
ENV NEXT_PUBLIC_ANALYTICS_ID=${NEXT_PUBLIC_ANALYTICS_ID}
ENV NEXT_PUBLIC_MODERATION_API_URL=${NEXT_PUBLIC_MODERATION_API_URL}
ENV NEXT_OUTPUT_MODE=${NEXT_OUTPUT_MODE}

COPY --from=deps /workspace/front-end/real-estate-landing-page/node_modules ./node_modules
COPY ${APP_DIR}/ ./
COPY --from=gra-helper /workspace/library/gra-helper /workspace/library/gra-helper

RUN --mount=type=cache,id=next-landing-cache,target=/workspace/front-end/real-estate-landing-page/.next/cache \
    pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_API_BASE_SOCKET=http://localhost:8000
ARG INTERNAL_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_BASEURLAI=http://localhost:8082
ARG INTERNAL_AI_BASE_URL=http://host.docker.internal:8082
ARG NEXT_PUBLIC_ENVIRONMENT=production
ARG NEXT_PUBLIC_ANALYTICS_ID=
ARG NEXT_PUBLIC_MODERATION_API_URL=

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_BASE_SOCKET=${NEXT_PUBLIC_API_BASE_SOCKET}
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}
ENV NEXT_PUBLIC_BASEURLAI=${NEXT_PUBLIC_BASEURLAI}
ENV INTERNAL_AI_BASE_URL=${INTERNAL_AI_BASE_URL}
ENV NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}
ENV NEXT_PUBLIC_ANALYTICS_ID=${NEXT_PUBLIC_ANALYTICS_ID}
ENV NEXT_PUBLIC_MODERATION_API_URL=${NEXT_PUBLIC_MODERATION_API_URL}
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

COPY --from=builder --chown=nextjs:nodejs /workspace/front-end/real-estate-landing-page/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/front-end/real-estate-landing-page/public ./front-end/real-estate-landing-page/public
COPY --from=builder --chown=nextjs:nodejs /workspace/front-end/real-estate-landing-page/.next/static ./front-end/real-estate-landing-page/.next/static

USER nextjs
WORKDIR /app/front-end/real-estate-landing-page

EXPOSE 3000

CMD ["node", "server.js"]
