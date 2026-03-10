# F22 - Website Analytics

## Overview

This feature delivers both built-in and third-party analytics capabilities for photographer websites. Built-in analytics (available on Plus and Pro plans) collect visitor data -- total visitors, unique visitors, page views, geographic distribution, session duration, and top pages -- and surface it through a filterable dashboard that updates within 24 hours of activity. Data is aggregated into daily `WebsiteAnalyticsSnapshot` records to keep query performance predictable and storage efficient.

Third-party analytics integration is configuration-only: photographers enter their Google Analytics GA4 Measurement ID or Facebook Pixel ID, and the platform injects the corresponding tracking scripts into every page of their website automatically. No manual code injection is required. The GA4 integration activates standard page-view tracking across all pages; the Facebook Pixel integration fires the standard `PageView` event on every page load.

The analytics pipeline consists of three layers: a lightweight event collector that records raw page hits, a background aggregation service that rolls raw events into daily snapshots, and a query layer that serves the dashboard with date-range filtering. Raw events are retained for a configurable window (default 90 days) before being pruned. Third-party script injection is handled by the `SiteRenderMiddleware` at request time, reading the measurement/pixel IDs from the `Website` entity.

**L2 Requirements:** WEB-3.7.1 (Built-In Analytics), WEB-3.7.2 (Google Analytics Integration), WEB-3.7.3 (Facebook Pixel Integration)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `WebsiteAnalyticsSnapshot` | Entity | Daily aggregate of visitor metrics: `TotalVisitors`, `UniqueVisitors`, `PageViews`, `AverageSessionDurationSeconds`, `GeographicDistributionJson`, `TopPagesJson`. Keyed by `WebsiteId` and `Date`. Implements `ITenantEntity`. |
| `AnalyticsPageHit` | Entity | Raw page-view event: `WebsiteId`, `PagePath`, `VisitorFingerprint`, `IpAddress`, `UserAgent`, `CountryCode`, `SessionId`, `Timestamp`. Used for aggregation, then pruned. |
| `Website` | Entity (existing) | Stores `BuiltInAnalyticsEnabled`, `GoogleAnalyticsMeasurementId`, and `FacebookPixelId`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `RecordPageHitCommand` | Command | Receives a raw page-view event from the collector endpoint. Writes an `AnalyticsPageHit` record. Runs without authentication (public-facing). |
| `GetAnalyticsDashboardQuery` | Query | Returns aggregated analytics for a website within a date range. Queries `WebsiteAnalyticsSnapshot` records and computes totals/averages. |
| `GetTopPagesQuery` | Query | Returns the top N pages by view count for a date range. |
| `GetGeographicDistributionQuery` | Query | Returns visitor distribution by country/region for a date range. |
| `UpdateGoogleAnalyticsCommand` | Command | Sets or clears the `GoogleAnalyticsMeasurementId` on the `Website` entity. |
| `UpdateFacebookPixelCommand` | Command | Sets or clears the `FacebookPixelId` on the `Website` entity. |
| `ToggleBuiltInAnalyticsCommand` | Command | Enables or disables built-in analytics. Validates that the photographer's plan supports it (Plus/Pro). |
| `IAnalyticsAggregationService` | Interface | Aggregates raw `AnalyticsPageHit` records into `WebsiteAnalyticsSnapshot` records. Methods: `AggregateAsync(date)`, `PruneRawEventsAsync(retentionDays)`. |
| `IGeoLocationService` | Interface | Resolves IP addresses to country codes. Method: `ResolveCountryAsync(ipAddress)`. |
| `IPlanGateService` | Interface | Validates plan-tier access to built-in analytics. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `RecordPageHitHandler` | Handler | Resolves country from IP via `IGeoLocationService`, generates visitor fingerprint from IP + UserAgent hash, writes `AnalyticsPageHit`. |
| `GetAnalyticsDashboardHandler` | Handler | Queries `WebsiteAnalyticsSnapshot` for the date range, sums totals, computes weighted average session duration. |
| `AnalyticsAggregationService` | Service | Implements `IAnalyticsAggregationService`. Groups raw events by date, computes unique visitors (distinct fingerprints), page views, session durations, top pages, and geographic distribution. Creates/updates `WebsiteAnalyticsSnapshot`. |
| `AnalyticsAggregationBackgroundService` | Background Service | Runs daily (or more frequently). Invokes `AggregateAsync` for the previous day, then `PruneRawEventsAsync`. |
| `GeoLocationService` | Service | Implements `IGeoLocationService`. Uses MaxMind GeoLite2 or similar IP-to-country database. |
| `AnalyticsPageHitConfiguration` | EF Config | Configures `AnalyticsPageHit` table with indexes on `WebsiteId`, `Timestamp`, and composite index on `(WebsiteId, Date)` for efficient aggregation. |
| `WebsiteAnalyticsSnapshotConfiguration` | EF Config | Configures unique constraint on `(WebsiteId, Date)`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `AnalyticsCollectorController` | Controller | Public endpoint: `POST /api/collect` -- receives page-hit events from the tracking script embedded in websites. Rate-limited. No authentication required. |
| `AnalyticsDashboardController` | Controller | Authenticated endpoints: `GET /api/websites/{id}/analytics` (dashboard), `GET /api/websites/{id}/analytics/top-pages`, `GET /api/websites/{id}/analytics/geo`. All accept `startDate` and `endDate` query parameters. Require `[Authorize]`. |
| `AnalyticsSettingsController` | Controller | Authenticated endpoints: `PUT /api/websites/{id}/analytics/builtin` (toggle), `PUT /api/websites/{id}/analytics/google` (set GA4 ID), `PUT /api/websites/{id}/analytics/facebook` (set Pixel ID). Require `[Authorize]`. |
| `SiteRenderMiddleware` (extended) | Middleware | When rendering website pages, injects: (1) built-in tracking script that posts to `/api/collect`, (2) GA4 `gtag.js` script if `GoogleAnalyticsMeasurementId` is set, (3) Facebook Pixel `fbq` script if `FacebookPixelId` is set. |

