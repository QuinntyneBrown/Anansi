# F45 - Data Security & Content Protection

## Overview

Data Security & Content Protection encompasses the platform-wide security infrastructure, gallery content protection mechanisms, responsive design enforcement, and media delivery optimization. This feature cuts across every layer of the application, establishing baseline security guarantees (TLS, PCI compliance, password hashing), then layering on photographer-controlled content protection (gallery passwords, download PINs, right-click suppression, server-side watermarks), and finally ensuring all client-facing pages are fully responsive and media is delivered efficiently through CDN and adaptive streaming.

On the security side, all connections are enforced at TLS 1.2+ via infrastructure configuration. Payment card data never touches Anansi servers -- Stripe handles all card processing in PCI DSS-compliant fashion, with Anansi only storing Stripe account IDs and payment intent references. Passwords are hashed using bcrypt (via ASP.NET Core Identity's default `PasswordHasher<T>` configured with a work factor of 12). Gallery password protection is implemented as a server-side gate: the API returns zero gallery content until the correct password is provided and validated. Download PINs are similarly validated server-side before generating download URLs.

Content protection includes right-click suppression (a JavaScript overlay that intercepts the browser context menu on all gallery images) and server-side watermarking (watermarks are composited onto images during thumbnail and display-size generation, not applied via CSS overlays, so they cannot be bypassed by disabling styles). Responsive design is enforced through the design token system (F44) with breakpoints at 1440px (desktop), 768px (tablet), and 402px (mobile), and touch interactions (swipe, pinch-to-zoom) are supported on gallery views. Media delivery uses a CDN for all photo assets, with server-side thumbnail generation, progressive loading (low-res placeholder then full resolution), adaptive bitrate video streaming, and Chromecast/AirPlay casting support for video galleries.

**L2 Requirements:** SEC-11.1.1 (TLS/PCI/Hashing), SEC-11.1.2 (Content Protection), UX-11.3.1 (Responsive Design), UX-11.3.2 (Touch Interactions), UX-11.3.3 (CDN/Progressive Loading), UX-11.3.4 (Chromecast/AirPlay)

---

## Components

### Domain Layer (Anansi.Domain)

| Component | Type | Description |
|-----------|------|-------------|
| `Collection` | Entity | Contains `Password` (nullable string, bcrypt-hashed), `DownloadPin` (nullable string), and `DownloadsEnabled` flag. The password gate prevents any gallery content from being served without authentication. |
| `GalleryMedia` | Entity | Contains `StorageKey` and `ThumbnailStorageKey` for CDN delivery. Watermarked display versions are derived at thumbnail generation time. |
| `Watermark` | Entity | Defines watermark settings (text/image, opacity, scale, position) applied server-side during image processing. |
| `Collection.ClientExclusivePassword` | Property | Separate password for expanded client-only visibility (more photos than the general password provides). |

### Application Layer (Anansi.Application)

| Component | Type | Description |
|-----------|------|-------------|
| `ValidateGalleryPasswordCommand` | Command | Accepts a collection ID and password attempt. Verifies the password hash. On success, issues a short-lived gallery access token (JWT scoped to that collection). Returns 401 on failure with no content leak. |
| `ValidateDownloadPinCommand` | Command | Accepts a collection ID and PIN attempt. Verifies server-side. On success, authorizes the download request. |
| `GetGalleryMediaQuery` | Query | Returns gallery media only if the caller has a valid gallery access token (from password validation) or the collection has no password. Includes CDN URLs for progressive loading. |
| `GenerateWatermarkedImageCommand` | Command | Triggers server-side watermark compositing on a source image using the photographer's `Watermark` settings. Returns the watermarked CDN URL. |
| `GetProgressiveImageSetQuery` | Query | Returns placeholder, low-res, and full-res URLs for a given media item via `ICdnService`. |
| `GetAdaptiveVideoStreamQuery` | Query | Returns HLS/DASH manifest URLs for adaptive bitrate video streaming. |
| `ICdnService` | Interface | `GetCdnUrlAsync`, `GenerateThumbnailAsync`, `GenerateProgressiveImagesAsync`, `InvalidateCacheAsync`. |
| `IStorageService` | Interface | File upload/download/delete and pre-signed URL generation for secure direct downloads. |
| `IWatermarkService` | Interface | `ApplyWatermarkAsync(sourceKey, watermarkSettings)` -- composites watermark onto image server-side, returns watermarked storage key. |

### Infrastructure Layer (Anansi.Infrastructure)

| Component | Type | Description |
|-----------|------|-------------|
| `CdnService` | Service | Implements `ICdnService`. Integrates with CloudFront or Azure CDN. Generates signed URLs with expiration. Generates thumbnail variants at multiple sizes. Produces progressive image sets (placeholder blur-up, low-res, full-res). |
| `WatermarkService` | Service | Implements `IWatermarkService`. Uses ImageSharp (SixLabors) to composite text or image watermarks onto photos at the configured position, opacity, and scale. Outputs are cached in storage for subsequent requests. |
| `AdaptiveVideoService` | Service | Transcodes uploaded videos into HLS segments with multiple quality levels (480p, 720p, 1080p, 4K). Generates DASH/HLS manifests. |
| `TlsEnforcementMiddleware` | Middleware | Redirects HTTP to HTTPS and sets HSTS headers. Enforces minimum TLS 1.2. |
| `SecurityHeadersMiddleware` | Middleware | Adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Content-Security-Policy` headers. |
| `GalleryAccessTokenService` | Service | Issues and validates short-lived JWTs scoped to a specific collection ID. Tokens expire after 1 hour and contain the access level (password vs. client-exclusive). |

### API Layer (Anansi.Api)

| Component | Type | Description |
|-----------|------|-------------|
| `GalleryAccessController` | Controller | `POST /api/galleries/{id}/authenticate` accepts password, returns gallery access token. `POST /api/galleries/{id}/validate-pin` validates download PIN. |
| `GalleryMediaController` | Controller | `GET /api/galleries/{id}/media` returns media list with CDN URLs. Requires valid gallery access token for password-protected collections. |
| `ContentProtectionMiddleware` | Middleware | For client-facing gallery pages, injects the right-click suppression JavaScript and watermark display logic. |

### Frontend (Client-Facing Gallery)

| Component | Type | Description |
|-----------|------|-------------|
| `RightClickProtection` | JS Module | Intercepts `contextmenu` events on gallery images, preventing the browser context menu from appearing. Also intercepts drag events. |
| `ProgressiveImageLoader` | JS Module | Loads a tiny placeholder image first, then swaps in the low-res version, then loads the full-res version in the background. Uses IntersectionObserver for lazy loading. |
| `TouchGestureHandler` | JS Module | Handles swipe (horizontal navigation between photos), pinch-to-zoom (on lightbox view), and tap-to-dismiss gestures. |
| `CastButton` | JS Component | Detects Chromecast and AirPlay compatible devices. Shows a cast icon when available. Uses the Google Cast SDK and WebKit AirPlay API. |
| `AdaptiveVideoPlayer` | JS Component | HLS.js-based video player with quality level selector. Falls back to native HLS on Safari. Exposes Chromecast/AirPlay cast targets. |

---

## Class Diagrams

### Domain -- Security-Related Entity Fields

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Collection {
  +Id : Guid
  +PhotographerId : Guid
  +Title : string
  +Password : string?
  +ClientExclusivePassword : string?
  +DownloadPin : string?
  +DownloadPinEnabled : bool
  +DownloadsEnabled : bool
  +DownloadLimit : int?
  +DownloadCount : int
}

class GalleryMedia {
  +Id : Guid
  +CollectionId : Guid
  +StorageKey : string
  +ThumbnailStorageKey : string?
  +FileSizeBytes : long
  +Width : int?
  +Height : int?
}

class Watermark {
  +Id : Guid
  +PhotographerId : Guid
  +Name : string
  +Type : WatermarkType
  +Text : string?
  +ImageUrl : string?
  +Opacity : double
  +Scale : double
  +Position : WatermarkPosition
  +IsDefault : bool
}

enum WatermarkType {
  Text
  Image
}

enum WatermarkPosition {
  TopLeft
  TopCenter
  TopRight
  CenterLeft
  Center
  CenterRight
  BottomLeft
  BottomCenter
  BottomRight
}

Collection "1" --> "*" GalleryMedia : media
Watermark ..> WatermarkType
Watermark ..> WatermarkPosition

@enduml
```

![Domain -- Security-Related Entity Fields](domain-security-related-entity-fields.png)

### Application -- Security Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Security.Commands" {
  class ValidateGalleryPasswordCommand <<record>> {
    +CollectionId : Guid
    +Password : string
  }

  class ValidateDownloadPinCommand <<record>> {
    +CollectionId : Guid
    +Pin : string
  }

  class GenerateWatermarkedImageCommand <<record>> {
    +MediaId : Guid
    +WatermarkId : Guid?
  }
}

