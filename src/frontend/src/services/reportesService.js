import { api } from './api'

export async function generarReporteAsistencia(params) {
  const response = await api.get('/reportes/asistencia', { params })
  return response.data
}

export async function generarReporteCalificaciones(params) {
  const response = await api.get('/reportes/calificaciones', { params })
  return response.data
}
