using Presentech.Business.DTOs.Opinion;

namespace Presentech.Business.Interfaces
{
    public interface IOpinionService
    {
        Task<RegistrarOpinionResponse> RegistrarAsync(
            RegistrarOpinionRequest request,
            int idProfesor,
            CancellationToken cancellationToken = default);
    }
}
