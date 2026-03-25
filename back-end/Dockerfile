FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ARG APP_DIR=back-end
ARG LIB_DIR=library/gra-helper

# Stage 1: Install all dependencies (for build)
FROM base AS deps
# Install libc6-compat if needed by Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
ARG APP_DIR
ARG LIB_DIR
COPY ${APP_DIR}/package.json ${APP_DIR}/pnpm-lock.yaml ./
COPY ${LIB_DIR} /library/gra-helper
RUN pnpm config set node-linker hoisted && pnpm install --frozen-lockfile

# Stage 2: Install production dependencies only
FROM base AS prod-deps
WORKDIR /app
ARG APP_DIR
ARG LIB_DIR
COPY ${APP_DIR}/package.json ${APP_DIR}/pnpm-lock.yaml ./
COPY ${LIB_DIR} /library/gra-helper
RUN pnpm config set node-linker hoisted && pnpm install --frozen-lockfile --prod

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
ARG APP_DIR
ARG LIB_DIR
COPY --from=deps /app/node_modules ./node_modules
COPY ${APP_DIR} .
COPY ${LIB_DIR} /library/gra-helper
RUN pnpm run build

# Stage 4: Production server
FROM base AS runner
WORKDIR /app
ARG LIB_DIR

ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy production node_modules from prod-deps stage
COPY --from=prod-deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=expressjs:nodejs /library/gra-helper /library/gra-helper

# Copy compiled source code
COPY --from=builder --chown=expressjs:nodejs /app/dist ./dist
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json

# Setup directories for logs and uploads assuming the app might write to them
RUN mkdir -p uploads logs && chown -R expressjs:nodejs uploads logs

# Switch to non-root user
USER expressjs

EXPOSE 8080

# Configure health check for the API
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/monitoring/health || exit 1

CMD ["npm", "start"]
