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
  }
};
