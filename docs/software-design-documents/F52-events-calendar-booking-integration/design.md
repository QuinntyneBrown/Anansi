# F52 - Events Calendar & Booking Integration

## Overview

The Events Calendar provides a pre-populated calendar of Toronto Black cultural events, serving as both a community resource and a booking catalyst for photographers. The platform ships with seed data for at least 6 major events -- Toronto Caribbean Carnival (Caribana), Afrofest, Afro-Carib Fest, KUUMBA, Toronto Black Film Festival, and Black History Month -- each stored with full metadata: name, description, venue, neighborhood, category (Festival, Cultural, or Community), typical start and end months, website URL, and a recurrence pattern. Annual recurring events automatically generate instances for any queried year, so the calendar always shows upcoming occurrences even though only the template is stored.

The public-facing events API allows browsing events by date range with optional category and neighborhood filters. Results include only approved events (seeded events are auto-approved) and are ordered by start date. The recurrence engine generates dated instances on-the-fly when the query spans a year range, mapping `typicalStartMonth`/`typicalEndMonth` to concrete dates in the requested year.

The booking integration connects the events calendar to the photographer's existing booking system (F25). Photographers can sync any calendar event to their booking calendar, creating a calendar block with a configurable block type (Available, Blocked, or Tentative) that appears alongside their regular bookings. They can also create event-linked session types -- special photography packages tied to a specific event, with availability automatically scoped to the event's date range. This lets photographers offer targeted services like "Caribana Portrait Session" that are only bookable during the event dates.

