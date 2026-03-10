# F38 - Watermarking

## Overview

Watermarking protects photographers' images displayed in client galleries by overlaying either text or image-based watermarks. Text watermarks support configurable content, font, opacity, scale, and position. Image watermarks accept an uploaded transparent PNG (typically a logo) with the same opacity, scale, and position controls. Photographers create named watermark presets, designate one as the default, and then toggle watermarking on or off per collection.

A critical design constraint is that watermarks are display-only: they are rendered server-side as an overlay composited onto the image at request time (or pre-composited and cached), but the original full-resolution files stored in blob storage remain untouched. When a client downloads the full-resolution image through the F06 download flow, the watermark is not applied. However, watermarks must be visible when images are shared to social media (via Open Graph / Twitter Card meta images), so the share-preview pipeline must serve watermarked variants.

Server-side watermark rendering uses a compositing pipeline in Infrastructure. When a gallery image is requested for display, the system checks whether the collection has watermarking enabled and which watermark preset is assigned. If active, the image is composited with the watermark overlay, cached on the CDN, and served. The cache key includes the watermark configuration hash so that changes to watermark settings automatically invalidate stale composites. This approach avoids client-side CSS overlays (which are trivially bypassed) and avoids permanently burning watermarks into source files.

**L2 Requirements:** BRD-7.2.1 (Text Watermarks), BRD-7.2.2 (Image Watermarks), BRD-7.2.3 (Per-Gallery Application)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Watermark` | Entity (existing) | Stores watermark presets: `Name`, `Type` (Text/Image), text content, font, image URL, `Opacity`, `Scale`, `Position`, `IsDefault`. Implements `ITenantEntity` and `ISoftDeletable`. |
| `WatermarkType` | Enum (existing) | `Text`, `Image`. |
| `WatermarkPosition` | Enum (existing) | `Center`, `TopLeft`, `TopCenter`, `TopRight`, `MiddleLeft`, `MiddleRight`, `BottomLeft`, `BottomCenter`, `BottomRight`. |
| `Collection` | Entity (existing) | Extended with `WatermarkId` (nullable Guid) and `WatermarkEnabled` (bool) to associate a watermark preset with a collection and toggle it. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateWatermarkCommand` | Command (existing) | Creates a named watermark preset. Validates required fields based on type (text content for Text, image URL for Image). Enforces opacity 0-1 range and positive scale. If `IsDefault`, clears other defaults. |
| `UpdateWatermarkCommand` | Command (existing) | Partially updates an existing watermark preset. Same validation rules. |
| `ListWatermarksQuery` | Query (existing) | Returns all watermarks for the photographer, ordered by default-first then name. |
| `DeleteWatermarkCommand` | Command (existing) | Soft-deletes a watermark. Collections referencing it retain the `WatermarkId` but watermarking becomes a no-op until reassigned. |
| `ApplyWatermarkToCollectionCommand` | Command | Sets `Collection.WatermarkId` and `Collection.WatermarkEnabled = true` for a given collection. Validates the watermark belongs to the same photographer. Invalidates CDN cache for that collection's images. |
| `RemoveWatermarkFromCollectionCommand` | Command | Sets `Collection.WatermarkEnabled = false` for a given collection. Invalidates CDN cache. |
| `GetWatermarkedImageQuery` | Query | Given a media ID and collection ID, resolves the watermark config, composites the overlay via `IWatermarkCompositorService`, and returns the composited image stream or a CDN URL. Used by gallery rendering and social share preview generation. |
| `WatermarkDto` | DTO (existing) | Read model: ID, name, type, text, font, image URL, opacity, scale, position, is default, created at. |
| `IWatermarkCompositorService` | Interface | Composites a watermark overlay onto an image. Accepts the source image stream, watermark configuration, and target dimensions. Returns a composited image stream. |
| `ICdnService` | Interface (existing) | Manages CDN cache invalidation and URL generation. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `WatermarkCompositorService` | Service | Implements `IWatermarkCompositorService`. Uses ImageSharp to overlay text (with font rendering) or image watermarks at the configured position, opacity, and scale. Caches the composited result in blob storage with a key derived from `{mediaId}-{watermarkConfigHash}`. |
| `WatermarkCacheInvalidationJob` | BackgroundJob | When a watermark preset is updated or a collection's watermark assignment changes, this job purges all cached composites for the affected collection's media from both blob storage and CDN edge caches. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `WatermarksController` | Controller | CRUD endpoints for watermark presets: `POST`, `PUT /{id}`, `GET` (list), `DELETE /{id}`. All require `[Authorize]`. |
| `CollectionWatermarkController` | Controller | Endpoints for per-collection watermark management: `PUT /api/collections/{id}/watermark` (apply), `DELETE /api/collections/{id}/watermark` (remove). |
| `GalleryImageController` | Controller (existing, extended) | The image-serving endpoint checks watermark configuration and returns the composited image for display, or the clean original for authorized full-resolution downloads. |

