# Anansi.Tests.Acceptance

Acceptance and integration tests for the Anansi platform. Tests run against the
full ASP.NET Core pipeline using `WebApplicationFactory`, with an EF Core
in-memory database substituted for PostgreSQL so that no external services are
required during test execution.

## Structure

```
Anansi.Tests.Acceptance/
├── Fixtures/          # TestWebApplicationFactory and shared setup
├── Helpers/           # Utility classes for test data, auth tokens, etc.
│
│   Feature test folders:
├── Auth/
├── Booking/
├── Branding/
├── CRM/
├── Email/
├── Finance/
├── Galleries/
├── Integrations/
├── Notifications/
├── Payments/
├── Plans/
├── Store/
├── Website/
│
└── Anansi.Tests.Acceptance.csproj
```

## Dependencies

### Project References

| Project      | Purpose                                           |
|--------------|---------------------------------------------------|
| Anansi.Api   | Provides the application under test (all layers)  |

### NuGet Packages

| Package                                  | Version  | Purpose                            |
|------------------------------------------|----------|------------------------------------|
| xunit                                    | 2.9.2    | Test framework                     |
| xunit.runner.visualstudio                | 2.8.2    | VS / dotnet test integration       |
| Microsoft.NET.Test.Sdk                   | 17.12.0  | Test host                          |
| FluentAssertions                         | 8.2.0    | Expressive assertion syntax        |
| Microsoft.AspNetCore.Mvc.Testing         | 9.0.3    | WebApplicationFactory              |
| Microsoft.EntityFrameworkCore.InMemory   | 9.0.3    | In-memory DB provider for tests    |
| coverlet.collector                       | 6.0.2    | Code coverage collection           |

- **Target Framework:** .NET 9

## Role in Clean Architecture

These tests sit outside the architecture layers. They reference Anansi.Api
(the composition root) and exercise the full request pipeline end-to-end,
verifying that all layers integrate correctly.
