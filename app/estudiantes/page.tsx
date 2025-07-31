"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, Users, FileSpreadsheet, Trash2, Home, Plus, Edit, Save, X } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"

interface Estudiante {
  id: string
  cedula: string
  nombreCompleto: string
  email: string
  materiaId: string
  fechaCarga: string
}

interface Materia {
  id: string
  nombre: string
  codigo: string
  activa: boolean
  profesorId: string
}

function EstudiantesContent() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [selectedMateria, setSelectedMateria] = useState<string>("all")
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cedula: '',
    nombreCompleto: '',
    email: '',
    materiaId: ''
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    setCurrentUser(user)
    loadData(user.id)
  }, [])

  const loadData = async (profesorId: string) => {
    try {
      // Cargar materias del profesor
      const materiasResponse = await fetch(`/api/materias?profesorId=${profesorId}`)
      const materias = await materiasResponse.json()
      const materiasActivas = materias.filter((m: Materia) => m.activa)

      // Cargar estudiantes del profesor
      const estudiantesResponse = await fetch(`/api/estudiantes?profesorId=${profesorId}`)
      const estudiantes = await estudiantesResponse.json()

      setEstudiantes(estudiantes)
      setMaterias(materiasActivas)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

        // Verificar que tenga los headers correctos
        const requiredHeaders = ["cedula", "nombrecompleto", "email"]
        const hasAllHeaders = requiredHeaders.every((header) => headers.some((h) => h.includes(header)))

        if (!hasAllHeaders) {
          alert(`El archivo debe contener las columnas: cedula, nombreCompleto, email`)
          return
        }

        const data = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line, index) => {
            const values = line.split(",").map((v) => v.trim())

            // Mapear valores según el orden de headers
            const cedulaIndex = headers.findIndex((h) => h.includes("cedula"))
            const nombreCompletoIndex = headers.findIndex((h) => h.includes("nombrecompleto"))
            const emailIndex = headers.findIndex((h) => h.includes("email"))

            const cedula = values[cedulaIndex] || ""
            const nombreCompleto = values[nombreCompletoIndex] || ""
            const email = values[emailIndex] || ""

            return {
              id: `temp-${index}`,
              cedula,
              nombreCompleto,
              email,
              valid: cedula && nombreCompleto && email && cedula.length >= 6 && email.includes("@"),
            }
          })

        setPreviewData(data)
        setShowPreview(true)
      } catch (error) {
        alert("Error al leer el archivo. Asegúrate de que sea un CSV válido.")
      }
    }
    reader.readAsText(file)
  }

  const confirmImport = async () => {
    if (selectedMateria === "all") {
      alert("Selecciona una materia antes de importar")
      return
    }

    try {
      const validData = previewData.filter((item) => item.valid)
      const newEstudiantes = validData.map((item) => ({
        cedula: item.cedula,
        nombreCompleto: item.nombreCompleto,
        email: item.email,
        materiaId: selectedMateria,
      }))

      // Llamar a la API para crear estudiantes
      const response = await fetch('/api/estudiantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estudiantes: newEstudiantes }),
      })

      const data = await response.json()

      if (response.ok) {
        loadData(currentUser.id)
        setShowPreview(false)
        setPreviewData([])
        alert(`Se importaron ${data.count} estudiantes exitosamente.`)
      } else {
        alert(data.error || 'Error al importar estudiantes')
      }
    } catch (error) {
      console.error('Error importing students:', error)
      alert('Error al importar estudiantes')
    }
  }

  const deleteEstudiante = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
      try {
        const response = await fetch(`/api/estudiantes/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadData(currentUser.id)
        } else {
          const error = await response.json()
          alert(error.error || 'Error al eliminar el estudiante')
        }
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('Error al eliminar el estudiante')
      }
    }
  }

  const handleCreateStudent = async () => {
    if (!formData.cedula || !formData.nombreCompleto || !formData.email || !formData.materiaId) {
      alert('Todos los campos son requeridos')
      return
    }

    try {
      const response = await fetch('/api/estudiantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula: formData.cedula,
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          materiaId: formData.materiaId
        }),
      })

      if (response.ok) {
        loadData(currentUser.id)
        setShowCreateForm(false)
        setFormData({ cedula: '', nombreCompleto: '', email: '', materiaId: '' })
        alert('Estudiante creado exitosamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear el estudiante')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Error al crear el estudiante')
    }
  }

  const handleEditStudent = async (id: string) => {
    if (!formData.cedula || !formData.nombreCompleto || !formData.email || !formData.materiaId) {
      alert('Todos los campos son requeridos')
      return
    }

    try {
      const response = await fetch(`/api/estudiantes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula: formData.cedula,
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          materiaId: formData.materiaId
        }),
      })

      if (response.ok) {
        loadData(currentUser.id)
        setEditingStudent(null)
        setFormData({ cedula: '', nombreCompleto: '', email: '', materiaId: '' })
        alert('Estudiante actualizado exitosamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar el estudiante')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Error al actualizar el estudiante')
    }
  }

  const startEdit = (estudiante: Estudiante) => {
    setEditingStudent(estudiante.id)
    setFormData({
      cedula: estudiante.cedula,
      nombreCompleto: estudiante.nombreCompleto,
      email: estudiante.email,
      materiaId: estudiante.materiaId
    })
  }

  const cancelEdit = () => {
    setEditingStudent(null)
    setFormData({ cedula: '', nombreCompleto: '', email: '', materiaId: '' })
  }

  const exportTemplate = () => {
    const csvContent = `cedula,nombreCompleto,email
1234567890,Juan Carlos Pérez García,juan.perez@est.aunar.edu.co
0987654321,María Fernanda López Rodríguez,maria.lopez@est.aunar.edu.co
1122334455,Carlos Alberto Martínez Silva,carlos.martinez@est.aunar.edu.co`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_estudiantes_aunar.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredEstudiantes =
    selectedMateria !== "all" ? estudiantes.filter((e) => e.materiaId === selectedMateria) : estudiantes

  const getMateriaName = (materiaId: string) => {
    const materia = materias.find((m) => m.id === materiaId)
    return materia ? `${materia.nombre} (${materia.codigo})` : "Materia no encontrada"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aunar-navy mb-2">Carga de Estudiantes</h1>
            <p className="text-aunar-light-navy">Importa estudiantes desde archivos Excel/CSV</p>
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
              variant="outline"
              onClick={exportTemplate}
              className="border-aunar-gold text-aunar-gold hover:bg-aunar-gold hover:text-aunar-navy bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla
            </Button>
          </div>
        </div>

        {/* Sección de carga */}
        <Card className="mb-8 border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Estudiantes
            </CardTitle>
            <CardDescription className="text-aunar-gold">
              Sube un archivo CSV con las columnas: cedula, nombreCompleto, email
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="materia" className="text-aunar-navy font-medium">
                  Seleccionar Materia
                </Label>
                <Select value={selectedMateria} onValueChange={setSelectedMateria}>
                  <SelectTrigger className="border-aunar-light-navy focus:border-aunar-navy">
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las materias</SelectItem>
                    {materias.map((materia) => (
                      <SelectItem key={materia.id} value={materia.id}>
                        {materia.nombre} ({materia.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file" className="text-aunar-navy font-medium">
                  Archivo CSV
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={selectedMateria === "all"}
                  className="border-aunar-light-navy focus:border-aunar-navy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista previa */}
        {showPreview && (
          <Card className="mb-8 border-aunar-light-navy/20">
            <CardHeader className="bg-gradient-to-r from-aunar-gold to-yellow-400 text-aunar-navy">
              <CardTitle>Vista Previa de Importación</CardTitle>
              <CardDescription className="text-aunar-dark-navy">
                Revisa los datos antes de confirmar la importación
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <Badge variant="outline" className="mr-2 border-aunar-navy text-aunar-navy">
                  Total: {previewData.length}
                </Badge>
                <Badge className="mr-2 bg-green-100 text-green-800">
                  Válidos: {previewData.filter((item) => item.valid).length}
                </Badge>
                <Badge variant="destructive">Inválidos: {previewData.filter((item) => !item.valid).length}</Badge>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-aunar-navy/5">
                      <TableHead className="text-aunar-navy">Cédula</TableHead>
                      <TableHead className="text-aunar-navy">Nombre Completo</TableHead>
                      <TableHead className="text-aunar-navy">Email</TableHead>
                      <TableHead className="text-aunar-navy">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-aunar-navy">{item.cedula}</TableCell>
                        <TableCell className="text-aunar-navy">{item.nombreCompleto}</TableCell>
                        <TableCell className="text-aunar-navy">{item.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={item.valid ? "default" : "destructive"}
                            className={item.valid ? "bg-green-100 text-green-800" : ""}
                          >
                            {item.valid ? "Válido" : "Inválido"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancelar
                </Button>
                <Button onClick={confirmImport} className="bg-aunar-navy hover:bg-aunar-dark-navy">
                  Confirmar Importación
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulario de creación/edición */}
        {(showCreateForm || editingStudent) && (
          <Card className="mb-8 border-aunar-light-navy/20">
            <CardHeader className="bg-gradient-to-r from-aunar-gold to-yellow-400 text-aunar-navy">
              <CardTitle className="flex items-center gap-2">
                {editingStudent ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingStudent ? 'Editar Estudiante' : 'Crear Nuevo Estudiante'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cedula" className="text-aunar-navy font-medium">
                    Cédula
                  </Label>
                  <Input
                    id="cedula"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    placeholder="Ingresa la cédula"
                    className="border-aunar-light-navy focus:border-aunar-navy"
                  />
                </div>
                <div>
                  <Label htmlFor="nombreCompleto" className="text-aunar-navy font-medium">
                    Nombre Completo
                  </Label>
                  <Input
                    id="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    placeholder="Nombre completo"
                    className="border-aunar-light-navy focus:border-aunar-navy"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-aunar-navy font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@est.aunar.edu.co"
                    className="border-aunar-light-navy focus:border-aunar-navy"
                  />
                </div>
                <div>
                  <Label htmlFor="materia-form" className="text-aunar-navy font-medium">
                    Materia
                  </Label>
                  <Select value={formData.materiaId} onValueChange={(value) => setFormData({ ...formData, materiaId: value })}>
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
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false)
                    cancelEdit()
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={editingStudent ? () => handleEditStudent(editingStudent) : handleCreateStudent}
                  className="bg-aunar-navy hover:bg-aunar-dark-navy"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingStudent ? 'Actualizar' : 'Crear'} Estudiante
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de estudiantes */}
        <Card className="border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estudiantes Registrados
                </CardTitle>
                <CardDescription className="text-aunar-gold">
                  {filteredEstudiantes.length} estudiantes
                  {selectedMateria !== "all" && ` en ${getMateriaName(selectedMateria)}`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-aunar-gold hover:bg-yellow-500 text-aunar-navy"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Estudiante
                </Button>
                <Select value={selectedMateria} onValueChange={setSelectedMateria}>
                  <SelectTrigger className="w-64 bg-white text-aunar-navy border-aunar-gold">
                    <SelectValue placeholder="Filtrar por materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las materias</SelectItem>
                    {materias.map((materia) => (
                      <SelectItem key={materia.id} value={materia.id}>
                        {materia.nombre} ({materia.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredEstudiantes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-aunar-navy/5">
                    <TableHead className="text-aunar-navy">Cédula</TableHead>
                    <TableHead className="text-aunar-navy">Nombre Completo</TableHead>
                    <TableHead className="text-aunar-navy">Email</TableHead>
                    <TableHead className="text-aunar-navy">Materia</TableHead>
                    <TableHead className="text-aunar-navy">Fecha de Carga</TableHead>
                    <TableHead className="text-aunar-navy">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstudiantes.map((estudiante) => (
                    <TableRow key={estudiante.id}>
                      <TableCell className="font-medium text-aunar-navy">{estudiante.cedula}</TableCell>
                      <TableCell className="text-aunar-navy">{estudiante.nombreCompleto}</TableCell>
                      <TableCell className="text-aunar-light-navy">{estudiante.email}</TableCell>
                      <TableCell className="text-aunar-light-navy">{getMateriaName(estudiante.materiaId)}</TableCell>
                      <TableCell className="text-aunar-light-navy">
                        {new Date(estudiante.fechaCarga).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(estudiante)}
                            className="border-aunar-navy text-aunar-navy hover:bg-aunar-navy hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEstudiante(estudiante.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileSpreadsheet className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-aunar-navy mb-2">No hay estudiantes registrados</h3>
                <p className="text-aunar-light-navy">Importa tu primer archivo de estudiantes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EstudiantesPage() {
  return (
    <AuthGuard>
      <EstudiantesContent />
    </AuthGuard>
  )
}
