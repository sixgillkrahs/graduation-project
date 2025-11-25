# ## Dockerfile
# ################################
# ## BUILD ENVIRONMENT ###########
# ################################

# # Use the official Node.js Alpine image (adjust based on your project's requirements)
# # You can find the appropriate image on Docker Hub: https://hub.docker.com/_/node
# # In this example, we're using node:20-alpine3.20
# # run in termilnal commande line "node --version to get the version of your app"

#Build React app
FROM node:20 AS builder

WORKDIR /app

# enable pnpm
RUN corepack enable

# copy dependencies
COPY package.json pnpm-lock.yaml ./

# install deps
RUN pnpm install

# copy source
COPY . .

# build app
RUN pnpm build:prod

# 2️⃣ Nginx stage
FROM nginx:alpine

# copy nginx config
COPY --from=builder /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# clear default content
RUN rm -rf ./*

# copy built app
COPY --from=builder /app/dist .

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]