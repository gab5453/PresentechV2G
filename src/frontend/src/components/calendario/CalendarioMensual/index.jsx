import { useState, useMemo, useEffect } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { toIsoDate } from '../../../utils/dateUtils'
import { formatTime } from '../../../utils/claseUtils'
import { obtenerRegistroAsistencia } from '../../../services/asistenciasService'

export function CalendarioMensual({ clase, onTomarAsistencia }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [registeredSlots, setRegisteredSlots] = useState(new Set())

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const daysInGrid = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }) // Sunday

    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [currentDate])

  useEffect(() => {
    if (!clase?.horarios) return

    let isActive = true

    async function checkRegisteredSlots() {
      const checks = []
      
      daysInGrid.forEach(day => {
        const jsDay = day.getDay()
        const ordenDia = jsDay === 0 ? 7 : jsDay
        const horariosDelDia = clase.horarios.filter(h => h.orden_dia === ordenDia)
        
        horariosDelDia.forEach(horario => {
          checks.push(
            obtenerRegistroAsistencia(horario.id_horario, toIsoDate(day))
              .then(() => `${horario.id_horario}_${toIsoDate(day)}`)
              .catch(() => null)
          )
        })
      })

      const results = await Promise.all(checks)
      if (isActive) {
        setRegisteredSlots(new Set(results.filter(Boolean)))
      }
    }

    checkRegisteredSlots()

    return () => { isActive = false }
  }, [clase, daysInGrid])

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/10 p-4">
        <h2 className="text-xl font-semibold capitalize text-foreground tracking-tight">
          {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-muted-foreground transition-colors shadow-sm"
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-muted-foreground transition-colors shadow-sm"
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {daysInGrid.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())
          const isoDate = toIsoDate(day)

          const jsDay = day.getDay()
          const ordenDia = jsDay === 0 ? 7 : jsDay
          const horariosDelDia = (clase?.horarios || []).filter(h => h.orden_dia === ordenDia)

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[140px] border-b border-r border-border p-2 transition-colors ${
                !isCurrentMonth ? 'bg-muted/30 opacity-60' : 'bg-card'
              } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <div className="mb-3 flex justify-end">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    isToday
                      ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {horariosDelDia.map(horario => {
                  const isRegistered = registeredSlots.has(`${horario.id_horario}_${isoDate}`)
                  return (
                    <button
                      key={horario.id_horario}
                      onClick={() => onTomarAsistencia(horario.id_horario, isoDate)}
                      className={`flex w-full flex-col items-start rounded-lg border p-2 text-left text-xs transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                        isRegistered
                          ? 'border-success/30 bg-success/10 text-success hover:border-success/50'
                          : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      <span className="font-semibold text-[13px]">
                        {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                      </span>
                      <span className="mt-1 flex w-full items-center justify-between font-medium opacity-90">
                        {isRegistered ? 'Lista' : 'Pendiente'}
                        {isRegistered && <CheckCircle className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
