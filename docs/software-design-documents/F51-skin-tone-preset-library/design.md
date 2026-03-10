# F51 - Skin Tone Preset Library

## Overview

The Skin Tone Preset Library provides a curated and community-driven collection of photo editing presets optimized for melanin-rich skin tones. Each preset stores a comprehensive set of Lightroom-compatible adjustment values -- basic tone adjustments (Temperature, Tint, Exposure, Contrast, Highlights, Shadows, Whites, Blacks, Clarity, Vibrance, Saturation), HSL channel adjustments (Hue, Saturation, and Luminance for each of 8 color channels: Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta), and split-tone color grading values (HighlightHue, HighlightSaturation, ShadowHue, ShadowSaturation). These values are stored in a structured format that can be exported as Lightroom XMP-compatible data.

Presets are categorized along two axes: skin tone range (Light, Medium, Deep, VeryDeep) and shooting context (StudioPortrait, OutdoorNatural, EventReception, GoldenHour, LowLight, Flash). Photographers browse presets using these filters, with results ordered by popularity (favorite count). Any authenticated photographer can favorite or unfavorite presets for quick access. The full preset detail endpoint returns all adjustment values in a Lightroom-compatible structure.

Photographers and platform admins can create new presets. Photographers may update or soft-delete only their own presets -- attempts to modify another photographer's preset return 403. When a preset is soft-deleted, other photographers' favorites referencing it display an "unavailable" indicator. The platform ships with at least 8 curated system presets (isSystemPreset=true, author="Anansi") spanning all four skin tone ranges and multiple shooting contexts. System presets cannot be edited or deleted by photographers.

