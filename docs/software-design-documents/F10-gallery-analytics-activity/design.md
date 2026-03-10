# F10 - Gallery Analytics & Activity

## Overview

Gallery Analytics & Activity provides photographers with a comprehensive view of how clients interact with their collections. Each collection has an Activities tab that aggregates four categories of events: download activity (who downloaded, when, what resolution, individual vs. full gallery), favorite activity (who favorited which photos, which list, any comments), private photo activity (which photos were marked private and by whom), and email registration activity (name, email, timestamp of visitors who registered). All activity records include timestamps, are filterable by event type and date range, and can be exported as CSV.

Beyond the built-in activity tracking, the platform integrates with Google Analytics GA4 to give photographers access to standard web analytics for their galleries. Photographers connect their GA4 property by entering their Measurement ID, and the system injects the GA4 tag into all client-facing gallery pages. Alternatively, server-side event tracking is supported via the GA4 Measurement Protocol for actions like downloads and favorites that occur through API calls rather than page views.

Together, these two layers give photographers both granular, action-level insight into client behavior (through the Activities tab) and aggregated web analytics (through GA4) covering page views, visitor counts, geographic distribution, and session duration.

## Requirements Traceability

| Requirement | Description |
|---|---|
| GAL-1.9.1 | Activities Tab (download, favorite, private photo, email registration activity, timestamps, filtering, CSV export) |
| GAL-1.9.2 | Google Analytics GA4 Integration (Measurement Protocol or tag injection, page views, visitors, geography, sessions) |

## Components

### Domain Layer

**GalleryActivity** (Entity, existing) — The central event record shared across all activity types. Stores `PhotographerId`, `CollectionId`, `ActivityType` (enum), actor name/email, optional `MediaId`, optional `FavoriteListId`, descriptive `Details` text, and download-specific fields (`Resolution`, `IsFullGallery`). Implements `ITenantEntity` for multi-tenant scoping.

**ActivityType** (Enum, existing) — `Download`, `Favorite`, `PrivatePhoto`, `EmailRegistration`, `Comment`, `View`.

**Collection** (Entity, existing) — Extended with `GoogleAnalyticsPropertyId` (nullable string) that stores the photographer's GA4 Measurement ID (e.g., `G-XXXXXXXXXX`).

**GalleryEmailRegistration** (Entity, existing) — Records from the email registration gate are surfaced in the activity tab alongside `GalleryActivity` records.

### Application Layer

**ListActivitiesQuery** — Unified paginated query over `GalleryActivities` for a given collection. Accepts optional filters: `ActivityType?` for type-based filtering and `From`/`To` date range. Returns `PagedList<GalleryActivityDto>`. Photographer-only (requires authentication).

**ExportActivitiesCsvQuery** — Generates a CSV byte array of all activity records for a collection, applying the same type and date range filters. Columns: Timestamp, Type, ActorName, ActorEmail, MediaId, FavoriteListId, Resolution, IsFullGallery, Details.

**GetActivitySummaryQuery** — Returns aggregate counts per activity type for a collection over a given date range. Useful for dashboard summary cards (e.g., "42 downloads, 18 favorites, 3 private, 12 registrations").

**SetGoogleAnalyticsCommand** — Sets or clears the `GoogleAnalyticsPropertyId` on a collection. Photographer-only.

**IGa4Service** (Interface) — Abstracts server-side GA4 event tracking via the Measurement Protocol. Methods for sending events like `download`, `favorite`, `view`, and `registration`.

**GalleryActivityDto** (DTO, existing) — Read model for a single activity record.

**ActivitySummaryDto** (DTO) — Aggregate counts per activity type.

### Infrastructure Layer

**Ga4TagInjectionMiddleware** — Middleware that inspects outgoing HTML responses for client-facing gallery pages. If the associated collection has a `GoogleAnalyticsPropertyId` set, the middleware injects the GA4 `gtag.js` script tag into the HTML `<head>`.

**Ga4MeasurementProtocolService** — Implements `IGa4Service`. Sends server-side events to the GA4 Measurement Protocol endpoint (`https://www.google-analytics.com/mp/collect`) using the collection's GA4 API secret and Measurement ID. Used for tracking API-driven events (downloads, favorites) that have no client-side page view.

**ActivityCsvExportService** — Utility for building CSV content from a list of `GalleryActivity` records. Could be inlined in the handler or extracted as a reusable service.

### API Layer

**ActivitiesController** — Exposes endpoints for listing activities (with filtering), exporting CSV, retrieving the activity summary, and configuring the GA4 integration.

## Class Diagrams

### Domain Layer - Activity Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class BaseEntity {
  +Id : Guid
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

