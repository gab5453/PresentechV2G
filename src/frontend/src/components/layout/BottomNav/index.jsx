import { CalendarDays, ClipboardList, GraduationCap } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAuth } from '../../../hooks/useAuth'

export function BottomNav() {
  const { user } = useAuth()
  
  let navItems = []
  if (user?.role === 'Estudiante') {
    navItems = [
      { icon: GraduationCap, label: 'Dashboard', to: '/estudiante/dashboard' },
      { icon: ClipboardList, label: 'Mis Clases', to: '/estudiante/dashboard' },
    ]
  } else {
    navItems = [
      { icon: GraduationCap, label: 'Clases', to: '/clases' },
      { icon: CalendarDays, label: 'Calendario', to: '/calendario' },
      { icon: ClipboardList, label: 'Asistencia', to: '/asistencia' },
    ]
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card md:hidden">
      <div className={`grid h-16 ${navItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
            end={to === '/'}
            key={to}
            to={to}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
