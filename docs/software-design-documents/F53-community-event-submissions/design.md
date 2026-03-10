# F53 - Community Event Submissions

## Overview

Community Event Submissions extends the Events Calendar (F52) with a user-generated content workflow. Authenticated photographers can submit new community events to the calendar, providing event details including name, description, dates, venue, neighborhood, category, recurrence pattern, and website URL. Submitted events are created with a `Pending` status and enter a moderation pipeline before appearing in the public calendar. For MVP, a self-moderation shortcut auto-approves events submitted by the photographer who owns them, eliminating the moderation bottleneck during early platform adoption.

The moderation workflow provides administrators with the ability to approve or reject pending events. Approved events immediately become visible in the public calendar listings (F52's `ListEventsQuery` already filters by `Status=Approved`). Rejected events trigger a notification to the submitting photographer that includes the rejection reason. The moderation endpoint accepts a status change (Approved or Rejected) with an optional reason string, and the rejection reason is persisted on the event record for audit purposes.

Photographers can edit and cancel their own events. Editing a `Pending` event applies changes immediately since it has not yet been published. Editing an `Approved` event resets its status to `Pending`, requiring re-moderation before the updated version appears publicly -- this prevents unreviewed changes from going live. Cancellation is implemented as a soft-delete: the event's `IsDeleted` flag is set, and it no longer appears in any public listings. The soft-delete preserves the record for audit trails and allows potential future restoration.

**L2 Requirements:** EVT-24.1.2 (Create Community Event), EVT-24.3.1 (Moderate Events), EVT-24.3.2 (Edit & Cancel Own Events)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CulturalEvent` | Entity (existing, F52) | Extended with `RejectionReason` (string?, set when admin rejects). All other fields defined in F52. `Status` transitions: `Pending -> Approved`, `Pending -> Rejected`, `Approved -> Pending` (on edit). |
| `EventStatus` | Enum (existing, F52) | `Pending`, `Approved`, `Rejected`. |
| `EventRecurrence` | Enum (existing, F52) | `None`, `Annual`, `Monthly`, `Weekly`. |
| `EventApprovedEvent` | Domain Event | Raised when an event transitions to `Approved`. Triggers inclusion in public calendar queries. |
| `EventRejectedEvent` | Domain Event | Raised when an event is rejected. Carries `SubmittedById` and `RejectionReason`. Triggers notification to the submitter. |
| `EventResetToPendingEvent` | Domain Event | Raised when an approved event is edited and its status resets to `Pending`. Removes it from public listings until re-approved. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateCommunityEventCommand` | Command | Authenticated. Creates a new `CulturalEvent` with `Status=Pending`, `IsSeeded=false`, `SubmittedById=currentUser`. Accepts: `Name` (required), `Description`, `StartDate` (required), `EndDate`, `Venue`, `Neighborhood`, `Category`, `Recurrence`, `WebsiteUrl`. For MVP: if the submitting user is the photographer, auto-sets `Status=Approved`. |
| `ModerateEventCommand` | Command | Admin-only. Accepts `EventId`, `Status` (Approved or Rejected), optional `Reason`. Validates event is in `Pending` state. Sets the new status and persists the reason. Raises `EventApprovedEvent` or `EventRejectedEvent`. |
| `UpdateCommunityEventCommand` | Command | Authenticated. Updates an event the current user submitted. Validates `SubmittedById = currentUser` (403 otherwise). If the event was `Approved`, resets status to `Pending` and raises `EventResetToPendingEvent`. If `Pending`, applies changes directly. Accepts all mutable event fields. |
| `CancelCommunityEventCommand` | Command | Authenticated. Soft-deletes an event the current user submitted. Validates ownership (403 otherwise). Sets `IsDeleted=true`, `DeletedAt=now`. Also soft-deletes any `EventCalendarBlock` records linked to this event. |
| `ListPendingEventsQuery` | Query | Admin-only. Returns all events with `Status=Pending`, ordered by `CreatedAt` ascending (oldest first for fair review). Paginated. |
| `GetMySubmittedEventsQuery` | Query | Authenticated. Returns all events where `SubmittedById = currentUser`, including Pending, Approved, and Rejected (not soft-deleted). Allows the photographer to track their submissions. |
| `CreateCommunityEventCommandValidator` | Validator | Name required (max 200 chars). StartDate required and must be in the future. EndDate >= StartDate if provided. Category must be valid enum. Recurrence must be valid enum. WebsiteUrl must be valid URL format if provided. |
| `CommunityEventDto` | DTO | Submission result: `Id`, `Name`, `Description`, `StartDate`, `EndDate`, `Venue`, `Neighborhood`, `Category`, `Recurrence`, `WebsiteUrl`, `Status`, `RejectionReason`, `CreatedAt`. |
| `INotificationService` | Interface (existing, F40) | Used to notify the submitter when their event is rejected. Dispatches a `NotificationEvent` with category `Other` and a deep link to the event. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateCommunityEventCommandHandler` | Handler | Creates the `CulturalEvent` entity. For MVP auto-approve: checks if the authenticated user is a photographer (role check) and auto-sets `Status=Approved`. Persists and returns the event. |
| `ModerateEventCommandHandler` | Handler | Loads the event, validates it is `Pending`. Updates `Status` and `RejectionReason`. On approval: raises `EventApprovedEvent`. On rejection: raises `EventRejectedEvent`, dispatches notification to submitter via `INotificationService`. |
| `UpdateCommunityEventCommandHandler` | Handler | Loads the event, validates ownership. If `Status=Approved`, changes to `Pending` and raises `EventResetToPendingEvent`. Updates all provided fields. Persists. |
| `CancelCommunityEventCommandHandler` | Handler | Loads the event, validates ownership. Sets `IsDeleted=true`. Also queries `EventCalendarBlock` where `CulturalEventId = eventId` and soft-deletes those blocks (so synced calendar entries are cleaned up). |
| `EventRejectedEventHandler` | Event Handler | Listens for `EventRejectedEvent`. Creates a notification for the submitting photographer via `CreateNotificationCommand` with message including the rejection reason. |
| `EventResetToPendingEventHandler` | Event Handler | Listens for `EventResetToPendingEvent`. Optionally notifies admin of a re-review needed (if admin notification preferences are configured). |
| `CulturalEventConfiguration` | EF Config (extended, F52) | Adds `RejectionReason` column (nullable, max 500 chars). Index on `(Status, CreatedAt)` for moderation queue. Index on `(SubmittedById, IsDeleted)` for "my submissions" query. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `EventsController` | Controller (extended, F52) | New endpoints: `POST /api/events` (create community event, `[Authorize]`). `PUT /api/events/{id}` (update own event, `[Authorize]`). `DELETE /api/events/{id}` (cancel/soft-delete own event, `[Authorize]`). `GET /api/events/mine` (list own submissions, `[Authorize]`). |
| `EventModerationController` | Controller | Admin-only endpoints: `PUT /api/events/{id}/status` (approve/reject, `[Authorize(Roles = "Admin")]`). `GET /api/events/pending` (moderation queue, `[Authorize(Roles = "Admin")]`). |

---

## Class Diagrams

### Domain Layer -- Community Event Status Lifecycle

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CulturalEvent {
  +Id : Guid
  +Name : string
  +Description : string?
  +StartDate : DateTime?
  +EndDate : DateTime?
  +Venue : string?
  +Neighborhood : string?
  +Category : EventCategory
  +Recurrence : EventRecurrence
  +WebsiteUrl : string?
  +Status : EventStatus
  +RejectionReason : string?
  +IsSeeded : bool
  +SubmittedById : Guid?
  +IsDeleted : bool
  +DeletedAt : DateTime?
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

enum EventStatus {
  Pending
  Approved
  Rejected
}

class EventApprovedEvent <<DomainEvent>> {
  +EventId : Guid
}

class EventRejectedEvent <<DomainEvent>> {
  +EventId : Guid
  +SubmittedById : Guid
  +RejectionReason : string?
}

class EventResetToPendingEvent <<DomainEvent>> {
  +EventId : Guid
  +PreviousStatus : EventStatus
}

CulturalEvent ..> EventStatus
CulturalEvent ..> EventApprovedEvent : raises on approve
CulturalEvent ..> EventRejectedEvent : raises on reject
CulturalEvent ..> EventResetToPendingEvent : raises on edit of approved
@enduml
```

### Application Layer -- Submission & Moderation Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Events.Commands" {
  class CreateCommunityEventCommand <<record>> {
    +Name : string
    +Description : string?
    +StartDate : DateTime
    +EndDate : DateTime?
    +Venue : string?
    +Neighborhood : string?
    +Category : EventCategory
    +Recurrence : EventRecurrence
    +WebsiteUrl : string?
  }

  class ModerateEventCommand <<record>> {
    +EventId : Guid
    +Status : EventStatus
    +Reason : string?
  }

  class UpdateCommunityEventCommand <<record>> {
    +EventId : Guid
    +Name : string
    +Description : string?
    +StartDate : DateTime
    +EndDate : DateTime?
    +Venue : string?
    +Neighborhood : string?
    +Category : EventCategory
    +Recurrence : EventRecurrence
    +WebsiteUrl : string?
  }

  class CancelCommunityEventCommand <<record>> {
    +EventId : Guid
  }
}

