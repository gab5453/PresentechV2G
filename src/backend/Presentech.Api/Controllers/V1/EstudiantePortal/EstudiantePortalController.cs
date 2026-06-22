using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.EstudiantePortal;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.EstudiantePortal;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/estudiante-portal")]
[Authorize(Roles = "Estudiante")]
public class EstudiantePortalController : ControllerBase
{
    private readonly IEstudiantePortalService _portalService;

    public EstudiantePortalController(IEstudiantePortalService portalService)
    {
        _portalService = portalService;
    }

    private int GetEstudianteId()
    {
        var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("id_usuario")?.Value;
        if (int.TryParse(idClaim, out int id))
            return id;
        throw new UnauthorizedAccessException("Token inválido o sin identificación de estudiante.");
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ApiResponse<EstudianteDashboardResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var result = await _portalService.GetDashboardAsync(GetEstudianteId(), cancellationToken);
        return Ok(ApiResponse<EstudianteDashboardResponse>.Ok(result, "Dashboard cargado"));
    }

    [HttpGet("clases")]
    [ProducesResponseType(typeof(ApiResponse<List<EstudianteClaseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClases(CancellationToken cancellationToken)
    {
        var result = await _portalService.GetClasesAsync(GetEstudianteId(), cancellationToken);
        return Ok(ApiResponse<List<EstudianteClaseDto>>.Ok(result, "Clases cargadas"));
    }

    [HttpGet("clases/{idClase:int}/resumen")]
    [ProducesResponseType(typeof(ApiResponse<EstudianteClaseResumenResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResumenClase(int idClase, CancellationToken cancellationToken)
    {
        var result = await _portalService.GetResumenClaseAsync(GetEstudianteId(), idClase, cancellationToken);
        return Ok(ApiResponse<EstudianteClaseResumenResponse>.Ok(result, "Resumen de clase cargado"));
    }
}
