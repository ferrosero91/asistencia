#!/bin/bash

echo "🚀 Iniciando aplicación de gestión de asistencia..."

# Esperar a que la base de datos esté disponible
echo "⏳ Esperando conexión a la base de datos..."

# Crear base de datos si no existe (usando la base postgres por defecto)
echo "🗄️ Verificando/creando base de datos student_attendance..."
PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\([^@]*\)@.*/\1/p') \
PGHOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p') \
PGPORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p') \
PGUSER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p') \
psql -h $PGHOST -p $PGPORT -U $PGUSER -d postgres -c "CREATE DATABASE student_attendance;" 2>/dev/null || echo "Base de datos ya existe o se creará automáticamente"

# Actualizar URL para usar la base de datos correcta
export DATABASE_URL=$(echo $DATABASE_URL | sed 's/\/postgres$/\/student_attendance/')

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."
npx prisma db push --accept-data-loss

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Ejecutar seed si es necesario (solo en primera instalación)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Ejecutando seed de datos iniciales..."
  npm run db:seed
fi

# Iniciar la aplicación
echo "✅ Iniciando servidor Next.js..."
exec node server.js