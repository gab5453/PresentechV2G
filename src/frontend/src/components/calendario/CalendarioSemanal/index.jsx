import { dateFnsLocalizer, Calendar } from 'react-big-calendar'
import { format, getDay, parse, startOfWeek, subMonths, addMonths, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { useState, useMemo } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { createDateWithTime, toIsoDate } from '../../../utils/dateUtils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  getDay,
  locales,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
})

const messages = {
  date: 'Fecha',
  day: 'Día',
  event: 'Clase',
  next: 'Siguiente',
  noEventsInRange: 'No hay clases en este rango.',
  previous: 'Anterior',
  today: 'Hoy',
  month: 'Mes',
}

function CustomToolbar({ label, onNavigate }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-foreground capitalize tracking-tight">{label}</h2>
      <div className="flex gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border/50 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => onNavigate('PREV')}
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border/50 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => onNavigate('NEXT')}
          type="button"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

function CustomDateHeader({ label, date }) {
  const isToday = isSameDay(date, new Date())
  return (
    <div className="m-1 flex justify-center">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
          isToday
            ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20'
            : 'text-foreground'
        }`}
      >
        {format(date, 'd')}
      </span>
    </div>
  )
}

function CustomDateCellWrapper({ children, value }) {
  const isToday = isSameDay(value, new Date())
  return (
    <div className={`rbc-day-bg ${isToday ? 'bg-primary/[0.03]' : ''}`}>
      {children}
    </div>
  )
}

export function CalendarioSemanal({ clase, onSelectHorario }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const events = useMemo(() => {
    // Generamos eventos para el mes actual, uno anterior y uno siguiente para cubrir la vista.
    const startDate = subMonths(currentDate, 1)
    const endDate = addMonths(currentDate, 1)
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const allEvents = []

    days.forEach((day) => {
      const dayOfWeek = getDay(day)
      
      clase.horarios.forEach((horario) => {
        if (dayOfWeek === horario.orden_dia) {
          allEvents.push({
            end: createDateWithTime(day, horario.hora_fin),
            resource: {
              fecha: toIsoDate(day),
              horario,
            },
            start: createDateWithTime(day, horario.hora_inicio),
            title: clase.materia,
          })
        }
      })
    })

    return allEvents
  }, [clase, currentDate])

  return (
    <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-xl backdrop-blur-xl">
      <div className="calendar-month-view min-h-[600px]">
        <style>{`
          .calendar-month-view .rbc-month-view { 
            border-radius: 0.75rem; 
            overflow: hidden; 
            border: 1px solid hsl(var(--border)); 
            background: hsl(var(--card));
          }
          .calendar-month-view .rbc-header { 
            padding: 1rem 0; 
            font-weight: 600; 
            text-transform: uppercase; 
            font-size: 0.75rem; 
            color: hsl(var(--muted-foreground)); 
            border-bottom: 1px solid hsl(var(--border)); 
          }
          .calendar-month-view .rbc-day-bg + .rbc-day-bg { border-left: 1px solid hsl(var(--border)); }
          .calendar-month-view .rbc-month-row + .rbc-month-row { border-top: 1px solid hsl(var(--border)); }
          .calendar-month-view .rbc-event { 
            background-color: hsl(var(--primary)); 
            color: hsl(var(--primary-foreground)); 
            border-radius: 0.375rem; 
            padding: 0.25rem 0.5rem; 
            font-size: 0.75rem; 
            font-weight: 500; 
            border: none; 
            margin: 0.125rem 0.25rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            transition: transform 0.15s ease, opacity 0.15s ease;
          }
          .calendar-month-view .rbc-event:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }
          .calendar-month-view .rbc-today { background-color: transparent; }
          .calendar-month-view .rbc-off-range-bg { background-color: hsl(var(--muted)/0.2); }
          .calendar-month-view .rbc-button-link { color: inherit; pointer-events: none; }
          .calendar-month-view .rbc-row-segment { padding: 0; }
        `}</style>
        <Calendar
          components={{
            toolbar: CustomToolbar,
            month: {
              dateHeader: CustomDateHeader,
            },
            dateCellWrapper: CustomDateCellWrapper,
          }}
          culture="es"
          date={currentDate}
          defaultView="month"
          endAccessor="end"
          events={events}
          localizer={localizer}
          messages={messages}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onSelectEvent={(event) => onSelectHorario(event.resource)}
          startAccessor="start"
          views={['month']}
        />
      </div>
    </section>
  )
}
