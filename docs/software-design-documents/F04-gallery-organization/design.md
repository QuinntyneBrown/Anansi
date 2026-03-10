# F04 - Gallery Organization

## Overview

This feature provides the structural framework for how photographers organize their work within the Anansi platform. The primary organizational unit is the `Collection`, which represents a client gallery containing photos and videos. Within each collection, photographers can create `CollectionSet` entities -- named sub-groups that segment content logically (e.g., "Ceremony", "Reception", "Portraits" for a wedding). Photos can be dragged between sets, and sets are manually sortable within their parent collection.

Bulk gallery creation addresses high-volume workflows like mini sessions, school portrait days, and events where a photographer needs to create dozens of galleries simultaneously with identical settings. The photographer specifies multiple gallery names, optional client info (name, email), and selects a preset to apply. All galleries are created in a single operation. Star/bookmark functionality lets photographers mark their most important collections and individual photos for quick access via a dedicated "Starred" tab, with bulk starring supported.

Collection presets capture the full spectrum of gallery settings -- cover style, theme, fonts, colors, layout, download configuration, store settings, privacy, and language -- as reusable templates. A photographer can save a preset, name it, and apply it to any new or existing collection with one click. Multiple presets are manageable (create, rename, update, delete), enabling photographers to maintain distinct configurations for different client types or event categories.

