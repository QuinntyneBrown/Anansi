# F37 - Branding & Identity

## Overview

Branding & Identity centralizes every visual asset and configuration that makes a photographer's client-facing presence feel uniquely theirs. It spans profile icons, logo uploads, auto-generated cover logos, custom favicons, platform branding removal, document-level branding (contracts, invoices, questionnaires), and a global font theme. All of these settings radiate outward: they are consumed by gallery rendering, website pages, booking sites, email templates, document PDF generation, and the mobile gallery PWA.

The profile icon serves as the photographer's avatar across the platform -- either a default generated avatar or an uploaded image. The logo (PNG, transparent background, up to 5 MB) is the primary brand mark and appears in gallery headers, the website header, booking site, document headers, and email invitations. From the uploaded logo, the system auto-generates a white-on-transparent variant for overlaying on collection cover photos. Paid-plan photographers can upload a custom favicon that replaces the default Anansi icon in browser tabs, and can remove all "Powered by Anansi" badges from galleries, website, booking site, documents, and mobile gallery apps.

Document branding allows per-document-type customization: contracts, invoices, and questionnaires each get their own header image and brand color (hex code entry). The font theme is a single selection that propagates to the booking site, contracts, invoices, questionnaires, and email communications, ensuring visual consistency. All branding fields live on the existing `Photographer` entity and the `DocumentBranding` entity, with CQRS commands and queries exposing a unified "branding profile" surface.

**L2 Requirements:** BRD-7.1.1 (Profile Icon), BRD-7.1.2 (Logo Upload), BRD-7.1.3 (Collection Cover Logo), BRD-7.1.4 (Custom Favicon), BRD-7.1.5 (Platform Branding Removal), BRD-7.4.1 (Document Branding), BRD-7.4.2 (Font Theme)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Photographer` | Entity (existing) | Extended with branding properties: `ProfileIconUrl`, `LogoUrl`, `FaviconUrl`, `BrandColorHex`, `FontTheme`. These already exist on the entity and serve as the single source of truth for studio-wide branding. |
| `DocumentBranding` | Entity (existing) | Per-document-type branding overrides: `DocumentType` (Contract, Invoice, Questionnaire), `HeaderImageUrl`, `BrandColorHex`, `SecondaryColorHex`, `FontTheme`. Implements `ITenantEntity`. |
| `DocumentType` | Enum (existing) | `Contract`, `Invoice`, `Questionnaire`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetBrandingProfileQuery` | Query (existing) | Returns the complete branding profile: profile icon, logo, auto-generated cover logo URL, favicon, brand color, font theme, and whether platform branding is removed (derived from plan tier). |
| `UpdateBrandingProfileCommand` | Command (existing) | Updates profile icon URL, logo URL, favicon URL, brand color hex, and font theme on the `Photographer` entity. Validates hex color format. |
| `UploadLogoCommand` | Command | Accepts a file stream, validates PNG format and 5 MB size limit, uploads to storage via `IStorageService`, generates the white cover variant via `IImageProcessingService`, and updates `Photographer.LogoUrl`. |
| `UploadFaviconCommand` | Command | Accepts a file stream, validates ICO/PNG format, checks paid plan via `IPlanService`, uploads to storage, and updates `Photographer.FaviconUrl`. |
| `UploadProfileIconCommand` | Command | Accepts a file stream, uploads to storage, and updates `Photographer.ProfileIconUrl`. |
| `GetDocumentBrandingQuery` | Query | Returns all `DocumentBranding` records for the photographer, one per document type. |
| `UpsertDocumentBrandingCommand` | Command | Creates or updates the `DocumentBranding` for a specific `DocumentType`. Validates hex color format and header image URL. |
| `BrandingProfileDto` | DTO (existing) | Read model: photographer ID, profile icon, logo, cover logo, favicon, brand color, font theme, platform branding removed flag. |
| `DocumentBrandingDto` | DTO (existing) | Read model: ID, document type, header image URL, brand color hex, secondary color hex, font theme. |
| `IImageProcessingService` | Interface | Converts an uploaded logo to a white-on-transparent variant for cover overlays. |
| `IPlanService` | Interface | Checks whether the photographer's active plan includes a given feature (e.g., custom favicon, branding removal). |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ImageProcessingService` | Service | Implements `IImageProcessingService`. Uses ImageSharp to convert a color logo PNG to a white silhouette version, preserving alpha channel. Uploads the result to storage and returns the URL. |
| `PlanService` | Service | Implements `IPlanService`. Queries `Plans` and `PlanFeatureGates` to determine feature access. |
| `CoverLogoGenerationJob` | BackgroundJob | Triggered when a logo is uploaded. Generates the white cover variant asynchronously if the synchronous path times out. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `BrandingController` | Controller | Endpoints: `GET /api/branding` (profile), `PUT /api/branding` (update profile), `POST /api/branding/logo` (upload logo), `POST /api/branding/favicon` (upload favicon), `POST /api/branding/profile-icon` (upload icon), `GET /api/branding/documents` (list document branding), `PUT /api/branding/documents/{type}` (upsert document branding). All require `[Authorize]`. |

