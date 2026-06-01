using Presentech.DataAccess.Context;
using Presentech.DataAccess.Entities;
using Presentech.DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Presentech.DataAccess.Repositories
{
    public class AsistenciaRepository : IAsistenciaRepository
    {
        private readonly PresentechDbContext _context;

        public AsistenciaRepository(PresentechDbContext context)
        {
            _context = context;
        }

        // =========================
        // CONSULTAS
        // =========================
        public async Task<IReadOnlyList<AsistenciaEntity>> ObtenerPorRegistroAsync(int id_registro, CancellationToken cancellationToken = default)
        {
            return await _context.Asistencias
                .AsNoTracking()
                .Include(a => a.Estudiante)
                .Where(a => a.id_registro == id_registro)
                .OrderBy(a => a.Estudiante.apellidos)
                .ThenBy(a => a.Estudiante.nombres)
                .ToListAsync(cancellationToken);
        }

        public async Task<AsistenciaEntity?> ObtenerPorIdAsync(int id_asistencia, CancellationToken cancellationToken = default)
        {
            return await _context.Asistencias
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.id_asistencia == id_asistencia, cancellationToken);
        }

        public IQueryable<AsistenciaEntity> GetAll()
        {
            return _context.Asistencias.AsNoTracking();
        }

        // =========================
        // COMANDOS
        // =========================
        public async Task AgregarAsync(AsistenciaEntity asistencia, CancellationToken cancellationToken = default)
        {
            await _context.Asistencias.AddAsync(asistencia, cancellationToken);
        }

        public async Task AgregarRangoAsync(IEnumerable<AsistenciaEntity> asistencias, CancellationToken cancellationToken = default)
        {
            await _context.Asistencias.AddRangeAsync(asistencias, cancellationToken);
        }

        public void Actualizar(AsistenciaEntity asistencia)
        {
            _context.Asistencias.Update(asistencia);
        }

        public void ActualizarRango(IEnumerable<AsistenciaEntity> asistencias)
        {
            _context.Asistencias.UpdateRange(asistencias);
        }
    }
}