**L2 Requirements:** PRE-23.1.1 (Create Preset), PRE-23.2.1 (Browse by Category), PRE-23.2.2 (Favorite), PRE-23.2.3 (Preset Detail), PRE-23.3.1 (Update Own), PRE-23.3.2 (Delete Own), PRE-23.3.3 (Seed System Presets)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `EditingPreset` | Entity | Core preset entity. Fields: `Name`, `Description`, `AuthorId` (Guid?, null for system), `AuthorName` (string, "Anansi" for system), `IsSystemPreset` (bool), `SkinToneRange` (enum), `ShootingContext` (enum), `FavoriteCount` (int), `IsPublic` (bool, default true). Extends `BaseEntity`, implements `ISoftDeletable`, `IAuditableEntity`. |
| `PresetAdjustments` | Owned Entity | Owned by `EditingPreset`. Stores all Lightroom-compatible values: `Temperature` (double), `Tint` (double), `Exposure` (double), `Contrast` (double), `Highlights` (double), `Shadows` (double), `Whites` (double), `Blacks` (double), `Clarity` (double), `Vibrance` (double), `Saturation` (double). |
| `PresetHslChannel` | Entity | One record per color channel per preset. Fields: `PresetId`, `Channel` (HslColorChannel enum), `Hue` (double), `Saturation` (double), `Luminance` (double). 8 channels: Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta. |
| `PresetSplitTone` | Owned Entity | Owned by `EditingPreset`. Fields: `HighlightHue` (double), `HighlightSaturation` (double), `ShadowHue` (double), `ShadowSaturation` (double). |
| `PresetFavorite` | Entity | Join entity: `PhotographerId`, `PresetId`, `CreatedAt`. Unique constraint on `(PhotographerId, PresetId)`. |
| `SkinToneRange` | Enum | `Light`, `Medium`, `Deep`, `VeryDeep`. |
| `ShootingContext` | Enum | `StudioPortrait`, `OutdoorNatural`, `EventReception`, `GoldenHour`, `LowLight`, `Flash`. |
| `HslColorChannel` | Enum | `Red`, `Orange`, `Yellow`, `Green`, `Aqua`, `Blue`, `Purple`, `Magenta`. |
| `PresetFavoritedEvent` | Domain Event | Raised when a preset is favorited. Increments `FavoriteCount`. |
| `PresetUnfavoritedEvent` | Domain Event | Raised when a preset is unfavorited. Decrements `FavoriteCount`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreatePresetCommand` | Command | Creates a new preset. Accepts name, description, skin tone range, shooting context, isPublic, and the full set of adjustment values (basic, HSL array, split tone). Sets `AuthorId` to current user. Returns `PresetDetailDto`. |
| `UpdatePresetCommand` | Command | Updates an existing preset. Validates that the current user is the author (403 otherwise). System presets cannot be updated (403). Accepts all mutable fields and adjustment values. |
| `DeletePresetCommand` | Command | Soft-deletes a preset. Validates ownership (403 for non-owner). System presets cannot be deleted (403). Sets `IsDeleted=true`, `DeletedAt=now`. |
| `FavoritePresetCommand` | Command | Adds a `PresetFavorite` for the current user. Raises `PresetFavoritedEvent`. Idempotent -- if already favorited, returns success without duplicating. |
| `UnfavoritePresetCommand` | Command | Removes the `PresetFavorite` for the current user. Raises `PresetUnfavoritedEvent`. Idempotent. |
| `BrowsePresetsQuery` | Query | Paginated query with optional filters: `SkinToneRange?`, `ShootingContext?`, `IsSystem?`, `SearchTerm?`. Results ordered by `FavoriteCount` descending. Each result includes whether the current user has favorited it. |
| `GetPresetDetailQuery` | Query | Returns full preset including all adjustment values (basic, 8 HSL channels, split tone) for a given preset ID. Returns 404 if soft-deleted. |
| `GetFavoritePresetsQuery` | Query | Returns the current user's favorited presets. Includes an `IsAvailable` flag (false if the preset has been soft-deleted). |
| `PresetSummaryDto` | DTO | Browse result: `Id`, `Name`, `Description`, `AuthorName`, `SkinToneRange`, `ShootingContext`, `FavoriteCount`, `IsSystemPreset`, `IsFavorited` (by current user), `IsAvailable`. |
| `PresetDetailDto` | DTO | Full detail: all fields from `PresetSummaryDto` plus `Temperature`, `Tint`, `Exposure`, `Contrast`, `Highlights`, `Shadows`, `Whites`, `Blacks`, `Clarity`, `Vibrance`, `Saturation`, `HslChannels[]` (channel, hue, sat, lum), `SplitTone` (highlightHue, highlightSat, shadowHue, shadowSat). |
| `CreatePresetCommandValidator` | Validator | Name required (max 100 chars). SkinToneRange and ShootingContext must be valid enum values. HSL array must have exactly 8 entries with valid channel values. All numeric adjustments within Lightroom-valid ranges. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreatePresetCommandHandler` | Handler | Creates `EditingPreset` with owned `PresetAdjustments` and `PresetSplitTone`, plus 8 `PresetHslChannel` records. Persists via `IApplicationDbContext`. |
| `UpdatePresetCommandHandler` | Handler | Loads preset, validates ownership, updates all fields and child entities. |
| `DeletePresetCommandHandler` | Handler | Loads preset, validates ownership and non-system, sets soft-delete fields. |
| `FavoritePresetCommandHandler` | Handler | Creates `PresetFavorite` if not exists. Increments `EditingPreset.FavoriteCount`. |
| `UnfavoritePresetCommandHandler` | Handler | Removes `PresetFavorite` if exists. Decrements `EditingPreset.FavoriteCount`. |
| `BrowsePresetsQueryHandler` | Handler | Builds a query with optional filters against `EditingPreset` where `IsDeleted=false`. Left-joins `PresetFavorite` for the current user to set `IsFavorited`. Orders by `FavoriteCount DESC`. Paginates. |
| `GetPresetDetailQueryHandler` | Handler | Loads `EditingPreset` with eager-loaded `PresetAdjustments`, `PresetHslChannel` (8 records), and `PresetSplitTone`. Maps to `PresetDetailDto`. |
| `PresetSeedService` | Service | Runs on application startup. Seeds 8+ system presets if they do not already exist. Presets span all `SkinToneRange` values and multiple `ShootingContext` values. Each has `IsSystemPreset=true`, `AuthorName="Anansi"`, `AuthorId=null`. |
| `EditingPresetConfiguration` | EF Config | Index on `(SkinToneRange, ShootingContext)` for filtered browsing. Index on `FavoriteCount DESC` for popularity ordering. Owns `PresetAdjustments` and `PresetSplitTone` as table-splitting. |
| `PresetHslChannelConfiguration` | EF Config | Composite key on `(PresetId, Channel)`. Foreign key to `EditingPreset`. |
| `PresetFavoriteConfiguration` | EF Config | Unique constraint on `(PhotographerId, PresetId)`. Index on `PhotographerId` for favorites list query. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PresetsController` | Controller | CRUD and browse endpoints. `POST /api/presets` (create, `[Authorize]`). `GET /api/presets` (browse with query filters, `[Authorize]`). `GET /api/presets/{id}` (detail, `[Authorize]`). `PUT /api/presets/{id}` (update, `[Authorize]`). `DELETE /api/presets/{id}` (soft-delete, `[Authorize]`). |
| `PresetFavoritesController` | Controller | Favorite management. `POST /api/presets/{id}/favorite` (`[Authorize]`). `DELETE /api/presets/{id}/favorite` (`[Authorize]`). `GET /api/presets/favorites` (list user's favorites, `[Authorize]`). |

---

## Class Diagrams

### Domain Layer -- Preset Core Entity & Enums

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EditingPreset {
  +Id : Guid
  +Name : string
  +Description : string?
  +AuthorId : Guid?
  +AuthorName : string
  +IsSystemPreset : bool
  +SkinToneRange : SkinToneRange
  +ShootingContext : ShootingContext
  +FavoriteCount : int
  +IsPublic : bool
  +IsDeleted : bool
  +DeletedAt : DateTime?
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

enum SkinToneRange {
  Light
  Medium
  Deep
  VeryDeep
}

enum ShootingContext {
  StudioPortrait
  OutdoorNatural
  EventReception
  GoldenHour
  LowLight
  Flash
}

EditingPreset ..> SkinToneRange
EditingPreset ..> ShootingContext
@enduml
```