---

## Class Diagrams

### Domain Layer -- Analytics Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class WebsiteAnalyticsSnapshot {
  +Id : Guid
  +PhotographerId : Guid
  +WebsiteId : Guid
  +Date : DateTime
  +TotalVisitors : int
  +UniqueVisitors : int
  +PageViews : int
  +AverageSessionDurationSeconds : double
  +GeographicDistributionJson : string?
  +TopPagesJson : string?
}

class AnalyticsPageHit {
  +Id : Guid
  +WebsiteId : Guid
  +PagePath : string
  +VisitorFingerprint : string
  +IpAddress : string
  +UserAgent : string?
  +CountryCode : string?
  +SessionId : string
  +Timestamp : DateTime
}

class Website {
  +Id : Guid
  +BuiltInAnalyticsEnabled : bool
  +GoogleAnalyticsMeasurementId : string?
  +FacebookPixelId : string?
}

Website "1" --> "*" WebsiteAnalyticsSnapshot : AnalyticsSnapshots
Website "1" --> "*" AnalyticsPageHit : PageHits
@enduml
```

![Domain Layer -- Analytics Entities](domain-layer-analytics-entities.png)

### Application Layer -- Analytics Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Analytics.Commands" {
  class RecordPageHitCommand <<record>> {
    +WebsiteId : Guid
    +PagePath : string
    +IpAddress : string
    +UserAgent : string?
    +SessionId : string
  }

  class UpdateGoogleAnalyticsCommand <<record>> {
    +WebsiteId : Guid
    +MeasurementId : string?
  }

  class UpdateFacebookPixelCommand <<record>> {
    +WebsiteId : Guid
    +PixelId : string?
  }

  class ToggleBuiltInAnalyticsCommand <<record>> {
    +WebsiteId : Guid
    +Enabled : bool
  }
}

package "Features.Analytics.Queries" {
  class GetAnalyticsDashboardQuery <<record>> {
    +WebsiteId : Guid
    +StartDate : DateTime
    +EndDate : DateTime
  }

  class AnalyticsDashboardDto <<record>> {
    +TotalVisitors : int
    +UniqueVisitors : int
    +PageViews : int
    +AverageSessionDuration : double
    +DailySnapshots : List<DailySnapshot>
  }

  class GetTopPagesQuery <<record>> {
    +WebsiteId : Guid
    +StartDate : DateTime
    +EndDate : DateTime
    +Top : int
  }

  class GetGeographicDistributionQuery <<record>> {
    +WebsiteId : Guid
    +StartDate : DateTime
    +EndDate : DateTime
  }
}

interface IGeoLocationService {
  +ResolveCountryAsync(ip) : string?
}

interface IAnalyticsAggregationService {
  +AggregateAsync(date) : Task
  +PruneRawEventsAsync(days) : Task
}

interface IPlanGateService {
  +HasFeatureAsync(feature) : bool
}

RecordPageHitCommand ..> IGeoLocationService : resolves country
ToggleBuiltInAnalyticsCommand ..> IPlanGateService : validates plan
@enduml
```

