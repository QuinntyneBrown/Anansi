# F50 - Photographer Directory Search

## Overview

This feature delivers the public-facing photographer directory search API, enabling clients to discover photographers by cultural specialization, geographic proximity, or both. The search surface is entirely public -- no authentication is required -- and serves as the primary discovery mechanism for connecting clients with photographers who have cultural expertise relevant to their needs.

The directory search supports three modes. Tag-based search accepts one or more cultural specialization tag names and returns photographers who match ANY of the specified tags, ranked by the number of matching tags (relevance score). Location-based search accepts either a predefined neighborhood name or raw latitude/longitude coordinates and returns photographers whose configured service radius covers the search point, ranked by distance calculated via the Haversine formula. Combined search applies both tag and location filters simultaneously, returning only photographers who match at least one tag AND serve the specified area, ranked by a composite score that blends tag relevance with geographic proximity.

All search results are paginated (default 20 per page) and include photographer name, business name, profile image URL, cultural tags, neighborhood, and the computed relevance or distance score. The search leverages the cultural tags and service area data established by F49 (Cultural Specialization Tags), reading from `PhotographerCulturalTag`, `PhotographerServiceArea`, and related entities. Because these are read-only queries against public profile data, the feature has no write operations and no authorization requirements.

**L2 Requirements:** TAG-22.3.1 (Search by Cultural Tags), TAG-22.3.2 (Search by Neighborhood/Distance), TAG-22.3.3 (Combined Search)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PhotographerCulturalTag` | Entity (existing, F49) | Join entity linking a photographer to a cultural tag. Fields: `PhotographerId`, `CulturalTagId`. Implements `ITenantEntity`. |
| `CulturalTag` | Entity (existing, F49) | A cultural specialization tag with `Name`, `IsSystem` (predefined vs. custom), `UsageCount`. |
| `PhotographerServiceArea` | Entity (existing, F49) | Stores photographer's `Neighborhood`, `Latitude`, `Longitude`, `RadiusKm`. Implements `ITenantEntity`. |
| `Neighborhood` | Value Object (existing, F49) | Predefined Toronto neighborhoods with `Name`, `Latitude`, `Longitude`. Used to resolve neighborhood name to coordinates in location search. |
| `PhotographerProfile` | Entity (existing, F01) | Contains `DisplayName`, `BusinessName`, `ProfileImageUrl`. Referenced to build search result DTOs. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `SearchDirectoryQuery` | Query | Unified search query accepting optional `Tags` (string array), optional `Neighborhood` (string), optional `Latitude`/`Longitude` (double?), `Page` (int, default 1), `PageSize` (int, default 20). Dispatched via MediatR. |
| `SearchDirectoryQueryHandler` | Handler | Core search logic. Branches on which filters are provided: tag-only, location-only, or combined. Builds the result set from joined queries against `PhotographerCulturalTag`, `PhotographerServiceArea`, and `PhotographerProfile`. Computes relevance scores and distances. Returns `PaginatedResult<DirectorySearchResultDto>`. |
| `DirectorySearchResultDto` | DTO | Result item: `PhotographerId`, `DisplayName`, `BusinessName`, `ProfileImageUrl`, `CulturalTags` (string[]), `Neighborhood`, `MatchingTagCount` (int?), `DistanceKm` (double?), `RelevanceScore` (double). |
| `PaginatedResult<T>` | DTO (existing) | Generic paginated wrapper: `Items`, `Page`, `PageSize`, `TotalCount`, `TotalPages`. |
| `SearchDirectoryQueryValidator` | Validator | FluentValidation rules: at least one of Tags or Neighborhood/Coordinates must be provided. PageSize max 100. Latitude range -90 to 90. Longitude range -180 to 180. |
| `INeighborhoodLookupService` | Interface | Resolves a neighborhood name to lat/lng coordinates. `GetCoordinatesAsync(string neighborhoodName)` returns `(double Latitude, double Longitude)?`. |
| `IHaversineCalculator` | Interface | Computes distance between two geographic points. `CalculateDistanceKm(double lat1, double lng1, double lat2, double lng2)` returns `double`. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `SearchDirectoryQueryHandler` | Handler | Implements the search logic. For tag search: joins `PhotographerCulturalTag` with `CulturalTag` filtering by tag names, groups by photographer, counts matches, orders by count descending. For location search: loads all `PhotographerServiceArea` records, computes Haversine distance, filters where distance <= radiusKm, orders by distance ascending. For combined: intersects both result sets, computes composite score (normalized tag count + inverse normalized distance). |
| `NeighborhoodLookupService` | Service | Implements `INeighborhoodLookupService`. Maintains an in-memory dictionary of predefined Toronto neighborhoods with their coordinates. Falls back to database lookup for custom neighborhoods. |
| `HaversineCalculator` | Service | Implements `IHaversineCalculator`. Pure math implementation of the Haversine formula: `a = sin^2(dlat/2) + cos(lat1) * cos(lat2) * sin^2(dlng/2)`, `c = 2 * atan2(sqrt(a), sqrt(1-a))`, `d = R * c` where R = 6371 km. |
| `PhotographerCulturalTagConfiguration` | EF Config (existing, F49) | Composite index on `(CulturalTagId, PhotographerId)` for efficient tag-based lookups. |
| `PhotographerServiceAreaConfiguration` | EF Config (existing, F49) | Index on `(Latitude, Longitude)` for spatial queries. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `DirectoryController` | Controller | Single public endpoint: `GET /api/directory/search`. Accepts query parameters: `tags` (comma-separated), `neighborhood` (string), `lat` (double?), `lng` (double?), `page` (int), `pageSize` (int). No `[Authorize]` attribute. Maps query string to `SearchDirectoryQuery` and dispatches via MediatR. Returns `200 OK` with paginated results. |

---

## Class Diagrams

### Domain Layer -- Directory Search Entities (from F49)

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PhotographerProfile {
  +Id : Guid
  +UserId : Guid
  +DisplayName : string
  +BusinessName : string?
  +ProfileImageUrl : string?
}

class CulturalTag {
  +Id : Guid
  +Name : string
  +IsSystem : bool
  +UsageCount : int
}

class PhotographerCulturalTag {
  +Id : Guid
  +PhotographerId : Guid
  +CulturalTagId : Guid
}

class PhotographerServiceArea {
  +Id : Guid
  +PhotographerId : Guid
  +Neighborhood : string
  +Latitude : double
  +Longitude : double
  +RadiusKm : int
}

PhotographerProfile "1" --> "*" PhotographerCulturalTag : has tags
PhotographerCulturalTag "*" --> "1" CulturalTag : references
PhotographerProfile "1" --> "0..1" PhotographerServiceArea : service area
@enduml
```

