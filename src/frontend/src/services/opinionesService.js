import { api } from './api'

export async function registrarOpinion(payload) {
  const response = await api.post('/opiniones', payload)
  return response.data
}
