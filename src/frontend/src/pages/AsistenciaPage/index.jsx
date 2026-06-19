import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AsistenciaForm } from '../../components/asistencias'
import { Button, Spinner } from '../../components/common'
import { AppLayout } from '../../components/layout'
import { useAsistencia } from '../../hooks/useAsistencia'
import { getApiErrorMessage } from '../../services/api'
import {
  actualizarAsistencia,
  registrarAsistencia,
} from '../../services/asistenciasService'

function calculateResumen(asistencias) {
  return {
    atrasados: asistencias.filter((item) => item.atrasado).length,
    ausentes: asistencias.filter((item) => !item.asistio && !item.atrasado).length,
    presentes: asistencias.filter((item) => item.asistio || item.atrasado).length,
  }
}

export function AsistenciaPage() {
  const navigate = useNavigate()
  const { fecha, idHorario } = useParams()
  const {
    asistencias,
    clase,
    error,
    isEditing,
    isLoading,
    observacionesSesion,
    registroExistente,
    setAsistencias,
    setObservacionesSesion,
    fechaFormateada,
    irSemanaAnterior,
    irSemanaSiguiente,
    irHoy
  } = useAsistencia(idHorario, fecha)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')

  const resumen = useMemo(() => calculateResumen(asistencias), [asistencias])

  const handleChangeAsistencia = (updated) => {
    setAsistencias((current) =>
      current.map((item) =>
        item.id_estudiante === updated.id_estudiante ? updated : item,
      ),
    )
  }

  const validateForm = () => {
    const missingJustification = asistencias.find(
      (item) => item.atrasado && !item.justificativo?.trim(),
    )

    if (missingJustification) {
      setSaveError('Todo estudiante marcado como atrasado debe tener justificativo.')
      return false
    }

    return true
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSaveError('')
    setSaveSuccess('')

    if (validateForm()) {
      setShowConfirm(true)
    }
  }

  const saveAttendance = async () => {
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess('')

    const payload = {
      asistencias,
      fecha: fechaFormateada,
      id_horario: Number(idHorario),
      observaciones_sesion: observacionesSesion || null,
    }

    try {
      if (isEditing) {
        await actualizarAsistencia(registroExistente.id_registro, payload)
        setSaveSuccess('Asistencia actualizada con éxito.')
      } else {
        await registrarAsistencia(payload)
        setSaveSuccess('Asistencia registrada con éxito.')
      }

      setShowConfirm(false)
      
      // Mensaje de confirmación explícito antes de redirigir
      setTimeout(() => {
        alert(isEditing ? '¡Lista de asistencia actualizada con éxito!' : '¡Lista de asistencia guardada con éxito!')
        navigate('/clases')
      }, 100)
    } catch (requestError) {
      setSaveError(getApiErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout title="Asistencia">
      <section className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
        <div className="mb-6">
          <Button asChild className="mb-3 -ml-2 min-h-9 px-2" variant="ghost">
            <Link to="/clases">
              <i className="fa-solid fa-chevron-left h-4 w-4 mr-1 flex items-center"></i>
              Volver
            </Link>
          </Button>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-medium text-foreground">
                {clase ? clase.materia : 'Asistencia'}
              </h2>
              {clase ? (
                <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {clase.nombre_paralelo}
                </span>
              ) : null}
              {isEditing ? (
                <span className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                  Editando
                </span>
              ) : null}
            </div>
            
            {/* Control de Navegación de Tiempo */}
            <div className="flex items-center gap-4 bg-card/60 backdrop-blur-sm p-3 rounded-lg border border-border/50 inline-flex shadow-sm">
              <button 
                onClick={irSemanaAnterior}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Semana anterior"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              
              <div className="flex flex-col items-center min-w-[120px]">
                <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Fecha de registro</span>
                <span className="text-sm font-semibold text-foreground">{fechaFormateada}</span>
              </div>

              <button 
                onClick={irSemanaSiguiente}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Semana siguiente"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              
              <div className="w-px h-8 bg-border/50 mx-2"></div>
              
              <button 
                onClick={irHoy}
                className="text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>

        {error || saveError ? (
          <p className="mb-4 rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
            {error || saveError}
          </p>
        ) : null}

        {saveSuccess ? (
          <p className="mb-4 rounded-md border border-success bg-success-bg px-3 py-2 text-sm text-success font-medium">
            <i className="fa-solid fa-circle-check mr-2"></i>
            {saveSuccess}
          </p>
        ) : null}

        {isEditing ? (
          <p className="mb-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
            Ya existe un registro para esta fecha. Estás trabajando en modo edición.
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300">
            <Spinner size="lg" />
          </div>
        ) : null}

        {!isLoading && asistencias.length ? (
          <AsistenciaForm
            asistencias={asistencias}
            isEditing={isEditing}
            isSaving={isSaving}
            observacionesSesion={observacionesSesion}
            resumen={resumen}
            setObservacionesSesion={setObservacionesSesion}
            showConfirm={showConfirm}
            onCancelConfirm={() => setShowConfirm(false)}
            onChangeAsistencia={handleChangeAsistencia}
            onConfirmSubmit={saveAttendance}
            onSubmit={handleSubmit}
          />
        ) : null}

        {!isLoading && !asistencias.length && !error ? (
          <div className="rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 p-5 text-center shadow-sm">
            <h2 className="text-lg font-medium text-foreground">
              No hay estudiantes activos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Importa estudiantes en el paralelo para poder tomar asistencia.
            </p>
          </div>
        ) : null}
      </section>
    </AppLayout>
  )
}
