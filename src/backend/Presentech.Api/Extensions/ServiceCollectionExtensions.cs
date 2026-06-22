using Microsoft.EntityFrameworkCore;
using Presentech.Business.Interfaces;
using Presentech.Business.Models;
using Presentech.Business.Services;
using Presentech.DataAccess.Context;
using Presentech.DataAccess.Repositories;
using Presentech.DataAccess.Repositories.Interfaces;
using Presentech.DataManagement.Interfaces;
using Presentech.DataManagement.Services;

namespace Presentech.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // =========================
        // BASE DE DATOS
        // =========================
        services.AddDbContext<PresentechDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("PresentechDb"),
                sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorCodesToAdd: null);
                }));

        // =========================
        // UNIT OF WORK
        // =========================
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // =========================
        // DATA MANAGEMENT
        // =========================
        services.AddScoped<IProfesorDataService, ProfesorDataService>();
        services.AddScoped<IEstudianteDataService, EstudianteDataService>();
        services.AddScoped<IParaleloDataService, ParaleloDataService>();
        services.AddScoped<IClaseDataService, ClaseDataService>();
        services.AddScoped<IClaseHorarioDataService, ClaseHorarioDataService>();
        services.AddScoped<IAsistenciaDataService, AsistenciaDataService>();
        services.AddScoped<IAdministradorDataService, AdministradorDataService>();
        services.AddScoped<IMateriaDataService, MateriaDataService>();
        services.AddScoped<IActividadRepository, ActividadRepository>();
        services.AddScoped<ICalificacionRepository, CalificacionRepository>();
        services.AddScoped<IEstudianteRepository, EstudianteRepository>();
        services.AddScoped<ICalificacionService, CalificacionService>();
        services.AddScoped<IClaseRepository, ClaseRepository>();
        // =========================
        // JWT SETTINGS (para AuthService)
        // =========================
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new InvalidOperationException("No se encontró la configuración JwtSettings.");
        services.AddSingleton(jwtSettings);

        // =========================
        // AZURE OCR SETTINGS
        // =========================
        var azureOcrOptions = new AzureOcrOptions
        {
            Endpoint = configuration["AzureOcr:Endpoint"]
                ?? configuration["AZURE_OCR_ENDPOINT"]
                ?? string.Empty,
            Key = configuration["AzureOcr:Key"]
                ?? configuration["AZURE_OCR_KEY"]
                ?? string.Empty,
            Model = configuration["AzureOcr:Model"]
                ?? configuration["AZURE_OCR_MODEL"]
                ?? "prebuilt-read",
            ApiVersion = configuration["AzureOcr:ApiVersion"]
                ?? configuration["AZURE_OCR_API_VERSION"]
                ?? "2024-11-30",
        };
        services.AddSingleton(azureOcrOptions);

        // =========================
        // BUSINESS
        // =========================
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IClaseService, ClaseService>();
        services.AddScoped<IAsistenciaService, AsistenciaService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IEstudianteService, EstudianteService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IReporteService, ReporteService>();
        services.AddScoped<IOpinionService, OpinionService>();
        services.AddScoped<IMatrizAsistenciaService, MatrizAsistenciaService>();
        services.AddHttpClient<IOcrService, OcrService>();
        
        // Calificaciones
        services.AddScoped<Presentech.DataAccess.Repositories.Interfaces.IActividadRepository, Presentech.DataAccess.Repositories.ActividadRepository>();
        services.AddScoped<Presentech.DataAccess.Repositories.Interfaces.ICalificacionRepository, Presentech.DataAccess.Repositories.CalificacionRepository>();
        services.AddScoped<ICalificacionService, CalificacionService>();
        
        services.AddScoped<IEstudiantePortalService, EstudiantePortalService>();

        return services;
    }
}