class GalleryActivity {
  +PhotographerId : Guid
  +CollectionId : Guid
  +ActivityType : ActivityType
  +ActorName : string?
  +ActorEmail : string?
  +MediaId : Guid?
  +FavoriteListId : Guid?
  +Details : string?
  +Resolution : DownloadResolution?
  +IsFullGallery : bool?
}

class GalleryEmailRegistration {
  +PhotographerId : Guid
  +CollectionId : Guid
  +Name : string
  +Email : string
}

class Collection {
  +GoogleAnalyticsPropertyId : string?
}

enum ActivityType {
  Download
  Favorite
  PrivatePhoto
  EmailRegistration
  Comment
  View
}

BaseEntity <|-- GalleryActivity
BaseEntity <|-- GalleryEmailRegistration
Collection "1" --> "*" GalleryActivity : Activities
Collection "1" --> "*" GalleryEmailRegistration : EmailRegistrations
GalleryActivity --> ActivityType

@enduml
```

### Application Layer - Queries and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ListActivitiesQuery <<Query>> {
  +CollectionId : Guid
  +ActivityType : ActivityType?
  +From : DateTime?
  +To : DateTime?
  +Page : int
  +PageSize : int
}

class ExportActivitiesCsvQuery <<Query>> {
  +CollectionId : Guid
  +ActivityType : ActivityType?
  +From : DateTime?
  +To : DateTime?
}

class GetActivitySummaryQuery <<Query>> {
  +CollectionId : Guid
  +From : DateTime?
  +To : DateTime?
}

class SetGoogleAnalyticsCommand <<Command>> {
  +CollectionId : Guid
  +GoogleAnalyticsPropertyId : string?
}

class GalleryActivityDto <<DTO>> {
  +Id : Guid
  +CollectionId : Guid
  +ActivityType : ActivityType
  +ActorName : string?
  +ActorEmail : string?
  +MediaId : Guid?
  +FavoriteListId : Guid?
  +Details : string?
  +Resolution : DownloadResolution?
  +IsFullGallery : bool?
  +CreatedAt : DateTime
}

class ActivitySummaryDto <<DTO>> {
  +DownloadCount : int
  +FavoriteCount : int
  +PrivatePhotoCount : int
  +EmailRegistrationCount : int
  +CommentCount : int
  +ViewCount : int
}

interface IGa4Service <<Interface>> {
  +TrackEventAsync(propertyId, eventName, params) : Task
}

ListActivitiesQuery ..> GalleryActivityDto
GetActivitySummaryQuery ..> ActivitySummaryDto

@enduml
```

### Infrastructure Layer - GA4 Integration

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Ga4TagInjectionMiddleware <<Middleware>> {
  -_db : IApplicationDbContext
  +InvokeAsync(HttpContext) : Task
  -InjectGtagScript(html, propertyId) : string
}

class Ga4MeasurementProtocolService <<Service>> {
  -_httpClient : HttpClient
  -_config : Ga4Config
  +TrackEventAsync(propertyId, eventName, params) : Task
}

class Ga4Config <<Configuration>> {
  +ApiSecret : string
  +EndpointUrl : string
}

interface IGa4Service <<Interface>> {
  +TrackEventAsync(propertyId, eventName, params) : Task
}

interface IApplicationDbContext <<Interface>>

Ga4MeasurementProtocolService ..|> IGa4Service
Ga4TagInjectionMiddleware --> IApplicationDbContext
Ga4MeasurementProtocolService --> Ga4Config

@enduml
```

### API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ActivitiesController <<Controller>> {
  +ListActivities() : ActionResult
  +ExportCsv() : ActionResult
  +GetSummary() : ActionResult
  +SetGoogleAnalytics() : ActionResult
}

note right of ActivitiesController
  Route: /api/collections/{collectionId}/activities

  GET  /                     - List with filters
  GET  /export               - CSV download
  GET  /summary              - Aggregate counts
  PUT  /google-analytics     - Set GA4 property
end note

@enduml
```

## Sequence Diagrams

### List Collection Activities with Filtering

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ActivitiesController" as API
participant "ListActivitiesHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/collections/{id}/activities\n?type=Download&from=2026-01-01\n&to=2026-03-10&page=1&pageSize=50
API -> Handler : Send(ListActivitiesQuery)

Handler -> Handler : Verify PhotographerId\nfrom ICurrentUserService

Handler -> DB : Query GalleryActivities\nWhere CollectionId & PhotographerId
DB --> Handler : IQueryable

Handler -> Handler : Apply ActivityType filter\n(Download only)
Handler -> Handler : Apply date range filter\n(From, To)

Handler -> DB : Count total matching records
DB --> Handler : totalCount