**L2 Requirements:** GAL-1.2.1 (Collections and Sets), GAL-1.2.2 (Bulk Gallery Creation), GAL-1.2.3 (Star/Bookmark), GAL-1.2.4 (Collection Presets)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Collection` | Entity | Top-level gallery container. Stores title, description, slug, status, cover settings, design settings (theme, font, color, layout), privacy settings, download settings, slideshow settings, expiry settings, language, embedding config, analytics, star flag, and preset reference. Implements `ITenantEntity`, `IAuditableEntity`, `ISoftDeletable`. |
| `CollectionSet` | Entity | Named sub-group within a collection. Has title, description, sort order, and client-exclusive visibility flag. Implements `ITenantEntity`, `ISoftDeletable`. |
| `CollectionPreset` | Entity | Reusable settings template storing cover style, theme, font, color palette, custom color hex, layout, download settings, email registration flag, and language. Implements `ITenantEntity`, `ISoftDeletable`. |
| `GalleryMedia` | Entity | Individual media items that belong to a collection and optionally a set. |
| `CollectionStatus` | Enum | `Draft`, `Published`, `Hidden`, `Expired` |
| `CoverStyle` | Enum | `Reef`, `West`, `Oakwood`, `Edge`, `Harbor`, `Summit`, `Cascade` |
| `ThemeMode` | Enum | `Light`, `Dark` |
| `GridLayout` | Enum | `Vertical`, `Horizontal` |
| `GalleryLanguage` | Enum | `English`, `Spanish`, `French`, `German`, `Dutch`, `ChineseSimplified`, `Portuguese`, `Swedish` |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateCollectionCommand` | Command | Creates a new collection with title, description, and optional preset application. |
| `ListCollectionsQuery` | Query | Paginated listing with filters for starred, status, and search text. |
| `GetCollectionQuery` | Query | Returns a single collection by ID with full settings. |
| `UpdateCollectionCommand` | Command | Updates any collection field (title, description, design, privacy, downloads, etc.). |
| `DeleteCollectionCommand` | Command | Soft-deletes a collection and all its sets and media. |
| `BulkCreateCollectionsCommand` | Command | Creates multiple collections at once with shared settings and per-gallery client info. |
| `ToggleStarCollectionCommand` | Command | Toggles the `IsStarred` flag on a collection. |
| `CreateSetCommand` | Command | Creates a new set within a collection with title, description, sort order, and client-exclusive flag. |
| `UpdateSetCommand` | Command | Updates set properties. |
| `DeleteSetCommand` | Command | Soft-deletes a set. Media in the set becomes unassigned (moves to collection root). |
| `ReorderSetsCommand` | Command | Accepts an ordered list of set IDs and updates sort orders accordingly. |
| `ListSetsQuery` | Query | Returns all sets for a collection ordered by sort order. |
| `ListPresetsQuery` | Query | Returns all presets for the authenticated photographer. |
| `CreatePresetCommand` | Command | Saves current settings as a named preset. |
| `UpdatePresetCommand` | Command | Updates an existing preset's settings or name. |
| `DeletePresetCommand` | Command | Soft-deletes a preset. |
| `MoveMediaCommand` | Command | Moves a media item to a different set (or to collection root by setting `SetId = null`). |
| `BulkStarMediaCommand` | Command | Stars or unstars multiple media items at once. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CollectionsController` | Controller | Collection CRUD, bulk create, star toggle, download settings, sharing, and activity endpoints. |
| `CollectionSetsController` | Controller | Nested under `/api/collections/{collectionId}/sets`. Set CRUD and reorder. |
| `CollectionPresetsController` | Controller | `/api/collection-presets`. Preset CRUD. |
| `GalleryMediaController` | Controller | Nested under `/api/collections/{collectionId}/media`. Move, star, and bulk-star operations. |

---

## Class Diagrams

### Domain Layer -- Collection, Set, and Preset Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Collection {
  +PhotographerId : Guid
  +Title : string
  +Description : string?
  +Status : CollectionStatus
  +Slug : string
  --Cover--
  +CoverStyle : CoverStyle
  +CoverPhotoId : Guid?
  +CoverFocalPointX : double?
  +CoverFocalPointY : double?
  +CoverVideoUrl : string?
  --Design--
  +Theme : ThemeMode
  +FontFamily : string
  +ColorPalette : string
  +CustomColorHex : string?
  +Layout : GridLayout
  --Privacy--
  +Password : string?
  +ClientExclusivePassword : string?
  +RequireEmailRegistration : bool
  --Downloads--
  +DownloadsEnabled : bool
  +DownloadPin : string?
  +DownloadPinEnabled : bool
  +DownloadLimit : int?
  +AllowedResolutions : string
  --Organization--
  +IsStarred : bool
  +PresetId : Guid?
  +Language : GalleryLanguage
}

class CollectionSet {
  +PhotographerId : Guid
  +CollectionId : Guid
  +Title : string
  +Description : string?
  +SortOrder : int
  +IsClientExclusive : bool
}

class CollectionPreset {
  +PhotographerId : Guid
  +Name : string
  +CoverStyle : CoverStyle
  +Theme : ThemeMode
  +FontFamily : string
  +ColorPalette : string
  +CustomColorHex : string?
  +Layout : GridLayout
  +DownloadsEnabled : bool
  +DownloadPinEnabled : bool
  +AllowedResolutions : string
  +RequireEmailRegistration : bool
  +Language : GalleryLanguage
}

class GalleryMedia {
  +CollectionId : Guid
  +SetId : Guid?
  +SortOrder : int
  +IsStarred : bool
}

Collection "1" *-- "many" CollectionSet
Collection "1" *-- "many" GalleryMedia
CollectionSet "1" *-- "many" GalleryMedia
Collection ..> CollectionPreset : references via PresetId
@enduml
```

### Domain Layer -- Enums

```plantuml
@startuml
skinparam classAttributeIconSize 0
hide empty methods

enum CollectionStatus {
  Draft
  Published
  Hidden
  Expired
}

enum CoverStyle {
  Reef
  West
  Oakwood
  Edge
  Harbor
  Summit
  Cascade
}

enum ThemeMode {
  Light
  Dark
}

enum GridLayout {
  Vertical
  Horizontal
}

enum GalleryLanguage {
  English
  Spanish
  French
  German
  Dutch
  ChineseSimplified
  Portuguese
  Swedish
}

enum SlideshowSpeed {
  Slow
  Medium
  Fast
}
@enduml
```

