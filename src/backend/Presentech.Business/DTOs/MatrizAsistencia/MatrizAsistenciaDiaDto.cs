namespace Presentech.Business.DTOs.MatrizAsistencia
{
    public class MatrizAsistenciaDiaDto
    {
        public DateOnly fecha { get; set; }
        public int dia_mes { get; set; }
        public string inicial_dia { get; set; } = string.Empty;
        public string mes { get; set; } = string.Empty;
    }
}
