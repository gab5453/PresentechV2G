using Presentech.Business.DTOs.EstudiantePortal;
using Presentech.Business.Interfaces;
using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.Business.Services
{
    public class EstudiantePortalService : IEstudiantePortalService
    {
        private readonly IClaseRepository _claseRepository;
        private readonly ICalificacionRepository _calificacionRepository;
        private readonly IActividadRepository _actividadRepository;
        private readonly IAsistenciaRepository _asistenciaRepository;
        private readonly IRegistroAsistenciaRepository _registroAsistenciaRepository;
        private readonly IEstudianteRepository _estudianteRepository;

        public EstudiantePortalService(
            IClaseRepository claseRepository,
            ICalificacionRepository calificacionRepository,
            IActividadRepository actividadRepository,
            IAsistenciaRepository asistenciaRepository,
            IRegistroAsistenciaRepository registroAsistenciaRepository,
            IEstudianteRepository estudianteRepository)
        {
            _claseRepository = claseRepository;
            _calificacionRepository = calificacionRepository;
            _actividadRepository = actividadRepository;
            _asistenciaRepository = asistenciaRepository;
            _registroAsistenciaRepository = registroAsistenciaRepository;
            _estudianteRepository = estudianteRepository;
        }

        public async Task<EstudianteDashboardResponse> GetDashboardAsync(int idEstudiante, CancellationToken cancellationToken = default)
        {
            var estudiante = await _estudianteRepository.ObtenerPorIdAsync(idEstudiante, cancellationToken);
            if (estudiante == null) return new EstudianteDashboardResponse();

            var clasesMatriculadas = await _claseRepository.ObtenerPorEstudianteAsync(idEstudiante, cancellationToken);
            
            var response = new EstudianteDashboardResponse
            {
                ClasesMatriculadas = clasesMatriculadas.Count,
                Alarmas = new List<string>()
            };

            decimal sumaPromedios = 0;
            int clasesConPromedio = 0;

            foreach (var clase in clasesMatriculadas)
            {
                var actividades = await _actividadRepository.GetByClaseIdAsync(clase.id_clase);
                if (actividades.Count == 0) continue;

                var calificaciones = await _calificacionRepository.GetByClaseIdAsync(clase.id_clase);
                var calificacionesEstudiante = calificaciones.Where(c => c.id_estudiante == idEstudiante).ToList();

                decimal sumaNotasPonderadas = 0;
                decimal sumaPesosRegistrados = 0;

                foreach (var actividad in actividades)
                {
                    var calif = calificacionesEstudiante.FirstOrDefault(c => c.id_actividad == actividad.id_actividad);
                    if (calif != null)
                    {
                        sumaNotasPonderadas += calif.nota * actividad.peso;
                        sumaPesosRegistrados += actividad.peso;
                    }
                }

                if (sumaPesosRegistrados > 0)
                {
                    decimal promedioMateria = Math.Round(sumaNotasPonderadas / sumaPesosRegistrados, 2);
                    sumaPromedios += promedioMateria;
                    clasesConPromedio++;

                    if (promedioMateria < 7.0m)
                    {
                        // TODO: Map to Materia name instead of ID if easy
                        response.Alarmas.Add($"Rendimiento bajo ({promedioMateria}) en la clase {clase.id_clase}");
                    }
                }
            }

            if (clasesConPromedio > 0)
            {
                response.PromedioGlobal = Math.Round(sumaPromedios / clasesConPromedio, 2);
            }

            return response;
        }

        public async Task<List<EstudianteClaseDto>> GetClasesAsync(int idEstudiante, CancellationToken cancellationToken = default)
        {
            var clases = await _claseRepository.ObtenerPorEstudianteAsync(idEstudiante, cancellationToken);
            
            // Note: Ideally we want Materia and Paralelo names. Since IClaseRepository might not eager load them,
            // we will return generic names if not loaded, or you can implement loading in repository.
            // Assuming ObtenerPorEstudianteAsync eagerly loads Materia and Paralelo (or we can just mock the names for now to prove concept)
            
            return clases.Select(c => new EstudianteClaseDto
            {
                IdClase = c.id_clase,
                Materia = c.Materia?.Nombre ?? $"Clase {c.id_clase}",
                Paralelo = c.Paralelo?.nombre ?? "Paralelo ?"
            }).ToList();
        }

        public async Task<EstudianteClaseResumenResponse> GetResumenClaseAsync(int idEstudiante, int idClase, CancellationToken cancellationToken = default)
        {
            var response = new EstudianteClaseResumenResponse();

            // 1. Asistencias
            var registros = await _registroAsistenciaRepository.ObtenerPorClaseAsync(idClase, cancellationToken);
            var registroIds = registros.Select(r => r.id_registro).ToList();
            
            var asistencias = _asistenciaRepository.GetAll()
                .Where(a => a.id_estudiante == idEstudiante && registroIds.Contains(a.id_registro))
                .ToList();

            // Map all dates that have an attendance record (some might be missing if professor didn't take attendance, but we just show what's recorded)
            foreach (var asis in asistencias)
            {
                var registroInfo = registros.FirstOrDefault(r => r.id_registro == asis.id_registro);
                if (registroInfo != null)
                {
                    response.Asistencias.Add(new EstudianteAsistenciaDto
                    {
                        Fecha = new DateTime(registroInfo.fecha.Year, registroInfo.fecha.Month, registroInfo.fecha.Day),
                        Presente = asis.asistio
                    });
                }
            }

            // 2. Calificaciones
            var actividades = await _actividadRepository.GetByClaseIdAsync(idClase);
            var calificaciones = await _calificacionRepository.GetByClaseIdAsync(idClase);
            var calificacionesEstudiante = calificaciones.Where(c => c.id_estudiante == idEstudiante).ToList();

            foreach (var actividad in actividades)
            {
                var calif = calificacionesEstudiante.FirstOrDefault(c => c.id_actividad == actividad.id_actividad);
                response.Notas.Add(new EstudianteNotaDto
                {
                    Actividad = actividad.nombre,
                    Tipo = actividad.tipo,
                    Peso = actividad.peso,
                    Nota = calif?.nota ?? 0 // Mostrar 0 o null si no tiene nota
                });
            }

            return response;
        }
    }
}
