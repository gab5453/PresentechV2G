using Presentech.DataAccess.Context;
using Presentech.DataAccess.Entities;
using Presentech.DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Presentech.DataAccess.Repositories
{
    public class EstudianteRepository : IEstudianteRepository
    {
        private readonly PresentechDbContext _context;

        public EstudianteRepository(PresentechDbContext context)
        {
            _context = context;
        }

        // =========================
        // CONSULTAS
        // =========================
        public async Task<IReadOnlyList<EstudianteEntity>> ObtenerPorParaleloAsync(int id_paralelo, CancellationToken cancellationToken = default)
        {
            return await _context.Estudiantes
                .AsNoTracking()
                .Where(e => e.activo && e.ParaleloEstudiantes.Any(pe => pe.id_paralelo == id_paralelo && pe.activo))
                .OrderBy(e => e.apellidos)
                .ThenBy(e => e.nombres)
                .ToListAsync(cancellationToken);
        }

        public async Task<EstudianteEntity?> ObtenerPorIdAsync(int id_estudiante, CancellationToken cancellationToken = default)
        {
            return await _context.Estudiantes
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.id_estudiante == id_estudiante && e.activo, cancellationToken);
        }

        public IQueryable<EstudianteEntity> GetAll()
        {
            return _context.Estudiantes.AsNoTracking();
        }

        // =========================
        // COMANDOS
        // =========================
        public async Task AgregarAsync(EstudianteEntity estudiante, CancellationToken cancellationToken = default)
        {
            await _context.Estudiantes.AddAsync(estudiante, cancellationToken);
        }

        public async Task AgregarRangoAsync(IEnumerable<EstudianteEntity> estudiantes, CancellationToken cancellationToken = default)
        {
            await _context.Estudiantes.AddRangeAsync(estudiantes, cancellationToken);
        }

        public void Actualizar(EstudianteEntity estudiante)
        {
            _context.Estudiantes.Update(estudiante);
        }

        // =========================
        // MATRÍCULA
        // =========================
        public async Task DesactivarMatriculasPorParaleloAsync(int id_paralelo, CancellationToken cancellationToken = default)
        {
            var matriculas = await _context.ParaleloEstudiantes
                .Where(pe => pe.id_paralelo == id_paralelo && pe.activo)
                .ToListAsync(cancellationToken);

            foreach (var matricula in matriculas)
                matricula.activo = false;
        }

        public async Task MatricularRangoAsync(IEnumerable<ParaleloEstudianteEntity> matriculas, CancellationToken cancellationToken = default)
        {
            await _context.ParaleloEstudiantes.AddRangeAsync(matriculas, cancellationToken);
        }
    }
}
