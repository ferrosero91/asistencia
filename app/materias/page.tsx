"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, BookOpen, Users, Home } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/layout/header"

interface Materia {
  id: string
  nombre: string
  codigo: string
  descripcion: string
  activa: boolean
  fechaCreacion: string
  totalEstudiantes: number
  profesorId: string
}

function MateriasContent() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    activa: true,
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
    setCurrentUser(user)
    loadMaterias(user.id)
  }, [])

  const loadMaterias = async (profesorId: string) => {
    try {
      const response = await fetch(`/api/materias?profesorId=${profesorId}`)
      if (response.ok) {
        const materias = await response.json()
        setMaterias(materias)
      } else {
        console.error('Error loading materias:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading materias:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingMateria) {
        // Actualizar materia existente
        const response = await fetch(`/api/materias/${editingMateria.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Error al actualizar la materia')
          return
        }
      } else {
        // Crear nueva materia
        const response = await fetch('/api/materias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            profesorId: currentUser.id,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Error al crear la materia')
          return
        }
      }

      loadMaterias(currentUser.id)
      resetForm()
    } catch (error) {
      console.error('Error submitting materia:', error)
      alert('Error al procesar la solicitud')
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", codigo: "", descripcion: "", activa: true })
    setEditingMateria(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (materia: Materia) => {
    setEditingMateria(materia)
    setFormData({
      nombre: materia.nombre,
      codigo: materia.codigo,
      descripcion: materia.descripcion,
      activa: materia.activa,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta materia?")) {
      try {
        const response = await fetch(`/api/materias/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          loadMaterias(currentUser.id)
        } else {
          const error = await response.json()
          alert(error.error || 'Error al eliminar la materia')
        }
      } catch (error) {
        console.error('Error deleting materia:', error)
        alert('Error al eliminar la materia')
      }
    }
  }

  const toggleActive = async (id: string) => {
    try {
      // Encontrar la materia actual para obtener su estado
      const materia = materias.find(m => m.id === id)
      if (!materia) return

      const response = await fetch(`/api/materias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: materia.nombre,
          codigo: materia.codigo,
          descripcion: materia.descripcion,
          activa: !materia.activa,
        }),
      })

      if (response.ok) {
        loadMaterias(currentUser.id)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar el estado de la materia')
      }
    } catch (error) {
      console.error('Error toggling materia status:', error)
      alert('Error al actualizar el estado de la materia')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aunar-navy mb-2">Gestión de Materias</h1>
            <p className="text-aunar-light-navy">Administra tus materias del sistema</p>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-aunar-navy hover:bg-aunar-dark-navy">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Materia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-aunar-navy">
                    {editingMateria ? "Editar Materia" : "Nueva Materia"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMateria
                      ? "Modifica los datos de la materia"
                      : "Completa los datos para crear una nueva materia"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nombre" className="text-right text-aunar-navy">
                        Nombre
                      </Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="col-span-3 border-aunar-light-navy focus:border-aunar-navy"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="codigo" className="text-right text-aunar-navy">
                        Código
                      </Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        className="col-span-3 border-aunar-light-navy focus:border-aunar-navy"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="descripcion" className="text-right text-aunar-navy">
                        Descripción
                      </Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="col-span-3 border-aunar-light-navy focus:border-aunar-navy"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="activa" className="text-right text-aunar-navy">
                        Activa
                      </Label>
                      <Switch
                        id="activa"
                        checked={formData.activa}
                        onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-aunar-navy hover:bg-aunar-dark-navy">
                      {editingMateria ? "Actualizar" : "Crear"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map((materia) => (
            <Card key={materia.id} className="hover:shadow-lg transition-shadow border-aunar-light-navy/20">
              <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {materia.nombre}
                    </CardTitle>
                    <CardDescription className="mt-1 text-aunar-gold">Código: {materia.codigo}</CardDescription>
                  </div>
                  <Badge
                    variant={materia.activa ? "secondary" : "outline"}
                    className={materia.activa ? "bg-aunar-gold text-aunar-navy" : ""}
                  >
                    {materia.activa ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-aunar-light-navy mb-4">{materia.descripcion}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-aunar-gold" />
                  <span className="text-sm text-aunar-navy font-medium">{materia.totalEstudiantes} estudiantes</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(materia)}
                      className="border-aunar-navy text-aunar-navy hover:bg-aunar-navy hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(materia.id)}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Switch checked={materia.activa} onCheckedChange={() => toggleActive(materia.id)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {materias.length === 0 && (
          <Card className="text-center py-12 border-aunar-light-navy/20">
            <CardContent>
              <BookOpen className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-aunar-navy mb-2">No hay materias registradas</h3>
              <p className="text-aunar-light-navy mb-4">Comienza creando tu primera materia</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-aunar-navy hover:bg-aunar-dark-navy">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Materia
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function MateriasPage() {
  return (
    <AuthGuard>
      <MateriasContent />
    </AuthGuard>
  )
}
