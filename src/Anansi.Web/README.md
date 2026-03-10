# Anansi Web - Angular Workspace

Multi-project Angular workspace for the Anansi photography platform. This workspace contains all frontend applications and shared libraries that power the photographer and client experiences.

## Applications

| App | Alias | Description | Port |
|-----|-------|-------------|------|
| `studio-manager` | sm | Photographer-facing CRM, booking, documents, inbox, reports, settings | 4200 |
| `client-gallery` | cg | Client-facing photo gallery viewing experience | 4201 |
| `online-store` | os | Client-facing storefront for prints, products, and digital downloads | 4202 |
| `website-builder` | wb | Photographer-facing drag-and-drop website editor | 4203 |
| `booking-site` | bs | Client-facing booking site for session selection and checkout | 4204 |
| `mobile-gallery` | mg | Client-facing mobile gallery PWA with add-to-home-screen support | 4205 |

## Shared Libraries

| Library | Path | Description |
|---------|------|-------------|
| `components` | `projects/components/` | Reusable UI components shared across applications |
| `api` | `projects/api/` | API client services and HTTP interceptors |

## Domain Libraries

18 domain libraries live under `projects/domain/`, organized by feature area:

auth, booking, calendar, contacts, dashboard, documents, gallery-client, gallery-organization, inbox, notifications, projects, reports, settings, shared-dialogs, storefront, store-management, website-builder

See `projects/domain/CONVENTIONS.md` for domain library conventions.

## Tech Stack

- **Framework**: Angular (standalone components)
- **State**: Signals pattern
- **Styles**: SCSS
- **Testing**: Vitest
- **Package Manager**: npm

## Development Commands

```bash
# Serve an application locally
ng serve <app>          # e.g. ng serve studio-manager

# Build an application for production
ng build <app>          # e.g. ng build client-gallery

# Run unit tests for a library
ng test <lib>           # e.g. ng test components

# Generate a new component
ng generate component <name> --project <app-or-lib>
```

## Project Structure

```
projects/
  studio-manager/       # sm - Studio Manager app
  client-gallery/       # cg - Client Gallery app
  online-store/         # os - Online Store app
  website-builder/      # wb - Website Builder app
  booking-site/         # bs - Booking Site app
  mobile-gallery/       # mg - Mobile Gallery app
  components/           # Shared UI component library
  api/                  # Shared API client library
  domain/               # 18 domain feature libraries
```
