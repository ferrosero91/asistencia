import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profesorId = searchParams.get('profesorId')
    const materiaId = searchParams.get('materiaId')
    const fecha = searchParams.get('fecha')

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

    if (fecha) {
      where.fecha = new Date(fecha)
    }

    const asistencias = await prisma.asistencia.findMany({
      where,
      include: {
        estudiante: true,
        materia: true
      },
      orderBy: { fecha: 'desc' }
    })

    return NextResponse.json(asistencias)

  } catch (error) {
    console.error('Error al obtener asistencias:', error)
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
    if (body.asistencias) {
      // Creación masiva (toma de asistencia de toda la clase)
      const { asistencias } = body

      if (!Array.isArray(asistencias) || asistencias.length === 0) {
        return NextResponse.json(
          { error: 'Se requiere un array de asistencias' },
          { status: 400 }
        )
      }

      // Validar que todas las asistencias tengan los campos requeridos
      for (const asistencia of asistencias) {
        if (!asistencia.estudianteId || !asistencia.materiaId || !asistencia.fecha || !asistencia.estado) {
          return NextResponse.json(
            { error: 'Todas las asistencias deben tener estudianteId, materiaId, fecha y estado' },
            { status: 400 }
          )
        }
      }

      // Crear o actualizar asistencias
      const results = []
      for (const asistenciaData of asistencias) {
        const asistencia = await prisma.asistencia.upsert({
          where: {
            estudianteId_materiaId_fecha: {
              estudianteId: asistenciaData.estudianteId,
              materiaId: asistenciaData.materiaId,
              fecha: new Date(asistenciaData.fecha)
            }
          },
          update: {
            estado: asistenciaData.estado,
            observaciones: asistenciaData.observaciones
          },
          create: {
            estudianteId: asistenciaData.estudianteId,
            materiaId: asistenciaData.materiaId,
            fecha: new Date(asistenciaData.fecha),
            estado: asistenciaData.estado,
            observaciones: asistenciaData.observaciones
          },
          include: {
            estudiante: true,
            materia: true
          }
        })
        results.push(asistencia)
      }

      return NextResponse.json({
        message: `${results.length} asistencias guardadas exitosamente`,
        asistencias: results
      }, { status: 201 })

    } else {
      // Creación individual
      const { estudianteId, materiaId, fecha, estado, observaciones } = body

      if (!estudianteId || !materiaId || !fecha || !estado) {
        return NextResponse.json(
          { error: 'estudianteId, materiaId, fecha y estado son requeridos' },
          { status: 400 }
        )
      }

      const asistencia = await prisma.asistencia.upsert({
        where: {
          estudianteId_materiaId_fecha: {
            estudianteId,
            materiaId,
            fecha: new Date(fecha)
          }
        },
        update: {
          estado,
          observaciones
        },
        create: {
          estudianteId,
          materiaId,
          fecha: new Date(fecha),
          estado,
          observaciones
        },
        include: {
          estudiante: true,
          materia: true
        }
      })

      return NextResponse.json(asistencia, { status: 201 })
    }

  } catch (error) {
    console.error('Error al crear/actualizar asistencia(s):', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}