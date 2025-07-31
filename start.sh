#!/bin/sh

echo "🚀 Iniciando aplicación de gestión de asistencia..."

# Esperar a que la base de datos esté disponible
echo "⏳ Esperando conexión a la base de datos..."
sleep 5

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."
npx prisma db push --accept-data-loss

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Ejecutar seed si es necesario (solo en primera instalación)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Ejecutando seed de datos iniciales..."
  node seed-manual.js || echo "⚠️ Error en seed, continuando..."
fi

# Iniciar la aplicación
echo "✅ Iniciando servidor Next.js..."
exec node server.js