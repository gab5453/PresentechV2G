using Presentech.Business.DTOs.Dashboard;

namespace Presentech.Business.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardResponse> GetDashboardStatsAsync(int? idProfesor, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<AsistenciaRegistradaResponse>> ObtenerAsistenciasRegistradasAsync(
            DateOnly fecha,
            int? idProfesor,
            CancellationToken cancellationToken = default);
    }
}
