import { Footer } from '../Footer'
import { Header } from '../Header'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'

export function AppLayout({ children, title }) {
  const { logout, user } = useAuth()

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-gradient-to-br from-background via-secondary/50 to-background text-foreground">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/5 opacity-50 mix-blend-multiply blur-3xl animate-float"></div>
      <div className="pointer-events-none absolute top-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-secondary-foreground/5 opacity-50 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 flex flex-col flex-1 h-full w-full">
        <Header title={title} user={user} onLogout={logout} />
        <main className="flex-1 overflow-x-hidden animate-fade-in">{children || <Outlet />}</main>
        <Footer />
      </div>
    </div>
  )
}
