# F20 - SEO & Discovery

## Overview

The SEO & Discovery feature equips photographers with tools to optimize their websites for search engines and social media sharing. Poor SEO is a common gap in photographer websites, and this feature addresses it through both manual controls and AI-assisted automation.

The SEO Manager (WEB-3.5.1) provides a centralized dashboard where photographers can edit page titles and meta descriptions for every page, run SEO audits that flag missing titles, descriptions, and alt text, and manage all SEO settings from one place. The audit produces an actionable report of issues organized by page, enabling photographers to systematically address gaps without navigating to each page individually.

AI-powered tools assist with two common SEO tasks. AI Alt Text Generation (WEB-3.5.2) automatically generates descriptive alt text for images, supporting both individual and bulk operations, with all generated text editable before saving. AI Page Description Generation (WEB-3.5.3) creates meta descriptions from page content, also editable before committing. Both features depend on an `IAiContentService` interface that abstracts the underlying AI provider.

URL Redirects (WEB-3.5.4) allow photographers to create 301 (permanent) or 302 (temporary) redirects with configurable source and destination URLs, supporting site restructuring without breaking existing links. Social Sharing Images (WEB-3.5.5) enable custom Open Graph image configuration per page, controlling how pages appear when shared on social media platforms.

## Components

### Domain Layer

**WebsitePage** (SEO properties) -- The `WebsitePage` entity stores per-page SEO metadata: `MetaTitle`, `MetaDescription`, and `OgImageUrl`. These fields are managed through the SEO Manager dashboard and surface in the generated HTML `<head>` section.

**Website** (SEO defaults) -- The `Website` entity stores site-wide defaults: `DefaultMetaTitle`, `DefaultMetaDescription`, and `DefaultOgImageUrl`. These apply as fallbacks when individual pages lack specific SEO metadata.

**PageElement** (alt text) -- Image-type `PageElement` entities store alt text within their `ContentJson` field. The SEO audit inspects these for missing or empty alt text values.

**UrlRedirect** (`Anansi.Domain.Entities.Website.UrlRedirect`) -- Represents a URL redirect rule. Contains `SourcePath` (the old URL path), `DestinationUrl` (the target URL), `RedirectType` (from the `RedirectType` enum: Permanent301, Temporary302), and `IsActive` toggle. Implements `ITenantEntity` for per-photographer scoping.

**BlogPost** (SEO properties) -- Blog posts also have `MetaTitle`, `MetaDescription`, and `OgImageUrl` fields included in the SEO audit scan.

### Application Layer

**RunSeoAuditQuery / RunSeoAuditHandler** -- Scans all pages and blog posts for a website, identifying SEO issues: missing meta titles, missing meta descriptions, images without alt text. Returns `SeoAuditResultDto` containing a list of `SeoIssueDto` entries with page identification, issue type, and description.

**UpdatePageSeoCommand / UpdatePageSeoHandler** -- Updates SEO metadata (MetaTitle, MetaDescription, OgImageUrl) for a specific page. Part of the SEO Manager's per-page editing flow.

**GenerateAiAltTextCommand / GenerateAiAltTextHandler** -- Generates alt text for one or more images using AI. Accepts a list of image element IDs or image URLs. Calls `IAiContentService.GenerateAltTextAsync()` for each image. Returns the generated alt text without saving, allowing the photographer to review and edit before committing.

**SaveAltTextCommand / SaveAltTextHandler** -- Saves reviewed/edited alt text to the `ContentJson` of image elements. Accepts a list of `(elementId, altText)` pairs for bulk saving.

**GenerateAiDescriptionCommand / GenerateAiDescriptionHandler** -- Generates a meta description for a page based on its content. Aggregates text content from all `PageElement` entities on the page, sends it to `IAiContentService.GenerateDescriptionAsync()`, and returns the generated description without saving.

**CreateUrlRedirectCommand / CreateUrlRedirectHandler** -- Creates a new URL redirect. Validates that the source path does not conflict with existing page slugs or other active redirects. Returns `UrlRedirectDto`.

