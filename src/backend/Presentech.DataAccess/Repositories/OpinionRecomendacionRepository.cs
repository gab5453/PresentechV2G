using Presentech.DataAccess.Context;
using Presentech.DataAccess.Entities;
using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.DataAccess.Repositories
{
    public class OpinionRecomendacionRepository : IOpinionRecomendacionRepository
    {
        private readonly PresentechDbContext _context;

        public OpinionRecomendacionRepository(PresentechDbContext context)
        {
            _context = context;
        }

        public async Task AgregarAsync(
            OpinionRecomendacionEntity opinion,
            CancellationToken cancellationToken = default)
        {
            await _context.OpinionesRecomendaciones.AddAsync(opinion, cancellationToken);
        }
    }
}
