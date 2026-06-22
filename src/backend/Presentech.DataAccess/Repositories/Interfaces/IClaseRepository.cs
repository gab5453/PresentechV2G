using Presentech.DataAccess.Entities;

namespace Presentech.DataAccess.Repositories.Interfaces
{
    public interface IClaseRepository
    {
        // =========================
        // CONSULTAS
        // =========================
        Task<IReadOnlyList<ClaseEntity>> ObtenerTodasAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ClaseEntity>> ObtenerPorProfesorAsync(int id_profesor, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ClaseEntity>> ObtenerPorEstudianteAsync(int id_estudiante, CancellationToken cancellationToken = default);
        Task<ClaseEntity?> ObtenerPorIdAsync(int id_clase, CancellationToken cancellationToken = default);
        Task<ClaseEntity?> ObtenerConHorarioAsync(int id_clase, CancellationToken cancellationToken = default);
        IQueryable<ClaseEntity> GetAll();

        // =========================
        // COMANDOS
        // =========================
        Task AgregarAsync(ClaseEntity clase, CancellationToken cancellationToken = default);
        void Actualizar(ClaseEntity clase);
        void Eliminar(ClaseEntity clase);
    }
}
