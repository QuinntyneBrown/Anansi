# F03 - Media Upload & Processing

## Overview

This feature handles the entire lifecycle of media assets entering the Anansi platform: upload, validation, processing, storage, and delivery. Photographers upload photos and videos through a browser-based drag-and-drop interface that supports parallel uploads with per-file progress tracking and automatic retry on failure. Bulk folder upload preserves folder structure, automatically creating collections and sets from the directory hierarchy.

The system supports standard image formats (JPEG, PNG, GIF), RAW camera formats (CR2, CR3, NEF, ARW, DNG, RAF, ORF, RW2) on Pro/Ultimate plans, and video formats (MP4, MOV, AVI, M4V) up to 4K resolution with plan-dependent duration limits. Every upload passes through a validation pipeline that checks file format, file size (up to 50MB for images), video resolution limits, and plan-level storage quotas before accepting the file. RAW files are processed server-side to generate preview thumbnails while preserving the original for download.

After successful upload, server-side processing generates thumbnails at multiple resolutions, produces progressive-loading image sets (placeholder, low-res, full-res), and for videos, generates adaptive bitrate streaming manifests and allows custom thumbnail selection from extracted frames. All processed media is distributed through a CDN for fast global delivery. Storage usage is tracked on the `Photographer` entity and triggers warnings at configurable thresholds.

**L2 Requirements:** GAL-1.1.1 (Browser Drag-and-Drop Upload), GAL-1.1.2 (Bulk Folder Upload), GAL-1.1.4 (RAW File Support), GAL-1.1.5 (Video Upload), GAL-1.1.6 (File Validation), UX-11.3.3 (Content Delivery)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GalleryMedia` | Entity | Core media entity storing file metadata, storage keys, image EXIF data, video metadata, organization state (sort order, starred, private), and thumbnail references. Implements `ITenantEntity` and `ISoftDeletable`. |
| `Collection` | Entity | Parent container for media. Tracks cover photo, design settings, and aggregate state. |
| `CollectionSet` | Entity | Optional sub-group within a collection. Media can reference a set via `SetId`. |
| `MediaType` | Enum | `Jpeg`, `Png`, `Gif`, `Raw`, `Mp4`, `Mov`, `Avi`, `M4V` |
| `StorageWarningLevel` | Enum | `None`, `Warning80`, `Warning90`, `Critical95` |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `UploadMediaCommand` | Command | Accepts collection ID, optional set ID, file name, content type, file size, stream, and optional EXIF metadata. Returns the created `GalleryMediaDto`. |
| `BulkFolderUploadCommand` | Command | Accepts a folder structure descriptor (folder names with file lists). Creates collections and sets from folder hierarchy, then uploads each file. |
| `DeleteMediaCommand` | Command | Soft-deletes a media item and updates storage usage. |
| `MoveMediaCommand` | Command | Moves a media item to a different set within the same collection. |
| `ToggleStarMediaCommand` | Command | Toggles the `IsStarred` flag on a media item. |
| `BulkStarMediaCommand` | Command | Sets the `IsStarred` flag on multiple media items at once. |
| `ListMediaQuery` | Query | Paginated listing of media in a collection, filterable by set and starred status. |
| `IStorageService` | Interface | `UploadAsync`, `DownloadAsync`, `DeleteAsync`, `GetPresignedUrlAsync` for blob storage operations. |
| `ICdnService` | Interface | `GetCdnUrlAsync`, `GenerateThumbnailAsync`, `GenerateProgressiveImagesAsync`, `InvalidateCacheAsync` for CDN delivery and thumbnail generation. |
| `CheckFeatureAccessQuery` | Query | Reused from F02 to validate plan-level gates (RAW upload, video limits, storage). |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GalleryMediaConfiguration` | EF Config | Maps `GalleryMedia` with indexes on `(CollectionId, SortOrder)`, `(PhotographerId, IsStarred)`, and `(SetId)`. |
| `StorageService` (impl) | Service | Implements `IStorageService` against Azure Blob Storage or S3-compatible storage. Handles multipart uploads for large files. |
| `CdnService` (impl) | Service | Implements `ICdnService`. Generates thumbnail variants via image processing library (e.g., ImageSharp). Produces progressive image sets. |
| `VideoProcessingService` (impl) | Service | Background service that transcodes uploaded videos to adaptive bitrate formats (HLS/DASH), extracts frame thumbnails, and validates resolution limits. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GalleryMediaController` | Controller | Endpoints: `POST /api/collections/{id}/media` (upload), `GET /api/collections/{id}/media` (list), `DELETE /api/collections/{id}/media/{mediaId}`, `POST .../move`, `POST .../star`, `POST /bulk-star`, `POST .../private`. |

---

## Class Diagrams

### Domain Layer -- Media Entities

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

interface ITenantEntity {
  +PhotographerId : Guid
}

interface ISoftDeletable {
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

class GalleryMedia {
  +PhotographerId : Guid
  +CollectionId : Guid
  +SetId : Guid?
  --File Info--
  +FileName : string
  +OriginalFileName : string
  +MediaType : MediaType
  +ContentType : string
  +FileSizeBytes : long
  +StorageKey : string
  +ThumbnailStorageKey : string?
  --Image Metadata--
  +Width : int?
  +Height : int?
  +CameraMake : string?
  +CameraModel : string?
  +LensModel : string?
  +FocalLength : double?
  +Aperture : string?
  +ShutterSpeed : string?
  +Iso : int?
  +DateTaken : DateTime?
  +GpsLatitude : double?
  +GpsLongitude : double?
  --Video Metadata--
  +Duration : TimeSpan?
  +VideoResolution : string?
  +CustomVideoThumbnailKey : string?
  --Organization--
  +SortOrder : int
  +IsStarred : bool
  +IsPrivate : bool
  +MarkedPrivateByClientId : Guid?
}

class Collection {
  +Title : string
  +CoverPhotoId : Guid?
  +Sets : ICollection<CollectionSet>
  +Media : ICollection<GalleryMedia>
}

class CollectionSet {
  +CollectionId : Guid
  +Title : string
  +SortOrder : int
  +Media : ICollection<GalleryMedia>
}

enum MediaType {
  Jpeg
  Png
  Gif
  Raw
  Mp4
  Mov
  Avi
  M4V
}

BaseEntity <|-- GalleryMedia
BaseEntity <|-- Collection
BaseEntity <|-- CollectionSet
ITenantEntity <|.. GalleryMedia
ISoftDeletable <|.. GalleryMedia

Collection "1" *-- "many" GalleryMedia
Collection "1" *-- "many" CollectionSet
CollectionSet "1" *-- "many" GalleryMedia
GalleryMedia --> MediaType
@enduml
```

