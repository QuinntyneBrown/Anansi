# F09 - Gallery Sharing & Social

## Overview

Gallery Sharing & Social enables photographers and their clients to distribute gallery content across communication channels and social platforms. The feature begins with email invitations: photographers compose branded emails using templates with custom subject lines, body text, and header images. The collection password can optionally be embedded in the email body. Each invitation tracks delivery status (sent and opened timestamps), giving photographers visibility into engagement.

Social media sharing covers Facebook, Instagram, Pinterest, WhatsApp, Messenger, Threads, email, and copy-link options. Both full collections and individual images can be shared. The system generates Open Graph metadata (title, description, preview image) for each shareable URL so that social platforms render rich previews. Quick Share allows photographers to select specific photos within a collection and generate a unique URL showing only those photos, independent of the collection's privacy settings. These links are revocable at any time.

QR code generation produces a scannable code linking to any collection, downloadable as a PNG image. Gallery embedding provides iframe and JavaScript snippet options that photographers can paste into external websites, with embedded galleries respecting the collection's privacy settings (password prompts render within the embed frame).

## Requirements Traceability

| Requirement | Description |
|---|---|
| GAL-1.7.1 | Email Invitations (branded templates, custom subject/body/header, optional password, delivery tracking) |
| GAL-1.7.2 | Social Media Sharing (8 platforms, Open Graph metadata, collection + individual image) |
| GAL-1.7.3 | Quick Share (photographer-selected photos, unique URL, privacy-independent, revocable) |
| GAL-1.7.4 | QR Code Generation (scannable, downloadable as PNG) |
| GAL-1.7.5 | Gallery Embedding (iframe/JS snippet, respects privacy settings) |

## Components

### Domain Layer

**EmailInvitation** (Entity) — Tracks a single email invitation for a collection. Stores the recipient email, subject, body text, optional header image URL, whether the collection password was included, and delivery tracking fields: `IsSent`, `SentAt`, `IsOpened`, `OpenedAt`. Implements `ITenantEntity`.

**QuickShareLink** (Entity) — Represents a curated photo selection with a unique token-based URL. Stores the comma-separated media IDs and a revocation flag. The link URL is derived from the token, not the collection slug, making it independent of collection privacy. Implements `ITenantEntity`.

**Collection** (Entity, existing) — Extended with `EmbeddingEnabled` and `EmbedCode` fields for gallery embedding support, and `GoogleAnalyticsPropertyId` for analytics tag injection into embedded galleries.

**SharePlatform** (Enum) — `Facebook`, `Instagram`, `Pinterest`, `WhatsApp`, `Messenger`, `Threads`, `Email`, `CopyLink`.

### Application Layer

**SendEmailInvitationCommand** — Composes and sends a branded email invitation for a collection. Optionally appends the collection password to the body. Records the invitation entity with delivery status. Uses `IEmailService` for sending.

**ListEmailInvitationsQuery** — Returns all invitations for a collection with delivery status.

**TrackEmailOpenCommand** — Updates an `EmailInvitation` record when the recipient opens the email (triggered by a tracking pixel or webhook from the email provider).

**GetShareMetadataQuery** — Generates Open Graph metadata for a collection or individual image, returning title, description, and preview image URL suitable for social platform rendering.

**CreateQuickShareLinkCommand** — Creates a `QuickShareLink` for a photographer-selected set of media IDs. Generates a unique token and persists the link.

**RevokeQuickShareLinkCommand** — Sets `IsRevoked = true` on a `QuickShareLink`, making the URL return a 404/gone response.

**ListQuickShareLinksQuery** — Returns all quick share links for a collection with revocation status.

**GetQuickSharePhotosQuery** — Resolves a quick share token to the list of photos, returning media data only if the link is not revoked.

**GenerateQrCodeQuery** — Generates a QR code PNG for a collection URL. Returns the image as a base64 data URL or byte array.

**GetEmbedCodeQuery** — Generates iframe and JavaScript embed snippets for a collection. The embed code includes privacy enforcement (the embedded view will prompt for a password if the collection requires one).

