import { api, getApiData } from './api'

export async function extraerEstudiantesDesdeImagen(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/admin/ocr/estudiantes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return getApiData(response.data)
}
