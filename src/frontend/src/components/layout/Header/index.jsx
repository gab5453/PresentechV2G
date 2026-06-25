import { CalendarDays, LogOut, UserRound } from 'lucide-react'
import { Button } from '../../common'

export function Header({ title, user, onLogout }) {
  const teacherName = user ? `${user.nombres} ${user.apellidos}` : 'Usuario'
  const roleLabel = user?.role === 'Estudiante' ? 'Estudiante' : (user?.rol === 'admin' ? 'Administrador' : 'Docente')
  const currentDate = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/85 shadow-sm backdrop-blur-md">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center gap-3">
            <img
              alt="Logo PresenTechV2G"
              className="h-9 w-9 rounded-lg object-cover shadow-md"
              src="/logo_presentech_icon.png"
            />
            <div className="hidden min-w-0 sm:block">
              <p className="font-semibold leading-tight tracking-tight text-foreground">
                PresenTechV2G
              </p>
              <p className="hidden text-xs text-muted-foreground lg:block">
                Unidad Educativa Fiscomisional Fe y Alegría La Dolorosa
              </p>
            </div>
          </div>

          <div className="h-6 w-px shrink-0 bg-border" />


          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
            <p className="hidden truncate text-xs text-muted-foreground min-[460px]:block">
              Portal de asistencia docente
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground md:flex">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-primary" />
            <span>{currentDate}</span>
          </div>

          <div className="hidden items-center gap-3 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block max-w-40 truncate text-sm font-medium text-foreground">
                {teacherName}
              </span>
              <span className="block text-xs text-muted-foreground">{roleLabel}</span>
            </span>
          </div>

          <Button
            aria-label="Cerrar sesión"
            className="h-9 w-9 !px-0 sm:w-auto sm:px-3"
            variant="ghost"
            onClick={onLogout}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
