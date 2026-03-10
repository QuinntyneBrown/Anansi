# F07 - Proofing & Favorites

## Overview

Proofing & Favorites gives clients a structured way to curate selections from a photographer's collection. Clients can click a heart icon on any photo to add it to an active favorite list, create multiple named lists, and add or remove photos at any time with a live count per list. The feature supports both client-initiated lists and photographer-preset categories (e.g., "Album Picks", "Social Media", "Retouching") that appear pre-created when the client opens the gallery.

Each favorited photo supports a free-text comment field (minimum 500 characters allowed) where clients can leave editing notes or selection rationale. When a comment is added, the photographer is notified via in-app notification and optionally by email. Photographers can set a configurable per-collection favorite limit that caps the total number of photos a client can select, with a clear message shown when the limit is reached.

Favorite lists are actionable: clients can share a list via a unique link, download all images from a list (subject to download PIN and limits), or digitally deliver the list to any email address. Photographers can export lists as Lightroom-compatible copy lists or CSV files with filenames. A cross-collection favorites activity dashboard gives photographers visibility into all active lists, showing client name, collection, photo count, comments, and last-modified date, with notifications when a client marks a list as complete.

## Requirements Traceability

| Requirement | Description |
|---|---|
| GAL-1.5.1 | Favorite Lists (heart icon, multiple named lists, add/remove, count per list) |
| GAL-1.5.2 | Comments on Favorites (free text, photographer notified) |
| GAL-1.5.3 | Preset Favorite Lists (photographer-configured categories) |
| GAL-1.5.4 | Favorite Limits (configurable per collection) |
| GAL-1.5.5 | Favorite List Actions (share link, download, digital delivery, Lightroom export, CSV) |
| GAL-1.5.6 | Favorite Activity Dashboard (cross-collection view, notifications on completion) |

## Components

### Domain Layer

**FavoriteList** (Entity) — Represents a named favorite list scoped to a collection. Tracks the owning photographer, collection, client name/email, whether the list is a photographer-preset category, completion status, and a unique share token for link-based sharing. Implements `ITenantEntity`.

**FavoriteItem** (Entity) — A join between `FavoriteList` and `GalleryMedia`. Each item can carry an optional comment (free text, no character limit below 500 chars). Extends `BaseEntity`.

**Collection** (Entity, existing) — Extended with `FavoriteLimit` (nullable int) that caps total favorites per collection.

**GalleryActivity** (Entity, existing) — Records `ActivityType.Favorite` and `ActivityType.Comment` events, linking to the relevant `FavoriteListId` and optionally `MediaId`.

### Application Layer

**CreateFavoriteListCommand** — Creates a new favorite list (client-initiated or photographer preset). Validates collection existence and generates a unique share token.

**AddFavoriteItemCommand** — Adds a photo to a favorite list. Checks the collection-level favorite limit before permitting the addition. Logs a `GalleryActivity` with `ActivityType.Favorite`.

**RemoveFavoriteItemCommand** — Removes a photo from a favorite list. Frees capacity against the favorite limit.

**UpdateFavoriteCommentCommand** — Sets or updates the comment on a `FavoriteItem`. Triggers a notification to the photographer. Logs a `GalleryActivity` with `ActivityType.Comment`.

**ListFavoriteListsQuery** — Returns all favorite lists for a given collection, including item counts.

**GetFavoriteListItemsQuery** — Returns all items in a specific favorite list with media file names and comments.

**CompleteFavoriteListCommand** — Marks a favorite list as complete and notifies the photographer.

**ShareFavoriteListQuery** — Returns the share URL for a favorite list using its share token.

**DownloadFavoriteListCommand** — Creates a `DownloadRequest` containing only the media IDs from the favorite list, subject to PIN validation and download limits (delegates to download flow from F06).

**DeliverFavoriteListCommand** — Sends the favorite list images as a digital download link to a specified email address.

**ExportFavoriteListQuery** — Generates a Lightroom-compatible copy list or CSV file containing the filenames in the favorite list.

**ListFavoriteActivityQuery** — Cross-collection dashboard query returning all active favorite lists for the authenticated photographer with client name, collection, photo count, comment count, and last-modified date.

**FavoriteListDto / FavoriteItemDto** — Read models returned to the API.

### Infrastructure Layer

**NotificationDispatcher** — Sends in-app and optional email notifications to the photographer when a comment is added or a list is completed. Uses the existing `IEmailService` and notification entity infrastructure.

### API Layer

**FavoritesController** — Exposes endpoints for creating lists, adding/removing items, commenting, completing lists, sharing, downloading, delivering via email, exporting, and viewing the activity dashboard.

## Class Diagrams