### Application Layer -- Search Query & DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Directory.Queries" {
  class SearchDirectoryQuery <<record>> {
    +Tags : string[]?
    +Neighborhood : string?
    +Latitude : double?
    +Longitude : double?
    +Page : int
    +PageSize : int
  }

  class SearchDirectoryQueryValidator {
    +SearchDirectoryQueryValidator()
  }

  class DirectorySearchResultDto <<record>> {
    +PhotographerId : Guid
    +DisplayName : string
    +BusinessName : string?
    +ProfileImageUrl : string?
    +CulturalTags : string[]
    +Neighborhood : string?
    +MatchingTagCount : int?
    +DistanceKm : double?
    +RelevanceScore : double
  }

  class "PaginatedResult<DirectorySearchResultDto>" as PaginatedResult {
    +Items : List<DirectorySearchResultDto>
    +Page : int
    +PageSize : int
    +TotalCount : int
    +TotalPages : int
  }
}

SearchDirectoryQuery ..> PaginatedResult : returns
SearchDirectoryQueryValidator ..> SearchDirectoryQuery : validates
@enduml
```

### Infrastructure Layer -- Search Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface INeighborhoodLookupService {
  +GetCoordinatesAsync(name : string) : Task<(double, double)?>
}

interface IHaversineCalculator {
  +CalculateDistanceKm(lat1, lng1, lat2, lng2) : double
}

class SearchDirectoryQueryHandler {
  -_dbContext : IApplicationDbContext
  -_neighborhoodLookup : INeighborhoodLookupService
  -_haversine : IHaversineCalculator
  +Handle(query, ct) : PaginatedResult<DirectorySearchResultDto>
}

class NeighborhoodLookupService {
  -_neighborhoods : Dictionary<string, (double, double)>
  -_dbContext : IApplicationDbContext
  +GetCoordinatesAsync(name) : Task<(double, double)?>
}

class HaversineCalculator {
  +CalculateDistanceKm(lat1, lng1, lat2, lng2) : double
}

INeighborhoodLookupService <|.. NeighborhoodLookupService
IHaversineCalculator <|.. HaversineCalculator
SearchDirectoryQueryHandler --> INeighborhoodLookupService
SearchDirectoryQueryHandler --> IHaversineCalculator
@enduml
```

### API Layer -- Directory Controller

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class DirectoryController <<ApiController>> {
  -_mediator : IMediator
  +Search(tags, neighborhood, lat, lng, page, pageSize) : IActionResult
}

note right of DirectoryController
  GET /api/directory/search
  Public endpoint (no [Authorize]).
  All parameters are optional query strings.
  At least one of tags or neighborhood/lat+lng
  must be provided (validated server-side).
end note

DirectoryController --> "IMediator" : sends SearchDirectoryQuery
@enduml
```

---

## Sequence Diagrams

### Search by Cultural Tags

```plantuml
@startuml
actor Client as C
participant "DirectoryController" as DC
participant "MediatR" as M
participant "SearchDirectoryQueryHandler" as H
participant "ApplicationDbContext" as DB

C -> DC : GET /api/directory/search\n?tags=Caribbean+Wedding,Caribana\n&page=1&pageSize=20
DC -> DC : Map query params to\nSearchDirectoryQuery
DC -> M : Send(SearchDirectoryQuery)
M -> H : Handle()

H -> H : Detect tag-only search mode\n(no neighborhood/coordinates)

