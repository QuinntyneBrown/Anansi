using System.Security.Claims;
using Anansi.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Anansi.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public Guid? PhotographerId
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("PhotographerId");
            return claim is not null && Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
