using Microsoft.AspNetCore.Mvc;
using Presentech.Business.DTOs.Calificaciones;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalificacionesController : ControllerBase
    {
        private readonly ICalificacionService _calificacionService;

        public CalificacionesController(ICalificacionService calificacionService)
        {
            _calificacionService = calificacionService;
        }

        [HttpGet("clase/{claseId}")]
        public async Task<IActionResult> GetMatrizCalificaciones(int claseId)
        {
            var matriz = await _calificacionService.GetMatrizCalificacionesAsync(claseId);
            return Ok(matriz);
        }

        [HttpPost("actividad")]
        public async Task<IActionResult> CrearActividad([FromBody] CrearActividadRequest request)
        {
            var actividad = await _calificacionService.CrearActividadAsync(request);
            return Ok(actividad);
        }

        [HttpPut("nota")]
        public async Task<IActionResult> RegistrarNota([FromBody] RegistrarNotaRequest request)
        {
            var nota = await _calificacionService.RegistrarNotaAsync(request);
            return Ok(nota);
        }
    }
}