---

## Class Diagrams

### Domain Layer - Watermark Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class BaseEntity <<abstract>> {
  +Id : Guid
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

class Watermark {
  +PhotographerId : Guid
  +Name : string
  +Type : WatermarkType
  +Text : string?
  +FontFamily : string?
  +ImageUrl : string?
  +Opacity : double
  +Scale : double
  +Position : WatermarkPosition
  +IsDefault : bool
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

class Collection {
  +PhotographerId : Guid
  +Title : string
  +WatermarkId : Guid?
  +WatermarkEnabled : bool
}

enum WatermarkType {
  Text
  Image
}

enum WatermarkPosition {
  Center
  TopLeft
  TopCenter
  TopRight
  MiddleLeft
  MiddleRight
  BottomLeft
  BottomCenter
  BottomRight
}

BaseEntity <|-- Watermark
BaseEntity <|-- Collection
Watermark --> WatermarkType
Watermark --> WatermarkPosition
Collection "0..*" --> "0..1" Watermark : WatermarkId

@enduml
```

### Application Layer - Commands, Queries, and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CreateWatermarkCommand <<Command>> {
  +Name : string
  +Type : WatermarkType
  +Text : string?
  +FontFamily : string?
  +ImageUrl : string?
  +Opacity : double
  +Scale : double
  +Position : WatermarkPosition
  +IsDefault : bool
}

class UpdateWatermarkCommand <<Command>> {
  +WatermarkId : Guid
  +Name : string?
  +Text : string?
  +FontFamily : string?
  +ImageUrl : string?
  +Opacity : double?
  +Scale : double?
  +Position : WatermarkPosition?
  +IsDefault : bool?
}

class ApplyWatermarkToCollectionCommand <<Command>> {
  +CollectionId : Guid
  +WatermarkId : Guid
}

class RemoveWatermarkFromCollectionCommand <<Command>> {
  +CollectionId : Guid
}

class GetWatermarkedImageQuery <<Query>> {
  +MediaId : Guid
  +CollectionId : Guid
  +Width : int?
  +Height : int?
}

class WatermarkDto <<DTO>> {
  +Id : Guid
  +Name : string
  +Type : WatermarkType
  +Text : string?
  +FontFamily : string?
  +ImageUrl : string?
  +Opacity : double
  +Scale : double
  +Position : WatermarkPosition
  +IsDefault : bool
  +CreatedAt : DateTime
}

interface IWatermarkCompositorService <<Interface>> {
  +CompositeAsync(image, watermark, width, height) : Stream
}

interface ICdnService <<Interface>> {
  +InvalidateAsync(patterns) : Task
  +GetUrlAsync(key) : string
}

GetWatermarkedImageQuery --> IWatermarkCompositorService
ApplyWatermarkToCollectionCommand --> ICdnService

@enduml
```

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class WatermarksController <<Controller>> {
  +Create() : ActionResult
  +Update() : ActionResult
  +List() : ActionResult
  +Delete() : ActionResult
}

class CollectionWatermarkController <<Controller>> {
  +ApplyWatermark() : ActionResult
  +RemoveWatermark() : ActionResult
}

class WatermarkCompositorService <<Service>> {
  -_storage : IStorageService
  +CompositeAsync(image, watermark, w, h) : Stream
}

class WatermarkCacheInvalidationJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_storage : IStorageService
  -_cdn : ICdnService
  +InvalidateForWatermarkAsync(watermarkId) : Task
  +InvalidateForCollectionAsync(collectionId) : Task
}

