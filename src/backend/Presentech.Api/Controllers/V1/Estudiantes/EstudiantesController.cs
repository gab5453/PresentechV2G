using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentech.Api.Controllers.V1;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.Estudiante;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Estudiantes;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/estudiantes")]
[Authorize(Roles = "admin")]
public class EstudiantesController : PresentechBaseController
{
    private readonly IEstudianteService _estudianteService;

    public EstudiantesController(IEstudianteService estudianteService)
    {
        _estudianteService = estudianteService;
    }

    /// <summary>Importa el listado de estudiantes de un paralelo desde datos procesados del Excel.</summary>
    [HttpPost("importar/{idParalelo:int}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Importar(
        int idParalelo,
        [FromBody] ImportarEstudiantesRequest request,
        CancellationToken cancellationToken)
    {
        await _estudianteService.ImportarAsync(idParalelo, request, cancellationToken);
        return Ok(ApiResponse<string>.Ok("OK", $"Estudiantes importados exitosamente en el paralelo {idParalelo}."));
    }
}