**UpdateUrlRedirectCommand / UpdateUrlRedirectHandler** -- Updates an existing redirect's source path, destination URL, redirect type, or active status.

**DeleteUrlRedirectCommand / DeleteUrlRedirectHandler** -- Deletes a URL redirect.

**ListUrlRedirectsQuery / ListUrlRedirectsHandler** -- Returns all redirects for a website, ordered by creation date.

**UpdateOgImageCommand / UpdateOgImageHandler** -- Uploads or sets a custom Open Graph image for a specific page. Stores the URL in `WebsitePage.OgImageUrl`.

### Infrastructure Layer

**AiContentService** -- Infrastructure implementation of `IAiContentService` that calls an external AI API (e.g., OpenAI) for alt text generation and page description generation. Handles rate limiting, retries, and response parsing.

**EF Core Configurations** -- `UrlRedirect` configuration defines indexes on `(WebsiteId, SourcePath)` for fast redirect resolution and uniqueness validation. The redirect middleware uses this index to intercept incoming requests.

**RedirectMiddleware** -- ASP.NET Core middleware that intercepts incoming requests, checks for matching active redirects, and returns the appropriate 301 or 302 response before the request reaches the controller pipeline.

### API Layer

**WebsiteSeoController** (`api/websites/{websiteId}/seo`) -- Centralized SEO management endpoints. `GET audit` runs the SEO audit, `POST ai-alt-text` generates AI alt text, `POST ai-description/{pageId}` generates AI page descriptions, `GET redirects` lists redirects, `POST redirects` creates, `PUT redirects/{id}` updates, and `DELETE redirects/{id}` removes redirects.

**WebsitePagesController** -- The `PUT` endpoint for pages handles SEO metadata updates and OG image configuration as part of the page update flow.

## Class Diagrams

### Domain Layer -- SEO Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Website" {
  class Website {
    +Id : Guid
    +PhotographerId : Guid
    +DefaultMetaTitle : string?
    +DefaultMetaDescription : string?
    +DefaultOgImageUrl : string?
  }

  class WebsitePage {
    +Id : Guid
    +WebsiteId : Guid
    +Title : string
    +Slug : string
    +MetaTitle : string?
    +MetaDescription : string?
    +OgImageUrl : string?
  }

  class BlogPost {
    +Id : Guid
    +WebsiteId : Guid
    +Title : string
    +Slug : string
    +MetaTitle : string?
    +MetaDescription : string?
    +OgImageUrl : string?
  }

  class PageElement {
    +Id : Guid
    +PageId : Guid
    +ElementType : ElementType
    +ContentJson : string?
  }
}

note right of PageElement
  For Image elements,
  ContentJson includes:
  { imageUrl, altText }
  SEO audit checks altText
  is present and non-empty.
end note

Website --> "*" WebsitePage : Pages
Website --> "*" BlogPost : BlogPosts
WebsitePage --> "*" PageElement : Elements

@enduml
```

![Domain Layer -- SEO Entities](domain-layer-seo-entities.png)

### Domain Layer -- URL Redirects

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Website" {
  class Website {
    +Id : Guid
    +PhotographerId : Guid
  }

  class UrlRedirect {
    +Id : Guid
    +PhotographerId : Guid
    +WebsiteId : Guid
    +SourcePath : string
    +DestinationUrl : string
    +RedirectType : RedirectType
    +IsActive : bool
    +CreatedAt : DateTime
    +UpdatedAt : DateTime
  }
}

package "Anansi.Domain.Enums" {
  enum RedirectType {
    Permanent301 = 301
    Temporary302 = 302
  }
}

Website --> "*" UrlRedirect : UrlRedirects
UrlRedirect ..> RedirectType

@enduml
```

![Domain Layer -- URL Redirects](domain-layer-url-redirects.png)

