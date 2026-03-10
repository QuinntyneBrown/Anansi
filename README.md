# Anansi

All-in-one platform for photographers — galleries, online store, website builder, studio manager (CRM), and mobile apps.

## Tech Stack

- **.NET 9** (C#)
- **Clean Architecture** (Domain → Application → Infrastructure → API)

## Project Structure

```
src/
  Anansi.Api/              # ASP.NET Core Web API
  Anansi.Application/      # Use cases, DTOs, interfaces
  Anansi.Domain/            # Entities, enums, domain interfaces
  Anansi.Infrastructure/   # Persistence, identity, external services
tests/
  Anansi.Tests.Acceptance/ # Acceptance / integration tests
docs/
  specs/                   # Product specifications (L1 & L2)
  designs/                 # Design assets
```

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

### Run

```bash
dotnet build
dotnet run --project src/Anansi.Api
```

### Test

```bash
dotnet test
```

## License

All rights reserved.