**L2 Requirements:** EVT-24.1.1 (Seed Events), EVT-24.2.1 (List by Date Range), EVT-24.2.2 (Sync to Booking Calendar), EVT-24.2.3 (Event-Linked Session Types)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CulturalEvent` | Entity | Core event entity. Fields: `Name` (required), `Description`, `Venue`, `Neighborhood`, `Category` (EventCategory enum), `TypicalStartMonth` (int, 1-12), `TypicalEndMonth` (int, 1-12), `StartDate` (DateTime?), `EndDate` (DateTime?), `WebsiteUrl`, `Recurrence` (EventRecurrence enum), `Status` (EventStatus enum), `IsSeeded` (bool), `SubmittedById` (Guid?, null for seeded). Extends `BaseEntity`, implements `ISoftDeletable`, `IAuditableEntity`. |
| `EventCategory` | Enum | `Festival`, `Cultural`, `Community`. |
| `EventRecurrence` | Enum | `None`, `Annual`, `Monthly`, `Weekly`. |
| `EventStatus` | Enum | `Pending`, `Approved`, `Rejected`. |
| `EventCalendarBlock` | Entity | Links an event to a photographer's booking calendar. Fields: `PhotographerId`, `CulturalEventId`, `BlockType` (CalendarBlockType enum), `StartDate`, `EndDate`, `Notes`. Implements `ITenantEntity`. |
| `CalendarBlockType` | Enum | `Available`, `Blocked`, `Tentative`. |
| `EventSyncedEvent` | Domain Event | Raised when a photographer syncs an event to their calendar. Used by booking availability engine to include/exclude the block. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ListEventsQuery` | Query | Public. Returns events within a date range. Accepts `From` (DateTime), `To` (DateTime), optional `Category` (EventCategory?), optional `Neighborhood` (string?). Generates recurring event instances for the queried period. Returns only approved events, ordered by start date. |
| `GetEventDetailQuery` | Query | Public. Returns full metadata for a single event by ID. |
| `SyncEventToCalendarCommand` | Command | Authenticated. Creates an `EventCalendarBlock` linking the event to the photographer's booking calendar. Accepts `EventId`, `BlockType`, optional `Notes`. Computes `StartDate`/`EndDate` from the event's dates or typical months for the current/next occurrence. |
| `RemoveEventSyncCommand` | Command | Authenticated. Removes an `EventCalendarBlock` for the photographer. |
| `CreateEventLinkedSessionTypeCommand` | Command | Authenticated. Extends `CreateSessionTypeCommand` (F25) with an `EventId` field. Sets the session type's availability window to the event's date range. Validates that the event exists and is approved. |
| `GetEventLinkedSessionTypesQuery` | Query | Authenticated. Returns session types linked to a specific event. Filters `SessionType` where `EventId = @eventId` and `PhotographerId = currentUser`. |
| `GetBookingCalendarQuery` | Query (extended, F25) | Extended to include `EventCalendarBlock` entries alongside regular bookings and Google Calendar blocks. Each block includes the linked event name and block type. |
| `EventSummaryDto` | DTO | Listing result: `Id`, `Name`, `Description`, `Venue`, `Neighborhood`, `Category`, `StartDate`, `EndDate`, `WebsiteUrl`, `IsRecurringInstance` (bool), `Recurrence`. |
| `EventDetailDto` | DTO | Full detail: all fields from `EventSummaryDto` plus `TypicalStartMonth`, `TypicalEndMonth`, `Status`, `IsSeeded`, `SubmittedByName`. |
| `EventCalendarBlockDto` | DTO | Calendar block: `Id`, `EventId`, `EventName`, `BlockType`, `StartDate`, `EndDate`, `Notes`. |
| `IEventRecurrenceService` | Interface | Generates concrete event instances from recurrence templates. `GenerateInstances(CulturalEvent event, DateTime from, DateTime to)` returns `List<EventInstance>`. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ListEventsQueryHandler` | Handler | Loads approved events, applies category/neighborhood filters. For recurring events, calls `IEventRecurrenceService` to generate instances within the date range. Merges one-time and generated instances, orders by start date, paginates. |
| `SyncEventToCalendarCommandHandler` | Handler | Validates event exists and is approved. Computes block dates from event dates (or next occurrence for annual events). Creates `EventCalendarBlock`. Raises `EventSyncedEvent`. |
| `CreateEventLinkedSessionTypeCommandHandler` | Handler | Validates event exists and is approved. Delegates to the existing `CreateSessionTypeCommandHandler` (F25) with additional `EventId` field and auto-computed availability windows matching the event dates. |
| `EventRecurrenceService` | Service | Implements `IEventRecurrenceService`. For `Annual` recurrence: maps `TypicalStartMonth`/`TypicalEndMonth` to the requested year, creates instances for each year in the query range. For `Monthly`/`Weekly`: generates instances at the specified interval within the range. |
| `EventSeedService` | Service | Runs on application startup. Seeds 6 required cultural events if they do not already exist. Each seeded event has `IsSeeded=true`, `Status=Approved`, `Recurrence=Annual`. |
| `CulturalEventConfiguration` | EF Config | Index on `(Status, StartDate)` for listing queries. Index on `(Category, Neighborhood)` for filtered searches. |
| `EventCalendarBlockConfiguration` | EF Config | Unique constraint on `(PhotographerId, CulturalEventId)` to prevent duplicate syncs. Index on `(PhotographerId, StartDate)` for calendar queries. |
| `SessionTypeConfiguration` | EF Config (extended, F25) | Adds nullable `EventId` column with foreign key to `CulturalEvent`. Index on `(PhotographerId, EventId)` for event-linked session type queries. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `EventsController` | Controller | Public: `GET /api/events` (list with date range, category, neighborhood filters). `GET /api/events/{id}` (detail). Authenticated: `POST /api/events/{id}/sync` (sync to calendar with blockType). `DELETE /api/events/{id}/sync` (remove sync). |
| `SessionTypesController` | Controller (extended, F25) | Extended `POST /api/session-types` to accept optional `eventId`. Extended `GET /api/session-types` to accept optional `eventId` filter. |
| `BookingCalendarController` | Controller (extended, F25) | Extended `GET /api/booking/calendar` to include `EventCalendarBlock` entries. |

---

## Class Diagrams

### Domain Layer -- Cultural Event Entity & Enums

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CulturalEvent {
  +Id : Guid
  +Name : string
  +Description : string?
  +Venue : string?
  +Neighborhood : string?
  +Category : EventCategory
  +TypicalStartMonth : int
  +TypicalEndMonth : int
  +StartDate : DateTime?
  +EndDate : DateTime?
  +WebsiteUrl : string?
  +Recurrence : EventRecurrence
  +Status : EventStatus
  +IsSeeded : bool
  +SubmittedById : Guid?
  +IsDeleted : bool
  +DeletedAt : DateTime?
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

enum EventCategory {
  Festival
  Cultural
  Community
}

enum EventRecurrence {
  None
  Annual
  Monthly
  Weekly
}

enum EventStatus {
  Pending
  Approved
  Rejected
}

CulturalEvent ..> EventCategory
CulturalEvent ..> EventRecurrence
CulturalEvent ..> EventStatus
@enduml
```

