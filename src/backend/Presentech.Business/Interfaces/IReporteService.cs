using Presentech.Business.DTOs.Reporte;

namespace Presentech.Business.Interfaces
{
    public interface IReporteService
    {
        Task<ReporteAsistenciaResponse> GenerarAsistenciaAsync(
            int idClase,
            DateOnly fechaInicio,
            DateOnly fechaFin,
            int? idEstudiante,
            int? idProfesor,
            CancellationToken cancellationToken = default);
    }
}
