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

    // Obtener estadísticas generales del sistema
    const [
      totalUsuarios,
      usuariosActivos,
      totalMaterias,
      materiasActivas,
      totalEstudiantes,
      totalAsistencias,
      asistenciasHoy
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'PROFESOR' } }),
      prisma.user.count({ where: { role: 'PROFESOR', activo: true } }),
      prisma.materia.count(),
      prisma.materia.count({ where: { activa: true } }),
      prisma.estudiante.count(),
      prisma.asistencia.count(),
      prisma.asistencia.count({
        where: {
          fecha: {
            gte: new Date(new Date().toDateString()), // Desde las 00:00 de hoy
            lt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // Hasta las 23:59 de hoy
          }
        }
      })
    ])

    // Obtener estadísticas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const usuariosPorMes = await prisma.user.groupBy({
      by: ['fechaRegistro'],
      where: {
        role: 'PROFESOR',
        fechaRegistro: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      }
    })

    // Procesar datos por mes
    const registrosPorMes = Array.from({ length: 6 }, (_, i) => {
      const fecha = new Date()
      fecha.setMonth(fecha.getMonth() - i)
      const mes = fecha.toISOString().slice(0, 7) // YYYY-MM
      
      const registros = usuariosPorMes.filter(u => 
        u.fechaRegistro.toISOString().slice(0, 7) === mes
      ).reduce((sum, u) => sum + u._count.id, 0)

      return {
        mes: fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        registros
      }
    }).reverse()

    // Obtener estadísticas por departamento
    const estadisticasPorDepartamento = await prisma.user.groupBy({
      by: ['departamento'],
      where: { 
        role: 'PROFESOR',
        departamento: { not: null }
      },
      _count: {
        id: true
      }
    })

    // Para cada departamento, obtener estadísticas adicionales
    const departamentosConStats = await Promise.all(
      estadisticasPorDepartamento.map(async (dept) => {
        const profesores = await prisma.user.findMany({
          where: { 
            role: 'PROFESOR', 
            departamento: dept.departamento 
          },
          include: {
            materias: {
              include: {
                _count: {
                  select: { 
                    estudiantes: true,
                    asistencias: true
                  }
                }
              }
            }
          }
        })

        const totalMaterias = profesores.reduce((sum, prof) => sum + prof.materias.length, 0)
        const totalEstudiantes = profesores.reduce((sum, prof) => 
          sum + prof.materias.reduce((matSum, mat) => matSum + mat._count.estudiantes, 0), 0
        )
        const totalAsistencias = profesores.reduce((sum, prof) => 
          sum + prof.materias.reduce((matSum, mat) => matSum + mat._count.asistencias, 0), 0
        )

        return {
          departamento: dept.departamento || 'Sin departamento',
          profesores: dept._count.id,
          materias: totalMaterias,
          estudiantes: totalEstudiantes,
          asistencias: totalAsistencias
        }
      })
    )

    // Top 5 profesores más activos (por número de asistencias tomadas)
    const profesoresActivos = await prisma.user.findMany({
      where: { role: 'PROFESOR', activo: true },
      include: {
        materias: {
          include: {
            _count: {
              select: { asistencias: true }
            }
          }
        }
      },
      take: 5
    })

    const topProfesores = profesoresActivos
      .map(profesor => ({
        id: profesor.id,
        nombre: `${profesor.nombre} ${profesor.apellido}`,
        departamento: profesor.departamento,
        totalAsistencias: profesor.materias.reduce((sum, materia) => sum + materia._count.asistencias, 0),
        totalMaterias: profesor.materias.length
      }))
      .sort((a, b) => b.totalAsistencias - a.totalAsistencias)
      .slice(0, 5)

    const stats = {
      resumenGeneral: {
        totalUsuarios,
        usuariosActivos,
        usuariosInactivos: totalUsuarios - usuariosActivos,
        totalMaterias,
        materiasActivas,
        totalEstudiantes,
        totalAsistencias,
        asistenciasHoy
      },
      registrosPorMes,
      topProfesores,
      estadisticasPorDepartamento: departamentosConStats
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}