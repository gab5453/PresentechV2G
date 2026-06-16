using Presentech.Business.DTOs.Ocr;

namespace Presentech.Business.Interfaces
{
    public interface IOcrService
    {
        Task<OcrEstudiantesResponse> ExtraerEstudiantesAsync(
            Stream imageStream,
            string contentType,
            string fileName,
            CancellationToken cancellationToken = default);
    }
}
