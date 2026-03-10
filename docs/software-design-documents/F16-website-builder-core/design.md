# F16 - Website Builder Core

## Overview

The Website Builder Core feature provides the foundational building blocks for photographers to create professional websites on the Anansi platform. It encompasses three major subsystems: the Template Library, the Flex Editor, and Draft Sites management.

The Template Library (WEB-3.1.1) offers at least 8 professionally designed templates organized into three categories -- business, portfolio, and one-page -- each previewable before selection. Template switching preserves all existing content (text, images, pages, blog posts), allowing photographers to experiment freely without data loss. Templates define a default layout via a JSON definition that the Flex Editor interprets and renders.

The Flex Editor (WEB-3.1.2) is a drag-and-drop visual editor supporting element addition, removal, resizing, and repositioning. It ships with 100+ ready-made layout blocks and blank blocks for custom layouts. Supported element types include images, text, video embeds, buttons, shapes, sliders, carousels, image grids, and accordions. Alignment guides, grid snapping, and layer management (z-index control) enable precise layout. The editor supports desktop, tablet, and mobile breakpoints with per-breakpoint customization stored as overrides. Draft Sites (WEB-3.1.3) allow photographers to maintain up to 10 simultaneous, fully independent draft websites, any of which can be published to become the live site.

## Components

### Domain Layer

**Website** (`Anansi.Domain.Entities.Website.Website`) -- The root aggregate for a photographer's website. Holds references to the selected template, typography/design settings, hosting configuration, SEO defaults, and analytics integration. Implements `ITenantEntity`, `ISoftDeletable`, and `IAuditableEntity`. Status tracks the site lifecycle via the `WebsiteStatus` enum (Draft, Published, Archived).

**WebsiteTemplate** (`Anansi.Domain.Entities.Website.WebsiteTemplate`) -- Represents a professionally designed template. Contains a `LayoutDefinitionJson` field storing the full structural definition (sections, blocks, default element placements) that the Flex Editor loads when a photographer selects the template. Categorized via `TemplateCategory` enum (Business, Portfolio, OnePage).

**PageElement** (`Anansi.Domain.Entities.Website.PageElement`) -- Represents a single draggable element within a page. Stores position (X, Y), dimensions (Width, Height), z-index for layering, and a `ContentJson` blob for element-specific data. The `ElementType` enum distinguishes between Image, Text, VideoEmbed, Button, Shape, Slider, Carousel, ImageGrid, Accordion, and layout-level types. Supports hierarchical nesting via `ParentElementId` for composite layouts.

**ElementBreakpointOverride** (`Anansi.Domain.Entities.Website.ElementBreakpointOverride`) -- Stores per-breakpoint customizations for a `PageElement`. The `Breakpoint` enum covers Desktop, Tablet, and Mobile. Each override can adjust position, dimensions, visibility, and arbitrary style properties via `StyleOverridesJson`.

**WebsitePage** (`Anansi.Domain.Entities.Website.WebsitePage`) -- A page within a website that contains a collection of `PageElement` entities. Each page has a type, slug, sort order, and navigation visibility settings.

### Application Layer

**ListTemplatesQuery / ListTemplatesHandler** -- Returns all active templates with optional `TemplateCategory` filter. No authentication required (templates are public catalog data).

**GetTemplatePreviewQuery / GetTemplatePreviewHandler** -- Returns the full layout definition JSON for a single template, enabling the front-end to render a live preview.

**CreateWebsiteCommand / CreateWebsiteHandler** -- Creates a new draft website. Validates the 10-draft limit per photographer, checks subdomain uniqueness, and optionally links a template. Returns `WebsiteDto`.

**UpdateWebsiteCommand / UpdateWebsiteHandler** -- Updates website properties including template switching. When `TemplateId` changes, the handler applies the new template's layout definition while preserving existing page content and blog posts.

**PublishWebsiteCommand / PublishWebsiteHandler** -- Transitions a draft website to Published status. Validates the site has at least one page and a valid subdomain.

**DeleteWebsiteCommand / DeleteWebsiteHandler** -- Soft-deletes a website and cascades to pages and elements.

**ListWebsitesQuery / ListWebsitesHandler** -- Returns all websites for the current photographer with optional status filter.

**GetWebsiteQuery / GetWebsiteHandler** -- Returns a single website with full detail.

**CreateElementCommand / CreateElementHandler** -- Adds a new element to a page with position, size, z-index, content, and optional breakpoint overrides.

