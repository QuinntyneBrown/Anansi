# F42 - Lightroom Plugin

## Overview

The Lightroom Plugin enables photographers to publish images directly from Adobe Lightroom Classic to their Anansi galleries without leaving the editing environment. The plugin registers as a Lightroom Publish Service, integrating with Lightroom's native publish workflow so that export-to-Anansi works the same way as export-to-Flickr or export-to-SmugMug. Photographers install the plugin through Lightroom's Plugin Manager, authenticate with their Anansi API key, and then create publish collections that map to Anansi collections.

The plugin supports three core workflows. First, initial publish: the photographer selects images in a Lightroom collection and publishes them, which uploads JPEG renditions to Anansi and creates corresponding `GalleryMedia` records. Second, re-publish: when the photographer edits an image that was previously published, Lightroom marks it as needing re-publish. The plugin detects the existing `LightroomId` mapping and performs an update-in-place rather than creating a duplicate. Third, structure sync: the plugin reads the photographer's Lightroom collection sets and mirrors them as Anansi `CollectionSet` entities, preserving the hierarchical organization. Additionally, the plugin can pull client favorite lists from Anansi and display them within Lightroom so the photographer can see which images the client selected.

On the server side, Anansi exposes a dedicated set of API endpoints under `/api/lightroom/` that the plugin calls. These endpoints delegate to the `ILightroomSyncService` interface, which orchestrates uploads via `IStorageService`, media record creation via `IApplicationDbContext`, and favorite list retrieval. Authentication uses the same API key mechanism defined in F43 (Webhooks & API), with the `ApiKey` entity and hash-based validation.

**L2 Requirements:** GAL-1.1.3 (Lightroom Plugin), INT-8.1.1 (Lightroom Integration)

---

## Components

### Domain Layer (Anansi.Domain)

| Component | Type | Description |
|-----------|------|-------------|
| `GalleryMedia` | Entity | Extended with `LightroomId` (string, nullable) to track the Lightroom catalog identifier for each published image, enabling update-on-republish. |
| `Collection` | Entity | Existing entity used as the target for Lightroom publish collections. |
| `CollectionSet` | Entity | Existing entity representing album sets. The plugin syncs Lightroom collection sets to these entities. |
| `FavoriteList` | Entity | Existing entity. The plugin reads favorite lists and their items for display inside Lightroom. |
| `FavoriteItem` | Entity | Existing entity. Each item references a `GalleryMedia` record; the plugin resolves these to Lightroom photo IDs. |
| `ApiKey` | Entity | Used for plugin authentication. The photographer generates an API key in Anansi and enters it in the Lightroom plugin settings. |

### Application Layer (Anansi.Application)

| Component | Type | Description |
|-----------|------|-------------|
| `PublishLightroomCollectionCommand` | Command | Receives a photographer ID, Lightroom collection ID, and a list of `LightroomImage` records (each with stream, filename, and isUpdate flag). Delegates to `ILightroomSyncService.PublishCollectionAsync`. Returns `LightroomPublishResult` with counts of uploaded/updated/failed images. |
| `SyncLightroomStructureCommand` | Command | Receives a list of `LightroomCollectionInfo` records (ID, name, parent ID). Delegates to `ILightroomSyncService.SyncStructureAsync` to create or update `Collection` and `CollectionSet` entities. Returns `LightroomSyncResult`. |
| `GetLightroomFavoriteListsQuery` | Query | Returns favorite lists for a given collection, including photo counts. Delegates to `ILightroomSyncService.GetFavoriteListsAsync`. |
| `GetLightroomFavoriteItemsQuery` | Query | Returns individual favorite items for a given list, including the `LightroomId` of each image so the plugin can highlight them in the Lightroom catalog. |
| `GetLightroomCollectionsQuery` | Query | Returns the photographer's Anansi collections with their Lightroom mapping status (mapped/unmapped) for the plugin's collection picker UI. |
| `ILightroomSyncService` | Interface | Defines `PublishCollectionAsync`, `SyncStructureAsync`, and `GetFavoriteListsAsync`. |
| `IStorageService` | Interface | Used by the sync service to upload image streams to blob storage. |

### Infrastructure Layer (Anansi.Infrastructure)

| Component | Type | Description |
|-----------|------|-------------|
| `LightroomSyncService` | Service | Implements `ILightroomSyncService`. For publish: uploads each image stream via `IStorageService`, creates or updates `GalleryMedia` records (matching on `LightroomId`), generates thumbnails via `ICdnService`. For structure sync: creates `Collection`/`CollectionSet` entities matching the Lightroom hierarchy. For favorites: queries `FavoriteList` and `FavoriteItem` joined with `GalleryMedia.LightroomId`. |
| `ApiKeyAuthenticationHandler` | Handler | ASP.NET Core authentication handler that validates the `X-Api-Key` header against hashed keys in the `ApiKeys` table. |

