import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { nombre, codigo, descripcion, activa } = await request.json()
    const { id } = params

    if (!nombre || !codigo) {
      return NextResponse.json(
        { error: 'Nombre y código son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si la materia existe
    const existingMateria = await prisma.materia.findUnique({
      where: { id }
    })

    if (!existingMateria) {
      return NextResponse.json(
        { error: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si el código ya existe para otro registro (globalmente)
    const duplicateMateria = await prisma.materia.findFirst({
      where: { 
        codigo,
        NOT: { id }
      }
    })

    if (duplicateMateria) {
      return NextResponse.json(
        { error: 'Ya existe una materia con este código en el sistema' },
        { status: 409 }
      )
    }

    const materia = await prisma.materia.update({
      where: { id },
      data: {
        nombre,
        codigo,
        descripcion,
        activa
      }
    })

    return NextResponse.json(materia)

  } catch (error) {
    console.error('Error al actualizar materia:', error)
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

    // Verificar si la materia existe
    const existingMateria = await prisma.materia.findUnique({
      where: { id }
    })

    if (!existingMateria) {
      return NextResponse.json(
        { error: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    await prisma.materia.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Materia eliminada exitosamente' })

  } catch (error) {
    console.error('Error al eliminar materia:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}