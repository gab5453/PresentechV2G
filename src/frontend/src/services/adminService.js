import { api } from './api'

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginAdmin(credentials) {
  const response = await api.post('/admin/auth/login', credentials)
  return response.data
}

// ── Profesores ────────────────────────────────────────────────────────────────
export async function obtenerProfesores() {
  const response = await api.get('/admin/profesores')
  return response.data
}

export async function obtenerProfesor(id) {
  const response = await api.get(`/admin/profesores/${id}`)
  return response.data
}

export async function crearProfesor(data) {
  const response = await api.post('/admin/profesores', data)
  return response.data
}

export async function actualizarProfesor(id, data) {
  const response = await api.put(`/admin/profesores/${id}`, data)
  return response.data
}

export async function eliminarProfesor(id) {
  const response = await api.delete(`/admin/profesores/${id}`)
  return response.data
}

// ── Paralelos ─────────────────────────────────────────────────────────────────
export async function obtenerParalelos() {
  const response = await api.get('/admin/paralelos')
  return response.data
}

export async function crearParalelo(data) {
  const response = await api.post('/admin/paralelos', data)
  return response.data
}

export async function actualizarParalelo(id, data) {
  const response = await api.put(`/admin/paralelos/${id}`, data)
  return response.data
}

export async function eliminarParalelo(id) {
  const response = await api.delete(`/admin/paralelos/${id}`)
  return response.data
}

// ── Clases ────────────────────────────────────────────────────────────────────
export async function obtenerClases() {
  const response = await api.get('/admin/clases')
  return response.data
}

export async function crearClase(data) {
  const response = await api.post('/admin/clases', data)
  return response.data
}

export async function actualizarClase(id, data) {
  const response = await api.put(`/admin/clases/${id}`, data)
  return response.data
}

export async function eliminarClase(id) {
  const response = await api.delete(`/admin/clases/${id}`)
  return response.data
}

// ── Horarios ──────────────────────────────────────────────────────────────────
export async function agregarHorario(idClase, data) {
  const response = await api.post(`/admin/clases/${idClase}/horarios`, data)
  return response.data
}

export async function eliminarHorario(idClase, idHorario) {
  const response = await api.delete(`/admin/clases/${idClase}/horarios/${idHorario}`)
  return response.data
}

// -- Estudiantes ----------------------------------------------------------------
export async function obtenerEstudiantes() {
  const response = await api.get('/admin/estudiantes')
  return response.data
}

export async function crearEstudiante(data) {
  const response = await api.post('/admin/estudiantes', data)
  return response.data
}

export async function asignarParaleloEstudiante(idEstudiante, idParalelo) {
  const response = await api.post(`/admin/estudiantes/${idEstudiante}/paralelos/${idParalelo}`)
  return response.data
}

export async function desasignarParaleloEstudiante(idEstudiante, idParalelo) {
  const response = await api.delete(`/admin/estudiantes/${idEstudiante}/paralelos/${idParalelo}`)
  return response.data
}

// ── Materias ──────────────────────────────────────────────────────────────────
export async function obtenerMaterias() {
  const response = await api.get('/admin/materias')
  return response.data
}

export async function crearMateria(data) {
  const response = await api.post('/admin/materias', data)
  return response.data
}

export async function actualizarMateria(id, data) {
  const response = await api.put(`/admin/materias/${id}`, data)
  return response.data
}

export async function eliminarMateria(id) {
  const response = await api.delete(`/admin/materias/${id}`)
  return response.data
}
