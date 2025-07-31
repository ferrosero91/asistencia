import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Verificar si ya existe el super admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@aunar.edu.co' }
    })
    
    if (existingAdmin) {
      return NextResponse.json({
        message: 'El super administrador ya existe',
        admin: {
          email: existingAdmin.email,
          role: existingAdmin.role,
          nombre: existingAdmin.nombre,
          apellido: existingAdmin.apellido,
          activo: existingAdmin.activo
        }
      })
    }

    console.log('🌱 Creando super administrador...')

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

    return NextResponse.json({
      success: true,
      message: '🎉 Super Administrador creado exitosamente!',
      admin: {
        email: 'admin@aunar.edu.co',
        password: 'admin123',
        role: 'SUPER_ADMIN',
        nombre: 'Super Administrador',
        id: superAdmin.id
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error al crear super admin:', error)
    return NextResponse.json(
      { 
        error: 'Error al crear el super administrador',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@aunar.edu.co' },
      select: { 
        email: true, 
        role: true, 
        nombre: true, 
        apellido: true,
        activo: true,
        createdAt: true
      }
    })

    if (!admin) {
      return NextResponse.json({
        exists: false,
        message: 'El super administrador no existe'
      })
    }

    return NextResponse.json({
      exists: true,
      message: 'Super administrador encontrado',
      admin: admin
    })

  } catch (error) {
    console.error('Error al verificar admin:', error)
    return NextResponse.json(
      { error: 'Error al verificar el super administrador' },
      { status: 500 }
    )
  }
}