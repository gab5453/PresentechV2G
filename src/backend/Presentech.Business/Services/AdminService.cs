using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Presentech.Business.DTOs.Admin;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.Business.Mappers;
using Presentech.Business.Models;
using Presentech.DataManagement.Interfaces;
using Presentech.DataManagement.Models;

namespace Presentech.Business.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAdministradorDataService _administradorDataService;
        private readonly IProfesorDataService      _profesorDataService;
        private readonly IParaleloDataService      _paraleloDataService;
        private readonly IClaseDataService         _claseDataService;
        private readonly IClaseHorarioDataService  _claseHorarioDataService;
        private readonly IMateriaDataService       _materiaDataService;
        private readonly IEstudianteDataService    _estudianteDataService;
        private readonly IEstudianteService        _estudianteService;
        private readonly JwtSettings               _jwtSettings;

        public AdminService(
            IAdministradorDataService administradorDataService,
            IProfesorDataService      profesorDataService,
            IParaleloDataService      paraleloDataService,
            IClaseDataService         claseDataService,
            IClaseHorarioDataService  claseHorarioDataService,
            IMateriaDataService       materiaDataService,
            IEstudianteDataService    estudianteDataService,
            IEstudianteService        estudianteService,
            JwtSettings               jwtSettings)
        {
            _administradorDataService = administradorDataService;
            _profesorDataService      = profesorDataService;
            _paraleloDataService      = paraleloDataService;
            _claseDataService         = claseDataService;
            _claseHorarioDataService  = claseHorarioDataService;
            _materiaDataService       = materiaDataService;
            _estudianteDataService    = estudianteDataService;
            _estudianteService        = estudianteService;
            _jwtSettings              = jwtSettings;
        }

        // =========================
        // AUTH
        // =========================
        public async Task<LoginAdminResponse> LoginAsync(LoginAdminRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.correo_institucional) || string.IsNullOrWhiteSpace(request.contrasena))
                throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("credenciales", "Correo y contraseña son requeridos.") });

            var admin = await _administradorDataService.ObtenerPorCorreoAsync(request.correo_institucional, cancellationToken);

            if (admin is null || !admin.activo || !BCrypt.Net.BCrypt.Verify(request.contrasena, admin.contrasena_hash))
                throw new UnauthorizedBusinessException("Correo o contraseña incorrectos.");

            return new LoginAdminResponse
            {
                token                = GenerarToken(admin.id_admin, admin.correo_institucional),
                id_admin             = admin.id_admin,
                nombres              = admin.nombres,
                apellidos            = admin.apellidos,
                correo_institucional = admin.correo_institucional,
                rol                  = "admin",
            };
        }

        public async Task<RegisterAdminResponse> RegisterAdminAsync(RegisterAdminRequest request, CancellationToken cancellationToken = default)
        {
            var existe = await _administradorDataService.ObtenerPorCorreoAsync(request.correo_institucional, cancellationToken);
            if (existe is null == false) throw new ConflictException($"Ya existe un administrador con el correo '{request.correo_institucional}'.");

            var model = new AdministradorDataModel
            {
                nombres              = request.nombres,
                apellidos            = request.apellidos,
                correo_institucional = request.correo_institucional,
                contrasena_hash      = BCrypt.Net.BCrypt.HashPassword(request.contrasena, 11),
                activo               = true,
            };

            var created = await _administradorDataService.AgregarAsync(model, cancellationToken);
            
            return new RegisterAdminResponse(
                created.id_admin,
                created.nombres,
                created.apellidos,
                created.correo_institucional
            );
        }

        // =========================
        // PROFESORES
        // =========================
        public async Task<IReadOnlyList<ProfesorAdminResponse>> ObtenerProfesoresAsync(CancellationToken cancellationToken = default)
        {
            var profesores = await _profesorDataService.ObtenerTodosAsync(cancellationToken);
            return profesores.Select(AdminBusinessMapper.ToProfesorResponse).ToList();
        }

        public async Task<ProfesorAdminResponse> ObtenerProfesorAsync(int id_profesor, CancellationToken cancellationToken = default)
        {
            var profesor = await _profesorDataService.ObtenerPorIdAsync(id_profesor, cancellationToken)
                ?? throw new NotFoundException("Profesor", id_profesor);
            return AdminBusinessMapper.ToProfesorResponse(profesor);
        }

        public async Task<ProfesorAdminResponse> CrearProfesorAsync(CrearProfesorRequest request, CancellationToken cancellationToken = default)
        {
            var existe = await _profesorDataService.ExistePorCorreoAsync(request.correo_institucional, cancellationToken);
            if (existe) throw new ConflictException($"Ya existe un profesor con el correo '{request.correo_institucional}'.");

            var model = new ProfesorDataModel
            {
                nombres              = request.nombres,
                apellidos            = request.apellidos,
                correo_institucional = request.correo_institucional,
                contrasena_hash      = BCrypt.Net.BCrypt.HashPassword(request.contrasena, 11),
                telefono             = request.telefono,
                especialidad         = request.especialidad,
                activo               = true,
            };

            var created = await _profesorDataService.CrearAsync(model, cancellationToken);
            return AdminBusinessMapper.ToProfesorResponse(created);
        }

        public async Task<ProfesorAdminResponse> ActualizarProfesorAsync(int id_profesor, ActualizarProfesorRequest request, CancellationToken cancellationToken = default)
        {
            var existing = await _profesorDataService.ObtenerPorIdAsync(id_profesor, cancellationToken)
                ?? throw new NotFoundException("Profesor", id_profesor);

            var model = new ProfesorDataModel
            {
                id_profesor          = id_profesor,
                nombres              = request.nombres,
                apellidos            = request.apellidos,
                correo_institucional = request.correo_institucional,
                telefono             = request.telefono,
                especialidad         = request.especialidad,
                // Solo hashear si se envía nueva contraseña
                contrasena_hash      = !string.IsNullOrWhiteSpace(request.nueva_contrasena)
                    ? BCrypt.Net.BCrypt.HashPassword(request.nueva_contrasena, 11)
                    : string.Empty,
                activo               = true,
            };

            var updated = await _profesorDataService.ActualizarAsync(model, cancellationToken);
            return AdminBusinessMapper.ToProfesorResponse(updated);
        }

        public async Task EliminarProfesorAsync(int id_profesor, CancellationToken cancellationToken = default)
        {
            _ = await _profesorDataService.ObtenerPorIdAsync(id_profesor, cancellationToken)
                ?? throw new NotFoundException("Profesor", id_profesor);
            await _profesorDataService.EliminarAsync(id_profesor, cancellationToken);
        }

        // =========================
        // PARALELOS
        // =========================
        public async Task<IReadOnlyList<ParaleloAdminResponse>> ObtenerParalelosAsync(CancellationToken cancellationToken = default)
        {
            var paralelos = await _paraleloDataService.ObtenerTodosActivosAsync(cancellationToken);
            return paralelos.Select(AdminBusinessMapper.ToParaleloResponse).ToList();
        }

        public async Task<ParaleloAdminResponse> CrearParaleloAsync(CrearParaleloRequest request, CancellationToken cancellationToken = default)
        {
            var model = new ParaleloDataModel
            {
                nombre           = request.nombre,
                descripcion      = request.descripcion,
                capacidad_maxima = request.capacidad_maxima,
            };
            var created = await _paraleloDataService.CrearAsync(model, cancellationToken);
            return AdminBusinessMapper.ToParaleloResponse(created);
        }

        public async Task<ParaleloAdminResponse> ActualizarParaleloAsync(int id_paralelo, ActualizarParaleloRequest request, CancellationToken cancellationToken = default)
        {
            _ = await _paraleloDataService.ObtenerPorIdAsync(id_paralelo, cancellationToken)
                ?? throw new NotFoundException("Paralelo", id_paralelo);

            var model = new ParaleloDataModel
            {
                id_paralelo      = id_paralelo,
                nombre           = request.nombre,
                descripcion      = request.descripcion,
                capacidad_maxima = request.capacidad_maxima,
            };
            var updated = await _paraleloDataService.ActualizarAsync(model, cancellationToken);
            return AdminBusinessMapper.ToParaleloResponse(updated);
        }

        public async Task EliminarParaleloAsync(int id_paralelo, CancellationToken cancellationToken = default)
        {
            _ = await _paraleloDataService.ObtenerPorIdAsync(id_paralelo, cancellationToken)
                ?? throw new NotFoundException("Paralelo", id_paralelo);
            await _paraleloDataService.EliminarAsync(id_paralelo, cancellationToken);
        }

        // =========================
        // CLASES
        // =========================
        public async Task<IReadOnlyList<ClaseAdminResponse>> ObtenerClasesAsync(CancellationToken cancellationToken = default)
        {
            var clases = await _claseDataService.ObtenerTodasAsync(cancellationToken);
            var profesores = await _profesorDataService.ObtenerTodosAsync(cancellationToken);
            var profesorMap = profesores.ToDictionary(p => p.id_profesor, p => $"{p.nombres} {p.apellidos}");

            return clases.Select(c => AdminBusinessMapper.ToClaseResponse(
                c,
                profesorMap.TryGetValue(c.id_profesor, out var nombre) ? nombre : "—"
            )).ToList();
        }

        public async Task<ClaseAdminResponse> CrearClaseAsync(CrearClaseRequest request, CancellationToken cancellationToken = default)
        {
            var model = new ClaseDataModel
            {
                id_profesor = request.id_profesor,
                id_paralelo = request.id_paralelo,
                id_materia  = request.id_materia,
                observaciones = request.observaciones,
            };
            var created = await _claseDataService.CrearAsync(model, cancellationToken);
            var profesor = await _profesorDataService.ObtenerPorIdAsync(request.id_profesor, cancellationToken);
            return AdminBusinessMapper.ToClaseResponse(created, profesor is not null ? $"{profesor.nombres} {profesor.apellidos}" : "—");
        }

        public async Task<ClaseAdminResponse> ActualizarClaseAsync(int id_clase, ActualizarClaseRequest request, CancellationToken cancellationToken = default)
        {
            _ = await _claseDataService.ObtenerPorIdAsync(id_clase, cancellationToken)
                ?? throw new NotFoundException("Clase", id_clase);

            var model = new ClaseDataModel
            {
                id_clase      = id_clase,
                id_profesor   = request.id_profesor,
                id_paralelo   = request.id_paralelo,
                id_materia    = request.id_materia,
                observaciones = request.observaciones,
            };
            var updated = await _claseDataService.ActualizarAsync(model, cancellationToken);
            var profesor = await _profesorDataService.ObtenerPorIdAsync(request.id_profesor, cancellationToken);
            return AdminBusinessMapper.ToClaseResponse(updated, profesor is not null ? $"{profesor.nombres} {profesor.apellidos}" : "—");
        }

        public async Task EliminarClaseAsync(int id_clase, CancellationToken cancellationToken = default)
        {
            _ = await _claseDataService.ObtenerPorIdAsync(id_clase, cancellationToken)
                ?? throw new NotFoundException("Clase", id_clase);
            await _claseDataService.EliminarAsync(id_clase, cancellationToken);
        }

        // =========================
        // HORARIOS
        // =========================
        public async Task<HorarioAdminResponse> AgregarHorarioAsync(int id_clase, AgregarHorarioRequest request, CancellationToken cancellationToken = default)
        {
            _ = await _claseDataService.ObtenerPorIdAsync(id_clase, cancellationToken)
                ?? throw new NotFoundException("Clase", id_clase);

            var model = new ClaseHorarioDataModel
            {
                id_clase    = id_clase,
                id_dia      = request.id_dia,
                hora_inicio = TimeOnly.Parse(request.hora_inicio),
                hora_fin    = TimeOnly.Parse(request.hora_fin),
            };

            var created = await _claseHorarioDataService.AgregarAsync(model, cancellationToken);

            return new HorarioAdminResponse
            {
                id_horario  = created.id_horario,
                id_dia      = created.id_dia,
                nombre_dia  = created.nombre_dia,
                hora_inicio = created.hora_inicio.ToString(@"HH\:mm"),
                hora_fin    = created.hora_fin.ToString(@"HH\:mm"),
            };
        }

        public async Task EliminarHorarioAsync(int id_clase, int id_horario, CancellationToken cancellationToken = default)
        {
            var horario = await _claseHorarioDataService.ObtenerPorIdAsync(id_horario, cancellationToken)
                ?? throw new NotFoundException("Horario", id_horario);

            if (horario.id_clase != id_clase)
                throw new UnauthorizedBusinessException("El horario no pertenece a la clase indicada.");

            await _claseHorarioDataService.EliminarAsync(id_horario, cancellationToken);
        }

        // =========================
        // ESTUDIANTES
        // =========================
        public async Task<IReadOnlyList<EstudianteAdminResponse>> ObtenerEstudiantesAsync(CancellationToken cancellationToken = default)
        {
            var estudiantes = await _estudianteDataService.ObtenerTodosAsync(cancellationToken);
            return estudiantes.Select(e => new EstudianteAdminResponse
            {
                id_estudiante = e.id_estudiante,
                cedula        = e.Cedula,
                nombres       = e.nombres,
                apellidos     = e.apellidos,
                activo        = e.activo,
                id_paralelos  = e.IdParalelos,
            }).ToList();
        }

        public async Task<EstudianteAdminResponse> CrearEstudianteAsync(CrearEstudianteRequest request, CancellationToken cancellationToken = default)
        {
            var model = new EstudianteDataModel
            {
                Cedula    = request.cedula,
                nombres   = request.nombres,
                apellidos = request.apellidos,
                activo    = true,
            };
            var created = await _estudianteDataService.CrearAsync(model, cancellationToken);
            return new EstudianteAdminResponse
            {
                id_estudiante = created.id_estudiante,
                cedula        = created.Cedula,
                nombres       = created.nombres,
                apellidos     = created.apellidos,
                activo        = created.activo,
            };
        }

        public async Task<EstudianteAdminResponse> AsignarParaleloAsync(int id_estudiante, int id_paralelo, CancellationToken cancellationToken = default)
        {
            _ = await _estudianteDataService.ObtenerPorIdAsync(id_estudiante, cancellationToken)
                ?? throw new NotFoundException("Estudiante", id_estudiante);
            _ = await _paraleloDataService.ObtenerPorIdAsync(id_paralelo, cancellationToken)
                ?? throw new NotFoundException("Paralelo", id_paralelo);
                
            await _estudianteDataService.MatricularAsync(id_estudiante, id_paralelo, cancellationToken);
            
            var estudiante = await _estudianteDataService.ObtenerPorIdAsync(id_estudiante, cancellationToken);
            return new EstudianteAdminResponse
            {
                id_estudiante = estudiante!.id_estudiante,
                cedula        = estudiante.Cedula,
                nombres       = estudiante.nombres,
                apellidos     = estudiante.apellidos,
                activo        = estudiante.activo,
            };
        }

        public async Task DesasignarParaleloAsync(int id_estudiante, int id_paralelo, CancellationToken cancellationToken = default)
        {
            _ = await _estudianteDataService.ObtenerPorIdAsync(id_estudiante, cancellationToken)
                ?? throw new NotFoundException("Estudiante", id_estudiante);
            _ = await _paraleloDataService.ObtenerPorIdAsync(id_paralelo, cancellationToken)
                ?? throw new NotFoundException("Paralelo", id_paralelo);

            await _estudianteDataService.DesmatricularAsync(id_estudiante, id_paralelo, cancellationToken);
        }

        public async Task ImportarEstudiantesExcelAsync(int id_paralelo, Presentech.Business.DTOs.Estudiante.ImportarEstudiantesRequest request, CancellationToken cancellationToken = default)
        {
            await _estudianteService.ImportarAsync(id_paralelo, request, cancellationToken);
        }

        // =========================
        // MATERIAS
        // =========================
        public async Task<IReadOnlyList<MateriaAdminResponse>> ObtenerMateriasAsync(CancellationToken cancellationToken = default)
        {
            var materias = await _materiaDataService.ObtenerTodasLasMateriasAsync();
            return materias.Select(AdminBusinessMapper.ToMateriaResponse).ToList();
        }

        public async Task<MateriaAdminResponse> CrearMateriaAsync(CrearMateriaRequest request, CancellationToken cancellationToken = default)
        {
            var model = new MateriaDataModel
            {
                Nombre      = request.nombre,
                Descripcion = request.descripcion,
                Activo      = true,
            };
            var created = await _materiaDataService.CrearMateriaAsync(model);
            return AdminBusinessMapper.ToMateriaResponse(created);
        }

        public async Task<MateriaAdminResponse> ActualizarMateriaAsync(int id_materia, ActualizarMateriaRequest request, CancellationToken cancellationToken = default)
        {
            var model = new MateriaDataModel
            {
                IdMateria   = id_materia,
                Nombre      = request.nombre,
                Descripcion = request.descripcion,
                Activo      = request.activo,
            };
            var updated = await _materiaDataService.ActualizarMateriaAsync(id_materia, model);
            return AdminBusinessMapper.ToMateriaResponse(updated);
        }

        public async Task EliminarMateriaAsync(int id_materia, CancellationToken cancellationToken = default)
        {
            await _materiaDataService.EliminarMateriaAsync(id_materia);
        }

        // =========================
        // JWT (admin)
        // =========================
        private string GenerarToken(int id_admin, string correo)
        {
            var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, id_admin.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, correo),
                new Claim("id_admin", id_admin.ToString()),
                new Claim(ClaimTypes.Role, "admin"),
            };

            var token = new JwtSecurityToken(
                issuer:             _jwtSettings.Issuer,
                audience:           _jwtSettings.Audience,
                claims:             claims,
                expires:            DateTime.UtcNow.AddHours(_jwtSettings.ExpirationHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
