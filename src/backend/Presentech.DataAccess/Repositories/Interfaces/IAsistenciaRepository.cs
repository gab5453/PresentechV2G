using Presentech.DataAccess.Entities;

namespace Presentech.DataAccess.Repositories.Interfaces
{
    public interface IAsistenciaRepository
    {
        // =========================
        // CONSULTAS
        // =========================
        Task<IReadOnlyList<AsistenciaEntity>> ObtenerPorRegistroAsync(int id_registro, CancellationToken cancellationToken = default);
        Task<AsistenciaEntity?> ObtenerPorIdAsync(int id_asistencia, CancellationToken cancellationToken = default);
        IQueryable<AsistenciaEntity> GetAll();

        // =========================
        // COMANDOS
        // =========================
        Task AgregarAsync(AsistenciaEntity asistencia, CancellationToken cancellationToken = default);
        Task AgregarRangoAsync(IEnumerable<AsistenciaEntity> asistencias, CancellationToken cancellationToken = default);
        void Actualizar(AsistenciaEntity asistencia);
        void ActualizarRango(IEnumerable<AsistenciaEntity> asistencias);
    }
}
