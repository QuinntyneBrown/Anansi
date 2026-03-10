# F19 - Website Design & Typography

## Overview

The Website Design & Typography feature provides photographers with comprehensive visual customization tools for their websites. It covers three subsystems: the Font System, the Color System, and Scroll Animations, all of which work together to give photographers full control over their site's visual identity without requiring design expertise.

The Font System (WEB-3.4.1) offers a library of over 1,000 font families (sourced from Google Fonts or a similar CDN) plus the ability to upload custom fonts in WOFF, WOFF2, TTF, and OTF formats. Font properties -- family, size, weight, and letter spacing -- are configurable at the site-wide level (primary and secondary font families on the `Website` entity) or per individual element (through `ContentJson` style overrides on `PageElement`). Curated font themes bundle complementary display and body typefaces for one-click application across the entire site.

The Color System (WEB-3.4.2) provides at least 40 predefined color palettes with over 200 color combinations. Colors can be applied at three levels: entire site (via `ColorPaletteJson` on the `Website` entity), individual blocks (via element-level style overrides), or selected text ranges (via inline style data in the rich text content). Photographers can also enter custom hex colors. The `ColorPalette` entity stores both system-provided palettes and photographer-created custom palettes.

Scroll Animations (WEB-3.4.3) offer four site-wide animation types -- fade in, scale up, slide in, and unfold -- that trigger as elements scroll into the viewport. Animations are configured on the `Website` entity via `AnimationType` and `AnimationsEnabled`, providing a simple toggle between animated and static presentations.

## Components

### Domain Layer

**Website** (typography/design properties) -- The `Website` entity holds site-wide design configuration: `PrimaryFontFamily` and `SecondaryFontFamily` for typography, `CustomFontUrl` for uploaded custom fonts, `ColorPaletteJson` for the active color scheme, `AnimationType` (from the `AnimationType` enum), and `AnimationsEnabled` for the global animation toggle.

**WebsiteFont** (`Anansi.Domain.Entities.Website.WebsiteFont`) -- Represents a custom-uploaded font file. Contains `FontFamily` (the CSS font-family name), `FileUrl` (storage location), `FileFormat` (woff, woff2, ttf, otf), and optional `FontWeight` and `FontStyle` metadata. Implements `ITenantEntity` for per-photographer scoping.

**ColorPalette** (`Anansi.Domain.Entities.Website.ColorPalette`) -- Represents a color palette, either system-provided or custom. The `ColorsJson` field stores a JSON array of hex color values. `IsSystem` distinguishes between built-in palettes (shared across all users) and custom palettes created by individual photographers. `PhotographerId` is null for system palettes.

### Application Layer

**ListCustomFontsQuery / ListCustomFontsHandler** -- Returns all custom-uploaded fonts for the current photographer. System fonts (the 1,000+ library) are served statically from the CDN and not stored in the database.

**UploadCustomFontCommand / UploadCustomFontHandler** -- Uploads a custom font file to storage and creates a `WebsiteFont` record. Validates file format (WOFF, WOFF2, TTF, OTF), extracts font metadata, and stores the file via `IStorageService`.

**DeleteCustomFontCommand / DeleteCustomFontHandler** -- Deletes a custom font record and removes the file from storage. Validates that the font is not currently in use as a primary or secondary font on any website.

**ApplyFontThemeCommand / ApplyFontThemeHandler** -- Applies a curated font theme to a website. Updates `PrimaryFontFamily` and `SecondaryFontFamily` on the `Website` entity.

**UpdateWebsiteTypographyCommand / UpdateWebsiteTypographyHandler** -- Updates font-related properties on a website: primary font, secondary font, and custom font URL. Per-element typography is handled through `UpdateElementCommand` by modifying the element's `ContentJson` or `StyleOverridesJson`.

**ListColorPalettesQuery / ListColorPalettesHandler** -- Returns all available color palettes: system palettes plus custom palettes belonging to the current photographer.

**CreateCustomColorPaletteCommand / CreateCustomColorPaletteHandler** -- Creates a custom color palette for the photographer. Validates hex color format for all colors in the array.

**DeleteCustomColorPaletteCommand / DeleteCustomColorPaletteHandler** -- Deletes a photographer-created custom palette. System palettes cannot be deleted.

