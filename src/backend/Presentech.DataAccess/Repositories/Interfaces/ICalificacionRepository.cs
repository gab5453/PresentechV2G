using Presentech.DataAccess.Entities;

namespace Presentech.DataAccess.Repositories.Interfaces
{
    public interface ICalificacionRepository
    {
        Task<CalificacionEntity> GetByActividadAndEstudianteAsync(int actividadId, int estudianteId);
        Task<List<CalificacionEntity>> GetByClaseIdAsync(int claseId);
        Task<CalificacionEntity> CreateAsync(CalificacionEntity calificacion);
        Task<CalificacionEntity> UpdateAsync(CalificacionEntity calificacion);
    }
}