Handler -> DB : OrderByDescending(CreatedAt)\nSkip/Take for pagination\nSelect to GalleryActivityDto
DB --> Handler : List<GalleryActivityDto>

Handler --> API : Result<PagedList<GalleryActivityDto>>
API --> Photographer : 200 OK\n{items, totalCount, page, totalPages}

@enduml
```

### Export Activities as CSV

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ActivitiesController" as API
participant "ExportActivitiesCsvHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/collections/{id}/activities/export\n?type=Favorite&from=2026-02-01
API -> Handler : Send(ExportActivitiesCsvQuery)

Handler -> Handler : Verify PhotographerId

Handler -> DB : Query GalleryActivities\nwith type and date filters
DB --> Handler : List<GalleryActivity>

Handler -> Handler : Build CSV header:\nTimestamp,Type,Name,Email,\nMediaId,FavoriteListId,\nResolution,IsFullGallery,Details

loop For each activity
  Handler -> Handler : Append CSV row
end

Handler --> API : Result<byte[]>
API --> Photographer : 200 OK\nContent-Type: text/csv\nContent-Disposition: attachment;\nfilename="activities_2026-02-01.csv"

@enduml
```

### Get Activity Summary

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ActivitiesController" as API
participant "GetActivitySummaryHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/collections/{id}/activities/summary\n?from=2026-01-01&to=2026-03-10
API -> Handler : Send(GetActivitySummaryQuery)

Handler -> Handler : Verify PhotographerId

Handler -> DB : Query GalleryActivities\nWhere CollectionId & PhotographerId\nGroupBy ActivityType\nSelect {ActivityType, Count}
DB --> Handler : Grouped counts

Handler -> Handler : Map to ActivitySummaryDto:\n- DownloadCount: 42\n- FavoriteCount: 18\n- PrivatePhotoCount: 3\n- EmailRegistrationCount: 12\n- CommentCount: 7\n- ViewCount: 256

Handler --> API : Result<ActivitySummaryDto>
API --> Photographer : 200 OK

@enduml
```

### Configure Google Analytics GA4

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ActivitiesController" as API
participant "SetGoogleAnalyticsHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : PUT /api/collections/{id}/activities/google-analytics\n{googleAnalyticsPropertyId: "G-ABC123XYZ"}
API -> Handler : Send(SetGoogleAnalyticsCommand)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Find Collection by Id & PhotographerId
DB --> Handler : Collection

Handler -> Handler : Validate GA4 property ID format\n(starts with "G-")

Handler -> Handler : Set GoogleAnalyticsPropertyId
Handler -> DB : SaveChangesAsync()

Handler --> API : Result.Success()
API --> Photographer : 200 OK

note right of Handler
  Once set, the Ga4TagInjection
  Middleware injects gtag.js into
  all client-facing pages for
  this collection.
end note

@enduml
```

### GA4 Tag Injection for Client Page Views

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Visitor
participant "Ga4TagInjectionMiddleware" as Middleware
participant "IApplicationDbContext" as DB
participant "Gallery Page Renderer" as Renderer

Visitor -> Middleware : GET /gallery/{slug}

Middleware -> DB : Find Collection by slug
DB --> Middleware : Collection

alt GoogleAnalyticsPropertyId is set
  Middleware -> Renderer : Proceed with request
  Renderer --> Middleware : HTML response

  Middleware -> Middleware : Inject into <head>:\n<script async src="gtag.js?id=G-..."></script>\n<script>gtag('config', 'G-...')</script>

  Middleware --> Visitor : Modified HTML with GA4 tag
else No GA4 configured
  Middleware -> Renderer : Proceed with request
  Renderer --> Middleware : HTML response
  Middleware --> Visitor : Unmodified HTML
end

@enduml
```

### Server-Side GA4 Event Tracking (Downloads)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "RequestDownloadHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IGa4Service" as GA4
participant "GA4 Measurement\nProtocol API" as Google

Handler -> DB : Create DownloadRequest\nand GalleryActivity
Handler -> DB : SaveChangesAsync()

Handler -> DB : Get Collection.GoogleAnalyticsPropertyId
DB --> Handler : propertyId

alt propertyId is set
  Handler -> GA4 : TrackEventAsync(propertyId,\n"file_download",\n{resolution, isFullGallery, mediaCount})

  GA4 -> Google : POST /mp/collect?measurement_id=G-...\n&api_secret=...\n{events: [{name: "file_download",\nparams: {...}}]}

  Google --> GA4 : 204 No Content
  GA4 --> Handler : Task completed
end

note right of GA4
  Server-side tracking captures
  API-driven events that have no
  browser page view (downloads,
  favorites added via API).
end note

@enduml
```