package "Features.Security.Queries" {
  class GetGalleryMediaQuery <<record>> {
    +CollectionId : Guid
    +GalleryAccessToken : string?
    +Page : int
    +PageSize : int
  }

  class GetProgressiveImageSetQuery <<record>> {
    +MediaId : Guid
  }

  class GetAdaptiveVideoStreamQuery <<record>> {
    +MediaId : Guid
  }
}

class GalleryAccessTokenDto <<record>> {
  +Token : string
  +ExpiresAt : DateTime
  +AccessLevel : string
}

class ProgressiveImageSetDto <<record>> {
  +PlaceholderUrl : string
  +LowResUrl : string
  +FullResUrl : string
}

class AdaptiveStreamDto <<record>> {
  +HlsManifestUrl : string
  +DashManifestUrl : string
  +QualityLevels : List<string>
}

ValidateGalleryPasswordCommand ..> GalleryAccessTokenDto
GetProgressiveImageSetQuery ..> ProgressiveImageSetDto
GetAdaptiveVideoStreamQuery ..> AdaptiveStreamDto

@enduml
```

![Application -- Security Commands & Queries](application-security-commands-queries.png)

### Application -- Service Interfaces

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface ICdnService {
  +GetCdnUrlAsync(storageKey) : Task<string>
  +GenerateThumbnailAsync(storageKey, width, height) : Task<string>
  +GenerateProgressiveImagesAsync(storageKey) : Task<ProgressiveImageSet>
  +InvalidateCacheAsync(storageKey) : Task
}

interface IWatermarkService {
  +ApplyWatermarkAsync(sourceKey, watermark) : Task<string>
  +ApplyWatermarkBatchAsync(sourceKeys, watermark) : Task<IReadOnlyList<string>>
}

interface IStorageService {
  +UploadAsync(stream, key) : Task<string>
  +DeleteAsync(key) : Task
  +GeneratePresignedUrlAsync(key, expiry) : Task<string>
}

class ProgressiveImageSet <<record>> {
  +PlaceholderUrl : string
  +LowResUrl : string
  +FullResUrl : string
}

ICdnService ..> ProgressiveImageSet

@enduml
```