**UpdateElementCommand / UpdateElementHandler** -- Updates element properties (position, size, content, z-index) and breakpoint overrides.

**DeleteElementCommand / DeleteElementHandler** -- Removes an element and its breakpoint overrides. Cascades to child elements.

**ListElementsQuery / ListElementsHandler** -- Returns all elements for a page, ordered by sort order, with breakpoint overrides included.

### Infrastructure Layer

**ApplicationDbContext** -- EF Core context with `DbSet<Website>`, `DbSet<WebsiteTemplate>`, `DbSet<PageElement>`, and `DbSet<ElementBreakpointOverride>`. Uses `Set<T>()` for generic access.

**CollectionConfiguration / WebsiteTemplate configuration** -- EF Core `IEntityTypeConfiguration` implementations defining table mappings, indexes (on `PhotographerId`, `Subdomain`, `TemplateId`), and relationships.

### API Layer

**WebsitesController** -- CRUD + publish + analytics endpoints at `api/websites`. Secured with `[Authorize]`.

**WebsiteTemplatesController** -- Public catalog endpoints at `api/website-templates` for listing templates, previewing, and listing landing page templates.

**PageElementsController** -- CRUD endpoints at `api/websites/{websiteId}/pages/{pageId}/elements` for drag-and-drop element management.

## Class Diagrams

### Domain Layer -- Website Aggregate & Template

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Website" {
  class Website {
    +Id : Guid
    +PhotographerId : Guid
    +Name : string
    +Description : string?
    +Status : WebsiteStatus
    +TemplateId : Guid?
    +Subdomain : string
    +SslEnabled : bool
    +CustomDomain : string?
    +CustomDomainVerified : bool
    +SitePasswordHash : string?
    +RightClickProtectionEnabled : bool
    +DefaultMetaTitle : string?
    +DefaultMetaDescription : string?
    +DefaultOgImageUrl : string?
    +AnimationType : AnimationType
    +AnimationsEnabled : bool
    +IsDeleted : bool
    +DeletedAt : DateTime?
    +CreatedBy : string?
    +UpdatedBy : string?
    +CreatedAt : DateTime
    +UpdatedAt : DateTime
  }

  class WebsiteTemplate {
    +Id : Guid
    +Name : string
    +Description : string?
    +Category : TemplateCategory
    +PreviewImageUrl : string?
    +ThumbnailUrl : string?
    +LayoutDefinitionJson : string
    +IsActive : bool
    +SortOrder : int
  }

  class WebsitePage {
    +Id : Guid
    +PhotographerId : Guid
    +WebsiteId : Guid
    +Title : string
    +Slug : string
    +PageType : WebsitePageType
    +SortOrder : int
    +IsVisible : bool
    +ShowInNavigation : bool
    +IsDeleted : bool
  }
}

package "Anansi.Domain.Enums" {
  enum WebsiteStatus {
    Draft
    Published
    Archived
  }

  enum TemplateCategory {
    Business
    Portfolio
    OnePage
  }
}

Website --> "0..1" WebsiteTemplate : Template
Website --> "*" WebsitePage : Pages
Website ..> WebsiteStatus
WebsiteTemplate ..> TemplateCategory

@enduml
```

![Domain Layer -- Website Aggregate & Template](domain-layer-website-aggregate-template.png)

### Domain Layer -- Page Elements & Breakpoint Overrides

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Website" {
  class WebsitePage {
    +Id : Guid
    +WebsiteId : Guid
    +Title : string
    +Slug : string
    +PageType : WebsitePageType
    +SortOrder : int
  }

  class PageElement {
    +Id : Guid
    +PhotographerId : Guid
    +PageId : Guid
    +ElementType : ElementType
    +ContentJson : string?
    +PositionX : double
    +PositionY : double
    +Width : double
    +Height : double
    +ZIndex : int
    +SortOrder : int
    +ParentElementId : Guid?
  }

  class ElementBreakpointOverride {
    +Id : Guid
    +PageElementId : Guid
    +Breakpoint : Breakpoint
    +PositionX : double?
    +PositionY : double?
    +Width : double?
    +Height : double?
    +IsHidden : bool
    +StyleOverridesJson : string?
  }
}

package "Anansi.Domain.Enums" {
  enum ElementType {
    Image
    Text
    VideoEmbed
    Button
    Shape
    Slider
    Carousel
    ImageGrid
    Accordion
    ClientGalleryBlock
    InstagramFeed
    CustomEmbed
    LandingPageBlock
    LayoutBlock
  }

  enum Breakpoint {
    Desktop
    Tablet
    Mobile
  }
}

WebsitePage --> "*" PageElement : Elements
PageElement --> "*" PageElement : ChildElements
PageElement --> "*" ElementBreakpointOverride : BreakpointOverrides
PageElement ..> ElementType
ElementBreakpointOverride ..> Breakpoint

@enduml
```

