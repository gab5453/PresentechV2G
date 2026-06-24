import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { getApiData, getApiErrorMessage } from '../../services/api'
import { obtenerDashboardAdmin, obtenerDashboardProfesor } from '../../services/dashboardService'
import { Button, Spinner } from '../common'
import { MatrizAsistenciaAdmin } from './MatrizAsistenciaAdmin'

export function DashboardView({ role }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      const response =
        role === 'admin' ? await obtenerDashboardAdmin() : await obtenerDashboardProfesor()

      setDashboardData(getApiData(response))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [role])

  const indicadores = useMemo(() => {
    const data = dashboardData ?? {}
    const asistencia = data.porcentaje_asistencia_global ?? 0
    const estudiantesRiesgo = data.estudiantes_en_riesgo?.length ?? 0

    return {
      asistencia,
      estado:
        estudiantesRiesgo === 0
          ? 'Sin estudiantes en riesgo por ahora.'
          : `${estudiantesRiesgo} estudiante${estudiantesRiesgo === 1 ? '' : 's'} requieren seguimiento.`,
      estudiantesRiesgo,
    }
  }, [dashboardData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">
            {role === 'admin' ? 'Vista General de la Institucion' : 'Resumen de Mis Clases'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estadisticas de asistencia y alertas de estudiantes.
          </p>
        </div>
        <Button variant="secondary" onClick={loadData} isLoading={isLoading}>
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
          <Spinner size="lg" />
        </div>
      ) : null}

      {!isLoading && dashboardData ? (
        <>
          <section className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm">
            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
              <div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {role === 'admin' ? 'Panel administrativo' : 'Panel docente'}
                </span>
                <h3 className="mt-4 text-2xl font-semibold text-foreground">
                  {role === 'admin'
                    ? 'Seguimiento institucional de asistencia'
                    : 'Tu semana academica en un vistazo'}
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Tienes {dashboardData.total_clases} clases activas y{' '}
                  {dashboardData.total_estudiantes} estudiantes registrados. La asistencia global
                  esta en {indicadores.asistencia.toFixed(1)}%.
                </p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Estado general</p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`rounded-xl p-2 ${indicadores.estudiantesRiesgo === 0
                        ? 'bg-success-bg text-success'
                        : 'bg-warning-bg text-warning'
                      }`}
                  >
                    {indicadores.estudiantesRiesgo === 0 ? (
                      <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                    ) : (
                      <AlertTriangle aria-hidden="true" className="h-5 w-5" />
                    )}
                  </span>
                  <p className="text-sm font-medium text-foreground">{indicadores.estado}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="min-w-0 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                icon={Users}
                label="Total estudiantes"
                tone="primary"
                value={dashboardData.total_estudiantes}
                description="En tus cursos activos"
              />
              <MetricCard
                icon={BookOpen}
                label="Clases activas"
                tone="success"
                value={dashboardData.total_clases}
                description="Materias asignadas"
              />
              <MetricCard
                icon={BarChart3}
                label="Tasa de asistencia"
                tone="info"
                value={`${indicadores.asistencia.toFixed(1)}%`}
                description="Promedio global"
              />
            </div>

            {role === 'admin' ? <MatrizAsistenciaAdmin /> : null}

            {role !== 'admin' ? (
              <>
                <RiskPanel estudiantes={dashboardData.estudiantes_en_riesgo ?? []} />
                <AcademicRiskPanel alertas={dashboardData.alertasCalificaciones ?? []} />
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

function MetricCard({ description, icon: Icon, label, tone, value }) {
  const toneClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success-bg text-success',
    info: 'bg-blue-500/10 text-blue-600',
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className={`rounded-xl p-3 ${toneClasses[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

function RiskPanel({ estudiantes }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-xl p-2 ${estudiantes.length ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'
              }`}
          >
            {estudiantes.length ? (
              <AlertTriangle aria-hidden="true" className="h-5 w-5" />
            ) : (
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            )}
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Estudiantes en riesgo</h3>
            <p className="text-sm text-muted-foreground">Casos con 2 o mas faltas.</p>
          </div>
        </div>
        <span className="rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning">
          {estudiantes.length} estudiantes
        </span>
      </div>

      {estudiantes.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle2 aria-hidden="true" className="mx-auto h-10 w-10 text-success" />
          <p className="mt-3 font-medium text-foreground">Todo se ve bien por ahora</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay estudiantes en riesgo de desercion en este momento.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {estudiantes.map((estudiante) => (
            <div
              key={estudiante.id_estudiante}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {estudiante.nombres} {estudiante.apellidos}
                </p>
                <p className="text-sm text-muted-foreground">Requiere seguimiento</p>
              </div>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-error/10 px-2 text-sm font-semibold text-error">
                {estudiante.numero_faltas}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function AcademicRiskPanel({ alertas }) {
  const navigate = useNavigate()

  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm mt-6">
      <div className="flex flex-col gap-3 border-b border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-xl p-2 ${alertas.length ? 'bg-error/10 text-error' : 'bg-success-bg text-success'
              }`}
          >
            {alertas.length ? (
              <BookOpen aria-hidden="true" className="h-5 w-5" />
            ) : (
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            )}
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Rendimiento académico</h3>
            <p className="text-sm text-muted-foreground">Estudiantes con promedio menor a 7.5.</p>
          </div>
        </div>
        <span className="rounded-full bg-error/10 px-3 py-1 text-xs font-semibold text-error">
          {alertas.length} alertas
        </span>
      </div>

      {alertas.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle2 aria-hidden="true" className="mx-auto h-10 w-10 text-success" />
          <p className="mt-3 font-medium text-foreground">Excelentes calificaciones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay estudiantes con bajo rendimiento en este momento.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {alertas.map((alerta) => (
            <div
              key={`${alerta.estudianteId}-${alerta.claseId}`}
              onClick={() => navigate(`/clases/${alerta.claseId}/calificaciones`)}
              className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40 cursor-pointer transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {alerta.nombreEstudiante}
                </p>
                <p className="text-sm text-muted-foreground">Bajo rendimiento en {alerta.nombreMateria}</p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-error/10 px-3 py-1 text-sm font-semibold text-error">
                Promedio: {alerta.promedioActual.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
