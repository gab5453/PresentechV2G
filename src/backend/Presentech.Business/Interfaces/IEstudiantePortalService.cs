using Presentech.Business.DTOs.EstudiantePortal;

namespace Presentech.Business.Interfaces
{
    public interface IEstudiantePortalService
    {
        Task<EstudianteDashboardResponse> GetDashboardAsync(int idEstudiante, CancellationToken cancellationToken = default);
        Task<List<EstudianteClaseDto>> GetClasesAsync(int idEstudiante, CancellationToken cancellationToken = default);
        Task<EstudianteClaseResumenResponse> GetResumenClaseAsync(int idEstudiante, int idClase, CancellationToken cancellationToken = default);
    }
}
