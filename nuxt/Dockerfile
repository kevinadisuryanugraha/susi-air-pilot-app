# Multi-stage Dockerfile for Nuxt 3 Frontend
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY nuxt.config.ts tsconfig.json ./
COPY app.vue ./
COPY assets/ ./assets/
COPY components/ ./components/
COPY pages/ ./pages/
COPY public/ ./public/
COPY stores/ ./stores/
COPY middleware/ ./middleware/

ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
