FROM node:20-alpine AS base

# frontend
FROM base AS frontend
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# backend (use slim image so Prisma engines work without extra packages)
FROM node:20-slim AS app
WORKDIR /app
COPY backend/package.json ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate

COPY --from=frontend /app/frontend/dist ./frontend-dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npx tsx src/index.ts"]
