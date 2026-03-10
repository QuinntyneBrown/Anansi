# F08 - Gallery Privacy & Access Control

## Overview

Gallery Privacy & Access Control provides a layered security model for photographer collections. At the most basic level, collections can be password-protected so that visitors must enter the correct password before any content is visible. A separate client-exclusive password reveals additional sets that are hidden from general password holders, with per-set visibility independently configurable. The photographer's gallery homepage can also be password-protected independently of individual collection passwords.

An email registration gate can require visitors to enter their name and email address before viewing any content. This gate can be combined with password protection (email first, then password). Collected email registrations are viewable and exportable by the photographer. At the individual photo level, clients can mark photos as private, hiding them from all other viewers; only the marking client and the photographer can see private photos, with the photographer tracking this in the activity tab.

Collections support date-based expiration. When the expiry date passes, the collection status changes from "Published" to "Hidden" (content is never deleted). Before expiration, the system sends automated reminder emails to configurable recipients: specific clients, or all guests who viewed, downloaded, favorited, or purchased from the collection. Reminder timing is configurable (e.g., 7 days, 3 days, on expiry day), and the email content is customizable by the photographer.

## Requirements Traceability

| Requirement | Description |
|---|---|
| GAL-1.6.1 | Collection Password (configurable, changeable) |
| GAL-1.6.2 | Client Exclusive Access (separate password, per-set visibility) |
| GAL-1.6.3 | Homepage Password (independent of collection passwords) |
| GAL-1.6.4 | Email Registration Gate (name + email, exportable, combinable with password) |
| GAL-1.6.5 | Private Photos (client-marked, hidden from others, visible in activity tab) |
| GAL-1.6.6 | Collection Expiration (date-based, auto-hide, extendable, no delete) |
| GAL-1.6.7 | Auto Expiry Reminder Emails (configurable recipients/timing/content) |

## Components

### Domain Layer

**Collection** (Entity, existing) — Extended with privacy-related properties: `Password`, `ClientExclusivePassword`, `RequireEmailRegistration`, `ExpiresAt`, `ExpiryReminderRecipients` (serialized list of recipient types or specific emails), `ExpiryReminderDays` (comma-separated day-before values), `ExpiryReminderEmailTemplate`.

**CollectionSet** (Entity, existing) — Extended with `IsClientExclusive` flag that controls whether the set is visible only to client-exclusive password holders.

**GalleryMedia** (Entity, existing) — Extended with `IsPrivate` and `MarkedPrivateByClientId` to support client-marked private photos.

**GalleryEmailRegistration** (Entity) — Records name and email of visitors who pass through the email registration gate. Implements `ITenantEntity`.

**GalleryActivity** (Entity, existing) — Records `ActivityType.PrivatePhoto` and `ActivityType.EmailRegistration` events with full actor attribution.

**HomepageSettings** (Value Object / Entity) — Stores the homepage-level password independently. Could be stored on the `Photographer` entity or as a separate tenant-scoped entity.

**ExpiryReminderRecipientType** (Enum) — `SpecificClients`, `AllViewers`, `AllDownloaders`, `AllFavoriters`, `AllPurchasers`.

### Application Layer

**SetCollectionPasswordCommand** — Sets or clears the collection password and/or client-exclusive password. Photographer-only.

**VerifyCollectionPasswordCommand** — Validates a visitor-provided password against the collection. Returns the access level: `None`, `Public`, or `ClientExclusive`.

**SetHomepagePasswordCommand** — Sets or clears the homepage password for the photographer's gallery root.

**VerifyHomepagePasswordCommand** — Validates a visitor-provided homepage password.

**RegisterEmailCommand** — Records a visitor's name and email for a collection's email registration gate. Logs a `GalleryActivity` with `ActivityType.EmailRegistration`.

**ListEmailRegistrationsQuery** — Returns all registered emails for a collection, paginated.

