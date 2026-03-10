# F41 - Integrations Hub

## Overview

The Integrations Hub is the centralized surface through which photographers connect third-party services to their Anansi account. It covers eight distinct integrations spanning scheduling, video conferencing, analytics, social media, and payment processing. Each integration follows an OAuth or credential-based connection flow, stores its configuration on the `Photographer` entity (or in a dedicated config entity), and exposes domain-specific behaviors consumed by other features throughout the platform.

Calendar and video integrations work together with the Booking feature (F25). Google Calendar provides two-way sync: when a booking is confirmed in Anansi a calendar event is created with the client as attendee, and external busy events block available booking slots. A background sync job polls for changes within a 5-minute window. Zoom and Google Meet integrations auto-generate unique meeting links when a session type is configured for video calls. Analytics integrations (GA4 and Facebook Pixel) inject tracking scripts into all client-facing pages via the rendering pipeline without requiring manual code from the photographer. The Instagram Feed integration uses the Instagram Basic Display API to pull the photographer's latest posts and display them on their website. Stripe and PayPal integrations provide payment processing capabilities consumed by F30 (Payment Processing) and F15 (Store Checkout).

The hub provides a unified settings UI under the photographer's account where each integration shows its connection status, configuration options, and disconnect action. All OAuth tokens are stored encrypted at rest. The feature relies on existing domain entities (`Photographer`, `InstagramFeedConfig`) and application interfaces (`IGoogleCalendarService`, `IVideoCallService`, `IInstagramService`, `IPaymentService`, `IPayPalService`) already defined in the codebase.

**L2 Requirements:** INT-8.1.2 (Google Calendar), INT-8.1.3 (Zoom), INT-8.1.4 (Google Meet), INT-8.1.5 (GA4), INT-8.1.6 (Facebook Pixel), INT-8.1.7 (Instagram Feed), INT-8.1.8 (Stripe), INT-8.1.8 (PayPal)

---

## Components

### Domain Layer (Anansi.Domain)

| Component | Type | Description |
|-----------|------|-------------|
| `Photographer` | Entity | Stores integration credential references: `GoogleCalendarId`, `ZoomAccountId`, `GoogleAnalyticsId`, `FacebookPixelId`, `InstagramAccessToken`, `StripeAccountId`, `PayPalEmail`. |
| `InstagramFeedConfig` | Entity | Per-photographer Instagram feed display settings: `NumberOfPosts`, `ImageSize`, `ClickBehavior`, `IsActive`. |
| `IntegrationProvider` | Enum | Enumerates supported providers: `GoogleCalendar`, `Zoom`, `GoogleMeet`, `GoogleAnalytics`, `FacebookPixel`, `Instagram`, `Stripe`, `PayPal`. |

### Application Layer (Anansi.Application)

