import { LogOut } from 'lucide-react'
import { Button } from '../../common'

export function Header({ title, user, onLogout }) {
  const teacherName = user ? `${user.nombres} ${user.apellidos}` : 'Docente'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/70 backdrop-blur-md shadow-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <img
              alt="Logo PresenTech"
              className="h-8 w-8 rounded object-cover shadow-md"
              src="/logo_presentech_icon.png"
            />
            <span className="hidden font-medium text-foreground tracking-tight min-[390px]:inline">
              PresenTech
            </span>
          </div>
          <div className="h-4 w-px shrink-0 bg-border" />
          <h1 className="min-w-0 truncate text-sm font-medium text-foreground">{title}</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden max-w-44 truncate text-sm text-muted-foreground sm:inline">
            {teacherName}
          </span>
          <Button
            aria-label="Cerrar sesión"
            className="h-8 w-8 !px-0 sm:w-auto sm:px-3"
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
