using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Dashboard
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            int? idProfesor = null;

            if (role != "admin")
            {
                if (int.TryParse(User.FindFirstValue("id_profesor"), out var id) && id > 0)
                {
                    idProfesor = id;
                }
                else
                {
                    return Unauthorized("Token inválido para profesor.");
                }
            }

            var stats = await _dashboardService.GetDashboardStatsAsync(idProfesor, cancellationToken);
            return Ok(Presentech.Api.Models.Common.ApiResponse<Presentech.Business.DTOs.Dashboard.DashboardResponse>.Ok(stats, "Dashboard recuperado exitosamente."));
        }

        [HttpGet("asistencias-registradas")]
        public async Task<IActionResult> GetAsistenciasRegistradas(
            [FromQuery] DateOnly fecha,
            [FromQuery] int? idProfesor,
            CancellationToken cancellationToken)
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            int? profesorFiltro = idProfesor;

            if (role != "admin")
            {
                if (int.TryParse(User.FindFirstValue("id_profesor"), out var id) && id > 0)
                {
                    profesorFiltro = id;
                }
                else
                {
                    return Unauthorized("Token invÃ¡lido para profesor.");
                }
            }

            var asistencias = await _dashboardService.ObtenerAsistenciasRegistradasAsync(
                fecha,
                profesorFiltro,
                cancellationToken);

            return Ok(Presentech.Api.Models.Common.ApiResponse<IReadOnlyList<Presentech.Business.DTOs.Dashboard.AsistenciaRegistradaResponse>>.Ok(
                asistencias,
                "Asistencias registradas recuperadas exitosamente."));
        }
    }
}
