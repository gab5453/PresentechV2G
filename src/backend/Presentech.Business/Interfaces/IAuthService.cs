using Presentech.Business.DTOs.Auth;

namespace Presentech.Business.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<LoginResponse> LoginEstudianteAsync(LoginStudentRequest request, CancellationToken cancellationToken = default);
    }
}