H -> DB : SELECT p.Id, p.DisplayName,\np.BusinessName, p.ProfileImageUrl,\nsa.Neighborhood,\nCOUNT(pct.Id) AS MatchingTagCount\nFROM PhotographerProfiles p\nJOIN PhotographerCulturalTags pct\nJOIN CulturalTags ct\nWHERE ct.Name IN ('Caribbean Wedding', 'Caribana')\nGROUP BY p.Id\nORDER BY MatchingTagCount DESC
DB --> H : matchedPhotographers

H -> DB : Load all CulturalTags\nfor matched photographer IDs
DB --> H : allTags per photographer

H -> H : Build DirectorySearchResultDto[]\nwith RelevanceScore = MatchingTagCount

H -> H : Apply pagination\n(skip 0, take 20)

H --> M : PaginatedResult<DirectorySearchResultDto>
M --> DC : result
DC --> C : 200 OK {\n  items: [{name, businessName,\n    profileImage, tags,\n    neighborhood, matchingTagCount: 2,\n    relevanceScore: 2.0}],\n  page: 1, totalCount: 15\n}
@enduml
```

### Search by Neighborhood / Distance

```plantuml
@startuml
actor Client as C
participant "DirectoryController" as DC
participant "MediatR" as M
participant "SearchDirectoryQueryHandler" as H
participant "INeighborhoodLookupService" as NL
participant "IHaversineCalculator" as HC
participant "ApplicationDbContext" as DB

C -> DC : GET /api/directory/search\n?neighborhood=Scarborough\n&page=1&pageSize=20
DC -> M : Send(SearchDirectoryQuery)
M -> H : Handle()

H -> H : Detect location-only search mode

H -> NL : GetCoordinatesAsync("Scarborough")
NL --> H : (43.7731, -79.2577)

H -> DB : Load all PhotographerServiceArea\nrecords (with PhotographerProfile join)
DB --> H : serviceAreas[]

loop for each service area
  H -> HC : CalculateDistanceKm(\nsearchLat, searchLng,\nphotographerLat, photographerLng)
  HC --> H : distanceKm

  H -> H : Include if distanceKm <= radiusKm
end

H -> H : Sort by distanceKm ascending

H -> H : Apply pagination (skip 0, take 20)

H -> DB : Load CulturalTags\nfor included photographer IDs
DB --> H : tags per photographer

H -> H : Build DirectorySearchResultDto[]\nwith DistanceKm and\nRelevanceScore = 1/distanceKm

H --> M : PaginatedResult<DirectorySearchResultDto>
M --> DC : result
DC --> C : 200 OK {\n  items: [{name, businessName,\n    neighborhood: "Scarborough",\n    distanceKm: 2.3,\n    relevanceScore: 0.43}],\n  page: 1, totalCount: 8\n}
@enduml
```

### Combined Search (Tags + Location)

```plantuml
@startuml
actor Client as C
participant "DirectoryController" as DC
participant "MediatR" as M
participant "SearchDirectoryQueryHandler" as H
participant "INeighborhoodLookupService" as NL
participant "IHaversineCalculator" as HC
participant "ApplicationDbContext" as DB

C -> DC : GET /api/directory/search\n?tags=Nigerian+Traditional\n&neighborhood=Little+Jamaica\n&page=1&pageSize=20
DC -> M : Send(SearchDirectoryQuery)
M -> H : Handle()

H -> H : Detect combined search mode\n(tags AND location provided)

== Tag Matching Phase ==

H -> DB : SELECT PhotographerId,\nCOUNT(*) AS MatchingTagCount\nFROM PhotographerCulturalTags pct\nJOIN CulturalTags ct\nWHERE ct.Name IN ('Nigerian Traditional')\nGROUP BY PhotographerId
DB --> H : tagMatches (photographerId -> count)

== Location Filtering Phase ==

H -> NL : GetCoordinatesAsync("Little Jamaica")
NL --> H : (43.6896, -79.4285)

H -> DB : Load PhotographerServiceArea\nWHERE PhotographerId IN (tagMatches)
DB --> H : serviceAreas[]

loop for each service area in tag-matched set
  H -> HC : CalculateDistanceKm(\nsearchLat, searchLng,\nphotographerLat, photographerLng)
  HC --> H : distanceKm

  H -> H : Exclude if distanceKm > radiusKm
end

== Scoring Phase ==

H -> H : Compute composite score:\nmaxTags = max(matchingTagCounts)\nmaxDist = max(distances)\nFor each photographer:\n  tagScore = matchCount / maxTags\n  distScore = 1 - (distance / maxDist)\n  composite = (tagScore * 0.6) + (distScore * 0.4)

H -> H : Sort by composite score descending

H -> H : Apply pagination

H -> DB : Load full profile + all tags\nfor result set
DB --> H : profiles + tags

H --> M : PaginatedResult<DirectorySearchResultDto>
M --> DC : result
DC --> C : 200 OK {\n  items: [{name, tags,\n    matchingTagCount: 1,\n    distanceKm: 3.1,\n    relevanceScore: 0.82}],\n  page: 1, totalCount: 4\n}
@enduml
```
