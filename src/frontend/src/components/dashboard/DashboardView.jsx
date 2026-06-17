import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquareText,
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
            {role === 'admin' ? 'Vista General de la Institución' : 'Resumen de Mis Clases'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estadísticas de asistencia y alertas de estudiantes.
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
                  Panel docente
                </span>
                <h3 className="mt-4 text-2xl font-semibold text-foreground">
                  Tu semana académica en un vistazo
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Tienes {dashboardData.total_clases} clases activas y{' '}
                  {dashboardData.total_estudiantes} estudiantes registrados. La asistencia
                  global está en {indicadores.asistencia.toFixed(1)}%.
                </p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">Estado general</p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`rounded-xl p-2 ${
                      indicadores.estudiantesRiesgo === 0
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

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
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

              <RiskPanel estudiantes={dashboardData.estudiantes_en_riesgo ?? []} />
            </div>

            <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
              <section className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm">
                <h3 className="font-semibold text-foreground">Estado de asistencia</h3>
                <div className="mt-4 rounded-xl bg-primary/5 p-4">
                  <p className="text-3xl font-semibold text-foreground">
                    {indicadores.asistencia.toFixed(1)}%
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Asistencia global registrada.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm">
                <h3 className="font-semibold text-foreground">Acciones rápidas</h3>
                <div className="mt-3 grid gap-2">
                  <ActionHint icon={ClipboardList} text="Selecciona un curso en Mis Clases." />
                  <ActionHint icon={FileText} text="Genera reportes por fecha o estudiante." />
                  <ActionHint icon={MessageSquareText} text="Registra opiniones y recomendaciones." />
                </div>
              </section>

              <section className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm">
                <h3 className="font-semibold text-foreground">Lectura rápida</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Si aparecen estudiantes en riesgo, revisa sus reportes individuales antes de
                  tomar decisiones académicas.
                </p>
              </section>
            </aside>
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
            className={`rounded-xl p-2 ${
              estudiantes.length ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'
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
            <p className="text-sm text-muted-foreground">Casos con 2 o más faltas.</p>
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
            No hay estudiantes en riesgo de deserción en este momento.
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

function ActionHint({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-3 text-sm text-muted-foreground">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
      <span>{text}</span>
    </div>
  )
}