### Application Layer -- Collection Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Galleries.Collections" {
  class CreateCollectionCommand <<record>> {
    +Title : string
    +Description : string?
    +PresetId : Guid?
  }
  class ListCollectionsQuery <<record>> {
    +Page : int
    +PageSize : int
    +StarredOnly : bool?
    +Status : CollectionStatus?
    +Search : string?
  }
  class GetCollectionQuery <<record>> {
    +Id : Guid
  }
  class UpdateCollectionCommand <<record>> {
    +Id : Guid
  }
  class DeleteCollectionCommand <<record>> {
    +Id : Guid
  }
  class BulkCreateCollectionsCommand <<record>> {
    +Galleries : List<BulkGalleryEntry>
    +PresetId : Guid?
  }
  class ToggleStarCollectionCommand <<record>> {
    +Id : Guid
  }
}

class BulkGalleryEntry {
  +Title : string
  +ClientName : string?
  +ClientEmail : string?
}

package "Features.Galleries.Sets" {
  class CreateSetCommand <<record>> {
    +CollectionId : Guid
    +Title : string
    +Description : string?
    +SortOrder : int
    +IsClientExclusive : bool
  }
  class UpdateSetCommand <<record>>
  class DeleteSetCommand <<record>>
  class ReorderSetsCommand <<record>> {
    +CollectionId : Guid
    +SetIdsInOrder : List<Guid>
  }
  class ListSetsQuery <<record>> {
    +CollectionId : Guid
  }
}

package "Features.Galleries.Presets" {
  class CreatePresetCommand <<record>>
  class UpdatePresetCommand <<record>>
  class DeletePresetCommand <<record>>
  class ListPresetsQuery <<record>>
}

BulkCreateCollectionsCommand *-- BulkGalleryEntry
@enduml
```

### API Layer -- Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CollectionsController <<ApiController>> {
  +Create(CreateCollectionCommand) : IActionResult
  +List(page, pageSize, starred, status, search) : IActionResult
  +Get(id) : IActionResult
  +Update(id, UpdateCollectionCommand) : IActionResult
  +Delete(id) : IActionResult
  +BulkCreate(BulkCreateCollectionsCommand) : IActionResult
  +ToggleStar(id) : IActionResult
}

class CollectionSetsController <<ApiController>> {
  +List(collectionId) : IActionResult
  +Create(collectionId, CreateSetRequest) : IActionResult
  +Update(collectionId, id, UpdateSetRequest) : IActionResult
  +Delete(collectionId, id) : IActionResult
  +Reorder(collectionId, ReorderSetsRequest) : IActionResult
}

class CollectionPresetsController <<ApiController>> {
  +List() : IActionResult
  +Create(CreatePresetCommand) : IActionResult
  +Update(id, UpdatePresetCommand) : IActionResult
  +Delete(id) : IActionResult
}

class GalleryMediaController <<ApiController>> {
  +Move(collectionId, id, MoveMediaRequest) : IActionResult
  +ToggleStar(collectionId, id) : IActionResult
  +BulkStar(collectionId, BulkStarRequest) : IActionResult
}

note bottom of CollectionsController
  Route: /api/collections
end note

note bottom of CollectionSetsController
  Route: /api/collections/{collectionId}/sets
end note

note bottom of CollectionPresetsController
  Route: /api/collection-presets
end note

note bottom of GalleryMediaController
  Route: /api/collections/{collectionId}/media
end note
@enduml
```

---

## Sequence Diagrams

### Create a Collection with Preset