package "Features.Events.Queries" {
  class ListPendingEventsQuery <<record>> {
    +Page : int
    +PageSize : int
  }

  class GetMySubmittedEventsQuery <<record>> {
    +Page : int
    +PageSize : int
  }
}

class CreateCommunityEventCommandValidator {
  +CreateCommunityEventCommandValidator()
}

CreateCommunityEventCommandValidator ..> CreateCommunityEventCommand : validates
@enduml
```

### Application Layer -- Submission DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CommunityEventDto <<record>> {
  +Id : Guid
  +Name : string
  +Description : string?
  +StartDate : DateTime
  +EndDate : DateTime?
  +Venue : string?
  +Neighborhood : string?
  +Category : string
  +Recurrence : string
  +WebsiteUrl : string?
  +Status : string
  +RejectionReason : string?
  +SubmittedByName : string?
  +CreatedAt : DateTime
}

class "PaginatedResult<CommunityEventDto>" as PaginatedResult {
  +Items : List<CommunityEventDto>
  +Page : int
  +PageSize : int
  +TotalCount : int
  +TotalPages : int
}
@enduml
```

### Infrastructure Layer -- Event Handlers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CreateCommunityEventCommandHandler {
  -_dbContext : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle(cmd, ct) : CommunityEventDto
}

