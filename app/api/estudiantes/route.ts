import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profesorId = searchParams.get('profesorId')
    const materiaId = searchParams.get('materiaId')

    if (!profesorId) {
      return NextResponse.json(
        { error: 'profesorId es requerido' },
        { status: 400 }
      )
    }

    // Construir filtros
    const where: any = {
      materia: {
        profesorId
      }
    }

    if (materiaId) {
      where.materiaId = materiaId
    }

    const estudiantes = await prisma.estudiante.findMany({
      where,
      include: {
        materia: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(estudiantes)

  } catch (error) {
    console.error('Error al obtener estudiantes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Manejar creación individual o múltiple
    if (body.estudiantes) {
      // Importación masiva
      const { estudiantes } = body

      if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
        return NextResponse.json(
          { error: 'Se requiere un array de estudiantes' },
          { status: 400 }
        )
      }

      // Validar que todos los estudiantes tengan los campos requeridos
      for (const estudiante of estudiantes) {
        if (!estudiante.cedula || !estudiante.nombreCompleto || !estudiante.email || !estudiante.materiaId) {
          return NextResponse.json(
            { error: 'Todos los estudiantes deben tener cedula, nombreCompleto, email y materiaId' },
            { status: 400 }
          )
        }
      }

      // Crear estudiantes usando createMany para mejor performance
      const result = await prisma.estudiante.createMany({
        data: estudiantes,
        skipDuplicates: true // Evita errores por duplicados
      })

      return NextResponse.json({
        message: `${result.count} estudiantes creados exitosamente`,
        count: result.count
      }, { status: 201 })

    } else {
      // Creación individual
      const { cedula, nombreCompleto, email, materiaId } = body

      if (!cedula || !nombreCompleto || !email || !materiaId) {
        return NextResponse.json(
          { error: 'cedula, nombreCompleto, email y materiaId son requeridos' },
          { status: 400 }
        )
      }

      const estudiante = await prisma.estudiante.create({
        data: {
          cedula,
          nombreCompleto,
          email,
          materiaId
        },
        include: {
          materia: true
        }
      })

      return NextResponse.json(estudiante, { status: 201 })
    }

  } catch (error) {
    console.error('Error al crear estudiante(s):', error)

    // Manejar error de duplicados
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Ya existe un estudiante con esta cédula en la materia seleccionada' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}