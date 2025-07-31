import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profesorId = searchParams.get('profesorId')

    if (!profesorId) {
      return NextResponse.json(
        { error: 'profesorId es requerido' },
        { status: 400 }
      )
    }

    const materias = await prisma.materia.findMany({
      where: { profesorId },
      include: {
        _count: {
          select: { estudiantes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transformar para incluir totalEstudiantes
    const materiasWithStats = materias.map(materia => ({
      ...materia,
      totalEstudiantes: materia._count.estudiantes
    }))

    return NextResponse.json(materiasWithStats)

  } catch (error) {
    console.error('Error al obtener materias:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre, codigo, descripcion, activa, profesorId } = await request.json()

    if (!nombre || !codigo || !profesorId) {
      return NextResponse.json(
        { error: 'Nombre, código y profesorId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe globalmente (no solo para este profesor)
    const existingMateria = await prisma.materia.findUnique({
      where: { codigo }
    })

    if (existingMateria) {
      return NextResponse.json(
        { error: 'Ya existe una materia con este código en el sistema' },
        { status: 409 }
      )
    }

    const materia = await prisma.materia.create({
      data: {
        nombre,
        codigo,
        descripcion,
        activa: activa ?? true,
        profesorId
      }
    })

    return NextResponse.json(materia, { status: 201 })

  } catch (error) {
    console.error('Error al crear materia:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}