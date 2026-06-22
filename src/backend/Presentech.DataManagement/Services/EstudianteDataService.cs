using Presentech.DataAccess.Entities;
using Presentech.DataManagement.Interfaces;
using Presentech.DataManagement.Mappers;
using Presentech.DataManagement.Models;

namespace Presentech.DataManagement.Services
{
    public class EstudianteDataService : IEstudianteDataService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EstudianteDataService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // =========================
        // CONSULTAS
        // =========================
        public async Task<IReadOnlyList<EstudianteDataModel>> ObtenerPorParaleloAsync(int id_paralelo, CancellationToken cancellationToken = default)
        {
            var entities = await _unitOfWork.EstudianteRepository.ObtenerPorParaleloAsync(id_paralelo, cancellationToken);
            return entities.Select(EstudianteDataMapper.ToDataModel).ToList();
        }

        public async Task<EstudianteDataModel?> ObtenerPorIdAsync(int id_estudiante, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.EstudianteRepository.ObtenerPorIdAsync(id_estudiante, cancellationToken);
            return entity is null ? null : EstudianteDataMapper.ToDataModel(entity);
        }

        public async Task<EstudianteDataModel?> ObtenerPorCedulaAsync(string cedula, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.EstudianteRepository.ObtenerPorCedulaAsync(cedula, cancellationToken);
            return entity is null ? null : EstudianteDataMapper.ToDataModel(entity);
        }

        public async Task<IReadOnlyList<EstudianteDataModel>> ObtenerTodosAsync(CancellationToken cancellationToken = default)
        {
            var query = _unitOfWork.EstudianteRepository.GetAll();
            var entities = query.ToList(); // Note: Ideally we await EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync but IReadOnlyList is needed. We can just use ToList for now, it's small list.
            return entities.Select(EstudianteDataMapper.ToDataModel).ToList();
        }

        // =========================
        // COMANDOS
        // =========================
        public async Task<EstudianteDataModel> CrearAsync(EstudianteDataModel model, CancellationToken cancellationToken = default)
        {
            var entity = EstudianteDataMapper.ToEntity(model);
            await _unitOfWork.EstudianteRepository.AgregarAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return EstudianteDataMapper.ToDataModel(entity);
        }

        public async Task MatricularAsync(int id_estudiante, int id_paralelo, CancellationToken cancellationToken = default)
        {
            var matricula = new ParaleloEstudianteEntity
            {
                id_paralelo   = id_paralelo,
                id_estudiante = id_estudiante,
                activo        = true,
            };
            await _unitOfWork.EstudianteRepository.MatricularRangoAsync(new[] { matricula }, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task DesmatricularAsync(int id_estudiante, int id_paralelo, CancellationToken cancellationToken = default)
        {
            await _unitOfWork.EstudianteRepository.DesmatricularAsync(id_estudiante, id_paralelo, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // =========================
        // IMPORTACIÓN EXCEL
        // Desactiva la matrícula actual del paralelo y registra los nuevos estudiantes.
        // =========================
        public async Task ImportarEstudiantesAsync(int id_paralelo, IEnumerable<EstudianteDataModel> estudiantes, CancellationToken cancellationToken = default)
        {
            await _unitOfWork.EstudianteRepository.DesactivarMatriculasPorParaleloAsync(id_paralelo, cancellationToken);

            var entidades = estudiantes.Select(m => new EstudianteEntity
            {
                nombres    = m.nombres,
                apellidos  = m.apellidos,
                activo     = true,
            }).ToList();

            await _unitOfWork.EstudianteRepository.AgregarRangoAsync(entidades, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var matriculas = entidades.Select(e => new ParaleloEstudianteEntity
            {
                id_paralelo   = id_paralelo,
                id_estudiante = e.id_estudiante,
                activo        = true,
            });

            await _unitOfWork.EstudianteRepository.MatricularRangoAsync(matriculas, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