**IQrCodeService** (Interface) — Abstracts QR code image generation. Implemented in Infrastructure.

### Infrastructure Layer

**QrCodeService** — Implements `IQrCodeService` using a library such as QRCoder or SkiaSharp to generate PNG-format QR code images from URLs.

**EmailTrackingMiddleware** — Handles tracking pixel requests or email provider webhook callbacks to mark invitations as opened.

**OpenGraphMiddleware** — Injects Open Graph meta tags into the HTML response for gallery pages so that social platform crawlers receive rich preview metadata.

### API Layer

**SharingController** — Exposes endpoints for sending invitations, listing invitations, creating/revoking quick share links, generating QR codes, and retrieving embed code.

**QuickShareController** — Public-facing controller that resolves quick share tokens to photo galleries (no authentication required, but respects revocation).

**OpenGraphController** — Serves Open Graph metadata for social platform crawlers, returning appropriate meta tags for collections and individual images.

## Class Diagrams

### Domain Layer - Sharing Entities

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

class EmailInvitation {
  +PhotographerId : Guid
  +CollectionId : Guid
  +RecipientEmail : string
  +Subject : string
  +Body : string
  +HeaderImageUrl : string?
  +IncludePassword : bool
  +IsSent : bool
  +SentAt : DateTime?
  +IsOpened : bool
  +OpenedAt : DateTime?
}

class QuickShareLink {
  +PhotographerId : Guid
  +CollectionId : Guid
  +Token : string
  +MediaIds : string
  +IsRevoked : bool
}

class Collection {
  +EmbeddingEnabled : bool
  +EmbedCode : string?
  +Slug : string
  +Password : string?
}

enum SharePlatform {
  Facebook
  Instagram
  Pinterest
  WhatsApp
  Messenger
  Threads
  Email
  CopyLink
}

BaseEntity <|-- EmailInvitation
BaseEntity <|-- QuickShareLink
Collection "1" --> "*" EmailInvitation
Collection "1" --> "*" QuickShareLink

@enduml
```

![Domain Layer - Sharing Entities](domain-layer-sharing-entities.png)

### Application Layer - Commands, Queries, and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class SendEmailInvitationCommand <<Command>> {
  +CollectionId : Guid
  +RecipientEmail : string
  +Subject : string
  +Body : string
  +HeaderImageUrl : string?
  +IncludePassword : bool
}

class TrackEmailOpenCommand <<Command>> {
  +InvitationId : Guid
}

class GetShareMetadataQuery <<Query>> {
  +CollectionId : Guid
  +MediaId : Guid?
  +Platform : SharePlatform
}

class CreateQuickShareLinkCommand <<Command>> {
  +CollectionId : Guid
  +MediaIds : List<Guid>
}

class RevokeQuickShareLinkCommand <<Command>> {
  +QuickShareLinkId : Guid
}

class GetQuickSharePhotosQuery <<Query>> {
  +Token : string
}

class GenerateQrCodeQuery <<Query>> {
  +CollectionId : Guid
}

class GetEmbedCodeQuery <<Query>> {
  +CollectionId : Guid
}

class EmailInvitationDto <<DTO>> {
  +Id : Guid
  +RecipientEmail : string
  +IsSent : bool
  +SentAt : DateTime?
  +IsOpened : bool
  +OpenedAt : DateTime?
}

class QuickShareLinkDto <<DTO>> {
  +Id : Guid
  +Token : string
  +MediaIds : string
  +IsRevoked : bool
}

class ShareMetadataDto <<DTO>> {
  +Title : string
  +Description : string
  +PreviewImageUrl : string
  +CanonicalUrl : string
}

class QrCodeResult <<DTO>> {
  +CollectionUrl : string
  +QrCodeDataUrl : string
}

class EmbedCodeResult <<DTO>> {
  +IframeSnippet : string
  +JavaScriptSnippet : string
}

interface IQrCodeService <<Interface>> {
  +GenerateAsync(url) : byte[]
}

@enduml
```

![Application Layer - Commands, Queries, and Services](application-layer-commands-queries-and-services.png)