### Domain Layer - Favorite Entities

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

class FavoriteList {
  +PhotographerId : Guid
  +CollectionId : Guid
  +Name : string
  +ClientName : string?
  +ClientEmail : string?
  +IsPreset : bool
  +IsCompleted : bool
  +ShareToken : string?
}

class FavoriteItem {
  +FavoriteListId : Guid
  +MediaId : Guid
  +Comment : string?
}

class Collection {
  +FavoriteLimit : int?
}

class GalleryMedia {
  +FileName : string
  +OriginalFileName : string
  +StorageKey : string
}

class GalleryActivity {
  +ActivityType : ActivityType
  +ActorName : string?
  +FavoriteListId : Guid?
  +MediaId : Guid?
  +Details : string?
}

BaseEntity <|-- FavoriteList
BaseEntity <|-- FavoriteItem
Collection "1" --> "*" FavoriteList : FavoriteLists
FavoriteList "1" --> "*" FavoriteItem : Items
FavoriteItem "*" --> "1" GalleryMedia : Media
Collection "1" --> "*" GalleryActivity : Activities

@enduml
```

![Domain Layer - Favorite Entities](domain-layer-favorite-entities.png)

### Application Layer - Commands and Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CreateFavoriteListCommand <<Command>> {
  +CollectionId : Guid
  +Name : string
  +ClientName : string?
  +ClientEmail : string?
  +IsPreset : bool
}

class AddFavoriteItemCommand <<Command>> {
  +FavoriteListId : Guid
  +MediaId : Guid
}

class RemoveFavoriteItemCommand <<Command>> {
  +FavoriteItemId : Guid
}

class UpdateFavoriteCommentCommand <<Command>> {
  +FavoriteItemId : Guid
  +Comment : string
}

class CompleteFavoriteListCommand <<Command>> {
  +FavoriteListId : Guid
}

class DownloadFavoriteListCommand <<Command>> {
  +FavoriteListId : Guid
  +Resolution : DownloadResolution
  +Pin : string?
}

class DeliverFavoriteListCommand <<Command>> {
  +FavoriteListId : Guid
  +RecipientEmail : string
  +Resolution : DownloadResolution
}

class ExportFavoriteListQuery <<Query>> {
  +FavoriteListId : Guid
  +Format : ExportFormat
}

class ListFavoriteActivityQuery <<Query>> {
  +Page : int
  +PageSize : int
}

enum ExportFormat {
  LightroomCopyList
  Csv
}

class FavoriteListDto <<DTO>> {
  +Id : Guid
  +Name : string
  +ClientName : string?
  +ItemCount : int
  +IsCompleted : bool
  +ShareToken : string?
}

class FavoriteItemDto <<DTO>> {
  +Id : Guid
  +MediaId : Guid
  +Comment : string?
  +MediaFileName : string?
}

@enduml
```

![Application Layer - Commands and Queries](application-layer-commands-and-queries.png)

### API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class FavoritesController <<Controller>> {
  +CreateList() : ActionResult
  +AddItem() : ActionResult
  +RemoveItem() : ActionResult
  +UpdateComment() : ActionResult
  +CompleteList() : ActionResult
  +GetListItems() : ActionResult
  +ListLists() : ActionResult
  +ShareList() : ActionResult
  +DownloadList() : ActionResult
  +DeliverList() : ActionResult
  +ExportList() : ActionResult
  +GetDashboard() : ActionResult
}

class FavoritesController
note right of FavoritesController
  Route: /api/collections/{collectionId}/favorites
  Dashboard: /api/favorites/dashboard
end note

@enduml
```

![API Layer](api-layer.png)

## Sequence Diagrams

### Add Photo to Favorite List

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "FavoritesController" as API
participant "AddFavoriteItemHandler" as Handler
participant "IApplicationDbContext" as DB

Client -> API : POST /api/collections/{cid}/favorites/{listId}/items\n{mediaId}
API -> Handler : Send(AddFavoriteItemCommand)

Handler -> DB : Find FavoriteList by Id
DB --> Handler : FavoriteList

Handler -> DB : Find Collection (for FavoriteLimit)
DB --> Handler : Collection

Handler -> DB : Count total FavoriteItems\nacross all lists for this collection/client
DB --> Handler : currentCount

Handler -> Handler : Check currentCount < FavoriteLimit\n(skip if limit is null)

Handler -> DB : Verify MediaId exists in collection
DB --> Handler : GalleryMedia

Handler -> DB : Create FavoriteItem\n{FavoriteListId, MediaId}
Handler -> DB : Create GalleryActivity\n(ActivityType.Favorite)
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<FavoriteItemDto>
API --> Client : 201 Created

@enduml
```

