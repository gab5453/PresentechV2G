import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function StudentRoute({ children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/estudiante/login" replace />
  }

  // Ensure they have the correct role (MVP sets role='Estudiante' on login)
  if (user?.role !== 'Estudiante') {
    return <Navigate to="/clases" replace />
  }

  return children
}