![Application -- Service Interfaces](application-service-interfaces.png)

### Infrastructure -- Security Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface ICdnService
interface IWatermarkService

class CdnService {
  -_cdnClient : ICdnClient
  -_storageService : IStorageService
  +GetCdnUrlAsync(storageKey) : Task<string>
  +GenerateThumbnailAsync(storageKey, w, h) : Task<string>
  +GenerateProgressiveImagesAsync(storageKey) : Task<ProgressiveImageSet>
  +InvalidateCacheAsync(storageKey) : Task
}

class WatermarkService {
  -_storageService : IStorageService
  +ApplyWatermarkAsync(sourceKey, watermark) : Task<string>
  +ApplyWatermarkBatchAsync(sourceKeys, watermark) : Task<IReadOnlyList<string>>
}

class AdaptiveVideoService {
  -_storageService : IStorageService
  +TranscodeAsync(videoKey) : Task<AdaptiveStreamResult>
  +GetManifestUrlAsync(videoKey) : Task<string>
}

class GalleryAccessTokenService {
  -_configuration : IConfiguration
  +GenerateToken(collectionId, accessLevel) : string
  +ValidateToken(token) : GalleryAccessClaims?
}

class TlsEnforcementMiddleware {
  -_next : RequestDelegate
  +InvokeAsync(HttpContext) : Task
}