### Domain Layer -- Adjustment Values & HSL Channels

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EditingPreset {
  +Id : Guid
  +Name : string
}

class PresetAdjustments <<owned>> {
  +Temperature : double
  +Tint : double
  +Exposure : double
  +Contrast : double
  +Highlights : double
  +Shadows : double
  +Whites : double
  +Blacks : double
  +Clarity : double
  +Vibrance : double
  +Saturation : double
}

class PresetSplitTone <<owned>> {
  +HighlightHue : double
  +HighlightSaturation : double
  +ShadowHue : double
  +ShadowSaturation : double
}

class PresetHslChannel {
  +PresetId : Guid
  +Channel : HslColorChannel
  +Hue : double
  +Saturation : double
  +Luminance : double
}

enum HslColorChannel {
  Red
  Orange
  Yellow
  Green
  Aqua
  Blue
  Purple
  Magenta
}

EditingPreset *-- "1" PresetAdjustments : owns
EditingPreset *-- "1" PresetSplitTone : owns
EditingPreset "1" --> "8" PresetHslChannel : channels
PresetHslChannel ..> HslColorChannel
@enduml
```

### Domain Layer -- Favorites

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EditingPreset {
  +Id : Guid
  +Name : string
  +FavoriteCount : int
}

class PresetFavorite {
  +Id : Guid
  +PhotographerId : Guid
  +PresetId : Guid
  +CreatedAt : DateTime
}

EditingPreset "1" --> "*" PresetFavorite : favorited by
@enduml
```

