using Presentech.Business.DTOs.MatrizAsistencia;

namespace Presentech.Business.Interfaces
{
    public interface IMatrizAsistenciaService
    {
        Task<MatrizAsistenciaResponse> GenerarAsync(
            int idParalelo,
            int? anioInicio,
            CancellationToken cancellationToken = default);

        Task<ReporteTrimestralEstudianteResponse> GenerarReporteTrimestralEstudianteAsync(
            int idParalelo,
            int idEstudiante,
            int? anioInicio,
            CancellationToken cancellationToken = default);
    }
}