class SecurityHeadersMiddleware {
  -_next : RequestDelegate
  +InvokeAsync(HttpContext) : Task
}

ICdnService <|.. CdnService
IWatermarkService <|.. WatermarkService

@enduml
```

![Infrastructure -- Security Services](infrastructure-security-services.png)

### API -- Security Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class GalleryAccessController <<ApiController>> {
  -_mediator : IMediator
  +Authenticate(collectionId, password) : IActionResult
  +ValidatePin(collectionId, pin) : IActionResult
}

class GalleryMediaController <<ApiController>> {
  -_mediator : IMediator
  +GetMedia(collectionId, page, pageSize) : IActionResult
  +GetProgressiveImages(mediaId) : IActionResult
  +GetVideoStream(mediaId) : IActionResult
}

note right of GalleryAccessController
  POST /api/galleries/{id}/authenticate
  POST /api/galleries/{id}/validate-pin
  Both return 401 on failure with
  no content information leaked.
end note

GalleryAccessController --> "IMediator"
GalleryMediaController --> "IMediator"

@enduml
```

![API -- Security Controllers](api-security-controllers.png)

---

## Sequence Diagrams

### Gallery Password Authentication (Content Gate)

```plantuml
@startuml
actor Client as C
participant "GalleryAccessController" as GAC
participant "MediatR" as M
participant "ValidatePasswordHandler" as H
participant "IApplicationDbContext" as DB
participant "GalleryAccessTokenService" as GATS

C -> GAC : POST /api/galleries/{id}/authenticate\n{password: "secret123"}
GAC -> M : Send(ValidateGalleryPasswordCommand)
M -> H : Handle(command)

H -> DB : Collections.FindAsync(collectionId)
DB --> H : collection

alt collection not found
  H --> M : Result.Failure("Gallery not found")
  M --> GAC : Result.Failure
  GAC --> C : 404 Not Found
end

alt collection.Password is null
  H --> M : Result.Failure("No password required")
  M --> GAC : Result.Failure
  GAC --> C : 400 Bad Request
end

H -> H : bcrypt.Verify(\npassword, collection.Password)

alt password incorrect
  H --> M : Result.Failure("Invalid password")
  M --> GAC : Result.Failure
  GAC --> C : 401 Unauthorized\n(no content returned)
end

H -> GATS : GenerateToken(collectionId, "standard")
GATS --> H : JWT gallery access token\n(expires in 1 hour)

H --> M : Result.Success(GalleryAccessTokenDto)
M --> GAC : Result.Success
GAC --> C : 200 OK\n{token: "eyJ...", expiresAt, accessLevel: "standard"}

note right of C
  Client includes this token in subsequent
  gallery media requests as:
  Authorization: Bearer <gallery-token>
end note
@enduml
```

![Gallery Password Authentication (Content Gate)](gallery-password-authentication-content-gate.png)

### Download PIN Validation

