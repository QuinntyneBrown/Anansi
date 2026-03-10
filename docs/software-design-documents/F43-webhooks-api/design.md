# F43 - Webhooks & API

## Overview

Webhooks & API provides three extensibility mechanisms for the Anansi platform: outgoing webhooks that notify external systems of key business events, custom code injection that lets Pro-plan photographers embed arbitrary HTML/JS into their website, and a REST API that exposes template management for programmatic access. Together, these features enable photographers to integrate Anansi with external tools such as Zapier, custom CRM systems, live chat widgets, and third-party analytics services.

Outgoing webhooks support four event types: `BookingCreated`, `PaymentReceived`, `ContractSigned`, and `FormSubmitted`. Photographers configure one or more webhook URLs in their account settings, each subscribed to specific event types. When a matching event occurs, the `IWebhookService` constructs a JSON payload containing the event type, timestamp, photographer ID, and relevant entity data, then delivers it via HTTP POST to the subscribed URL. Each delivery is recorded in a `WebhookDelivery` entity for auditability, including the HTTP status code and response body. Failed deliveries are retried with exponential backoff (up to 3 attempts).

Custom code injection (available on Pro plans and above) allows photographers to inject HTML/CSS/JS snippets into the `<head>` or before `</body>` of their public website pages. Each injection is stored as a `CustomCodeInjection` entity with a location (Header or Footer), content, and active flag. The rendering pipeline injects active snippets at the appropriate location. A validation layer ensures injected code does not include dangerous patterns (e.g., `<script src>` pointing to known malicious domains) but otherwise permits tracking pixels, live chat, analytics, and custom forms. The REST API provides CRUD operations on email, contract, invoice, questionnaire, and quote templates via API key authentication, with paginated list endpoints.

**L2 Requirements:** INT-8.3.1 (Webhooks), INT-8.3.2 (Custom Code Injection), INT-8.3.3 (REST API)

---

## Components

### Domain Layer (Anansi.Domain)

| Component | Type | Description |
|-----------|------|-------------|
| `WebhookSubscription` | Entity | Stores a webhook endpoint URL, subscribed `WebhookEventType`, optional signing secret, active flag, and photographer reference. Implements `ITenantEntity`, `ISoftDeletable`. |
| `WebhookDelivery` | Entity | Records each delivery attempt: payload JSON, HTTP status code, response body, success flag, and delivery timestamp. References its parent `WebhookSubscription`. |
| `WebhookEventType` | Enum | `BookingCreated`, `PaymentReceived`, `ContractSigned`, `FormSubmitted`. |
| `CustomCodeInjection` | Entity | Stores a code snippet, its injection location (Header/Footer), active flag, and optional label. Implements `ITenantEntity`. |
| `CodeInjectionLocation` | Enum | `Header`, `Footer`. |
| `ApiKey` | Entity | Stores a hashed API key with prefix, name, optional expiration, last-used timestamp, and active flag. Implements `ITenantEntity`, `ISoftDeletable`. |

### Application Layer (Anansi.Application)

| Component | Type | Description |
|-----------|------|-------------|
| `CreateWebhookSubscriptionCommand` | Command | Creates a new webhook subscription with URL, event type, and optional secret. |
| `UpdateWebhookSubscriptionCommand` | Command | Updates URL, event type, secret, or active status on an existing subscription. |
| `DeleteWebhookSubscriptionCommand` | Command | Soft-deletes a webhook subscription. |
| `GetWebhookSubscriptionsQuery` | Query | Returns all subscriptions for the authenticated photographer. |
| `GetWebhookDeliveriesQuery` | Query | Returns paginated delivery history for a subscription. |
| `TestWebhookCommand` | Command | Sends a test payload to a webhook URL and returns the delivery result. |
| `CreateCustomCodeInjectionCommand` | Command | Creates a new code injection. Validates Pro plan access via `IPlanGateService`. |
| `UpdateCustomCodeInjectionCommand` | Command | Updates code content, location, label, or active flag. |
| `DeleteCustomCodeInjectionCommand` | Command | Deletes a code injection record. |
| `GetCustomCodeInjectionsQuery` | Query | Returns all code injections for the authenticated photographer. |
| `GetActiveInjectionsForSiteQuery` | Query | Returns active injections for a photographer's website, grouped by location. Used by the rendering pipeline. |
| `CreateApiKeyCommand` | Command | Generates a cryptographically random API key, hashes it, stores the `ApiKey` entity, and returns the full key once. |
| `RevokeApiKeyCommand` | Command | Soft-deletes an API key. |
| `GetApiKeysQuery` | Query | Returns all API keys for the authenticated photographer (prefix only, not full key). |
| `IWebhookService` | Interface | `DeliverAsync(photographerId, eventType, payload)` -- finds matching subscriptions and delivers the webhook. |

