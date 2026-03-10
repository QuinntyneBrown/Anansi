# F36 - Mobile Gallery PWA

## Overview

Mobile Gallery PWA delivers a Progressive Web App experience for client photo delivery. Photographers create a curated, installable app from a collection of up to 200 images. The client receives a shareable link, opens it on any device, and is prompted to add the app to their home screen. Once installed, it behaves like a native app: custom icon (sourced from the client's favorite photo), offline support for previously loaded images via a service worker cache, and a branded shell with the photographer's cover, theme, layout, and contact info.

Beyond the gallery view, each PWA includes photographer contact details, social sharing buttons for individual images, and a configurable call-to-action button ("Book Again", "Refer a Friend", or custom). The app shell is rendered server-side on first load and then cached client-side, allowing the gallery to function offline for images already viewed. Plan limits govern the number of active PWAs: Free-tier photographers may maintain up to 3 apps, while paid plans allow unlimited apps. Paid plans also unlock the removal of "Powered by Anansi" branding from the app shell.

The technical implementation hinges on a `MobileGalleryApp` domain entity that captures the curated image set, branding configuration, and CTA settings. The API generates a dynamic `manifest.json` and service worker per app instance, while a dedicated controller serves the PWA shell and assets. Image delivery reuses the existing `IStorageService` and CDN pipeline from F03/F06.

**L2 Requirements:** MOB-6.2.1 (App Creation), MOB-6.2.2 (Client Installation), MOB-6.2.3 (App Features), MOB-6.2.4 (Plan Limits)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `MobileGalleryApp` | Entity | Represents a single PWA instance. Stores photographer ID, source collection ID, curated media IDs (up to 200), app icon media ID (client's favorite photo), cover/theme/layout/branding settings, CTA configuration, and publication status. Implements `ITenantEntity` and `ISoftDeletable`. |
| `MobileGalleryAppStatus` | Enum | `Draft`, `Published`, `Archived`. Controls whether the PWA link is publicly accessible. |
| `CtaButtonType` | Enum | `BookAgain`, `ReferAFriend`, `Custom`. Determines the call-to-action displayed in the app. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateMobileGalleryAppCommand` | Command | Creates a new PWA from a collection. Validates curated image count (max 200), resolves the app icon from the client's favorite photo, enforces plan limits (Free = 3 apps), and persists the entity. |
| `UpdateMobileGalleryAppCommand` | Command | Updates cover, theme, layout, branding, CTA settings, or curated image list for an existing app. |
| `PublishMobileGalleryAppCommand` | Command | Transitions the app from Draft to Published. Generates the public shareable link and caches the service worker manifest. |
| `DeleteMobileGalleryAppCommand` | Command | Soft-deletes an app, freeing the slot against plan limits. |
| `ListMobileGalleryAppsQuery` | Query | Returns all PWAs for the authenticated photographer, with status filter and pagination. |
| `GetMobileGalleryAppQuery` | Query | Returns full details of a single PWA by ID (photographer-facing). |
| `GetPublicMobileGalleryQuery` | Query | Public (unauthenticated) query that returns the PWA shell data, manifest, curated images, and CTA config for client rendering. Checks publication status. |
| `MobileGalleryAppDto` | DTO | Read model for photographer-facing views (ID, title, status, image count, CTA, share link). |
| `PublicMobileGalleryDto` | DTO | Read model for client-facing PWA rendering (images, branding, contact info, CTA). |
| `IManifestService` | Interface | Generates `manifest.json` and service worker content per app instance. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ManifestService` | Service | Implements `IManifestService`. Builds a W3C-compliant Web App Manifest with app name, icons (resized from favorite photo via `ICdnService`), theme color, background color, display mode, and start URL. Generates a service worker script that pre-caches the curated image list. |
| `MobileGalleryBackgroundJob` | BackgroundJob | After publish, pre-generates icon sizes (192x192, 512x512) from the favorite photo and warms the CDN cache for curated images. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `MobileGalleryController` | Controller | Authenticated endpoints for CRUD on PWAs: `POST`, `PUT`, `DELETE`, `GET` (list), `GET /{id}`, `POST /{id}/publish`. |
| `PublicMobileGalleryController` | Controller | Unauthenticated endpoints for client-facing PWA delivery: `GET /m/{slug}` (HTML shell), `GET /m/{slug}/manifest.json`, `GET /m/{slug}/sw.js`, `GET /m/{slug}/images` (paginated image list). |

---

## Class Diagrams

### Domain Layer - Mobile Gallery Entities

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

class MobileGalleryApp {
  +PhotographerId : Guid
  +CollectionId : Guid
  +Title : string
  +Slug : string
  +Status : MobileGalleryAppStatus
  +CuratedMediaIds : string
  +AppIconMediaId : Guid?
  +CoverImageUrl : string?
  +ThemeMode : ThemeMode
  +Layout : GridLayout
  +FontFamily : string
  +BrandColorHex : string?
  +CtaType : CtaButtonType
  +CtaLabel : string?
  +CtaUrl : string?
  +ContactPhone : string?
  +ContactEmail : string?
  +SocialLinks : string?
  +RemovePlatformBranding : bool
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

enum MobileGalleryAppStatus {
  Draft
  Published
  Archived
}

enum CtaButtonType {
  BookAgain
  ReferAFriend
  Custom
}

BaseEntity <|-- MobileGalleryApp
MobileGalleryApp --> MobileGalleryAppStatus
MobileGalleryApp --> CtaButtonType

@enduml
```

![Domain Layer - Mobile Gallery Entities](domain-layer-mobile-gallery-entities.png)

### Application Layer - Commands, Queries, and DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CreateMobileGalleryAppCommand <<Command>> {
  +CollectionId : Guid
  +Title : string
  +CuratedMediaIds : List<Guid>
  +ThemeMode : ThemeMode
  +Layout : GridLayout
  +CtaType : CtaButtonType
  +CtaLabel : string?
  +CtaUrl : string?
}

class UpdateMobileGalleryAppCommand <<Command>> {
  +AppId : Guid
  +Title : string?
  +CuratedMediaIds : List<Guid>?
  +CoverImageUrl : string?
  +ThemeMode : ThemeMode?
  +Layout : GridLayout?
  +CtaType : CtaButtonType?
  +CtaLabel : string?
  +CtaUrl : string?
}

class PublishMobileGalleryAppCommand <<Command>> {
  +AppId : Guid
}

class DeleteMobileGalleryAppCommand <<Command>> {
  +AppId : Guid
}

class ListMobileGalleryAppsQuery <<Query>> {
  +Status : MobileGalleryAppStatus?
  +Page : int
  +PageSize : int
}

class GetPublicMobileGalleryQuery <<Query>> {
  +Slug : string
}

class MobileGalleryAppDto <<DTO>> {
  +Id : Guid
  +Title : string
  +Slug : string
  +Status : MobileGalleryAppStatus
  +ImageCount : int
  +CtaType : CtaButtonType
  +ShareLink : string?
  +CreatedAt : DateTime
}

class PublicMobileGalleryDto <<DTO>> {
  +Title : string
  +Images : List<GalleryMediaDto>
  +CoverImageUrl : string?
  +ThemeMode : ThemeMode
  +Layout : GridLayout
  +ContactPhone : string?
  +ContactEmail : string?
  +CtaLabel : string?
  +CtaUrl : string?
  +ShowPlatformBranding : bool
}

interface IManifestService <<Interface>> {
  +GenerateManifestAsync(appId) : string
  +GenerateServiceWorkerAsync(appId) : string
}

CreateMobileGalleryAppCommand ..> MobileGalleryAppDto
PublishMobileGalleryAppCommand ..> MobileGalleryAppDto
GetPublicMobileGalleryQuery ..> PublicMobileGalleryDto

@enduml
```

![Application Layer - Commands, Queries, and DTOs](application-layer-commands-queries-and-dtos.png)

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class MobileGalleryController <<Controller>> {
  +Create() : ActionResult
  +Update() : ActionResult
  +Delete() : ActionResult
  +List() : ActionResult
  +GetById() : ActionResult
  +Publish() : ActionResult
}

class PublicMobileGalleryController <<Controller>> {
  +GetAppShell() : ActionResult
  +GetManifest() : ActionResult
  +GetServiceWorker() : ActionResult
  +GetImages() : ActionResult
}

class ManifestService <<Service>> {
  -_storage : IStorageService
  -_cdn : ICdnService
  -_db : IApplicationDbContext
  +GenerateManifestAsync(appId) : string
  +GenerateServiceWorkerAsync(appId) : string
}

class MobileGalleryBackgroundJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_storage : IStorageService
  -_cdn : ICdnService
  +GenerateAppIconsAsync(appId) : Task
  +WarmCdnCacheAsync(appId) : Task
}

interface IManifestService <<Interface>>
interface IStorageService <<Interface>>
interface ICdnService <<Interface>>

ManifestService ..|> IManifestService
ManifestService --> IStorageService
ManifestService --> ICdnService
MobileGalleryBackgroundJob --> IStorageService
MobileGalleryBackgroundJob --> ICdnService

MobileGalleryController ..> CreateMobileGalleryAppCommand
MobileGalleryController ..> UpdateMobileGalleryAppCommand
MobileGalleryController ..> PublishMobileGalleryAppCommand
PublicMobileGalleryController ..> GetPublicMobileGalleryQuery

@enduml
```

![Infrastructure & API Layer](infrastructure-api-layer.png)

---

## Sequence Diagrams

### Create Mobile Gallery App

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "MobileGalleryController" as API
participant "CreateMobileGalleryAppHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/mobile-galleries\n{collectionId, title, curatedMediaIds, theme, cta}
API -> Handler : Send(CreateMobileGalleryAppCommand)

Handler -> Handler : Verify PhotographerId via ICurrentUserService
Handler -> DB : Count existing apps for photographer
DB --> Handler : appCount

Handler -> Handler : Check plan limits\n(Free: appCount < 3, Paid: unlimited)

Handler -> DB : Load Collection & verify ownership
DB --> Handler : Collection

Handler -> Handler : Validate curatedMediaIds <= 200\nand belong to collection

Handler -> DB : Find client's favorite photo\n(FavoriteList for collection)
DB --> Handler : FavoriteItem (AppIconMediaId)

Handler -> DB : Create MobileGalleryApp\n(Status = Draft, slug generated)
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<MobileGalleryAppDto>
API --> Photographer : 201 Created {appId, slug, status: Draft}

@enduml
```

![Create Mobile Gallery App](create-mobile-gallery-app.png)

### Publish and Client Installation

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
actor Client
participant "MobileGalleryController" as MgmtAPI
participant "PublishHandler" as PubHandler
participant "IApplicationDbContext" as DB
participant "MobileGalleryBackgroundJob" as Job
participant "IStorageService" as Storage
participant "ICdnService" as CDN
participant "PublicMobileGalleryController" as PubAPI
participant "IManifestService" as Manifest

== Publish ==
Photographer -> MgmtAPI : POST /api/mobile-galleries/{id}/publish
MgmtAPI -> PubHandler : Send(PublishMobileGalleryAppCommand)
PubHandler -> DB : Load MobileGalleryApp (verify ownership)
DB --> PubHandler : MobileGalleryApp (Draft)
PubHandler -> PubHandler : Set Status = Published
PubHandler -> DB : SaveChangesAsync()
PubHandler --> MgmtAPI : Result<MobileGalleryAppDto>
MgmtAPI --> Photographer : 200 OK {shareLink: /m/{slug}}

... Background icon generation ...

Job -> DB : Load MobileGalleryApp
Job -> Storage : Download favorite photo
Storage --> Job : Image stream
Job -> Job : Resize to 192x192, 512x512
Job -> Storage : Upload icon variants
Job -> CDN : Warm cache for curated images

== Client Installation ==
Client -> PubAPI : GET /m/{slug}
PubAPI -> DB : Load MobileGalleryApp by slug
DB --> PubAPI : MobileGalleryApp (Published)
PubAPI --> Client : HTML shell + <link rel="manifest">

Client -> PubAPI : GET /m/{slug}/manifest.json
PubAPI -> Manifest : GenerateManifestAsync(appId)
Manifest --> PubAPI : JSON manifest
PubAPI --> Client : manifest.json\n(name, icons, theme_color, start_url)

Client -> Client : Browser "Install App" / \n"Add to Home Screen" prompt

Client -> PubAPI : GET /m/{slug}/sw.js
PubAPI -> Manifest : GenerateServiceWorkerAsync(appId)
Manifest --> PubAPI : Service worker script
PubAPI --> Client : sw.js (pre-cache image list)

@enduml
```

![Publish and Client Installation](publish-and-client-installation.png)

### Browse Gallery and Share Image

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "PublicMobileGalleryController" as API
participant "GetPublicMobileGalleryHandler" as Handler
participant "IApplicationDbContext" as DB
participant "ICdnService" as CDN
participant "ServiceWorker" as SW

Client -> API : GET /m/{slug}/images?page=1&pageSize=20
API -> Handler : Send(GetPublicMobileGalleryQuery)

Handler -> DB : Load MobileGalleryApp by slug
DB --> Handler : MobileGalleryApp

Handler -> Handler : Verify Status == Published
Handler -> DB : Load GalleryMedia by CuratedMediaIds\n(paginated)
DB --> Handler : List<GalleryMedia>

Handler -> CDN : Resolve CDN URLs for images
CDN --> Handler : Image URLs

Handler --> API : PublicMobileGalleryDto\n(images, contact, CTA, branding)
API --> Client : 200 OK {images, contactInfo, cta}

Client -> SW : Cache images for offline access
note right of SW
  Service worker intercepts
  image requests and caches
  responses for offline use
end note

Client -> Client : Tap share on image
Client -> Client : Native Web Share API\n(social platforms)

@enduml
```

![Browse Gallery and Share Image](browse-gallery-and-share-image.png)

### Delete Mobile Gallery App

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "MobileGalleryController" as API
participant "DeleteMobileGalleryAppHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage

Photographer -> API : DELETE /api/mobile-galleries/{id}
API -> Handler : Send(DeleteMobileGalleryAppCommand)

Handler -> Handler : Verify PhotographerId via ICurrentUserService
Handler -> DB : Load MobileGalleryApp (verify ownership)
DB --> Handler : MobileGalleryApp

Handler -> Handler : Soft-delete (IsDeleted = true)
Handler -> DB : SaveChangesAsync()

Handler -> Storage : Delete generated icon files
Storage --> Handler : OK

Handler --> API : Result.Success()
API --> Photographer : 200 OK

@enduml
```

![Delete Mobile Gallery App](delete-mobile-gallery-app.png)
