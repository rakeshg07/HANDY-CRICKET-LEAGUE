FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

RUN npm ci --workspace=shared --workspace=server --include-workspace-root

COPY shared ./shared
COPY server ./server

RUN npm run build --workspace=shared && npm run build --workspace=server

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

RUN npm ci --workspace=shared --workspace=server --include-workspace-root --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