### Infrastructure Layer (Anansi.Infrastructure)

| Component | Type | Description |
|-----------|------|-------------|
| `WebhookService` | Service | Implements `IWebhookService`. Queries active `WebhookSubscription` records matching the event type, serializes the payload to JSON, signs it with HMAC-SHA256 if a secret is configured, sends HTTP POST, records `WebhookDelivery`, and schedules retries on failure. |
| `WebhookRetryJob` | BackgroundJob | Hangfire job that retries failed deliveries with exponential backoff (30s, 2min, 10min). Maximum 3 attempts. |
| `ApiKeyAuthenticationHandler` | Handler | ASP.NET Core authentication handler for `X-Api-Key` header validation. Hashes the provided key with SHA256 and matches against `ApiKey.KeyHash`. Updates `LastUsedAt` on success. |
| `CodeInjectionSanitizer` | Service | Validates custom code injections against a blocklist of dangerous patterns. Allows most HTML/JS but rejects known malicious domains and inline event handlers that could hijack the page. |

### API Layer (Anansi.Api)

| Component | Type | Description |
|-----------|------|-------------|
| `WebhooksController` | Controller | CRUD endpoints for webhook subscriptions under `api/webhooks`. Includes `POST /test` to send a test delivery. Requires JWT authentication. |
| `WebhookDeliveriesController` | Controller | Read-only endpoints for webhook delivery history under `api/webhooks/{subscriptionId}/deliveries`. Paginated. |
| `CodeInjectionsController` | Controller | CRUD endpoints for custom code injections under `api/code-injections`. Requires JWT + Pro plan. |
| `ApiKeysController` | Controller | Endpoints for creating and revoking API keys under `api/api-keys`. Requires JWT authentication. |
| `TemplatesApiController` | Controller | REST API endpoints under `api/v1/templates/{type}` for programmatic CRUD on email, contract, invoice, questionnaire, and quote templates. Requires API key authentication. Paginated list responses. |

---

## Class Diagrams

### Domain -- Webhook Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class WebhookSubscription {
  +Id : Guid
  +PhotographerId : Guid
  +Url : string
  +EventType : WebhookEventType
  +Secret : string?
  +IsActive : bool
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

class WebhookDelivery {
  +Id : Guid
  +WebhookSubscriptionId : Guid
  +Payload : string
  +HttpStatusCode : int
  +ResponseBody : string?
  +Success : bool
  +DeliveredAt : DateTime
}

enum WebhookEventType {
  BookingCreated
  PaymentReceived
  ContractSigned
  FormSubmitted
}

WebhookSubscription "1" --> "*" WebhookDelivery : deliveries
WebhookSubscription ..> WebhookEventType

@enduml
```

### Domain -- Code Injection & API Key Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CustomCodeInjection {
  +Id : Guid
  +PhotographerId : Guid
  +Code : string
  +Location : CodeInjectionLocation
  +IsActive : bool
  +Label : string?
}

enum CodeInjectionLocation {
  Header
  Footer
}

class ApiKey {
  +Id : Guid
  +PhotographerId : Guid
  +Name : string
  +KeyHash : string
  +KeyPrefix : string
  +ExpiresAt : DateTime?
  +LastUsedAt : DateTime?
  +IsActive : bool
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

CustomCodeInjection ..> CodeInjectionLocation

@enduml
```

### Application -- Webhook Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Webhooks.Commands" {
  class CreateWebhookSubscriptionCommand <<record>> {
    +Url : string
    +EventType : WebhookEventType
    +Secret : string?
  }

  class UpdateWebhookSubscriptionCommand <<record>> {
    +Id : Guid
    +Url : string?
    +EventType : WebhookEventType?
    +Secret : string?
    +IsActive : bool?
  }

  class DeleteWebhookSubscriptionCommand <<record>> {
    +Id : Guid
  }

  class TestWebhookCommand <<record>> {
    +Id : Guid
  }
}

