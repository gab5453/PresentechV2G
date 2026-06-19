using Microsoft.EntityFrameworkCore;
using Presentech.DataAccess.Context;
using Presentech.DataAccess.Entities;
using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.DataAccess.Repositories
{
    public class CalificacionRepository : ICalificacionRepository
    {
        private readonly PresentechDbContext _context;

        public CalificacionRepository(PresentechDbContext context)
        {
            _context = context;
        }

        public async Task<CalificacionEntity> GetByActividadAndEstudianteAsync(int actividadId, int estudianteId)
        {
            return await _context.Calificaciones
                .FirstOrDefaultAsync(c => c.id_actividad == actividadId && c.id_estudiante == estudianteId);
        }

        public async Task<List<CalificacionEntity>> GetByClaseIdAsync(int claseId)
        {
            return await _context.Calificaciones
                .Include(c => c.Actividad)
                .Where(c => c.Actividad.id_clase == claseId && c.Actividad.activo)
                .ToListAsync();
        }

        public async Task<CalificacionEntity> CreateAsync(CalificacionEntity calificacion)
        {
            await _context.Calificaciones.AddAsync(calificacion);
            await _context.SaveChangesAsync();
            return calificacion;
        }

        public async Task<CalificacionEntity> UpdateAsync(CalificacionEntity calificacion)
        {
            _context.Calificaciones.Update(calificacion);
            await _context.SaveChangesAsync();
            return calificacion;
        }
    }
}