![Application Layer -- Analytics Commands & Queries](application-layer-analytics-commands-queries.png)

### Infrastructure Layer -- Aggregation & Geo Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface IAnalyticsAggregationService {
  +AggregateAsync(date) : Task
  +PruneRawEventsAsync(days) : Task
}

interface IGeoLocationService {
  +ResolveCountryAsync(ip) : string?
}

class AnalyticsAggregationService {
  -_dbContext : IApplicationDbContext
  +AggregateAsync(date) : Task
  +PruneRawEventsAsync(retentionDays) : Task
}

class GeoLocationService {
  -_geoDatabase : DatabaseReader
  +ResolveCountryAsync(ip) : string?
}

class AnalyticsAggregationBackgroundService {
  -_serviceScopeFactory : IServiceScopeFactory
  -_logger : ILogger
  +ExecuteAsync(ct) : Task
}

class RecordPageHitHandler {
  -_dbContext : IApplicationDbContext
  -_geoService : IGeoLocationService
  +Handle(cmd, ct) : Task
}

IAnalyticsAggregationService <|.. AnalyticsAggregationService
IGeoLocationService <|.. GeoLocationService
AnalyticsAggregationBackgroundService --> IAnalyticsAggregationService
RecordPageHitHandler --> IGeoLocationService
@enduml
```

![Infrastructure Layer -- Aggregation & Geo Services](infrastructure-layer-aggregation-geo-services.png)

### API Layer -- Analytics Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class AnalyticsCollectorController <<ApiController>> {
  -_mediator : IMediator
  +RecordHit(RecordPageHitCommand) : IActionResult
}

class AnalyticsDashboardController <<ApiController>> {
  -_mediator : IMediator
  +GetDashboard(websiteId, startDate, endDate) : IActionResult
  +GetTopPages(websiteId, startDate, endDate, top) : IActionResult
  +GetGeoDistribution(websiteId, startDate, endDate) : IActionResult
}

class AnalyticsSettingsController <<ApiController>> {
  -_mediator : IMediator
  +ToggleBuiltIn(websiteId, cmd) : IActionResult
  +SetGoogleAnalytics(websiteId, cmd) : IActionResult
  +SetFacebookPixel(websiteId, cmd) : IActionResult
}

note right of AnalyticsCollectorController
  Public endpoint. Rate-limited.
  No authentication required.
end note

note right of AnalyticsDashboardController
  [Authorize] required.
  Date range filtering via query params.
end note

AnalyticsCollectorController --> "IMediator" : sends commands
AnalyticsDashboardController --> "IMediator" : sends queries
AnalyticsSettingsController --> "IMediator" : sends commands
@enduml
```

![API Layer -- Analytics Controllers](api-layer-analytics-controllers.png)

---

## Sequence Diagrams

### Record Page Hit (Built-In Tracking)