### Application Layer -- SEO Audit & AI Content

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Website.Seo" {
  class RunSeoAuditQuery <<record>> {
    +WebsiteId : Guid
  }
  class RunSeoAuditHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
  }

  class GenerateAiAltTextCommand <<record>> {
    +ElementIds : List<Guid>?
    +ImageUrls : List<string>?
  }
  class GenerateAiAltTextHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
    -_aiService : IAiContentService
  }

  class GenerateAiDescriptionCommand <<record>> {
    +PageId : Guid
  }
  class GenerateAiDescriptionHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
    -_aiService : IAiContentService
  }

  class SaveAltTextCommand <<record>> {
    +Entries : List<AltTextEntry>
  }
  class "<<record>> AltTextEntry" as ATE {
    +ElementId : Guid
    +AltText : string
  }
}

package "Anansi.Application.DTOs.Website" {
  class SeoAuditResultDto <<record>> {
    +WebsiteId : Guid
    +Issues : List<SeoIssueDto>
  }
  class SeoIssueDto <<record>> {
    +PageTitle : string
    +Slug : string
    +PageId : Guid?
    +IssueType : string
    +Description : string
  }
}

package "Anansi.Application.Interfaces" {
  interface IAiContentService {
    +GenerateAltTextAsync(imageUrl) : string
    +GenerateDescriptionAsync(pageContent) : string
  }
}

RunSeoAuditHandler ..> SeoAuditResultDto : returns
GenerateAiAltTextHandler --> IAiContentService
GenerateAiDescriptionHandler --> IAiContentService
SaveAltTextCommand --> ATE

@enduml
```

![Application Layer -- SEO Audit & AI Content](application-layer-seo-audit-ai-content.png)

### Application Layer -- URL Redirect Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Website.Seo" {
  class CreateUrlRedirectCommand <<record>> {
    +WebsiteId : Guid
    +SourcePath : string
    +DestinationUrl : string
    +RedirectType : RedirectType
  }
  class CreateUrlRedirectHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
  }

  class UpdateUrlRedirectCommand <<record>> {
    +RedirectId : Guid
    +SourcePath : string
    +DestinationUrl : string
    +RedirectType : RedirectType
    +IsActive : bool
  }
  class UpdateUrlRedirectHandler

  class DeleteUrlRedirectCommand <<record>> {
    +RedirectId : Guid
  }
  class DeleteUrlRedirectHandler

  class ListUrlRedirectsQuery <<record>> {
    +WebsiteId : Guid
  }
  class ListUrlRedirectsHandler
}

package "Anansi.Application.DTOs.Website" {
  class UrlRedirectDto <<record>> {
    +Id : Guid
    +WebsiteId : Guid
    +SourcePath : string
    +DestinationUrl : string
    +RedirectType : RedirectType
    +IsActive : bool
    +CreatedAt : DateTime
  }
}

CreateUrlRedirectHandler ..> UrlRedirectDto : returns
UpdateUrlRedirectHandler ..> UrlRedirectDto : returns
ListUrlRedirectsHandler ..> UrlRedirectDto : returns

@enduml
```

![Application Layer -- URL Redirect Commands](application-layer-url-redirect-commands.png)

### API & Infrastructure Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Api.Controllers" {
  class WebsiteSeoController <<ApiController>> {
    -_mediator : IMediator
    +RunAudit(websiteId) : IActionResult
    +GenerateAltText(command) : IActionResult
    +GenerateDescription(pageId) : IActionResult
    +ListRedirects(websiteId) : IActionResult
    +CreateRedirect(websiteId, command) : IActionResult
    +UpdateRedirect(redirectId, command) : IActionResult
    +DeleteRedirect(redirectId) : IActionResult
  }
}

package "Anansi.Api.Middleware" {
  class RedirectMiddleware {
    -_next : RequestDelegate
    +InvokeAsync(context, db) : Task
  }
}

package "Anansi.Infrastructure.Services" {
  class AiContentService {
    -_httpClient : HttpClient
    -_config : AiServiceConfig
    +GenerateAltTextAsync(imageUrl) : string
    +GenerateDescriptionAsync(content) : string
  }
}

