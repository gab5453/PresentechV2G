import { api } from './api';

export const studentService = {
  getDashboard: async () => {
    const response = await api.get('/estudiante-portal/dashboard');
    return response.data;
  },

  getClases: async () => {
    const response = await api.get('/estudiante-portal/clases');
    return response.data;
  },

  getResumenClase: async (idClase) => {
    const response = await api.get(`/estudiante-portal/clases/${idClase}/resumen`);
    return response.data;
  }
};
