import { User, Materia as PrismaMateria, Estudiante as PrismaEstudiante, Asistencia as PrismaAsistencia, EstadoAsistencia } from '@prisma/client'

// Tipos base de Prisma
export type AppUser = User
export type Materia = PrismaMateria
export type Estudiante = PrismaEstudiante
export type Asistencia = PrismaAsistencia
export type { EstadoAsistencia }

// Tipos extendidos para la UI
export interface MateriaWithStats extends Materia {
  totalEstudiantes: number
}

export interface EstudianteWithMateria extends Estudiante {
  materia: Materia
}

export interface AsistenciaWithRelations extends Asistencia {
  estudiante: Estudiante
  materia: Materia
}

// Tipos para reportes
export interface EstudianteReporte {
  estudiante: Estudiante
  totalClases: number
  presentes: number
  ausentes: number
  justificados: number
  porcentajeAsistencia: number
}

// Tipos para formularios
export interface CreateMateriaData {
  nombre: string
  codigo: string
  descripcion?: string
  activa?: boolean
}

export interface CreateEstudianteData {
  cedula: string
  nombreCompleto: string
  email: string
  materiaId: string
}

export interface CreateAsistenciaData {
  estudianteId: string
  materiaId: string
  fecha: Date
  estado: EstadoAsistencia
  observaciones?: string
}

export interface CreateUserData {
  nombre: string
  apellido: string
  email: string
  telefono?: string
  departamento?: string
  password: string
}
