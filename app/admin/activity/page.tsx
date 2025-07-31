"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Activity, 
  Home, 
  Search, 
  Filter,
  Users,
  BookOpen,
  Calendar,
  FileText,
  UserPlus,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import Link from "next/link"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Header } from "@/components/layout/header"

interface ActivityLog {
  id: string
  usuario: string
  accion: string
  tipo: 'LOGIN' | 'MATERIA' | 'ESTUDIANTE' | 'ASISTENCIA' | 'REPORTE' | 'USUARIO'
  descripcion: string
  fecha: string
  ip?: string
  detalles?: any
}

function AdminActivityContent() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("ALL")
  const [filterDate, setFilterDate] = useState("")
  const [activityStats, setActivityStats] = useState({
    total: 0,
    login: 0,
    materias: 0,
    estudiantes: 0,
    asistencias: 0,
    reportes: 0,
    usuarios: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
        setCurrentUser(user)

        if (user.role !== 'SUPER_ADMIN') {
          window.location.href = '/'
          return
        }

        // Cargar actividad real del sistema
        await loadActivities(user.id)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadActivities = async (adminId: string) => {
    try {
      const params = new URLSearchParams({ adminId })
      if (filterType !== 'ALL') params.append('tipo', filterType)
      if (filterDate) params.append('fecha', filterDate)
      if (searchTerm) params.append('usuario', searchTerm)

      const response = await fetch(`/api/admin/activity?${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
        setActivityStats(data.estadisticas)
        setFilteredActivities(data.activities)
      } else {
        console.error('Error loading activities')
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    if (currentUser && currentUser.id) {
      loadActivities(currentUser.id)
    }
  }, [filterType, filterDate, searchTerm])

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case 'LOGIN': return <Users className="h-4 w-4" />
      case 'MATERIA': return <BookOpen className="h-4 w-4" />
      case 'ESTUDIANTE': return <Users className="h-4 w-4" />
      case 'ASISTENCIA': return <Calendar className="h-4 w-4" />
      case 'REPORTE': return <FileText className="h-4 w-4" />
      case 'USUARIO': return <UserPlus className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (tipo: string) => {
    switch (tipo) {
      case 'LOGIN': return 'bg-blue-100 text-blue-800'
      case 'MATERIA': return 'bg-green-100 text-green-800'
      case 'ESTUDIANTE': return 'bg-purple-100 text-purple-800'
      case 'ASISTENCIA': return 'bg-orange-100 text-orange-800'
      case 'REPORTE': return 'bg-yellow-100 text-yellow-800'
      case 'USUARIO': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Hace un momento'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aunar-gold mx-auto mb-4"></div>
          <p className="text-aunar-navy">Cargando actividad del sistema...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aunar-navy mb-2">Actividad del Sistema</h1>
            <p className="text-aunar-light-navy">Monitoreo en tiempo real de la actividad de usuarios</p>
          </div>
          <Link href="/admin">
            <Button
              variant="outline"
              className="border-aunar-navy text-aunar-navy hover:bg-aunar-navy hover:text-white bg-transparent"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard Admin
            </Button>
          </Link>
        </div>

        {/* Estadísticas de actividad */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{activityStats.total}</div>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{activityStats.login}</div>
              <p className="text-xs text-gray-600">Logins</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{activityStats.materias}</div>
              <p className="text-xs text-gray-600">Materias</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{activityStats.estudiantes}</div>
              <p className="text-xs text-gray-600">Estudiantes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{activityStats.asistencias}</div>
              <p className="text-xs text-gray-600">Asistencias</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{activityStats.reportes}</div>
              <p className="text-xs text-gray-600">Reportes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{activityStats.usuarios}</div>
              <p className="text-xs text-gray-600">Usuarios</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-aunar-navy">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                  <Input
                    placeholder="Buscar por usuario, acción o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-aunar-light-navy focus:border-aunar-navy"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block text-aunar-navy">Tipo de Actividad</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="border-aunar-light-navy focus:border-aunar-navy">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los tipos</SelectItem>
                    <SelectItem value="LOGIN">Inicios de sesión</SelectItem>
                    <SelectItem value="MATERIA">Materias</SelectItem>
                    <SelectItem value="ESTUDIANTE">Estudiantes</SelectItem>
                    <SelectItem value="ASISTENCIA">Asistencias</SelectItem>
                    <SelectItem value="REPORTE">Reportes</SelectItem>
                    <SelectItem value="USUARIO">Usuarios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-aunar-navy">Fecha</label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border-aunar-light-navy focus:border-aunar-navy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log de actividad */}
        <Card className="border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-gold to-yellow-400 text-aunar-navy">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Registro de Actividad
            </CardTitle>
            <CardDescription className="text-aunar-dark-navy">
              {filteredActivities.length} actividades encontradas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.tipo)}`}>
                      {getActivityIcon(activity.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-aunar-navy">{activity.usuario}</h3>
                        <span className="text-xs text-aunar-light-navy">{formatDate(activity.fecha)}</span>
                      </div>
                      
                      <p className="text-sm text-aunar-navy mb-2">
                        <span className="font-medium">{activity.accion}</span> - {activity.descripcion}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getActivityColor(activity.tipo)}>
                          {activity.tipo}
                        </Badge>
                        
                        {activity.ip && (
                          <Badge variant="outline" className="text-xs">
                            IP: {activity.ip}
                          </Badge>
                        )}
                        
                        {activity.detalles && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-aunar-light-navy hover:text-aunar-navy"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver detalles
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-aunar-navy mb-2">No se encontró actividad</h3>
                <p className="text-aunar-light-navy">Ajusta los filtros para ver más resultados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminActivityPage() {
  return (
    <AdminGuard>
      <AdminActivityContent />
    </AdminGuard>
  )
}