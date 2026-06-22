using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.Auth;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Auth;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>Autenticación del profesor con correo institucional y contraseña.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(ApiResponse<LoginResponse>.Ok(result, "Autenticación exitosa."));
    }

    /// <summary>Autenticación del estudiante con cédula.</summary>
    [HttpPost("estudiante/login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LoginEstudiante(
        [FromBody] LoginStudentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginEstudianteAsync(request, cancellationToken);
        return Ok(ApiResponse<LoginResponse>.Ok(result, "Autenticación exitosa como estudiante."));
    }
}