### Application Layer -- Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Presets.Commands" {
  class CreatePresetCommand <<record>> {
    +Name : string
    +Description : string?
    +SkinToneRange : SkinToneRange
    +ShootingContext : ShootingContext
    +IsPublic : bool
    +Adjustments : AdjustmentsInput
    +HslChannels : HslChannelInput[]
    +SplitTone : SplitToneInput
  }

  class UpdatePresetCommand <<record>> {
    +PresetId : Guid
    +Name : string
    +Description : string?
    +SkinToneRange : SkinToneRange
    +ShootingContext : ShootingContext
    +Adjustments : AdjustmentsInput
    +HslChannels : HslChannelInput[]
    +SplitTone : SplitToneInput
  }

  class DeletePresetCommand <<record>> {
    +PresetId : Guid
  }

  class FavoritePresetCommand <<record>> {
    +PresetId : Guid
  }

  class UnfavoritePresetCommand <<record>> {
    +PresetId : Guid
  }
}

package "Features.Presets.Queries" {
  class BrowsePresetsQuery <<record>> {
    +SkinToneRange : SkinToneRange?
    +ShootingContext : ShootingContext?
    +IsSystem : bool?
    +SearchTerm : string?
    +Page : int
    +PageSize : int
  }

  class GetPresetDetailQuery <<record>> {
    +PresetId : Guid
  }

  class GetFavoritePresetsQuery <<record>> {
    +Page : int
    +PageSize : int
  }
}
@enduml
```

### Application Layer -- DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PresetSummaryDto <<record>> {
  +Id : Guid
  +Name : string
  +Description : string?
  +AuthorName : string
  +SkinToneRange : string
  +ShootingContext : string
  +FavoriteCount : int
  +IsSystemPreset : bool
  +IsFavorited : bool
  +IsAvailable : bool
}

class PresetDetailDto <<record>> {
  +Id : Guid
  +Name : string
  +Description : string?
  +AuthorName : string
  +SkinToneRange : string
  +ShootingContext : string
  +FavoriteCount : int
  +IsSystemPreset : bool
  +IsFavorited : bool
  +Adjustments : AdjustmentsDto
  +HslChannels : HslChannelDto[]
  +SplitTone : SplitToneDto
}

class AdjustmentsDto <<record>> {
  +Temperature : double
  +Tint : double
  +Exposure : double
  +Contrast : double
  +Highlights : double
  +Shadows : double
  +Whites : double
  +Blacks : double
  +Clarity : double
  +Vibrance : double
  +Saturation : double
}

class HslChannelDto <<record>> {
  +Channel : string
  +Hue : double
  +Saturation : double
  +Luminance : double
}

class SplitToneDto <<record>> {
  +HighlightHue : double
  +HighlightSaturation : double
  +ShadowHue : double
  +ShadowSaturation : double
}

PresetDetailDto *-- "1" AdjustmentsDto
PresetDetailDto *-- "8" HslChannelDto
PresetDetailDto *-- "1" SplitToneDto
@enduml
```

### API Layer -- Preset Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PresetsController <<ApiController>> {
  -_mediator : IMediator
  +Create(cmd) : IActionResult
  +Browse(skinTone, context, isSystem, search, page, pageSize) : IActionResult
  +GetDetail(id) : IActionResult
  +Update(id, cmd) : IActionResult
  +Delete(id) : IActionResult
}

class PresetFavoritesController <<ApiController>> {
  -_mediator : IMediator
  +Favorite(id) : IActionResult
  +Unfavorite(id) : IActionResult
  +ListFavorites(page, pageSize) : IActionResult
}

note right of PresetsController
  All endpoints require [Authorize].
  PUT/DELETE validate ownership
  and reject system presets.
end note

PresetsController --> "IMediator" : sends commands/queries
PresetFavoritesController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### Create a New Preset

```plantuml
@startuml
actor Photographer as P
participant "PresetsController" as PC
participant "MediatR" as M
participant "CreatePresetCommandHandler" as H
participant "ApplicationDbContext" as DB

P -> PC : POST /api/presets\n{name: "Deep Glow - Golden Hour",\nskinToneRange: "Deep",\nshootingContext: "GoldenHour",\nadjustments: {temperature: 6200, ...},\nhslChannels: [{channel: "Red", ...}, ...],\nsplitTone: {highlightHue: 45, ...}}
PC -> M : Send(CreatePresetCommand)
M -> H : Handle()

H -> H : Set AuthorId = currentUserId\nSet AuthorName = currentUser.DisplayName\nSet IsSystemPreset = false

H -> DB : Create EditingPreset\nwith owned PresetAdjustments\nand owned PresetSplitTone
DB --> H : preset created

H -> DB : Create 8 PresetHslChannel records\n(Red, Orange, Yellow, Green,\nAqua, Blue, Purple, Magenta)
DB --> H : channels created

H -> DB : SaveChanges
DB --> H : saved

H -> H : Map to PresetDetailDto

H --> M : PresetDetailDto
M --> PC : result
PC --> P : 201 Created {\n  id, name, skinToneRange,\n  shootingContext, adjustments,\n  hslChannels[8], splitTone\n}
@enduml
```

