import { api } from './api'

export async function login(credentials) {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export async function loginStudent(credentials) {
  const response = await api.post('/auth/estudiante/login', credentials)
  return response.data
}