**ExportEmailRegistrationsQuery** — Generates a CSV of all registered emails for a collection.

**TogglePrivatePhotoCommand** — Toggles the `IsPrivate` flag on a `GalleryMedia` item. Records the client who marked it. Logs a `GalleryActivity` with `ActivityType.PrivatePhoto`.

**SetCollectionExpiryCommand** — Configures the expiry date, reminder recipients, reminder timing, and reminder email template for a collection.

**ExtendCollectionExpiryCommand** — Extends an expired or soon-to-expire collection's expiry date.

**IExpiryReminderService** (Interface) — Abstracts the logic of determining which recipients should receive reminders and building the reminder content.

### Infrastructure Layer

**CollectionExpiryBackgroundJob** — A scheduled background job that runs daily (or more frequently). It finds collections whose `ExpiresAt` is in the past and transitions their `Status` from `Published` to `Hidden`. It also finds collections approaching expiry and triggers reminder emails according to the configured `ExpiryReminderDays`.

**ExpiryReminderService** — Implements `IExpiryReminderService`. Resolves recipient lists by querying `GalleryActivities` (downloaders, favoriters), `GalleryEmailRegistrations` (viewers), and `Orders` (purchasers) to build the appropriate email recipient set.

**PasswordHashingService** — Hashes collection and homepage passwords for secure storage (bcrypt or PBKDF2). Note: the current domain model stores passwords as plaintext strings; this service would be introduced to improve security.

### API Layer

**PrivacyController** — Exposes endpoints for setting/verifying passwords, configuring email registration gates, toggling private photos, setting/extending expiry, and exporting email registrations.

**GalleryAccessMiddleware** — Middleware (or action filter) that intercepts requests to client-facing gallery endpoints and enforces password, email registration, and expiry checks before allowing access to collection content.

## Class Diagrams

### Domain Layer - Privacy Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Collection {
  +Password : string?
  +ClientExclusivePassword : string?
  +RequireEmailRegistration : bool
  +ExpiresAt : DateTime?
  +ExpiryReminderRecipients : string?
  +ExpiryReminderDays : string?
  +ExpiryReminderEmailTemplate : string?
  +Status : CollectionStatus
}

class CollectionSet {
  +IsClientExclusive : bool
}

class GalleryMedia {
  +IsPrivate : bool
  +MarkedPrivateByClientId : Guid?
}

class GalleryEmailRegistration {
  +PhotographerId : Guid
  +CollectionId : Guid
  +Name : string
  +Email : string
}

class GalleryActivity {
  +ActivityType : ActivityType
  +ActorName : string?
  +ActorEmail : string?
  +MediaId : Guid?
  +Details : string?
}

enum CollectionStatus {
  Draft
  Published
  Hidden
}

enum ExpiryReminderRecipientType {
  SpecificClients
  AllViewers
  AllDownloaders
  AllFavoriters
  AllPurchasers
}

Collection "1" --> "*" CollectionSet
Collection "1" --> "*" GalleryMedia
Collection "1" --> "*" GalleryEmailRegistration
Collection "1" --> "*" GalleryActivity
Collection --> CollectionStatus

@enduml
```

### Application Layer - Commands and Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class SetCollectionPasswordCommand <<Command>> {
  +CollectionId : Guid
  +Password : string?
  +ClientExclusivePassword : string?
}

class VerifyCollectionPasswordCommand <<Command>> {
  +CollectionId : Guid
  +Password : string
}

class SetHomepagePasswordCommand <<Command>> {
  +Password : string?
}

class VerifyHomepagePasswordCommand <<Command>> {
  +Password : string
}

class RegisterEmailCommand <<Command>> {
  +CollectionId : Guid
  +Name : string
  +Email : string
}

class ListEmailRegistrationsQuery <<Query>> {
  +CollectionId : Guid
  +Page : int
  +PageSize : int
}

class ExportEmailRegistrationsQuery <<Query>> {
  +CollectionId : Guid
}

class TogglePrivatePhotoCommand <<Command>> {
  +MediaId : Guid
  +ClientName : string?
  +ClientEmail : string?
}

class SetCollectionExpiryCommand <<Command>> {
  +CollectionId : Guid
  +ExpiresAt : DateTime?
  +ReminderRecipients : string?
  +ReminderDays : string?
  +ReminderEmailTemplate : string?
}

class ExtendCollectionExpiryCommand <<Command>> {
  +CollectionId : Guid
  +NewExpiresAt : DateTime
}

enum AccessLevel {
  None
  Public
  ClientExclusive
}

class GalleryEmailRegistrationDto <<DTO>> {
  +Id : Guid
  +CollectionId : Guid
  +Name : string
  +Email : string
  +CreatedAt : DateTime
}

@enduml
```

