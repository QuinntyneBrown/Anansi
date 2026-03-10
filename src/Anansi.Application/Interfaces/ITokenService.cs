namespace Anansi.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(string userId, string email, Guid? photographerId, IEnumerable<string>? roles = null);
    string GenerateRefreshToken();
}