![Add Photo to Favorite List](add-photo-to-favorite-list.png)

### Add Comment to Favorited Photo

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "FavoritesController" as API
participant "UpdateFavoriteCommentHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email

Client -> API : PUT /api/favorites/items/{itemId}/comment\n{comment: "Please brighten this one"}
API -> Handler : Send(UpdateFavoriteCommentCommand)

Handler -> DB : Find FavoriteItem with FavoriteList
DB --> Handler : FavoriteItem + FavoriteList

Handler -> Handler : Validate comment length >= 0

Handler -> DB : Update FavoriteItem.Comment
Handler -> DB : Create GalleryActivity\n(ActivityType.Comment, details)
Handler -> DB : SaveChangesAsync()

Handler -> DB : Find Photographer notification preferences
Handler -> Email : SendAsync(photographer,\n"New comment on favorite")

Handler --> API : Result.Success()
API --> Client : 200 OK

@enduml
```

![Add Comment to Favorited Photo](add-comment-to-favorited-photo.png)

### Complete Favorite List with Photographer Notification

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "FavoritesController" as API
participant "CompleteFavoriteListHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email

Client -> API : POST /api/favorites/{listId}/complete
API -> Handler : Send(CompleteFavoriteListCommand)

Handler -> DB : Find FavoriteList by Id
DB --> Handler : FavoriteList

Handler -> Handler : Set IsCompleted = true
Handler -> DB : Create GalleryActivity\n(Favorite, "List completed")

Handler -> DB : Create Notification entity\nfor Photographer (in-app)
Handler -> DB : SaveChangesAsync()

Handler -> Email : SendAsync(photographer,\n"Favorite list completed:\n{listName} by {clientName}")

Handler --> API : Result.Success()
API --> Client : 200 OK

@enduml
```

![Complete Favorite List with Photographer Notification](complete-favorite-list-with-photographer-notification.png)

### Export Favorite List as Lightroom Copy List

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "FavoritesController" as API
participant "ExportFavoriteListHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/favorites/{listId}/export?format=lightroom
API -> Handler : Send(ExportFavoriteListQuery)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Find FavoriteList with Items\ninclude GalleryMedia
DB --> Handler : FavoriteList + Items + Media

alt format = LightroomCopyList
  Handler -> Handler : Build newline-separated list\nof OriginalFileName values
else format = Csv
  Handler -> Handler : Build CSV with columns:\nFileName, Comment, DateAdded
end

Handler --> API : Result<byte[]>
API --> Photographer : 200 OK\nContent-Disposition: attachment\nfilename="AlbumPicks_copylist.txt"

@enduml
```

![Export Favorite List as Lightroom Copy List](export-favorite-list-as-lightroom-copy-list.png)

### Download Favorite List Photos

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "FavoritesController" as API
participant "DownloadFavoriteListHandler" as Handler
participant "IApplicationDbContext" as DB
participant "RequestDownloadHandler" as DownloadHandler

Client -> API : POST /api/favorites/{listId}/download\n{resolution, pin}
API -> Handler : Send(DownloadFavoriteListCommand)

Handler -> DB : Find FavoriteList with Items
DB --> Handler : FavoriteList + Items

Handler -> Handler : Collect MediaIds from items

Handler -> DownloadHandler : Delegate to RequestDownloadCommand\n{collectionId, resolution, mediaIds, pin}

note right of Handler
  Reuses F06 download flow:
  PIN validation, limit checks,
  ZIP packaging, async notification
end note

DownloadHandler --> Handler : Result<DownloadRequestDto>
Handler --> API : Result<DownloadRequestDto>
API --> Client : 202 Accepted (if async)\nor redirect (if immediate)

@enduml
```

![Download Favorite List Photos](download-favorite-list-photos.png)

### Favorite Activity Dashboard

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "FavoritesController" as API
participant "ListFavoriteActivityHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/favorites/dashboard?page=1&pageSize=20
API -> Handler : Send(ListFavoriteActivityQuery)

Handler -> Handler : Get PhotographerId\nfrom ICurrentUserService

Handler -> DB : Query FavoriteLists\nWhere PhotographerId matches\nInclude Items (count)\nInclude Collection (title)\nOrder by UpdatedAt desc
DB --> Handler : List<FavoriteList> with counts

Handler -> Handler : Map to dashboard DTOs:\n- ClientName\n- CollectionTitle\n- ItemCount\n- CommentCount\n- LastModified\n- IsCompleted

Handler --> API : Result<PagedList<FavoriteDashboardDto>>
API --> Photographer : 200 OK

@enduml
```

![Favorite Activity Dashboard](favorite-activity-dashboard.png)
