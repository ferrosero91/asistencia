import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario sea super admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    })

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      )
    }

    // Obtener todos los usuarios con estadísticas
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { materias: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Obtener estadísticas adicionales para cada usuario
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalEstudiantes = await prisma.estudiante.count({
          where: {
            materia: {
              profesorId: user.id
            }
          }
        })

        const totalAsistencias = await prisma.asistencia.count({
          where: {
            materia: {
              profesorId: user.id
            }
          }
        })

        return {
          ...user,
          totalMaterias: user._count.materias,
          totalEstudiantes,
          totalAsistencias,
          // Remover la contraseña de la respuesta
          password: undefined
        }
      })
    )

    return NextResponse.json(usersWithStats)

  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminId, userData } = await request.json()

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario sea super admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    })

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    // Crear nuevo usuario (solo profesores desde admin)
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        role: 'PROFESOR',
        activo: true
      }
    })

    // Remover contraseña de la respuesta
    const { password, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })

  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}