# 🚀 Despliegue en Coolify - Sistema de Gestión de Asistencia

## 📋 Requisitos Previos

1. **Coolify instalado** en tu VPS
2. **Dominio configurado** (opcional pero recomendado)
3. **Repositorio Git** con el código

## 🗄️ Paso 1: Crear Base de Datos PostgreSQL

1. En Coolify, ve a **"Resources"** → **"Databases"**
2. Clic en **"+ New Database"**
3. Selecciona **"PostgreSQL"**
4. Configuración:
   - **Name**: `student-attendance-db`
   - **Database Name**: `student_attendance`
   - **Username**: `postgres` (o el que prefieras)
   - **Password**: Genera una contraseña segura
   - **Version**: `17` (por defecto en Coolify)

5. Clic en **"Deploy"**
6. **Guarda la URL de conexión** que se genera

## 🚀 Paso 2: Crear Aplicación Next.js

1. En Coolify, ve a **"Projects"** → **"+ New Project"**
2. Selecciona **"Public Repository"** o conecta tu repositorio
3. Configuración del proyecto:
   - **Repository URL**: `https://github.com/tu-usuario/tu-repo.git`
   - **Branch**: `main` o `master`
   - **Build Pack**: `nixpacks` (automático)

## ⚙️ Paso 3: Variables de Entorno

En la sección **"Environment Variables"** de tu aplicación, agrega:

```bash
# Base de datos (usar la URL generada por Coolify)
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/student_attendance?schema=public

# Next.js Auth
NEXTAUTH_SECRET=tu-secreto-super-seguro-cambiar-aqui
NEXTAUTH_URL=https://tu-dominio.com

# Configuración
NODE_ENV=production

# Seed inicial (solo para primera instalación)
RUN_SEED=true
```

## 🔧 Paso 4: Configuración de Build

En **"Build Settings"**:
- **Build Command**: `npm run build`
- **Start Command**: `./start.sh`
- **Port**: `3000`

## 🌐 Paso 5: Dominio (Opcional)

1. En **"Domains"**, agrega tu dominio
2. Habilita **SSL/TLS** automático
3. Actualiza `NEXTAUTH_URL` con tu dominio

## 🚀 Paso 6: Deploy

1. Clic en **"Deploy"**
2. Monitorea los logs para verificar que todo funcione
3. La primera vez ejecutará el seed automáticamente

## 👤 Credenciales por Defecto

Después del primer despliegue:
- **Admin**: `admin@aunar.edu.co` / `admin123`
- **Profesor**: `profesor@aunar.edu.co` / `123456`

## 🔄 Actualizaciones

Para futuras actualizaciones:
1. Haz push a tu repositorio
2. En Coolify, clic en **"Redeploy"**
3. Las migraciones se ejecutarán automáticamente

## 🐛 Troubleshooting

### Error de conexión a base de datos
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos esté ejecutándose

### Error de migraciones
- Revisa los logs de despliegue
- Verifica que Prisma tenga permisos en la base de datos

### Error 500 en la aplicación
- Revisa las variables de entorno
- Verifica que `NEXTAUTH_SECRET` esté configurado

## 📊 Monitoreo

- **Logs**: Disponibles en la interfaz de Coolify
- **Métricas**: CPU, memoria y almacenamiento
- **Uptime**: Monitoreo automático

## 🔒 Seguridad

- Cambia las credenciales por defecto después del primer login
- Usa contraseñas seguras para la base de datos
- Mantén actualizado el `NEXTAUTH_SECRET`
- Considera usar un dominio con HTTPS