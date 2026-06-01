using Presentech.DataAccess.Entities;

namespace Presentech.DataAccess.Repositories.Interfaces
{
    public interface IEstudianteRepository
    {
        // =========================
        // CONSULTAS
        // =========================
        Task<IReadOnlyList<EstudianteEntity>> ObtenerPorParaleloAsync(int id_paralelo, CancellationToken cancellationToken = default);
        Task<EstudianteEntity?> ObtenerPorIdAsync(int id_estudiante, CancellationToken cancellationToken = default);
        IQueryable<EstudianteEntity> GetAll();

        // =========================
        // COMANDOS
        // =========================
        Task AgregarAsync(EstudianteEntity estudiante, CancellationToken cancellationToken = default);
        Task AgregarRangoAsync(IEnumerable<EstudianteEntity> estudiantes, CancellationToken cancellationToken = default);
        void Actualizar(EstudianteEntity estudiante);

        // =========================
        // MATRÍCULA
        // =========================
        Task DesactivarMatriculasPorParaleloAsync(int id_paralelo, CancellationToken cancellationToken = default);
        Task MatricularRangoAsync(IEnumerable<ParaleloEstudianteEntity> matriculas, CancellationToken cancellationToken = default);
    }
}