class ModerateEventCommandHandler {
  -_dbContext : IApplicationDbContext
  -_mediator : IMediator
  +Handle(cmd, ct) : CommunityEventDto
}

class UpdateCommunityEventCommandHandler {
  -_dbContext : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle(cmd, ct) : CommunityEventDto
}

class CancelCommunityEventCommandHandler {
  -_dbContext : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle(cmd, ct) : Unit
}

class EventRejectedEventHandler {
  -_mediator : IMediator
  +Handle(notification, ct) : Task
}

class EventResetToPendingEventHandler {
  -_mediator : IMediator
  +Handle(notification, ct) : Task
}

ModerateEventCommandHandler ..> EventRejectedEventHandler : rejection triggers
UpdateCommunityEventCommandHandler ..> EventResetToPendingEventHandler : status reset triggers
@enduml
```

### API Layer -- Events & Moderation Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EventsController <<ApiController>> {
  -_mediator : IMediator
  +CreateEvent(cmd) : IActionResult
  +UpdateEvent(id, cmd) : IActionResult
  +CancelEvent(id) : IActionResult
  +GetMySubmissions(page, pageSize) : IActionResult
}

class EventModerationController <<ApiController>> {
  -_mediator : IMediator
  +ModerateEvent(id, cmd) : IActionResult
  +ListPendingEvents(page, pageSize) : IActionResult
}

note right of EventsController
  All endpoints require [Authorize].
  Update and Cancel validate that
  SubmittedById matches the
  current authenticated user.
end note

note right of EventModerationController
  All endpoints require
  [Authorize(Roles = "Admin")].
end note

EventsController --> "IMediator" : sends commands/queries
EventModerationController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### Submit a Community Event (MVP Auto-Approve)

```plantuml
@startuml
actor Photographer as P
participant "EventsController" as EC
participant "MediatR" as M
participant "CreateCommunityEventCommandHandler" as H
participant "ApplicationDbContext" as DB

P -> EC : POST /api/events\n{name: "Afro-Caribbean Art Show",\nstartDate: "2026-09-15",\nendDate: "2026-09-17",\nvenue: "Harbourfront Centre",\nneighborhood: "Downtown Core",\ncategory: "Cultural",\nrecurrence: "Annual",\nwebsiteUrl: "https://example.com"}
EC -> M : Send(CreateCommunityEventCommand)
M -> H : Handle()

H -> H : Validate command\n(name required, date in future, etc.)

H -> H : Set SubmittedById = currentUserId\nSet IsSeeded = false

alt MVP auto-approve path
  H -> H : CurrentUser is a photographer\n=> Set Status = Approved
else standard path
  H -> H : Set Status = Pending
end

H -> DB : Create CulturalEvent {\n  Name, Description, StartDate,\n  EndDate, Venue, Neighborhood,\n  Category, Recurrence, WebsiteUrl,\n  Status, SubmittedById, IsSeeded=false\n}
DB --> H : event created

H -> DB : SaveChanges
DB --> H : saved

H -> H : Map to CommunityEventDto

H --> M : CommunityEventDto
M --> EC : result
EC --> P : 201 Created {\n  id, name: "Afro-Caribbean Art Show",\n  status: "Approved",\n  startDate: "2026-09-15",\n  category: "Cultural"\n}
@enduml
```

### Admin Approves a Pending Event

```plantuml
@startuml
actor Admin as A
participant "EventModerationController" as MC
participant "MediatR" as M
participant "ModerateEventCommandHandler" as H
participant "ApplicationDbContext" as DB

A -> MC : PUT /api/events/{id}/status\n{status: "Approved"}
MC -> M : Send(ModerateEventCommand)
M -> H : Handle()

H -> DB : Load CulturalEvent by Id
DB --> H : event (Status = Pending)

