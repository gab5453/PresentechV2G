import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout';
import { studentService } from '../../services/studentService';
import { Spinner } from '../../components/common';

export const StudentDashboardView = () => {
  const [dashboard, setDashboard] = useState(null);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashData = await studentService.getDashboard();
        setDashboard(dashData.data);
        
        const clasesData = await studentService.getClases();
        setClases(clasesData.data);
      } catch (error) {
        console.error('Error fetching student dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AppLayout title="Portal Estudiante">
      <section className="container mx-auto max-w-5xl px-4 py-4 md:py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Mi Resumen</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Aquí puedes ver tu rendimiento general y clases actuales.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Promedio Global</h3>
                  <i className="fa-solid fa-graduation-cap text-muted-foreground"></i>
                </div>
                <div className="text-2xl font-bold">{dashboard?.promedioGlobal ? dashboard.promedioGlobal.toFixed(2) : '-'} / 10</div>
              </div>
              
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Clases Matriculadas</h3>
                  <i className="fa-solid fa-book text-muted-foreground"></i>
                </div>
                <div className="text-2xl font-bold">{dashboard?.clasesMatriculadas || 0}</div>
              </div>
            </div>

            {dashboard?.alarmas && dashboard.alarmas.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-foreground mb-4">Avisos Importantes</h3>
                <div className="space-y-3">
                  {dashboard.alarmas.map((alarma, idx) => (
                    <div key={idx} className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning-foreground flex items-center">
                      <i className="fa-solid fa-triangle-exclamation mr-3 text-warning"></i>
                      <span>{alarma}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Mis Clases</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {clases.map((clase) => (
                  <Link
                    key={clase.idClase}
                    to={`/estudiante/clases/${clase.idClase}`}
                    className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/80" />
                    <div className="mb-2">
                      <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {clase.materia}
                      </h4>
                      <p className="text-sm text-muted-foreground">{clase.paralelo}</p>
                    </div>
                    <div className="mt-auto pt-4 flex justify-end">
                      <span className="inline-flex items-center text-xs font-medium text-primary">
                        Ver Detalles <i className="fa-solid fa-arrow-right ml-1"></i>
                      </span>
                    </div>
                  </Link>
                ))}
                {clases.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-muted-foreground">
                    No estás matriculado en ninguna clase actualmente.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </AppLayout>
  );
};
