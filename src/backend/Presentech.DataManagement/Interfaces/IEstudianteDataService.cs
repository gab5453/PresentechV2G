using Presentech.DataManagement.Models;

namespace Presentech.DataManagement.Interfaces
{
    public interface IEstudianteDataService
    {
        // =========================
        // CONSULTAS
        // =========================
        Task<IReadOnlyList<EstudianteDataModel>> ObtenerPorParaleloAsync(int id_paralelo, CancellationToken cancellationToken = default);
        Task<EstudianteDataModel?> ObtenerPorIdAsync(int id_estudiante, CancellationToken cancellationToken = default);
        Task<EstudianteDataModel?> ObtenerPorCedulaAsync(string cedula, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<EstudianteDataModel>> ObtenerTodosAsync(CancellationToken cancellationToken = default);

        // =========================
        // COMANDOS
        // =========================
        Task<EstudianteDataModel> CrearAsync(EstudianteDataModel model, CancellationToken cancellationToken = default);
        Task MatricularAsync(int id_estudiante, int id_paralelo, CancellationToken cancellationToken = default);
        Task DesmatricularAsync(int id_estudiante, int id_paralelo, CancellationToken cancellationToken = default);

        // =========================
        // IMPORTACIÓN EXCEL (reemplaza matrícula completa del paralelo)
        // =========================
        Task ImportarEstudiantesAsync(int id_paralelo, IEnumerable<EstudianteDataModel> estudiantes, CancellationToken cancellationToken = default);
    }
}
