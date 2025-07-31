"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const createAdmin = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Error desconocido')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const checkAdmin = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-admin')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Error al verificar admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-aunar-navy">
            👑 Crear Super Administrador
          </CardTitle>
          <CardDescription>
            Sistema de Gestión de Asistencia Estudiantil - AUNAR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Información</h3>
            <p className="text-blue-700">
              Esta página crea específicamente el usuario Super Administrador con las credenciales:
            </p>
            <div className="mt-2 font-mono bg-white p-2 rounded border">
              <p><strong>Email:</strong> admin@aunar.edu.co</p>
              <p><strong>Contraseña:</strong> admin123</p>
              <p><strong>Rol:</strong> SUPER_ADMIN</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={createAdmin} 
              disabled={loading}
              className="bg-aunar-navy hover:bg-aunar-dark-navy"
            >
              {loading ? '⏳ Creando...' : '👑 Crear Super Admin'}
            </Button>
            <Button 
              onClick={checkAdmin} 
              disabled={loading}
              variant="outline"
              className="border-aunar-gold text-aunar-gold hover:bg-aunar-gold hover:text-aunar-navy"
            >
              {loading ? '⏳ Verificando...' : '🔍 Verificar Admin'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800">❌ Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className={`border rounded-lg p-4 ${
              result.success || result.exists 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.success || result.exists 
                  ? 'text-green-800' 
                  : 'text-yellow-800'
              }`}>
                {result.success ? '✅' : result.exists ? '👑' : '⚠️'} {result.message}
              </h3>
              
              {result.admin && (
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium mb-2">👤 Datos del Super Admin:</h4>
                  <p><strong>Email:</strong> {result.admin.email}</p>
                  {result.admin.password && <p><strong>Contraseña:</strong> {result.admin.password}</p>}
                  <p><strong>Rol:</strong> {result.admin.role}</p>
                  <p><strong>Nombre:</strong> {result.admin.nombre}</p>
                  <p><strong>Estado:</strong> {result.admin.activo ? 'Activo' : 'Inactivo'}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-sm text-gray-600 mt-6">
            <p>Una vez creado el super admin, puedes acceder al sistema:</p>
            <div className="flex gap-4 justify-center mt-2">
              <a 
                href="/auth/login" 
                className="font-mono bg-gray-100 p-2 rounded text-aunar-navy hover:underline"
              >
                → Ir al Login
              </a>
              <a 
                href="/init" 
                className="font-mono bg-gray-100 p-2 rounded text-aunar-navy hover:underline"
              >
                → Página de Inicialización
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}