using Presentech.Business.DTOs.EstudiantePortal;

using Presentech.Business.DTOs.Clase;

namespace Presentech.Business.Interfaces
{
    public interface IEstudiantePortalService
    {
        Task<EstudianteDashboardResponse> GetDashboardAsync(int idEstudiante, CancellationToken cancellationToken = default);
        Task<List<ClaseResponse>> GetClasesAsync(int idEstudiante, CancellationToken cancellationToken = default);
        Task<EstudianteClaseResumenResponse> GetResumenClaseAsync(int idEstudiante, int idClase, CancellationToken cancellationToken = default);
    }
}
