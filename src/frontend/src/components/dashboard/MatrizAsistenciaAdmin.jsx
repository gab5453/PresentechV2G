import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarDays, Download, RefreshCw } from 'lucide-react'
import { obtenerParalelos } from '../../services/adminService'
import { getApiData, getApiErrorMessage } from '../../services/api'
import { obtenerMatrizAsistencia } from '../../services/matrizAsistenciaService'
import { downloadMatrizAsistenciaExcel } from '../../utils/matrizExcel'
import { Button, SearchableSelect, Spinner } from '../common'

function getSchoolYearStart() {
  const today = new Date()
  return today.getMonth() + 1 >= 9 ? today.getFullYear() : today.getFullYear() - 1
}

const statusClasses = {
  P: 'bg-success-bg text-success',
  X: 'bg-error-bg text-error font-semibold',
  '-': 'bg-warning-bg text-warning font-semibold',
}

const rowAlertClasses = {
  amarillo: 'bg-yellow-50 hover:bg-yellow-100',
  rojo: 'bg-red-50 hover:bg-red-100',
  normal: 'hover:bg-muted/40',
}

export function MatrizAsistenciaAdmin() {
  const [paralelos, setParalelos] = useState([])
  const [selectedParalelo, setSelectedParalelo] = useState('')
  const [matriz, setMatriz] = useState(null)
  const [error, setError] = useState('')
  const [isLoadingParalelos, setIsLoadingParalelos] = useState(true)
  const [isLoadingMatriz, setIsLoadingMatriz] = useState(false)

  const anioInicio = useMemo(() => getSchoolYearStart(), [])

  const paraleloOptions = paralelos.map((paralelo) => ({
    value: paralelo.id_paralelo,
    label: paralelo.nombre,
  }))

  const estudiantesConAlerta = useMemo(() => {
    return (matriz?.estudiantes ?? [])
      .filter((student) => student.nivel_alerta && student.nivel_alerta !== 'normal')
      .sort((a, b) => {
        if (b.total_faltas !== a.total_faltas) return b.total_faltas - a.total_faltas
        return b.total_parciales - a.total_parciales
      })
  }, [matriz])

  const loadParalelos = useCallback(async () => {
    setError('')
    setIsLoadingParalelos(true)

    try {
      const response = await obtenerParalelos()
      const data = getApiData(response) ?? []
      setParalelos(data)
      setSelectedParalelo((current) => current || data[0]?.id_paralelo?.toString() || '')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoadingParalelos(false)
    }
  }, [])

  const loadMatriz = useCallback(async () => {
    if (!selectedParalelo) return

    setError('')
    setIsLoadingMatriz(true)

    try {
      const response = await obtenerMatrizAsistencia({
        idParalelo: selectedParalelo,
        anioInicio,
      })
      setMatriz(getApiData(response))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoadingMatriz(false)
    }
  }, [anioInicio, selectedParalelo])

  useEffect(() => {
    loadParalelos()
  }, [loadParalelos])

  useEffect(() => {
    loadMatriz()
  }, [loadMatriz])

  return (
    <section className="rounded-2xl border border-border/50 bg-card/80 shadow-sm">
      <div className="border-b border-border/50 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              Anio lectivo {matriz?.anio_lectivo ?? `${anioInicio}-${anioInicio + 1}`}
            </span>
            <h3 className="mt-3 text-xl font-semibold text-foreground">
              Matriz anual de asistencia
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Seguimiento diario por paralelo. Las filas se alertan automaticamente con 2 o mas
              faltas completas acumuladas.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(240px,320px)_auto_auto] sm:items-end">
            <SearchableSelect
              label="Paralelo"
              options={paraleloOptions}
              value={selectedParalelo}
              onChange={(value) => setSelectedParalelo(value?.toString() ?? '')}
              placeholder="Seleccione un paralelo"
            />
            <Button
              variant="secondary"
              onClick={loadMatriz}
              isLoading={isLoadingMatriz}
              disabled={!selectedParalelo}
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button
              variant="secondary"
              disabled={!matriz}
              onClick={() => downloadMatrizAsistenciaExcel(matriz)}
            >
              <Download className="h-4 w-4" />
              Descargar Excel
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <LegendItem label="P: presente" className="bg-success-bg text-success" />
          <LegendItem label="X: falta completa" className="bg-error-bg text-error" />
          <LegendItem label="-: asistencia parcial" className="bg-warning-bg text-warning" />
          <LegendItem label="Amarillo: 2 faltas" className="bg-yellow-100 text-yellow-800" />
          <LegendItem label="Rojo: 3+ faltas" className="bg-red-100 text-red-800" />
        </div>
      </div>

      {error ? (
        <div className="m-5 flex items-start gap-2 rounded-lg border border-error bg-error-bg p-3 text-sm text-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {isLoadingParalelos || isLoadingMatriz ? (
        <div className="flex min-h-72 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : null}

      {!isLoadingParalelos && !isLoadingMatriz && matriz ? (
        <>
          <AlertasSeguimiento estudiantes={estudiantesConAlerta} />
          <MatrizTable matriz={matriz} />
        </>
      ) : null}

      {!isLoadingParalelos && !isLoadingMatriz && !matriz && !error ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Seleccione un paralelo para generar la matriz.
        </div>
      ) : null}
    </section>
  )
}