**ApplyColorPaletteCommand / ApplyColorPaletteHandler** -- Applies a color palette to a website by updating `ColorPaletteJson`. Can apply to the entire site or to individual elements.

**UpdateAnimationSettingsCommand / UpdateAnimationSettingsHandler** -- Updates the `AnimationType` and `AnimationsEnabled` properties on a website. This is a subset of `UpdateWebsiteCommand` but may be invoked independently from the design settings panel.

### Infrastructure Layer

**EF Core Configurations** -- `WebsiteFont` configuration indexes on `PhotographerId` for listing queries. `ColorPalette` configuration indexes on `(IsSystem, SortOrder)` for catalog queries and `(PhotographerId)` for custom palette lookups.

**FontStorageService** -- Infrastructure component that handles font file upload to blob storage, returning the public URL for the `FileUrl` field. Validates file size limits and format before upload.

### API Layer

**WebsiteTypographyController** (`api/website-typography`) -- Endpoints for font and color management. `GET fonts` lists custom fonts, `POST fonts` uploads a custom font, `DELETE fonts/{id}` removes a custom font, `GET color-palettes` lists all palettes, `POST color-palettes` creates a custom palette.

**WebsitesController** -- The `PUT /api/websites/{id}` endpoint handles updates to typography and animation settings as part of the general website update flow.

## Class Diagrams

### Domain Layer -- Font System

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Website" {
  class Website {
    +Id : Guid
    +PhotographerId : Guid
    +PrimaryFontFamily : string?
    +SecondaryFontFamily : string?
    +CustomFontUrl : string?
    +AnimationType : AnimationType
    +AnimationsEnabled : bool
  }

  class WebsiteFont {
    +Id : Guid
    +PhotographerId : Guid
    +FontFamily : string
    +FileUrl : string
    +FileFormat : string
    +FontWeight : string?
    +FontStyle : string?
    +CreatedAt : DateTime
  }

  class PageElement {
    +Id : Guid
    +ContentJson : string?
  }

  class ElementBreakpointOverride {
    +Id : Guid
    +StyleOverridesJson : string?
  }
}

note right of WebsiteFont
  FileFormat: woff, woff2, ttf, otf
  FontWeight: e.g. "400", "700"
  FontStyle: "normal", "italic"
end note

note right of PageElement
  ContentJson may include:
  { fontFamily, fontSize,
    fontWeight, letterSpacing }
end note

Website ..> WebsiteFont : references via\nCustomFontUrl
PageElement --> "*" ElementBreakpointOverride : BreakpointOverrides

@enduml
```

### Domain Layer -- Color System & Animations

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Website" {
  class Website {
    +Id : Guid
    +ColorPaletteJson : string?
    +AnimationType : AnimationType
    +AnimationsEnabled : bool
  }

  class ColorPalette {
    +Id : Guid
    +Name : string
    +ColorsJson : string
    +IsSystem : bool
    +PhotographerId : Guid?
    +SortOrder : int
  }
}

package "Anansi.Domain.Enums" {
  enum AnimationType {
    None
    FadeIn
    ScaleUp
    SlideIn
    Unfold
  }
}

note right of ColorPalette
  ColorsJson example:
  ["#1A1A1C", "#C9A962",
   "#F5F5F0", "#6E9E6E"]

  IsSystem = true: shared palette
  IsSystem = false: custom (per photographer)
end note

Website ..> AnimationType
Website ..> ColorPalette : applies via\nColorPaletteJson

@enduml
```

### Application Layer -- Typography Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Website.Typography" {
  class UploadCustomFontCommand <<record>> {
    +FontFamily : string
    +FileBase64 : string
    +FileFormat : string
    +FontWeight : string?
    +FontStyle : string?
  }
  class UploadCustomFontHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
    -_storageService : IStorageService
  }

  class DeleteCustomFontCommand <<record>> {
    +FontId : Guid
  }
  class DeleteCustomFontHandler

  class ListCustomFontsQuery <<record>>
  class ListCustomFontsHandler

  class ListColorPalettesQuery <<record>>
  class ListColorPalettesHandler

  class CreateCustomColorPaletteCommand <<record>> {
    +Name : string
    +ColorsJson : string
  }
  class CreateCustomColorPaletteHandler
}