```plantuml
@startuml
actor Visitor as V
participant "Website Page" as WP
participant "AnalyticsCollectorController" as AC
participant "MediatR" as M
participant "RecordPageHitHandler" as RH
participant "IGeoLocationService" as GEO
participant "ApplicationDbContext" as DB

V -> WP : Loads page
WP -> WP : Tracking script fires
WP -> AC : POST /api/collect\n{websiteId, pagePath, sessionId}
AC -> M : Send(RecordPageHitCommand)
M -> RH : Handle()
RH -> GEO : ResolveCountryAsync(ipAddress)
GEO --> RH : "CA" (Canada)
RH -> RH : Generate visitorFingerprint\n(hash of IP + UserAgent)
RH -> DB : Insert AnalyticsPageHit
DB --> RH : saved
RH --> M : success
M --> AC : result
AC --> WP : 204 No Content
@enduml
```

![Record Page Hit (Built-In Tracking)](record-page-hit-built-in-tracking.png)

### Daily Analytics Aggregation

```plantuml
@startuml
participant "AnalyticsAggregationBackgroundService" as BG
participant "IAnalyticsAggregationService" as AGG
participant "ApplicationDbContext" as DB

BG -> AGG : AggregateAsync(yesterday)

AGG -> DB : Query AnalyticsPageHit\nWHERE Date = yesterday\nGROUP BY WebsiteId
DB --> AGG : grouped raw events

loop for each website
  AGG -> AGG : Count TotalVisitors (all hits)
  AGG -> AGG : Count UniqueVisitors\n(distinct fingerprints)
  AGG -> AGG : Count PageViews
  AGG -> AGG : Compute avg session duration
  AGG -> AGG : Aggregate TopPages JSON
  AGG -> AGG : Aggregate GeographicDistribution JSON
  AGG -> DB : Upsert WebsiteAnalyticsSnapshot
  DB --> AGG : saved
end

AGG --> BG : aggregation complete

BG -> AGG : PruneRawEventsAsync(90)
AGG -> DB : DELETE AnalyticsPageHit\nWHERE Timestamp < NOW - 90 days
DB --> AGG : pruned
AGG --> BG : pruning complete
@enduml
```

![Daily Analytics Aggregation](daily-analytics-aggregation.png)

### View Analytics Dashboard

```plantuml
@startuml
actor Photographer as P
participant "AnalyticsDashboardController" as DC
participant "MediatR" as M
participant "GetAnalyticsDashboardHandler" as DH
participant "ApplicationDbContext" as DB

P -> DC : GET /api/websites/{id}/analytics\n?startDate=2026-02-01&endDate=2026-02-28
DC -> M : Send(GetAnalyticsDashboardQuery)
M -> DH : Handle()
DH -> DB : Query WebsiteAnalyticsSnapshot\nWHERE WebsiteId = {id}\nAND Date BETWEEN startDate AND endDate
DB --> DH : List<WebsiteAnalyticsSnapshot>
DH -> DH : Sum TotalVisitors, UniqueVisitors, PageViews
DH -> DH : Weighted average SessionDuration
DH -> DH : Map to AnalyticsDashboardDto
DH --> M : AnalyticsDashboardDto
M --> DC : result
DC --> P : 200 OK {totalVisitors, uniqueVisitors,\npageViews, avgSessionDuration, dailySnapshots[]}
@enduml
```

![View Analytics Dashboard](view-analytics-dashboard.png)

### Configure Google Analytics / Facebook Pixel

```plantuml
@startuml
actor Photographer as P
participant "AnalyticsSettingsController" as SC
participant "MediatR" as M
participant "UpdateGoogleAnalyticsHandler" as GH
participant "ApplicationDbContext" as DB

P -> SC : PUT /api/websites/{id}/analytics/google\n{measurementId: "G-XXXXXXXXXX"}
SC -> M : Send(UpdateGoogleAnalyticsCommand)
M -> GH : Handle()
GH -> DB : Load Website
DB --> GH : website
GH -> DB : Website.GoogleAnalyticsMeasurementId = "G-XXXXXXXXXX"
DB --> GH : saved
GH --> M : success
M --> SC : result
SC --> P : 200 OK

note over P
  SiteRenderMiddleware now injects
  gtag.js with the measurement ID
  on all website pages.
end note
@enduml
```

![Configure Google Analytics / Facebook Pixel](configure-google-analytics-facebook-pixel.png)
