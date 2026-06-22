import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si es estudiante, no puede entrar aquí
  if (user?.role === 'Estudiante') {
    return <Navigate to="/estudiante/dashboard" replace />
  }

  return children
}
