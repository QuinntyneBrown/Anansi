using Anansi.Infrastructure;

namespace Anansi.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddInfrastructure(configuration);
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(Application.Common.Result).Assembly);
            cfg.RegisterServicesFromAssembly(typeof(Infrastructure.DependencyInjection).Assembly);
        });
        return services;
    }
}