### Application Layer -- Upload Commands & Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Galleries.Media" {
  class UploadMediaCommand <<record>> {
    +CollectionId : Guid
    +SetId : Guid?
    +FileName : string
    +ContentType : string
    +FileSizeBytes : long
    +FileStream : Stream
  }

  class BulkFolderUploadCommand <<record>> {
    +Folders : List<FolderDescriptor>
  }

  class FolderDescriptor {
    +FolderName : string
    +ParentFolderName : string?
    +Files : List<FileDescriptor>
  }

  class FileDescriptor {
    +FileName : string
    +ContentType : string
    +FileSizeBytes : long
    +Stream : Stream
  }

  class ListMediaQuery <<record>> {
    +CollectionId : Guid
    +SetId : Guid?
    +StarredOnly : bool?
    +Page : int
    +PageSize : int
  }

  class DeleteMediaCommand <<record>> {
    +Id : Guid
  }

  class MoveMediaCommand <<record>> {
    +Id : Guid
    +TargetSetId : Guid?
  }
}

interface IStorageService {
  +UploadAsync(stream, fileName, contentType) : string
  +DownloadAsync(key) : Stream
  +DeleteAsync(key)
  +GetPresignedUrlAsync(key, expiry) : string
}

interface ICdnService {
  +GetCdnUrlAsync(storageKey) : string
  +GenerateThumbnailAsync(key, w, h) : string
  +GenerateProgressiveImagesAsync(key) : ProgressiveImageSet
  +InvalidateCacheAsync(key)
}

class ProgressiveImageSet {
  +PlaceholderUrl : string
  +LowResUrl : string
  +FullResUrl : string
}

UploadMediaCommand ..> IStorageService : uses
UploadMediaCommand ..> ICdnService : uses
ICdnService ..> ProgressiveImageSet : returns
@enduml
```

### Validation Pipeline

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class FileValidator {
  +ValidateFormat(contentType, mediaType) : Result
  +ValidateSize(fileSizeBytes, planLimits) : Result
  +ValidateVideoResolution(resolution, plan) : Result
  +ValidateStorageQuota(currentUsage, fileSize, planLimit) : Result
}

class FormatRules <<static>> {
  +SupportedImageTypes : string[]
  +SupportedRawTypes : string[]
  +SupportedVideoTypes : string[]
  +MaxImageSizeBytes : long = 52_428_800
}

class PlanLimits {
  +StorageLimitBytes : long
  +VideoMinutesHd : int
  +VideoMinutes4k : int
  +RawUploadEnabled : bool
}

note right of FileValidator
  Called before upload to storage.
  Rejects unsupported formats with
  clear error naming the format.
  Checks plan via CheckFeatureAccessQuery.
end note

FileValidator --> FormatRules : checks against
FileValidator --> PlanLimits : checks against
@enduml
```

---

## Sequence Diagrams

### Single File Upload

