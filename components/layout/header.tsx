"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, Shield, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AppUser {
  id: string
  nombre: string
  apellido: string
  email: string
  departamento: string
  role: string
}

export function Header() {
  const [user, setUser] = useState<AppUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/auth/login")
  }

  if (!user) return null

  const initials = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`

  return (
    <header className="bg-aunar-navy shadow-lg border-b-4 border-aunar-gold">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded p-2">
              <div className="flex items-center justify-center h-8 w-24">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-aunar-navy">AUNAR</h2>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {user.role === 'SUPER_ADMIN' ? 'Panel de Administración' : 'Sistema de Asistencia'}
              </h1>
              <p className="text-aunar-gold text-sm">Universidad Autónoma de Nariño</p>
            </div>
          </div>

          {/* Usuario */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-white font-medium">
                {user.nombre} {user.apellido}
              </p>
              <p className="text-aunar-gold text-sm">{user.departamento}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 bg-aunar-gold">
                    <AvatarFallback className="bg-aunar-gold text-aunar-navy font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.nombre} {user.apellido}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'SUPER_ADMIN' ? (
                  <>
                    <Link href="/admin">
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Dashboard Admin</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/admin/users">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Gestión de Usuarios</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/">
                      <DropdownMenuItem>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
