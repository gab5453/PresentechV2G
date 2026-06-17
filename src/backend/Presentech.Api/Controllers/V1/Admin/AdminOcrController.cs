using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentech.Api.Controllers.V1;
using Presentech.Api.Models.Common;
using Presentech.Business.DTOs.Ocr;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;

namespace Presentech.Api.Controllers.V1.Admin;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/ocr")]
[Authorize(Roles = "admin")]
public class AdminOcrController : AdminBaseController
{
    private const long MaxFileSizeBytes = 8 * 1024 * 1024;
    private static readonly HashSet<string> AllowedContentTypes =
    [
        "image/jpeg",
        "image/png",
    ];

    private readonly IOcrService _ocrService;

    public AdminOcrController(IOcrService ocrService)
    {
        _ocrService = ocrService;
    }

    /// <summary>Extrae estudiantes desde una imagen de lista fisica usando OCR.</summary>
    [HttpPost("estudiantes")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<OcrEstudiantesResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExtraerEstudiantes(
        [FromForm] IFormFile file,
        CancellationToken cancellationToken)
    {
        ValidateFile(file);

        await using var stream = file.OpenReadStream();
        var result = await _ocrService.ExtraerEstudiantesAsync(
            stream,
            file.ContentType,
            file.FileName,
            cancellationToken);

        return Ok(ApiResponse<OcrEstudiantesResponse>.Ok(
            result,
            "Documento procesado exitosamente."));
    }

    private static void ValidateFile(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            throw new BusinessException("Debe enviar una imagen para procesar.");

        if (file.Length > MaxFileSizeBytes)
            throw new BusinessException("La imagen no puede superar 8 MB.");

        if (!AllowedContentTypes.Contains(file.ContentType))
            throw new BusinessException("Solo se permiten imagenes JPG o PNG.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is not ".jpg" and not ".jpeg" and not ".png")
            throw new BusinessException("La extension del archivo debe ser .jpg, .jpeg o .png.");
    }
}
