# F49 - Cultural Specialization Tags

## Overview

This feature enables photographers on the Anansi platform to express their cultural expertise and service areas through a tagging and geolocation system. Photographers select cultural specialization tags from a predefined library of 15 tags representing photography niches within Black and diasporic communities: Caribbean Wedding, Nigerian Traditional, Ghanaian Engagement, Ethiopian/Eritrean Ceremony, Somali Wedding, Caribana/Carnival, Afrofest Coverage, Church/Gospel Event, Natural Hair Photography, Melanin Portraiture, African Fashion, Cultural Portraits, Community Event, Black Family, and Maternity/Newborn. In addition to predefined tags, photographers can create custom free-text tags (max 50 characters each). A maximum of 20 tags (predefined + custom combined) can be associated with a single photographer profile. These tags are visible on the photographer's public profile.

The directory endpoint surfaces the full tag library for client-facing discovery. It returns all predefined tags alongside any custom tags that have been adopted by 3 or more photographers, each with a `usageCount` indicating how many photographers use that tag. This creates an organic, community-driven expansion of the tag vocabulary where popular custom tags gain visibility alongside the curated predefined set.

The neighborhood and service area component allows photographers to declare their primary neighborhood from a predefined list of Toronto neighborhoods (Little Jamaica, Jane-Finch, Scarborough/Malvern, Rexdale, Weston, Lawrence Heights, Downsview, St. James Town, Kensington Market, Liberty Village, The Annex, Yorkville, Downtown Core, North York Centre, Mississauga), set a service radius between 5 and 100 km, and store geocoded latitude/longitude coordinates. This data supports future proximity-based search and directory filtering, enabling clients to find photographers who specialize in their cultural traditions and serve their area.

