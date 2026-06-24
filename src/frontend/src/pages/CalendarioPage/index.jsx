import { CheckCircle, ChevronLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Spinner } from '../../components/common'
import { AppLayout } from '../../components/layout'
import { getApiData, getApiErrorMessage } from '../../services/api'
import { obtenerHorarioClase } from '../../services/clasesService'
import { formatTime } from '../../utils/claseUtils'
import { CalendarioMensual } from '../../components/calendario'

export function CalendarioPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [clase, setClase] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    async function loadInitialHorario() {
      try {
        const response = await obtenerHorarioClase(id)

        if (isActive) {
          setClase(getApiData(response))
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

    loadInitialHorario()

    return () => {
      isActive = false
    }
  }, [id])

  const handleTomarAsistencia = (horarioId, fecha) => {
    navigate(`/asistencia/${horarioId}/${fecha}`)
  }

  return (
    <AppLayout title="Calendario semanal">
      <section className="container mx-auto max-w-4xl px-4 py-4 md:py-6">
        <div className="mb-6">
          <Button
            className="mb-3 -ml-2 min-h-9 px-2"
            variant="ghost"
            onClick={() => navigate('/clases')}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Volver a clases
          </Button>

          <h2 className="text-lg font-medium text-foreground">
            {clase ? clase.materia : 'Horario de clase'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {clase ? clase.nombre_paralelo : 'Consulta los bloques semanales.'}
          </p>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300">
            <Spinner size="lg" />
          </div>
        ) : null}

        {!isLoading && clase ? (
          <>
            <section className="mb-6 rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 p-4">
              <p className="mb-3 text-sm font-medium text-foreground">Horarios asignados</p>
              <div className="flex flex-wrap gap-2">
                {clase.horarios.map((horario) => (
                  <span
                    className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    key={horario.id_horario}
                  >
                    {horario.nombre_dia} {formatTime(horario.hora_inicio)}-
                    {formatTime(horario.hora_fin)}
                  </span>
                ))}
              </div>
            </section>

              <CalendarioMensual
                clase={clase}
                onTomarAsistencia={handleTomarAsistencia}
              />
          </>
        ) : null}
      </section>
    </AppLayout>
  )
}