![Domain Layer -- Page Elements & Breakpoint Overrides](domain-layer-page-elements-breakpoint-overrides.png)

### Application Layer -- Commands, Queries & DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Website.Templates" {
  class ListTemplatesQuery <<record>> {
    +Category : TemplateCategory?
  }
  class ListTemplatesHandler {
    -_db : IApplicationDbContext
  }
  class GetTemplatePreviewQuery <<record>> {
    +TemplateId : Guid
  }
}

package "Anansi.Application.Features.Website.Sites" {
  class CreateWebsiteCommand <<record>> {
    +Name : string
    +Description : string?
    +TemplateId : Guid?
    +Subdomain : string
  }
  class CreateWebsiteValidator
  class CreateWebsiteHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
  }
  class PublishWebsiteCommand <<record>> {
    +WebsiteId : Guid
  }
}

package "Anansi.Application.Features.Website.Elements" {
  class CreateElementCommand <<record>> {
    +PageId : Guid
    +ElementType : ElementType
    +ContentJson : string?
    +PositionX : double
    +PositionY : double
    +Width : double
    +Height : double
    +ZIndex : int?
    +ParentElementId : Guid?
    +BreakpointOverrides : List?
  }
  class CreateElementHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
  }
}

package "Anansi.Application.DTOs.Website" {
  class WebsiteDto <<record>>
  class WebsiteTemplateDto <<record>>
  class PageElementDto <<record>>
  class BreakpointOverrideDto <<record>>
}

ListTemplatesHandler ..> ListTemplatesQuery : handles
CreateWebsiteHandler ..> CreateWebsiteCommand : handles
CreateElementHandler ..> CreateElementCommand : handles

CreateWebsiteHandler ..> WebsiteDto : returns
ListTemplatesHandler ..> WebsiteTemplateDto : returns
CreateElementHandler ..> PageElementDto : returns

@enduml
```

![Application Layer -- Commands, Queries & DTOs](application-layer-commands-queries-dtos.png)

### API Layer -- Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Api.Controllers" {
  class WebsitesController <<ApiController>> {
    -_mediator : IMediator
    +List(status) : IActionResult
    +Get(id) : IActionResult
    +Create(command) : IActionResult
    +Update(id, command) : IActionResult
    +Publish(id) : IActionResult
    +Delete(id) : IActionResult
  }

  class WebsiteTemplatesController <<ApiController>> {
    -_mediator : IMediator
    +List(category) : IActionResult
    +Preview(id) : IActionResult
    +ListLandingPages() : IActionResult
  }

  class PageElementsController <<ApiController>> {
    -_mediator : IMediator
    +List(pageId) : IActionResult
    +Create(command) : IActionResult
    +Update(id, command) : IActionResult
    +Delete(id) : IActionResult
  }
}

package "MediatR" {
  interface IMediator
}

WebsitesController --> IMediator
WebsiteTemplatesController --> IMediator
PageElementsController --> IMediator

@enduml
```

![API Layer -- Controllers](api-layer-controllers.png)

## Sequence Diagrams

### Select and Preview a Template (WEB-3.1.1)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteTemplatesController" as C
participant "IMediator" as M
participant "ListTemplatesHandler" as LH
participant "GetTemplatePreviewHandler" as PH
participant "IApplicationDbContext" as DB

== Browse Templates ==
P -> C : GET /api/website-templates?category=Portfolio
C -> M : Send(ListTemplatesQuery)
M -> LH : Handle(query)
LH -> DB : Set<WebsiteTemplate>()\n.Where(active, category)\n.OrderBy(SortOrder)
DB --> LH : List<WebsiteTemplate>
LH --> M : Result<List<WebsiteTemplateDto>>
M --> C : result
C --> P : 200 OK [templates]

== Preview Template ==
P -> C : GET /api/website-templates/{id}/preview
C -> M : Send(GetTemplatePreviewQuery)
M -> PH : Handle(query)
PH -> DB : Set<WebsiteTemplate>()\n.FirstOrDefault(id)
DB --> PH : WebsiteTemplate
PH --> M : Result<TemplatePreviewDto>
M --> C : result
C --> P : 200 OK { layoutDefinitionJson }

