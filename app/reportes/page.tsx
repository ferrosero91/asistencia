"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, Calendar, Users, BarChart3, Home, FileDown } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"
import { generateAttendanceReportPDF } from "@/lib/pdf-generator"

interface Estudiante {
  id: string
  cedula: string
  nombreCompleto: string
  email: string
  materiaId: string
}

interface Materia {
  id: string
  nombre: string
  codigo: string
  profesorId: string
}

interface Asistencia {
  id: string
  estudianteId: string
  materiaId: string
  fecha: string
  estado: "presente" | "ausente" | "justificado"
  observaciones?: string
}

interface EstudianteReporte {
  estudiante: Estudiante
  totalClases: number
  presentes: number
  ausentes: number
  justificados: number
  porcentajeAsistencia: number
}

function ReportesContent() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [selectedMateria, setSelectedMateria] = useState<string>("")
  const [reporteData, setReporteData] = useState<EstudianteReporte[]>([])
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFin, setFechaFin] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    setCurrentUser(user)
    loadData(user.id)
  }, [])

  useEffect(() => {
    if (selectedMateria) {
      generateReporte()
    }
  }, [selectedMateria, fechaInicio, fechaFin])

  const loadData = async (profesorId: string) => {
    try {
      // Cargar materias del profesor
      const materiasResponse = await fetch(`/api/materias?profesorId=${profesorId}`)
      const materias = await materiasResponse.json()

      // Cargar estudiantes del profesor
      const estudiantesResponse = await fetch(`/api/estudiantes?profesorId=${profesorId}`)
      const estudiantes = await estudiantesResponse.json()

      // Cargar asistencias del profesor
      const asistenciasResponse = await fetch(`/api/asistencias?profesorId=${profesorId}`)
      const asistencias = await asistenciasResponse.json()

      setEstudiantes(estudiantes)
      setMaterias(materias)
      setAsistencias(asistencias)

      // Establecer fechas por defecto (último mes)
      const hoy = new Date()
      const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate())
      setFechaFin(hoy.toISOString().split("T")[0])
      setFechaInicio(haceUnMes.toISOString().split("T")[0])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const generateReporte = () => {
    if (!selectedMateria) return

    const estudiantesMateria = estudiantes.filter((e) => e.materiaId === selectedMateria)
    const asistenciasMateria = asistencias.filter((a) => {
      const fechaAsistencia = new Date(a.fecha).toISOString().split('T')[0]
      const dentroRango = (!fechaInicio || fechaAsistencia >= fechaInicio) && (!fechaFin || fechaAsistencia <= fechaFin)
      return a.materiaId === selectedMateria && dentroRango
    })

    // Obtener fechas únicas de clases
    const fechasClases = [...new Set(asistenciasMateria.map((a) => new Date(a.fecha).toISOString().split('T')[0]))].sort()

    const reporte: EstudianteReporte[] = estudiantesMateria.map((estudiante) => {
      const asistenciasEstudiante = asistenciasMateria.filter((a) => a.estudianteId === estudiante.id)

      const presentes = asistenciasEstudiante.filter((a) => a.estado === "presente").length
      const ausentes = asistenciasEstudiante.filter((a) => a.estado === "ausente").length
      const justificados = asistenciasEstudiante.filter((a) => a.estado === "justificado").length
      const totalClases = fechasClases.length

      const porcentajeAsistencia = totalClases > 0 ? (presentes / totalClases) * 100 : 0

      return {
        estudiante,
        totalClases,
        presentes,
        ausentes,
        justificados,
        porcentajeAsistencia,
      }
    })

    setReporteData(reporte.sort((a, b) => b.porcentajeAsistencia - a.porcentajeAsistencia))
  }

  const exportarReporte = () => {
    if (!selectedMateria || reporteData.length === 0) return

    const materia = materias.find((m) => m.id === selectedMateria)
    const csvContent = [
      "Cédula,Nombre Completo,Email,Total Clases,Presentes,Ausentes,Justificados,% Asistencia",
      ...reporteData.map(
        (item) =>
          `${item.estudiante.cedula},"${item.estudiante.nombreCompleto}",${item.estudiante.email},${item.totalClases},${item.presentes},${item.ausentes},${item.justificados},${item.porcentajeAsistencia.toFixed(2)}%`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte_asistencia_${materia?.codigo}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportarReportePDF = () => {
    if (!selectedMateria || reporteData.length === 0 || !currentUser) return

    const materia = materias.find((m) => m.id === selectedMateria)
    if (!materia) return

    const estadisticas = {
      promedioAsistencia:
        reporteData.length > 0
          ? reporteData.reduce((sum, item) => sum + item.porcentajeAsistencia, 0) / reporteData.length
          : 0,
      estudiantesExcelentes: reporteData.filter((item) => item.porcentajeAsistencia >= 80).length,
      estudiantesRegulares: reporteData.filter(
        (item) => item.porcentajeAsistencia >= 60 && item.porcentajeAsistencia < 80,
      ).length,
      estudiantesDeficientes: reporteData.filter((item) => item.porcentajeAsistencia < 60).length,
    }

    try {
      generateAttendanceReportPDF(materia, currentUser, reporteData, fechaInicio, fechaFin, estadisticas)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el reporte PDF')
    }
  }

  const getAsistenciaColor = (porcentaje: number) => {
    if (porcentaje >= 80) return "text-green-600"
    if (porcentaje >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getAsistenciaBadge = (porcentaje: number) => {
    if (porcentaje >= 80) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>
    if (porcentaje >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>
    return <Badge variant="destructive">Deficiente</Badge>
  }

  const estadisticasGenerales = {
    promedioAsistencia:
      reporteData.length > 0
        ? reporteData.reduce((sum, item) => sum + item.porcentajeAsistencia, 0) / reporteData.length
        : 0,
    estudiantesExcelentes: reporteData.filter((item) => item.porcentajeAsistencia >= 80).length,
    estudiantesRegulares: reporteData.filter(
      (item) => item.porcentajeAsistencia >= 60 && item.porcentajeAsistencia < 80,
    ).length,
    estudiantesDeficientes: reporteData.filter((item) => item.porcentajeAsistencia < 60).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aunar-navy mb-2">Reportes de Asistencia</h1>
            <p className="text-aunar-light-navy">Analiza el historial de asistencia de tus estudiantes</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button
                variant="outline"
                className="border-aunar-navy text-aunar-navy hover:bg-aunar-navy hover:text-white bg-transparent"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button
              onClick={exportarReporte}
              disabled={!selectedMateria || reporteData.length === 0}
              variant="outline"
              className="border-aunar-gold text-aunar-gold hover:bg-aunar-gold hover:text-aunar-navy bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={exportarReportePDF}
              disabled={!selectedMateria || reporteData.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-8 border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Filtros de Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-aunar-navy">Materia</label>
                <Select value={selectedMateria} onValueChange={setSelectedMateria}>
                  <SelectTrigger className="border-aunar-light-navy focus:border-aunar-navy">
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materias.map((materia) => (
                      <SelectItem key={materia.id} value={materia.id}>
                        {materia.nombre} ({materia.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-aunar-navy">Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-aunar-light-navy rounded-md focus:outline-none focus:ring-2 focus:ring-aunar-navy focus:border-aunar-navy"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-aunar-navy">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-aunar-light-navy rounded-md focus:outline-none focus:ring-2 focus:ring-aunar-navy focus:border-aunar-navy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedMateria && reporteData.length > 0 && (
          <>
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-aunar-gold">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-aunar-navy">Promedio General</CardTitle>
                  <BarChart3 className="h-4 w-4 text-aunar-gold" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getAsistenciaColor(estadisticasGenerales.promedioAsistencia)}`}>
                    {estadisticasGenerales.promedioAsistencia.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-aunar-navy">Excelentes (≥80%)</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{estadisticasGenerales.estudiantesExcelentes}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-aunar-navy">Regulares (60-79%)</CardTitle>
                  <Users className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{estadisticasGenerales.estudiantesRegulares}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-aunar-navy">Deficientes ({"<60%"})</CardTitle>
                  <Users className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{estadisticasGenerales.estudiantesDeficientes}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de reporte */}
            <Card className="border-aunar-light-navy/20">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reporte Detallado de Asistencia
                </CardTitle>
                <CardDescription className="text-aunar-gold">
                  {materias.find((m) => m.id === selectedMateria)?.nombre} -
                  {fechaInicio && fechaFin && ` ${fechaInicio} a ${fechaFin}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-aunar-navy/5">
                      <TableHead className="text-aunar-navy">Cédula</TableHead>
                      <TableHead className="text-aunar-navy">Nombre Completo</TableHead>
                      <TableHead className="text-aunar-navy">Email</TableHead>
                      <TableHead className="text-aunar-navy">Total Clases</TableHead>
                      <TableHead className="text-aunar-navy">Presentes</TableHead>
                      <TableHead className="text-aunar-navy">Ausentes</TableHead>
                      <TableHead className="text-aunar-navy">Justificados</TableHead>
                      <TableHead className="text-aunar-navy">% Asistencia</TableHead>
                      <TableHead className="text-aunar-navy">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporteData.map((item) => (
                      <TableRow key={item.estudiante.id}>
                        <TableCell className="font-medium text-aunar-navy">{item.estudiante.cedula}</TableCell>
                        <TableCell className="text-aunar-navy">{item.estudiante.nombreCompleto}</TableCell>
                        <TableCell className="text-aunar-light-navy">{item.estudiante.email}</TableCell>
                        <TableCell className="text-aunar-navy">{item.totalClases}</TableCell>
                        <TableCell className="text-green-600 font-medium">{item.presentes}</TableCell>
                        <TableCell className="text-red-600 font-medium">{item.ausentes}</TableCell>
                        <TableCell className="text-yellow-600 font-medium">{item.justificados}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={item.porcentajeAsistencia} className="w-16 h-2" />
                            <span className={`font-medium ${getAsistenciaColor(item.porcentajeAsistencia)}`}>
                              {item.porcentajeAsistencia.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getAsistenciaBadge(item.porcentajeAsistencia)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {selectedMateria && reporteData.length === 0 && (
          <Card className="border-aunar-light-navy/20">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-aunar-navy mb-2">No hay datos de asistencia</h3>
              <p className="text-aunar-light-navy">
                No se encontraron registros de asistencia para los filtros seleccionados
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedMateria && (
          <Card className="border-aunar-light-navy/20">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-aunar-navy mb-2">Selecciona una materia</h3>
              <p className="text-aunar-light-navy">Elige una materia para generar el reporte de asistencia</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function ReportesPage() {
  return (
    <AuthGuard>
      <ReportesContent />
    </AuthGuard>
  )
}
