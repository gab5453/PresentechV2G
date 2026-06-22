using Presentech.Business.DTOs.Calificaciones;
using Presentech.DataAccess.Entities;

namespace Presentech.Business.Interfaces
{
    public interface ICalificacionService
    {
        Task<ActividadDto> CrearActividadAsync(CrearActividadRequest request);
        Task<ActividadDto> EditarActividadAsync(int actividadId, CrearActividadRequest request);
        Task EliminarActividadAsync(int actividadId);
        Task<RegistrarNotaRequest> RegistrarNotaAsync(RegistrarNotaRequest request);
        Task<MatrizCalificacionesResponse> GetMatrizCalificacionesAsync(int claseId);
    }
}