### Domain Layer -- Calendar Block & Session Type Link

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CulturalEvent {
  +Id : Guid
  +Name : string
  +Status : EventStatus
}

class EventCalendarBlock {
  +Id : Guid
  +PhotographerId : Guid
  +CulturalEventId : Guid
  +BlockType : CalendarBlockType
  +StartDate : DateTime
  +EndDate : DateTime
  +Notes : string?
}

class SessionType {
  +Id : Guid
  +PhotographerId : Guid
  +Name : string
  +EventId : Guid?
}

enum CalendarBlockType {
  Available
  Blocked
  Tentative
}

CulturalEvent "1" --> "*" EventCalendarBlock : synced by photographers
CulturalEvent "1" --> "*" SessionType : linked session types
EventCalendarBlock ..> CalendarBlockType
@enduml
```

### Application Layer -- Event Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Events.Queries" {
  class ListEventsQuery <<record>> {
    +From : DateTime
    +To : DateTime
    +Category : EventCategory?
    +Neighborhood : string?
    +Page : int
    +PageSize : int
  }

  class GetEventDetailQuery <<record>> {
    +EventId : Guid
  }

  class GetEventLinkedSessionTypesQuery <<record>> {
    +EventId : Guid
  }
}

package "Features.Events.Commands" {
  class SyncEventToCalendarCommand <<record>> {
    +EventId : Guid
    +BlockType : CalendarBlockType
    +Notes : string?
  }

  class RemoveEventSyncCommand <<record>> {
    +EventId : Guid
  }

  class CreateEventLinkedSessionTypeCommand <<record>> {
    +EventId : Guid
    +Name : string
    +Description : string?
    +DurationMinutes : int
    +PriceCents : long
    +Location : string?
  }
}

interface IEventRecurrenceService {
  +GenerateInstances(event, from, to) : List<EventInstance>
}

ListEventsQuery ..> IEventRecurrenceService : uses
@enduml
```

### Application Layer -- Event DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EventSummaryDto <<record>> {
  +Id : Guid
  +Name : string
  +Description : string?
  +Venue : string?
  +Neighborhood : string?
  +Category : string
  +StartDate : DateTime
  +EndDate : DateTime?
  +WebsiteUrl : string?
  +IsRecurringInstance : bool
  +Recurrence : string
}

class EventDetailDto <<record>> {
  +Id : Guid
  +Name : string
  +Description : string?
  +Venue : string?
  +Neighborhood : string?
  +Category : string
  +TypicalStartMonth : int
  +TypicalEndMonth : int
  +StartDate : DateTime?
  +EndDate : DateTime?
  +WebsiteUrl : string?
  +Status : string
  +IsSeeded : bool
  +SubmittedByName : string?
  +Recurrence : string
}

