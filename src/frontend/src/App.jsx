import { Navigate, Route, Routes } from 'react-router-dom'
import { AsistenciaPage } from './pages/AsistenciaPage'
import { AppLayout } from './components/layout'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'
import { ApiTesterPage } from './pages/ApiTesterPage.jsx'
import { CalendarioPage } from './pages/CalendarioPage'
import { ClasesPage } from './pages/ClasesPage'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage.jsx'
import { AdminRoute } from './routes/AdminRoute.jsx'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminPage } from './pages/AdminPage'
import CalificacionesView from './pages/CalificacionesPage/CalificacionesView'
import { StudentLoginPage } from './pages/StudentLoginPage'
import { StudentRoute } from './routes/StudentRoute.jsx'
import { StudentDashboardView } from './pages/StudentDashboardPage'
import { StudentClasesView } from './pages/StudentClasesPage'

function App() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      {/* Docentes Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/clases" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pruebas"
        element={
          <ProtectedRoute>
            <ApiTesterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clases"
        element={
          <ProtectedRoute>
            <ClasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clases/:id/calendario"
        element={
          <ProtectedRoute>
            <CalendarioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clases/:idClase/calificaciones"
        element={
          <ProtectedRoute>
            <CalificacionesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendario"
        element={
          <ProtectedRoute>
            <Navigate to="/clases" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asistencia"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Asistencia" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asistencia/:idHorario/:fecha"
        element={
          <ProtectedRoute>
            <AsistenciaPage />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route path="/estudiante/login" element={<StudentLoginPage />} />
      <Route
        element={
          <StudentRoute>
            <AppLayout />
          </StudentRoute>
        }
      >
        <Route path="/estudiante/dashboard" element={<StudentDashboardView />} />
        <Route path="/estudiante/clases/:idClase" element={<StudentClasesView />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
