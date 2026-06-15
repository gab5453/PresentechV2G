using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.Opinion;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Opiniones;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/opiniones")]
[Authorize]
public class OpinionesController : PresentechBaseController
{
    private readonly IOpinionService _opinionService;

    public OpinionesController(IOpinionService opinionService)
    {
        _opinionService = opinionService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<RegistrarOpinionResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Registrar(
        [FromBody] RegistrarOpinionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _opinionService.RegistrarAsync(
            request,
            IdProfesor,
            cancellationToken);

        return StatusCode(
            StatusCodes.Status201Created,
            ApiResponse<RegistrarOpinionResponse>.Ok(
                result,
                "Opinión registrada exitosamente."));
    }
}