```plantuml
@startuml
actor Photographer as P
participant "GalleryMediaController" as GMC
participant "MediatR" as M
participant "UploadMediaHandler" as UH
participant "FileValidator" as FV
participant "CheckFeatureAccessHandler" as CFA
participant "IStorageService" as SS
participant "ICdnService" as CDN
participant "ApplicationDbContext" as DB

P -> GMC : POST /api/collections/{id}/media\n[multipart/form-data: file]
GMC -> GMC : Extract file stream,\nfileName, contentType, size
GMC -> M : Send(UploadMediaCommand)
M -> UH : Handle(command)

UH -> UH : Determine MediaType\nfrom content type/extension

UH -> FV : ValidateFormat(contentType, mediaType)
alt unsupported format
  FV --> UH : Failure("Unsupported format: .xyz")
  UH --> M : Result.Failure
  M --> GMC : 400
  GMC --> P : 400 Bad Request
end

UH -> FV : ValidateSize(fileSizeBytes, planLimits)
alt exceeds plan limit
  FV --> UH : Failure("File exceeds max size")
  UH --> M : Result.Failure
  M --> GMC : 400
  GMC --> P : 400 Bad Request
end

alt RAW file type
  UH -> M : Send(CheckFeatureAccessQuery("raw_upload"))
  M -> CFA : Handle
  CFA --> M : FeatureAccessResult
  alt not allowed
    UH --> M : Failure("RAW upload requires Pro+")
    M --> GMC : 403
    GMC --> P : 403 Forbidden
  end
end

UH -> FV : ValidateStorageQuota(\ncurrentUsage, fileSize, planLimit)

UH -> SS : UploadAsync(stream, fileName, contentType)
SS --> UH : storageKey

UH -> CDN : GenerateThumbnailAsync(storageKey, 400, 400)
CDN --> UH : thumbnailKey

UH -> CDN : GenerateProgressiveImagesAsync(storageKey)
CDN --> UH : ProgressiveImageSet

UH -> DB : GalleryMedia.Add(new GalleryMedia {...})
UH -> DB : Photographer.StorageUsedBytes += fileSizeBytes
UH -> DB : SaveChangesAsync()

UH --> M : Result.Success(GalleryMediaDto)
M --> GMC : Result.Success
GMC --> P : 200 OK (GalleryMediaDto)
@enduml
```

### Bulk Folder Upload

```plantuml
@startuml
actor Photographer as P
participant "GalleryMediaController" as GMC
participant "MediatR" as M
participant "BulkFolderUploadHandler" as BFH
participant "ApplicationDbContext" as DB
participant "UploadMediaHandler" as UMH

P -> GMC : POST /api/collections/bulk-folder-upload\n{folders: [{name, files}, {name, parent, files}]}
GMC -> M : Send(BulkFolderUploadCommand)
M -> BFH : Handle(command)

loop each root folder
  BFH -> DB : Create Collection(title = folderName)

  loop each sub-folder
    BFH -> DB : Create CollectionSet(\ncollectionId, title = subFolderName)
  end

  BFH -> DB : SaveChangesAsync()

  loop each file in folder/sub-folder
    BFH -> M : Send(UploadMediaCommand(\ncollectionId, setId, file...))
    M -> UMH : Handle (validates & uploads)
    UMH --> M : Result
    alt upload failed
      BFH -> BFH : Record failure,\ncontinue with next file
    end
  end
end

BFH --> M : BulkUploadResult {\n  collectionsCreated,\n  setsCreated,\n  filesUploaded,\n  filesFailed[]\n}
M --> GMC : Result.Success
GMC --> P : 200 OK (BulkUploadResult)
@enduml
```

### Video Upload & Processing

```plantuml
@startuml
actor Photographer as P
participant "GalleryMediaController" as GMC
participant "MediatR" as M
participant "UploadMediaHandler" as UH
participant "FileValidator" as FV
participant "IStorageService" as SS
participant "VideoProcessingService" as VPS
participant "ApplicationDbContext" as DB

P -> GMC : POST /api/collections/{id}/media\n[video file: .mp4, 1.2GB]
GMC -> M : Send(UploadMediaCommand)
M -> UH : Handle(command)

UH -> UH : Detect MediaType = Mp4

UH -> FV : ValidateFormat (video/mp4)
UH -> FV : ValidateVideoResolution(resolution, plan)
alt exceeds plan video limit
  FV --> UH : Failure("4K video requires Pro+")
  UH --> M : Result.Failure
  M --> GMC : 403
  GMC --> P : 403 Forbidden
end

UH -> M : CheckFeatureAccessQuery("video_minutes_hd")
note right: Check total video duration\nagainst plan limit

UH -> SS : UploadAsync(stream, fileName, video/mp4)
SS --> UH : storageKey

UH -> DB : Create GalleryMedia\n(Duration, VideoResolution populated)
UH -> DB : SaveChangesAsync()
UH --> M : Result.Success(GalleryMediaDto)
M --> GMC : 200 OK

== Background Processing (async) ==

VPS -> SS : DownloadAsync(storageKey)
SS --> VPS : video stream

VPS -> VPS : Transcode to adaptive\nbitrate (HLS/DASH):\n  - 360p\n  - 720p\n  - 1080p\n  - 2160p (if 4K source)

VPS -> VPS : Extract frame thumbnails\nat 0s, 25%, 50%, 75%

VPS -> SS : Upload transcoded\nstream variants

VPS -> DB : Update GalleryMedia:\n  CustomVideoThumbnailKey,\n  adaptive bitrate manifest URL

VPS -> DB : SaveChangesAsync()
@enduml
```