| Component | Type | Description |
|-----------|------|-------------|
| `ConnectGoogleCalendarCommand` | Command | Exchanges OAuth authorization code for tokens, stores `GoogleCalendarId` on `Photographer`, triggers initial sync. |
| `DisconnectGoogleCalendarCommand` | Command | Clears `GoogleCalendarId`, removes stored tokens, cancels pending sync jobs. |
| `SyncGoogleCalendarCommand` | Command | Pulls remote events, pushes local confirmed bookings, reconciles conflicts. Invoked by background job every 5 minutes. |
| `ConnectZoomCommand` | Command | Exchanges Zoom OAuth code for tokens, stores `ZoomAccountId` on `Photographer`. |
| `DisconnectZoomCommand` | Command | Clears `ZoomAccountId` and stored tokens. |
| `ConfigureGoogleAnalyticsCommand` | Command | Saves GA4 Measurement ID to `Photographer.GoogleAnalyticsId`. |
| `ConfigureFacebookPixelCommand` | Command | Saves Pixel ID to `Photographer.FacebookPixelId`. |
| `ConnectInstagramCommand` | Command | Exchanges Instagram OAuth code for long-lived token, stores on `Photographer.InstagramAccessToken`, creates default `InstagramFeedConfig`. |
| `DisconnectInstagramCommand` | Command | Clears token and deactivates `InstagramFeedConfig`. |
| `UpdateInstagramFeedConfigCommand` | Command | Updates `NumberOfPosts`, `ImageSize`, `ClickBehavior` on `InstagramFeedConfig`. |
| `GetInstagramFeedQuery` | Query | Calls `IInstagramService.GetFeedAsync` with stored token, returns posts. |
| `ConnectStripeCommand` | Command | Creates Stripe Connect account via `IPaymentService.CreateConnectedAccountAsync`, stores `StripeAccountId`. |
| `DisconnectStripeCommand` | Command | Clears `StripeAccountId`. |
| `ConfigurePayPalCommand` | Command | Saves PayPal API credentials (email) to `Photographer.PayPalEmail`. |
| `GetIntegrationsStatusQuery` | Query | Returns connection status for all integrations for the authenticated photographer. |
| `IGoogleCalendarService` | Interface | Creates, updates, deletes calendar events; queries events and busy times within a date range. |
| `IVideoCallService` | Interface | Creates Zoom meetings and Google Meet links with topic, time, and attendee. |
| `IInstagramService` | Interface | Fetches Instagram feed posts using an access token. |
| `IPaymentService` | Interface | Creates Stripe payment intents, checkout sessions, refunds, and connected accounts. |
| `IPayPalService` | Interface | Creates PayPal orders, captures payments, issues refunds. |

### Infrastructure Layer (Anansi.Infrastructure)

| Component | Type | Description |
|-----------|------|-------------|
| `GoogleCalendarService` | Service | Implements `IGoogleCalendarService` using Google Calendar API v3. Manages OAuth token refresh. |
| `VideoCallService` | Service | Implements `IVideoCallService`. Creates Zoom meetings via Zoom REST API and Google Meet links via Calendar API with `conferenceData`. |
| `InstagramService` | Service | Implements `IInstagramService` using Instagram Basic Display API. Handles token refresh. |
| `StripePaymentService` | Service | Implements `IPaymentService` using Stripe .NET SDK. |
| `PayPalService` | Service | Implements `IPayPalService` using PayPal REST SDK. |
| `GoogleCalendarSyncJob` | BackgroundJob | Hangfire recurring job (every 5 min) that invokes `SyncGoogleCalendarCommand` for each connected photographer. |

### API Layer (Anansi.Api)

| Component | Type | Description |
|-----------|------|-------------|
| `IntegrationsController` | Controller | Endpoints for connecting, disconnecting, and configuring all integrations. `GET /status` returns all integration states. |
| `IntegrationsOAuthController` | Controller | Handles OAuth callback endpoints for Google, Zoom, and Instagram. |

---

## Class Diagrams

### Domain -- Integration Fields on Photographer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Photographer {
  +Id : Guid
  +Email : string
  +BusinessName : string
  +StripeAccountId : string?
  +PayPalEmail : string?
  +GoogleCalendarId : string?
  +ZoomAccountId : string?
  +GoogleAnalyticsId : string?
  +FacebookPixelId : string?
  +InstagramAccessToken : string?
}

class InstagramFeedConfig {
  +Id : Guid
  +PhotographerId : Guid
  +NumberOfPosts : int
  +ImageSize : string
  +ClickBehavior : string
  +IsActive : bool
}

enum IntegrationProvider {
  GoogleCalendar
  Zoom
  GoogleMeet
  GoogleAnalytics
  FacebookPixel
  Instagram
  Stripe
  PayPal
}

Photographer "1" --> "0..1" InstagramFeedConfig : owns
@enduml
```

### Application -- Integration Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Integrations.Commands" {
  class ConnectGoogleCalendarCommand <<record>> {
    +AuthorizationCode : string
    +RedirectUri : string
  }

  class DisconnectGoogleCalendarCommand <<record>>

  class SyncGoogleCalendarCommand <<record>> {
    +PhotographerId : Guid
  }

  class ConnectZoomCommand <<record>> {
    +AuthorizationCode : string
    +RedirectUri : string
  }

  class DisconnectZoomCommand <<record>>

  class ConfigureGoogleAnalyticsCommand <<record>> {
    +MeasurementId : string
  }

  class ConfigureFacebookPixelCommand <<record>> {
    +PixelId : string
  }
}

package "Features.Integrations.Queries" {
  class GetIntegrationsStatusQuery <<record>>

  class IntegrationStatusDto <<record>> {
    +Provider : string
    +IsConnected : bool
    +AccountLabel : string?
    +ConnectedAt : DateTime?
  }
}

@enduml
```

