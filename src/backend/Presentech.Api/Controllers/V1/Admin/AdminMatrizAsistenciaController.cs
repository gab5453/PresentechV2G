using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentech.Api.Controllers.V1;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.MatrizAsistencia;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/matriz-asistencia")]
[Authorize(Roles = "admin")]
public class AdminMatrizAsistenciaController : AdminBaseController
{
    private readonly IMatrizAsistenciaService _matrizAsistenciaService;

    public AdminMatrizAsistenciaController(IMatrizAsistenciaService matrizAsistenciaService)
    {
        _matrizAsistenciaService = matrizAsistenciaService;
    }

    /// <summary>Genera la matriz anual simplificada de asistencia por paralelo.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<MatrizAsistenciaResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerMatriz(
        [FromQuery] int idParalelo,
        [FromQuery] int? anioInicio,
        CancellationToken cancellationToken)
    {
        var result = await _matrizAsistenciaService.GenerarAsync(
            idParalelo,
            anioInicio,
            cancellationToken);

        return Ok(ApiResponse<MatrizAsistenciaResponse>.Ok(
            result,
            "Matriz de asistencia generada exitosamente."));
    }

    /// <summary>Genera el reporte trimestral de asistencia por materia para un estudiante.</summary>
    [HttpGet("estudiantes/{idEstudiante:int}/reporte-trimestral")]
    [ProducesResponseType(typeof(ApiResponse<ReporteTrimestralEstudianteResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerReporteTrimestralEstudiante(
        [FromRoute] int idEstudiante,
        [FromQuery] int idParalelo,
        [FromQuery] int? anioInicio,
        CancellationToken cancellationToken)
    {
        var result = await _matrizAsistenciaService.GenerarReporteTrimestralEstudianteAsync(
            idParalelo,
            idEstudiante,
            anioInicio,
            cancellationToken);

        return Ok(ApiResponse<ReporteTrimestralEstudianteResponse>.Ok(
            result,
            "Reporte trimestral generado exitosamente."));
    }
}