```plantuml
@startuml
actor Client as C
participant "GalleryAccessController" as GAC
participant "MediatR" as M
participant "ValidateDownloadPinHandler" as H
participant "IApplicationDbContext" as DB
participant "IStorageService" as SS

C -> GAC : POST /api/galleries/{id}/validate-pin\n{pin: "1234"}
GAC -> M : Send(ValidateDownloadPinCommand)
M -> H : Handle(command)

H -> DB : Collections.FindAsync(collectionId)
DB --> H : collection

alt collection.DownloadPinEnabled == false
  H --> M : Result.Success (no PIN required)
  M --> GAC : Result.Success
  GAC --> C : 200 OK
end

H -> H : Compare provided PIN\nwith collection.DownloadPin

alt PIN incorrect
  H --> M : Result.Failure("Invalid PIN")
  M --> GAC : Result.Failure
  GAC --> C : 401 Unauthorized
end

alt collection.DownloadLimit is set
  H -> H : Check collection.DownloadCount\n< collection.DownloadLimit
  alt limit reached
    H --> M : Result.Failure("Download limit reached")
    M --> GAC : Result.Failure
    GAC --> C : 403 Forbidden
  end
end

H --> M : Result.Success\n(download authorized)
M --> GAC : Result.Success
GAC --> C : 200 OK {authorized: true}
@enduml
```

![Download PIN Validation](download-pin-validation.png)

### Server-Side Watermark Application

```plantuml
@startuml
participant "Media Upload Pipeline" as MUP
participant "IStorageService" as SS
participant "IWatermarkService" as WMS
participant "ICdnService" as CDN
participant "IApplicationDbContext" as DB

MUP -> SS : UploadAsync(imageStream, storageKey)
SS --> MUP : storageKey

MUP -> DB : Get Photographer's default Watermark
DB --> MUP : watermark (or null)

alt watermark exists and collection has watermark enabled
  MUP -> WMS : ApplyWatermarkAsync(\nstorageKey, watermark)

  WMS -> SS : Download source image
  SS --> WMS : imageBytes
  WMS -> WMS : Load image with ImageSharp

  alt watermark.Type == Text
    WMS -> WMS : Render text at position\nwith font, opacity, scale
  else watermark.Type == Image
    WMS -> WMS : Composite watermark image\nat position with opacity, scale
  end

  WMS -> SS : Upload watermarked version\n(storageKey + "_wm")
  SS --> WMS : watermarkedKey
  WMS --> MUP : watermarkedKey
end

MUP -> CDN : GenerateProgressiveImagesAsync(\nwatermarkedKey or storageKey)
CDN -> CDN : Generate placeholder (20px blur-up)
CDN -> CDN : Generate low-res (640px)
CDN -> CDN : Generate display-res (2048px)
CDN --> MUP : ProgressiveImageSet {\nplaceholder, lowRes, fullRes}

MUP -> DB : Update GalleryMedia\n(ThumbnailStorageKey, CDN URLs)
MUP -> DB : SaveChangesAsync()

note right of WMS
  Watermarks are burned into the
  display-size image on the server.
  They cannot be removed via CSS
  or developer tools.
end note
@enduml
```

![Server-Side Watermark Application](server-side-watermark-application.png)

### Progressive Image Loading (Client-Side)

```plantuml
@startuml
actor Client as C
participant "Browser" as B
participant "ProgressiveImageLoader" as PIL
participant "CDN" as CDN

C -> B : Scroll gallery into viewport

B -> PIL : IntersectionObserver triggers\nfor visible image elements

PIL -> CDN : GET placeholder URL\n(~2KB inline blur-up)
CDN --> PIL : placeholder image (base64)
PIL -> B : Show blurred placeholder\n(immediate render)

PIL -> CDN : GET low-res URL (640px)
CDN --> PIL : low-res image
PIL -> B : Crossfade from placeholder\nto low-res

PIL -> PIL : Check if user is viewing\nthis image (in viewport)

alt image is in viewport or lightbox
  PIL -> CDN : GET full-res URL (2048px+)
  CDN --> PIL : full-res image
  PIL -> B : Crossfade from low-res\nto full-res
end

B --> C : Sharp, full-resolution image\n(perceived instant load)
@enduml
```

![Progressive Image Loading (Client-Side)](progressive-image-loading-client-side.png)

### Adaptive Video Streaming with Cast Support

