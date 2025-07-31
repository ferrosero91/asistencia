// Funciones de utilidad para llamadas a la API

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiCall(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Error en la API')
  }

  return data
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: {
    nombre: string
    apellido: string
    email: string
    telefono?: string
    departamento?: string
    password: string
  }) => {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },
}

// Materias API
export const materiasApi = {
  getAll: async (profesorId: string) => {
    return apiCall(`/api/materias?profesorId=${profesorId}`)
  },

  create: async (materiaData: {
    nombre: string
    codigo: string
    descripcion?: string
    activa?: boolean
    profesorId: string
  }) => {
    return apiCall('/api/materias', {
      method: 'POST',
      body: JSON.stringify(materiaData),
    })
  },

  update: async (id: string, materiaData: {
    nombre: string
    codigo: string
    descripcion?: string
    activa?: boolean
  }) => {
    return apiCall(`/api/materias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materiaData),
    })
  },

  delete: async (id: string) => {
    return apiCall(`/api/materias/${id}`, {
      method: 'DELETE',
    })
  },
}

// Estudiantes API
export const estudiantesApi = {
  getAll: async (profesorId: string, materiaId?: string) => {
    const params = new URLSearchParams({ profesorId })
    if (materiaId) params.append('materiaId', materiaId)
    return apiCall(`/api/estudiantes?${params}`)
  },

  createMany: async (estudiantes: Array<{
    cedula: string
    nombreCompleto: string
    email: string
    materiaId: string
  }>) => {
    return apiCall('/api/estudiantes', {
      method: 'POST',
      body: JSON.stringify({ estudiantes }),
    })
  },

  delete: async (id: string) => {
    return apiCall(`/api/estudiantes/${id}`, {
      method: 'DELETE',
    })
  },
}

// Asistencias API
export const asistenciasApi = {
  getAll: async (profesorId: string, filters?: {
    materiaId?: string
    fecha?: string
    fechaInicio?: string
    fechaFin?: string
  }) => {
    const params = new URLSearchParams({ profesorId })
    if (filters?.materiaId) params.append('materiaId', filters.materiaId)
    if (filters?.fecha) params.append('fecha', filters.fecha)
    if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio)
    if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin)
    return apiCall(`/api/asistencias?${params}`)
  },

  saveMany: async (asistencias: Array<{
    estudianteId: string
    materiaId: string
    fecha: string
    estado: 'presente' | 'ausente' | 'justificado'
    observaciones?: string
  }>) => {
    return apiCall('/api/asistencias', {
      method: 'POST',
      body: JSON.stringify({ asistencias }),
    })
  },
}