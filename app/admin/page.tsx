"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Calendar, FileText, UserCheck, UserX, Activity, TrendingUp } from "lucide-react"
import Link from "next/link"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Header } from "@/components/layout/header"

interface AdminStats {
  resumenGeneral: {
    totalUsuarios: number
    usuariosActivos: number
    usuariosInactivos: number
    totalMaterias: number
    materiasActivas: number
    totalEstudiantes: number
    totalAsistencias: number
    asistenciasHoy: number
  }
  registrosPorMes: Array<{
    mes: string
    registros: number
  }>
  topProfesores: Array<{
    id: string
    nombre: string
    departamento: string
    totalAsistencias: number
    totalMaterias: number
  }>
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
        setCurrentUser(user)

        if (user.role !== 'SUPER_ADMIN') {
          window.location.href = '/'
          return
        }

        const response = await fetch(`/api/admin/stats?adminId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('Error loading admin stats')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aunar-gold mx-auto mb-4"></div>
          <p className="text-aunar-navy">Cargando dashboard administrativo...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error al cargar las estadísticas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-aunar-navy mb-2">
            Panel de Administración
          </h1>
          <p className="text-aunar-light-navy">Gestión y monitoreo del sistema de asistencia</p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Total Profesores</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.resumenGeneral.totalUsuarios}</div>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-green-100 text-green-800">
                  Activos: {stats.resumenGeneral.usuariosActivos}
                </Badge>
                <Badge variant="secondary">
                  Inactivos: {stats.resumenGeneral.usuariosInactivos}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-aunar-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Materias</CardTitle>
              <BookOpen className="h-4 w-4 text-aunar-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.resumenGeneral.totalMaterias}</div>
              <p className="text-xs text-aunar-light-navy">
                {stats.resumenGeneral.materiasActivas} activas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Estudiantes</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.resumenGeneral.totalEstudiantes}</div>
              <p className="text-xs text-aunar-light-navy">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Asistencias</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.resumenGeneral.totalAsistencias}</div>
              <p className="text-xs text-aunar-light-navy">
                {stats.resumenGeneral.asistenciasHoy} registradas hoy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-aunar-light-navy/20">
            <Link href="/admin/users">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription className="text-aunar-gold">
                  Administrar profesores del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button className="w-full bg-aunar-navy hover:bg-aunar-dark-navy">
                  Gestionar Usuarios
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-aunar-light-navy/20">
            <Link href="/admin/reports">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reportes del Sistema
                </CardTitle>
                <CardDescription className="text-aunar-gold">
                  Estadísticas y reportes generales
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button className="w-full bg-aunar-navy hover:bg-aunar-dark-navy">
                  Ver Reportes
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-aunar-light-navy/20">
            <Link href="/admin/activity">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad del Sistema
                </CardTitle>
                <CardDescription className="text-aunar-gold">
                  Monitoreo de actividad en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button className="w-full bg-aunar-navy hover:bg-aunar-dark-navy">
                  Ver Actividad
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Top profesores más activos */}
        <Card className="border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profesores Más Activos
            </CardTitle>
            <CardDescription className="text-aunar-gold">
              Top 5 profesores por asistencias registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats.topProfesores.map((profesor, index) => (
                <div key={profesor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-aunar-navy text-white rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-aunar-navy">{profesor.nombre}</h3>
                      <p className="text-sm text-aunar-light-navy">{profesor.departamento}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-aunar-navy">{profesor.totalAsistencias}</div>
                    <p className="text-xs text-aunar-light-navy">{profesor.totalMaterias} materias</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}