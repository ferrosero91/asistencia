"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Download, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Home,
  BarChart3,
  Activity
} from "lucide-react"
import Link from "next/link"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Header } from "@/components/layout/header"

interface SystemReport {
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
  estadisticasPorDepartamento: Array<{
    departamento: string
    profesores: number
    materias: number
    estudiantes: number
    asistencias: number
  }>
}

function AdminReportsContent() {
  const [report, setReport] = useState<SystemReport | null>(null)
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

        // Cargar estadísticas del sistema
        const response = await fetch(`/api/admin/stats?adminId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          
          // Los datos ya incluyen estadísticas por departamento desde la API
          setReport(data)
        } else {
          console.error('Error loading system report')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const exportSystemReport = () => {
    if (!report) return

    const csvContent = [
      "Reporte del Sistema - Universidad Autónoma de Nariño",
      "",
      "RESUMEN GENERAL",
      `Total Profesores,${report.resumenGeneral.totalUsuarios}`,
      `Profesores Activos,${report.resumenGeneral.usuariosActivos}`,
      `Profesores Inactivos,${report.resumenGeneral.usuariosInactivos}`,
      `Total Materias,${report.resumenGeneral.totalMaterias}`,
      `Materias Activas,${report.resumenGeneral.materiasActivas}`,
      `Total Estudiantes,${report.resumenGeneral.totalEstudiantes}`,
      `Total Asistencias,${report.resumenGeneral.totalAsistencias}`,
      `Asistencias Hoy,${report.resumenGeneral.asistenciasHoy}`,
      "",
      "TOP PROFESORES MÁS ACTIVOS",
      "Nombre,Departamento,Total Asistencias,Total Materias",
      ...report.topProfesores.map(p => 
        `${p.nombre},${p.departamento},${p.totalAsistencias},${p.totalMaterias}`
      ),
      "",
      "ESTADÍSTICAS POR DEPARTAMENTO",
      "Departamento,Profesores,Materias,Estudiantes,Asistencias",
      ...report.estadisticasPorDepartamento.map(d => 
        `${d.departamento},${d.profesores},${d.materias},${d.estudiantes},${d.asistencias}`
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte_sistema_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aunar-gold mx-auto mb-4"></div>
          <p className="text-aunar-navy">Cargando reportes del sistema...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error al cargar los reportes</p>
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
            <h1 className="text-3xl font-bold text-aunar-navy mb-2">Reportes del Sistema</h1>
            <p className="text-aunar-light-navy">Estadísticas y análisis completo del sistema</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button
                variant="outline"
                className="border-aunar-navy text-aunar-navy hover:bg-aunar-navy hover:text-white bg-transparent"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard Admin
              </Button>
            </Link>
            <Button
              onClick={exportSystemReport}
              className="bg-aunar-gold hover:bg-yellow-600 text-aunar-navy"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte
            </Button>
          </div>
        </div>

        {/* Resumen ejecutivo */}
        <Card className="mb-8 border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen Ejecutivo
            </CardTitle>
            <CardDescription className="text-aunar-gold">
              Estadísticas generales del sistema de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-aunar-navy mb-2">
                  {report.resumenGeneral.totalUsuarios}
                </div>
                <p className="text-sm text-aunar-light-navy">Total Profesores</p>
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800 mr-1">
                    {report.resumenGeneral.usuariosActivos} activos
                  </Badge>
                  <Badge variant="secondary">
                    {report.resumenGeneral.usuariosInactivos} inactivos
                  </Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-aunar-navy mb-2">
                  {report.resumenGeneral.totalMaterias}
                </div>
                <p className="text-sm text-aunar-light-navy">Total Materias</p>
                <div className="mt-2">
                  <Progress 
                    value={(report.resumenGeneral.materiasActivas / report.resumenGeneral.totalMaterias) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-aunar-light-navy mt-1">
                    {report.resumenGeneral.materiasActivas} activas
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-aunar-navy mb-2">
                  {report.resumenGeneral.totalEstudiantes}
                </div>
                <p className="text-sm text-aunar-light-navy">Total Estudiantes</p>
                <p className="text-xs text-aunar-light-navy mt-2">
                  Registrados en el sistema
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-aunar-navy mb-2">
                  {report.resumenGeneral.totalAsistencias}
                </div>
                <p className="text-sm text-aunar-light-navy">Total Asistencias</p>
                <div className="mt-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {report.resumenGeneral.asistenciasHoy} hoy
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas por departamento */}
        <Card className="mb-8 border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-gold to-yellow-400 text-aunar-navy">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Estadísticas por Departamento
            </CardTitle>
            <CardDescription className="text-aunar-dark-navy">
              Distribución de recursos por departamento académico
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-aunar-navy/5">
                  <TableHead className="text-aunar-navy">Departamento</TableHead>
                  <TableHead className="text-aunar-navy">Profesores</TableHead>
                  <TableHead className="text-aunar-navy">Materias</TableHead>
                  <TableHead className="text-aunar-navy">Estudiantes</TableHead>
                  <TableHead className="text-aunar-navy">Asistencias</TableHead>
                  <TableHead className="text-aunar-navy">Promedio Asist/Prof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.estadisticasPorDepartamento.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-aunar-navy">{dept.departamento}</TableCell>
                    <TableCell className="text-aunar-navy">{dept.profesores}</TableCell>
                    <TableCell className="text-aunar-navy">{dept.materias}</TableCell>
                    <TableCell className="text-aunar-navy">{dept.estudiantes}</TableCell>
                    <TableCell className="text-aunar-navy">{dept.asistencias}</TableCell>
                    <TableCell className="text-aunar-navy">
                      {Math.round(dept.asistencias / dept.profesores)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top profesores más activos */}
        <Card className="mb-8 border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profesores Más Activos
            </CardTitle>
            <CardDescription className="text-green-100">
              Ranking de profesores por actividad en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {report.topProfesores.map((profesor, index) => (
                <div key={profesor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-aunar-navy'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-aunar-navy">{profesor.nombre}</h3>
                      <p className="text-sm text-aunar-light-navy">{profesor.departamento}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-aunar-navy">{profesor.totalAsistencias}</div>
                    <p className="text-xs text-aunar-light-navy">
                      {profesor.totalMaterias} materias • {Math.round(profesor.totalAsistencias / profesor.totalMaterias)} prom/materia
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendencias de registro */}
        <Card className="border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tendencias de Registro
            </CardTitle>
            <CardDescription className="text-purple-100">
              Registros de profesores en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {report.registrosPorMes.map((mes, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-aunar-navy font-medium">{mes.mes}</span>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <Progress value={(mes.registros / 10) * 100} className="flex-1" />
                    <span className="text-aunar-navy font-bold w-8">{mes.registros}</span>
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

export default function AdminReportsPage() {
  return (
    <AdminGuard>
      <AdminReportsContent />
    </AdminGuard>
  )
}