### Browse Presets with Filters

```plantuml
@startuml
actor Photographer as P
participant "PresetsController" as PC
participant "MediatR" as M
participant "BrowsePresetsQueryHandler" as H
participant "ApplicationDbContext" as DB

P -> PC : GET /api/presets\n?skinTone=Deep&context=GoldenHour\n&page=1&pageSize=20
PC -> M : Send(BrowsePresetsQuery)
M -> H : Handle()

H -> DB : SELECT ep.*, \n  CASE WHEN pf.Id IS NOT NULL\n    THEN true ELSE false END AS IsFavorited\nFROM EditingPresets ep\nLEFT JOIN PresetFavorites pf\n  ON pf.PresetId = ep.Id\n  AND pf.PhotographerId = @currentUser\nWHERE ep.IsDeleted = false\n  AND ep.SkinToneRange = 'Deep'\n  AND ep.ShootingContext = 'GoldenHour'\n  AND (ep.IsPublic = true\n    OR ep.AuthorId = @currentUser)\nORDER BY ep.FavoriteCount DESC
DB --> H : presets with favorite status

H -> H : Apply pagination\n(skip 0, take 20)

H -> H : Map to PresetSummaryDto[]

H --> M : PaginatedResult<PresetSummaryDto>
M --> PC : result
PC --> P : 200 OK {\n  items: [{id, name,\n    authorName: "Anansi",\n    favoriteCount: 42,\n    isSystemPreset: true,\n    isFavorited: false}, ...],\n  page: 1, totalCount: 5\n}
@enduml
```

### Favorite / Unfavorite a Preset

```plantuml
@startuml
actor Photographer as P
participant "PresetFavoritesController" as FC
participant "MediatR" as M
participant "FavoritePresetCommandHandler" as FH
participant "UnfavoritePresetCommandHandler" as UH
participant "ApplicationDbContext" as DB

== Favorite ==

P -> FC : POST /api/presets/{id}/favorite
FC -> M : Send(FavoritePresetCommand)
M -> FH : Handle()

FH -> DB : Check PresetFavorite exists\nWHERE PhotographerId AND PresetId
DB --> FH : null (not yet favorited)

FH -> DB : Create PresetFavorite\n{PhotographerId, PresetId}
DB --> FH : created

FH -> DB : UPDATE EditingPresets\nSET FavoriteCount = FavoriteCount + 1\nWHERE Id = @presetId
DB --> FH : updated

FH -> DB : SaveChanges
DB --> FH : saved

FH --> M : success
M --> FC : result
FC --> P : 200 OK

== Unfavorite ==

P -> FC : DELETE /api/presets/{id}/favorite
FC -> M : Send(UnfavoritePresetCommand)
M -> UH : Handle()

UH -> DB : Load PresetFavorite\nWHERE PhotographerId AND PresetId
DB --> UH : favorite record

UH -> DB : Remove PresetFavorite
UH -> DB : UPDATE EditingPresets\nSET FavoriteCount = FavoriteCount - 1\nWHERE Id = @presetId
DB --> UH : updated

UH -> DB : SaveChanges
DB --> UH : saved

UH --> M : success
M --> FC : result
FC --> P : 200 OK
@enduml
```

### Get Full Preset Detail

