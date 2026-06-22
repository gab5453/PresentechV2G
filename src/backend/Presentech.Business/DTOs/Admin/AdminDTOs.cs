namespace Presentech.Business.DTOs.Admin
{
    // ── Profesores ──────────────────────────────────────────────────────────────
    public class ProfesorAdminResponse
    {
        public int id_profesor { get; set; }
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
        public string correo_institucional { get; set; } = string.Empty;
        public string? telefono { get; set; }
        public string? especialidad { get; set; }
        public bool activo { get; set; }
    }

    public class CrearProfesorRequest
    {
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
        public string correo_institucional { get; set; } = string.Empty;
        public string contrasena { get; set; } = string.Empty;
        public string? telefono { get; set; }
        public string? especialidad { get; set; }
    }

    public class ActualizarProfesorRequest
    {
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
        public string correo_institucional { get; set; } = string.Empty;
        public string? nueva_contrasena { get; set; }
        public string? telefono { get; set; }
        public string? especialidad { get; set; }
    }

    // ── Paralelos ────────────────────────────────────────────────────────────────
    public class ParaleloAdminResponse
    {
        public int id_paralelo { get; set; }
        public string nombre { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public int capacidad_maxima { get; set; }
        public bool activo { get; set; }
    }

    public class CrearParaleloRequest
    {
        public string nombre { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public int capacidad_maxima { get; set; }
    }

    public class ActualizarParaleloRequest
    {
        public string nombre { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public int capacidad_maxima { get; set; }
    }

    // ── Clases ───────────────────────────────────────────────────────────────────
    public class ClaseAdminResponse
    {
        public int id_clase { get; set; }
        public int id_profesor { get; set; }
        public string nombre_profesor { get; set; } = string.Empty;
        public int id_paralelo { get; set; }
        public string nombre_paralelo { get; set; } = string.Empty;
        public int id_materia { get; set; }
        public string nombre_materia { get; set; } = string.Empty;
        public string? observaciones { get; set; }
        public List<HorarioAdminResponse> horarios { get; set; } = new();
    }

    public class CrearClaseRequest
    {
        public int id_profesor { get; set; }
        public int id_paralelo { get; set; }
        public int id_materia { get; set; }
        public string? observaciones { get; set; }
    }

    public class ActualizarClaseRequest
    {
        public int id_profesor { get; set; }
        public int id_paralelo { get; set; }
        public int id_materia { get; set; }
        public string? observaciones { get; set; }
    }

    // ── Horarios ─────────────────────────────────────────────────────────────────
    public class HorarioAdminResponse
    {
        public int id_horario { get; set; }
        public int id_dia { get; set; }
        public string nombre_dia { get; set; } = string.Empty;
        public string hora_inicio { get; set; } = string.Empty;
        public string hora_fin { get; set; } = string.Empty;
    }

    public class AgregarHorarioRequest
    {
        public int id_dia { get; set; }
        public string hora_inicio { get; set; } = string.Empty;
        public string hora_fin { get; set; } = string.Empty;
    }


    // -- Estudiantes --------------------------------------------------------------
    public class EstudianteAdminResponse
    {
        public int id_estudiante { get; set; }
        public string cedula { get; set; } = string.Empty;
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
        public bool activo { get; set; }
        public List<int> id_paralelos { get; set; } = new();
    }

    public class CrearEstudianteRequest
    {
        public string cedula { get; set; } = string.Empty;
        public string nombres { get; set; } = string.Empty;
        public string apellidos { get; set; } = string.Empty;
    }

    // -- Materias -----------------------------------------------------------------
    public class MateriaAdminResponse
    {
        public int id_materia { get; set; }
        public string nombre { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public bool activo { get; set; }
    }

    public class CrearMateriaRequest
    {
        public string nombre { get; set; } = string.Empty;
        public string? descripcion { get; set; }
    }

    public class ActualizarMateriaRequest
    {
        public string nombre { get; set; } = string.Empty;
        public string? descripcion { get; set; }
        public bool activo { get; set; }
    }
}
