using System.Linq;
using Presentech.DataAccess.Entities;
using Presentech.DataManagement.Models;

namespace Presentech.DataManagement.Mappers
{
    public static class EstudianteDataMapper
    {
        // =========================
        // ENTITY → DATA MODEL
        // =========================
        public static EstudianteDataModel ToDataModel(EstudianteEntity entity)
        {
            return new EstudianteDataModel
            {
                id_estudiante = entity.id_estudiante,
                Cedula        = entity.Cedula,
                nombres       = entity.nombres,
                apellidos     = entity.apellidos,
                activo        = entity.activo,
                created_at    = entity.created_at,
                IdParalelos   = entity.ParaleloEstudiantes?.Where(p => p.activo).Select(p => p.id_paralelo).ToList() ?? new List<int>()
            };
        }

        // =========================
        // DATA MODEL → ENTITY
        // =========================
        public static EstudianteEntity ToEntity(EstudianteDataModel model)
        {
            return new EstudianteEntity
            {
                id_estudiante = model.id_estudiante,
                Cedula        = model.Cedula,
                nombres       = model.nombres,
                apellidos     = model.apellidos,
                activo        = model.activo,
                created_at    = model.created_at,
            };
        }
    }
}
