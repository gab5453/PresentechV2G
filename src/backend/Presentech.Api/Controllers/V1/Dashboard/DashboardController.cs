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
    }
}
