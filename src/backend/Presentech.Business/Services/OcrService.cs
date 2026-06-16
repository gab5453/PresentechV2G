using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using Presentech.Business.DTOs.Ocr;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.Business.Models;

namespace Presentech.Business.Services
{
    public partial class OcrService : IOcrService
    {
        private static readonly string[] IgnoredLinePrefixes =
        [
            "NO",
            "NRO",
            "APELLIDOS",
            "NOMBRES",
            "ASIGNATURA",
            "CURSO",
            "MATUTINA",
        ];

        private readonly HttpClient _httpClient;
        private readonly AzureOcrOptions _options;

        public OcrService(HttpClient httpClient, AzureOcrOptions options)
        {
            _httpClient = httpClient;
            _options = options;
        }

        public async Task<OcrEstudiantesResponse> ExtraerEstudiantesAsync(
            Stream imageStream,
            string contentType,
            string fileName,
            CancellationToken cancellationToken = default)
        {
            _ = fileName;

            if (!_options.IsConfigured)
            {
                throw new BusinessException(
                    "OCR no configurado. Configure AZURE_OCR_ENDPOINT y AZURE_OCR_KEY antes de procesar documentos.");
            }

            if (imageStream.CanSeek)
                imageStream.Position = 0;

            var text = await AnalyzeImageAsync(imageStream, contentType, cancellationToken);
            var (students, warnings) = ParseStudents(text);

            if (students.Count == 0)
            {
                warnings.Add(
                    "No se detectaron estudiantes con el formato esperado. Verifique que la foto incluya columnas de apellidos y nombres.");
            }

            return new OcrEstudiantesResponse
            {
                estudiantes = students,
                texto_detectado = text,
                advertencias = warnings,
            };
        }

        private async Task<string> AnalyzeImageAsync(
            Stream imageStream,
            string contentType,
            CancellationToken cancellationToken)
        {
            var endpoint = _options.Endpoint.TrimEnd('/');
            var model = string.IsNullOrWhiteSpace(_options.Model) ? "prebuilt-read" : _options.Model;
            var apiVersion = string.IsNullOrWhiteSpace(_options.ApiVersion)
                ? "2024-11-30"
                : _options.ApiVersion;
            var analyzeUrl =
                $"{endpoint}/documentintelligence/documentModels/{model}:analyze?api-version={apiVersion}";

            using var request = new HttpRequestMessage(HttpMethod.Post, analyzeUrl);
            request.Headers.Add("Ocp-Apim-Subscription-Key", _options.Key);
            request.Content = new StreamContent(imageStream);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new BusinessException($"Azure OCR rechazo la imagen: {(int)response.StatusCode} {error}");
            }

            if (!response.Headers.TryGetValues("Operation-Location", out var values))
            {
                throw new BusinessException("Azure OCR no devolvio la ubicacion de la operacion.");
            }

            var operationUrl = values.First();
            var attempts = Math.Max(_options.MaxPollingAttempts, 1);
            var delayMs = Math.Max(_options.PollingDelayMilliseconds, 250);

            for (var attempt = 0; attempt < attempts; attempt++)
            {
                await Task.Delay(delayMs, cancellationToken);

                using var pollRequest = new HttpRequestMessage(HttpMethod.Get, operationUrl);
                pollRequest.Headers.Add("Ocp-Apim-Subscription-Key", _options.Key);

                using var pollResponse = await _httpClient.SendAsync(pollRequest, cancellationToken);
                var json = await pollResponse.Content.ReadAsStringAsync(cancellationToken);

                if (!pollResponse.IsSuccessStatusCode)
                    throw new BusinessException($"No se pudo consultar el resultado OCR: {json}");

                using var document = JsonDocument.Parse(json);
                var root = document.RootElement;
                var status = root.TryGetProperty("status", out var statusElement)
                    ? statusElement.GetString()
                    : null;

                if (string.Equals(status, "succeeded", StringComparison.OrdinalIgnoreCase))
                {
                    return ExtractText(root);
                }

                if (string.Equals(status, "failed", StringComparison.OrdinalIgnoreCase))
                {
                    throw new BusinessException($"Azure OCR no pudo procesar la imagen: {json}");
                }
            }

            throw new BusinessException("Azure OCR tardo demasiado en devolver resultados.");
        }

        private static string ExtractText(JsonElement root)
        {
            if (root.TryGetProperty("analyzeResult", out var analyzeResult))
            {
                if (analyzeResult.TryGetProperty("content", out var content))
                    return content.GetString() ?? string.Empty;

                if (analyzeResult.TryGetProperty("pages", out var pages))
                {
                    var lines = new List<string>();
                    foreach (var page in pages.EnumerateArray())
                    {
                        if (!page.TryGetProperty("lines", out var pageLines))
                            continue;

                        foreach (var line in pageLines.EnumerateArray())
                        {
                            if (line.TryGetProperty("content", out var lineContent))
                                lines.Add(lineContent.GetString() ?? string.Empty);
                        }
                    }

                    return string.Join(Environment.NewLine, lines);
                }
            }

            return string.Empty;
        }

        private static (List<EstudianteOcrDto> Students, List<string> Warnings) ParseStudents(string text)
        {
            var students = new List<EstudianteOcrDto>();
            var warnings = new List<string>();
            var lines = text
                .Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(NormalizeLine)
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .ToList();

            foreach (var line in lines)
            {
                if (ShouldIgnore(line))
                    continue;

                var match = StudentLineRegex().Match(line);
                if (!match.Success)
                    continue;

                var studentText = match.Groups["student"].Value.Trim();
                var tokens = studentText
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Where(token => token.Length > 1)
                    .ToList();

                if (tokens.Count < 3)
                {
                    warnings.Add($"Fila omitida por datos insuficientes: {line}");
                    continue;
                }

                var apellidos = string.Join(' ', tokens.Take(2));
                var nombres = string.Join(' ', tokens.Skip(2));

                students.Add(new EstudianteOcrDto
                {
                    apellidos = apellidos,
                    nombres = nombres,
                    confianza = 0.75m,
                    observacion = "Detectado automaticamente. Revise antes de importar.",
                });
            }

            return (students, warnings);
        }

        private static string NormalizeLine(string line)
        {
            var clean = line
                .Replace("|", " ")
                .Replace("_", " ")
                .Trim()
                .ToUpperInvariant();

            clean = MultipleSpacesRegex().Replace(clean, " ");
            return clean;
        }

        private static bool ShouldIgnore(string line)
        {
            return IgnoredLinePrefixes.Any(prefix =>
                line.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        [GeneratedRegex(@"^\s*(?<number>\d{1,2})[\.\)\-\s]+(?<student>[\p{L}\s]+)$")]
        private static partial Regex StudentLineRegex();

        [GeneratedRegex(@"\s+")]
        private static partial Regex MultipleSpacesRegex();
    }
}
