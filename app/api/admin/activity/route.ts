import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const tipo = searchParams.get('tipo')
    const fecha = searchParams.get('fecha')
    const usuario = searchParams.get('usuario')

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

    // Obtener actividad reciente del sistema basada en datos reales
    const activities = []

    // 1. Obtener usuarios registrados recientemente
    const usuariosRecientes = await prisma.user.findMany({
      where: { 
        role: 'PROFESOR',
        fechaRegistro: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      orderBy: { fechaRegistro: 'desc' },
      take: 10
    })

    usuariosRecientes.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        usuario: 'Super Administrador',
        accion: 'Registro de usuario',
        tipo: 'USUARIO',
        descripcion: `Se registró el profesor ${user.nombre} ${user.apellido}`,
        fecha: user.fechaRegistro.toISOString(),
        detalles: {
          nuevoUsuario: `${user.nombre} ${user.apellido}`,
          email: user.email,
          departamento: user.departamento
        }
      })
    })

    // 2. Obtener materias creadas recientemente
    const materiasRecientes = await prisma.materia.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        profesor: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    materiasRecientes.forEach(materia => {
      activities.push({
        id: `materia-${materia.id}`,
        usuario: `${materia.profesor.nombre} ${materia.profesor.apellido}`,
        accion: 'Creó materia',
        tipo: 'MATERIA',
        descripcion: `Creó la materia '${materia.nombre}' (${materia.codigo})`,
        fecha: materia.createdAt.toISOString(),
        detalles: {
          materia: materia.nombre,
          codigo: materia.codigo,
          activa: materia.activa
        }
      })
    })

    // 3. Obtener estudiantes cargados recientemente
    const estudiantesRecientes = await prisma.estudiante.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        materia: {
          include: {
            profesor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    })

    // Agrupar estudiantes por profesor y fecha de carga
    const estudiantesPorCarga = estudiantesRecientes.reduce((acc, estudiante) => {
      const key = `${estudiante.materia.profesorId}-${estudiante.createdAt.toDateString()}`
      if (!acc[key]) {
        acc[key] = {
          profesor: estudiante.materia.profesor,
          fecha: estudiante.createdAt,
          estudiantes: []
        }
      }
      acc[key].estudiantes.push(estudiante)
      return acc
    }, {} as any)

    Object.values(estudiantesPorCarga).forEach((carga: any) => {
      activities.push({
        id: `estudiantes-${carga.profesor.id}-${carga.fecha.getTime()}`,
        usuario: `${carga.profesor.nombre} ${carga.profesor.apellido}`,
        accion: 'Cargó estudiantes',
        tipo: 'ESTUDIANTE',
        descripcion: `Importó ${carga.estudiantes.length} estudiantes`,
        fecha: carga.fecha.toISOString(),
        detalles: {
          cantidad: carga.estudiantes.length,
          materia: carga.estudiantes[0].materia.nombre
        }
      })
    })

    // 4. Obtener asistencias tomadas recientemente
    const asistenciasRecientes = await prisma.asistencia.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        materia: {
          include: {
            profesor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Agrupar asistencias por profesor, materia y fecha
    const asistenciasPorToma = asistenciasRecientes.reduce((acc, asistencia) => {
      const fechaStr = asistencia.fecha.toISOString().split('T')[0]
      const key = `${asistencia.materia.profesorId}-${asistencia.materiaId}-${fechaStr}`
      if (!acc[key]) {
        acc[key] = {
          profesor: asistencia.materia.profesor,
          materia: asistencia.materia,
          fecha: asistencia.fecha,
          createdAt: asistencia.createdAt,
          asistencias: []
        }
      }
      acc[key].asistencias.push(asistencia)
      return acc
    }, {} as any)

    Object.values(asistenciasPorToma).forEach((toma: any) => {
      const presentes = toma.asistencias.filter((a: any) => a.estado === 'presente').length
      const ausentes = toma.asistencias.filter((a: any) => a.estado === 'ausente').length
      const justificados = toma.asistencias.filter((a: any) => a.estado === 'justificado').length

      activities.push({
        id: `asistencia-${toma.profesor.id}-${toma.materia.id}-${toma.fecha.getTime()}`,
        usuario: `${toma.profesor.nombre} ${toma.profesor.apellido}`,
        accion: 'Tomó asistencia',
        tipo: 'ASISTENCIA',
        descripcion: `Registró asistencia para ${toma.materia.nombre} - ${toma.asistencias.length} estudiantes`,
        fecha: toma.createdAt.toISOString(),
        detalles: {
          materia: toma.materia.nombre,
          estudiantes: toma.asistencias.length,
          presentes,
          ausentes,
          justificados,
          fechaClase: toma.fecha.toISOString().split('T')[0]
        }
      })
    })

    // Ordenar todas las actividades por fecha (más recientes primero)
    const actividadesOrdenadas = activities.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )

    // Aplicar filtros si se proporcionan
    let actividadesFiltradas = actividadesOrdenadas

    if (tipo && tipo !== 'ALL') {
      actividadesFiltradas = actividadesFiltradas.filter(a => a.tipo === tipo)
    }

    if (fecha) {
      actividadesFiltradas = actividadesFiltradas.filter(a => 
        a.fecha.split('T')[0] === fecha
      )
    }

    if (usuario) {
      actividadesFiltradas = actividadesFiltradas.filter(a => 
        a.usuario.toLowerCase().includes(usuario.toLowerCase())
      )
    }

    // Limitar a los últimos 100 registros para performance
    const actividadesLimitadas = actividadesFiltradas.slice(0, 100)

    // Calcular estadísticas de actividad
    const estadisticas = {
      total: actividadesLimitadas.length,
      login: 0, // No tenemos datos de login en la BD actualmente
      materias: actividadesLimitadas.filter(a => a.tipo === 'MATERIA').length,
      estudiantes: actividadesLimitadas.filter(a => a.tipo === 'ESTUDIANTE').length,
      asistencias: actividadesLimitadas.filter(a => a.tipo === 'ASISTENCIA').length,
      reportes: 0, // No tenemos datos de reportes en la BD actualmente
      usuarios: actividadesLimitadas.filter(a => a.tipo === 'USUARIO').length,
    }

    return NextResponse.json({
      activities: actividadesLimitadas,
      estadisticas
    })

  } catch (error) {
    console.error('Error al obtener actividad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}