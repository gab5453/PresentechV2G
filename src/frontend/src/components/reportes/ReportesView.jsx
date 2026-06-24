import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileText,
  Filter,
  Printer,
  Users,
} from 'lucide-react'
import { Button, Input, SearchableSelect, Spinner } from '../common'
import { getApiData, getApiErrorMessage } from '../../services/api'
import {
  obtenerEstudiantesClase,
  obtenerMisClases,
} from '../../services/clasesService'
import {
  generarReporteAsistencia,
  generarReporteCalificaciones,
} from '../../services/reportesService'
import { ReportPreviewModal } from './ReportPreviewModal'

const today = new Date()

function formatIsoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getActiveSchoolYear(referenceDate) {
  const currentYear = referenceDate.getFullYear()
  const startYear = referenceDate.getMonth() >= 8 ? currentYear : currentYear - 1

  return {
    start: formatIsoDate(startYear, 9, 1),
    end: formatIsoDate(startYear + 1, 6, 30),
    startYear,
    endYear: startYear + 1,
  }
}

const schoolYear = getActiveSchoolYear(today)
const todayIso = formatIsoDate(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate(),
)
const defaultEndDate =
  todayIso < schoolYear.start
    ? schoolYear.start
    : todayIso > schoolYear.end
      ? schoolYear.end
      : todayIso

const quarterOptions = [
  { value: '', label: 'Rango personalizado' },
  { value: '1', label: 'Primer trimestre' },
  { value: '2', label: 'Segundo trimestre' },
  { value: '3', label: 'Tercer trimestre' },
]

const reportTypeOptions = [
  { value: 'grupal', label: 'Reporte grupal' },
  { value: 'individual', label: 'Reporte individual' },
]

function getQuarterDates(quarter) {
  const periods = {
    1: {
      start: formatIsoDate(schoolYear.startYear, 9, 1),
      end: formatIsoDate(schoolYear.startYear, 12, 31),
    },
    2: {
      start: formatIsoDate(schoolYear.endYear, 1, 1),
      end: formatIsoDate(schoolYear.endYear, 3, 31),
    },
    3: {
      start: formatIsoDate(schoolYear.endYear, 4, 1),
      end: formatIsoDate(schoolYear.endYear, 6, 30),
    },
  }

  return periods[quarter] ?? null
}

function getStatusClasses(status) {
  if (status === 'Excelente') return 'bg-success-bg text-success'
  if (status === 'Regular') return 'bg-warning-bg text-warning'
  return 'bg-error-bg text-error'
}