WebsiteSeoController --> "IMediator"
RedirectMiddleware --> "IApplicationDbContext" : checks redirects
AiContentService ..|> "IAiContentService"

@enduml
```

![API & Infrastructure Layer](api-infrastructure-layer.png)

## Sequence Diagrams

### Run SEO Audit (WEB-3.5.1)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteSeoController" as C
participant "IMediator" as M
participant "RunSeoAuditHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : GET /api/websites/{wId}/seo/audit
C -> M : Send(RunSeoAuditQuery)
M -> H : Handle(query)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load Website\n(websiteId, photographerId)
DB --> H : Website

H -> DB : Load all Pages\nwith Elements for website
DB --> H : List<WebsitePage>

H -> DB : Load all BlogPosts\nfor website
DB --> H : List<BlogPost>

H -> H : Initialize issues list

loop each page
  alt MetaTitle is null/empty
    H -> H : Add SeoIssueDto\n("Missing meta title")
  end
  alt MetaDescription is null/empty
    H -> H : Add SeoIssueDto\n("Missing meta description")
  end
  loop each Image element on page
    H -> H : Parse ContentJson\nextract altText
    alt altText is null/empty
      H -> H : Add SeoIssueDto\n("Missing alt text for image")
    end
  end
end

loop each blog post
  alt MetaTitle is null/empty
    H -> H : Add SeoIssueDto\n("Missing blog post meta title")
  end
  alt MetaDescription is null/empty
    H -> H : Add SeoIssueDto\n("Missing blog post meta description")
  end
end

H --> M : Result.Success(\nSeoAuditResultDto { issues })
M --> C : result
C --> P : 200 OK { websiteId, issues[] }

@enduml
```

![Run SEO Audit (WEB-3.5.1)](run-seo-audit-web-3-5-1.png)

### Generate AI Alt Text for Images (WEB-3.5.2)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteSeoController" as C
participant "IMediator" as M
participant "GenerateAiAltTextHandler" as H
participant "ICurrentUserService" as U
participant "IAiContentService" as AI
participant "IApplicationDbContext" as DB

