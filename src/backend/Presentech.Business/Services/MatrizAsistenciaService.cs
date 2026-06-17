using Microsoft.EntityFrameworkCore;
using Presentech.Business.DTOs.MatrizAsistencia;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.DataManagement.Interfaces;

namespace Presentech.Business.Services
{
    public class MatrizAsistenciaService : IMatrizAsistenciaService
    {
        private static readonly string[] MonthNames =
        [
            "",
            "ENERO",
            "FEBRERO",
            "MARZO",
            "ABRIL",
            "MAYO",
            "JUNIO",
            "JULIO",
            "AGOSTO",
            "SEPTIEMBRE",
            "OCTUBRE",
            "NOVIEMBRE",
            "DICIEMBRE",
        ];

        private static readonly Dictionary<DayOfWeek, string> DayInitials = new()
        {
            [DayOfWeek.Monday] = "L",
            [DayOfWeek.Tuesday] = "M",
            [DayOfWeek.Wednesday] = "M",
            [DayOfWeek.Thursday] = "J",
            [DayOfWeek.Friday] = "V",
            [DayOfWeek.Saturday] = "S",
            [DayOfWeek.Sunday] = "D",
        };

        private readonly IUnitOfWork _unitOfWork;

        public MatrizAsistenciaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<MatrizAsistenciaResponse> GenerarAsync(
            int idParalelo,
            int? anioInicio,
            CancellationToken cancellationToken = default)
        {
            var startYear = anioInicio ?? GetCurrentSchoolYearStart();
            var fechaInicio = new DateOnly(startYear, 9, 1);
            var fechaFin = new DateOnly(startYear + 1, 6, 30);

            var paralelo = await _unitOfWork.ParaleloRepository.GetAll()
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.id_paralelo == idParalelo && p.activo, cancellationToken)
                ?? throw new NotFoundException("Paralelo", idParalelo);

            var dias = BuildDays(fechaInicio, fechaFin);

            var estudiantes = await _unitOfWork.EstudianteRepository.GetAll()
                .AsNoTracking()
                .Where(e => e.activo && e.ParaleloEstudiantes.Any(pe =>
                    pe.id_paralelo == idParalelo && pe.activo))
                .OrderBy(e => e.apellidos)
                .ThenBy(e => e.nombres)
                .Select(e => new
                {
                    e.id_estudiante,
                    e.apellidos,
                    e.nombres,
                })
                .ToListAsync(cancellationToken);

            var estudiantesIds = estudiantes.Select(e => e.id_estudiante).ToList();

            var asistencias = await _unitOfWork.AsistenciaRepository.GetAll()
                .AsNoTracking()
                .Where(a =>
                    estudiantesIds.Contains(a.id_estudiante) &&
                    a.RegistroAsistencia.fecha >= fechaInicio &&
                    a.RegistroAsistencia.fecha <= fechaFin &&
                    a.RegistroAsistencia.ClaseHorario.Clase.id_paralelo == idParalelo &&
                    a.RegistroAsistencia.ClaseHorario.Clase.activo)
                .Select(a => new
                {
                    a.id_estudiante,
                    a.RegistroAsistencia.fecha,
                    Presente = a.asistio || a.atrasado,
                })
                .ToListAsync(cancellationToken);

            var asistenciasPorEstudianteFecha = asistencias
                .GroupBy(a => new { a.id_estudiante, a.fecha })
                .ToDictionary(
                    g => (g.Key.id_estudiante, g.Key.fecha),
                    g => ResolveDailyState(g.Select(x => x.Presente).ToList()));

            var filas = estudiantes.Select((estudiante, index) =>
            {
                var estados = new Dictionary<string, string>();
                foreach (var dia in dias)
                {
                    if (asistenciasPorEstudianteFecha.TryGetValue(
                        (estudiante.id_estudiante, dia.fecha),
                        out var estado))
                    {
                        estados[dia.fecha.ToString("yyyy-MM-dd")] = estado;
                    }
                }

                var resumenPeriodos = new Dictionary<string, MatrizAsistenciaResumenPeriodoDto>
                {
                    ["periodo_1"] = CountPeriod(estados, new DateOnly(startYear, 9, 1), new DateOnly(startYear, 12, 31)),
                    ["periodo_2"] = CountPeriod(estados, new DateOnly(startYear + 1, 1, 1), new DateOnly(startYear + 1, 3, 31)),
                    ["periodo_3"] = CountPeriod(estados, new DateOnly(startYear + 1, 4, 1), new DateOnly(startYear + 1, 6, 30)),
                };

                var totalAsistencias = resumenPeriodos.Values.Sum(p => p.asistencias);
                var totalFaltas = resumenPeriodos.Values.Sum(p => p.faltas);
                var totalParciales = resumenPeriodos.Values.Sum(p => p.parciales);

                return new MatrizAsistenciaEstudianteDto
                {
                    id_estudiante = estudiante.id_estudiante,
                    numero = index + 1,
                    nombre_estudiante = $"{estudiante.apellidos}, {estudiante.nombres}",
                    estados_por_fecha = estados,
                    resumen_periodos = resumenPeriodos,
                    total_asistencias = totalAsistencias,
                    total_faltas = totalFaltas,
                    total_parciales = totalParciales,
                    nivel_alerta = GetAlertLevel(totalFaltas),
                };
            }).ToList();

            return new MatrizAsistenciaResponse
            {
                id_paralelo = paralelo.id_paralelo,
                paralelo = paralelo.nombre,
                anio_lectivo = $"{startYear}-{startYear + 1}",
                fecha_inicio = fechaInicio,
                fecha_fin = fechaFin,
                dias = dias,
                estudiantes = filas,
            };
        }

        private static int GetCurrentSchoolYearStart()
        {
            var today = DateTime.Today;
            return today.Month >= 9 ? today.Year : today.Year - 1;
        }

        private static IReadOnlyList<MatrizAsistenciaDiaDto> BuildDays(DateOnly start, DateOnly end)
        {
            var days = new List<MatrizAsistenciaDiaDto>();
            for (var date = start; date <= end; date = date.AddDays(1))
            {
                days.Add(new MatrizAsistenciaDiaDto
                {
                    fecha = date,
                    dia_mes = date.Day,
                    inicial_dia = DayInitials[date.DayOfWeek],
                    mes = MonthNames[date.Month],
                });
            }

            return days;
        }

        private static string ResolveDailyState(IReadOnlyCollection<bool> attendances)
        {
            if (attendances.Count == 0)
                return string.Empty;

            if (attendances.All(present => present))
                return "P";

            if (attendances.All(present => !present))
                return "X";

            return "-";
        }

        private static MatrizAsistenciaResumenPeriodoDto CountPeriod(
            IReadOnlyDictionary<string, string> estados,
            DateOnly start,
            DateOnly end)
        {
            var result = new MatrizAsistenciaResumenPeriodoDto();

            for (var date = start; date <= end; date = date.AddDays(1))
            {
                if (!estados.TryGetValue(date.ToString("yyyy-MM-dd"), out var estado))
                    continue;

                switch (estado)
                {
                    case "P":
                        result.asistencias++;
                        break;
                    case "X":
                        result.faltas++;
                        break;
                    case "-":
                        result.parciales++;
                        break;
                }
            }

            return result;
        }

        private static string GetAlertLevel(int totalFaltas)
        {
            if (totalFaltas >= 3)
                return "rojo";

            if (totalFaltas == 2)
                return "amarillo";

            return "normal";
        }
    }
}
