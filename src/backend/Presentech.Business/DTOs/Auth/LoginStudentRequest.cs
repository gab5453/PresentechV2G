namespace Presentech.Business.DTOs.Auth
{
    public class LoginStudentRequest
    {
        public string Cedula { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }
}