```plantuml
@startuml
actor Client as C
participant "AdaptiveVideoPlayer" as AVP
participant "CDN" as CDN
participant "Cast SDK" as CS

C -> AVP : Click play on video

AVP -> CDN : GET /video/{id}/manifest.m3u8
CDN --> AVP : HLS manifest with\nquality levels:\n#EXT-X-STREAM-INF:480p\n#EXT-X-STREAM-INF:720p\n#EXT-X-STREAM-INF:1080p

AVP -> AVP : Detect bandwidth\n(navigator.connection or\nsegment download timing)

alt bandwidth >= 5 Mbps
  AVP -> CDN : Request 1080p segments
else bandwidth >= 2 Mbps
  AVP -> CDN : Request 720p segments
else bandwidth < 2 Mbps
  AVP -> CDN : Request 480p segments
end

CDN --> AVP : Video segments (2s chunks)
AVP --> C : Smooth video playback

== Cast Detection ==
AVP -> CS : Check for available\ncast devices

alt Chromecast detected
  CS --> AVP : Chromecast available
  AVP -> AVP : Show Chromecast icon
  C -> AVP : Click cast icon
  AVP -> CS : Cast video stream\n(pass manifest URL)
  CS --> C : Video plays on TV
else AirPlay detected
  CS --> AVP : AirPlay available
  AVP -> AVP : Show AirPlay icon
  C -> AVP : Click AirPlay icon
  AVP -> CS : Start AirPlay session
  CS --> C : Video plays on Apple TV
end
@enduml
```

![Adaptive Video Streaming with Cast Support](adaptive-video-streaming-with-cast-support.png)

### Right-Click Protection on Gallery Images

```plantuml
@startuml
actor Client as C
participant "Browser" as B
participant "RightClickProtection" as RCP

C -> B : Load gallery page
B -> RCP : Initialize protection\non all <img> elements\nwithin .gallery-container

RCP -> B : Add event listeners:\n- contextmenu\n- dragstart\n- selectstart

== Right-Click Attempt ==
C -> B : Right-click on gallery image
B -> RCP : contextmenu event fired
RCP -> RCP : event.preventDefault()
RCP -> RCP : event.stopPropagation()
RCP --> C : Context menu suppressed\n(no "Save Image As..." option)

== Drag Attempt ==
C -> B : Try to drag image to desktop
B -> RCP : dragstart event fired
RCP -> RCP : event.preventDefault()
RCP --> C : Drag suppressed

note right of RCP
  This is a deterrent, not absolute protection.
  Combined with server-side watermarks
  (which cannot be removed), it provides
  layered content protection.
end note
@enduml
```

![Right-Click Protection on Gallery Images](right-click-protection-on-gallery-images.png)

### TLS & Security Headers Enforcement

```plantuml
@startuml
actor Client as C
participant "Load Balancer / Reverse Proxy" as LB
participant "TlsEnforcementMiddleware" as TLS
participant "SecurityHeadersMiddleware" as SH
participant "Application" as APP

C -> LB : HTTP request (port 80)
LB -> TLS : Forward request
TLS -> TLS : Check X-Forwarded-Proto\nor request scheme

alt scheme == "http"
  TLS --> C : 301 Redirect to HTTPS
end

C -> LB : HTTPS request (TLS 1.2+)
LB -> TLS : Forward request\n(X-Forwarded-Proto: https)
TLS -> TLS : Verify TLS 1.2+\n(configured at LB level)

TLS -> SH : Pass to security headers
SH -> SH : Add response headers:\n- Strict-Transport-Security:\n  max-age=31536000;\n  includeSubDomains\n- X-Content-Type-Options: nosniff\n- X-Frame-Options: DENY\n- X-XSS-Protection: 1; mode=block\n- Referrer-Policy: strict-origin\n- Content-Security-Policy: ...

SH -> APP : Pass to application pipeline
APP --> SH : Response
SH --> TLS : Response + security headers
TLS --> LB : Response
LB --> C : Secured response with\nall security headers
@enduml
```

![TLS & Security Headers Enforcement](tls-security-headers-enforcement.png)
