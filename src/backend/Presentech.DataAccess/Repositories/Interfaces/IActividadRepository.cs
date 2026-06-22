using Presentech.DataAccess.Entities;

namespace Presentech.DataAccess.Repositories.Interfaces
{
    public interface IActividadRepository
    {
        Task<ActividadEntity> CreateAsync(ActividadEntity actividad);
        Task<List<ActividadEntity>> GetByClaseIdAsync(int claseId);
        Task<ActividadEntity?> ObtenerPorIdAsync(int id);
        Task UpdateAsync(ActividadEntity actividad);
    }
}