interface IWatermarkCompositorService <<Interface>>
interface IStorageService <<Interface>>
interface ICdnService <<Interface>>

WatermarkCompositorService ..|> IWatermarkCompositorService
WatermarkCompositorService --> IStorageService
WatermarkCacheInvalidationJob --> IStorageService
WatermarkCacheInvalidationJob --> ICdnService

WatermarksController ..> CreateWatermarkCommand
WatermarksController ..> UpdateWatermarkCommand
CollectionWatermarkController ..> ApplyWatermarkToCollectionCommand
CollectionWatermarkController ..> RemoveWatermarkFromCollectionCommand

@enduml
```

---

## Sequence Diagrams

### Create Text Watermark

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "WatermarksController" as API
participant "CreateWatermarkHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/watermarks\n{name: "My Watermark", type: Text,\ntext: "Jane Doe Photography",\nfont: "Cormorant Garamond",\nopacity: 0.3, scale: 1.0,\nposition: BottomRight, isDefault: true}
API -> Handler : Send(CreateWatermarkCommand)

Handler -> Handler : Verify PhotographerId
Handler -> Handler : Validate: text not empty (Text type),\nopacity 0-1, scale > 0

alt IsDefault = true
  Handler -> DB : Find existing default watermarks
  DB --> Handler : List<Watermark> (defaults)
  Handler -> Handler : Clear IsDefault on each
end

Handler -> DB : Create Watermark entity
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<WatermarkDto>
API --> Photographer : 201 Created {id, name, type, settings}

@enduml
```

### Create Image Watermark (Logo Upload)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "WatermarksController" as API
participant "CreateWatermarkHandler" as Handler
participant "IStorageService" as Storage
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/watermarks\n{name: "Logo Mark", type: Image,\nimageUrl: (pre-uploaded URL),\nopacity: 0.5, scale: 0.8,\nposition: Center}
API -> Handler : Send(CreateWatermarkCommand)

Handler -> Handler : Verify PhotographerId
Handler -> Handler : Validate: imageUrl not empty (Image type),\nopacity 0-1, scale > 0

Handler -> DB : Create Watermark entity
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<WatermarkDto>
API --> Photographer : 201 Created {id, name, type: Image, imageUrl}

@enduml
```

### Apply Watermark to Collection

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "CollectionWatermarkController" as API
participant "ApplyWatermarkToCollectionHandler" as Handler
participant "IApplicationDbContext" as DB
participant "ICdnService" as CDN

Photographer -> API : PUT /api/collections/{collId}/watermark\n{watermarkId: "abc-123"}
API -> Handler : Send(ApplyWatermarkToCollectionCommand)

Handler -> Handler : Verify PhotographerId

Handler -> DB : Load Watermark by Id & PhotographerId
DB --> Handler : Watermark
Handler -> Handler : Verify watermark exists and belongs to photographer

Handler -> DB : Load Collection by Id & PhotographerId
DB --> Handler : Collection

Handler -> Handler : Set Collection.WatermarkId = watermarkId
Handler -> Handler : Set Collection.WatermarkEnabled = true
Handler -> DB : SaveChangesAsync()

Handler -> CDN : InvalidateAsync("collections/{collId}/images/*")
note right of CDN
  Purges all cached image
  variants for this collection
  so new requests will be
  composited with the watermark.
end note
CDN --> Handler : OK

Handler --> API : Result.Success()
API --> Photographer : 200 OK

@enduml
```

