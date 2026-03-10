using System.Security.Claims;

namespace Anansi.Api.Middleware;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var photographerIdClaim = context.User.FindFirst("PhotographerId")?.Value;
            if (!string.IsNullOrEmpty(photographerIdClaim))
            {
                context.Items["PhotographerId"] = photographerIdClaim;
            }
        }

        await _next(context);
    }
}
