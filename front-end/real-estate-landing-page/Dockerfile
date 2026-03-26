FROM node:20-alpine AS base

ARG APP_DIR=front-end/real-estate-landing-page
ARG LIB_DIR=library/gra-helper

# Stage 1: Install dependencies
FROM base AS deps
# Install libc6-compat if needed by Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
ARG APP_DIR
ARG LIB_DIR

# Install dependencies based on the preferred package manager
COPY ${APP_DIR}/package.json ./
COPY ${APP_DIR}/yarn.lock* ${APP_DIR}/package-lock.json* ${APP_DIR}/pnpm-lock.yaml* ./
COPY ${LIB_DIR} /library/gra-helper
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ARG APP_DIR
ARG LIB_DIR
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_API_BASE_SOCKET=http://localhost:8000
ARG INTERNAL_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_BASEURLAI=http://localhost:8082
ARG INTERNAL_AI_BASE_URL=http://host.docker.internal:8082
ARG NEXT_PUBLIC_ENVIRONMENT=production
COPY --from=deps /app/node_modules ./node_modules
COPY ${APP_DIR} .
COPY ${LIB_DIR} /library/gra-helper
RUN rm -rf ./node_modules/gra-helper && cp -R /library/gra-helper ./node_modules/gra-helper

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_BASE_SOCKET=${NEXT_PUBLIC_API_BASE_SOCKET}
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}
ENV NEXT_PUBLIC_BASEURLAI=${NEXT_PUBLIC_BASEURLAI}
ENV INTERNAL_AI_BASE_URL=${INTERNAL_AI_BASE_URL}
ENV NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else npm run build; \
  fi

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_API_BASE_SOCKET=http://localhost:8000
ARG INTERNAL_API_BASE_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_BASEURLAI=http://localhost:8082
ARG INTERNAL_AI_BASE_URL=http://host.docker.internal:8082
ARG NEXT_PUBLIC_ENVIRONMENT=production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_BASE_SOCKET=${NEXT_PUBLIC_API_BASE_SOCKET}
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}
ENV NEXT_PUBLIC_BASEURLAI=${NEXT_PUBLIC_BASEURLAI}
ENV INTERNAL_AI_BASE_URL=${INTERNAL_AI_BASE_URL}
ENV NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy public folder 
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size (requires output: 'standalone' in next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using the standalone server
CMD ["node", "server.js"]