### Infrastructure Layer - Background Jobs and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CollectionExpiryBackgroundJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_reminderService : IExpiryReminderService
  -_email : IEmailService
  +ProcessExpiredCollections() : Task
  +SendUpcomingExpiryReminders() : Task
}

class ExpiryReminderService <<Service>> {
  -_db : IApplicationDbContext
  +ResolveRecipients(collectionId, recipientTypes) : List<string>
  +BuildReminderEmail(template, collection) : EmailContent
}

class GalleryAccessMiddleware <<Middleware>> {
  +InvokeAsync(HttpContext) : Task
  -CheckPassword(collection, password) : AccessLevel
  -CheckEmailRegistration(collection, context) : bool
  -CheckExpiry(collection) : bool
}

interface IExpiryReminderService <<Interface>> {
  +ResolveRecipients(collectionId, types) : List<string>
  +BuildReminderEmail(template, collection) : EmailContent
}

interface IEmailService <<Interface>>
interface IApplicationDbContext <<Interface>>

ExpiryReminderService ..|> IExpiryReminderService
CollectionExpiryBackgroundJob --> IExpiryReminderService
CollectionExpiryBackgroundJob --> IEmailService
CollectionExpiryBackgroundJob --> IApplicationDbContext
GalleryAccessMiddleware --> IApplicationDbContext

@enduml
```

## Sequence Diagrams

### Visitor Accesses Password-Protected Collection

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Visitor
participant "GalleryAccessMiddleware" as Middleware
participant "VerifyCollectionPasswordHandler" as Handler
participant "IApplicationDbContext" as DB

Visitor -> Middleware : GET /gallery/{slug}
Middleware -> DB : Find Collection by slug
DB --> Middleware : Collection

alt Collection requires email registration
  Middleware --> Visitor : 200 OK (email registration form)
  Visitor -> Middleware : POST /gallery/{slug}/register\n{name, email}
  Middleware -> DB : Create GalleryEmailRegistration
  Middleware -> DB : Create GalleryActivity (EmailRegistration)
  Middleware -> DB : SaveChangesAsync()
end

alt Collection has password
  Middleware --> Visitor : 200 OK (password form)
  Visitor -> Middleware : POST /gallery/{slug}/verify\n{password}
  Middleware -> Handler : Send(VerifyCollectionPasswordCommand)

  Handler -> DB : Find Collection
  DB --> Handler : Collection

  alt password matches Collection.Password
    Handler --> Middleware : AccessLevel.Public
    Middleware --> Visitor : 200 OK (gallery, public sets only)
  else password matches ClientExclusivePassword
    Handler --> Middleware : AccessLevel.ClientExclusive
    Middleware --> Visitor : 200 OK (gallery, all sets)
  else no match
    Handler --> Middleware : AccessLevel.None
    Middleware --> Visitor : 401 Unauthorized
  end
else No password required
  Middleware --> Visitor : 200 OK (gallery content)
end

@enduml
```

### Client Marks Photo as Private

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "PrivacyController" as API
participant "TogglePrivatePhotoHandler" as Handler
participant "IApplicationDbContext" as DB

