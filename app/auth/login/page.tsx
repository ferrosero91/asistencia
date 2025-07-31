"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Lock, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Llamar a la API de autenticación
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar sesión
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        
        // Redirigir según el rol
        if (data.user.role === 'SUPER_ADMIN') {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        setError(data.error || "Credenciales incorrectas. Verifica tu email y contraseña.")
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError("Error al iniciar sesión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aunar-navy via-aunar-light-navy to-aunar-dark-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Asistencia</h1>
          <p className="text-aunar-gold">Universidad Autónoma de Nariño</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 bg-aunar-navy text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center text-aunar-gold">Accede a tu cuenta de profesor</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-aunar-navy font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-aunar-light-navy" />
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
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-aunar-light-navy">
                ¿No tienes cuenta?{" "}
                <Link href="/auth/register" className="text-aunar-navy hover:text-aunar-dark-navy font-medium">
                  Regístrate aquí
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