**L2 Requirements:** TAG-22.1.1 (Cultural Tags), TAG-22.1.2 (Directory Tags), TAG-22.2.1 (Service Area)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CulturalTag` | Entity | A tag associated with a photographer. Contains `TagName`, `IsPredefined` (bool, distinguishes library vs custom tags), and link to `PhotographerId`. Implements `ITenantEntity`, `IAuditableEntity`. |
| `PredefinedCulturalTag` | Seed Data | Static list of 15 predefined tag names seeded into the system. Not a separate entity -- used as reference data for validation and directory display. |
| `ServiceArea` | Entity | Photographer's geographic service configuration: `PrimaryNeighborhood`, `Latitude`, `Longitude`, `RadiusKm`. One record per photographer. Implements `ITenantEntity`, `IAuditableEntity`. |
| `TorontoNeighborhood` | Seed Data | Static list of 15 predefined Toronto neighborhoods with their names. Used for validation of the `PrimaryNeighborhood` field. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `UpdateCulturalTagsCommand` | Command | Replaces the photographer's full set of cultural tags. Accepts an array of tag names (predefined or custom). Validates max 20 tags, custom tags max 50 chars each. Returns 200 with stored tags (TAG-22.1.1). |
| `GetCulturalTagsQuery` | Query | Returns the photographer's current cultural tags (TAG-22.1.1). |
| `GetDirectoryCulturalTagsQuery` | Query | Returns all available tags for directory display: all 15 predefined tags plus custom tags used by 3+ photographers, each with `usageCount` (TAG-22.1.2). |
| `UpdateServiceAreaCommand` | Command | Upserts the photographer's service area: `PrimaryNeighborhood` (validated against predefined list), `Latitude`, `Longitude`, `RadiusKm` (5-100). Returns 200 (TAG-22.2.1). |
| `GetServiceAreaQuery` | Query | Returns the photographer's service area configuration (TAG-22.2.1). |
| `CulturalTagDto` | DTO | Read model: `TagName`, `IsPredefined`. |
| `DirectoryTagDto` | DTO | Directory read model: `TagName`, `IsPredefined`, `UsageCount`. |
| `ServiceAreaDto` | DTO | Read model: `PrimaryNeighborhood`, `Latitude`, `Longitude`, `RadiusKm`. |
| `UpdateCulturalTagsValidator` | Validator | FluentValidation: max 20 tags, each tag max 50 chars, no duplicates, no empty strings. |
| `UpdateServiceAreaValidator` | Validator | FluentValidation: `PrimaryNeighborhood` must be in predefined list, `RadiusKm` between 5-100, `Latitude` between -90..90, `Longitude` between -180..180. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `UpdateCulturalTagsHandler` | Handler | Deletes all existing `CulturalTag` records for the photographer, then inserts the new set. For each tag, determines `IsPredefined` by checking against the static predefined list. |
| `GetCulturalTagsHandler` | Handler | Queries `CulturalTags` by `PhotographerId`, returns as DTOs. |
| `GetDirectoryCulturalTagsHandler` | Handler | Returns all 15 predefined tags with usage counts, plus custom tags with `COUNT(PhotographerId) >= 3`. Groups by `TagName`, counts distinct photographers. |
| `UpdateServiceAreaHandler` | Handler | Upserts `ServiceArea` for the photographer. Validates neighborhood against predefined list. |
| `GetServiceAreaHandler` | Handler | Queries `ServiceArea` by `PhotographerId`. |
| `PredefinedCulturalTagSeed` | Seed Data | Database seeder that provides the static list of 15 predefined cultural tag names for validation and directory queries. |
| `TorontoNeighborhoodSeed` | Seed Data | Database seeder that provides the static list of 15 Toronto neighborhoods for service area validation. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ProfileCulturalTagsController` | Controller | Authenticated endpoints: `PUT /api/profile/cultural-tags` (update tags), `GET /api/profile/cultural-tags` (get photographer's tags). |
| `DirectoryController` | Controller | Public endpoint: `GET /api/directory/cultural-tags` (available tags with usage counts). |
| `ProfileServiceAreaController` | Controller | Authenticated endpoints: `PUT /api/profile/service-area` (update service area), `GET /api/profile/service-area` (get service area). |

---

## Class Diagrams

### Domain Layer -- Cultural Tag & Service Area Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CulturalTag {
  +Id : Guid
  +PhotographerId : Guid
  +TagName : string
  +IsPredefined : bool
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

class ServiceArea {
  +Id : Guid
  +PhotographerId : Guid
  +PrimaryNeighborhood : string
  +Latitude : double
  +Longitude : double
  +RadiusKm : int
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

CulturalTag --> "1" Photographer : PhotographerId
ServiceArea --> "1" Photographer : PhotographerId

note bottom of CulturalTag
  Max 20 tags per photographer.
  IsPredefined = true for library tags.
  Custom tags: max 50 chars.
end note

note bottom of ServiceArea
  RadiusKm: 5..100 km.
  Neighborhood: predefined Toronto list.
  Lat/Lng: geocoded coordinates.
end note
@enduml
```

### Domain Layer -- Predefined Reference Data

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PredefinedCulturalTags <<static>> {
  {static} CaribbeanWedding : string
  {static} NigerianTraditional : string
  {static} GhanaianEngagement : string
  {static} EthiopianEritreanCeremony : string
  {static} SomaliWedding : string
  {static} CaribanaCarnaval : string
  {static} AfrofestCoverage : string
  {static} ChurchGospelEvent : string
  {static} NaturalHairPhotography : string
  {static} MelaninPortraiture : string
  {static} AfricanFashion : string
  {static} CulturalPortraits : string
  {static} CommunityEvent : string
  {static} BlackFamily : string
  {static} MaternityNewborn : string
}

class TorontoNeighborhoods <<static>> {
  {static} LittleJamaica : string
  {static} JaneFinch : string
  {static} ScarboroughMalvern : string
  {static} Rexdale : string
  {static} Weston : string
  {static} LawrenceHeights : string
  {static} Downsview : string
  {static} StJamesTown : string
  {static} KensingtonMarket : string
  {static} LibertyVillage : string
  {static} TheAnnex : string
  {static} Yorkville : string
  {static} DowntownCore : string
  {static} NorthYorkCentre : string
  {static} Mississauga : string
}
@enduml
```

### Application Layer -- Cultural Tags Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Profile.CulturalTags" {
  class UpdateCulturalTagsCommand <<record>> {
    +Tags : List<string>
  }

  class GetCulturalTagsQuery <<record>>

  class GetDirectoryCulturalTagsQuery <<record>>
}

class CulturalTagDto <<record>> {
  +TagName : string
  +IsPredefined : bool
}

class DirectoryTagDto <<record>> {
  +TagName : string
  +IsPredefined : bool
  +UsageCount : int
}

class UpdateCulturalTagsValidator <<Validator>> {
  +Tags : max 20 items
  +Each tag : max 50 chars, not empty
  +No duplicates
}

UpdateCulturalTagsCommand ..> UpdateCulturalTagsValidator : validated by
GetCulturalTagsQuery ..> CulturalTagDto : returns list
GetDirectoryCulturalTagsQuery ..> DirectoryTagDto : returns list
@enduml
```

### Application Layer -- Service Area Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Profile.ServiceArea" {
  class UpdateServiceAreaCommand <<record>> {
    +PrimaryNeighborhood : string
    +Latitude : double
    +Longitude : double
    +RadiusKm : int
  }

  class GetServiceAreaQuery <<record>>
}

class ServiceAreaDto <<record>> {
  +PrimaryNeighborhood : string
  +Latitude : double
  +Longitude : double
  +RadiusKm : int
}

class UpdateServiceAreaValidator <<Validator>> {
  +PrimaryNeighborhood : in predefined list
  +Latitude : -90..90
  +Longitude : -180..180
  +RadiusKm : 5..100
}

UpdateServiceAreaCommand ..> UpdateServiceAreaValidator : validated by
GetServiceAreaQuery ..> ServiceAreaDto : returns
@enduml
```

### API Layer -- Profile & Directory Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ProfileCulturalTagsController <<ApiController>> {
  -_mediator : IMediator
  +UpdateTags(UpdateCulturalTagsCommand) : IActionResult
  +GetTags() : IActionResult
}

