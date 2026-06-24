using Presentech.Business.DTOs.Calificaciones;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.DataAccess.Entities;
using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.Business.Services
{
    public class CalificacionService : ICalificacionService
    {
        private readonly IActividadRepository _actividadRepository;
        private readonly ICalificacionRepository _calificacionRepository;
        private readonly IEstudianteRepository _estudianteRepository;
        private readonly IClaseRepository _claseRepository;

        public CalificacionService(
            IActividadRepository actividadRepository,
            ICalificacionRepository calificacionRepository,
            IEstudianteRepository estudianteRepository,
            IClaseRepository claseRepository)
        {
            _actividadRepository = actividadRepository;
            _calificacionRepository = calificacionRepository;
            _estudianteRepository = estudianteRepository;
            _claseRepository = claseRepository;
        }

        public async Task<ActividadDto> CrearActividadAsync(CrearActividadRequest request)
        {
            var clase = await _claseRepository.ObtenerPorIdAsync(request.ClaseId);
            if (clase == null)
                throw new NotFoundException("Clase", request.ClaseId);

            var actividadEntity = new ActividadEntity
            {
                id_clase = request.ClaseId,
                nombre = request.Nombre,
                tipo = request.Tipo,
                fecha = request.Fecha ?? DateTime.UtcNow,
                peso = request.Peso,
                activo = true,
                created_at = DateTime.UtcNow
            };

            var creada = await _actividadRepository.CreateAsync(actividadEntity);

            return new ActividadDto
            {
                Id = creada.id_actividad,
                Nombre = creada.nombre,
                Tipo = creada.tipo,
                Fecha = creada.fecha,
                Peso = creada.peso
            };
        }

        public async Task<ActividadDto> EditarActividadAsync(int actividadId, CrearActividadRequest request)
        {
            var actividad = await _actividadRepository.ObtenerPorIdAsync(actividadId);
            if (actividad == null)
                throw new NotFoundException("Actividad", actividadId);

            actividad.nombre = request.Nombre;
            actividad.tipo = request.Tipo;
            // actividad.fecha = request.Fecha; // Fecha is immutable
            actividad.peso = request.Peso;

            await _actividadRepository.UpdateAsync(actividad);

            return new ActividadDto
            {
                Id = actividad.id_actividad,
                Nombre = actividad.nombre,
                Tipo = actividad.tipo,
                Fecha = actividad.fecha,
                Peso = actividad.peso
            };
        }

        public async Task EliminarActividadAsync(int actividadId)
        {
            var actividad = await _actividadRepository.ObtenerPorIdAsync(actividadId);
            if (actividad == null)
                throw new NotFoundException("Actividad", actividadId);

            actividad.activo = false; // Soft delete
            await _actividadRepository.UpdateAsync(actividad);
        }

        public async Task<RegistrarNotaRequest> RegistrarNotaAsync(RegistrarNotaRequest request)
        {
            // Validar que la nota esté entre 0 y 10 (basado en el requerimiento de alarma en 7.0)
            if (request.Nota < 0 || request.Nota > 10)
                throw new BusinessException("La nota debe estar entre 0 y 10.");

            var calificacionExistente = await _calificacionRepository.GetByActividadAndEstudianteAsync(request.ActividadId, request.EstudianteId);

            if (calificacionExistente != null)
            {
                calificacionExistente.nota = request.Nota;
                calificacionExistente.fecha_registro = DateTime.UtcNow;
                await _calificacionRepository.UpdateAsync(calificacionExistente);
            }
            else
            {
                var nuevaCalificacion = new CalificacionEntity
                {
                    id_actividad = request.ActividadId,
                    id_estudiante = request.EstudianteId,
                    nota = request.Nota,
                    fecha_registro = DateTime.UtcNow
                };
                await _calificacionRepository.CreateAsync(nuevaCalificacion);
            }

            return request;
        }

        public async Task<MatrizCalificacionesResponse> GetMatrizCalificacionesAsync(int claseId)
        {
            var clase = await _claseRepository.ObtenerConHorarioAsync(claseId);
            if (clase == null)
                throw new NotFoundException("Clase", claseId);

            var response = new MatrizCalificacionesResponse 
            { 
                ClaseId = claseId,
                Materia = clase.Materia?.Nombre ?? "Materia desconocida",
                Paralelo = clase.Paralelo?.nombre ?? "Paralelo desconocido"
            };

            // 1. Obtener todas las actividades de la clase
            var actividades = await _actividadRepository.GetByClaseIdAsync(claseId);
            response.Actividades = actividades.Select(a => new ActividadDto
            {
                Id = a.id_actividad,
                Nombre = a.nombre,
                Tipo = a.tipo,
                Fecha = a.fecha,
                Peso = a.peso
            }).ToList();

            // 2. Obtener todos los estudiantes de la clase (a través del paralelo)
            var estudiantesEntity = await _estudianteRepository.ObtenerPorParaleloAsync(clase.id_paralelo);
            
            // 3. Obtener todas las calificaciones de esta clase
            var calificaciones = await _calificacionRepository.GetByClaseIdAsync(claseId);

            // 4. Armar la matriz
            foreach (var estudiante in estudiantesEntity)
            {
                var estudianteDto = new EstudianteCalificacionesDto
                {
                    EstudianteId = estudiante.id_estudiante,
                    Nombres = estudiante.nombres,
                    Apellidos = estudiante.apellidos
                };

                // Llenar notas del estudiante
                decimal sumaNotasPonderadas = 0;
                decimal sumaPesosRegistrados = 0;

                foreach (var actividad in actividades)
                {
                    var calificacion = calificaciones.FirstOrDefault(c => c.id_actividad == actividad.id_actividad && c.id_estudiante == estudiante.id_estudiante);
                    if (calificacion != null)
                    {
                        estudianteDto.Notas[actividad.id_actividad] = calificacion.nota;
                        sumaNotasPonderadas += calificacion.nota * actividad.peso;
                        sumaPesosRegistrados += actividad.peso;
                    }
                    else
                    {
                        estudianteDto.Notas[actividad.id_actividad] = null;
                    }
                }

                // Calcular promedio ponderado
                if (actividades.Count > 0)
                {
                    if (sumaPesosRegistrados > 0)
                        estudianteDto.Promedio = Math.Round(sumaNotasPonderadas / sumaPesosRegistrados, 2);
                    else
                        estudianteDto.Promedio = 0;

                    estudianteDto.RequiereAlarma = estudianteDto.Promedio < 7.5m;
                }
                else
                {
                    estudianteDto.Promedio = 0;
                    estudianteDto.RequiereAlarma = false; // Corrección de alarma falsa
                }

                response.Estudiantes.Add(estudianteDto);
            }

            return response;
        }
    }
}
