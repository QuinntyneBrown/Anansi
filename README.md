# Anansi

All-in-one platform for photographers — client galleries, online store, website builder, studio manager (CRM), booking, and mobile apps.

## Products

| Product | Description |
|---------|-------------|
| **Client Gallery** | Photo/video delivery with proofing, favorites, downloads, privacy controls, and sharing |
| **Online Store** | Print products, albums, digital downloads, price sheets, coupons, gift cards, and checkout |
| **Website Builder** | Drag-and-drop editor with templates, blog, SEO, custom domains, and analytics |
| **Studio Manager** | CRM with contacts, project pipeline, contracts, invoices, quotes, questionnaires, and inbox |
| **Booking** | Online scheduling with session types, availability, calendar sync, and payments |
| **Mobile Apps** | Native studio manager app (iOS/Android) and client gallery PWA |

## Tech Stack

### Backend

- **.NET 9** / C#
- **Clean Architecture** — Domain → Application → Infrastructure → API
- **ASP.NET Core** Web API

### Frontend

- **Angular 19** workspace with multiple apps and libraries
- **Tailwind CSS** for styling

### Apps

| App | Path | Description |
|-----|------|-------------|
| Studio Manager | `projects/studio-manager` | Main photographer dashboard |
| Client Gallery | `projects/client-gallery` | Client-facing gallery experience |
| Online Store | `projects/online-store` | Storefront for print/digital sales |
| Booking Site | `projects/booking-site` | Public booking pages |
| Website Builder | `projects/website-builder` | Website editor |
| Mobile Gallery | `projects/mobile-gallery` | Client gallery PWA |

### Shared Libraries

| Library | Path | Description |
|---------|------|-------------|
| `components` | `projects/components` | Shared UI component library |
| `api` | `projects/api` | API client services |
| `domain/*` | `projects/domain/*` | Feature domain libraries (auth, booking, calendar, contacts, documents, gallery, inbox, notifications, reports, settings, store, etc.) |

## Project Structure

```
src/
  Anansi.Api/              # ASP.NET Core Web API (43 controllers)
  Anansi.Application/      # Use cases, DTOs, interfaces (CQRS with MediatR)
  Anansi.Domain/           # Entities, enums, value objects
  Anansi.Infrastructure/   # Persistence, identity, external services
  Anansi.Web/              # Angular 19 workspace
    projects/
      studio-manager/      # Main photographer app
      client-gallery/      # Client gallery app
      online-store/        # Storefront app
      booking-site/        # Booking app
      website-builder/     # Website editor app
      mobile-gallery/      # Gallery PWA
      components/          # Shared UI library
      api/                 # API client library
      domain/              # Feature domain libraries
tests/
  Anansi.Tests.Acceptance/ # Acceptance / integration tests
docs/
  specs/                   # Product specifications (L1 & L2)
  features.md              # Feature list (53 features mapped to L2 requirements)
  software-design-documents/ # Per-feature SDDs (F01–F53)
```

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)

### Backend

```bash
dotnet build
dotnet run --project src/Anansi.Api
```

### Frontend

```bash
cd src/Anansi.Web
npm install
npm start              # Serves the default app
```

### Tests

```bash
# Backend
dotnet test

# Frontend
cd src/Anansi.Web
npm test
```

## Documentation

- **L1 Spec** (`docs/specs/L1.md`) — High-level product requirements
- **L2 Spec** (`docs/specs/L2.md`) — Detailed requirements with acceptance criteria and unique IDs
- **Features** (`docs/features.md`) — 53 features grouped from L2 requirements
- **SDDs** (`docs/software-design-documents/`) — Software design documents per feature (F01–F53)

## License

All rights reserved.