class DirectoryController <<ApiController>> {
  -_mediator : IMediator
  +GetCulturalTags() : IActionResult
}

class ProfileServiceAreaController <<ApiController>> {
  -_mediator : IMediator
  +UpdateServiceArea(UpdateServiceAreaCommand) : IActionResult
  +GetServiceArea() : IActionResult
}

ProfileCulturalTagsController --> "IMediator" : sends commands/queries
DirectoryController --> "IMediator" : sends queries
ProfileServiceAreaController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### Update Cultural Tags

```plantuml
@startuml
actor Photographer as P
participant "ProfileCulturalTagsController" as PTC
participant "MediatR" as M
participant "UpdateCulturalTagsHandler" as UTH
participant "ApplicationDbContext" as DB

P -> PTC : PUT /api/profile/cultural-tags\n{tags: [\n  "Caribbean Wedding",\n  "Melanin Portraiture",\n  "Natural Hair Photography",\n  "Toronto Street Style"\n]}
PTC -> M : Send(UpdateCulturalTagsCommand)
M -> UTH : Handle(command)

UTH -> UTH : Validate (FluentValidation)\n- max 20 tags\n- each max 50 chars\n- no duplicates\n- no empty strings
alt validation fails
  UTH --> M : Result.Failure(errors)
  M --> PTC : Result.Failure
  PTC --> P : 400 Bad Request
end

UTH -> DB : Delete all CulturalTags\nWHERE PhotographerId = {id}

loop each tag in command.Tags
  UTH -> UTH : Check if tag is in\npredefined list
  UTH -> DB : CulturalTags.Add(\nphotographerId,\ntagName,\nisPredefined = true/false)
end

note right of UTH
  "Caribbean Wedding" -> isPredefined = true
  "Melanin Portraiture" -> isPredefined = true
  "Natural Hair Photography" -> isPredefined = true
  "Toronto Street Style" -> isPredefined = false (custom)
end note

UTH -> DB : SaveChangesAsync()
UTH --> M : Result.Success(\nList<CulturalTagDto>)
M --> PTC : Result.Success
PTC --> P : 200 OK\n[{tagName, isPredefined}, ...]
@enduml
```

### Get Photographer's Cultural Tags

```plantuml
@startuml
actor Photographer as P
participant "ProfileCulturalTagsController" as PTC
participant "MediatR" as M
participant "GetCulturalTagsHandler" as GTH
participant "ApplicationDbContext" as DB

P -> PTC : GET /api/profile/cultural-tags
PTC -> M : Send(GetCulturalTagsQuery)
M -> GTH : Handle(query)

GTH -> DB : Query CulturalTags\nWHERE PhotographerId = {id}\nORDER BY IsPredefined DESC,\nTagName ASC
DB --> GTH : List<CulturalTag>

GTH -> GTH : Map to List<CulturalTagDto>

GTH --> M : Result.Success(\nList<CulturalTagDto>)
M --> PTC : Result.Success
PTC --> P : 200 OK\n[{tagName: "Caribbean Wedding",\n  isPredefined: true},\n {tagName: "Toronto Street Style",\n  isPredefined: false}]
@enduml
```

