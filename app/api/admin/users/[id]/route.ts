import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminId, userData } = await request.json()
    const { id } = params

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

    // Verificar que el usuario a editar existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir editar otros super admins
    if (existingUser.role === 'SUPER_ADMIN' && existingUser.id !== admin.id) {
      return NextResponse.json(
        { error: 'No puedes editar otros super administradores' },
        { status: 403 }
      )
    }

    // Preparar datos para actualizar
    const updateData: any = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      telefono: userData.telefono,
      departamento: userData.departamento,
      activo: userData.activo
    }

    // Si se proporciona una nueva contraseña, hashearla
    if (userData.password && userData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(userData.password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Remover contraseña de la respuesta
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)

  } catch (error) {
    console.error('Error al actualizar usuario:', error)
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
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const { id } = params

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

    // Verificar que el usuario a eliminar existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar super admins
    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No puedes eliminar super administradores' },
        { status: 403 }
      )
    }

    // No permitir eliminarse a sí mismo
    if (existingUser.id === admin.id) {
      return NextResponse.json(
        { error: 'No puedes eliminarte a ti mismo' },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' })

  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}