alt event not found
  H --> M : throw NotFoundException
else event.Status != Pending
  H --> M : throw ValidationException\n("Only pending events can be moderated")
end

H -> DB : event.Status = Approved
H -> DB : SaveChanges
DB --> H : saved

H -> H : Raise EventApprovedEvent

H -> H : Map to CommunityEventDto

H --> M : CommunityEventDto
M --> MC : result
MC --> A : 200 OK {\n  id, name, status: "Approved"\n}

note right of H
  The event is now visible
  in GET /api/events public listings
  (ListEventsQuery filters by
  Status = Approved).
end note
@enduml
```

### Admin Rejects a Pending Event

```plantuml
@startuml
actor Admin as A
participant "EventModerationController" as MC
participant "MediatR" as M
participant "ModerateEventCommandHandler" as H
participant "EventRejectedEventHandler" as RH
participant "INotificationService" as NS
participant "ApplicationDbContext" as DB

A -> MC : PUT /api/events/{id}/status\n{status: "Rejected",\nreason: "Duplicate of existing event"}
MC -> M : Send(ModerateEventCommand)
M -> H : Handle()

H -> DB : Load CulturalEvent by Id
DB --> H : event (Status = Pending)

H -> DB : event.Status = Rejected\nevent.RejectionReason =\n"Duplicate of existing event"
H -> DB : SaveChanges
DB --> H : saved

H -> H : Raise EventRejectedEvent {\n  EventId, SubmittedById,\n  RejectionReason\n}

H --> M : CommunityEventDto
M --> MC : result
MC --> A : 200 OK {\n  id, status: "Rejected",\n  rejectionReason: "Duplicate..."\n}

== Async Notification ==

M -> RH : Handle(EventRejectedEvent)
RH -> NS : CreateNotificationCommand {\n  PhotographerId: submittedById,\n  EventType: "EventRejected",\n  Title: "Event submission rejected",\n  Message: "Your event was rejected:\n    Duplicate of existing event",\n  Link: "/events/mine"\n}
NS --> RH : notification sent
@enduml
```

### Edit an Approved Event (Resets to Pending)

```plantuml
@startuml
actor Photographer as P
participant "EventsController" as EC
participant "MediatR" as M
participant "UpdateCommunityEventCommandHandler" as H
participant "ApplicationDbContext" as DB

P -> EC : PUT /api/events/{id}\n{name: "Afro-Caribbean Art Show 2026",\nendDate: "2026-09-18"}
EC -> M : Send(UpdateCommunityEventCommand)
M -> H : Handle()

H -> DB : Load CulturalEvent by Id
DB --> H : event

alt event.SubmittedById != currentUserId
  H --> M : throw ForbiddenException\n("You can only edit your own events")
  M --> EC : 403 Forbidden
  EC --> P : 403 Forbidden
end

alt event.Status = Approved
  H -> H : Reset Status to Pending
  H -> H : Raise EventResetToPendingEvent
  note right of H
    Event will no longer appear
    in public listings until
    re-approved by an admin.
  end note
else event.Status = Pending
  H -> H : Changes apply immediately\n(no status change needed)
end

H -> DB : Update event fields:\nName, EndDate (and any\nother provided fields)
H -> DB : SaveChanges
DB --> H : saved

H -> H : Map to CommunityEventDto

H --> M : CommunityEventDto
M --> EC : result
EC --> P : 200 OK {\n  id, name: "Afro-Caribbean Art Show 2026",\n  status: "Pending",\n  endDate: "2026-09-18"\n}
@enduml
```

### Cancel (Soft-Delete) Own Event

```plantuml
@startuml
actor Photographer as P
participant "EventsController" as EC
participant "MediatR" as M
participant "CancelCommunityEventCommandHandler" as H
participant "ApplicationDbContext" as DB

P -> EC : DELETE /api/events/{id}
EC -> M : Send(CancelCommunityEventCommand)
M -> H : Handle()

H -> DB : Load CulturalEvent by Id
DB --> H : event

alt event not found or already deleted
  H --> M : throw NotFoundException
end

alt event.SubmittedById != currentUserId
  H --> M : throw ForbiddenException
  M --> EC : 403 Forbidden
  EC --> P : 403 Forbidden
end

H -> DB : event.IsDeleted = true\nevent.DeletedAt = DateTime.UtcNow

H -> DB : Load EventCalendarBlocks\nWHERE CulturalEventId = eventId
DB --> H : linkedBlocks[]

loop for each linked block
  H -> DB : Remove EventCalendarBlock
end

H -> DB : SaveChanges
DB --> H : saved

H --> M : Unit
M --> EC : result
EC --> P : 204 No Content

note right of H
  The event no longer appears in:
  - Public calendar listings
  - Photographer's "my events" list
  - Any photographer's booking calendar
    (linked blocks removed)
end note
@enduml
```