### Application -- Instagram & Payment Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Integrations.Commands" {
  class ConnectInstagramCommand <<record>> {
    +AuthorizationCode : string
    +RedirectUri : string
  }

  class DisconnectInstagramCommand <<record>>

  class UpdateInstagramFeedConfigCommand <<record>> {
    +NumberOfPosts : int
    +ImageSize : string
    +ClickBehavior : string
  }

  class ConnectStripeCommand <<record>> {
    +AuthorizationCode : string
  }

  class DisconnectStripeCommand <<record>>

  class ConfigurePayPalCommand <<record>> {
    +PayPalEmail : string
  }
}

package "Features.Integrations.Queries" {
  class GetInstagramFeedQuery <<record>>
}

@enduml
```

### Application -- Service Interfaces

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface IGoogleCalendarService {
  +CreateEventAsync(calendarId, title, start, end, attendeeEmail?) : Task<string>
  +UpdateEventAsync(calendarId, eventId, title, start, end) : Task
  +DeleteEventAsync(calendarId, eventId) : Task
  +GetEventsAsync(calendarId, from, to) : Task<IReadOnlyList<CalendarEventDto>>
  +GetBusyTimesAsync(calendarId, from, to) : Task<IReadOnlyList<CalendarEventDto>>
}

interface IVideoCallService {
  +CreateZoomMeetingAsync(zoomAccountId, topic, startTime, duration) : Task<VideoMeetingLink>
  +CreateGoogleMeetAsync(calendarId, topic, startTime, duration, attendeeEmail?) : Task<VideoMeetingLink>
}

interface IInstagramService {
  +GetFeedAsync(accessToken, count) : Task<IReadOnlyList<InstagramPost>>
}

interface IPaymentService {
  +CreatePaymentIntentAsync(amountCents, currency, stripeAccountId, metadata?) : Task<string>
  +CreateCheckoutSessionAsync(stripeAccountId, lineItems, successUrl, cancelUrl) : Task<string>
  +RefundAsync(paymentIntentId, amountCents?) : Task
  +CreateConnectedAccountAsync(email, country) : Task<string>
}

interface IPayPalService {
  +CreateOrderAsync(paypalEmail, amountCents, currency, description, returnUrl, cancelUrl) : Task<string>
  +CaptureOrderAsync(orderId) : Task<PayPalCaptureResult>
  +RefundAsync(captureId, amountCents?) : Task
}

class CalendarEventDto <<record>> {
  +EventId : string
  +Title : string
  +Start : DateTime
  +End : DateTime
  +IsBusy : bool
  +AttendeeEmail : string?
}

class VideoMeetingLink <<record>> {
  +MeetingUrl : string
  +MeetingId : string?
  +Password : string?
  +Provider : string
}

class InstagramPost <<record>> {
  +Id : string
  +MediaUrl : string
  +ThumbnailUrl : string?
  +Caption : string?
  +Permalink : string
  +MediaType : string
  +Timestamp : DateTime
}

IGoogleCalendarService ..> CalendarEventDto
IVideoCallService ..> VideoMeetingLink
IInstagramService ..> InstagramPost

@enduml
```

### Infrastructure -- Service Implementations

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface IGoogleCalendarService
interface IVideoCallService
interface IInstagramService
interface IPaymentService
interface IPayPalService

class GoogleCalendarService {
  -_calendarClient : CalendarService
  -_tokenStore : ITokenStore
  +CreateEventAsync() : Task<string>
  +UpdateEventAsync() : Task
  +DeleteEventAsync() : Task
  +GetEventsAsync() : Task<IReadOnlyList<CalendarEventDto>>
  +GetBusyTimesAsync() : Task<IReadOnlyList<CalendarEventDto>>
}

