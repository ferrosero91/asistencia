"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Edit, Trash2, Plus, Home, UserCheck, UserX, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Header } from "@/components/layout/header"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  departamento?: string
  role: string
  activo: boolean
  fechaRegistro: string
  totalMaterias: number
  totalEstudiantes: number
  totalAsistencias: number
}

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    departamento: "",
    password: "",
    activo: true,
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

        await loadUsers(user.id)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadUsers = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/users?adminId=${adminId}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Error loading users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingUser) {
        // Actualizar usuario existente
        const response = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminId: currentUser.id,
            userData: formData,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Error al actualizar el usuario')
          return
        }
      } else {
        // Crear nuevo usuario
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminId: currentUser.id,
            userData: formData,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || 'Error al crear el usuario')
          return
        }
      }

      await loadUsers(currentUser.id)
      resetForm()
    } catch (error) {
      console.error('Error submitting user:', error)
      alert('Error al procesar la solicitud')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      departamento: "",
      password: "",
      activo: true,
    })
    setEditingUser(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono || "",
      departamento: user.departamento || "",
      password: "",
      activo: user.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        const response = await fetch(`/api/admin/users/${id}?adminId=${currentUser.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadUsers(currentUser.id)
        } else {
          const error = await response.json()
          alert(error.error || 'Error al eliminar el usuario')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error al eliminar el usuario')
      }
    }
  }

  const toggleActive = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: currentUser.id,
          userData: {
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            telefono: user.telefono,
            departamento: user.departamento,
            activo: !user.activo,
          },
        }),
      })

      if (response.ok) {
        await loadUsers(currentUser.id)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar el estado del usuario')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('Error al actualizar el estado del usuario')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aunar-gold mx-auto mb-4"></div>
          <p className="text-aunar-navy">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  const profesores = users.filter(u => u.role === 'PROFESOR')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-aunar-navy mb-2">Gestión de Usuarios</h1>
            <p className="text-aunar-light-navy">Administra los profesores del sistema</p>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-aunar-navy hover:bg-aunar-dark-navy">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-aunar-navy">
                    {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Modifica los datos del usuario"
                      : "Completa los datos para crear un nuevo profesor"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre" className="text-aunar-navy">Nombre</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="border-aunar-light-navy focus:border-aunar-navy"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellido" className="text-aunar-navy">Apellido</Label>
                        <Input
                          id="apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          className="border-aunar-light-navy focus:border-aunar-navy"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-aunar-navy">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-aunar-light-navy focus:border-aunar-navy"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="telefono" className="text-aunar-navy">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className="border-aunar-light-navy focus:border-aunar-navy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="departamento" className="text-aunar-navy">Departamento</Label>
                        <Input
                          id="departamento"
                          value={formData.departamento}
                          onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                          className="border-aunar-light-navy focus:border-aunar-navy"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-aunar-navy">
                        {editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="border-aunar-light-navy focus:border-aunar-navy"
                        required={!editingUser}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="activo"
                        checked={formData.activo}
                        onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                      />
                      <Label htmlFor="activo" className="text-aunar-navy">Usuario Activo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-aunar-navy hover:bg-aunar-dark-navy">
                      {editingUser ? "Actualizar" : "Crear"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Total Profesores</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">{profesores.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {profesores.filter(u => u.activo).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Inactivos</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {profesores.filter(u => !u.activo).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-aunar-gold">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-aunar-navy">Total Materias</CardTitle>
              <BookOpen className="h-4 w-4 text-aunar-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aunar-navy">
                {profesores.reduce((sum, u) => sum + u.totalMaterias, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de usuarios */}
        <Card className="border-aunar-light-navy/20">
          <CardHeader className="bg-gradient-to-r from-aunar-navy to-aunar-light-navy text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Profesores
            </CardTitle>
            <CardDescription className="text-aunar-gold">
              {profesores.length} profesores registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {profesores.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-aunar-navy/5">
                    <TableHead className="text-aunar-navy">Nombre</TableHead>
                    <TableHead className="text-aunar-navy">Email</TableHead>
                    <TableHead className="text-aunar-navy">Departamento</TableHead>
                    <TableHead className="text-aunar-navy">Estado</TableHead>
                    <TableHead className="text-aunar-navy">Materias</TableHead>
                    <TableHead className="text-aunar-navy">Estudiantes</TableHead>
                    <TableHead className="text-aunar-navy">Asistencias</TableHead>
                    <TableHead className="text-aunar-navy">Registro</TableHead>
                    <TableHead className="text-aunar-navy">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profesores.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-aunar-navy">
                        {user.nombre} {user.apellido}
                      </TableCell>
                      <TableCell className="text-aunar-light-navy">{user.email}</TableCell>
                      <TableCell className="text-aunar-navy">{user.departamento}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.activo ? "default" : "secondary"}
                          className={user.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-aunar-navy">{user.totalMaterias}</TableCell>
                      <TableCell className="text-aunar-navy">{user.totalEstudiantes}</TableCell>
                      <TableCell className="text-aunar-navy">{user.totalAsistencias}</TableCell>
                      <TableCell className="text-aunar-light-navy">
                        {new Date(user.fechaRegistro).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                            className="border-aunar-navy text-aunar-navy hover:bg-aunar-navy hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(user)}
                            className={user.activo 
                              ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            }
                          >
                            {user.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(user.id)}
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
                <Users className="h-12 w-12 text-aunar-gold mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-aunar-navy mb-2">No hay profesores registrados</h3>
                <p className="text-aunar-light-navy">Crea el primer profesor del sistema</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  )
}