### Get Directory Cultural Tags

```plantuml
@startuml
actor Client as C
participant "DirectoryController" as DC
participant "MediatR" as M
participant "GetDirectoryCulturalTagsHandler" as GDH
participant "ApplicationDbContext" as DB

C -> DC : GET /api/directory/cultural-tags
DC -> M : Send(GetDirectoryCulturalTagsQuery)
M -> GDH : Handle(query)

GDH -> GDH : Load predefined tag list\n(15 static tags)

GDH -> DB : Query CulturalTags\nGROUP BY TagName\nSELECT TagName,\nCOUNT(DISTINCT PhotographerId)\nas UsageCount

DB --> GDH : Tag usage data

GDH -> GDH : Build result set:\n1. All 15 predefined tags\n   with their usage counts\n2. Custom tags WHERE\n   UsageCount >= 3

GDH -> GDH : Sort by UsageCount DESC,\nthen TagName ASC

GDH --> M : Result.Success(\nList<DirectoryTagDto>)
M --> DC : Result.Success
DC --> C : 200 OK\n[{tagName: "Caribbean Wedding",\n  isPredefined: true,\n  usageCount: 42},\n {tagName: "Melanin Portraiture",\n  isPredefined: true,\n  usageCount: 38},\n ...\n {tagName: "Toronto Street Style",\n  isPredefined: false,\n  usageCount: 5}]
@enduml
```

### Update Service Area

```plantuml
@startuml
actor Photographer as P
participant "ProfileServiceAreaController" as PSC
participant "MediatR" as M
participant "UpdateServiceAreaHandler" as USH
participant "ApplicationDbContext" as DB

P -> PSC : PUT /api/profile/service-area\n{primaryNeighborhood:\n  "Little Jamaica",\nlatitude: 43.6896,\nlongitude: -79.4480,\nradiusKm: 25}
PSC -> M : Send(UpdateServiceAreaCommand)
M -> USH : Handle(command)

USH -> USH : Validate (FluentValidation)\n- neighborhood in predefined list\n- latitude: -90..90\n- longitude: -180..180\n- radiusKm: 5..100
alt validation fails
  USH --> M : Result.Failure(errors)
  M --> PSC : Result.Failure
  PSC --> P : 400 Bad Request
end

USH -> DB : Find ServiceArea\nby PhotographerId
alt existing record found
  USH -> DB : Update PrimaryNeighborhood,\nLatitude, Longitude, RadiusKm
else no existing record
  USH -> DB : ServiceAreas.Add(\nphotographerId,\nprimaryNeighborhood:\n  "Little Jamaica",\nlatitude: 43.6896,\nlongitude: -79.4480,\nradiusKm: 25)
end

USH -> DB : SaveChangesAsync()
USH --> M : Result.Success(ServiceAreaDto)
M --> PSC : Result.Success
PSC --> P : 200 OK\n{primaryNeighborhood:\n  "Little Jamaica",\nlatitude: 43.6896,\nlongitude: -79.4480,\nradiusKm: 25}
@enduml
```

### Get Service Area

```plantuml
@startuml
actor Photographer as P
participant "ProfileServiceAreaController" as PSC
participant "MediatR" as M
participant "GetServiceAreaHandler" as GSH
participant "ApplicationDbContext" as DB

P -> PSC : GET /api/profile/service-area
PSC -> M : Send(GetServiceAreaQuery)
M -> GSH : Handle(query)

GSH -> DB : Find ServiceArea\nby PhotographerId
alt service area exists
  DB --> GSH : ServiceArea entity
  GSH -> GSH : Map to ServiceAreaDto
else no service area configured
  GSH -> GSH : Return null/empty response
end

GSH --> M : Result.Success(ServiceAreaDto?)
M --> PSC : Result.Success
PSC --> P : 200 OK\n{primaryNeighborhood,\nlatitude, longitude, radiusKm}\nor 200 OK (null)
@enduml
```
