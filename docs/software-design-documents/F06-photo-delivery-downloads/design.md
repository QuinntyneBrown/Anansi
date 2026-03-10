# F06 - Photo Delivery & Downloads

## Overview

Photo Delivery & Downloads enables clients to download individual photos or entire galleries from a photographer's collection. The system supports multiple resolution tiers: web sizes (640px, 1024px, 2048px long edge) available to all plans, and high-resolution options (3600px and original) gated by plan tier (Pro/Ultimate). When multiple images are requested, the system packages them into a ZIP archive for a single download.

Security and control are central to this feature. Photographers can protect downloads with a 4-digit PIN that is auto-generated per collection but remains editable and optionally disableable. Per-collection download limits allow photographers to cap the total number of photos downloaded, with the ability to reset or modify the limit at any time. These controls operate independently of gallery password protection.

For large galleries, the system processes downloads asynchronously. When a ZIP file requires extended preparation time, the client can leave the browser and later receives an email notification containing a time-limited download link (7-day expiry). All download activity is tracked with full attribution (who, when, what resolution, individual vs. full gallery), filterable by date range and action type, and exportable as CSV for the photographer's records.

## Requirements Traceability

| Requirement | Description |
|---|---|
| GAL-1.4.1 | Download Options (individual/full, multiple resolutions, ZIP packaging) |
| GAL-1.4.2 | Download PIN (4-digit, auto-generated, editable, optional) |
| GAL-1.4.3 | Download Limits (configurable per-collection, resettable) |
| GAL-1.4.4 | Async Download with Notification (background ZIP, email link, 7-day expiry) |
| GAL-1.4.5 | Download Activity Tracking (who/when/what, filtering, CSV export) |

## Components

### Domain Layer

**DownloadRequest** (Entity) — Represents a single download request from a client. Tracks the collection, who requested it, the chosen resolution, whether it is a full-gallery or individual-photo download, the list of selected media IDs, the ZIP storage key once built, readiness status, expiry date, and whether the notification email has been sent. Implements `ITenantEntity` for multi-tenant scoping via `PhotographerId`.

**Collection** (Entity, existing) — Extended with download-related properties: `DownloadsEnabled`, `DownloadPin`, `DownloadPinEnabled`, `DownloadLimit`, `DownloadCount`, and `AllowedResolutions` (comma-separated string of permitted `DownloadResolution` values).

**GalleryActivity** (Entity, existing) — Records download events with `ActivityType.Download`. Captures actor name/email, resolution, full-gallery flag, and descriptive details text.

**DownloadResolution** (Enum) — `Web640`, `Web1024`, `Web2048`, `High3600`, `Original`.

### Application Layer

**RequestDownloadCommand** — CQRS command that validates the PIN, checks download limits, verifies the requested resolution is allowed, creates a `DownloadRequest`, increments `DownloadCount`, logs a `GalleryActivity`, and enqueues background ZIP generation for multi-image downloads.

**GetDownloadStatusQuery** — Returns the current state of a `DownloadRequest` so the client can poll or check readiness.

**ListDownloadActivityQuery** — Paginated query over `GalleryActivities` filtered to `ActivityType.Download`, with optional date range filters. Photographer-only (requires `ICurrentUserService` authentication).

**ResetDownloadLimitCommand** — Allows the photographer to reset the download counter to zero and optionally set a new limit.

**ExportDownloadActivityQuery** — Generates a CSV byte stream of download activity records for a given collection and date range.

**IImageResizeService** (Interface) — Abstracts image resizing to the requested long-edge dimension. Implemented in Infrastructure.

**IZipArchiveService** (Interface) — Abstracts ZIP file creation from a list of storage keys. Implemented in Infrastructure.

**DownloadRequestDto** — Read model returned to the API layer.

**GalleryActivityDto** — Read model for activity records (shared across features).

### Infrastructure Layer

**ImageResizeService** — Uses a library such as ImageSharp to resize images to the target long-edge resolution, preserving aspect ratio and EXIF orientation.

**ZipArchiveService** — Streams images from blob storage into a ZIP archive and uploads the result back to storage, returning the storage key.

**DownloadBackgroundJob** — A background worker (Hangfire or .NET `BackgroundService`) that picks up pending `DownloadRequest` records, invokes `IImageResizeService` and `IZipArchiveService`, marks the request as ready, and triggers notification via `IEmailService`.

### API Layer

**DownloadsController** — Exposes endpoints for requesting a download, polling status, retrieving the file (presigned URL redirect), listing activity, resetting limits, and exporting activity as CSV.

## Class Diagrams

### Domain Layer - Download Entities

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