```plantuml
@startuml
actor Photographer as P
participant "CollectionsController" as CC
participant "MediatR" as M
participant "CreateCollectionHandler" as CH
participant "ApplicationDbContext" as DB

P -> CC : POST /api/collections\n{title, description, presetId}
CC -> M : Send(CreateCollectionCommand)
M -> CH : Handle(command)

CH -> CH : Validate (FluentValidation)

alt presetId is provided
  CH -> DB : Find CollectionPreset by presetId
  alt preset not found
    CH --> M : Result.Failure("Preset not found")
    M --> CC : 404
    CC --> P : 404 Not Found
  end
  CH -> CH : Apply preset settings:\n  CoverStyle, Theme, FontFamily,\n  ColorPalette, CustomColorHex,\n  Layout, DownloadsEnabled,\n  DownloadPinEnabled, AllowedResolutions,\n  RequireEmailRegistration, Language
end

CH -> CH : Generate slug from title
CH -> CH : Auto-generate 4-digit DownloadPin
CH -> DB : Collections.Add(newCollection)
CH -> DB : SaveChangesAsync()
CH --> M : Result.Success(CollectionDto)
M --> CC : Result.Success
CC --> P : 200 OK (CollectionDto)
@enduml
```

### Bulk Create Galleries

```plantuml
@startuml
actor Photographer as P
participant "CollectionsController" as CC
participant "MediatR" as M
participant "BulkCreateHandler" as BCH
participant "ApplicationDbContext" as DB

P -> CC : POST /api/collections/bulk\n{galleries: [{title, clientName, clientEmail}, ...],\npresetId}
CC -> M : Send(BulkCreateCollectionsCommand)
M -> BCH : Handle(command)

alt presetId provided
  BCH -> DB : Load CollectionPreset
end

loop each gallery entry
  BCH -> BCH : Create Collection entity\nwith title from entry

  alt preset loaded
    BCH -> BCH : Apply preset settings\nto collection
  end

  BCH -> BCH : Generate unique slug
  BCH -> BCH : Auto-generate DownloadPin

  alt clientName/clientEmail provided
    BCH -> BCH : Attach client info\nto collection metadata
  end

  BCH -> DB : Collections.Add(collection)
end

BCH -> DB : SaveChangesAsync()
BCH --> M : Result.Success(List<CollectionDto>)
M --> CC : Result.Success
CC --> P : 200 OK [{collection1}, {collection2}, ...]
@enduml
```

### Create and Manage Sets

```plantuml
@startuml
actor Photographer as P
participant "CollectionSetsController" as CSC
participant "MediatR" as M
participant "ApplicationDbContext" as DB

== Create a Set ==
P -> CSC : POST /api/collections/{collectionId}/sets\n{title, description, sortOrder, isClientExclusive}
CSC -> M : Send(CreateSetCommand)
M -> DB : Verify Collection exists\nand belongs to photographer
M -> DB : CollectionSets.Add(newSet)
M -> DB : SaveChangesAsync()
M --> CSC : Result.Success(CollectionSetDto)
CSC --> P : 200 OK

== Reorder Sets ==
P -> CSC : PUT /api/collections/{collectionId}/sets/reorder\n{setIdsInOrder: [id3, id1, id2]}
CSC -> M : Send(ReorderSetsCommand)
M -> DB : Load all sets for collection

loop each setId with index
  M -> M : set.SortOrder = index
end

M -> DB : SaveChangesAsync()
M --> CSC : Result.Success
CSC --> P : 200 OK
@enduml
```

### Move Media Between Sets

```plantuml
@startuml
actor Photographer as P
participant "GalleryMediaController" as GMC
participant "MediatR" as M
participant "MoveMediaHandler" as MH
participant "ApplicationDbContext" as DB

P -> GMC : POST /api/collections/{cid}/media/{mid}/move\n{targetSetId: "set-uuid" or null}
GMC -> M : Send(MoveMediaCommand(mid, targetSetId))
M -> MH : Handle(command)

MH -> DB : Find GalleryMedia by Id
alt media not found
  MH --> M : Result.Failure("Media not found")
  M --> GMC : 404
  GMC --> P : 404 Not Found
end

alt targetSetId is not null
  MH -> DB : Find CollectionSet by targetSetId
  alt set not found or different collection
    MH --> M : Result.Failure("Target set not found")
    M --> GMC : 400
    GMC --> P : 400 Bad Request
  end
end

MH -> DB : media.SetId = targetSetId
note right: null means "move to\ncollection root"

MH -> DB : Recalculate SortOrder\nin target set (append at end)
MH -> DB : SaveChangesAsync()
MH --> M : Result.Success
M --> GMC : Result.Success
GMC --> P : 200 OK
@enduml
```