Client -> API : POST /api/media/{mediaId}/private\n{clientName, clientEmail}
API -> Handler : Send(TogglePrivatePhotoCommand)

Handler -> DB : Find GalleryMedia by Id
DB --> Handler : GalleryMedia

Handler -> Handler : Toggle IsPrivate flag
Handler -> Handler : Set MarkedPrivateByClientId (if marking)

Handler -> DB : Create GalleryActivity\n(PrivatePhoto, "Marked as private")
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<bool> (new IsPrivate state)
API --> Client : 200 OK {isPrivate: true}

note right of Handler
  Private photos are filtered
  out of gallery queries for
  all viewers except the marking
  client and the photographer.
end note

@enduml
```

### Collection Expiry and Auto-Hide

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "CollectionExpiryBackgroundJob" as Job
participant "IApplicationDbContext" as DB

Job -> DB : Query Collections\nWhere ExpiresAt <= UtcNow\nAnd Status == Published
DB --> Job : List<Collection>

loop For each expired collection
  Job -> Job : Set Status = Hidden
  Job -> DB : SaveChangesAsync()

  note right of Job
    Content is NOT deleted.
    Collection becomes inaccessible
    to visitors but remains fully
    intact for the photographer.
  end note
end

@enduml
```

### Send Expiry Reminder Emails

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "CollectionExpiryBackgroundJob" as Job
participant "IExpiryReminderService" as Reminder
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email

Job -> DB : Query Collections\nWhere Status == Published\nAnd ExpiresAt IS NOT NULL\nAnd ExpiryReminderDays IS NOT NULL
DB --> Job : List<Collection>

loop For each collection
  Job -> Job : Parse ExpiryReminderDays\n(e.g., "7,3,1")
  Job -> Job : Calculate days until expiry

  alt days matches a configured reminder day
    Job -> Reminder : ResolveRecipients(\ncollectionId, recipientTypes)

    Reminder -> DB : Query by recipient type:\n- GalleryActivities (downloaders)\n- FavoriteLists (favoriters)\n- GalleryEmailRegistrations (viewers)\n- Orders (purchasers)\n- Specific email addresses
    DB --> Reminder : Deduplicated email list
    Reminder --> Job : List<string> emails

    Job -> Reminder : BuildReminderEmail(\ntemplate, collection)
    Reminder --> Job : EmailContent

    loop For each recipient
      Job -> Email : SendAsync(recipient,\nsubject, body)
    end
  end
end

@enduml
```

### Set Collection Expiry Configuration

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "PrivacyController" as API
participant "SetCollectionExpiryHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : PUT /api/collections/{id}/expiry\n{expiresAt, reminderRecipients,\nreminderDays, reminderEmailTemplate}
API -> Handler : Send(SetCollectionExpiryCommand)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Find Collection by Id & PhotographerId
DB --> Handler : Collection

Handler -> Handler : Set ExpiresAt
Handler -> Handler : Set ExpiryReminderRecipients\n(e.g. "AllViewers,AllDownloaders")
Handler -> Handler : Set ExpiryReminderDays\n(e.g. "7,3,1")
Handler -> Handler : Set ExpiryReminderEmailTemplate
Handler -> DB : SaveChangesAsync()

Handler --> API : Result.Success()
API --> Photographer : 200 OK

@enduml
```

### Email Registration and Export

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "PrivacyController" as API
participant "ExportEmailRegistrationsHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/collections/{id}/registrations/export
API -> Handler : Send(ExportEmailRegistrationsQuery)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Query GalleryEmailRegistrations\nWhere CollectionId & PhotographerId
DB --> Handler : List<GalleryEmailRegistration>

Handler -> Handler : Build CSV:\nName, Email, RegisteredAt

Handler --> API : Result<byte[]>
API --> Photographer : 200 OK\nContent-Type: text/csv\nContent-Disposition: attachment\nfilename="registrations.csv"

@enduml
```