class VideoCallService {
  -_httpClient : HttpClient
  -_calendarClient : CalendarService
  +CreateZoomMeetingAsync() : Task<VideoMeetingLink>
  +CreateGoogleMeetAsync() : Task<VideoMeetingLink>
}

class InstagramService {
  -_httpClient : HttpClient
  +GetFeedAsync() : Task<IReadOnlyList<InstagramPost>>
}

class StripePaymentService {
  -_stripeClient : StripeClient
  +CreatePaymentIntentAsync() : Task<string>
  +CreateCheckoutSessionAsync() : Task<string>
  +RefundAsync() : Task
  +CreateConnectedAccountAsync() : Task<string>
}

class PayPalService {
  -_httpClient : HttpClient
  +CreateOrderAsync() : Task<string>
  +CaptureOrderAsync() : Task<PayPalCaptureResult>
  +RefundAsync() : Task
}

class GoogleCalendarSyncJob {
  -_mediator : IMediator
  -_db : IApplicationDbContext
  +ExecuteAsync() : Task
}

IGoogleCalendarService <|.. GoogleCalendarService
IVideoCallService <|.. VideoCallService
IInstagramService <|.. InstagramService
IPaymentService <|.. StripePaymentService
IPayPalService <|.. PayPalService

@enduml
```

### API -- Integration Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class IntegrationsController <<ApiController>> {
  -_mediator : IMediator
  +GetStatus() : IActionResult
  +ConnectGoogleCalendar(cmd) : IActionResult
  +DisconnectGoogleCalendar() : IActionResult
  +ConnectZoom(cmd) : IActionResult
  +DisconnectZoom() : IActionResult
  +ConfigureGoogleAnalytics(cmd) : IActionResult
  +ConfigureFacebookPixel(cmd) : IActionResult
  +ConnectInstagram(cmd) : IActionResult
  +DisconnectInstagram() : IActionResult
  +UpdateInstagramFeedConfig(cmd) : IActionResult
  +ConnectStripe(cmd) : IActionResult
  +DisconnectStripe() : IActionResult
  +ConfigurePayPal(cmd) : IActionResult
}

class IntegrationsOAuthController <<ApiController>> {
  -_mediator : IMediator
  +GoogleCallback(code, state) : IActionResult
  +ZoomCallback(code, state) : IActionResult
  +InstagramCallback(code, state) : IActionResult
  +StripeCallback(code, state) : IActionResult
}

IntegrationsController --> "IMediator" : sends commands/queries
IntegrationsOAuthController --> "IMediator" : sends commands

@enduml
```

---

## Sequence Diagrams

### Connect Google Calendar (OAuth Flow)

```plantuml
@startuml
actor Photographer as P
participant "IntegrationsOAuthController" as OC
participant "MediatR" as M
participant "ConnectGoogleCalendarHandler" as H
participant "Google OAuth" as G
participant "IApplicationDbContext" as DB
participant "SyncGoogleCalendarHandler" as SH
participant "IGoogleCalendarService" as GCS

P -> OC : GET /api/integrations/oauth/google/callback\n?code=AUTH_CODE&state=...
OC -> M : Send(ConnectGoogleCalendarCommand)
M -> H : Handle(command)
H -> G : Exchange authorization code\nfor access + refresh tokens
G --> H : tokens
H -> H : Encrypt and store tokens
H -> DB : Photographer.GoogleCalendarId = primary calendar
H -> DB : SaveChangesAsync()
H -> M : Send(SyncGoogleCalendarCommand)
M -> SH : Handle(sync command)
SH -> GCS : GetEventsAsync(calendarId, now, +90 days)
GCS --> SH : existing events
SH -> DB : Reconcile with local bookings
SH -> DB : SaveChangesAsync()
SH --> M : Result.Success
H --> M : Result.Success(IntegrationStatusDto)
M --> OC : Result.Success
OC --> P : 200 OK + redirect to settings
@enduml
```

