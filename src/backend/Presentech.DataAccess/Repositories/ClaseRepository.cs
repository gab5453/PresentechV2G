using Presentech.DataAccess.Context;
using Presentech.DataAccess.Entities;
using Presentech.DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Presentech.DataAccess.Repositories
{
    public class ClaseRepository : IClaseRepository
    {
        private readonly PresentechDbContext _context;

        public ClaseRepository(PresentechDbContext context)
        {
            _context = context;
        }

        // =========================
        // CONSULTAS
        // =========================
        public async Task<IReadOnlyList<ClaseEntity>> ObtenerTodasAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Clases
                .AsNoTracking()
                .Include(c => c.Profesor)
                .Include(c => c.Paralelo)
                .Include(c => c.Materia)
                .Include(c => c.ClasesHorario)
                    .ThenInclude(ch => ch.DiaSemana)
                .Where(c => c.activo)
                .OrderBy(c => c.Materia.Nombre)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<ClaseEntity>> ObtenerPorProfesorAsync(int id_profesor, CancellationToken cancellationToken = default)
        {
            return await _context.Clases
                .AsNoTracking()
                .Include(c => c.Paralelo)
                .Include(c => c.Materia)
                .Include(c => c.ClasesHorario)
                    .ThenInclude(ch => ch.DiaSemana)
                .Where(c => c.id_profesor == id_profesor && c.activo)
                .OrderBy(c => c.Materia.Nombre)
                .ToListAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<ClaseEntity>> ObtenerPorEstudianteAsync(int id_estudiante, CancellationToken cancellationToken = default)
        {
            return await _context.Clases
                .AsNoTracking()
                .Include(c => c.Paralelo)
                .Include(c => c.Materia)
                .Include(c => c.Profesor)
                .Where(c => c.activo && _context.ParaleloEstudiantes
                    .Any(pe => pe.id_paralelo == c.id_paralelo && pe.id_estudiante == id_estudiante && pe.activo))
                .OrderBy(c => c.Materia.Nombre)
                .ToListAsync(cancellationToken);
        }

        public async Task<ClaseEntity?> ObtenerPorIdAsync(int id_clase, CancellationToken cancellationToken = default)
        {
            return await _context.Clases
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.id_clase == id_clase && c.activo, cancellationToken);
        }

        public async Task<ClaseEntity?> ObtenerConHorarioAsync(int id_clase, CancellationToken cancellationToken = default)
        {
            return await _context.Clases
                .Include(c => c.Paralelo)
                .Include(c => c.Materia)
                .Include(c => c.ClasesHorario)
                    .ThenInclude(ch => ch.DiaSemana)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.id_clase == id_clase && c.activo, cancellationToken);
        }

        public IQueryable<ClaseEntity> GetAll()
        {
            return _context.Clases.AsNoTracking();
        }

        // =========================
        // COMANDOS
        // =========================
        public async Task AgregarAsync(ClaseEntity clase, CancellationToken cancellationToken = default)
        {
            await _context.Clases.AddAsync(clase, cancellationToken);
        }

        public void Actualizar(ClaseEntity clase)
        {
            _context.Clases.Update(clase);
        }

        public void Eliminar(ClaseEntity clase)
        {
            // Soft delete — solo marca como inactivo
            clase.activo = false;
            _context.Clases.Update(clase);
        }
    }
}
