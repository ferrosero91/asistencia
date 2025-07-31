import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { cedula, nombreCompleto, email, materiaId } = await request.json()

    if (!cedula || !nombreCompleto || !email || !materiaId) {
      return NextResponse.json(
        { error: 'cedula, nombreCompleto, email y materiaId son requeridos' },
        { status: 400 }
      )
    }

    const estudiante = await prisma.estudiante.update({
      where: { id },
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

    return NextResponse.json(estudiante)

  } catch (error) {
    console.error('Error al actualizar estudiante:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.estudiante.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Estudiante eliminado exitosamente' })

  } catch (error) {
    console.error('Error al eliminar estudiante:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}