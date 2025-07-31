import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json({
        message: 'Los usuarios ya han sido creados',
        users: await prisma.user.findMany({
          select: { email: true, role: true, nombre: true, apellido: true }
        })
      })
    }

    console.log('🌱 Creando usuarios iniciales...')

    // Crear super usuario
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        nombre: 'Super',
        apellido: 'Administrador',
        email: 'admin@aunar.edu.co',
        telefono: '3000000000',
        departamento: 'Administración',
        password: hashedPasswordAdmin,
        role: 'SUPER_ADMIN',
        activo: true,
      },
    })

    console.log('✅ Super Admin creado:', superAdmin.email)

    // Crear usuario profesor de prueba
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    const profesor = await prisma.user.create({
      data: {
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        email: 'profesor@aunar.edu.co',
        telefono: '3001234567',
        departamento: 'Ingeniería de Sistemas',
        password: hashedPassword,
        role: 'PROFESOR',
        activo: true,
      },
    })

    console.log('✅ Usuario profesor creado:', profesor.email)

    // Crear materias de ejemplo
    const materia1 = await prisma.materia.create({
      data: {
        nombre: 'Programación I',
        codigo: 'IS101',
        descripcion: 'Fundamentos de programación con Python',
        activa: true,
        profesorId: profesor.id,
      },
    })

    const materia2 = await prisma.materia.create({
      data: {
        nombre: 'Base de Datos',
        codigo: 'IS201',
        descripcion: 'Diseño y administración de bases de datos',
        activa: true,
        profesorId: profesor.id,
      },
    })

    console.log('✅ Materias creadas:', materia1.nombre, materia2.nombre)

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
    ]

    for (const estudianteData of estudiantes) {
      await prisma.estudiante.create({
        data: estudianteData,
      })
    }

    console.log('✅ Estudiantes creados')

    return NextResponse.json({
      success: true,
      message: '🎉 Inicialización completada exitosamente!',
      users: [
        {
          email: 'admin@aunar.edu.co',
          password: 'admin123',
          role: 'SUPER_ADMIN',
          nombre: 'Super Administrador'
        },
        {
          email: 'profesor@aunar.edu.co',
          password: '123456',
          role: 'PROFESOR',
          nombre: 'Juan Carlos Pérez García'
        }
      ],
      materias: [materia1.nombre, materia2.nombre],
      estudiantes: estudiantes.length
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error en inicialización:', error)
    return NextResponse.json(
      { 
        error: 'Error al inicializar la base de datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { 
        email: true, 
        role: true, 
        nombre: true, 
        apellido: true,
        activo: true,
        createdAt: true
      }
    })

    const materias = await prisma.materia.count()
    const estudiantes = await prisma.estudiante.count()

    return NextResponse.json({
      message: 'Estado del sistema',
      users: users,
      stats: {
        totalUsers: users.length,
        totalMaterias: materias,
        totalEstudiantes: estudiantes
      }
    })

  } catch (error) {
    console.error('Error al obtener estado:', error)
    return NextResponse.json(
      { error: 'Error al obtener el estado del sistema' },
      { status: 500 }
    )
  }
}