### Two-Way Google Calendar Sync (Background Job)

```plantuml
@startuml
participant "GoogleCalendarSyncJob" as Job
participant "IApplicationDbContext" as DB
participant "IGoogleCalendarService" as GCS
participant "MediatR" as M

Job -> DB : Get all Photographers\nwhere GoogleCalendarId != null
DB --> Job : photographers[]

loop for each photographer
  Job -> GCS : GetEventsAsync(calendarId,\nlastSync, now)
  GCS --> Job : remoteEvents[]

  Job -> DB : Get BookingRecords\nwhere UpdatedAt > lastSync
  DB --> Job : localBookings[]

  loop remote events not in local
    alt event is busy (blocks slots)
      Job -> DB : Mark time as unavailable
    else event matches booking pattern
      Job -> DB : Create/update BookingRecord
    end
  end

  loop local bookings not synced
    Job -> GCS : CreateEventAsync(calendarId,\ntitle, start, end, clientEmail)
    GCS --> Job : eventId
    Job -> DB : booking.GoogleCalendarEventId = eventId
  end

  loop local bookings updated
    Job -> GCS : UpdateEventAsync(calendarId,\neventId, title, start, end)
  end

  Job -> DB : SaveChangesAsync()
end
@enduml
```

### Auto-Generate Video Call Link on Booking Confirmation

```plantuml
@startuml
actor Photographer as P
participant "BookingController" as BC
participant "MediatR" as M
participant "ConfirmBookingHandler" as H
participant "IApplicationDbContext" as DB
participant "IVideoCallService" as VCS
participant "IGoogleCalendarService" as GCS

P -> BC : PUT /api/bookings/{id}/confirm
BC -> M : Send(ConfirmBookingCommand)
M -> H : Handle(command)
H -> DB : Get BookingRecord with SessionType
DB --> H : booking + sessionType

H -> H : booking.Status = Confirmed

alt sessionType.VideoCallType == "Zoom"
  H -> DB : Get Photographer.ZoomAccountId
  H -> VCS : CreateZoomMeetingAsync(\nzoomAccountId, topic, startTime, duration)
  VCS --> H : VideoMeetingLink
  H -> H : booking.VideoCallLink = link.MeetingUrl
else sessionType.VideoCallType == "GoogleMeet"
  H -> DB : Get Photographer.GoogleCalendarId
  H -> VCS : CreateGoogleMeetAsync(\ncalendarId, topic, startTime, duration, clientEmail)
  VCS --> H : VideoMeetingLink
  H -> H : booking.VideoCallLink = link.MeetingUrl
end

alt Photographer.GoogleCalendarId != null
  H -> GCS : CreateEventAsync(calendarId,\nsessionType.Name, start, end, clientEmail)
  GCS --> H : eventId
  H -> H : booking.GoogleCalendarEventId = eventId
end

H -> DB : SaveChangesAsync()
H --> M : Result.Success(BookingDto)
M --> BC : Result.Success
BC --> P : 200 OK {BookingDto with videoCallLink}
@enduml
```

### Configure Analytics Integration (GA4 / Facebook Pixel)

```plantuml
@startuml
actor Photographer as P
participant "IntegrationsController" as IC
participant "MediatR" as M
participant "ConfigureGAHandler" as GAH
participant "ICurrentUserService" as US
participant "IApplicationDbContext" as DB

== Configure Google Analytics GA4 ==
P -> IC : PUT /api/integrations/google-analytics\n{measurementId: "G-XXXXXXXXXX"}
IC -> M : Send(ConfigureGoogleAnalyticsCommand)
M -> GAH : Handle(command)
GAH -> US : PhotographerId
US --> GAH : Guid
GAH -> GAH : Validate Measurement ID format\n(starts with "G-")
GAH -> DB : Photographer.GoogleAnalyticsId = measurementId
GAH -> DB : SaveChangesAsync()
GAH --> M : Result.Success
M --> IC : Result.Success
IC --> P : 200 OK

== Configure Facebook Pixel ==
P -> IC : PUT /api/integrations/facebook-pixel\n{pixelId: "1234567890"}
IC -> M : Send(ConfigureFacebookPixelCommand)
M -> GAH : Handle(command)
GAH -> DB : Photographer.FacebookPixelId = pixelId
GAH -> DB : SaveChangesAsync()
GAH --> M : Result.Success
M --> IC : Result.Success
IC --> P : 200 OK

note over IC
  Client-facing pages automatically inject
  GA4/Pixel scripts at render time by
  reading these fields from the Photographer entity.
end note
@enduml
```

