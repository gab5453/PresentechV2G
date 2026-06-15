using Presentech.DataAccess.Entities;

namespace Presentech.DataAccess.Repositories.Interfaces
{
    public interface IOpinionRecomendacionRepository
    {
        Task AgregarAsync(
            OpinionRecomendacionEntity opinion,
            CancellationToken cancellationToken = default);
    }
}
