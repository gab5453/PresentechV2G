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

export async function obtenerReporteTrimestralEstudiante({ idParalelo, idEstudiante, anioInicio }) {
  const response = await api.get(
    `/admin/matriz-asistencia/estudiantes/${idEstudiante}/reporte-trimestral`,
    {
      params: {
        idParalelo,
        anioInicio,
      },
    },
  )

  return response.data
}