package "Anansi.Application.DTOs.Website" {
  class WebsiteFontDto <<record>> {
    +Id : Guid
    +FontFamily : string
    +FileUrl : string
    +FileFormat : string
    +FontWeight : string?
    +FontStyle : string?
  }

  class ColorPaletteDto <<record>> {
    +Id : Guid
    +Name : string
    +ColorsJson : string
    +IsSystem : bool
    +SortOrder : int
  }
}

package "Anansi.Application.Interfaces" {
  interface IStorageService {
    +UploadAsync(stream, fileName, contentType) : string
    +DeleteAsync(key) : void
  }
}

UploadCustomFontHandler ..> WebsiteFontDto : returns
UploadCustomFontHandler --> IStorageService : uploads font file
ListCustomFontsHandler ..> WebsiteFontDto : returns
ListColorPalettesHandler ..> ColorPaletteDto : returns
CreateCustomColorPaletteHandler ..> ColorPaletteDto : returns

@enduml
```

### API Layer -- WebsiteTypographyController

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Api.Controllers" {
  class WebsiteTypographyController <<ApiController>> {
    -_mediator : IMediator
    +ListFonts() : IActionResult
    +UploadFont(command) : IActionResult
    +DeleteFont(fontId) : IActionResult
    +ListColorPalettes() : IActionResult
    +CreateColorPalette(command) : IActionResult
  }

  class WebsitesController <<ApiController>> {
    -_mediator : IMediator
    +Update(id, command) : IActionResult
  }
}

note right of WebsiteTypographyController
  Route: api/website-typography
  All endpoints require [Authorize]
end note

note right of WebsitesController
  PUT /api/websites/{id}
  updates font, color, and
  animation settings
end note

WebsiteTypographyController --> "IMediator"
WebsitesController --> "IMediator"

@enduml
```

## Sequence Diagrams

### Upload a Custom Font (WEB-3.4.1)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteTypographyController" as C
participant "IMediator" as M
participant "UploadCustomFontHandler" as H
participant "ICurrentUserService" as U
participant "IStorageService" as S
participant "IApplicationDbContext" as DB

