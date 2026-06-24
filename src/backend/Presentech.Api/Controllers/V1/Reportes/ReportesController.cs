using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.Reporte;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Reportes;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/reportes")]
[Authorize]
public class ReportesController : PresentechBaseController
{
    private readonly IReporteService _reporteService;

    public ReportesController(IReporteService reporteService)
    {
        _reporteService = reporteService;
    }

    [HttpGet("asistencia")]
    [ProducesResponseType(typeof(ApiResponse<ReporteAsistenciaResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerarAsistencia(
        [FromQuery] int idClase,
        [FromQuery] DateOnly fechaInicio,
        [FromQuery] DateOnly fechaFin,
        [FromQuery] int? idEstudiante,
        CancellationToken cancellationToken)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        int? idProfesor = role == "admin" ? null : IdProfesor;

        var result = await _reporteService.GenerarAsistenciaAsync(
            idClase,
            fechaInicio,
            fechaFin,
            idEstudiante,
            idProfesor,
            cancellationToken);

        return Ok(ApiResponse<ReporteAsistenciaResponse>.Ok(result, "Reporte generado exitosamente."));
    }

    [HttpGet("calificaciones")]
    [ProducesResponseType(typeof(ApiResponse<ReporteCalificacionesResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerarCalificaciones(
        [FromQuery] int idClase,
        [FromQuery] DateOnly fechaInicio,
        [FromQuery] DateOnly fechaFin,
        [FromQuery] int? idEstudiante,
        CancellationToken cancellationToken)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        int? idProfesor = role == "admin" ? null : IdProfesor;

        var result = await _reporteService.GenerarCalificacionesAsync(
            idClase,
            fechaInicio,
            fechaFin,
            idEstudiante,
            idProfesor,
            cancellationToken);

        return Ok(ApiResponse<ReporteCalificacionesResponse>.Ok(result, "Reporte de calificaciones generado exitosamente."));
    }
}
