import { api } from './api';

export const calificacionesService = {
  getMatriz: async (claseId) => {
    const response = await api.get(`/calificaciones/clase/${claseId}`);
    return response.data;
  },

  crearActividad: async (request) => {
    const response = await api.post('/calificaciones/actividad', request);
    return response.data;
  },

  registrarNota: async (request) => {
    const response = await api.put('/calificaciones/nota', request);
    return response.data;
  },

  actualizarActividad: async (actividadId, request) => {
    const response = await api.put(`/calificaciones/actividad/${actividadId}`, request);
    return response.data;
  },

  eliminarActividad: async (actividadId) => {
    const response = await api.delete(`/calificaciones/actividad/${actividadId}`);
    return response.data;
  }
};
