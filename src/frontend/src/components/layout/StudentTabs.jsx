import { Link, useLocation } from 'react-router-dom';

export function StudentTabs() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const isClases = location.pathname.includes('/clases');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', to: '/estudiante/dashboard', active: isDashboard },
    { id: 'clases', label: 'Mis Clases', to: '/estudiante/clases', active: isClases },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">Panel Estudiante</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa tu rendimiento y clases asignadas.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border/50 bg-card/60 p-1.5 shadow-sm backdrop-blur-sm">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.to}
            className={`flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
              tab.active
                ? 'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </>
  );
}
