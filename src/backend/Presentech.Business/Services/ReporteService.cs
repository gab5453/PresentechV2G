using Microsoft.EntityFrameworkCore;
using Presentech.Business.DTOs.Reporte;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.DataManagement.Interfaces;

using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.Business.Services
{
    public class ReporteService : IReporteService
    {
        private const double PorcentajeExcelente = 90;
        private const double PorcentajeRegular = 75;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IActividadRepository _actividadRepository;
        private readonly ICalificacionRepository _calificacionRepository;

        public ReporteService(
            IUnitOfWork unitOfWork,
            IActividadRepository actividadRepository,
            ICalificacionRepository calificacionRepository)
        {
            _unitOfWork = unitOfWork;
            _actividadRepository = actividadRepository;
            _calificacionRepository = calificacionRepository;
        }

        public async Task<ReporteAsistenciaResponse> GenerarAsistenciaAsync(
            int idClase,
            DateOnly fechaInicio,
            DateOnly fechaFin,
            int? idEstudiante,
            int? idProfesor,
            CancellationToken cancellationToken = default)
        {
            if (fechaInicio > fechaFin)
                throw new BusinessException("La fecha de inicio no puede ser posterior a la fecha de fin.");

            var clase = await _unitOfWork.ClaseRepository.GetAll()
                .Include(c => c.Profesor)
                .Include(c => c.Paralelo)
                .Include(c => c.Materia)
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    c => c.id_clase == idClase && c.activo,
                    cancellationToken)
                ?? throw new NotFoundException("Clase", idClase);

            if (idProfesor.HasValue && clase.id_profesor != idProfesor.Value)
                throw new UnauthorizedBusinessException("No tiene permisos para generar reportes de esta clase.");

            var estudiantesQuery = _unitOfWork.EstudianteRepository.GetAll()
                .Where(e => e.activo && e.ParaleloEstudiantes.Any(pe =>
                    pe.id_paralelo == clase.id_paralelo && pe.activo));

            if (idEstudiante.HasValue)
                estudiantesQuery = estudiantesQuery.Where(e => e.id_estudiante == idEstudiante.Value);

            var estudiantes = await estudiantesQuery
                .OrderBy(e => e.apellidos)
                .ThenBy(e => e.nombres)
                .Select(e => new
                {
                    e.id_estudiante,
                    e.nombres,
                    e.apellidos,
                })
                .ToListAsync(cancellationToken);

            if (idEstudiante.HasValue && estudiantes.Count == 0)
                throw new BusinessException("El estudiante seleccionado no pertenece al curso indicado.");

            var estudiantesIds = estudiantes.Select(e => e.id_estudiante).ToList();

            var estadisticas = await _unitOfWork.AsistenciaRepository.GetAll()
                .Where(a =>
                    estudiantesIds.Contains(a.id_estudiante) &&
                    a.RegistroAsistencia.fecha >= fechaInicio &&
                    a.RegistroAsistencia.fecha <= fechaFin &&
                    a.RegistroAsistencia.ClaseHorario.id_clase == idClase)
                .GroupBy(a => a.id_estudiante)
                .Select(g => new
                {
                    IdEstudiante = g.Key,
                    TotalAsistencias = g.Count(a => a.asistio || a.atrasado),
                    TotalFaltas = g.Count(a => !a.asistio && !a.atrasado),
                    TotalAtrasos = g.Count(a => a.atrasado),
                    TotalRegistros = g.Count(),
                })
                .ToDictionaryAsync(e => e.IdEstudiante, cancellationToken);

            var curso = $"{clase.Materia.Nombre} de {clase.Paralelo.nombre}";
            var filas = estudiantes.Select(estudiante =>
            {
                estadisticas.TryGetValue(estudiante.id_estudiante, out var estadistica);
                var totalRegistros = estadistica?.TotalRegistros ?? 0;
                var totalAsistencias = estadistica?.TotalAsistencias ?? 0;
                var porcentaje = totalRegistros == 0
                    ? 0
                    : Math.Round((double)totalAsistencias / totalRegistros * 100, 2);

                return new ReporteEstudianteResponse
                {
                    id_estudiante = estudiante.id_estudiante,
                    nombre_estudiante = $"{estudiante.apellidos}, {estudiante.nombres}",
                    curso = curso,
                    total_asistencias = totalAsistencias,
                    total_faltas = estadistica?.TotalFaltas ?? 0,
                    total_atrasos = estadistica?.TotalAtrasos ?? 0,
                    porcentaje_asistencia = porcentaje,
                    estado_academico = ObtenerEstado(porcentaje),
                };
            }).ToList();

            return new ReporteAsistenciaResponse
            {
                id_clase = clase.id_clase,
                curso = curso,
                docente = $"{clase.Profesor.nombres} {clase.Profesor.apellidos}",
                fecha_inicio = fechaInicio,
                fecha_fin = fechaFin,
                estudiantes = filas,
                resumen = new ReporteResumenResponse
                {
                    total_estudiantes = filas.Count,
                    promedio_asistencia = filas.Count == 0
                        ? 0
                        : Math.Round(filas.Average(e => e.porcentaje_asistencia), 2),
                    total_faltas = filas.Sum(e => e.total_faltas),
                    total_atrasos = filas.Sum(e => e.total_atrasos),
                },
                alertas = filas
                    .Where(e => e.total_faltas >= 2 || e.porcentaje_asistencia < PorcentajeRegular)
                    .Select(e => new ReporteAlertaResponse
                    {
                        id_estudiante = e.id_estudiante,
                        nombre_estudiante = e.nombre_estudiante,
                        mensaje = CrearMensajeAlerta(e),
                    })
                    .ToList(),
            };
        }

        public async Task<ReporteCalificacionesResponse> GenerarCalificacionesAsync(
            int idClase,
            DateOnly fechaInicio,
            DateOnly fechaFin,
            int? idEstudiante,
            int? idProfesor,
            CancellationToken cancellationToken = default)
        {
            if (fechaInicio > fechaFin)
                throw new BusinessException("La fecha de inicio no puede ser posterior a la fecha de fin.");

            var clase = await _unitOfWork.ClaseRepository.GetAll()
                .Include(c => c.Profesor)
                .Include(c => c.Paralelo)
                .Include(c => c.Materia)
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    c => c.id_clase == idClase && c.activo,
                    cancellationToken)
                ?? throw new NotFoundException("Clase", idClase);

            if (idProfesor.HasValue && clase.id_profesor != idProfesor.Value)
                throw new UnauthorizedBusinessException("No tiene permisos para generar reportes de esta clase.");

            var estudiantesQuery = _unitOfWork.EstudianteRepository.GetAll()
                .Where(e => e.activo && e.ParaleloEstudiantes.Any(pe =>
                    pe.id_paralelo == clase.id_paralelo && pe.activo));

            if (idEstudiante.HasValue)
                estudiantesQuery = estudiantesQuery.Where(e => e.id_estudiante == idEstudiante.Value);

            var estudiantes = await estudiantesQuery
                .OrderBy(e => e.apellidos)
                .ThenBy(e => e.nombres)
                .Select(e => new
                {
                    e.id_estudiante,
                    e.nombres,
                    e.apellidos,
                })
                .ToListAsync(cancellationToken);

            if (idEstudiante.HasValue && estudiantes.Count == 0)
                throw new BusinessException("El estudiante seleccionado no pertenece al curso indicado.");

            var estudiantesIds = estudiantes.Select(e => e.id_estudiante).ToList();

            var actividades = await _actividadRepository.GetByClaseIdAsync(idClase);
            
            var fechaInicioDateTime = fechaInicio.ToDateTime(TimeOnly.MinValue);
            var fechaFinDateTime = fechaFin.ToDateTime(TimeOnly.MaxValue);

            actividades = actividades.Where(a => a.fecha >= fechaInicioDateTime && a.fecha <= fechaFinDateTime).ToList();
            var actividadesIds = actividades.Select(a => a.id_actividad).ToList();

            var calificaciones = await _calificacionRepository.GetByClaseIdAsync(idClase);
            calificaciones = calificaciones.Where(c => actividadesIds.Contains(c.id_actividad)).ToList();

            var curso = $"{clase.Materia.Nombre} de {clase.Paralelo.nombre}";
            var filas = estudiantes.Select(estudiante =>
            {
                var promedio = calificaciones.Where(c => c.id_estudiante == estudiante.id_estudiante)
                                             .Sum(c => {
                                                 var act = actividades.FirstOrDefault(a => a.id_actividad == c.id_actividad);
                                                 return act != null ? (c.nota * act.peso) / 100m : 0;
                                             });

                double promedioParcial = Math.Round((double)promedio, 2);

                // Asumimos Promedio Final igual al Parcial por ahora, o podría haber una lógica extra.
                double promedioFinal = promedioParcial;
                string estado = promedioFinal >= 7.0 ? "Aprobado" : (promedioFinal >= 5.0 ? "Riesgo" : "Reprobado");

                return new ReporteCalificacionEstudianteResponse
                {
                    id_estudiante = estudiante.id_estudiante,
                    nombre_estudiante = $"{estudiante.apellidos}, {estudiante.nombres}",
                    curso = curso,
                    promedio_parcial = promedioParcial,
                    promedio_final = promedioFinal,
                    estado = estado
                };
            }).ToList();

            double promedioCurso = filas.Count == 0 ? 0 : Math.Round(filas.Average(e => e.promedio_final), 2);

            return new ReporteCalificacionesResponse
            {
                id_clase = clase.id_clase,
                curso = curso,
                docente = $"{clase.Profesor.nombres} {clase.Profesor.apellidos}",
                fecha_inicio = fechaInicio,
                fecha_fin = fechaFin,
                estudiantes = filas,
                resumen = new ReporteCalificacionResumenResponse
                {
                    total_estudiantes = filas.Count,
                    promedio_curso = promedioCurso,
                    aprobados = filas.Count(e => e.estado == "Aprobado"),
                    en_riesgo = filas.Count(e => e.estado == "Riesgo"),
                    reprobados = filas.Count(e => e.estado == "Reprobado")
                },
                alertas = filas
                    .Where(e => e.estado != "Aprobado")
                    .Select(e => new ReporteAlertaResponse
                    {
                        id_estudiante = e.id_estudiante,
                        nombre_estudiante = e.nombre_estudiante,
                        mensaje = $"Promedio bajo: {e.promedio_final:0.##}. Estado: {e.estado}."
                    })
                    .ToList(),
            };
        }

        private static string ObtenerEstado(double porcentaje)
        {
            if (porcentaje >= PorcentajeExcelente) return "Excelente";
            if (porcentaje >= PorcentajeRegular) return "Regular";
            return "Riesgo";
        }

        private static string CrearMensajeAlerta(ReporteEstudianteResponse estudiante)
        {
            if (estudiante.total_faltas >= 2 && estudiante.porcentaje_asistencia < PorcentajeRegular)
                return $"{estudiante.total_faltas} faltas y {estudiante.porcentaje_asistencia:0.##}% de asistencia.";

            if (estudiante.total_faltas >= 2)
                return $"{estudiante.total_faltas} faltas registradas.";

            return $"Porcentaje de asistencia bajo: {estudiante.porcentaje_asistencia:0.##}%.";
        }
    }
}
