using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Presentech.Business.DTOs.Auth;
using Presentech.Business.Exceptions;
using Presentech.Business.Interfaces;
using Presentech.Business.Models;
using Presentech.Business.Validators;
using Presentech.DataManagement.Interfaces;
using Presentech.DataAccess.Repositories.Interfaces;

namespace Presentech.Business.Services
{
    public class AuthService : IAuthService
    {
        private readonly IProfesorDataService _profesorDataService;
        private readonly IEstudianteDataService _estudianteDataService;
        private readonly JwtSettings _jwtSettings;
        private readonly LoginRequestValidator _validator;

        public AuthService(IProfesorDataService profesorDataService, IEstudianteDataService estudianteDataService, JwtSettings jwtSettings)
        {
            _profesorDataService = profesorDataService;
            _estudianteDataService = estudianteDataService;
            _jwtSettings         = jwtSettings;
            _validator           = new LoginRequestValidator();
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var result = await _validator.ValidateAsync(request, cancellationToken);
            if (!result.IsValid)
                throw new ValidationException(result.Errors);

            var profesor = await _profesorDataService.ObtenerPorCorreoAsync(request.correo_institucional, cancellationToken);

            if (profesor is null || !profesor.activo || !BCrypt.Net.BCrypt.Verify(request.contrasena, profesor.contrasena_hash))
                throw new UnauthorizedBusinessException("Correo o contraseña incorrectos.");

            return new LoginResponse
            {
                token                = GenerarToken(profesor.id_profesor, profesor.correo_institucional, "Profesor"),
                id_profesor          = profesor.id_profesor,
                nombres              = profesor.nombres,
                apellidos            = profesor.apellidos,
                correo_institucional = profesor.correo_institucional,
            };
        }

        public async Task<LoginResponse> LoginEstudianteAsync(LoginStudentRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Cedula) || string.IsNullOrWhiteSpace(request.Contrasena))
                throw new ValidationException(new[] { new FluentValidation.Results.ValidationFailure("Cedula", "Cédula y contraseña son requeridas.") });

            var estudiante = await _estudianteDataService.ObtenerPorCedulaAsync(request.Cedula, cancellationToken);

            // MVP: Usamos la cédula como contraseña
            if (estudiante is null || !estudiante.activo || request.Contrasena != estudiante.Cedula)
                throw new UnauthorizedBusinessException("Cédula o contraseña incorrectas.");

            return new LoginResponse
            {
                token                = GenerarToken(estudiante.id_estudiante, estudiante.Cedula, "Estudiante"),
                id_profesor          = estudiante.id_estudiante, // Usamos id_profesor para que el front lo mapee correctamente al usuario genérico
                nombres              = estudiante.nombres,
                apellidos            = estudiante.apellidos,
                correo_institucional = estudiante.Cedula // Usamos cédula como email en la respuesta por compatibilidad
            };
        }

        private string GenerarToken(int id, string identificador, string rol)
        {
            var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, identificador),
                new Claim("id_profesor", id.ToString()),
                new Claim("id_usuario", id.ToString()),
                new Claim(ClaimTypes.Role, rol)
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