class EventCalendarBlockDto <<record>> {
  +Id : Guid
  +EventId : Guid
  +EventName : string
  +BlockType : string
  +StartDate : DateTime
  +EndDate : DateTime
  +Notes : string?
}
@enduml
```

### Infrastructure Layer -- Event Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface IEventRecurrenceService {
  +GenerateInstances(event, from, to) : List<EventInstance>
}

class EventRecurrenceService {
  +GenerateInstances(event, from, to) : List<EventInstance>
}

class EventSeedService {
  -_dbContext : IApplicationDbContext
  +SeedAsync() : Task
}

class ListEventsQueryHandler {
  -_dbContext : IApplicationDbContext
  -_recurrenceService : IEventRecurrenceService
  +Handle(query, ct) : PaginatedResult<EventSummaryDto>
}

class SyncEventToCalendarCommandHandler {
  -_dbContext : IApplicationDbContext
  -_recurrenceService : IEventRecurrenceService
  +Handle(cmd, ct) : EventCalendarBlockDto
}

IEventRecurrenceService <|.. EventRecurrenceService
ListEventsQueryHandler --> IEventRecurrenceService
SyncEventToCalendarCommandHandler --> IEventRecurrenceService
@enduml
```

### API Layer -- Events Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EventsController <<ApiController>> {
  -_mediator : IMediator
  +ListEvents(from, to, category, neighborhood) : IActionResult
  +GetEventDetail(id) : IActionResult
  +SyncToCalendar(id, cmd) : IActionResult
  +RemoveSync(id) : IActionResult
}

class SessionTypesController <<ApiController>> {
  -_mediator : IMediator
  +Create(cmd) : IActionResult
  +List(eventId?) : IActionResult
}

note right of EventsController
  ListEvents and GetEventDetail are
  public (no [Authorize]).
  SyncToCalendar and RemoveSync
  require [Authorize].
end note

note right of SessionTypesController
  Extended from F25 to accept
  optional eventId parameter.
  All endpoints require [Authorize].
end note

EventsController --> "IMediator" : sends queries/commands
SessionTypesController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### List Events with Recurring Instance Generation

```plantuml
@startuml
actor Client as C
participant "EventsController" as EC
participant "MediatR" as M
participant "ListEventsQueryHandler" as H
participant "IEventRecurrenceService" as RS
participant "ApplicationDbContext" as DB

C -> EC : GET /api/events\n?from=2026-01-01&to=2026-12-31\n&category=Festival
EC -> M : Send(ListEventsQuery)
M -> H : Handle()

H -> DB : Load CulturalEvents\nWHERE Status = Approved\nAND IsDeleted = false\nAND (Category = 'Festival' OR @category IS NULL)
DB --> H : events[]

H -> H : Separate one-time vs recurring events

loop for each recurring event
  H -> RS : GenerateInstances(event,\nfrom: 2026-01-01, to: 2026-12-31)

  RS -> RS : For Annual recurrence:\nMap TypicalStartMonth -> 2026 date\nMap TypicalEndMonth -> 2026 date\nCaribana: Aug 1 - Aug 4, 2026

  RS --> H : List<EventInstance>\n[{startDate, endDate, isRecurring: true}]
end

H -> H : Filter one-time events\nwhere StartDate within range

H -> H : Merge one-time + generated instances\nOrder by StartDate ASC

H -> H : Apply pagination

H -> H : Map to EventSummaryDto[]

H --> M : PaginatedResult<EventSummaryDto>
M --> EC : result
EC --> C : 200 OK {\n  items: [\n    {name: "Black History Month",\n     startDate: "2026-02-01",\n     category: "Cultural",\n     isRecurringInstance: true},\n    {name: "Caribana",\n     startDate: "2026-08-01",\n     category: "Festival",\n     isRecurringInstance: true},\n    ...],\n  totalCount: 6\n}
@enduml
```

### Sync Event to Photographer Booking Calendar