P -> C : POST /api/website-typography/fonts\n{ fontFamily, fileBase64,\n  fileFormat, fontWeight, fontStyle }
C -> M : Send(UploadCustomFontCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> H : Validate fileFormat\n(woff, woff2, ttf, otf)

alt invalid format
  H --> M : Result.Failure\n("Unsupported font format")
  M --> C : failure
  C --> P : 400 Bad Request
else valid format
  H -> H : Decode Base64 to Stream
  H -> S : UploadAsync(stream,\n"fonts/{photographerId}/{family}.{fmt}",\ncontent-type)
  S --> H : fileUrl

  H -> H : Create WebsiteFont entity\n{ fontFamily, fileUrl,\n  fileFormat, fontWeight, fontStyle }

  H -> DB : Add(font)\nSaveChangesAsync()
  DB --> H : saved

  H --> M : Result.Success(WebsiteFontDto)
  M --> C : result
  C --> P : 201 Created { fontDto }
end

@enduml
```

### Apply a Font Theme to Website (WEB-3.4.1)

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

P -> C : PUT /api/websites/{id}\n{ websiteId, primaryFontFamily:\n  "Cormorant Garamond",\n  secondaryFontFamily: "Inter" }
C -> M : Send(UpdateWebsiteCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load Website\n(websiteId, photographerId)
DB --> H : Website

H -> H : Update PrimaryFontFamily\nUpdate SecondaryFontFamily

H -> DB : SaveChangesAsync()
DB --> H : saved

H --> M : Result.Success(WebsiteDto)
M --> C : result
C --> P : 200 OK { websiteDto }

@enduml
```

### List and Apply a Color Palette (WEB-3.4.2)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteTypographyController" as TC
participant "WebsitesController" as WC
participant "IMediator" as M
participant "ListColorPalettesHandler" as LH
participant "UpdateWebsiteHandler" as UH
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

== Browse Color Palettes ==
P -> TC : GET /api/website-typography/color-palettes
TC -> M : Send(ListColorPalettesQuery)
M -> LH : Handle(query)
LH -> U : PhotographerId
U --> LH : photographerId

LH -> DB : Query ColorPalette\nWhere(IsSystem == true\nOR PhotographerId == pid)\nOrderBy(SortOrder)
DB --> LH : List<ColorPalette>

LH --> M : Result<List<ColorPaletteDto>>
M --> TC : result
TC --> P : 200 OK [palettes]

== Apply Palette to Website ==
P -> WC : PUT /api/websites/{id}\n{ websiteId, colorPaletteJson:\n  '["#1A1A1C","#C9A962","#F5F5F0"]' }
WC -> M : Send(UpdateWebsiteCommand)
M -> UH : Handle(command)
UH -> U : PhotographerId
U --> UH : photographerId

UH -> DB : Load Website
DB --> UH : Website

UH -> H : Update ColorPaletteJson
UH -> DB : SaveChangesAsync()
DB --> UH : saved

UH --> M : Result.Success(WebsiteDto)
M --> WC : result
WC --> P : 200 OK { websiteDto }

@enduml
```

### Create a Custom Color Palette (WEB-3.4.2)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteTypographyController" as C
participant "IMediator" as M
participant "CreateCustomColorPaletteHandler" as H
participant "ICurrentUserService" as U
participant "IApplicationDbContext" as DB

P -> C : POST /api/website-typography/color-palettes\n{ name: "My Brand Colors",\n  colorsJson: '["#2D2D2D","#FFD700","#FFFFFF"]' }
C -> M : Send(CreateCustomColorPaletteCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> H : Validate colorsJson\n(valid JSON array of hex strings)

alt invalid colors
  H --> M : Result.Failure\n("Invalid hex color format")
  M --> C : failure
  C --> P : 400 Bad Request
else valid colors
  H -> H : Create ColorPalette\n{ name, colorsJson,\n  isSystem: false,\n  photographerId }

  H -> DB : Add(palette)\nSaveChangesAsync()
  DB --> H : saved

  H --> M : Result.Success(ColorPaletteDto)
  M --> C : result
  C --> P : 201 Created { paletteDto }
end

@enduml
```

### Configure Scroll Animations (WEB-3.4.3)

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

P -> C : PUT /api/websites/{id}\n{ websiteId,\n  animationType: "SlideIn",\n  animationsEnabled: true }
C -> M : Send(UpdateWebsiteCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load Website\n(websiteId, photographerId)
DB --> H : Website

H -> H : Update AnimationType = SlideIn
H -> H : Update AnimationsEnabled = true

H -> DB : SaveChangesAsync()
DB --> H : saved

H --> M : Result.Success(WebsiteDto)
M --> C : result
C --> P : 200 OK { websiteDto\n  with animation settings }

note right of H
  AnimationType enum:
  None, FadeIn, ScaleUp,
  SlideIn, Unfold

  Animations trigger on scroll
  and apply site-wide.
end note

@enduml
```

### Delete a Custom Font with Usage Check (WEB-3.4.1)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer as P
participant "WebsiteTypographyController" as C
participant "IMediator" as M
participant "DeleteCustomFontHandler" as H
participant "ICurrentUserService" as U
participant "IStorageService" as S
participant "IApplicationDbContext" as DB

P -> C : DELETE /api/website-typography/fonts/{fontId}
C -> M : Send(DeleteCustomFontCommand)
M -> H : Handle(command)
H -> U : PhotographerId
U --> H : photographerId

H -> DB : Load WebsiteFont\n(fontId, photographerId)
DB --> H : WebsiteFont

alt font not found
  H --> M : Result.NotFound
  M --> C : failure
  C --> P : 404 Not Found
else font found
  H -> DB : Check if font is in use\nas PrimaryFontFamily or\nSecondaryFontFamily on any Website
  DB --> H : inUse

  alt font in use
    H --> M : Result.Failure\n("Font is currently in use")
    M --> C : failure
    C --> P : 400 Bad Request
  else not in use
    H -> S : DeleteAsync(font.FileUrl)
    S --> H : deleted

    H -> DB : Remove(font)\nSaveChangesAsync()
    DB --> H : saved

    H --> M : Result.Success
    M --> C : result
    C --> P : 204 No Content
  end
end

@enduml
```
