import { Calendar, Clock, Table, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../common'
import { formatHorario, formatTime, getProximaClase } from '../../../utils/claseUtils'

export function ClaseCard({ clase, isStudent }) {
  const proximaClase = getProximaClase(clase.horarios)

  return (
    <article className="rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 min-w-0">
        <h2 className="truncate font-medium text-foreground">{clase.materia}</h2>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {clase.nombre_paralelo}
        </p>
      </div>

      {proximaClase ? (
        <div className="mb-3 flex items-center gap-2 rounded-md bg-primary/5 p-2">
          <Clock aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Próxima clase</p>
            <p className="truncate text-sm font-medium text-foreground">
              {formatHorario(proximaClase)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <p className="mb-2 text-xs text-muted-foreground">Horarios semanales</p>
        <div className="flex flex-wrap gap-1.5">
          {clase.horarios?.map((horario) => (
            <span
              className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              key={horario.id_horario}
            >
              {horario.nombre_dia.slice(0, 3)} {formatTime(horario.hora_inicio)}-
              {formatTime(horario.hora_fin)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isStudent ? (
          <Button asChild className="w-full min-h-9 text-sm">
            <Link to={`/estudiante/clases/${clase.id_clase}`}>
              <BookOpen aria-hidden="true" className="h-4 w-4 mr-2" />
              Ver Detalles de Clase
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild className="w-full min-h-9 text-sm">
              <Link to={`/clases/${clase.id_clase}/calendario`}>
                <Calendar aria-hidden="true" className="h-4 w-4 mr-2" />
                Ver asistencia
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full min-h-9 text-sm">
              <Link to={`/clases/${clase.id_clase}/calificaciones`}>
                <Table aria-hidden="true" className="h-4 w-4 mr-2" />
                Calificaciones
              </Link>
            </Button>
          </>
        )}
      </div>
    </article>
  )
}