@enduml
```

![Select and Preview a Template (WEB-3.1.1)](select-and-preview-a-template-web-3-1-1.png)

### Create a New Draft Website (WEB-3.1.3)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsitesController" as C
participant "IMediator" as M
participant "CreateWebsiteValidator" as V
participant "CreateWebsiteHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : POST /api/websites\n{ name, subdomain, templateId }
C -> M : Send(CreateWebsiteCommand)
M -> V : Validate(command)
V --> M : valid
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Count websites\n(photographerId, Draft)
DB --> H : draftCount

alt draftCount >= 10
  H --> M : Result.Failure("Max 10 drafts")
  M --> C : failure
  C --> P : 400 "Maximum of 10 draft sites allowed"
else draftCount < 10
  H -> DB : AnyAsync(subdomain)
  DB --> H : false
  H -> DB : AnyAsync(templateId, active)
  DB --> H : true
  H -> DB : Add(website)\nSaveChangesAsync()
  DB --> H : saved
  H --> M : Result.Success(WebsiteDto)
  M --> C : result
  C --> P : 201 Created { websiteDto }
end

@enduml
```

![Create a New Draft Website (WEB-3.1.3)](create-a-new-draft-website-web-3-1-3.png)

### Add Element via Flex Editor (WEB-3.1.2)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "PageElementsController" as C
participant "IMediator" as M
participant "CreateElementValidator" as V
participant "CreateElementHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : POST /api/websites/{wId}/pages/{pId}/elements\n{ elementType, contentJson, posX, posY,\n  width, height, breakpointOverrides }
C -> M : Send(CreateElementCommand)
M -> V : Validate(command)
V --> M : valid
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Find page by pageId\nand photographerId
DB --> H : WebsitePage

H -> DB : Max(SortOrder) for page
DB --> H : maxSort

H -> H : Build PageElement entity\n(ZIndex = maxSort + 1)

loop each breakpoint override
  H -> H : Build ElementBreakpointOverride
  H -> DB : Add(override)
end

H -> DB : Add(element)\nSaveChangesAsync()
DB --> H : saved

H -> DB : Load breakpoint overrides
DB --> H : List<BreakpointOverride>

H --> M : Result.Success(PageElementDto)
M --> C : result
C --> P : 201 Created { pageElementDto }

@enduml
```

![Add Element via Flex Editor (WEB-3.1.2)](add-element-via-flex-editor-web-3-1-2.png)

### Switch Template Preserving Content (WEB-3.1.1)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsitesController" as C
participant "IMediator" as M
participant "UpdateWebsiteHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : PUT /api/websites/{id}\n{ websiteId, templateId (new) }
C -> M : Send(UpdateWebsiteCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load Website\nwith Pages, Elements, BlogPosts
DB --> H : Website (existing)

H -> DB : Find new WebsiteTemplate
DB --> H : WebsiteTemplate

H -> H : Update Website.TemplateId
H -> H : Apply new template layout\nto page structure

note right of H
  Pages, blog posts, text content,
  and images are preserved.
  Only layout/positioning changes.
end note

H -> DB : SaveChangesAsync()
DB --> H : saved

H --> M : Result.Success(WebsiteDto)
M --> C : result
C --> P : 200 OK { updated websiteDto }

@enduml
```

![Switch Template Preserving Content (WEB-3.1.1)](switch-template-preserving-content-web-3-1-1.png)

### Publish a Draft Website (WEB-3.1.3)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsitesController" as C
participant "IMediator" as M
participant "PublishWebsiteHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : POST /api/websites/{id}/publish
C -> M : Send(PublishWebsiteCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load Website (id, photographerId)
DB --> H : Website

alt website not found
  H --> M : Result.NotFound
  M --> C : failure
  C --> P : 404 Not Found
else website found
  H -> DB : Count pages for website
  DB --> H : pageCount

  alt pageCount == 0
    H --> M : Result.Failure\n("At least one page required")
    M --> C : failure
    C --> P : 400 Bad Request
  else has pages
    H -> H : Set Status = Published
    H -> DB : SaveChangesAsync()
    DB --> H : saved
    H --> M : Result.Success(WebsiteDto)
    M --> C : result
    C --> P : 200 OK { websiteDto }
  end
end

@enduml
```

![Publish a Draft Website (WEB-3.1.3)](publish-a-draft-website-web-3-1-3.png)