### Star/Bookmark Collections and Photos

```plantuml
@startuml
actor Photographer as P
participant "CollectionsController" as CC
participant "GalleryMediaController" as GMC
participant "MediatR" as M
participant "ApplicationDbContext" as DB

== Star a Collection ==
P -> CC : POST /api/collections/{id}/star
CC -> M : Send(ToggleStarCollectionCommand(id))
M -> DB : Load Collection
M -> M : collection.IsStarred =\n  !collection.IsStarred
M -> DB : SaveChangesAsync()
M --> CC : Result.Success({IsStarred: true})
CC --> P : 200 OK

== Bulk Star Photos ==
P -> GMC : POST /api/collections/{cid}/media/bulk-star\n{mediaIds: [...], star: true}
GMC -> M : Send(BulkStarMediaCommand)
M -> DB : Load GalleryMedia\nwhere Id in mediaIds\nand CollectionId == cid

loop each media item
  M -> M : media.IsStarred = star
end

M -> DB : SaveChangesAsync()
M --> GMC : Result.Success
GMC --> P : 200 OK

== List Starred Collections ==
P -> CC : GET /api/collections?starredOnly=true
CC -> M : Send(ListCollectionsQuery(starredOnly: true))
M -> DB : Collections\n  .Where(c => c.IsStarred)\n  .OrderByDescending(c => c.UpdatedAt)
DB --> M : List<Collection>
M --> CC : PagedList<CollectionDto>
CC --> P : 200 OK
@enduml
```

### Preset Management Lifecycle

```plantuml
@startuml
actor Photographer as P
participant "CollectionPresetsController" as CPC
participant "MediatR" as M
participant "ApplicationDbContext" as DB

== Save Settings as Preset ==
P -> CPC : POST /api/collection-presets\n{name, coverStyle, theme, fontFamily,\ncolorPalette, layout, downloadsEnabled,\ndownloadPinEnabled, allowedResolutions,\nrequireEmailRegistration, language}
CPC -> M : Send(CreatePresetCommand)
M -> DB : CollectionPresets.Add(preset)
M -> DB : SaveChangesAsync()
M --> CPC : Result.Success(PresetDto)
CPC --> P : 200 OK

== Apply Preset to Existing Collection ==
P -> CPC : PUT /api/collections/{id}\n{presetId: "preset-uuid"}
note right: UpdateCollectionCommand\ndetects presetId and\ncopies all settings
CPC -> M : Send(UpdateCollectionCommand)
M -> DB : Load preset
M -> DB : Load collection
M -> M : Copy all preset fields\nto collection
M -> DB : collection.PresetId = presetId
M -> DB : SaveChangesAsync()
M --> CPC : Result.Success(CollectionDto)
CPC --> P : 200 OK

== Update Preset ==
P -> CPC : PUT /api/collection-presets/{id}\n{name: "Wedding Premium", theme: Dark}
CPC -> M : Send(UpdatePresetCommand)
M -> DB : Load preset, update fields
M -> DB : SaveChangesAsync()
M --> CPC : Result.Success
CPC --> P : 200 OK

== Delete Preset ==
P -> CPC : DELETE /api/collection-presets/{id}
CPC -> M : Send(DeletePresetCommand)
M -> DB : preset.IsDeleted = true
note right: Collections referencing\nthis preset keep their\ncurrent settings
M -> DB : SaveChangesAsync()
M --> CPC : Result.Success
CPC --> P : 200 OK
@enduml
```
