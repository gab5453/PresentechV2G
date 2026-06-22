import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCalificaciones } from '../../hooks/useCalificaciones';
import { AppLayout } from '../../components/layout';
import { Button, Spinner, Modal } from '../../components/common';

const CalificacionesView = () => {
  const { idClase } = useParams();
  const navigate = useNavigate();
  const { matriz, loading, error, fetchMatriz, crearActividad, registrarNota, actualizarActividad, eliminarActividad } = useCalificaciones(idClase);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityType, setNewActivityType] = useState('Deber');
  const [newActivityPeso, setNewActivityPeso] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editActivityId, setEditActivityId] = useState(null);
  const [editActivityName, setEditActivityName] = useState('');
  const [editActivityType, setEditActivityType] = useState('Deber');
  const [editActivityPeso, setEditActivityPeso] = useState(10);

  useEffect(() => {
    fetchMatriz();
  }, [fetchMatriz]);

  const handleCreateActivity = async () => {
    if (!newActivityName.trim()) return;
    
    setIsSubmitting(true);
    const result = await crearActividad({
      nombre: newActivityName,
      tipo: newActivityType,
      peso: Number(newActivityPeso),
      fecha: new Date().toISOString()
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsModalOpen(false);
      setNewActivityName('');
      setNewActivityPeso(10);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const openEditModal = (act) => {
    setEditActivityId(act.id);
    setEditActivityName(act.nombre);
    setEditActivityType(act.tipo);
    setEditActivityPeso(act.peso || 10);
    setIsEditModalOpen(true);
  };

  const handleEditActivity = async () => {
    if (!editActivityName.trim() || !editActivityId) return;
    
    setIsSubmitting(true);
    const result = await actualizarActividad(editActivityId, {
      nombre: editActivityName,
      tipo: editActivityType,
      peso: Number(editActivityPeso)
    });
    setIsSubmitting(false);

    if (result.success) {
      setIsEditModalOpen(false);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleDeleteActivity = async (actId) => {
    if (!window.confirm('¿Está seguro de eliminar esta actividad?')) return;
    
    const result = await eliminarActividad(actId);
    if (!result.success) {
      alert(`Error: ${result.error}`);
    }
  };

  const handleNotaBlur = async (actividadId, estudianteId, e) => {
    const value = e.target.value;
    if (value === '') return;
    
    const notaNum = parseFloat(value);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      alert('La nota debe ser un número entre 0 y 10');
      return;
    }

    const result = await registrarNota(actividadId, estudianteId, notaNum);
    if (!result.success) {
      alert(`Error al guardar nota: ${result.error}`);
    }
  };

  return (
    <AppLayout title="Calificaciones">
      <section className="container mx-auto max-w-5xl px-4 py-4 md:py-6">
        <div className="mb-6">
          <Button asChild className="mb-3 -ml-2 min-h-9 px-2" variant="ghost">
            <Link to="/clases">
              <i className="fa-solid fa-chevron-left h-4 w-4 mr-1 flex items-center"></i>
              Volver
            </Link>
          </Button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-medium text-foreground">
                {matriz ? matriz.materia : 'Calificaciones'}
              </h2>
              {matriz ? (
                <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {matriz.paralelo}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-error bg-error-bg px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        {loading && !matriz ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300">
            <Spinner size="lg" />
          </div>
        ) : null}

        {!loading && matriz && matriz.estudiantes.length === 0 ? (
          <div className="rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 p-5 text-center shadow-sm">
            <h2 className="text-lg font-medium text-foreground">
              No hay estudiantes activos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Asegúrate de que la clase tenga estudiantes matriculados.
            </p>
          </div>
        ) : null}

        {matriz && matriz.estudiantes.length > 0 && (
          <div className="rounded-lg rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 p-4 md:p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground font-medium bg-secondary/20">
                    <th className="sticky left-0 bg-card/95 backdrop-blur-sm z-10 px-4 py-3 font-semibold text-foreground min-w-[200px] border-r border-border/50">
                      Estudiante
                    </th>
                    {matriz.actividades.map(act => (
                      <th key={act.id} className="px-3 py-3 text-center border-r border-border/50 min-w-[120px] group relative">
                        <div className="font-semibold text-foreground">{act.nombre}</div>
                        <div className="text-[0.7rem] font-normal text-muted-foreground">{act.tipo} ({act.peso}%)</div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button onClick={() => openEditModal(act)} className="text-muted-foreground hover:text-primary transition-colors">
                            <i className="fa-solid fa-pen text-[0.6rem]"></i>
                          </button>
                          <button onClick={() => handleDeleteActivity(act.id)} className="text-muted-foreground hover:text-error transition-colors">
                            <i className="fa-solid fa-trash text-[0.6rem]"></i>
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center border-r border-border/50 min-w-[60px]">
                      <button 
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        onClick={() => setIsModalOpen(true)}
                        title="Agregar Actividad"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      Promedio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {matriz.estudiantes.map(est => (
                    <tr 
                      key={est.estudianteId} 
                      className={`hover:bg-secondary/10 transition-colors ${est.requiereAlarma ? 'bg-error/5' : ''}`}
                    >
                      <td className={`sticky left-0 bg-card/95 backdrop-blur-sm z-10 px-4 py-3 font-medium text-foreground border-r border-border/50 flex items-center justify-between ${est.requiereAlarma ? 'bg-error/5' : ''}`}>
                        <span className="truncate max-w-[180px]">{est.apellidos} {est.nombres}</span>
                        {est.requiereAlarma && (
                          <i className="fa-solid fa-triangle-exclamation text-error ml-2" title="Rendimiento bajo"></i>
                        )}
                      </td>
                      
                      {matriz.actividades.map(act => {
                        const currentNota = est.notas[act.id];
                        return (
                          <td key={act.id} className="px-2 py-2 border-r border-border/50 transition-colors focus-within:bg-secondary/30">
                            <input 
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              defaultValue={currentNota !== null ? currentNota : ''}
                              onBlur={(e) => handleNotaBlur(act.id, est.estudianteId, e)}
                              className="bg-transparent w-full outline-none text-center font-medium placeholder-muted-foreground/30 focus:text-primary"
                              placeholder="-"
                            />
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 border-r border-border/50 text-center"></td> {/* Placeholder under + button */}
                      <td className={`px-4 py-3 text-center font-bold ${est.requiereAlarma ? 'text-error' : 'text-foreground'}`}>
                        {est.promedio !== null ? est.promedio.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleCreateActivity}
          title="Nueva Actividad"
          confirmLabel="Crear Actividad"
          isSubmitting={isSubmitting}
        >
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Nombre de la actividad
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="Ej. Lección 1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Tipo
              </label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
              >
                <option value="Deber">Deber</option>
                <option value="Taller">Taller</option>
                <option value="Leccion">Lección</option>
                <option value="Participacion">Participación</option>
                <option value="Examen">Examen</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Peso (%)
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={newActivityPeso}
                onChange={(e) => setNewActivityPeso(e.target.value)}
                min="1"
                max="100"
              />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onConfirm={handleEditActivity}
          title="Editar Actividad"
          confirmLabel="Guardar Cambios"
          isSubmitting={isSubmitting}
        >
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Nombre de la actividad
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={editActivityName}
                onChange={(e) => setEditActivityName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Tipo
              </label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={editActivityType}
                onChange={(e) => setEditActivityType(e.target.value)}
              >
                <option value="Deber">Deber</option>
                <option value="Taller">Taller</option>
                <option value="Leccion">Lección</option>
                <option value="Participacion">Participación</option>
                <option value="Examen">Examen</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Peso (%)
              </label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={editActivityPeso}
                onChange={(e) => setEditActivityPeso(e.target.value)}
                min="1"
                max="100"
              />
            </div>
          </div>
        </Modal>
      </section>
    </AppLayout>
  );
};

export default CalificacionesView;
