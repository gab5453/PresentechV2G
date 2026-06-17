import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarCheck, RefreshCw, Search } from 'lucide-react'
import { obtenerProfesores } from '../../services/adminService'
import { getApiData, getApiErrorMessage } from '../../services/api'
import { obtenerAsistenciasRegistradas } from '../../services/dashboardService'
import { Button, SearchableSelect, Spinner } from '../common'

function toDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('es-EC', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function AsistenciasRegistradasView({ role }) {
  const isAdmin = role === 'admin'
  const [fecha, setFecha] = useState(toDateInputValue())
  const [idProfesor, setIdProfesor] = useState('')
  const [profesores, setProfesores] = useState([])
  const [registros, setRegistros] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfesores, setIsLoadingProfesores] = useState(false)

  const profesorOptions = useMemo(
    () => [
      { value: '', label: 'Todos los docentes' },
      ...profesores.map((profesor) => ({
        value: profesor.id_profesor?.toString(),
        label: `${profesor.nombres} ${profesor.apellidos}`,
      })),
    ],
    [profesores],
  )

  const resumen = useMemo(() => {
    return registros.reduce(
      (acc, registro) => ({
        clases: acc.clases + 1,
        estudiantes: acc.estudiantes + registro.total_estudiantes,
        presentes: acc.presentes + registro.total_presentes,
        ausentes: acc.ausentes + registro.total_ausentes,
        atrasados: acc.atrasados + registro.total_atrasados,
      }),
      { clases: 0, estudiantes: 0, presentes: 0, ausentes: 0, atrasados: 0 },
    )
  }, [registros])

  const loadProfesores = useCallback(async () => {
    if (!isAdmin) return

    setIsLoadingProfesores(true)
    try {
      const response = await obtenerProfesores()
      setProfesores(getApiData(response) ?? [])
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoadingProfesores(false)
    }
  }, [isAdmin])

  const loadRegistros = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      const response = await obtenerAsistenciasRegistradas({
        fecha,
        idProfesor: isAdmin ? idProfesor : undefined,
      })
      setRegistros(getApiData(response) ?? [])
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [fecha, idProfesor, isAdmin])

  useEffect(() => {
    loadProfesores()
  }, [loadProfesores])

  useEffect(() => {
    loadRegistros()
  }, [loadRegistros])

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <CalendarCheck className="h-3.5 w-3.5" />
              Historico de asistencia
            </span>
            <h2 className="mt-3 text-xl font-semibold text-foreground">
              Asistencias Registradas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifica las clases que ya fueron registradas y sus totales de asistencia.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[180px_minmax(220px,300px)_auto] md:items-end">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-foreground">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {isAdmin ? (
              <SearchableSelect
                label="Docente"
                options={profesorOptions}
                value={idProfesor}
                onChange={(value) => setIdProfesor(value?.toString() ?? '')}
                placeholder="Todos los docentes"
                disabled={isLoadingProfesores}
              />
            ) : (
              <div className="hidden md:block" />
            )}

            <Button variant="secondary" onClick={loadRegistros} isLoading={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-5">
        <SummaryCard label="Clases registradas" value={resumen.clases} />
        <SummaryCard label="Estudiantes" value={resumen.estudiantes} />
        <SummaryCard label="Presentes" value={resumen.presentes} tone="success" />
        <SummaryCard label="Ausentes" value={resumen.ausentes} tone="error" />
        <SummaryCard label="Atrasados" value={resumen.atrasados} tone="warning" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
          <Search className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">
            Registros del {formatDate(fecha)}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : null}

        {!isLoading && registros.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Hora</th>
                  {isAdmin ? <th className="px-4 py-3 font-semibold">Docente</th> : null}
                  <th className="px-4 py-3 font-semibold">Materia</th>
                  <th className="px-4 py-3 font-semibold">Curso</th>
                  <th className="px-4 py-3 text-center font-semibold">Presentes</th>
                  <th className="px-4 py-3 text-center font-semibold">Ausentes</th>
                  <th className="px-4 py-3 text-center font-semibold">Atrasados</th>
                  <th className="px-4 py-3 text-center font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {registros.map((registro) => (
                  <tr key={registro.id_registro} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {registro.hora_inicio}-{registro.hora_fin}
                    </td>
                    {isAdmin ? <td className="px-4 py-3">{registro.docente}</td> : null}
                    <td className="px-4 py-3">{registro.materia}</td>
                    <td className="px-4 py-3">{registro.paralelo}</td>
                    <td className="px-4 py-3 text-center text-success">
                      {registro.total_presentes}
                    </td>
                    <td className="px-4 py-3 text-center text-error">
                      {registro.total_ausentes}
                    </td>
                    <td className="px-4 py-3 text-center text-warning">
                      {registro.total_atrasados}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {registro.total_estudiantes}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(registro.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !registros.length ? (
          <div className="p-10 text-center">
            <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">No hay asistencias registradas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No se encontraron registros para los filtros seleccionados.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function SummaryCard({ label, value, tone = 'primary' }) {
  const toneClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success-bg',
    error: 'text-error bg-error-bg',
    warning: 'text-warning bg-warning-bg',
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className={`mt-3 inline-flex rounded-xl px-3 py-1 text-2xl font-bold ${toneClasses[tone]}`}>
        {value}
      </p>
    </div>
  )
}