### API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class SharingController <<Controller>> {
  +SendInvitation() : ActionResult
  +ListInvitations() : ActionResult
  +CreateQuickShareLink() : ActionResult
  +RevokeQuickShareLink() : ActionResult
  +ListQuickShareLinks() : ActionResult
  +GenerateQrCode() : ActionResult
  +GetEmbedCode() : ActionResult
}

class QuickShareController <<Controller>> {
  +GetSharedPhotos(token) : ActionResult
}

class OpenGraphController <<Controller>> {
  +GetCollectionMeta(slug) : ActionResult
  +GetImageMeta(slug, mediaId) : ActionResult
}

class EmailTrackingMiddleware <<Middleware>> {
  +InvokeAsync(HttpContext) : Task
}

class OpenGraphMiddleware <<Middleware>> {
  +InvokeAsync(HttpContext) : Task
}

SharingController ..> SendEmailInvitationCommand
SharingController ..> CreateQuickShareLinkCommand
SharingController ..> GenerateQrCodeQuery
QuickShareController ..> GetQuickSharePhotosQuery
OpenGraphController ..> GetShareMetadataQuery

@enduml
```

![API Layer](api-layer.png)

## Sequence Diagrams

### Send Email Invitation with Password

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "SharingController" as API
participant "SendEmailInvitationHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email

Photographer -> API : POST /api/collections/{id}/invitations\n{recipientEmail, subject, body,\nheaderImageUrl, includePassword: true}
API -> Handler : Send(SendEmailInvitationCommand)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Find Collection by Id & PhotographerId
DB --> Handler : Collection

Handler -> Handler : Build email body
alt includePassword && Collection.Password exists
  Handler -> Handler : Append password to body
end

Handler -> DB : Create EmailInvitation entity

Handler -> Email : SendAsync(recipientEmail,\nsubject, body)
alt Send succeeds
  Handler -> Handler : Set IsSent=true, SentAt=UtcNow
else Send fails
  Handler -> Handler : Set IsSent=false
end

Handler -> DB : SaveChangesAsync()
Handler --> API : Result<EmailInvitationDto>
API --> Photographer : 201 Created

@enduml
```

![Send Email Invitation with Password](send-email-invitation-with-password.png)

### Track Email Open

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor "Email Client" as Recipient
participant "EmailTrackingMiddleware" as Middleware
participant "TrackEmailOpenHandler" as Handler
participant "IApplicationDbContext" as DB

Recipient -> Middleware : GET /api/tracking/pixel/{invitationId}.png
Middleware -> Handler : Send(TrackEmailOpenCommand)

Handler -> DB : Find EmailInvitation by Id
DB --> Handler : EmailInvitation

alt Not already opened
  Handler -> Handler : Set IsOpened=true,\nOpenedAt=UtcNow
  Handler -> DB : SaveChangesAsync()
end

Handler --> Middleware : Result.Success()
Middleware --> Recipient : 200 OK (1x1 transparent PNG)

@enduml
```

![Track Email Open](track-email-open.png)

### Social Media Share with Open Graph

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "Client Browser" as Browser
participant "OpenGraphController" as OG
participant "GetShareMetadataHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage
actor "Social Platform Crawler" as Crawler

Client -> Browser : Click "Share to Facebook"\non collection or photo

Browser -> Browser : Build share URL:\nhttps://gallery.example.com/{slug}\nor .../photos/{mediaId}

Browser -> Browser : Open Facebook share dialog\nwith URL

Crawler -> OG : GET /gallery/{slug}\n(User-Agent: facebookexternalhit)
OG -> Handler : Send(GetShareMetadataQuery)

Handler -> DB : Find Collection by slug
DB --> Handler : Collection

alt MediaId is provided
  Handler -> DB : Find GalleryMedia by Id
  DB --> Handler : GalleryMedia
  Handler -> Storage : GetPresignedUrlAsync(thumbnailKey)
  Storage --> Handler : Preview image URL
  Handler -> Handler : Build metadata:\ntitle=photo filename,\ndescription=collection title,\nimage=preview URL
else Collection-level share
  Handler -> Storage : GetPresignedUrlAsync(coverPhotoKey)
  Storage --> Handler : Cover image URL
  Handler -> Handler : Build metadata:\ntitle=collection title,\ndescription=collection description,\nimage=cover URL
end

Handler --> OG : ShareMetadataDto
OG --> Crawler : HTML with og: meta tags

note right of Crawler
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="..." />
  <meta property="og:url" content="..." />
end note

@enduml
```