function AlertasSeguimiento({ estudiantes }) {
  if (!estudiantes.length) {
    return (
      <div className="m-5 rounded-xl border border-success/20 bg-success-bg/60 p-4 text-sm text-success">
        No hay estudiantes con 2 o mas faltas completas acumuladas en este paralelo.
      </div>
    )
  }

  return (
    <div className="m-5 rounded-xl border border-warning/30 bg-warning-bg/40 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Alertas de seguimiento
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Estudiantes que requieren revision por acumulacion de faltas completas.
          </p>
        </div>
        <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
          {estudiantes.length} estudiante{estudiantes.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {estudiantes.map((student) => (
          <div
            key={student.id_estudiante}
            className={`rounded-lg border p-3 text-sm shadow-sm ${
              student.nivel_alerta === 'rojo'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-yellow-200 bg-yellow-50 text-yellow-900'
            }`}
          >
            <div className="font-semibold">{student.nombre_estudiante}</div>
            <div className="mt-1 text-xs">
              {student.total_faltas} falta{student.total_faltas === 1 ? '' : 's'} completas
              acumuladas
              {student.total_parciales ? `, ${student.total_parciales} parciales` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MatrizTable({ matriz }) {
  const monthGroups = useMemo(() => {
    const groups = []

    matriz.dias.forEach((dia) => {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup?.mes === dia.mes) {
        lastGroup.count += 1
      } else {
        groups.push({ mes: dia.mes, count: 1 })
      }
    })

    return groups
  }, [matriz.dias])

  return (
    <div className="overflow-x-auto">
      <table className="min-w-max border-collapse text-left text-xs">
        <thead>
          <tr className="bg-muted/70 text-muted-foreground">
            <th className="sticky left-0 z-30 min-w-14 border border-border bg-muted px-2 py-2 text-center">
              No.
            </th>
            <th className="sticky left-14 z-30 min-w-64 border border-border bg-muted px-3 py-2">
              Estudiante
            </th>
            {monthGroups.map((group) => (
              <th
                key={group.mes}
                colSpan={group.count}
                className="border border-border px-2 py-2 text-center font-semibold"
              >
                {group.mes}
              </th>
            ))}
            <th colSpan={3} className="border border-border px-2 py-2 text-center">
              Periodo 1
            </th>
            <th colSpan={3} className="border border-border px-2 py-2 text-center">
              Periodo 2
            </th>
            <th colSpan={3} className="border border-border px-2 py-2 text-center">
              Periodo 3
            </th>
            <th colSpan={2} className="border border-border px-2 py-2 text-center">
              Total
            </th>
          </tr>
          <tr className="bg-muted/50 text-muted-foreground">
            <th className="sticky left-0 z-30 border border-border bg-muted px-2 py-2" />
            <th className="sticky left-14 z-30 border border-border bg-muted px-3 py-2" />
            {matriz.dias.map((dia) => (
              <th
                key={`day-${dia.fecha}`}
                className="min-w-8 border border-border px-1 py-1 text-center font-medium"
              >
                {dia.dia_mes}
              </th>
            ))}
            {Array.from({ length: 11 }).map((_, index) => (
              <th key={`summary-head-${index}`} className="border border-border px-2 py-1 text-center">
                {['P', 'X', '-', 'P', 'X', '-', 'P', 'X', '-', 'X', '-'][index]}
              </th>
            ))}
          </tr>
          <tr className="bg-muted/40 text-muted-foreground">
            <th className="sticky left-0 z-30 border border-border bg-muted px-2 py-2" />
            <th className="sticky left-14 z-30 border border-border bg-muted px-3 py-2" />
            {matriz.dias.map((dia) => (
              <th
                key={`weekday-${dia.fecha}`}
                className="min-w-8 border border-border px-1 py-1 text-center"
              >
                {dia.inicial_dia}
              </th>
            ))}
            {Array.from({ length: 11 }).map((_, index) => (
              <th key={`summary-sub-${index}`} className="border border-border px-2 py-1" />
            ))}
          </tr>
        </thead>
        <tbody>
          {matriz.estudiantes.length ? (
            matriz.estudiantes.map((student) => (
              <tr
                key={student.id_estudiante}
                className={rowAlertClasses[student.nivel_alerta] ?? rowAlertClasses.normal}
              >
                <td className="sticky left-0 z-20 border border-border bg-inherit px-2 py-2 text-center font-medium">
                  {student.numero}
                </td>
                <td className="sticky left-14 z-20 max-w-72 border border-border bg-inherit px-3 py-2 font-medium text-foreground">
                  {student.nombre_estudiante}
                </td>
                {matriz.dias.map((dia) => {
                  const status = student.estados_por_fecha?.[dia.fecha] ?? ''
                  return (
                    <td
                      key={`${student.id_estudiante}-${dia.fecha}`}
                      className="min-w-8 border border-border px-1 py-1 text-center"
                    >
                      {status ? (
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded ${statusClasses[status] ?? ''}`}
                        >
                          {status}
                        </span>
                      ) : null}
                    </td>
                  )
                })}
                <SummaryCells summary={student.resumen_periodos?.periodo_1} />
                <SummaryCells summary={student.resumen_periodos?.periodo_2} />
                <SummaryCells summary={student.resumen_periodos?.periodo_3} />
                <td className="border border-border px-2 py-1 text-center font-semibold text-error">
                  {student.total_faltas}
                </td>
                <td className="border border-border px-2 py-1 text-center font-semibold text-warning">
                  {student.total_parciales}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={(matriz.dias?.length ?? 0) + 13}
                className="border border-border px-4 py-10 text-center text-muted-foreground"
              >
                No hay estudiantes activos en este paralelo.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function SummaryCells({ summary }) {
  return (
    <>
      <td className="border border-border px-2 py-1 text-center text-success">
        {summary?.asistencias ?? 0}
      </td>
      <td className="border border-border px-2 py-1 text-center text-error">
        {summary?.faltas ?? 0}
      </td>
      <td className="border border-border px-2 py-1 text-center text-warning">
        {summary?.parciales ?? 0}
      </td>
    </>
  )
}

function LegendItem({ className, label }) {
  return <span className={`rounded-full px-3 py-1 font-medium ${className}`}>{label}</span>
}
