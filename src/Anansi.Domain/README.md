# Anansi.Domain

The innermost layer of the Clean Architecture. This project defines the core
domain model for Anansi -- entities, value objects, enumerations, and repository
contracts. It has **no dependencies** on other projects or external NuGet
packages, keeping the domain logic free from infrastructure concerns.

## Structure

```
Anansi.Domain/
├── Common/          # Base classes, value objects, shared domain primitives
├── Entities/        # Domain entities (aggregate roots and child entities)
├── Enums/           # Domain enumerations (status types, roles, categories)
├── Interfaces/      # Repository and domain-service contracts
└── Anansi.Domain.csproj
```

## Dependencies

| Kind    | Reference | Notes                  |
|---------|-----------|------------------------|
| Project | _(none)_  | No project references  |
| Package | _(none)_  | No NuGet packages      |

- **Target Framework:** .NET 9
- **Nullable:** enabled
- **Implicit Usings:** enabled

## Role in Clean Architecture

```
Domain  <--  Application  <--  Infrastructure  <--  Api
^^^^^^
you are here
```

The Domain layer sits at the centre of the dependency graph. Every other layer
depends on it (directly or transitively), but it depends on nothing. This
guarantees that business rules can be tested and reasoned about in isolation,
without databases, HTTP, or third-party libraries.