### API Layer (Anansi.Api)

| Component | Type | Description |
|-----------|------|-------------|
| `LightroomController` | Controller | Endpoints: `POST /api/lightroom/publish` (multipart upload), `POST /api/lightroom/sync-structure`, `GET /api/lightroom/collections`, `GET /api/lightroom/favorites/{collectionId}`, `GET /api/lightroom/favorites/{collectionId}/{listId}/items`. All require API key authentication. |

### Lightroom Plugin (External Lua)

| Component | Type | Description |
|-----------|------|-------------|
| `AnansiPublishServiceProvider` | Lua Module | Registers the Anansi Publish Service with Lightroom. Implements `processRenderedPhotos`, `getCollectionBehaviorInfo`, and `metadataProviderForExportedPhotos`. |
| `AnansiAPI` | Lua Module | HTTP client wrapper that calls the Anansi Lightroom API endpoints with API key authentication. Handles multipart uploads, JSON parsing, error handling. |
| `AnansiDialogs` | Lua Module | UI dialogs for API key entry, collection mapping, favorite list viewing, and publish progress. |

---

## Class Diagrams

### Domain -- GalleryMedia with Lightroom Mapping

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class GalleryMedia {
  +Id : Guid
  +PhotographerId : Guid
  +CollectionId : Guid
  +SetId : Guid?
  +FileName : string
  +OriginalFileName : string
  +MediaType : MediaType
  +FileSizeBytes : long
  +StorageKey : string
  +ThumbnailStorageKey : string?
  +LightroomId : string?
  +Width : int?
  +Height : int?
  +SortOrder : int
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

class Collection {
  +Id : Guid
  +PhotographerId : Guid
  +Title : string
  +Slug : string
  +Status : CollectionStatus
}

class CollectionSet {
  +Id : Guid
  +CollectionId : Guid
  +Title : string
  +SortOrder : int
}

class FavoriteList {
  +Id : Guid
  +CollectionId : Guid
  +Name : string
}

class FavoriteItem {
  +Id : Guid
  +FavoriteListId : Guid
  +GalleryMediaId : Guid
}

class ApiKey {
  +Id : Guid
  +PhotographerId : Guid
  +Name : string
  +KeyHash : string
  +KeyPrefix : string
  +ExpiresAt : DateTime?
  +IsActive : bool
}

Collection "1" --> "*" GalleryMedia : Media
Collection "1" --> "*" CollectionSet : Sets
Collection "1" --> "*" FavoriteList : FavoriteLists
FavoriteList "1" --> "*" FavoriteItem : Items
FavoriteItem --> "1" GalleryMedia : references

@enduml
```

![Domain -- GalleryMedia with Lightroom Mapping](domain-gallerymedia-with-lightroom-mapping.png)

### Application -- Lightroom Commands, Queries & Service Interface

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Lightroom.Commands" {
  class PublishLightroomCollectionCommand <<record>> {
    +PhotographerId : Guid
    +LightroomCollectionId : string
    +Images : List<LightroomImage>
  }

  class SyncLightroomStructureCommand <<record>> {
    +PhotographerId : Guid
    +Collections : List<LightroomCollectionInfo>
  }
}

package "Features.Lightroom.Queries" {
  class GetLightroomFavoriteListsQuery <<record>> {
    +PhotographerId : Guid
    +CollectionId : Guid
  }

  class GetLightroomFavoriteItemsQuery <<record>> {
    +FavoriteListId : Guid
  }

  class GetLightroomCollectionsQuery <<record>> {
    +PhotographerId : Guid
  }
}

interface ILightroomSyncService {
  +PublishCollectionAsync(photographerId, collectionId, images) : Task<LightroomPublishResult>
  +SyncStructureAsync(photographerId, collections) : Task<LightroomSyncResult>
  +GetFavoriteListsAsync(photographerId, collectionId) : Task<IReadOnlyList<LightroomFavoriteList>>
}

class LightroomImage <<record>> {
  +LightroomId : string
  +FileName : string
  +ImageStream : Stream?
  +IsUpdate : bool
}

class LightroomPublishResult <<record>> {
  +ImagesUploaded : int
  +ImagesUpdated : int
  +FailedImages : IReadOnlyList<string>
}

class LightroomSyncResult <<record>> {
  +CollectionsSynced : int
  +SetsSynced : int
}

class LightroomFavoriteList <<record>> {
  +FavoriteListId : Guid
  +Name : string
  +PhotoCount : int
}

PublishLightroomCollectionCommand ..> ILightroomSyncService : delegates to
SyncLightroomStructureCommand ..> ILightroomSyncService : delegates to
GetLightroomFavoriteListsQuery ..> ILightroomSyncService : delegates to

@enduml
```

![Application -- Lightroom Commands, Queries & Service Interface](application-lightroom-commands-queries-service-interface.png)

### Infrastructure -- LightroomSyncService

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface ILightroomSyncService
interface IStorageService
interface ICdnService

class LightroomSyncService {
  -_db : IApplicationDbContext
  -_storageService : IStorageService
  -_cdnService : ICdnService
  +PublishCollectionAsync() : Task<LightroomPublishResult>
  +SyncStructureAsync() : Task<LightroomSyncResult>
  +GetFavoriteListsAsync() : Task<IReadOnlyList<LightroomFavoriteList>>
}

class ApiKeyAuthenticationHandler {
  -_db : IApplicationDbContext
  +HandleAuthenticateAsync() : Task<AuthenticateResult>
}

ILightroomSyncService <|.. LightroomSyncService
LightroomSyncService --> IStorageService
LightroomSyncService --> ICdnService

@enduml
```

![Infrastructure -- LightroomSyncService](infrastructure-lightroomsyncservice.png)

### API -- LightroomController

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class LightroomController <<ApiController>> {
  -_mediator : IMediator
  +PublishCollection(images : IFormFileCollection) : IActionResult
  +SyncStructure(cmd) : IActionResult
  +GetCollections() : IActionResult
  +GetFavoriteLists(collectionId) : IActionResult
  +GetFavoriteItems(collectionId, listId) : IActionResult
}

note right of LightroomController
  All endpoints require API key authentication
  via X-Api-Key header.
  [Authorize(AuthenticationSchemes = "ApiKey")]
end note

LightroomController --> "IMediator" : sends commands/queries

@enduml
```

![API -- LightroomController](api-lightroomcontroller.png)

---

## Sequence Diagrams

### Publish Collection from Lightroom

```plantuml
@startuml
actor Photographer as P
participant "Lightroom Classic" as LR
participant "LightroomController" as LC
participant "MediatR" as M
participant "PublishCollectionHandler" as H
participant "ILightroomSyncService" as LS
participant "IStorageService" as SS
participant "ICdnService" as CDN
participant "IApplicationDbContext" as DB

P -> LR : Click "Publish" on\nAnansi publish collection
LR -> LR : Render photos to JPEG

LR -> LC : POST /api/lightroom/publish\nmultipart/form-data\n{lightroomCollectionId, images[]}
note right of LC : X-Api-Key header validated\nby ApiKeyAuthenticationHandler

LC -> M : Send(PublishLightroomCollectionCommand)
M -> H : Handle(command)
H -> LS : PublishCollectionAsync(\nphotographerId, collectionId, images)

loop for each LightroomImage
  LS -> DB : GalleryMedia.FirstOrDefault(\nLightroomId == image.LightroomId)

  alt existing media found (re-publish)
    LS -> SS : DeleteAsync(existing.StorageKey)
    LS -> SS : UploadAsync(image.ImageStream)
    SS --> LS : newStorageKey
    LS -> CDN : GenerateThumbnailAsync(storageKey)
    CDN --> LS : thumbnailKey
    LS -> LS : Update existing GalleryMedia\n(StorageKey, ThumbnailStorageKey,\nFileSizeBytes, UpdatedAt)
  else new image
    LS -> SS : UploadAsync(image.ImageStream)
    SS --> LS : storageKey
    LS -> CDN : GenerateThumbnailAsync(storageKey)
    CDN --> LS : thumbnailKey
    LS -> DB : GalleryMedia.Add(new media\nwith LightroomId set)
  end
end

LS -> DB : SaveChangesAsync()
LS --> H : LightroomPublishResult\n{uploaded: N, updated: M, failed: []}
H --> M : Result.Success
M --> LC : Result.Success
LC --> LR : 200 OK {uploaded, updated, failed}
LR --> P : "Published N photos,\nupdated M photos"
@enduml
```

![Publish Collection from Lightroom](publish-collection-from-lightroom.png)

### Sync Collection Structure

```plantuml
@startuml
actor Photographer as P
participant "Lightroom Classic" as LR
participant "LightroomController" as LC
participant "MediatR" as M
participant "SyncStructureHandler" as H
participant "ILightroomSyncService" as LS
participant "IApplicationDbContext" as DB

P -> LR : Plugin detects collection\nstructure changes
LR -> LC : POST /api/lightroom/sync-structure\n{collections: [{id, name, parentId}]}
LC -> M : Send(SyncLightroomStructureCommand)
M -> H : Handle(command)
H -> LS : SyncStructureAsync(\nphotographerId, collections)

LS -> DB : Get existing Collections\nfor photographer
DB --> LS : existingCollections[]

loop for each LightroomCollectionInfo
  alt parentId is null (top-level collection)
    LS -> DB : Find Collection by\nmatching name or create new
    alt not found
      LS -> DB : Collections.Add(new Collection)
    else found
      LS -> LS : Update title if changed
    end
  else parentId is set (nested = CollectionSet)
    LS -> DB : Find parent Collection
    LS -> DB : Find or create CollectionSet\nunder parent
  end
end

LS -> DB : SaveChangesAsync()
LS --> H : LightroomSyncResult\n{collectionsSynced: N, setsSynced: M}
H --> M : Result.Success
M --> LC : Result.Success
LC --> LR : 200 OK {collectionsSynced, setsSynced}
LR --> P : "Synced N collections,\nM sets"
@enduml
```

![Sync Collection Structure](sync-collection-structure.png)

### View Favorite Lists in Lightroom

```plantuml
@startuml
actor Photographer as P
participant "Lightroom Classic" as LR
participant "LightroomController" as LC
participant "MediatR" as M
participant "GetFavoriteListsHandler" as FLH
participant "GetFavoriteItemsHandler" as FIH
participant "IApplicationDbContext" as DB

P -> LR : Open "Favorites" panel\nin Anansi plugin

LR -> LC : GET /api/lightroom/favorites/{collectionId}
LC -> M : Send(GetLightroomFavoriteListsQuery)
M -> FLH : Handle(query)
FLH -> DB : FavoriteLists\n.Where(CollectionId == collectionId)\n.Select(id, name, items.Count)
DB --> FLH : favoriteListDtos[]
FLH --> M : Result.Success
M --> LC : Result.Success
LC --> LR : 200 OK [{name, photoCount}]

LR --> P : Show favorite lists\nwith photo counts

P -> LR : Click on a favorite list
LR -> LC : GET /api/lightroom/favorites/{collectionId}/{listId}/items
LC -> M : Send(GetLightroomFavoriteItemsQuery)
M -> FIH : Handle(query)
FIH -> DB : FavoriteItems\n.Where(FavoriteListId == listId)\n.Include(GalleryMedia)\n.Select(mediaId, lightroomId, fileName)
DB --> FIH : items[]
FIH --> M : Result.Success
M --> LC : Result.Success
LC --> LR : 200 OK [{lightroomId, fileName}]

LR -> LR : Highlight photos in catalog\nmatching returned LightroomIds
LR --> P : Favorited photos highlighted\nin Lightroom grid view
@enduml
```

![View Favorite Lists in Lightroom](view-favorite-lists-in-lightroom.png)

### Plugin Installation and Authentication

```plantuml
@startuml
actor Photographer as P
participant "Lightroom Classic" as LR
participant "Anansi Web UI" as UI
participant "AccountController" as AC
participant "IApplicationDbContext" as DB
participant "LightroomController" as LC

== Step 1: Generate API Key ==
P -> UI : Navigate to Account > API Keys
P -> UI : Click "Create API Key"
UI -> AC : POST /api/account/api-keys\n{name: "Lightroom Plugin"}
AC -> DB : Generate random key,\nhash with SHA256,\nstore ApiKey entity
DB --> AC : success
AC --> UI : {keyPrefix: "anan_", fullKey: "anan_xyz..."}
note right of UI
  Full key shown ONCE.
  Only prefix + hash stored.
end note
UI --> P : Display API key (copy to clipboard)

== Step 2: Install & Configure Plugin ==
P -> LR : File > Plug-in Manager >\nAdd > select anansi.lrplugin
LR -> LR : Load plugin, register\nAnansi Publish Service
P -> LR : Enter Anansi API key\nin plugin settings
LR -> LC : GET /api/lightroom/collections\n(X-Api-Key: anan_xyz...)
LC -> LC : Validate API key\n(hash and compare)
LC --> LR : 200 OK [{collections}]
LR --> P : "Connected to Anansi"\nShow available collections
@enduml
```

![Plugin Installation and Authentication](plugin-installation-and-authentication.png)
