using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.DataManagement.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        // =========================
        // REPOSITORIES — DOMINIO PRESENTECH
        // =========================
        IAdministradorRepository AdministradorRepository { get; }
        IProfesorRepository ProfesorRepository { get; }
        IEstudianteRepository EstudianteRepository { get; }
        IParaleloRepository ParaleloRepository { get; }
        IMateriaRepository MateriaRepository { get; }
        IClaseRepository ClaseRepository { get; }
        IClaseHorarioRepository ClaseHorarioRepository { get; }
        IRegistroAsistenciaRepository RegistroAsistenciaRepository { get; }
        IAsistenciaRepository AsistenciaRepository { get; }
        IOpinionRecomendacionRepository OpinionRecomendacionRepository { get; }

        // =========================
        // SAVE CHANGES
        // =========================
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