```plantuml
@startuml
actor Photographer as P
participant "PresetsController" as PC
participant "MediatR" as M
participant "GetPresetDetailQueryHandler" as H
participant "ApplicationDbContext" as DB

P -> PC : GET /api/presets/{id}
PC -> M : Send(GetPresetDetailQuery)
M -> H : Handle()

H -> DB : Load EditingPreset\nINCLUDE PresetAdjustments\nINCLUDE PresetSplitTone\nINCLUDE PresetHslChannels\nWHERE Id = @id\nAND IsDeleted = false
DB --> H : preset with all adjustment data

alt preset not found or deleted
  H --> M : throw NotFoundException
  M --> PC : 404 Not Found
  PC --> P : 404 Not Found
end

H -> DB : Check PresetFavorite exists\nfor current user + preset
DB --> H : isFavorited

H -> H : Map to PresetDetailDto\nincluding all 8 HSL channels,\nadjustments, and split tone

H --> M : PresetDetailDto
M --> PC : result
PC --> P : 200 OK {\n  id, name, authorName,\n  skinToneRange: "Deep",\n  shootingContext: "GoldenHour",\n  adjustments: {\n    temperature: 6200, tint: 12,\n    exposure: 0.3, contrast: 15, ...},\n  hslChannels: [\n    {channel: "Red", hue: 5,\n     saturation: -10, luminance: 8},\n    ...8 channels],\n  splitTone: {\n    highlightHue: 45,\n    highlightSaturation: 25,\n    shadowHue: 240,\n    shadowSaturation: 15}\n}
@enduml
```

### Update Own Preset (with Ownership Check)

```plantuml
@startuml
actor Photographer as P
participant "PresetsController" as PC
participant "MediatR" as M
participant "UpdatePresetCommandHandler" as H
participant "ApplicationDbContext" as DB

P -> PC : PUT /api/presets/{id}\n{name: "Deep Glow v2", ...}
PC -> M : Send(UpdatePresetCommand)
M -> H : Handle()

H -> DB : Load EditingPreset by Id
DB --> H : preset

alt preset.IsSystemPreset = true
  H --> M : throw ForbiddenException\n("System presets cannot be modified")
  M --> PC : 403 Forbidden
  PC --> P : 403 Forbidden
else preset.AuthorId != currentUserId
  H --> M : throw ForbiddenException\n("You can only edit your own presets")
  M --> PC : 403 Forbidden
  PC --> P : 403 Forbidden
else valid owner
  H -> H : Update Name, Description,\nSkinToneRange, ShootingContext
  H -> H : Update PresetAdjustments values
  H -> H : Update PresetSplitTone values

  H -> DB : Remove existing PresetHslChannels
  H -> DB : Create 8 new PresetHslChannel records
  DB --> H : channels replaced

  H -> DB : SaveChanges
  DB --> H : saved

  H -> H : Map to PresetDetailDto
  H --> M : PresetDetailDto
  M --> PC : result
  PC --> P : 200 OK {updated preset detail}
end
@enduml
```

### Soft-Delete Own Preset

```plantuml
@startuml
actor Photographer as P
participant "PresetsController" as PC
participant "MediatR" as M
participant "DeletePresetCommandHandler" as H
participant "ApplicationDbContext" as DB

P -> PC : DELETE /api/presets/{id}
PC -> M : Send(DeletePresetCommand)
M -> H : Handle()

H -> DB : Load EditingPreset by Id
DB --> H : preset

alt preset.IsSystemPreset = true
  H --> M : throw ForbiddenException
  M --> PC : 403 Forbidden
  PC --> P : 403 Forbidden
else preset.AuthorId != currentUserId
  H --> M : throw ForbiddenException
  M --> PC : 403 Forbidden
  PC --> P : 403 Forbidden
else valid owner
  H -> DB : SET IsDeleted = true,\nDeletedAt = DateTime.UtcNow
  H -> DB : SaveChanges
  DB --> H : saved

  note right of H
    PresetFavorite records are NOT deleted.
    When other photographers query their
    favorites, the IsAvailable flag will
    be false for this preset (IsDeleted check).
  end note

  H --> M : success
  M --> PC : result
  PC --> P : 204 No Content
end
@enduml
```