```plantuml
@startuml
actor Photographer as P
participant "EventsController" as EC
participant "MediatR" as M
participant "SyncEventToCalendarCommandHandler" as H
participant "IEventRecurrenceService" as RS
participant "ApplicationDbContext" as DB

P -> EC : POST /api/events/{caribanaId}/sync\n{blockType: "Available",\nnotes: "Offering carnival portraits"}
EC -> M : Send(SyncEventToCalendarCommand)
M -> H : Handle()

H -> DB : Load CulturalEvent by Id
DB --> H : event (Caribana, Annual,\ntypicalStart: 8, typicalEnd: 8)

alt event not found or not approved
  H --> M : throw NotFoundException
end

H -> DB : Check EventCalendarBlock\nWHERE PhotographerId AND CulturalEventId
DB --> H : null (no existing sync)

H -> RS : GenerateInstances(event,\nnow, now + 1 year)
RS --> H : next occurrence:\nstartDate: 2026-08-01,\nendDate: 2026-08-04

H -> DB : Create EventCalendarBlock {\n  PhotographerId, CulturalEventId,\n  BlockType: Available,\n  StartDate: 2026-08-01,\n  EndDate: 2026-08-04,\n  Notes: "Offering carnival portraits"\n}
DB --> H : block created

H -> DB : SaveChanges
DB --> H : saved

H -> H : Raise EventSyncedEvent

H --> M : EventCalendarBlockDto
M --> EC : result
EC --> P : 201 Created {\n  id, eventId, eventName: "Caribana",\n  blockType: "Available",\n  startDate: "2026-08-01",\n  endDate: "2026-08-04"\n}
@enduml
```

### Create Event-Linked Session Type

```plantuml
@startuml
actor Photographer as P
participant "SessionTypesController" as SC
participant "MediatR" as M
participant "CreateEventLinkedSessionTypeHandler" as H
participant "IEventRecurrenceService" as RS
participant "ApplicationDbContext" as DB

P -> SC : POST /api/session-types\n{name: "Caribana Portrait Session",\ndurationMinutes: 60,\npriceCents: 25000,\nlocation: "Lakeshore Blvd",\neventId: "{caribanaId}"}
SC -> M : Send(CreateEventLinkedSessionTypeCommand)
M -> H : Handle()

H -> DB : Load CulturalEvent by EventId
DB --> H : event (Caribana, approved)

alt event not found or not approved
  H --> M : throw ValidationException
end

H -> RS : GenerateInstances(event,\nnow, now + 1 year)
RS --> H : next occurrence:\n2026-08-01 to 2026-08-04

H -> H : Build availability windows\nscoped to event dates:\n[{date: "2026-08-01", start: "09:00",\n  end: "18:00"}, ... for each event day]

H -> DB : Create SessionType {\n  Name, DurationMinutes, PriceCents,\n  Location, EventId,\n  AvailabilityWindows: (event-scoped),\n  Visibility: Public\n}
DB --> H : sessionType created

H -> DB : SaveChanges
DB --> H : saved

H --> M : SessionTypeDto
M --> SC : result
SC --> P : 201 Created {\n  id, name: "Caribana Portrait Session",\n  eventId: "{caribanaId}",\n  eventName: "Caribana",\n  availabilityWindows: [...]\n}
@enduml
```

### View Booking Calendar with Event Blocks

```plantuml
@startuml
actor Photographer as P
participant "BookingCalendarController" as BC
participant "MediatR" as M
participant "GetBookingCalendarHandler" as H
participant "ApplicationDbContext" as DB
participant "IGoogleCalendarService" as GC

P -> BC : GET /api/booking/calendar\n?from=2026-08-01&to=2026-08-31
BC -> M : Send(GetBookingCalendarQuery)
M -> H : Handle()

H -> DB : Load BookingRecords\nWHERE PhotographerId\nAND StartTime within range
DB --> H : bookings[]

H -> DB : Load EventCalendarBlocks\nWHERE PhotographerId\nAND StartDate/EndDate overlaps range
DB --> H : eventBlocks[]

H -> GC : GetBusyBlocksAsync(\ncalendarId, from, to)
GC --> H : googleBlocks[]

H -> H : Merge all three sources:\n- Regular bookings (with client info)\n- Event blocks (with event name + blockType)\n- Google Calendar blocks

H -> H : Sort by start date/time

H --> M : CalendarDto {bookings,\neventBlocks, externalBlocks}
M --> BC : result
BC --> P : 200 OK {\n  bookings: [...],\n  eventBlocks: [\n    {eventName: "Caribana",\n     blockType: "Available",\n     startDate: "2026-08-01",\n     endDate: "2026-08-04"}],\n  externalBlocks: [...]\n}
@enduml
```
