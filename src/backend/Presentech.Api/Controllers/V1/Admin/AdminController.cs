using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentech.Api.Controllers.V1;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.Admin;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin")]
[Authorize(Roles = "admin")]
public class AdminController : AdminBaseController
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PROFESORES
    // ══════════════════════════════════════════════════════════════════════════

    /// <summary>Lista todos los profesores (activos e inactivos).</summary>
    [HttpGet("profesores")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ProfesorAdminResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ObtenerProfesores(CancellationToken cancellationToken)
    {
        var result = await _adminService.ObtenerProfesoresAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ProfesorAdminResponse>>.Ok(result, "Consulta exitosa."));
    }

    /// <summary>Obtiene un profesor por ID.</summary>
    [HttpGet("profesores/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProfesorAdminResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerProfesor(int id, CancellationToken cancellationToken)
    {
        var result = await _adminService.ObtenerProfesorAsync(id, cancellationToken);
        return Ok(ApiResponse<ProfesorAdminResponse>.Ok(result, "Consulta exitosa."));
    }

    /// <summary>Crea un nuevo profesor.</summary>
    [HttpPost("profesores")]
    [ProducesResponseType(typeof(ApiResponse<ProfesorAdminResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CrearProfesor([FromBody] CrearProfesorRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.CrearProfesorAsync(request, cancellationToken);
        return Ok(ApiResponse<ProfesorAdminResponse>.Ok(result, "Profesor creado exitosamente."));
    }

    /// <summary>Actualiza un profesor existente.</summary>
    [HttpPut("profesores/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProfesorAdminResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActualizarProfesor(int id, [FromBody] ActualizarProfesorRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.ActualizarProfesorAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ProfesorAdminResponse>.Ok(result, "Profesor actualizado exitosamente."));
    }

    /// <summary>Desactiva (soft delete) un profesor.</summary>
    [HttpDelete("profesores/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EliminarProfesor(int id, CancellationToken cancellationToken)
    {
        await _adminService.EliminarProfesorAsync(id, cancellationToken);
        return Ok(ApiResponse<string>.Ok("OK", "Profesor desactivado exitosamente."));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PARALELOS
    // ══════════════════════════════════════════════════════════════════════════

    /// <summary>Lista todos los paralelos activos.</summary>
    [HttpGet("paralelos")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ParaleloAdminResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerParalelos(CancellationToken cancellationToken)
    {
        var result = await _adminService.ObtenerParalelosAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ParaleloAdminResponse>>.Ok(result, "Consulta exitosa."));
    }

    /// <summary>Crea un nuevo paralelo.</summary>
    [HttpPost("paralelos")]
    [ProducesResponseType(typeof(ApiResponse<ParaleloAdminResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CrearParalelo([FromBody] CrearParaleloRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.CrearParaleloAsync(request, cancellationToken);
        return Ok(ApiResponse<ParaleloAdminResponse>.Ok(result, "Paralelo creado exitosamente."));
    }

    /// <summary>Actualiza un paralelo existente.</summary>
    [HttpPut("paralelos/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ParaleloAdminResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActualizarParalelo(int id, [FromBody] ActualizarParaleloRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.ActualizarParaleloAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ParaleloAdminResponse>.Ok(result, "Paralelo actualizado exitosamente."));
    }

    /// <summary>Desactiva un paralelo.</summary>
    [HttpDelete("paralelos/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EliminarParalelo(int id, CancellationToken cancellationToken)
    {
        await _adminService.EliminarParaleloAsync(id, cancellationToken);
        return Ok(ApiResponse<string>.Ok("OK", "Paralelo desactivado exitosamente."));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CLASES
    // ══════════════════════════════════════════════════════════════════════════

    /// <summary>Lista todas las clases activas.</summary>
    [HttpGet("clases")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ClaseAdminResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerClases(CancellationToken cancellationToken)
    {
        var result = await _adminService.ObtenerClasesAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<ClaseAdminResponse>>.Ok(result, "Consulta exitosa."));
    }

    /// <summary>Crea una nueva clase (asigna profesor + paralelo + materia).</summary>
    [HttpPost("clases")]
    [ProducesResponseType(typeof(ApiResponse<ClaseAdminResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CrearClase([FromBody] CrearClaseRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.CrearClaseAsync(request, cancellationToken);
        return Ok(ApiResponse<ClaseAdminResponse>.Ok(result, "Clase creada exitosamente."));
    }

    /// <summary>Actualiza una clase existente.</summary>
    [HttpPut("clases/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ClaseAdminResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActualizarClase(int id, [FromBody] ActualizarClaseRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.ActualizarClaseAsync(id, request, cancellationToken);
        return Ok(ApiResponse<ClaseAdminResponse>.Ok(result, "Clase actualizada exitosamente."));
    }

    /// <summary>Desactiva una clase.</summary>
    [HttpDelete("clases/{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EliminarClase(int id, CancellationToken cancellationToken)
    {
        await _adminService.EliminarClaseAsync(id, cancellationToken);
        return Ok(ApiResponse<string>.Ok("OK", "Clase desactivada exitosamente."));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HORARIOS
    // ══════════════════════════════════════════════════════════════════════════

    /// <summary>Agrega una franja horaria a una clase.</summary>
    [HttpPost("clases/{id:int}/horarios")]
    [ProducesResponseType(typeof(ApiResponse<HorarioAdminResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AgregarHorario(int id, [FromBody] AgregarHorarioRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.AgregarHorarioAsync(id, request, cancellationToken);
        return Ok(ApiResponse<HorarioAdminResponse>.Ok(result, "Horario agregado exitosamente."));
    }

    /// <summary>Elimina una franja horaria de una clase.</summary>
    [HttpDelete("clases/{id:int}/horarios/{idHorario:int}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EliminarHorario(int id, int idHorario, CancellationToken cancellationToken)
    {
        await _adminService.EliminarHorarioAsync(id, idHorario, cancellationToken);
        return Ok(ApiResponse<string>.Ok("OK", "Horario eliminado exitosamente."));
    }
    // --------------------------------------------------------------------------
    // ESTUDIANTES
    // --------------------------------------------------------------------------

    [HttpGet("estudiantes")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EstudianteAdminResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerEstudiantes(CancellationToken cancellationToken)
    {
        var result = await _adminService.ObtenerEstudiantesAsync(cancellationToken);
        return Ok(ApiResponse<IReadOnlyList<EstudianteAdminResponse>>.Ok(result, "Consulta exitosa."));
    }

    [HttpPost("estudiantes")]
    [ProducesResponseType(typeof(ApiResponse<EstudianteAdminResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CrearEstudiante([FromBody] CrearEstudianteRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminService.CrearEstudianteAsync(request, cancellationToken);
        return Ok(ApiResponse<EstudianteAdminResponse>.Ok(result, "Estudiante creado exitosamente."));
    }

    [HttpPost("estudiantes/{id:int}/paralelos/{idParalelo:int}")]
    [ProducesResponseType(typeof(ApiResponse<EstudianteAdminResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AsignarParalelo(int id, int idParalelo, CancellationToken cancellationToken)
    {
        var result = await _adminService.AsignarParaleloAsync(id, idParalelo, cancellationToken);
        return Ok(ApiResponse<EstudianteAdminResponse>.Ok(result, "Estudiante asignado al paralelo exitosamente."));
    }
}