class DownloadRequest {
  +PhotographerId : Guid
  +CollectionId : Guid
  +RequestedBy : string?
  +RequestedByEmail : string?
  +Resolution : DownloadResolution
  +IsFullGallery : bool
  +MediaIds : string?
  +ZipStorageKey : string?
  +IsReady : bool
  +ReadyAt : DateTime?
  +ExpiresAt : DateTime?
  +NotificationSent : bool
}

class Collection {
  +DownloadsEnabled : bool
  +DownloadPin : string?
  +DownloadPinEnabled : bool
  +DownloadLimit : int?
  +DownloadCount : int
  +AllowedResolutions : string
}

class GalleryActivity {
  +PhotographerId : Guid
  +CollectionId : Guid
  +ActivityType : ActivityType
  +ActorName : string?
  +ActorEmail : string?
  +MediaId : Guid?
  +Resolution : DownloadResolution?
  +IsFullGallery : bool?
  +Details : string?
}

enum DownloadResolution {
  Web640
  Web1024
  Web2048
  High3600
  Original
}

BaseEntity <|-- DownloadRequest
BaseEntity <|-- GalleryActivity
Collection "1" --> "*" DownloadRequest : DownloadRequests
Collection "1" --> "*" GalleryActivity : Activities
DownloadRequest --> DownloadResolution
GalleryActivity --> DownloadResolution

@enduml
```

![Domain Layer - Download Entities](domain-layer-download-entities.png)

### Application Layer - Commands, Queries, and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class RequestDownloadCommand <<Command>> {
  +CollectionId : Guid
  +Resolution : DownloadResolution
  +IsFullGallery : bool
  +MediaIds : List<Guid>?
  +Pin : string?
  +RequestedBy : string?
  +RequestedByEmail : string?
}

class RequestDownloadHandler <<Handler>> {
  -_db : IApplicationDbContext
  +Handle() : Result<DownloadRequestDto>
}

class GetDownloadStatusQuery <<Query>> {
  +DownloadRequestId : Guid
}

class ListDownloadActivityQuery <<Query>> {
  +CollectionId : Guid
  +From : DateTime?
  +To : DateTime?
  +Page : int
  +PageSize : int
}

class ResetDownloadLimitCommand <<Command>> {
  +CollectionId : Guid
  +NewLimit : int?
}

class ExportDownloadActivityQuery <<Query>> {
  +CollectionId : Guid
  +From : DateTime?
  +To : DateTime?
}

class DownloadRequestDto <<DTO>> {
  +Id : Guid
  +CollectionId : Guid
  +RequestedBy : string?
  +Resolution : DownloadResolution
  +IsFullGallery : bool
  +IsReady : bool
  +ExpiresAt : DateTime?
}

interface IImageResizeService <<Interface>> {
  +ResizeAsync(storageKey, resolution) : Stream
}

interface IZipArchiveService <<Interface>> {
  +CreateZipAsync(storageKeys) : string
}

RequestDownloadHandler ..> RequestDownloadCommand
RequestDownloadHandler ..> DownloadRequestDto
RequestDownloadHandler --> IImageResizeService
RequestDownloadHandler --> IZipArchiveService

@enduml
```

![Application Layer - Commands, Queries, and Services](application-layer-commands-queries-and-services.png)

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class DownloadsController <<Controller>> {
  +RequestDownload() : ActionResult
  +GetStatus() : ActionResult
  +GetFile() : ActionResult
  +ListActivity() : ActionResult
  +ResetLimit() : ActionResult
  +ExportActivityCsv() : ActionResult
}

class ImageResizeService <<Service>> {
  +ResizeAsync(storageKey, resolution) : Stream
}

class ZipArchiveService <<Service>> {
  +CreateZipAsync(storageKeys) : string
}

class DownloadBackgroundJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_imageResize : IImageResizeService
  -_zip : IZipArchiveService
  -_email : IEmailService
  -_storage : IStorageService
  +ProcessPendingDownloads() : Task
}

interface IImageResizeService <<Interface>>
interface IZipArchiveService <<Interface>>
interface IStorageService <<Interface>>
interface IEmailService <<Interface>>

ImageResizeService ..|> IImageResizeService
ZipArchiveService ..|> IZipArchiveService
DownloadBackgroundJob --> IImageResizeService
DownloadBackgroundJob --> IZipArchiveService
DownloadBackgroundJob --> IStorageService
DownloadBackgroundJob --> IEmailService
DownloadsController ..> RequestDownloadCommand
DownloadsController ..> GetDownloadStatusQuery
DownloadsController ..> ListDownloadActivityQuery

