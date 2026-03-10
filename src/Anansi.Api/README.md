# Anansi.Api

The outermost layer of the application. This is the ASP.NET Core Web API entry
point that bootstraps the host, registers all services via dependency injection,
exposes HTTP endpoints through controllers, and applies middleware for
cross-cutting concerns such as authentication and error handling.

## Structure

```
Anansi.Api/
├── Controllers/     # API controllers grouped by feature
├── Extensions/      # IServiceCollection / IApplicationBuilder extensions
├── Middleware/       # Custom middleware (error handling, logging, etc.)
├── Properties/      # launchSettings.json
├── Program.cs       # Application entry point and host configuration
├── appsettings.json # Runtime configuration
└── Anansi.Api.csproj
```

## Dependencies

### Project References

| Project                | Purpose                                        |
|------------------------|------------------------------------------------|
| Anansi.Infrastructure  | Pulls in all layers (Infrastructure, Application, Domain) |

### NuGet Packages

| Package                                        | Version | Purpose                      |
|------------------------------------------------|---------|------------------------------|
| Microsoft.AspNetCore.Authentication.JwtBearer  | 9.0.3   | JWT auth middleware          |
| Microsoft.AspNetCore.OpenApi                   | 9.0.3   | OpenAPI / Swagger support    |

- **Target Framework:** .NET 9
- **SDK:** Microsoft.NET.Sdk.Web

## Role in Clean Architecture

```
Domain  <--  Application  <--  Infrastructure  <--  Api
                                                    ^^^
                                                    you are here
```

The Api layer is the composition root. It references Infrastructure, which
transitively brings in Application and Domain. No business logic lives here --
controllers simply dispatch requests to MediatR and return results.