package "Features.Webhooks.Queries" {
  class GetWebhookSubscriptionsQuery <<record>>

  class GetWebhookDeliveriesQuery <<record>> {
    +SubscriptionId : Guid
    +Page : int
    +PageSize : int
  }
}

interface IWebhookService {
  +DeliverAsync(photographerId, eventType, payload) : Task
}

class WebhookSubscriptionDto <<record>> {
  +Id : Guid
  +Url : string
  +EventType : WebhookEventType
  +IsActive : bool
  +CreatedAt : DateTime
}

class WebhookDeliveryDto <<record>> {
  +Id : Guid
  +Payload : string
  +HttpStatusCode : int
  +Success : bool
  +DeliveredAt : DateTime
}

@enduml
```

### Application -- Code Injection & API Key Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.CodeInjections.Commands" {
  class CreateCustomCodeInjectionCommand <<record>> {
    +Code : string
    +Location : CodeInjectionLocation
    +Label : string?
  }

  class UpdateCustomCodeInjectionCommand <<record>> {
    +Id : Guid
    +Code : string?
    +Location : CodeInjectionLocation?
    +Label : string?
    +IsActive : bool?
  }

  class DeleteCustomCodeInjectionCommand <<record>> {
    +Id : Guid
  }
}

package "Features.CodeInjections.Queries" {
  class GetCustomCodeInjectionsQuery <<record>>

  class GetActiveInjectionsForSiteQuery <<record>> {
    +PhotographerId : Guid
  }
}

package "Features.ApiKeys.Commands" {
  class CreateApiKeyCommand <<record>> {
    +Name : string
    +ExpiresAt : DateTime?
  }

  class RevokeApiKeyCommand <<record>> {
    +Id : Guid
  }
}

package "Features.ApiKeys.Queries" {
  class GetApiKeysQuery <<record>>
}

class ApiKeyDto <<record>> {
  +Id : Guid
  +Name : string
  +KeyPrefix : string
  +ExpiresAt : DateTime?
  +LastUsedAt : DateTime?
  +IsActive : bool
}

class CreateApiKeyResponse <<record>> {
  +Id : Guid
  +FullKey : string
  +KeyPrefix : string
}

@enduml
```

### Infrastructure -- WebhookService & Authentication

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface IWebhookService

class WebhookService {
  -_db : IApplicationDbContext
  -_httpClientFactory : IHttpClientFactory
  -_logger : ILogger
  +DeliverAsync(photographerId, eventType, payload) : Task
  -SignPayload(payload, secret) : string
  -RecordDelivery(subscriptionId, payload, statusCode, response, success) : Task
}

class WebhookRetryJob {
  -_db : IApplicationDbContext
  -_httpClientFactory : IHttpClientFactory
  +RetryFailedDelivery(deliveryId) : Task
}

class ApiKeyAuthenticationHandler {
  -_db : IApplicationDbContext
  +HandleAuthenticateAsync() : Task<AuthenticateResult>
}

class CodeInjectionSanitizer {
  +Validate(code) : ValidationResult
  -_blockedPatterns : string[]
}

IWebhookService <|.. WebhookService

@enduml
```

### API -- Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class WebhooksController <<ApiController>> {
  -_mediator : IMediator
  +GetSubscriptions() : IActionResult
  +CreateSubscription(cmd) : IActionResult
  +UpdateSubscription(id, cmd) : IActionResult
  +DeleteSubscription(id) : IActionResult
  +TestWebhook(id) : IActionResult
}

class WebhookDeliveriesController <<ApiController>> {
  -_mediator : IMediator
  +GetDeliveries(subscriptionId, page, pageSize) : IActionResult
}

class CodeInjectionsController <<ApiController>> {
  -_mediator : IMediator
  +GetInjections() : IActionResult
  +CreateInjection(cmd) : IActionResult
  +UpdateInjection(id, cmd) : IActionResult
  +DeleteInjection(id) : IActionResult
}

class ApiKeysController <<ApiController>> {
  -_mediator : IMediator
  +GetKeys() : IActionResult
  +CreateKey(cmd) : IActionResult
  +RevokeKey(id) : IActionResult
}

class TemplatesApiController <<ApiController>> {
  -_mediator : IMediator
  +GetTemplates(type, page, pageSize) : IActionResult
  +GetTemplate(type, id) : IActionResult
  +CreateTemplate(type, request) : IActionResult
  +UpdateTemplate(type, id, request) : IActionResult
  +DeleteTemplate(type, id) : IActionResult
}

note bottom of TemplatesApiController
  Authenticated via X-Api-Key header.
  Supports types: email, contract,
  invoice, questionnaire, quote.
end note

WebhooksController --> "IMediator"
CodeInjectionsController --> "IMediator"
ApiKeysController --> "IMediator"
TemplatesApiController --> "IMediator"

@enduml
```

