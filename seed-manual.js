const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  console.log('🌱 Creando usuarios iniciales...');

  try {
    // Crear super usuario
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 12);
    
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@aunar.edu.co' },
      update: {},
      create: {
        nombre: 'Super',
        apellido: 'Administrador',
        email: 'admin@aunar.edu.co',
        telefono: '3000000000',
        departamento: 'Administración',
        password: hashedPasswordAdmin,
        role: 'SUPER_ADMIN',
        activo: true,
      },
    });

    console.log('✅ Super Admin creado:', superAdmin.email);

    // Crear usuario profesor de prueba
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'profesor@aunar.edu.co' },
      update: {},
      create: {
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        email: 'profesor@aunar.edu.co',
        telefono: '3001234567',
        departamento: 'Ingeniería de Sistemas',
        password: hashedPassword,
        role: 'PROFESOR',
        activo: true,
      },
    });

    console.log('✅ Usuario profesor creado:', user.email);

    // Crear materias de ejemplo
    const materia1 = await prisma.materia.upsert({
      where: { codigo: 'IS101' },
      update: {},
      create: {
        nombre: 'Programación I',
        codigo: 'IS101',
        descripcion: 'Fundamentos de programación con Python',
        activa: true,
        profesorId: user.id,
      },
    });

    const materia2 = await prisma.materia.upsert({
      where: { codigo: 'IS201' },
      update: {},
      create: {
        nombre: 'Base de Datos',
        codigo: 'IS201',
        descripcion: 'Diseño y administración de bases de datos',
        activa: true,
        profesorId: user.id,
      },
    });

    console.log('✅ Materias creadas:', materia1.nombre, materia2.nombre);

    // Crear estudiantes de ejemplo
    const estudiantes = [
      {
        cedula: '1234567890',
        nombreCompleto: 'María Fernanda López Rodríguez',
        email: 'maria.lopez@est.aunar.edu.co',
        materiaId: materia1.id,
      },
      {
        cedula: '0987654321',
        nombreCompleto: 'Carlos Alberto Martínez Silva',
        email: 'carlos.martinez@est.aunar.edu.co',
        materiaId: materia1.id,
      },
      {
        cedula: '1122334455',
        nombreCompleto: 'Ana Sofía García Herrera',
        email: 'ana.garcia@est.aunar.edu.co',
        materiaId: materia2.id,
      },
    ];

    for (const estudianteData of estudiantes) {
      await prisma.estudiante.upsert({
        where: {
          cedula_materiaId: {
            cedula: estudianteData.cedula,
            materiaId: estudianteData.materiaId,
          },
        },
        update: {},
        create: estudianteData,
      });
    }

    console.log('✅ Estudiantes creados');

    console.log('🎉 Seed completado exitosamente!');
    console.log('👑 Super Admin: admin@aunar.edu.co / admin123');
    console.log('👨‍🏫 Profesor: profesor@aunar.edu.co / 123456');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();