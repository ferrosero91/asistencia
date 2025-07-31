# Dockerfile para Next.js con Prisma
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat postgresql-client
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Construir la aplicación
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Construir Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar script de inicio
COPY --from=builder /app/package.json ./package.json

# Copiar y dar permisos al script ANTES de cambiar de usuario
COPY start.sh ./
RUN chmod +x start.sh

# Cambiar propietario de archivos al usuario nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Script de inicio que ejecuta migraciones
CMD ["./start.sh"]