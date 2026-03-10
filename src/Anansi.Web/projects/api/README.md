# api

Shared API client library providing typed HTTP access for all Anansi Angular applications.

## Structure

```
projects/api/src/lib/
  api.config.ts        # API_CONFIG injection token for base URL configuration
  models/              # TypeScript DTOs matching backend API contracts
  services/            # HttpClient-based API service classes
```

## Usage

```typescript
import { API_CONFIG, ApiConfig } from 'api';

// Provide configuration at app bootstrap
providers: [
  { provide: API_CONFIG, useValue: { baseUrl: '/api' } satisfies ApiConfig }
]
```

```typescript
import { ContactService } from 'api';

constructor(private contacts: ContactService) {}
```

## Dev Commands

```bash
ng build api
ng test api
```
