"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, Phone, Building } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    departamento: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      // Llamar a la API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          departamento: formData.departamento,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Iniciar sesión automáticamente
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        router.push("/")
      } else {
        setError(data.error || "Error al crear la cuenta")
      }
    } catch (error) {
      console.error('Error en registro:', error)
      setError("Error al crear la cuenta. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aunar-navy via-aunar-light-navy to-aunar-dark-navy flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header institucional */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
            <div className="flex items-center justify-center h-20">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-aunar-navy">AUNAR</h2>
                <p className="text-sm text-aunar-light-navy">Universidad Autónoma de Nariño</p>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Registro de Profesor</h1>
          <p className="text-aunar-gold">Universidad Autónoma de Nariño</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 bg-aunar-navy text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-center text-aunar-gold">
              Regístrate como profesor en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-aunar-navy font-medium">
                    Nombre
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Juan"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="pl-10 border-aunar-light-navy focus:border-aunar-navy focus:ring-aunar-navy"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-aunar-navy font-medium">
                    Apellido
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                    <Input
                      id="apellido"
                      type="text"
                      placeholder="Pérez"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="pl-10 border-aunar-light-navy focus:border-aunar-navy focus:ring-aunar-navy"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-aunar-navy font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="profesor@aunar.edu.co"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 border-aunar-light-navy focus:border-aunar-navy focus:ring-aunar-navy"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-aunar-navy font-medium">
                    Teléfono
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="3001234567"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="pl-10 border-aunar-light-navy focus:border-aunar-navy focus:ring-aunar-navy"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento" className="text-aunar-navy font-medium">
                    Departamento
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                    <Input
                      id="departamento"
                      type="text"
                      placeholder="Ingeniería"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="pl-10 border-aunar-light-navy focus:border-aunar-navy focus:ring-aunar-navy"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-aunar-navy font-medium">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 border-aunar-light-navy focus:border-aunar-navy focus:ring-aunar-navy"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-aunar-light-navy hover:text-aunar-navy"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-aunar-navy font-medium">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 border-aunar-light-navy focus:border-aunar-navy focus:ring-aunar-navy"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-aunar-light-navy hover:text-aunar-navy"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-aunar-navy hover:bg-aunar-dark-navy text-white font-medium py-2.5"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-aunar-light-navy">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="text-aunar-navy hover:text-aunar-dark-navy font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-aunar-gold text-sm">
          <p>© 2024 Universidad Autónoma de Nariño</p>
          <p>Sistema de Gestión de Asistencia Académica</p>
        </div>
      </div>
    </div>
  )
}
