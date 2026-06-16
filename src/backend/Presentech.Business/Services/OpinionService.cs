using Presentech.Business.DTOs.Opinion;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.Business.Validators;
using Presentech.DataAccess.Entities;
using Presentech.DataManagement.Interfaces;

namespace Presentech.Business.Services
{
    public class OpinionService : IOpinionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly RegistrarOpinionRequestValidator _validator;

        public OpinionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _validator = new RegistrarOpinionRequestValidator();
        }

        public async Task<RegistrarOpinionResponse> RegistrarAsync(
            RegistrarOpinionRequest request,
            int idProfesor,
            CancellationToken cancellationToken = default)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.Errors);

            var profesor = await _unitOfWork.ProfesorRepository.ObtenerPorIdAsync(
                idProfesor,
                cancellationToken);

            if (profesor is null)
                throw new NotFoundException("Profesor", idProfesor);

            var opinion = new OpinionRecomendacionEntity
            {
                id_profesor = idProfesor,
                utilizaria_siguiente_anio = request.utilizaria_siguiente_anio!.Value,
                calificacion_usabilidad = request.calificacion_usabilidad!.Value,
                aspecto_mas_util = request.aspecto_mas_util.Trim(),
                aspectos_por_mejorar = request.aspectos_por_mejorar.Trim(),
                created_at = DateTime.UtcNow,
            };

            await _unitOfWork.OpinionRecomendacionRepository.AgregarAsync(
                opinion,
                cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new RegistrarOpinionResponse
            {
                id_opinion = opinion.id_opinion,
                created_at = opinion.created_at,
            };
        }
    }
}
