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
                fecha = request.Fecha,
                activo = true,
                created_at = DateTime.UtcNow
            };

            var creada = await _actividadRepository.CreateAsync(actividadEntity);

            return new ActividadDto
            {
                Id = creada.id_actividad,
                Nombre = creada.nombre,
                Tipo = creada.tipo,
                Fecha = creada.fecha
            };
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
            var clase = await _claseRepository.ObtenerPorIdAsync(claseId);
            if (clase == null)
                throw new NotFoundException("Clase", claseId);

            var response = new MatrizCalificacionesResponse { ClaseId = claseId };

            // 1. Obtener todas las actividades de la clase
            var actividades = await _actividadRepository.GetByClaseIdAsync(claseId);
            response.Actividades = actividades.Select(a => new ActividadDto
            {
                Id = a.id_actividad,
                Nombre = a.nombre,
                Tipo = a.tipo,
                Fecha = a.fecha
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
                decimal sumaNotas = 0;
                int countNotas = 0;

                foreach (var actividad in actividades)
                {
                    var calificacion = calificaciones.FirstOrDefault(c => c.id_actividad == actividad.id_actividad && c.id_estudiante == estudiante.id_estudiante);
                    if (calificacion != null)
                    {
                        estudianteDto.Notas[actividad.id_actividad] = calificacion.nota;
                        sumaNotas += calificacion.nota;
                        countNotas++;
                    }
                    else
                    {
                        estudianteDto.Notas[actividad.id_actividad] = null;
                    }
                }

                // Calcular promedio simple
                if (countNotas > 0)
                {
                    estudianteDto.Promedio = Math.Round(sumaNotas / countNotas, 2);
                    estudianteDto.RequiereAlarma = estudianteDto.Promedio < 7.0m;
                }
                else
                {
                    estudianteDto.Promedio = 0;
                    estudianteDto.RequiereAlarma = true; // Sin notas, lo consideramos en alarma
                }

                response.Estudiantes.Add(estudianteDto);
            }

            return response;
        }
    }
}
