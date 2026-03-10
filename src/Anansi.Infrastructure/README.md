# Anansi.Infrastructure

The infrastructure layer provides concrete implementations for the interfaces
defined in Anansi.Application. It wires up Entity Framework Core with
PostgreSQL, ASP.NET Identity for user management, JWT authentication, and any
external service integrations the platform requires.

## Structure

```
Anansi.Infrastructure/
├── DependencyInjection.cs   # Extension method to register all infra services
├── Identity/                # ASP.NET Identity configuration and services
├── Persistence/             # EF Core DbContext, migrations, repositories
├── Services/                # External service implementations (email, etc.)
└── Anansi.Infrastructure.csproj
```

## Dependencies

### Project References

| Project              | Purpose                                         |
|----------------------|-------------------------------------------------|
| Anansi.Application   | Implements interfaces defined in Application    |

### NuGet Packages

| Package                                          | Version | Purpose                        |
|--------------------------------------------------|---------|--------------------------------|
| MediatR                                          | 12.4.1  | Domain event publishing        |
| Microsoft.AspNetCore.Authentication.JwtBearer    | 9.0.3   | JWT bearer token auth          |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 9.0.3  | Identity persistence with EF   |
| Microsoft.EntityFrameworkCore                    | 9.0.3   | ORM framework                  |
| Npgsql.EntityFrameworkCore.PostgreSQL            | 9.0.4   | PostgreSQL database provider   |
| Microsoft.IdentityModel.Tokens                   | 8.3.0   | Token validation primitives    |
| System.IdentityModel.Tokens.Jwt                  | 8.3.0   | JWT creation and parsing       |

- **Target Framework:** .NET 9
- **Database:** PostgreSQL (via Npgsql)

## Role in Clean Architecture

```
Domain  <--  Application  <--  Infrastructure  <--  Api
                               ^^^^^^^^^^^^^^
                               you are here
```

Infrastructure depends on Application (and transitively on Domain). It provides
the "how" -- database access, authentication, third-party integrations -- while
the inner layers remain unaware of these implementation details.
