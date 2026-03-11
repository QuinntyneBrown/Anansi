using System.Text;
using Anansi.Application.Interfaces;
using Anansi.Infrastructure.Identity;
using Anansi.Infrastructure.Persistence;
using Anansi.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Anansi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // JWT Authentication (must be configured before Identity to set default schemes)
        var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
        var jwtKey = configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
        {
            if (environment is "Development" or "Testing")
                jwtKey = "DevOnlyKey_NotForProduction_MinLength32Chars!";
            else
                throw new InvalidOperationException("Jwt:Key must be configured in production. Set the Jwt:Key configuration value.");
        }
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"] ?? "Anansi",
                ValidAudience = configuration["Jwt:Audience"] ?? "Anansi",
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.FromMinutes(1)
            };
        });

        // Identity (use AddIdentityCore to avoid overriding JWT auth scheme)
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddSignInManager()
        .AddDefaultTokenProviders();

        // Services
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<ITokenService, TokenService>();

        // External service stubs (swap for real implementations when ready)
        services.AddScoped<IEmailService, StubEmailService>();
        services.AddScoped<IStorageService, StubStorageService>();
        services.AddScoped<IPaymentService, StubPaymentService>();
        services.AddScoped<IInstagramService, StubInstagramService>();
        services.AddScoped<ILabIntegrationService, StubLabIntegrationService>();
        services.AddScoped<IPushNotificationService, StubPushNotificationService>();
        services.AddScoped<IPayPalService, StubPayPalService>();
        services.AddScoped<ILightroomSyncService, StubLightroomSyncService>();
        services.AddScoped<IVideoCallService, StubVideoCallService>();
        services.AddScoped<IWebhookService, StubWebhookService>();
        services.AddScoped<IGoogleCalendarService, StubGoogleCalendarService>();
        services.AddScoped<ICdnService, StubCdnService>();

        return services;
    }
}