### Connect Instagram Feed

```plantuml
@startuml
actor Photographer as P
participant "IntegrationsOAuthController" as OC
participant "MediatR" as M
participant "ConnectInstagramHandler" as H
participant "Instagram API" as IG
participant "IApplicationDbContext" as DB

P -> OC : GET /api/integrations/oauth/instagram/callback\n?code=AUTH_CODE
OC -> M : Send(ConnectInstagramCommand)
M -> H : Handle(command)
H -> IG : Exchange short-lived token\nfor long-lived token (60 days)
IG --> H : longLivedToken
H -> DB : Photographer.InstagramAccessToken = encrypted(token)

H -> DB : Check for existing InstagramFeedConfig
alt not exists
  H -> DB : Create InstagramFeedConfig(\nnumberOfPosts=9, imageSize="medium",\nclickBehavior="open_instagram", isActive=true)
else exists
  H -> DB : config.IsActive = true
end

H -> DB : SaveChangesAsync()
H --> M : Result.Success
M --> OC : Result.Success
OC --> P : 302 Redirect to integration settings
@enduml
```

### Connect Stripe (OAuth Connect)

```plantuml
@startuml
actor Photographer as P
participant "IntegrationsOAuthController" as OC
participant "MediatR" as M
participant "ConnectStripeHandler" as H
participant "IPaymentService" as PS
participant "IApplicationDbContext" as DB

P -> OC : GET /api/integrations/oauth/stripe/callback\n?code=AUTH_CODE
OC -> M : Send(ConnectStripeCommand)
M -> H : Handle(command)
H -> DB : Get Photographer
DB --> H : photographer

alt photographer.StripeAccountId already set
  H --> M : Result.Failure("Stripe already connected")
  M --> OC : Result.Failure
  OC --> P : 409 Conflict
end

H -> PS : CreateConnectedAccountAsync(\nphotographer.Email, photographer.Country)
PS --> H : stripeAccountId
H -> DB : photographer.StripeAccountId = stripeAccountId
H -> DB : SaveChangesAsync()
H --> M : Result.Success
M --> OC : Result.Success
OC --> P : 302 Redirect to integration settings
@enduml
```

### Get All Integration Statuses

```plantuml
@startuml
actor Photographer as P
participant "IntegrationsController" as IC
participant "MediatR" as M
participant "GetIntegrationsStatusHandler" as H
participant "ICurrentUserService" as US
participant "IApplicationDbContext" as DB

P -> IC : GET /api/integrations/status
IC -> M : Send(GetIntegrationsStatusQuery)
M -> H : Handle(query)
H -> US : PhotographerId
US --> H : Guid
H -> DB : Get Photographer with\nall integration fields
DB --> H : photographer
H -> DB : Get InstagramFeedConfig
DB --> H : config (or null)

H -> H : Build IntegrationStatusDto[]\nfor each provider:\n- GoogleCalendar: connected if GoogleCalendarId set\n- Zoom: connected if ZoomAccountId set\n- GoogleMeet: connected if GoogleCalendarId set\n- GA4: connected if GoogleAnalyticsId set\n- FacebookPixel: connected if FacebookPixelId set\n- Instagram: connected if InstagramAccessToken set\n- Stripe: connected if StripeAccountId set\n- PayPal: connected if PayPalEmail set

H --> M : Result.Success(IntegrationStatusDto[])
M --> IC : Result.Success
IC --> P : 200 OK [{provider, isConnected, accountLabel}]
@enduml
```