![Social Media Share with Open Graph](social-media-share-with-open-graph.png)

### Create and Access Quick Share Link

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "SharingController" as API
participant "CreateQuickShareLinkHandler" as CreateHandler
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/collections/{id}/quick-share\n{mediaIds: [guid1, guid2, guid3]}
API -> CreateHandler : Send(CreateQuickShareLinkCommand)

CreateHandler -> CreateHandler : Verify PhotographerId
CreateHandler -> DB : Find Collection by Id & PhotographerId
DB --> CreateHandler : Collection

CreateHandler -> DB : Create QuickShareLink\n{Token=random, MediaIds=csv}
CreateHandler -> DB : SaveChangesAsync()

CreateHandler --> API : Result<QuickShareLinkDto>
API --> Photographer : 201 Created\n{token: "abc123...", url: "/share/abc123..."}

== Later: Anyone accesses the link ==

actor Viewer
participant "QuickShareController" as Public
participant "GetQuickSharePhotosHandler" as GetHandler

Viewer -> Public : GET /share/{token}
Public -> GetHandler : Send(GetQuickSharePhotosQuery)

GetHandler -> DB : Find QuickShareLink by Token
DB --> GetHandler : QuickShareLink

alt IsRevoked
  GetHandler --> Public : Result.NotFound("Link revoked")
  Public --> Viewer : 404 Not Found
else Active
  GetHandler -> DB : Load GalleryMedia by parsed MediaIds
  DB --> GetHandler : List<GalleryMedia>
  GetHandler --> Public : Result<List<GalleryMediaDto>>
  Public --> Viewer : 200 OK (photo gallery)
end

@enduml
```

![Create and Access Quick Share Link](create-and-access-quick-share-link.png)

### Generate QR Code

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "SharingController" as API
participant "GenerateQrCodeHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IQrCodeService" as QR

Photographer -> API : GET /api/collections/{id}/qr-code
API -> Handler : Send(GenerateQrCodeQuery)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Find Collection by Id & PhotographerId
DB --> Handler : Collection

Handler -> Handler : Build URL: /gallery/{slug}
Handler -> QR : GenerateAsync(url)
QR --> Handler : byte[] (PNG image data)

Handler -> Handler : Convert to base64 data URL

Handler --> API : Result<QrCodeResult>\n{collectionUrl, qrCodeDataUrl}
API --> Photographer : 200 OK

note right of Photographer
  Photographer can download
  the QR code PNG for print
  materials, event displays, etc.
end note

@enduml
```

![Generate QR Code](generate-qr-code.png)

### Get Embed Code

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "SharingController" as API
participant "GetEmbedCodeHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/collections/{id}/embed
API -> Handler : Send(GetEmbedCodeQuery)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Find Collection by Id & PhotographerId
DB --> Handler : Collection

alt EmbeddingEnabled
  Handler -> Handler : Generate iframe snippet:\n<iframe src="/gallery/{slug}/embed"\nwidth="100%" height="600"></iframe>

  Handler -> Handler : Generate JS snippet:\n<div id="anansi-gallery"></div>\n<script src="/embed.js?c={id}"></script>

  Handler --> API : Result<EmbedCodeResult>
  API --> Photographer : 200 OK
else Embedding disabled
  Handler --> API : Result.Failure("Embedding not enabled")
  API --> Photographer : 400 Bad Request
end

note right of Handler
  Embedded galleries respect privacy:
  password-protected collections
  show a password prompt within
  the iframe/embed container.
end note

@enduml
```

![Get Embed Code](get-embed-code.png)
