using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Anansi.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Anansi.Api.Middleware;

public class ApiKeyAuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    private const string ApiKeyHeaderName = "X-Api-Key";

    public ApiKeyAuthenticationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IApplicationDbContext dbContext)
    {
        // Only apply to API template endpoints
        if (!context.Request.Path.StartsWithSegments("/api/templates"))
        {
            await _next(context);
            return;
        }

        // Skip if already authenticated via JWT
        if (context.User.Identity?.IsAuthenticated == true)
        {
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var apiKeyValue))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "API key is required." });
            return;
        }

        var providedKey = apiKeyValue.ToString();
        var keyHash = HashKey(providedKey);
        var prefix = providedKey.Length >= 8 ? providedKey[..8] : providedKey;

        var apiKey = await dbContext.ApiKeys
            .FirstOrDefaultAsync(k => k.KeyPrefix == prefix && k.KeyHash == keyHash && k.IsActive);

        if (apiKey == null)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid API key." });
            return;
        }

        if (apiKey.ExpiresAt.HasValue && apiKey.ExpiresAt.Value < DateTime.UtcNow)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "API key has expired." });
            return;
        }

        // Update last used
        apiKey.LastUsedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        // Set identity from API key
        var claims = new[]
        {
            new Claim("PhotographerId", apiKey.PhotographerId.ToString()),
            new Claim(ClaimTypes.AuthenticationMethod, "ApiKey")
        };
        var identity = new ClaimsIdentity(claims, "ApiKey");
        context.User = new ClaimsPrincipal(identity);
        context.Items["PhotographerId"] = apiKey.PhotographerId.ToString();

        await _next(context);
    }

    private static string HashKey(string key)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(key));
        return Convert.ToBase64String(bytes);
    }
}
