import { api } from './api'

export async function obtenerMatrizAsistencia({ idParalelo, anioInicio }) {
  const response = await api.get('/admin/matriz-asistencia', {
    params: {
      idParalelo,
      anioInicio,
    },
  })

  return response.data
}