P -> C : POST /api/websites/{wId}/seo/ai-alt-text\n{ elementIds: [id1, id2, id3] }
C -> M : Send(GenerateAiAltTextCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load PageElements\n(elementIds, photographerId,\nElementType == Image)
DB --> H : List<PageElement>

loop each image element
  H -> H : Parse ContentJson\nextract imageUrl
  H -> AI : GenerateAltTextAsync(imageUrl)
  AI --> H : generatedAltText
  H -> H : Add to results\n{ elementId, imageUrl, altText }
end

H --> M : Result.Success(\nList<AiAltTextResultDto>)
M --> C : result
C --> P : 200 OK [{ elementId,\nimageUrl, suggestedAltText }]

note right of P
  Photographer reviews/edits
  each suggestion, then calls
  SaveAltText to commit.
end note

@enduml
```

![Generate AI Alt Text for Images (WEB-3.5.2)](generate-ai-alt-text-for-images-web-3-5-2.png)

### Save Reviewed Alt Text (WEB-3.5.2)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteSeoController" as C
participant "IMediator" as M
participant "SaveAltTextHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : PUT /api/websites/{wId}/seo/alt-text\n{ entries: [{ elementId, altText }, ...] }
C -> M : Send(SaveAltTextCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

loop each entry
  H -> DB : Load PageElement\n(elementId, photographerId)
  DB --> H : PageElement

  H -> H : Parse ContentJson\nUpdate altText field\nSerialize back to JSON

  H -> H : Update element.ContentJson
end

H -> DB : SaveChangesAsync()
DB --> H : saved

H --> M : Result.Success()
M --> C : result
C --> P : 200 OK

@enduml
```

![Save Reviewed Alt Text (WEB-3.5.2)](save-reviewed-alt-text-web-3-5-2.png)

### Generate AI Page Description (WEB-3.5.3)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteSeoController" as C
participant "IMediator" as M
participant "GenerateAiDescriptionHandler" as H
participant "ICurrentUserService" as U
participant "IAiContentService" as AI
participant "IApplicationDbContext" as DB

P -> C : POST /api/websites/{wId}/seo/ai-description/{pageId}
C -> M : Send(GenerateAiDescriptionCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load WebsitePage\n(pageId, photographerId)\nwith Elements
DB --> H : WebsitePage + elements

H -> H : Extract text content from\nall Text-type PageElements\nConcatenate into page content

H -> AI : GenerateDescriptionAsync(\npageContent)
AI --> H : generatedDescription

H --> M : Result.Success(generatedDescription)
M --> C : result
C --> P : 200 OK { description:\n"Professional photography..." }

note right of P
  Photographer reviews/edits
  the suggestion, then saves
  via UpdatePage endpoint.
end note

@enduml
```

![Generate AI Page Description (WEB-3.5.3)](generate-ai-page-description-web-3-5-3.png)

### Create a URL Redirect (WEB-3.5.4)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteSeoController" as C
participant "IMediator" as M
participant "CreateUrlRedirectHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : POST /api/websites/{wId}/seo/redirects\n{ sourcePath: "/old-gallery",\n  destinationUrl: "/portfolio",\n  redirectType: "Permanent301" }
C -> M : Send(CreateUrlRedirectCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Verify Website\n(websiteId, photographerId)
DB --> H : Website

H -> DB : Check for conflicting\nactive redirect with\nsame SourcePath
DB --> H : none found

H -> DB : Check SourcePath doesn't\nmatch an existing page Slug
DB --> H : no conflict

H -> H : Create UrlRedirect entity\n{ sourcePath, destinationUrl,\n  redirectType, isActive: true }

H -> DB : Add(redirect)\nSaveChangesAsync()
DB --> H : saved

H --> M : Result.Success(UrlRedirectDto)
M --> C : result
C --> P : 201 Created { redirectDto }

@enduml
```

![Create a URL Redirect (WEB-3.5.4)](create-a-url-redirect-web-3-5-4.png)

### URL Redirect Middleware Resolution

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Visitor as V
participant "RedirectMiddleware" as MW
participant "IApplicationDbContext" as DB
participant "Next Middleware" as NX

V -> MW : GET /old-gallery
MW -> MW : Extract request path\n"/old-gallery"

MW -> DB : Find UrlRedirect\nWhere(SourcePath == "/old-gallery"\nAND IsActive == true)
DB --> MW : UrlRedirect?

alt redirect found
  MW -> MW : Determine status code\n(301 or 302)
  MW --> V : HTTP 301 Redirect\nLocation: /portfolio
else no redirect found
  MW -> NX : next.Invoke(context)
  NX --> MW : response
  MW --> V : normal response
end

@enduml
```

![URL Redirect Middleware Resolution](url-redirect-middleware-resolution.png)

### Configure Open Graph Image (WEB-3.5.5)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsitePagesController" as C
participant "IMediator" as M
participant "UpdatePageHandler" as H
participant "ICurrentUserService" as U
participant "IStorageService" as S
participant "IApplicationDbContext" as DB

P -> C : PUT /api/websites/{wId}/pages/{pId}\n{ pageId, ogImageUrl:\n  "https://storage/og-image.jpg" }
C -> M : Send(UpdatePageCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load WebsitePage\n(pageId, photographerId)
DB --> H : WebsitePage

H -> H : Update page.OgImageUrl

H -> DB : SaveChangesAsync()
DB --> H : saved

H --> M : Result.Success(WebsitePageDto)
M --> C : result
C --> P : 200 OK { pageDto\n  with ogImageUrl }

note right of P
  The OG image URL is rendered
  in the page <head> as:
  <meta property="og:image"
    content="...">
end note

@enduml
```

![Configure Open Graph Image (WEB-3.5.5)](configure-open-graph-image-web-3-5-5.png)