---

## Class Diagrams

### Domain Layer - Branding Entities

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

class Photographer {
  +Email : string
  +BusinessName : string
  +ProfileIconUrl : string?
  +LogoUrl : string?
  +FaviconUrl : string?
  +BrandColorHex : string?
  +FontTheme : string?
  +ActivePlanId : Guid?
  +Subdomain : string
}

class DocumentBranding {
  +PhotographerId : Guid
  +DocumentType : DocumentType
  +HeaderImageUrl : string?
  +BrandColorHex : string?
  +SecondaryColorHex : string?
  +FontTheme : string?
}

enum DocumentType {
  Contract
  Invoice
  Questionnaire
}

BaseEntity <|-- Photographer
BaseEntity <|-- DocumentBranding
DocumentBranding --> DocumentType
Photographer "1" --> "*" DocumentBranding : DocumentBrandings

@enduml
```

![Domain Layer - Branding Entities](domain-layer-branding-entities.png)

### Application Layer - Commands, Queries, and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class GetBrandingProfileQuery <<Query>> {
}

class UpdateBrandingProfileCommand <<Command>> {
  +ProfileIconUrl : string?
  +LogoUrl : string?
  +FaviconUrl : string?
  +BrandColorHex : string?
  +FontTheme : string?
}

class UploadLogoCommand <<Command>> {
  +FileStream : Stream
  +FileName : string
  +ContentType : string
}

class UploadFaviconCommand <<Command>> {
  +FileStream : Stream
  +FileName : string
}

class UploadProfileIconCommand <<Command>> {
  +FileStream : Stream
  +FileName : string
}

class GetDocumentBrandingQuery <<Query>> {
}

class UpsertDocumentBrandingCommand <<Command>> {
  +DocumentType : DocumentType
  +HeaderImageUrl : string?
  +BrandColorHex : string?
  +SecondaryColorHex : string?
  +FontTheme : string?
}

class BrandingProfileDto <<DTO>> {
  +PhotographerId : Guid
  +ProfileIconUrl : string?
  +LogoUrl : string?
  +CoverLogoUrl : string?
  +FaviconUrl : string?
  +BrandColorHex : string?
  +FontTheme : string?
  +PlatformBrandingRemoved : bool
}

class DocumentBrandingDto <<DTO>> {
  +Id : Guid
  +DocumentType : DocumentType
  +HeaderImageUrl : string?
  +BrandColorHex : string?
  +SecondaryColorHex : string?
  +FontTheme : string?
}

interface IImageProcessingService <<Interface>> {
  +GenerateWhiteVariantAsync(stream) : string
}

interface IPlanService <<Interface>> {
  +HasFeatureAsync(photographerId, feature) : bool
}

UploadLogoCommand ..> IImageProcessingService
UploadFaviconCommand ..> IPlanService
GetBrandingProfileQuery ..> BrandingProfileDto
UpsertDocumentBrandingCommand ..> DocumentBrandingDto

@enduml
```

![Application Layer - Commands, Queries, and Services](application-layer-commands-queries-and-services.png)

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class BrandingController <<Controller>> {
  +GetProfile() : ActionResult
  +UpdateProfile() : ActionResult
  +UploadLogo() : ActionResult
  +UploadFavicon() : ActionResult
  +UploadProfileIcon() : ActionResult
  +GetDocumentBranding() : ActionResult
  +UpsertDocumentBranding() : ActionResult
}

class ImageProcessingService <<Service>> {
  -_storage : IStorageService
  +GenerateWhiteVariantAsync(stream) : string
}

class PlanService <<Service>> {
  -_db : IApplicationDbContext
  +HasFeatureAsync(photographerId, feature) : bool
}

class CoverLogoGenerationJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_imageProcessing : IImageProcessingService
  -_storage : IStorageService
  +ProcessAsync(photographerId) : Task
}

interface IImageProcessingService <<Interface>>
interface IPlanService <<Interface>>
interface IStorageService <<Interface>>

ImageProcessingService ..|> IImageProcessingService
PlanService ..|> IPlanService
ImageProcessingService --> IStorageService
CoverLogoGenerationJob --> IImageProcessingService
CoverLogoGenerationJob --> IStorageService

BrandingController ..> GetBrandingProfileQuery
BrandingController ..> UpdateBrandingProfileCommand
BrandingController ..> UploadLogoCommand
BrandingController ..> UpsertDocumentBrandingCommand

