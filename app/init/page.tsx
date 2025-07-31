"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InitPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const initializeSystem = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/init', {
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

  const checkStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/init')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Error al verificar estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-aunar-navy">
            🚀 Inicialización del Sistema
          </CardTitle>
          <CardDescription>
            Sistema de Gestión de Asistencia Estudiantil - AUNAR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={initializeSystem} 
              disabled={loading}
              className="bg-aunar-navy hover:bg-aunar-dark-navy"
            >
              {loading ? '⏳ Inicializando...' : '🌱 Crear Usuarios Iniciales'}
            </Button>
            <Button 
              onClick={checkStatus} 
              disabled={loading}
              variant="outline"
              className="border-aunar-gold text-aunar-gold hover:bg-aunar-gold hover:text-aunar-navy"
            >
              {loading ? '⏳ Verificando...' : '📊 Verificar Estado'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800">❌ Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ {result.message}
              </h3>
              
              {result.users && (
                <div className="space-y-2">
                  <h4 className="font-medium text-green-700">👤 Usuarios:</h4>
                  {result.users.map((user: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <p><strong>Email:</strong> {user.email}</p>
                      {user.password && <p><strong>Contraseña:</strong> {user.password}</p>}
                      <p><strong>Rol:</strong> {user.role}</p>
                      <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.stats && (
                <div className="mt-4">
                  <h4 className="font-medium text-green-700">📊 Estadísticas:</h4>
                  <div className="bg-white p-3 rounded border">
                    <p><strong>Usuarios:</strong> {result.stats.totalUsers}</p>
                    <p><strong>Materias:</strong> {result.stats.totalMaterias}</p>
                    <p><strong>Estudiantes:</strong> {result.stats.totalEstudiantes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-sm text-gray-600 mt-6">
            <p>Una vez creados los usuarios, puedes acceder al sistema:</p>
            <p className="font-mono bg-gray-100 p-2 rounded mt-2">
              <a href="/auth/login" className="text-aunar-navy hover:underline">
                → Ir al Login
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}