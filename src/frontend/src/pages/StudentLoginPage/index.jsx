import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { Button, Input } from '../../components/common'
import { Footer } from '../../components/layout'
import { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export function StudentLoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loginStudent } = useAuth()
  const [credentials, setCredentials] = useState({
    cedula: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/estudiante/dashboard" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await loginStudent(credentials.cedula)
      navigate('/estudiante/dashboard', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/20">
    <main className="relative flex flex-1 items-center justify-center overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-secondary-foreground/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />

      {/* Overlay a pantalla completa */}
      <div className="absolute inset-0 bg-card/30 backdrop-blur-xl z-0" />

      <section className="relative z-10 w-full max-w-md px-4 py-8 animate-fade-in animate-slide-up flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <img
            alt="Logo PresenTech"
            className="mb-6 h-20 w-20 rounded-2xl object-cover shadow-xl"
            src="/logo_presentech_icon.png"
          />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">PresenTech</h1>
          <p className="mt-2 text-center text-base text-muted-foreground">
            Portal de Estudiantes
          </p>
        </div>

        <form
          className="w-full rounded-3xl border border-border/50 bg-card/80 p-8 shadow-2xl relative z-20"
          onSubmit={handleSubmit}
        >
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">Acceso Estudiante</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa con tu cédula
            </p>
          </div>

          <div className="space-y-5">
            <Input
              label="Número de Cédula"
              type="text"
              placeholder="Ingresa tu cédula"
              value={credentials.cedula}
              onChange={(value) =>
                setCredentials((current) => ({
                  ...current,
                  cedula: value,
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
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              ¿Eres docente? Inicia sesión aquí
            </Link>
          </div>
        </form>
        <p className="mt-10 text-center text-sm text-muted-foreground font-medium z-30">
          Fe y Alegría &middot; Innovación Educativa
        </p>
      </section>
    </main>
    <Footer />
    </div>
  )
}
