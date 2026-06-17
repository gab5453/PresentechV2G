import { ArrowLeft, BookOpen, CalendarClock, ClipboardCheck, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Spinner } from '../../components/common'
import { ClasesGrid } from '../../components/clases'
import { AppLayout } from '../../components/layout'
import { getApiData, getApiErrorMessage } from '../../services/api'
import { obtenerMisClases } from '../../services/clasesService'
import { AsistenciasRegistradasView, DashboardView } from '../../components/dashboard'
import { ReportesView } from '../../components/reportes'
import { OpinionesView } from '../../components/opiniones'
import { formatHorario, getProximaClase } from '../../utils/claseUtils'

export function ClasesPage() {
  const [clases, setClases] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('clases')
  const [selectedCurso, setSelectedCurso] = useState('')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'asistencias-registradas', label: 'Asistencias Registradas' },
    { id: 'clases', label: 'Mis Clases' },
    { id: 'reportes', label: 'Reportes' },
    { id: 'opiniones', label: 'Opiniones y Recomendaciones' },
  ]

  const loadClases = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      const response = await obtenerMisClases()
      setClases(getApiData(response) ?? [])
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cursos = useMemo(() => {
    const cursosMap = new Map()

    clases.forEach((clase) => {
      if (!clase.nombre_paralelo) return

      const curso = cursosMap.get(clase.nombre_paralelo) ?? {
        nombre: clase.nombre_paralelo,
        materias: new Set(),
        totalHorarios: 0,
      }

      curso.materias.add(clase.materia)
      curso.totalHorarios += clase.horarios?.length ?? 0
      cursosMap.set(clase.nombre_paralelo, curso)
    })

    return [...cursosMap.values()]
      .map((curso) => ({
        ...curso,
        totalMaterias: curso.materias.size,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [clases])

  const clasesFiltradas = useMemo(() => {
    if (!selectedCurso) return clases

    return clases.filter((clase) => clase.nombre_paralelo === selectedCurso)
  }, [clases, selectedCurso])

  const resumenDocente = useMemo(() => {
    const totalHorarios = clases.reduce(
      (total, clase) => total + (clase.horarios?.length ?? 0),
      0,
    )
    const materias = new Set(clases.map((clase) => clase.materia).filter(Boolean))
    const now = new Date()
    const todayOrder = now.getDay() === 0 ? 7 : now.getDay()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const minutesUntil = (horario) => {
      const [hours, minutes] = horario.hora_inicio.toString().slice(0, 5).split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const daysUntil = (horario.orden_dia - todayOrder + 7) % 7
      const offset = daysUntil * 24 * 60 + startMinutes - currentMinutes

      return offset >= 0 ? offset : offset + 7 * 24 * 60
    }
    const clasesConProxima = clases
      .map((clase) => ({
        clase,
        proxima: getProximaClase(clase.horarios),
      }))
      .filter((item) => item.proxima)
      .sort((a, b) => minutesUntil(a.proxima) - minutesUntil(b.proxima))

    return {
      proximaClase: clasesConProxima[0] ?? null,
      totalCursos: cursos.length,
      totalHorarios,
      totalMaterias: materias.size,
    }
  }, [clases, cursos.length])

  useEffect(() => {
    if (!selectedCurso) return

    const cursoExiste = cursos.some((curso) => curso.nombre === selectedCurso)
    if (!cursoExiste) {
      setSelectedCurso('')
    }
  }, [cursos, selectedCurso])

  useEffect(() => {
    let isActive = true

    async function loadInitialClases() {
      try {
        const response = await obtenerMisClases()

        if (isActive) {
          setClases(getApiData(response) ?? [])
        }
      } catch (requestError) {
        if (isActive) {
          setError(getApiErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadInitialClases()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <AppLayout title="Mis clases">
      <section className="container mx-auto max-w-6xl px-4 py-4 md:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-medium text-foreground">Panel Docente</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa tus estadísticas y clases asignadas.
            </p>
          </div>
          {activeTab === 'clases' && (
            <Button variant="secondary" onClick={loadClases} isLoading={isLoading}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Actualizar
            </Button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border/50 bg-card/60 p-1.5 shadow-sm backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in rounded-2xl border border-border/50 bg-card/80 p-4 shadow-xl backdrop-blur-md md:p-6">
          {activeTab === 'dashboard' && <DashboardView role="profesor" />}
          {activeTab === 'asistencias-registradas' && (
            <AsistenciasRegistradasView role="profesor" />
          )}
          {activeTab === 'reportes' && <ReportesView />}
          {activeTab === 'opiniones' && <OpinionesView />}

          {activeTab === 'clases' && (
            <>
              {error ? (
                <p className="mb-4 rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
                  {error}
                </p>
              ) : null}

              {isLoading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : null}

              {!isLoading && clases.length ? (
                <>
                  {!selectedCurso ? (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="min-w-0">
                        <div className="mb-6 overflow-hidden rounded-2xl border border-border/50 bg-card/70 shadow-sm">
                          <div className="border-b border-border/50 px-4 py-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              Video tutorial de uso
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Revisa esta guía rápida si necesitas recordar cómo usar la aplicación.
                            </p>
                          </div>
                          <div className="aspect-video bg-muted">
                            <iframe
                              className="h-full w-full"
                              src="https://drive.google.com/file/d/1t-1KDgvkTR5iqHv_nl06fqmmqgSFTQlE/preview"
                              title="Video tutorial de PresenTech"
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                            />
                          </div>
                        </div>

                        <div className="mb-5">
                          <h3 className="text-lg font-semibold text-foreground">
                            Selecciona un curso
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Luego podrás escoger la materia y continuar con el flujo actual.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {cursos.map((curso) => (
                            <button
                              key={curso.nombre}
                              type="button"
                              onClick={() => setSelectedCurso(curso.nombre)}
                              className="rounded-xl border border-border/50 bg-card/70 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-base font-semibold text-foreground">
                                    {curso.nombre}
                                  </h3>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {curso.totalMaterias}{' '}
                                    {curso.totalMaterias === 1 ? 'materia' : 'materias'}
                                  </p>
                                </div>
                                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                                  <BookOpen aria-hidden="true" className="h-5 w-5" />
                                </span>
                              </div>

                              <div className="rounded-lg bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
                                {curso.totalHorarios}{' '}
                                {curso.totalHorarios === 1
                                  ? 'horario semanal'
                                  : 'horarios semanales'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
                        <section className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm">
                          <div className="mb-4 flex items-center gap-3">
                            <span className="rounded-xl bg-primary/10 p-2 text-primary">
                              <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div>
                              <h3 className="font-semibold text-foreground">Resumen docente</h3>
                              <p className="text-sm text-muted-foreground">Carga semanal asignada</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <StatCard label="Cursos" value={resumenDocente.totalCursos} />
                            <StatCard label="Materias" value={resumenDocente.totalMaterias} />
                            <StatCard label="Horarios" value={resumenDocente.totalHorarios} />
                          </div>
                        </section>

                        <section className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm">
                          <div className="mb-3 flex items-center gap-3">
                            <span className="rounded-xl bg-primary/10 p-2 text-primary">
                              <CalendarClock aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <h3 className="font-semibold text-foreground">Próxima clase</h3>
                          </div>

                          {resumenDocente.proximaClase ? (
                            <div className="rounded-xl bg-primary/5 p-3">
                              <p className="font-medium text-foreground">
                                {resumenDocente.proximaClase.clase.materia}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {resumenDocente.proximaClase.clase.nombre_paralelo}
                              </p>
                              <p className="mt-3 text-sm font-medium text-primary">
                                {formatHorario(resumenDocente.proximaClase.proxima)}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No hay horarios disponibles por ahora.
                            </p>
                          )}
                        </section>

                        <section className="rounded-2xl border border-border/50 bg-card/70 p-4 shadow-sm">
                          <h3 className="font-semibold text-foreground">Guía rápida</h3>
                          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                            <QuickStep number="1" text="Selecciona el curso." />
                            <QuickStep number="2" text="Elige la materia correspondiente." />
                            <QuickStep number="3" text="Abre el calendario semanal." />
                            <QuickStep number="4" text="Registra o actualiza la asistencia." />
                          </ol>
                        </section>
                      </aside>
                    </div>
                  ) : (
                    <>
                      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Curso seleccionado</p>
                          <h3 className="text-lg font-semibold text-foreground">{selectedCurso}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {clasesFiltradas.length}{' '}
                            {clasesFiltradas.length === 1
                              ? 'materia disponible'
                              : 'materias disponibles'}
                          </p>
                        </div>
                        <Button variant="secondary" onClick={() => setSelectedCurso('')}>
                          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                          Volver a cursos
                        </Button>
                      </div>

                      <ClasesGrid clases={clasesFiltradas} onImportSuccess={loadClases} />
                    </>
                  )}
                </>
              ) : null}

              {!isLoading && !clases.length && !error ? (
                <div className="rounded-xl border border-border/50 bg-card/60 p-5 text-center shadow-sm backdrop-blur-sm">
                  <h2 className="text-lg font-medium text-foreground">
                    No hay clases asignadas
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cuando tengas clases registradas, aparecerán en esta sección.
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </AppLayout>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-primary/5 px-3 py-3 text-center">
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function QuickStep({ number, text }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {number}
      </span>
      <span>{text}</span>
    </li>
  )
}
