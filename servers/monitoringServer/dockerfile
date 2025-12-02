FROM node:22.16.0 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

RUN npx prisma generate

FROM node:22.16.0-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        iputils-ping \
        net-tools \
        dnsutils \
        curl \
        wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER node

COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node","dist/server.js"]