### Serve Watermarked Image (Gallery Display)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "GalleryImageController" as API
participant "GetWatermarkedImageHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage
participant "IWatermarkCompositorService" as Compositor
participant "ICdnService" as CDN

Client -> API : GET /api/galleries/{collId}/images/{mediaId}?w=1200
API -> Handler : Send(GetWatermarkedImageQuery)

Handler -> DB : Load Collection by Id
DB --> Handler : Collection

alt WatermarkEnabled = false or WatermarkId = null
  Handler -> Storage : GetPresignedUrlAsync(media.StorageKey)
  Storage --> Handler : cleanImageUrl
  Handler --> API : Redirect to clean image
else WatermarkEnabled = true
  Handler -> Handler : Compute cacheKey:\n{mediaId}-{watermarkId}-{configHash}-w1200

  Handler -> Storage : Check if cached composite exists
  Storage --> Handler : exists? (true/false)

  alt Cached composite found
    Handler -> CDN : GetUrlAsync(cacheKey)
    CDN --> Handler : cachedUrl
    Handler --> API : Redirect to cached URL
  else No cache, compose on the fly
    Handler -> DB : Load Watermark by Collection.WatermarkId
    DB --> Handler : Watermark

    Handler -> Storage : DownloadAsync(media.StorageKey)
    Storage --> Handler : originalImageStream

    Handler -> Compositor : CompositeAsync(\noriginalImageStream, watermark, 1200, null)
    note right of Compositor
      Text: renders text at position
      with font, opacity, scale.
      Image: overlays PNG at position
      with opacity, scale.
    end note
    Compositor --> Handler : compositedStream

    Handler -> Storage : UploadAsync(compositedStream, cacheKey)
    Storage --> Handler : compositeUrl

    Handler --> API : Redirect to composite URL
  end
end

API --> Client : 302 Redirect to image

@enduml
```

### Download Full-Res (No Watermark)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "DownloadsController" as API
participant "RequestDownloadHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage

Client -> API : POST /api/collections/{id}/downloads\n{resolution: Original, mediaIds: [...]}
API -> Handler : Send(RequestDownloadCommand)

Handler -> DB : Validate PIN, limits, resolution
Handler -> DB : Create DownloadRequest

note right of Handler
  Full-resolution downloads serve
  the ORIGINAL file from storage.
  The watermark is display-only
  and is NOT applied to downloads.
end note

Handler -> DB : SaveChangesAsync()
Handler --> API : DownloadRequestDto

Client -> API : GET /api/downloads/{id}/file
API -> Storage : GetPresignedUrlAsync(\nmedia.OriginalStorageKey)
note right of Storage
  Uses the original storage key,
  bypassing the watermark
  compositor entirely.
end note
Storage --> API : Presigned URL (clean original)
API --> Client : 302 Redirect to clean image

@enduml
```

### Social Share with Watermark

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor "Social Platform" as Social
participant "GalleryShareController" as API
participant "GetWatermarkedImageHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IWatermarkCompositorService" as Compositor
participant "IStorageService" as Storage

Social -> API : GET /api/galleries/{collId}/share/{mediaId}\n(Open Graph og:image URL)
API -> Handler : Send(GetWatermarkedImageQuery\n{mediaId, collectionId, width: 1200})

Handler -> DB : Load Collection
DB --> Handler : Collection (WatermarkEnabled = true)

Handler -> DB : Load Watermark
DB --> Handler : Watermark

Handler -> Storage : DownloadAsync(media.StorageKey)
Storage --> Handler : imageStream

Handler -> Compositor : CompositeAsync(imageStream, watermark, 1200, 630)
Compositor --> Handler : watermarkedStream

Handler -> Storage : UploadAsync(watermarkedStream, cacheKey)
Storage --> Handler : watermarkedUrl

Handler --> API : watermarkedUrl
API --> Social : 302 Redirect to watermarked image

note right of Social
  Social platforms crawl og:image
  and display the watermarked
  version, protecting the
  photographer's work.
end note

@enduml
```