---

## Sequence Diagrams

### Webhook Delivery on Business Event

```plantuml
@startuml
participant "ConfirmBookingHandler" as BH
participant "IWebhookService" as WS
participant "IApplicationDbContext" as DB
participant "HttpClient" as HC
participant "External URL" as EXT

BH -> WS : DeliverAsync(photographerId,\nBookingCreated, bookingPayload)

WS -> DB : WebhookSubscriptions\n.Where(PhotographerId == id\n&& EventType == BookingCreated\n&& IsActive)
DB --> WS : subscriptions[]

loop for each subscription
  WS -> WS : Serialize payload to JSON\n{event, timestamp, photographerId, data}

  alt subscription.Secret is set
    WS -> WS : HMAC-SHA256 sign payload
    WS -> WS : Add X-Anansi-Signature header
  end

  WS -> HC : POST subscription.Url\nContent-Type: application/json\nBody: {event, timestamp, data}
  HC -> EXT : HTTP POST
  EXT --> HC : response (status, body)
  HC --> WS : httpResponse

  WS -> DB : WebhookDeliveries.Add(\nnew WebhookDelivery {\nPayload, HttpStatusCode,\nResponseBody, Success,\nDeliveredAt})

  alt status >= 400 or timeout
    WS -> WS : Schedule retry via Hangfire\n(exponential backoff)
  end
end

WS -> DB : SaveChangesAsync()
WS --> BH : (fire-and-forget)
@enduml
```

### Webhook Retry (Exponential Backoff)

```plantuml
@startuml
participant "Hangfire" as HF
participant "WebhookRetryJob" as RJ
participant "IApplicationDbContext" as DB
participant "HttpClient" as HC
participant "External URL" as EXT

HF -> RJ : RetryFailedDelivery(deliveryId)
RJ -> DB : Get WebhookDelivery\nwith WebhookSubscription
DB --> RJ : delivery + subscription

RJ -> RJ : Check attempt count\n(count existing deliveries\nfor same subscription + payload hash)

alt attempt > 3
  RJ -> RJ : Mark as permanently failed
  RJ -> DB : SaveChangesAsync()
  RJ --> HF : done (no more retries)
else attempt <= 3
  RJ -> HC : POST subscription.Url\nBody: delivery.Payload
  HC -> EXT : HTTP POST
  EXT --> HC : response

  RJ -> DB : WebhookDeliveries.Add(\nnew delivery record)

  alt still failed
    RJ -> HF : Schedule next retry\n(30s, 2min, 10min)
  end

  RJ -> DB : SaveChangesAsync()
  RJ --> HF : done
end
@enduml
```

### Create Custom Code Injection (Pro Plan)

```plantuml
@startuml
actor Photographer as P
participant "CodeInjectionsController" as CC
participant "MediatR" as M
participant "CreateCodeInjectionHandler" as H
participant "ICurrentUserService" as US
participant "IApplicationDbContext" as DB
participant "CodeInjectionSanitizer" as SAN

P -> CC : POST /api/code-injections\n{code: "<script>...</script>",\nlocation: "Header",\nlabel: "Live Chat"}
CC -> M : Send(CreateCustomCodeInjectionCommand)
M -> H : Handle(command)
H -> US : PhotographerId
US --> H : Guid

H -> DB : Check Photographer's plan\nvia PlanFeatureGates
DB --> H : plan features

alt plan does not include code_injection
  H --> M : Result.Failure("Pro plan required")
  M --> CC : Result.Failure
  CC --> P : 403 Forbidden
end

H -> SAN : Validate(command.Code)
SAN --> H : ValidationResult

alt validation fails
  H --> M : Result.Failure(sanitization errors)
  M --> CC : Result.Failure
  CC --> P : 400 Bad Request
end

H -> DB : CustomCodeInjections.Add(\nnew CustomCodeInjection {\nPhotographerId, Code,\nLocation, Label, IsActive=true})
H -> DB : SaveChangesAsync()
H --> M : Result.Success(CodeInjectionDto)
M --> CC : Result.Success
CC --> P : 201 Created {id, code, location, label}
@enduml
```

