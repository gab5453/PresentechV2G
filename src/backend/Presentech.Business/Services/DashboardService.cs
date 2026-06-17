using Microsoft.EntityFrameworkCore;
using Presentech.Business.DTOs.Dashboard;
using Presentech.Business.Interfaces;
using Presentech.DataManagement.Interfaces;

namespace Presentech.Business.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DashboardResponse> GetDashboardStatsAsync(int? idProfesor, CancellationToken cancellationToken = default)
        {
            var response = new DashboardResponse();

            var asistenciasQuery = _unitOfWork.AsistenciaRepository.GetAll();
            var clasesQuery = _unitOfWork.ClaseRepository.GetAll().Where(c => c.activo);

            if (idProfesor.HasValue)
            {
                asistenciasQuery = asistenciasQuery.Where(a => 
                    a.RegistroAsistencia.ClaseHorario.Clase.id_profesor == idProfesor.Value && 
                    a.RegistroAsistencia.ClaseHorario.Clase.activo);
                
                clasesQuery = clasesQuery.Where(c => c.id_profesor == idProfesor.Value);
            }

            response.total_clases = await clasesQuery.CountAsync(cancellationToken);

            if (idProfesor.HasValue)
            {
                response.total_estudiantes = await _unitOfWork.EstudianteRepository.GetAll()
                    .Where(e => e.activo && e.ParaleloEstudiantes.Any(pe => pe.Paralelo.Clases.Any(c => c.id_profesor == idProfesor.Value && c.activo)))
                    .CountAsync(cancellationToken);
            }
            else
            {
                response.total_estudiantes = await _unitOfWork.EstudianteRepository.GetAll()
                    .Where(e => e.activo)
                    .CountAsync(cancellationToken);
            }

            // Calcular porcentaje global de asistencia
            var totalAsistenciasRegistradas = await asistenciasQuery.CountAsync(cancellationToken);
            if (totalAsistenciasRegistradas > 0)
            {
                var asistieronCount = await asistenciasQuery.CountAsync(a => a.asistio, cancellationToken);
                response.porcentaje_asistencia_global = Math.Round((double)asistieronCount / totalAsistenciasRegistradas * 100, 2);
            }
            else
            {
                response.porcentaje_asistencia_global = 100.0;
            }

            // Calcular estudiantes en riesgo (>= 2 faltas)
            var faltasPorEstudiante = await asistenciasQuery
                .Where(a => !a.asistio)
                .GroupBy(a => a.id_estudiante)
                .Select(g => new 
                {
                    IdEstudiante = g.Key,
                    Faltas = g.Count(),
                    ClasesNombres = g.Select(a => a.RegistroAsistencia.ClaseHorario.Clase.Materia.Nombre).Distinct().ToList()
                })
                .Where(x => x.Faltas >= 2)
                .ToListAsync(cancellationToken);

            var estudiantesIds = faltasPorEstudiante.Select(f => f.IdEstudiante).ToList();

            var estudiantesEnRiesgo = await _unitOfWork.EstudianteRepository.GetAll()
                .Where(e => e.activo && estudiantesIds.Contains(e.id_estudiante))
                .ToDictionaryAsync(e => e.id_estudiante, e => e, cancellationToken);

            foreach (var item in faltasPorEstudiante)
            {
                if (estudiantesEnRiesgo.TryGetValue(item.IdEstudiante, out var estudiante))
                {
                    response.estudiantes_en_riesgo.Add(new EstudianteRiesgoDTO
                    {
                        id_estudiante = estudiante.id_estudiante,
                        nombres = estudiante.nombres,
                        apellidos = estudiante.apellidos,
                        numero_faltas = item.Faltas,
                        clases_afectadas = item.ClasesNombres
                    });
                }
            }

            response.total_estudiantes_riesgo = response.estudiantes_en_riesgo.Count;
            response.estudiantes_en_riesgo = response.estudiantes_en_riesgo.OrderByDescending(e => e.numero_faltas).ToList();

            return response;
        }

        public async Task<IReadOnlyList<AsistenciaRegistradaResponse>> ObtenerAsistenciasRegistradasAsync(
            DateOnly fecha,
            int? idProfesor,
            CancellationToken cancellationToken = default)
        {
            var query = _unitOfWork.AsistenciaRepository.GetAll()
                .Where(a =>
                    a.RegistroAsistencia.fecha == fecha &&
                    a.RegistroAsistencia.ClaseHorario.Clase.activo);

            if (idProfesor.HasValue)
            {
                query = query.Where(a =>
                    a.RegistroAsistencia.ClaseHorario.Clase.id_profesor == idProfesor.Value);
            }

            var registros = await query
                .GroupBy(a => new
                {
                    a.id_registro,
                    a.RegistroAsistencia.fecha,
                    a.RegistroAsistencia.created_at,
                    a.RegistroAsistencia.ClaseHorario.hora_inicio,
                    a.RegistroAsistencia.ClaseHorario.hora_fin,
                    Dia = a.RegistroAsistencia.ClaseHorario.DiaSemana.nombre,
                    a.RegistroAsistencia.ClaseHorario.Clase.id_profesor,
                    ProfesorNombres = a.RegistroAsistencia.ClaseHorario.Clase.Profesor.nombres,
                    ProfesorApellidos = a.RegistroAsistencia.ClaseHorario.Clase.Profesor.apellidos,
                    Materia = a.RegistroAsistencia.ClaseHorario.Clase.Materia.Nombre,
                    Paralelo = a.RegistroAsistencia.ClaseHorario.Clase.Paralelo.nombre,
                })
                .Select(g => new
                {
                    g.Key.id_registro,
                    g.Key.fecha,
                    g.Key.created_at,
                    g.Key.id_profesor,
                    g.Key.ProfesorNombres,
                    g.Key.ProfesorApellidos,
                    g.Key.Materia,
                    g.Key.Paralelo,
                    g.Key.Dia,
                    g.Key.hora_inicio,
                    g.Key.hora_fin,
                    TotalEstudiantes = g.Count(),
                    TotalPresentes = g.Count(a => a.asistio || a.atrasado),
                    TotalAusentes = g.Count(a => !a.asistio && !a.atrasado),
                    TotalAtrasados = g.Count(a => a.atrasado),
                })
                .ToListAsync(cancellationToken);

            return registros
                .OrderByDescending(r => r.created_at)
                .ThenBy(r => r.hora_inicio)
                .Select(r => new AsistenciaRegistradaResponse
                {
                    id_registro = r.id_registro,
                    fecha = r.fecha,
                    created_at = r.created_at,
                    id_profesor = r.id_profesor,
                    docente = $"{r.ProfesorNombres} {r.ProfesorApellidos}",
                    materia = r.Materia,
                    paralelo = r.Paralelo,
                    dia = r.Dia,
                    hora_inicio = r.hora_inicio.ToString("HH:mm"),
                    hora_fin = r.hora_fin.ToString("HH:mm"),
                    total_estudiantes = r.TotalEstudiantes,
                    total_presentes = r.TotalPresentes,
                    total_ausentes = r.TotalAusentes,
                    total_atrasados = r.TotalAtrasados,
                })
                .ToList();
        }
    }
}
