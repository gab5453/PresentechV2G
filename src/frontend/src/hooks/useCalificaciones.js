import { useState, useCallback } from 'react';
import { calificacionesService } from '../services/calificacionesService';

export const useCalificaciones = (claseId) => {
  const [matriz, setMatriz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMatriz = useCallback(async () => {
    if (!claseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await calificacionesService.getMatriz(claseId);
      setMatriz(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  }, [claseId]);

  const crearActividad = async (actividadData) => {
    try {
      await calificacionesService.crearActividad({ ...actividadData, claseId });
      await fetchMatriz(); // Recargar matriz completa tras agregar actividad
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const registrarNota = async (actividadId, estudianteId, nota) => {
    try {
      // Optimistic Update (Optional)
      // Aquí se podría actualizar el estado local primero para que se sienta más rápido.
      await calificacionesService.registrarNota({ actividadId, estudianteId, nota });
      await fetchMatriz(); // Recargar para actualizar promedios y alarmas
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const actualizarActividad = async (actividadId, actividadData) => {
    try {
      await calificacionesService.actualizarActividad(actividadId, { ...actividadData, claseId });
      await fetchMatriz();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const eliminarActividad = async (actividadId) => {
    try {
      await calificacionesService.eliminarActividad(actividadId);
      await fetchMatriz();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    matriz,
    loading,
    error,
    fetchMatriz,
    crearActividad,
    registrarNota,
    actualizarActividad,
    eliminarActividad
  };
};
