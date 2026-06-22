import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../../components/layout';
import { studentService } from '../../services/studentService';
import { Spinner, Button } from '../../components/common';

export const StudentClasesView = () => {
  const { idClase } = useParams();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const data = await studentService.getResumenClase(idClase);
        setResumen(data.data);
      } catch (error) {
        console.error('Error fetching resumen de clase', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, [idClase]);

  if (loading) {
    return (
      <AppLayout title="Detalle de Clase">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  // Calculate totals
  const totalAsistencias = resumen?.asistencias?.length || 0;
  const presentes = resumen?.asistencias?.filter(a => a.presente).length || 0;
  const porcentajeAsistencia = totalAsistencias > 0 ? (presentes / totalAsistencias) * 100 : 0;

  // Calculate average
  const notas = resumen?.notas || [];
  const sumaPonderada = notas.reduce((acc, curr) => acc + (curr.nota * curr.peso), 0);
  const sumaPesos = notas.reduce((acc, curr) => acc + curr.peso, 0);
  const promedio = sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;

  return (
    <AppLayout title="Detalle de Clase">
      <section className="container mx-auto max-w-5xl px-4 py-4 md:py-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button asChild className="-ml-2 min-h-9 px-2 mr-4" variant="ghost">
            <Link to="/estudiante/dashboard">
              <i className="fa-solid fa-chevron-left h-4 w-4 mr-1 flex items-center"></i>
              Volver
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Mi Rendimiento</h2>
            <p className="text-muted-foreground text-sm mt-1">Clase #{idClase}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Summary Cards */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Promedio Actual</h3>
              <div className={`text-3xl font-bold ${promedio < 7 ? 'text-warning' : 'text-primary'}`}>
                {promedio > 0 ? promedio.toFixed(2) : '-'} / 10
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <i className="fa-solid fa-star text-primary text-xl"></i>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Asistencia</h3>
              <div className={`text-3xl font-bold ${porcentajeAsistencia < 70 ? 'text-error' : 'text-foreground'}`}>
                {totalAsistencias > 0 ? `${porcentajeAsistencia.toFixed(0)}%` : 'Sin registro'}
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center">
              <i className="fa-solid fa-calendar-check text-foreground text-xl"></i>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          
          {/* Calificaciones */}
          <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-border/50 bg-secondary/10 flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center">
                <i className="fa-solid fa-file-lines mr-2 text-primary"></i>
                Mis Notas
              </h3>
            </div>
            <div className="p-0 overflow-y-auto max-h-96">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/20 text-muted-foreground sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">Actividad</th>
                    <th className="px-4 py-3 font-medium text-center">Peso</th>
                    <th className="px-4 py-3 font-medium text-right">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {notas.length > 0 ? (
                    notas.map((nota, i) => (
                      <tr key={i} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{nota.actividad}</div>
                          <div className="text-xs text-muted-foreground">{nota.tipo}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{nota.peso}%</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {nota.nota > 0 ? nota.nota.toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-muted-foreground">
                        No hay calificaciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asistencias */}
          <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-border/50 bg-secondary/10 flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center">
                <i className="fa-solid fa-user-check mr-2 text-primary"></i>
                Registro de Asistencia
              </h3>
              <span className="text-xs font-medium bg-background px-2 py-1 rounded-full border border-border">
                {presentes} de {totalAsistencias} días
              </span>
            </div>
            <div className="p-0 overflow-y-auto max-h-96">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/20 text-muted-foreground sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {resumen?.asistencias && resumen.asistencias.length > 0 ? (
                    [...resumen.asistencias].reverse().map((asis, i) => (
                      <tr key={i} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-4 py-3 text-foreground">
                          {new Date(asis.fecha).toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {asis.presente ? (
                            <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                              <i className="fa-solid fa-check mr-1"></i> Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-error/10 px-2 py-1 text-xs font-medium text-error">
                              <i className="fa-solid fa-xmark mr-1"></i> Ausente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-4 py-8 text-center text-muted-foreground">
                        No hay asistencias registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    </AppLayout>
  );
};