@enduml
```

![Infrastructure & API Layer](infrastructure-api-layer.png)

## Sequence Diagrams

### Request Individual Photo Download

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "DownloadsController" as API
participant "RequestDownloadHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage

Client -> API : POST /api/collections/{id}/downloads\n{resolution, mediaIds, pin}
API -> Handler : Send(RequestDownloadCommand)

Handler -> DB : Find Collection by Id
DB --> Handler : Collection

Handler -> Handler : Validate PIN matches
Handler -> Handler : Check DownloadCount < DownloadLimit
Handler -> Handler : Verify resolution is allowed

Handler -> DB : Create DownloadRequest
Handler -> DB : Increment Collection.DownloadCount
Handler -> DB : Create GalleryActivity (Download)
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<DownloadRequestDto>

note right of Handler
  For single-image downloads,
  the file is served immediately
  via a presigned URL.
end note

Client -> API : GET /api/downloads/{id}/file
API -> Storage : GetPresignedUrlAsync(storageKey)
Storage --> API : Presigned URL
API --> Client : 302 Redirect to presigned URL

@enduml
```

![Request Individual Photo Download](request-individual-photo-download.png)

### Async Full Gallery Download with Email Notification

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "DownloadsController" as API
participant "RequestDownloadHandler" as Handler
participant "IApplicationDbContext" as DB
participant "DownloadBackgroundJob" as Job
participant "IImageResizeService" as Resize
participant "IZipArchiveService" as Zip
participant "IStorageService" as Storage
participant "IEmailService" as Email

Client -> API : POST /api/collections/{id}/downloads\n{resolution, isFullGallery: true, pin}
API -> Handler : Send(RequestDownloadCommand)
Handler -> DB : Validate PIN, limits, resolution
Handler -> DB : Create DownloadRequest (IsReady=false)
Handler -> DB : Increment DownloadCount
Handler -> DB : Create GalleryActivity
Handler -> DB : SaveChangesAsync()
Handler --> API : DownloadRequestDto (IsReady=false)
API --> Client : 202 Accepted {downloadRequestId}

... Background processing ...

Job -> DB : Query pending DownloadRequests
DB --> Job : DownloadRequest (IsReady=false)
Job -> DB : Load GalleryMedia for collection
DB --> Job : List<GalleryMedia>

loop For each media item
  Job -> Storage : DownloadAsync(storageKey)
  Storage --> Job : Stream
  Job -> Resize : ResizeAsync(stream, resolution)
  Resize --> Job : Resized Stream
end

Job -> Zip : CreateZipAsync(resized streams)
Zip -> Storage : UploadAsync(zip stream)
Storage --> Zip : zipStorageKey
Zip --> Job : zipStorageKey

Job -> DB : Update DownloadRequest\n(ZipStorageKey, IsReady=true, ReadyAt)
Job -> Storage : GetPresignedUrlAsync(zipStorageKey, 7 days)
Storage --> Job : Download URL
Job -> Email : SendAsync(clientEmail, downloadUrl)
Job -> DB : Set NotificationSent = true
Job -> DB : SaveChangesAsync()

... Client receives email ...

Client -> API : GET /api/downloads/{id}/file
API -> DB : Find DownloadRequest
API -> Storage : GetPresignedUrlAsync(zipStorageKey)
Storage --> API : Presigned URL
API --> Client : 302 Redirect

@enduml
```

![Async Full Gallery Download with Email Notification](async-full-gallery-download-with-email-notification.png)

### Reset Download Limit

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "DownloadsController" as API
participant "ResetDownloadLimitHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : PUT /api/collections/{id}/download-limit\n{newLimit: 100}
API -> Handler : Send(ResetDownloadLimitCommand)

Handler -> Handler : Verify PhotographerId from ICurrentUserService
Handler -> DB : Find Collection by Id & PhotographerId
DB --> Handler : Collection

Handler -> Handler : Set DownloadLimit = 100
Handler -> Handler : Set DownloadCount = 0
Handler -> DB : SaveChangesAsync()

Handler --> API : Result.Success()
API --> Photographer : 200 OK

@enduml
```

![Reset Download Limit](reset-download-limit.png)

### Export Download Activity as CSV

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "DownloadsController" as API
participant "ExportDownloadActivityHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/collections/{id}/downloads/export?from=...&to=...
API -> Handler : Send(ExportDownloadActivityQuery)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Query GalleryActivities\n(CollectionId, Download type, date range)
DB --> Handler : List<GalleryActivity>

Handler -> Handler : Build CSV rows:\nName, Email, Resolution, Type, Timestamp

Handler --> API : Result<byte[]> (CSV content)
API --> Photographer : 200 OK\nContent-Type: text/csv\nContent-Disposition: attachment

@enduml
```

![Export Download Activity as CSV](export-download-activity-as-csv.png)
