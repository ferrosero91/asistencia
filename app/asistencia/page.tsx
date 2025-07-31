"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Users, Check, X, Clock, Save, Home } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"

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
  activa: boolean
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

function AsistenciaContent() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [selectedMateria, setSelectedMateria] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [currentAsistencias, setCurrentAsistencias] = useState<
    Record<string, { estado: string; observaciones: string }>
  >({})
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    setCurrentUser(user)
    loadData(user.id)
  }, [])

  useEffect(() => {
    if (selectedMateria && selectedDate) {
      loadCurrentAsistencias()
    }
  }, [selectedMateria, selectedDate])

  const loadData = async (profesorId: string) => {
    try {
      // Cargar materias activas del profesor
      const materiasResponse = await fetch(`/api/materias?profesorId=${profesorId}`)
      const materias = await materiasResponse.json()
      const materiasActivas = materias.filter((m: Materia) => m.activa)

      // Cargar estudiantes del profesor
      const estudiantesResponse = await fetch(`/api/estudiantes?profesorId=${profesorId}`)
      const estudiantes = await estudiantesResponse.json()

      // Cargar asistencias del profesor
      const asistenciasResponse = await fetch(`/api/asistencias?profesorId=${profesorId}`)
      const asistencias = await asistenciasResponse.json()

      setEstudiantes(estudiantes)
      setMaterias(materiasActivas)
      setAsistencias(asistencias)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadCurrentAsistencias = () => {
    // Convertir la fecha seleccionada a formato comparable
    const selectedDateFormatted = new Date(selectedDate).toISOString().split('T')[0]
    
    const existingAsistencias = asistencias.filter((a) => {
      const asistenciaDate = new Date(a.fecha).toISOString().split('T')[0]
      return a.materiaId === selectedMateria && asistenciaDate === selectedDateFormatted
    })

    const currentData: Record<string, { estado: string; observaciones: string }> = {}

    // Cargar asistencias existentes
    existingAsistencias.forEach((asistencia) => {
      currentData[asistencia.estudianteId] = {
        estado: asistencia.estado,
        observaciones: asistencia.observaciones || "",
      }
    })

    // Inicializar estudiantes sin asistencia
    const estudiantesMateria = estudiantes.filter((e) => e.materiaId === selectedMateria)
    estudiantesMateria.forEach((estudiante) => {
      if (!currentData[estudiante.id]) {
        currentData[estudiante.id] = {
          estado: "",
          observaciones: "",
        }
      }
    })

    setCurrentAsistencias(currentData)
  }

  const updateAsistencia = (estudianteId: string, campo: string, valor: string) => {
    setCurrentAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [campo]: valor,
      },
    }))
  }

  const marcarTodos = (estado: "presente" | "ausente") => {
    const estudiantesMateria = estudiantes.filter((e) => e.materiaId === selectedMateria)
    const newAsistencias = { ...currentAsistencias }

    estudiantesMateria.forEach((estudiante) => {
      newAsistencias[estudiante.id] = {
        ...newAsistencias[estudiante.id],
        estado,
      }
    })

    setCurrentAsistencias(newAsistencias)
  }

  const guardarAsistencias = async () => {
    if (!selectedMateria || !selectedDate) {
      alert("Selecciona una materia y fecha")
      return
    }

    try {
      const estudiantesMateria = estudiantes.filter((e) => e.materiaId === selectedMateria)
      const nuevasAsistencias: any[] = []

      // Crear nuevas asistencias
      estudiantesMateria.forEach((estudiante) => {
        const asistenciaData = currentAsistencias[estudiante.id]
        if (asistenciaData && asistenciaData.estado) {
          nuevasAsistencias.push({
            estudianteId: estudiante.id,
            materiaId: selectedMateria,
            fecha: selectedDate,
            estado: asistenciaData.estado,
            observaciones: asistenciaData.observaciones || "",
          })
        }
      })

      if (nuevasAsistencias.length === 0) {
        alert("No hay asistencias para guardar")
        return
      }

      // Llamar a la API para guardar asistencias
      const response = await fetch('/api/asistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asistencias: nuevasAsistencias }),
      })

      const data = await response.json()

      if (response.ok) {
        // Recargar datos para actualizar la vista
        await loadData(currentUser.id)
        alert(`Se guardaron ${data.count} registros de asistencia exitosamente`)
      } else {
        alert(data.error || 'Error al guardar las asistencias')
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Error al guardar las asistencias')
    }
  }

  const estudiantesMateria = estudiantes.filter((e) => e.materiaId === selectedMateria)
  const materiaSeleccionada = materias.find((m) => m.id === selectedMateria)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "presente":
        return <Badge className="bg-green-100 text-green-800">Presente</Badge>
      case "ausente":
        return <Badge variant="destructive">Ausente</Badge>
      case "justificado":
        return <Badge className="bg-yellow-100 text-yellow-800">Justificado</Badge>
      default:
        return (
          <Badge variant="outline" className="border-aunar-light-navy text-aunar-light-navy">
            Sin marcar
          </Badge>
        )
    }
  }

  const contarAsistencias = () => {
    const presentes = Object.values(currentAsistencias).filter((a) => a.estado === "presente").length
    const ausentes = Object.values(currentAsistencias).filter((a) => a.estado === "ausente").length
    const justificados = Object.values(currentAsistencias).filter((a) => a.estado === "justificado").length

    return { presentes, ausentes, justificados }
  }

  const { presentes, ausentes, justificados } = contarAsistencias()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aunar-navy mb-2">Tomar Asistencia</h1>
            <p className="text-aunar-light-navy">Marca la asistencia de estudiantes por materia y fecha</p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="border-aunar-navy text-aunar-navy hover:bg-aunar-navy hover:text-white bg-transparent"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Selección de materia y fecha */}
        <Card className="mb-8 border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuración de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="materia" className="text-aunar-navy font-medium">
                  Materia
                </Label>
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
                <Label htmlFor="fecha" className="text-aunar-navy font-medium">
                  Fecha
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-aunar-light-navy focus:border-aunar-navy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedMateria && estudiantesMateria.length > 0 && (
          <>
            {/* Estadísticas y acciones rápidas */}
            <Card className="mb-8 border-aunar-light-navy/20">
              <CardHeader className="bg-gradient-to-r from-aunar-gold to-yellow-400 text-aunar-navy">
                <CardTitle>Resumen de Asistencia</CardTitle>
                <CardDescription className="text-aunar-dark-navy">
                  {materiaSeleccionada?.nombre} - {new Date(selectedDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  <Badge className="bg-green-100 text-green-800">Presentes: {presentes}</Badge>
                  <Badge variant="destructive">Ausentes: {ausentes}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">Justificados: {justificados}</Badge>
                  <Badge variant="outline" className="border-aunar-navy text-aunar-navy">
                    Total: {estudiantesMateria.length}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => marcarTodos("presente")}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar Todos Presentes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => marcarTodos("ausente")}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Marcar Todos Ausentes
                  </Button>
                  <Button onClick={guardarAsistencias} className="bg-aunar-navy hover:bg-aunar-dark-navy">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Asistencias
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de estudiantes */}
            <Card className="border-aunar-light-navy/20">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lista de Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-aunar-navy/5">
                      <TableHead className="text-aunar-navy">Cédula</TableHead>
                      <TableHead className="text-aunar-navy">Nombre Completo</TableHead>
                      <TableHead className="text-aunar-navy">Estado</TableHead>
                      <TableHead className="text-aunar-navy">Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estudiantesMateria.map((estudiante) => (
                      <TableRow key={estudiante.id}>
                        <TableCell className="font-medium text-aunar-navy">{estudiante.cedula}</TableCell>
                        <TableCell className="text-aunar-navy">{estudiante.nombreCompleto}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={currentAsistencias[estudiante.id]?.estado === "presente" ? "default" : "outline"}
                              onClick={() => updateAsistencia(estudiante.id, "estado", "presente")}
                              className={
                                currentAsistencias[estudiante.id]?.estado === "presente"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "text-green-600 border-green-600 hover:bg-green-50"
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                currentAsistencias[estudiante.id]?.estado === "ausente" ? "destructive" : "outline"
                              }
                              onClick={() => updateAsistencia(estudiante.id, "estado", "ausente")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                currentAsistencias[estudiante.id]?.estado === "justificado" ? "default" : "outline"
                              }
                              onClick={() => updateAsistencia(estudiante.id, "estado", "justificado")}
                              className={
                                currentAsistencias[estudiante.id]?.estado === "justificado"
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                              }
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2">{getEstadoBadge(currentAsistencias[estudiante.id]?.estado || "")}</div>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Observaciones..."
                            value={currentAsistencias[estudiante.id]?.observaciones || ""}
                            onChange={(e) => updateAsistencia(estudiante.id, "observaciones", e.target.value)}
                            className="min-h-[60px] border-aunar-light-navy focus:border-aunar-navy"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {selectedMateria && estudiantesMateria.length === 0 && (
          <Card className="border-aunar-light-navy/20">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-aunar-navy mb-2">No hay estudiantes en esta materia</h3>
              <p className="text-aunar-light-navy">Primero debes cargar estudiantes para esta materia</p>
              <Link href="/estudiantes">
                <Button className="mt-4 bg-aunar-navy hover:bg-aunar-dark-navy">Cargar Estudiantes</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!selectedMateria && (
          <Card className="border-aunar-light-navy/20">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-aunar-navy mb-2">Selecciona una materia</h3>
              <p className="text-aunar-light-navy">Elige una materia y fecha para comenzar a tomar asistencia</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function AsistenciaPage() {
  return (
    <AuthGuard>
      <AsistenciaContent />
    </AuthGuard>
  )
}
