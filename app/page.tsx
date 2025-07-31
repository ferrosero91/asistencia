"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Calendar, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"

interface Stats {
  totalMaterias: number
  totalEstudiantes: number
  asistenciasHoy: number
  materiasActivas: number
}

function DashboardContent() {
  const [stats, setStats] = useState<Stats>({
    totalMaterias: 0,
    totalEstudiantes: 0,
    asistenciasHoy: 0,
    materiasActivas: 0,
  })
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Cargar usuario actual
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
        setCurrentUser(user)

        if (!user.id) return

        // Cargar materias del profesor
        const materiasResponse = await fetch(`/api/materias?profesorId=${user.id}`)
        const materias = await materiasResponse.json()

        // Cargar estudiantes del profesor
        const estudiantesResponse = await fetch(`/api/estudiantes?profesorId=${user.id}`)
        const estudiantes = await estudiantesResponse.json()

        // Cargar asistencias de hoy
        const today = new Date().toISOString().split("T")[0]
        const asistenciasResponse = await fetch(`/api/asistencias?profesorId=${user.id}&fecha=${today}`)
        const asistenciasHoy = await asistenciasResponse.json()

        setStats({
          totalMaterias: materias.length,
          totalEstudiantes: estudiantes.length,
          asistenciasHoy: asistenciasHoy.length,
          materiasActivas: materias.filter((m: any) => m.activa).length,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-aunar-navy mb-2">
            Bienvenido, {currentUser?.nombre} {currentUser?.apellido}
          </h1>
          <p className="text-aunar-light-navy">Gestiona la asistencia de tus estudiantes de manera eficiente</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-aunar-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Mis Materias</CardTitle>
              <BookOpen className="h-4 w-4 text-aunar-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.totalMaterias}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-aunar-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Mis Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-aunar-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.totalEstudiantes}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-aunar-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Asistencias Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-aunar-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.asistenciasHoy}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-aunar-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Materias Activas</CardTitle>
              <FileText className="h-4 w-4 text-aunar-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{stats.materiasActivas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-aunar-light-navy/20">
            <Link href="/materias">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Gestión de Materias
                </CardTitle>
                <CardDescription className="text-aunar-gold">Crear y administrar tus materias</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button className="w-full bg-aunar-navy hover:bg-aunar-dark-navy">
                  <Plus className="h-4 w-4 mr-2" />
                  Gestionar Materias
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-aunar-light-navy/20">
            <Link href="/estudiantes">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Carga de Estudiantes
                </CardTitle>
                <CardDescription className="text-aunar-gold">Importar estudiantes desde Excel</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button className="w-full bg-aunar-navy hover:bg-aunar-dark-navy">
                  <Plus className="h-4 w-4 mr-2" />
                  Cargar Estudiantes
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-aunar-light-navy/20">
            <Link href="/asistencia">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tomar Asistencia
                </CardTitle>
                <CardDescription className="text-aunar-gold">Marcar asistencia por fecha</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button className="w-full bg-aunar-navy hover:bg-aunar-dark-navy">
                  <Plus className="h-4 w-4 mr-2" />
                  Tomar Asistencia
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-aunar-light-navy/20">
            <Link href="/reportes">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reportes
                </CardTitle>
                <CardDescription className="text-aunar-gold">Ver historial y estadísticas</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Button className="w-full bg-aunar-navy hover:bg-aunar-dark-navy">
                  <Plus className="h-4 w-4 mr-2" />
                  Ver Reportes
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
