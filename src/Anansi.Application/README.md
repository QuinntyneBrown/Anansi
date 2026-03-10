# Anansi.Application

The application layer implements use cases through a CQRS pattern powered by
MediatR. It orchestrates domain logic, defines DTOs for data transfer, declares
service interfaces for the infrastructure layer to implement, and validates
incoming requests with FluentValidation.

## Structure

```
Anansi.Application/
├── Common/          # Cross-cutting behaviours, pipeline helpers
├── DTOs/            # Data transfer objects returned to callers
├── Features/        # Commands, queries, handlers, validators (by feature)
├── Interfaces/      # Service contracts implemented by Infrastructure
└── Anansi.Application.csproj
```

## Dependencies

### Project References

| Project        | Purpose                                   |
|----------------|-------------------------------------------|
| Anansi.Domain  | Access to entities, enums, and interfaces |

### NuGet Packages

| Package                                       | Version | Purpose                          |
|-----------------------------------------------|---------|----------------------------------|
| MediatR                                       | 12.4.1  | CQRS command/query dispatching   |
| FluentValidation                              | 11.11.0 | Request validation               |
| FluentValidation.DependencyInjectionExtensions| 11.11.0 | Auto-register validators via DI  |
| Microsoft.EntityFrameworkCore                 | 9.0.3   | IQueryable abstractions / DbSet  |

- **Target Framework:** .NET 9
- **Nullable:** enabled

## Role in Clean Architecture

```
Domain  <--  Application  <--  Infrastructure  <--  Api
             ^^^^^^^^^^^
             you are here
```

The Application layer depends only on Domain. It defines _what_ the system does
(use cases) without knowing _how_ persistence, auth, or external services work.
Those concerns are abstracted behind interfaces that the Infrastructure layer
fulfils.
