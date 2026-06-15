using FluentValidation;
using Presentech.Business.DTOs.Opinion;

namespace Presentech.Business.Validators
{
    public class RegistrarOpinionRequestValidator : AbstractValidator<RegistrarOpinionRequest>
    {
        public RegistrarOpinionRequestValidator()
        {
            RuleFor(x => x.utilizaria_siguiente_anio)
                .NotNull()
                .WithMessage("Debe indicar si utilizaría la aplicación el siguiente año lectivo.");

            RuleFor(x => x.aspecto_mas_util)
                .NotEmpty()
                .WithMessage("Indique qué le pareció más útil.")
                .MaximumLength(2000)
                .WithMessage("La respuesta sobre utilidad no puede superar 2000 caracteres.");

            RuleFor(x => x.aspectos_por_mejorar)
                .NotEmpty()
                .WithMessage("Indique qué podríamos mejorar.")
                .MaximumLength(2000)
                .WithMessage("La recomendación no puede superar 2000 caracteres.");
        }
    }
}
