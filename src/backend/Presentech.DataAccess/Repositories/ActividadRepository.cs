using Microsoft.EntityFrameworkCore;
using Presentech.DataAccess.Context;
using Presentech.DataAccess.Entities;
using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.DataAccess.Repositories
{
    public class ActividadRepository : IActividadRepository
    {
        private readonly PresentechDbContext _context;

        public ActividadRepository(PresentechDbContext context)
        {
            _context = context;
        }

        public async Task<ActividadEntity> CreateAsync(ActividadEntity actividad)
        {
            await _context.Actividades.AddAsync(actividad);
            await _context.SaveChangesAsync();
            return actividad;
        }

        public async Task<List<ActividadEntity>> GetByClaseIdAsync(int claseId)
        {
            return await _context.Actividades
                .Where(a => a.id_clase == claseId && a.activo)
                .OrderBy(a => a.created_at)
                .ToListAsync();
        }

        public async Task<ActividadEntity?> ObtenerPorIdAsync(int id)
        {
            return await _context.Actividades.FirstOrDefaultAsync(a => a.id_actividad == id && a.activo);
        }

        public async Task UpdateAsync(ActividadEntity actividad)
        {
            _context.Actividades.Update(actividad);
            await _context.SaveChangesAsync();
        }
    }
}