### Create API Key

```plantuml
@startuml
actor Photographer as P
participant "ApiKeysController" as AKC
participant "MediatR" as M
participant "CreateApiKeyHandler" as H
participant "ICurrentUserService" as US
participant "IApplicationDbContext" as DB

P -> AKC : POST /api/api-keys\n{name: "Lightroom Plugin",\nexpiresAt: null}
AKC -> M : Send(CreateApiKeyCommand)
M -> H : Handle(command)
H -> US : PhotographerId
US --> H : Guid

H -> H : Generate 32-byte\ncryptographically random key
H -> H : Encode as base64url string\nwith "anan_" prefix
H -> H : Compute SHA256 hash of full key
H -> H : Extract prefix (first 8 chars)

H -> DB : ApiKeys.Add(new ApiKey {\nPhotographerId, Name,\nKeyHash, KeyPrefix,\nExpiresAt, IsActive=true})
H -> DB : SaveChangesAsync()

H --> M : Result.Success(CreateApiKeyResponse {\nId, FullKey, KeyPrefix})
M --> AKC : Result.Success
AKC --> P : 201 Created\n{id, fullKey: "anan_xyz...", keyPrefix: "anan_xyz"}

note right of P
  Full key is shown only once.
  Photographer must copy it now.
  Only the hash and prefix are stored.
end note
@enduml
```

### REST API Template Access (API Key Auth)

```plantuml
@startuml
actor "External System" as EXT
participant "TemplatesApiController" as TC
participant "ApiKeyAuthHandler" as AH
participant "IApplicationDbContext" as DB
participant "MediatR" as M
participant "GetTemplatesHandler" as H

EXT -> TC : GET /api/v1/templates/email?page=1&pageSize=20\nX-Api-Key: anan_xyz...

TC -> AH : Authenticate request
AH -> AH : Hash provided key with SHA256
AH -> DB : ApiKeys.FirstOrDefault(\nKeyHash == hash\n&& IsActive\n&& (ExpiresAt == null || ExpiresAt > now))
DB --> AH : apiKey (or null)

alt key not found or expired
  AH --> TC : AuthenticateResult.Fail
  TC --> EXT : 401 Unauthorized
end

AH -> DB : apiKey.LastUsedAt = UtcNow
AH -> DB : SaveChangesAsync()
AH --> TC : AuthenticateResult.Success\n(claims with PhotographerId)

TC -> M : Send(GetTemplatesQuery {\nType: "email", Page: 1, PageSize: 20})
M -> H : Handle(query)
H -> DB : EmailTemplates\n.Where(PhotographerId == id)\n.OrderBy(CreatedAt)\n.Skip(0).Take(20)
DB --> H : templates[]
H --> M : Result.Success(PagedList<TemplateDto>)
M --> TC : Result.Success
TC --> EXT : 200 OK {\nitems: [{id, name, subject, body}],\npage: 1, pageSize: 20,\ntotalCount: 42\n}
@enduml
```

### Code Injection Rendering in Website Pipeline

```plantuml
@startuml
actor Client as C
participant "Website Rendering" as WR
participant "MediatR" as M
participant "GetActiveInjectionsHandler" as H
participant "IApplicationDbContext" as DB

C -> WR : Request website page\n(GET photographer.anansi.io/about)

WR -> M : Send(GetActiveInjectionsForSiteQuery\n{PhotographerId})
M -> H : Handle(query)
H -> DB : CustomCodeInjections\n.Where(PhotographerId == id\n&& IsActive)\n.ToList()
DB --> H : injections[]
H -> H : Group by Location\n(Header vs Footer)
H --> M : {headerCode: [...], footerCode: [...]}
M --> WR : injections

WR -> WR : Build HTML response
WR -> WR : Inject headerCode snippets\ninto <head> section
WR -> WR : Inject footerCode snippets\nbefore </body>

note right of WR
  Also injects GA4 script if
  Photographer.GoogleAnalyticsId is set,
  and Facebook Pixel if
  Photographer.FacebookPixelId is set.
end note

WR --> C : Full HTML page with\ninjected tracking/chat/analytics code
@enduml
```