export function ReportesView() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [filters, setFilters] = useState({
    reportCategory: 'asistencia',
    startDate: schoolYear.start,
    endDate: defaultEndDate,
    quarter: '',
    classId: '',
    studentId: '',
    reportType: 'grupal',
  })
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreatingPdf, setIsCreatingPdf] = useState(false)
  const [preview, setPreview] = useState({ fileName: '', url: '' })

  useEffect(() => {
    let isActive = true

    obtenerMisClases()
      .then((response) => {
        if (isActive) setClasses(getApiData(response) ?? [])
      })
      .catch((requestError) => {
        if (isActive) setError(getApiErrorMessage(requestError))
      })
      .finally(() => {
        if (isActive) setIsLoadingOptions(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!filters.classId) {
      setStudents([])
      return
    }

    let isActive = true
    setIsLoadingStudents(true)

    obtenerEstudiantesClase(filters.classId)
      .then((response) => {
        if (isActive) setStudents(getApiData(response) ?? [])
      })
      .catch((requestError) => {
        if (isActive) setError(getApiErrorMessage(requestError))
      })
      .finally(() => {
        if (isActive) setIsLoadingStudents(false)
      })

    return () => {
      isActive = false
    }
  }, [filters.classId])

  useEffect(
    () => () => {
      if (preview.url) URL.revokeObjectURL(preview.url)
    },
    [preview.url],
  )

  const classOptions = useMemo(
    () =>
      classes.map((item) => ({
        value: item.id_clase.toString(),
        label: `${item.materia} de ${item.nombre_paralelo}`,
      })),
    [classes],
  )

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.id_estudiante.toString(),
        label: `${student.apellidos}, ${student.nombres}`,
      })),
    [students],
  )

  const updateFilter = (name, value) => {
    setReport(null)
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleQuarterChange = (quarter) => {
    const dates = getQuarterDates(quarter)
    setReport(null)
    setFilters((current) => ({
      ...current,
      quarter,
      startDate: dates?.start ?? current.startDate,
      endDate: dates?.end ?? current.endDate,
    }))
  }

  const handleClassChange = (classId) => {
    setStudents([])
    setReport(null)
    setFilters((current) => ({
      ...current,
      classId,
      studentId: '',
    }))
  }

  const validateFilters = () => {
    if (!filters.classId) return 'Seleccione un curso.'
    if (!filters.startDate || !filters.endDate) return 'Seleccione el período del reporte.'
    if (filters.startDate > filters.endDate) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin.'
    }
    if (
      filters.startDate < schoolYear.start ||
      filters.endDate > schoolYear.end
    ) {
      return `Las fechas deben estar dentro del año lectivo ${schoolYear.startYear}-${schoolYear.endYear}.`
    }
    if (filters.reportType === 'individual' && !filters.studentId) {
      return 'Seleccione un estudiante para el reporte individual.'
    }
    return ''
  }

  const handleGenerate = async () => {
    const validationError = validateFilters()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsGenerating(true)

    try {
      const payload = {
        idClase: Number(filters.classId),
        fechaInicio: filters.startDate,
        fechaFin: filters.endDate,
        idEstudiante:
          filters.reportType === 'individual'
            ? Number(filters.studentId)
            : undefined,
      }
      const response =
        filters.reportCategory === 'asistencia'
          ? await generarReporteAsistencia(payload)
          : await generarReporteCalificaciones(payload)
      
      setReport(getApiData(response))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsGenerating(false)
    }
  }

  const buildPdf = async () => {
    if (!report) return null
    setIsCreatingPdf(true)
    setError('')
    try {
      if (filters.reportCategory === 'asistencia') {
        const { createReportPdf } = await import('../../utils/reportPdf')
        return await createReportPdf(report)
      } else {
        const { createReportCalificacionesPdf } = await import('../../utils/reportCalificacionesPdf')
        return await createReportCalificacionesPdf(report)
      }
    } catch (pdfError) {
      setError(pdfError.message || 'No se pudo generar el PDF.')
      return null
    } finally {
      setIsCreatingPdf(false)
    }
  }

  const handleDownload = async () => {
    const doc = await buildPdf()
    if (doc) {
      if (filters.reportCategory === 'asistencia') {
        const { getReportFileName } = await import('../../utils/reportPdf')
        doc.save(getReportFileName(report))
      } else {
        const { getReportFileName } = await import('../../utils/reportCalificacionesPdf')
        doc.save(getReportFileName(report))
      }
    }
  }

  const handlePreview = async () => {
    const doc = await buildPdf()
    if (!doc) return

    if (preview.url) URL.revokeObjectURL(preview.url)
    const url = URL.createObjectURL(doc.output('blob'))
    
    let fileName = ''
    if (filters.reportCategory === 'asistencia') {
      const { getReportFileName } = await import('../../utils/reportPdf')
      fileName = getReportFileName(report)
    } else {
      const { getReportFileName } = await import('../../utils/reportCalificacionesPdf')
      fileName = getReportFileName(report)
    }
    setPreview({ fileName, url })
  }

  const closePreview = () => {
    if (preview.url) URL.revokeObjectURL(preview.url)
    setPreview({ fileName: '', url: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-foreground">Reportes Académicos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta indicadores de asistencia y calificaciones por curso o estudiante.
        </p>
      </div>

      <section className="rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Filtros del reporte</h3>
            <p className="text-xs text-muted-foreground">
              Año lectivo {schoolYear.startYear}-{schoolYear.endYear}: 1 de septiembre al 30 de junio.
            </p>
          </div>
        </div>

        {isLoadingOptions ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-4 flex gap-4 border-b border-border/50 pb-4 mb-2">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  filters.reportCategory === 'asistencia'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                onClick={() => updateFilter('reportCategory', 'asistencia')}
              >
                Reporte de Asistencia
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  filters.reportCategory === 'calificaciones'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                onClick={() => updateFilter('reportCategory', 'calificaciones')}
              >
                Reporte de Calificaciones
              </button>
            </div>
            <SearchableSelect
              label="Trimestre"
              options={quarterOptions}
              value={filters.quarter}
              onChange={handleQuarterChange}
            />
            <Input
              className="disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              disabled={Boolean(filters.quarter)}
              label="Fecha inicio"
              max={filters.endDate < schoolYear.end ? filters.endDate : schoolYear.end}
              min={schoolYear.start}
              type="date"
              value={filters.startDate}
              onChange={(value) => updateFilter('startDate', value)}
            />
            <Input
              className="disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              disabled={Boolean(filters.quarter)}
              label="Fecha fin"
              max={schoolYear.end}
              min={filters.startDate > schoolYear.start ? filters.startDate : schoolYear.start}
              type="date"
              value={filters.endDate}
              onChange={(value) => updateFilter('endDate', value)}
            />
            <SearchableSelect
              label="Curso"
              options={classOptions}
              placeholder="Seleccione materia y paralelo"
              value={filters.classId}
              onChange={handleClassChange}
            />
            <SearchableSelect
              label="Tipo de reporte"
              options={reportTypeOptions}
              value={filters.reportType}
              onChange={(value) => {
                setFilters((current) => ({
                  ...current,
                  reportType: value,
                  studentId: value === 'grupal' ? '' : current.studentId,
                }))
                setReport(null)
              }}
            />
            {filters.reportType === 'individual' ? (
              <div className="relative">
                <SearchableSelect
                  label="Estudiante"
                  options={studentOptions}
                  placeholder={
                    filters.classId
                      ? 'Seleccione un estudiante'
                      : 'Seleccione primero un curso'
                  }
                  value={filters.studentId}
                  onChange={(value) => updateFilter('studentId', value)}
                />
                {isLoadingStudents ? (
                  <div className="absolute right-10 top-10">
                    <Spinner size="sm" />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <Button
            disabled={isLoadingOptions}
            isLoading={isGenerating}
            onClick={handleGenerate}
          >
            <BarChart3 className="h-4 w-4" />
            Generar reporte
          </Button>
        </div>
      </section>

      {report ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={Users}
              label="Estudiantes"
              value={report.resumen.total_estudiantes}
            />
            {filters.reportCategory === 'asistencia' ? (
              <>
                <SummaryCard
                  icon={BarChart3}
                  label="Asistencia promedio"
                  value={`${report.resumen.promedio_asistencia.toFixed(1)}%`}
                />
                <SummaryCard
                  icon={AlertTriangle}
                  label="Faltas"
                  value={report.resumen.total_faltas}
                />
                <SummaryCard
                  icon={FileText}
                  label="Atrasos"
                  value={report.resumen.total_atrasos}
                />
              </>
            ) : (
              <>
                <SummaryCard
                  icon={BarChart3}
                  label="Promedio Curso"
                  value={`${report.resumen.promedio_curso.toFixed(2)}`}
                />
                <SummaryCard
                  icon={FileText}
                  label="Aprobados"
                  value={report.resumen.aprobados}
                />
                <SummaryCard
                  icon={AlertTriangle}
                  label="En Riesgo / Reprobados"
                  value={`${report.resumen.en_riesgo} / ${report.resumen.reprobados}`}
                />
              </>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-border/50 bg-card/70 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{report.curso}</h3>
                <p className="text-sm text-muted-foreground">
                  {report.docente} · {report.fecha_inicio} a {report.fecha_fin}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  isLoading={isCreatingPdf}
                  variant="secondary"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button isLoading={isCreatingPdf} onClick={handlePreview}>
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  {filters.reportCategory === 'asistencia' ? (
                    <tr>
                      <th className="px-4 py-3 font-medium">Estudiante</th>
                      <th className="px-4 py-3 font-medium">Curso</th>
                      <th className="px-4 py-3 text-center font-medium">Asistencias</th>
                      <th className="px-4 py-3 text-center font-medium">Faltas</th>
                      <th className="px-4 py-3 text-center font-medium">Atrasos</th>
                      <th className="px-4 py-3 text-center font-medium">Porcentaje</th>
                      <th className="px-4 py-3 text-center font-medium">Estado</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3 font-medium">Estudiante</th>
                      <th className="px-4 py-3 font-medium">Curso</th>
                      <th className="px-4 py-3 text-center font-medium">Promedio Parcial</th>
                      <th className="px-4 py-3 text-center font-medium">Promedio Final</th>
                      <th className="px-4 py-3 text-center font-medium">Estado</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-border">
                  {filters.reportCategory === 'asistencia' ? (
                    report.estudiantes.map((student) => (
                      <tr className="hover:bg-muted/35" key={student.id_estudiante}>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {student.nombre_estudiante}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{student.curso}</td>
                        <td className="px-4 py-3 text-center">{student.total_asistencias}</td>
                        <td className="px-4 py-3 text-center">{student.total_faltas}</td>
                        <td className="px-4 py-3 text-center">{student.total_atrasos}</td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {student.porcentaje_asistencia.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              student.estado_academico,
                            )}`}
                          >
                            {student.estado_academico}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    report.estudiantes.map((student) => (
                      <tr className="hover:bg-muted/35" key={student.id_estudiante}>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {student.nombre_estudiante}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{student.curso}</td>
                        <td className="px-4 py-3 text-center">{student.promedio_parcial.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center font-semibold">{student.promedio_final.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              student.estado,
                            )}`}
                          >
                            {student.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-border/50 bg-card/70 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">Alertas automáticas</h3>
            </div>
            {report.alertas.length ? (
              <div className="grid gap-2">
                {report.alertas.map((alert) => (
                  <div
                    className="rounded-lg border border-warning/20 bg-warning-bg px-3 py-2 text-sm text-warning"
                    key={alert.id_estudiante}
                  >
                    <span className="font-semibold">{alert.nombre_estudiante}:</span>{' '}
                    {alert.mensaje}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No se identificaron alertas de riesgo ni reprobados.
              </p>
            )}
          </section>
        </>
      ) : null}

      <ReportPreviewModal
        fileName={preview.fileName}
        isOpen={Boolean(preview.url)}
        pdfUrl={preview.url}
        onClose={closePreview}
        onDownload={handleDownload}
      />
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </article>
  )
}
