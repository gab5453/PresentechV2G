namespace Presentech.Business.DTOs.MatrizAsistencia
{
    public class MatrizAsistenciaResponse
    {
        public int id_paralelo { get; set; }
        public string paralelo { get; set; } = string.Empty;
        public string anio_lectivo { get; set; } = string.Empty;
        public DateOnly fecha_inicio { get; set; }
        public DateOnly fecha_fin { get; set; }
        public IReadOnlyList<MatrizAsistenciaDiaDto> dias { get; set; } = [];
        public IReadOnlyList<MatrizAsistenciaEstudianteDto> estudiantes { get; set; } = [];
    }
}