@enduml
```

![Infrastructure & API Layer](infrastructure-api-layer.png)

---

## Sequence Diagrams

### Upload Logo with Cover Logo Generation

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "BrandingController" as API
participant "UploadLogoHandler" as Handler
participant "IStorageService" as Storage
participant "IImageProcessingService" as ImgProc
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/branding/logo\n[multipart: logo.png, 3.2 MB]
API -> Handler : Send(UploadLogoCommand)

Handler -> Handler : Verify PhotographerId
Handler -> Handler : Validate PNG format, size <= 5 MB

Handler -> Storage : UploadAsync(stream, "logos/{id}/logo.png")
Storage --> Handler : logoUrl

Handler -> ImgProc : GenerateWhiteVariantAsync(stream)
note right of ImgProc
  Converts all opaque pixels
  to white, preserving alpha.
  Uploads as "logos/{id}/cover-logo.png"
end note
ImgProc -> Storage : UploadAsync(whiteStream, "logos/{id}/cover-logo.png")
Storage --> ImgProc : coverLogoUrl
ImgProc --> Handler : coverLogoUrl

Handler -> DB : Update Photographer.LogoUrl = logoUrl
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<BrandingProfileDto>
API --> Photographer : 200 OK {logoUrl, coverLogoUrl}

@enduml
```

![Upload Logo with Cover Logo Generation](upload-logo-with-cover-logo-generation.png)

### Get Branding Profile

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "BrandingController" as API
participant "GetBrandingProfileHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/branding
API -> Handler : Send(GetBrandingProfileQuery)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Load Photographer by Id
DB --> Handler : Photographer

Handler -> Handler : Derive coverLogoUrl from LogoUrl\n(path convention: /logos/cover-)
Handler -> Handler : Determine PlatformBrandingRemoved\n(ActivePlanId is not null)

Handler --> API : Result<BrandingProfileDto>
API --> Photographer : 200 OK\n{profileIcon, logo, coverLogo,\nfavicon, brandColor, fontTheme,\nplatformBrandingRemoved}

@enduml
```

![Get Branding Profile](get-branding-profile.png)

### Upload Custom Favicon (Paid Plan Gate)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "BrandingController" as API
participant "UploadFaviconHandler" as Handler
participant "IPlanService" as Plans
participant "IStorageService" as Storage
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/branding/favicon\n[multipart: favicon.png]
API -> Handler : Send(UploadFaviconCommand)

Handler -> Handler : Verify PhotographerId

Handler -> Plans : HasFeatureAsync(photographerId, "CustomFavicon")
Plans --> Handler : true / false

alt Plan does not include favicon
  Handler --> API : Result.Failure("Custom favicon requires a paid plan", 403)
  API --> Photographer : 403 Forbidden
else Plan includes favicon
  Handler -> Storage : UploadAsync(stream, "favicons/{id}/favicon.png")
  Storage --> Handler : faviconUrl

  Handler -> DB : Update Photographer.FaviconUrl
  Handler -> DB : SaveChangesAsync()

  Handler --> API : Result<BrandingProfileDto>
  API --> Photographer : 200 OK {faviconUrl}
end

@enduml
```

![Upload Custom Favicon (Paid Plan Gate)](upload-custom-favicon-paid-plan-gate.png)

### Upsert Document Branding

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "BrandingController" as API
participant "UpsertDocumentBrandingHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : PUT /api/branding/documents/Contract\n{headerImageUrl, brandColorHex: "#C9A962",\nsecondaryColorHex: "#1A1A1C", fontTheme: "Cormorant Garamond"}
API -> Handler : Send(UpsertDocumentBrandingCommand)

Handler -> Handler : Verify PhotographerId
Handler -> Handler : Validate hex color format

Handler -> DB : Find DocumentBranding\n(PhotographerId, DocumentType.Contract)
DB --> Handler : DocumentBranding? (may be null)

alt Existing record found
  Handler -> Handler : Update fields\n(headerImage, colors, font)
else No existing record
  Handler -> Handler : Create new DocumentBranding\n(PhotographerId, Contract)
  Handler -> DB : Add DocumentBranding
end

Handler -> DB : SaveChangesAsync()

Handler --> API : Result<DocumentBrandingDto>
API --> Photographer : 200 OK {id, documentType, headerImageUrl, colors, font}

@enduml
```

![Upsert Document Branding](upsert-document-branding.png)

### Platform Branding Check (Consumed by Gallery Rendering)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "GalleryController" as GalAPI
participant "RenderGalleryHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IPlanService" as Plans

Client -> GalAPI : GET /g/{slug}
GalAPI -> Handler : Send(RenderGalleryQuery)

Handler -> DB : Load Collection by slug
DB --> Handler : Collection

Handler -> DB : Load Photographer by Collection.PhotographerId
DB --> Handler : Photographer

Handler -> Plans : HasFeatureAsync(\nphotographerId, "BrandingRemoval")
Plans --> Handler : isPaid (true/false)

Handler -> Handler : Build gallery HTML
note right of Handler
  If isPaid = true:
    No "Powered by Anansi" footer
    Use photographer's favicon
  If isPaid = false:
    Show "Powered by Anansi" badge
    Use default Anansi favicon
end note

Handler --> GalAPI : Gallery HTML
GalAPI --> Client : 200 OK (rendered gallery)

@enduml
```

![Platform Branding Check (Consumed by Gallery Rendering)](platform-branding-check-consumed-by-gallery-rendering.png)