### RAW File Processing

```plantuml
@startuml
actor Photographer as P
participant "UploadMediaHandler" as UH
participant "CheckFeatureAccessHandler" as CFA
participant "IStorageService" as SS
participant "RawProcessingService" as RPS
participant "ICdnService" as CDN
participant "ApplicationDbContext" as DB

P -> UH : Upload .CR3 file (Canon RAW)
UH -> CFA : CheckFeatureAccess("raw_upload")
CFA --> UH : IsAllowed: true (Pro plan)

UH -> SS : UploadAsync(rawStream, "photo.cr3",\n"image/x-canon-cr3")
SS --> UH : originalStorageKey

== Background Processing ==

RPS -> SS : DownloadAsync(originalStorageKey)
SS --> RPS : raw file stream

RPS -> RPS : Decode RAW using\nLibRaw/dcraw:\n  - Extract embedded JPEG preview\n  - Generate full-res JPEG render
RPS -> RPS : Extract EXIF metadata:\n  Camera, Lens, ISO,\n  Aperture, Shutter, GPS

RPS -> SS : UploadAsync(previewJpeg)
SS --> RPS : previewStorageKey

RPS -> CDN : GenerateThumbnailAsync(\npreviewStorageKey, 400, 400)
CDN --> RPS : thumbnailKey

RPS -> CDN : GenerateProgressiveImagesAsync(\npreviewStorageKey)
CDN --> RPS : ProgressiveImageSet

RPS -> DB : Update GalleryMedia:\n  ThumbnailStorageKey = thumbnailKey\n  Width, Height, EXIF fields\n  MediaType = Raw
RPS -> DB : SaveChangesAsync()
@enduml
```

### Progressive Image Loading (CDN Delivery)

```plantuml
@startuml
actor Client as C
participant "CDN Edge" as CDN
participant "Origin Storage" as OS
participant "Browser" as B

C -> B : Open gallery page

B -> CDN : Request placeholder image\n(blurred 20px thumbnail, ~1KB)
CDN --> B : placeholder.webp (cached)
B -> B : Display blurred placeholder

B -> CDN : Request low-res image\n(640px wide, ~30KB)
alt cache hit
  CDN --> B : low-res.webp
else cache miss
  CDN -> OS : Fetch low-res variant
  OS --> CDN : low-res.webp
  CDN --> B : low-res.webp
end
B -> B : Crossfade from placeholder\nto low-res image

B -> CDN : Request full-res image\n(original quality, ~2-5MB)
alt cache hit
  CDN --> B : full-res.webp
else cache miss
  CDN -> OS : Fetch full-res variant
  OS --> CDN : full-res.webp
  CDN --> B : full-res.webp
end
B -> B : Crossfade from low-res\nto full-res image
@enduml
```

### File Validation Decision Flow

```plantuml
@startuml
actor Photographer as P
participant "UploadMediaHandler" as UH
participant "FileValidator" as FV

P -> UH : Upload file

UH -> FV : Check format supported?
alt unsupported format
  FV --> UH : "Unsupported format: .{ext}.\nSupported: JPEG, PNG, GIF,\nRAW (Pro+), MP4, MOV, AVI, M4V"
  UH --> P : 400
end

UH -> FV : Check file size <= max?
alt image > 50MB
  FV --> UH : "Image exceeds 50MB limit"
  UH --> P : 400
end

alt is RAW file
  UH -> FV : Check plan allows RAW?
  alt plan < Pro
    FV --> UH : "RAW upload requires\nPro or Ultimate plan"
    UH --> P : 403
  end
end

alt is video file
  UH -> FV : Check video resolution\nand duration vs plan
  alt exceeds plan limit
    FV --> UH : "Video exceeds plan limit.\nYour plan allows {X}min {quality}"
    UH --> P : 403
  end
end

UH -> FV : Check storage quota
alt would exceed storage limit
  FV --> UH : "Upload would exceed\nstorage limit ({used}/{limit}GB)"
  UH --> P : 403
end

FV --> UH : All validations passed
UH -> UH : Proceed with upload
@enduml
```
