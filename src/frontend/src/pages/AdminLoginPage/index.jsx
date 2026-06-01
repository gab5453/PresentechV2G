import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, loginAdmin } = useAuth()
  const [credentials, setCredentials] = useState({
    correo_institucional: '',
    contrasena: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated && user?.rol === 'admin') {
    return <Navigate to="/admin" replace />
  } else if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await loginAdmin(credentials)
      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-secondary via-background to-primary/10 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-secondary-foreground/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />

      {/* Overlay a pantalla completa */}
      <div className="absolute inset-0 bg-card/30 backdrop-blur-xl z-0" />

      <section className="relative z-10 w-full max-w-md px-4 py-8 animate-fade-in animate-slide-up flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-xl">
            <span className="text-3xl font-bold text-primary-foreground tracking-tight">PT</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">PresenTech</h1>
          <p className="mt-2 text-center text-base text-muted-foreground">
            Panel de Administración - Vicerectorado
          </p>
        </div>

        <form
          className="w-full rounded-3xl border border-border/50 bg-card/80 p-8 shadow-2xl relative z-20"
          onSubmit={handleSubmit}
        >
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">Acceso Administrativo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingrese sus credenciales de vicerectorado
            </p>
          </div>

          <div className="space-y-5">
            <Input
              label="Correo institucional"
              type="email"
              placeholder="admin@institucion.edu.ec"
              value={credentials.correo_institucional}
              onChange={(value) =>
                setCredentials((current) => ({
                  ...current,
                  correo_institucional: value,
                }))
              }
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={credentials.contrasena}
              onChange={(value) =>
                setCredentials((current) => ({
                  ...current,
                  contrasena: value,
                }))
              }
            />
          </div>

          {error ? (
            <div className="mt-6 rounded-lg border border-error/20 bg-error-bg/80 backdrop-blur-sm px-4 py-3 text-sm text-error flex items-center justify-center">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex justify-center w-full">
            <Button className="w-3/4 text-base py-2.5 rounded-xl" type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </div>
        </form>
        <p className="mt-10 text-center text-sm text-muted-foreground font-medium z-30">
          Fe y Alegría &middot; Innovación Educativa
        </p>
      </section>
    </main>
  )
}
