using Microsoft.EntityFrameworkCore;
using Presentech.Business.DTOs.Reporte;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.DataManagement.Interfaces;

namespace Presentech.Business.Services
{
    public class ReporteService : IReporteService
    {
        private const double PorcentajeExcelente = 90;
        private const double PorcentajeRegular = 75;
        private readonly IUnitOfWork _unitOfWork;

        public ReporteService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
