# F40 - Notification System

## Overview

The Notification System is the cross-cutting communication backbone of the Anansi platform. It delivers real-time and batched notifications to photographers through three channels: in-app (a notification center in the dashboard), email (per-event or daily digest), and mobile push (delivered within 30 seconds of the triggering event). Every significant platform event -- photo downloads, store orders, favorite list updates, contract signatures, invoice payments, session bookings, quote acceptances, client messages, form submissions, and gallery expirations -- flows through a single `NotificationEvent` MediatR notification that fans out to all enabled channels.

The in-app notification center is accessed via a bell icon in the dashboard header. The bell displays an unread count badge. Clicking it opens a notification panel showing recent events, each with event type, client name, timestamp, and a deep link to the relevant item. Notifications are filterable by category (Client Gallery, Store, Studio Manager, Other) and can be marked as read individually or in bulk. The panel supports infinite scroll with cursor-based pagination.

Photographers control their notification experience through per-event-type preferences. Each of the 10 event types has independent toggles for in-app, email, and push delivery. Email delivery supports two modes: real-time (sent immediately) and daily digest (aggregated into a single summary email sent at a configurable time). Push notifications are delivered via Firebase Cloud Messaging (FCM) for Android and Apple Push Notification service (APNs) for iOS, with device tokens registered through the mobile app. A background digest job runs hourly, collecting all undelivered digest-mode notifications and batching them into a single email per photographer.

**L2 Requirements:** NTF-9.1.1 (Notification Center), NTF-9.1.2 (Notification Events), NTF-9.2.1 (Email Preferences), NTF-9.3.1 (Mobile Push)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Notification` | Entity (existing) | Stores `PhotographerId`, `EventType`, `Category`, `Title`, `Message`, `ClientName`, `Link`, `IsRead`, `ReadAt`. Implements `ITenantEntity`. |
| `NotificationPreference` | Entity (existing) | Per-event-type preference: `EmailEnabled`, `PushEnabled`, `InAppEnabled`, `EmailDigestOption` (RealTime/DailySummary). One record per photographer per event type. |
| `NotificationEventType` | Enum (existing) | `PhotoDownloaded`, `StoreOrderPlaced`, `FavoriteListUpdated`, `ContractSigned`, `InvoicePaymentReceived`, `SessionBooked`, `QuoteAccepted`, `MessageReceived`, `FormSubmissionReceived`, `GalleryExpiring`. |
| `NotificationCategory` | Enum (existing) | `ClientGallery`, `Store`, `StudioManager`, `Other`. Used for filtering in the notification panel. |
| `EmailDigestOption` | Enum (existing) | `RealTime`, `DailySummary`. |
| `NotificationDeliveryMethod` | Enum (existing) | `InApp`, `Email`, `Push`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `NotificationEvent` | MediatR Notification (existing) | Raised by any feature handler when a notifiable event occurs. Carries `PhotographerId`, `EventType`, `Category`, `Title`, `Message`, `ClientName`, and `Link`. |
| `NotificationEventHandler` | Notification Handler (existing) | Receives `NotificationEvent` and dispatches `CreateNotificationCommand` to the mediator, which handles channel fan-out. |
| `CreateNotificationCommand` | Command (existing) | Core notification creation logic. Checks the photographer's `NotificationPreference` for the event type. Creates an in-app `Notification` if enabled. Sends an email immediately if email is enabled and digest option is RealTime. Sends a push notification if push is enabled. For DailySummary email mode, the notification is created but email delivery is deferred to the digest job. |
| `MarkNotificationReadCommand` | Command (existing) | Marks a single notification as read (sets `IsRead = true`, `ReadAt = now`). |
| `MarkAllNotificationsReadCommand` | Command (existing) | Marks all unread notifications for the photographer as read, optionally filtered by category. |
| `GetNotificationsQuery` | Query (existing) | Paginated query returning notifications for the authenticated photographer. Supports filtering by `Category` and `IsRead` status. Ordered by `CreatedAt` descending. |
| `GetUnreadCountQuery` | Query (existing) | Returns the count of unread notifications for the authenticated photographer, used to render the bell badge. |
| `GetNotificationPreferencesQuery` | Query (existing) | Returns all `NotificationPreference` records for the photographer (one per event type). If no record exists for an event type, defaults are returned (all channels enabled, RealTime email). |
| `UpdateNotificationPreferenceCommand` | Command (existing) | Updates the preference for a specific event type: toggles for in-app, email, push, and email digest option. Upserts the record (creates if not present). |
| `SendDigestEmailCommand` | Command | Triggered by the digest background job. Collects all notifications created since the last digest for photographers on DailySummary mode, groups by photographer, and sends a single summary email per photographer. |
| `RegisterDeviceTokenCommand` | Command | Registers a mobile device's push notification token (FCM/APNs) for the authenticated user. Stores it via `IPushNotificationService`. |
| `UnregisterDeviceTokenCommand` | Command | Removes a device token when the user logs out of a device or uninstalls the app. |
| `NotificationDto` | DTO (existing) | Read model: ID, event type, category, title, message, client name, link, is read, read at, created at. |
| `NotificationPreferenceDto` | DTO | Read model: event type, in-app enabled, email enabled, push enabled, email digest option. |
| `IEmailService` | Interface (existing) | Sends templated emails. Used for both real-time and digest notification emails. |
| `IPushNotificationService` | Interface (existing) | Sends push notifications, registers/unregisters device tokens. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PushNotificationService` | Service | Implements `IPushNotificationService`. Integrates with FCM (Firebase Cloud Messaging) for Android and APNs (Apple Push Notification service) for iOS. Maintains a device token registry in the database. Ensures delivery within 30 seconds by using async fire-and-forget with retry. |
| `NotificationDigestBackgroundJob` | BackgroundJob | Runs on a configurable schedule (default: hourly). Queries notifications created since the last run for photographers with `EmailDigestOption = DailySummary`. Groups by photographer, builds a summary email body, and sends via `IEmailService`. Tracks the last-processed timestamp to avoid duplicates. |
| `DeviceToken` | Entity (Infrastructure) | Stores `UserId`, `Token`, `Platform` ("ios"/"android"), `CreatedAt`. Used by `PushNotificationService` to target the correct devices. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `NotificationsController` | Controller | Endpoints: `GET /api/notifications` (paginated list with category/read filters), `GET /api/notifications/unread-count`, `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`, `GET /api/notifications/preferences`, `PUT /api/notifications/preferences/{eventType}`. All require `[Authorize]`. |
| `DeviceTokenController` | Controller | Endpoints: `POST /api/device-tokens` (register), `DELETE /api/device-tokens/{token}` (unregister). Used by mobile apps during login/logout. |
| `NotificationHub` | SignalR Hub | Real-time WebSocket hub for pushing new notifications to connected dashboard clients. When `CreateNotificationCommand` creates an in-app notification, it also broadcasts to the photographer's SignalR group so the bell badge updates without polling. |

---

## Class Diagrams

### Domain Layer - Notification Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class BaseEntity <<abstract>> {
  +Id : Guid
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

class Notification {
  +PhotographerId : Guid
  +EventType : NotificationEventType
  +Category : NotificationCategory
  +Title : string
  +Message : string
  +ClientName : string?
  +Link : string?
  +IsRead : bool
  +ReadAt : DateTime?
}

class NotificationPreference {
  +PhotographerId : Guid
  +EventType : NotificationEventType
  +EmailEnabled : bool
  +PushEnabled : bool
  +InAppEnabled : bool
  +EmailDigestOption : EmailDigestOption
}

enum NotificationEventType {
  PhotoDownloaded
  StoreOrderPlaced
  FavoriteListUpdated
  ContractSigned
  InvoicePaymentReceived
  SessionBooked
  QuoteAccepted
  MessageReceived
  FormSubmissionReceived
  GalleryExpiring
}

enum NotificationCategory {
  ClientGallery
  Store
  StudioManager
  Other
}

enum EmailDigestOption {
  RealTime
  DailySummary
}

BaseEntity <|-- Notification
BaseEntity <|-- NotificationPreference
Notification --> NotificationEventType
Notification --> NotificationCategory
NotificationPreference --> NotificationEventType
NotificationPreference --> EmailDigestOption

@enduml
```

![Domain Layer - Notification Entities](domain-layer-notification-entities.png)

### Application Layer - Commands, Queries, and Event Flow

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class NotificationEvent <<MediatR Notification>> {
  +PhotographerId : Guid
  +EventType : NotificationEventType
  +Category : NotificationCategory
  +Title : string
  +Message : string
  +ClientName : string?
  +Link : string?
}

class NotificationEventHandler <<Handler>> {
  -_mediator : IMediator
  +Handle(NotificationEvent) : Task
}

class CreateNotificationCommand <<Command>> {
  +PhotographerId : Guid
  +EventType : NotificationEventType
  +Category : NotificationCategory
  +Title : string
  +Message : string
  +ClientName : string?
  +Link : string?
}

class CreateNotificationCommandHandler <<Handler>> {
  -_db : IApplicationDbContext
  -_email : IEmailService
  -_push : IPushNotificationService
  +Handle() : Result<Guid>
}

class GetNotificationsQuery <<Query>> {
  +Category : NotificationCategory?
  +IsRead : bool?
  +Page : int
  +PageSize : int
}

class GetUnreadCountQuery <<Query>> {
}

class MarkNotificationReadCommand <<Command>> {
  +NotificationId : Guid
}

class MarkAllNotificationsReadCommand <<Command>> {
  +Category : NotificationCategory?
}

class UpdateNotificationPreferenceCommand <<Command>> {
  +EventType : NotificationEventType
  +EmailEnabled : bool?
  +PushEnabled : bool?
  +InAppEnabled : bool?
  +EmailDigestOption : EmailDigestOption?
}

class SendDigestEmailCommand <<Command>> {
  +SinceUtc : DateTime
}

NotificationEventHandler ..> NotificationEvent
NotificationEventHandler ..> CreateNotificationCommand
CreateNotificationCommandHandler ..> CreateNotificationCommand

@enduml
```

![Application Layer - Commands, Queries, and Event Flow](application-layer-commands-queries-and-event-flow.png)

### Application Layer - DTOs and Service Interfaces

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class NotificationDto <<DTO>> {
  +Id : Guid
  +EventType : NotificationEventType
  +Category : NotificationCategory
  +Title : string
  +Message : string
  +ClientName : string?
  +Link : string?
  +IsRead : bool
  +ReadAt : DateTime?
  +CreatedAt : DateTime
}

class NotificationPreferenceDto <<DTO>> {
  +EventType : NotificationEventType
  +InAppEnabled : bool
  +EmailEnabled : bool
  +PushEnabled : bool
  +EmailDigestOption : EmailDigestOption
}

interface IEmailService <<Interface>> {
  +SendTemplatedAsync(to, template, data, ct) : Task
}

interface IPushNotificationService <<Interface>> {
  +SendAsync(userId, title, message, link, ct) : Task
  +RegisterDeviceTokenAsync(userId, token, platform, ct) : Task
  +UnregisterDeviceTokenAsync(userId, token, ct) : Task
}

class "PagedList<NotificationDto>" as PagedNotifications {
  +Items : List<NotificationDto>
  +TotalCount : int
  +Page : int
  +PageSize : int
}

GetNotificationsQuery ..> PagedNotifications
CreateNotificationCommandHandler --> IEmailService
CreateNotificationCommandHandler --> IPushNotificationService

@enduml
```

![Application Layer - DTOs and Service Interfaces](application-layer-dtos-and-service-interfaces.png)

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class NotificationsController <<Controller>> {
  +GetNotifications() : ActionResult
  +GetUnreadCount() : ActionResult
  +MarkRead() : ActionResult
  +MarkAllRead() : ActionResult
  +GetPreferences() : ActionResult
  +UpdatePreference() : ActionResult
}

class DeviceTokenController <<Controller>> {
  +Register() : ActionResult
  +Unregister() : ActionResult
}

class NotificationHub <<SignalR Hub>> {
  +OnConnectedAsync() : Task
  +OnDisconnectedAsync() : Task
}

class PushNotificationService <<Service>> {
  +SendAsync(userId, title, message, link, ct) : Task
  +RegisterDeviceTokenAsync(userId, token, platform, ct) : Task
  +UnregisterDeviceTokenAsync(userId, token, ct) : Task
}

class NotificationDigestBackgroundJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_email : IEmailService
  -_mediator : IMediator
  +RunAsync() : Task
}

class DeviceToken <<Entity>> {
  +UserId : string
  +Token : string
  +Platform : string
  +CreatedAt : DateTime
}

interface IPushNotificationService <<Interface>>
interface IEmailService <<Interface>>

PushNotificationService ..|> IPushNotificationService
PushNotificationService --> DeviceToken
NotificationDigestBackgroundJob --> IEmailService

NotificationsController ..> GetNotificationsQuery
NotificationsController ..> MarkNotificationReadCommand
NotificationsController ..> UpdateNotificationPreferenceCommand
DeviceTokenController ..> RegisterDeviceTokenCommand

@enduml
```

![Infrastructure & API Layer](infrastructure-api-layer.png)

---

## Sequence Diagrams

### Event Triggers Notification (Full Fan-Out)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "FeatureHandler\n(e.g. OrderPlaced)" as Source
participant "MediatR" as Bus
participant "NotificationEventHandler" as EvtHandler
participant "CreateNotificationHandler" as CmdHandler
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email
participant "IPushNotificationService" as Push
participant "NotificationHub" as SignalR

Source -> Bus : Publish(NotificationEvent)\n{photographerId, StoreOrderPlaced,\nStore, "New Order", "Order #1234\nfrom Jane Smith", "Jane Smith",\n"/orders/1234"}

Bus -> EvtHandler : Handle(NotificationEvent)
EvtHandler -> Bus : Send(CreateNotificationCommand)
Bus -> CmdHandler : Handle(CreateNotificationCommand)

CmdHandler -> DB : Load NotificationPreference\n(photographerId, StoreOrderPlaced)
DB --> CmdHandler : Preference\n{inApp: true, email: true,\npush: true, digest: RealTime}

== In-App ==
CmdHandler -> DB : Create Notification entity
CmdHandler -> DB : SaveChangesAsync()
CmdHandler -> SignalR : Send to photographer group\n{newNotification}
note right of SignalR
  Dashboard bell badge
  updates in real-time
  via WebSocket
end note

== Email (RealTime) ==
CmdHandler -> DB : Load Photographer.Email
CmdHandler -> Email : SendTemplatedAsync(\nphotographer@email.com,\n"notification",\n{Title, Message, Link})

== Push ==
CmdHandler -> DB : Load Photographer.IdentityUserId
CmdHandler -> Push : SendAsync(userId,\n"New Order",\n"Order #1234 from Jane Smith",\n"/orders/1234")
note right of Push
  FCM/APNs deliver
  within 30 seconds
end note

CmdHandler --> Bus : Result<Guid> (notificationId)

@enduml
```

![Event Triggers Notification (Full Fan-Out)](event-triggers-notification-full-fan-out.png)

### Notification Center - List and Filter

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "NotificationsController" as API
participant "GetNotificationsHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/notifications?\ncategory=ClientGallery&isRead=false&page=1
API -> Handler : Send(GetNotificationsQuery)

Handler -> Handler : Verify PhotographerId

Handler -> DB : Query Notifications\nWHERE PhotographerId = {id}\nAND Category = ClientGallery\nAND IsRead = false\nORDER BY CreatedAt DESC
DB --> Handler : Count: 12

Handler -> DB : Take page 1 (20 items)
DB --> Handler : List<Notification> (12 items)

Handler -> Handler : Map to NotificationDto

Handler --> API : PagedList<NotificationDto>\n{items: [...], total: 12, page: 1}
API --> Photographer : 200 OK

@enduml
```

![Notification Center - List and Filter](notification-center-list-and-filter.png)

### Mark Notification as Read

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "NotificationsController" as API
participant "MarkNotificationReadHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : PUT /api/notifications/{id}/read
API -> Handler : Send(MarkNotificationReadCommand)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Load Notification by Id & PhotographerId
DB --> Handler : Notification

Handler -> Handler : Set IsRead = true, ReadAt = now
Handler -> DB : SaveChangesAsync()

Handler --> API : Result.Success()
API --> Photographer : 200 OK

@enduml
```

![Mark Notification as Read](mark-notification-as-read.png)

### Get Unread Count (Bell Badge)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "NotificationsController" as API
participant "GetUnreadCountHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/notifications/unread-count
API -> Handler : Send(GetUnreadCountQuery)

Handler -> Handler : Verify PhotographerId
Handler -> DB : COUNT Notifications\nWHERE PhotographerId = {id}\nAND IsRead = false
DB --> Handler : count = 7

Handler --> API : Result<int>(7)
API --> Photographer : 200 OK {unreadCount: 7}

@enduml
```

![Get Unread Count (Bell Badge)](get-unread-count-bell-badge.png)

### Update Notification Preferences

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "NotificationsController" as API
participant "UpdateNotificationPreferenceHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : PUT /api/notifications/preferences/StoreOrderPlaced\n{emailEnabled: true,\npushEnabled: false,\ninAppEnabled: true,\nemailDigestOption: DailySummary}
API -> Handler : Send(UpdateNotificationPreferenceCommand)

Handler -> Handler : Verify PhotographerId

Handler -> DB : Find NotificationPreference\n(PhotographerId, StoreOrderPlaced)
DB --> Handler : Preference? (may be null)

alt Existing preference found
  Handler -> Handler : Update fields
else No existing preference
  Handler -> DB : Create NotificationPreference\n(all fields from command)
end

Handler -> DB : SaveChangesAsync()

Handler --> API : Result.Success()
API --> Photographer : 200 OK

@enduml
```

![Update Notification Preferences](update-notification-preferences.png)

### Daily Digest Email

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "NotificationDigestBackgroundJob" as Job
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email

Job -> Job : Hourly schedule trigger

Job -> DB : Query NotificationPreferences\nWHERE EmailDigestOption = DailySummary
DB --> Job : List<NotificationPreference>\n(grouped by PhotographerId)

Job -> DB : Query Notifications created since\nlast digest run, matching event types\nwith DailySummary preference
DB --> Job : List<Notification> (ungrouped)

Job -> Job : Group notifications by PhotographerId

loop For each photographer with pending digest items
  Job -> Job : Build digest summary:\n- "3 new orders"\n- "2 contracts signed"\n- "1 gallery download"

  Job -> DB : Load Photographer.Email
  DB --> Job : email address

  Job -> Email : SendTemplatedAsync(\nphotographer@email.com,\n"daily-digest",\n{summaryItems, date, dashboardLink})
  Email --> Job : OK
end

Job -> Job : Update last-run timestamp

@enduml
```

![Daily Digest Email](daily-digest-email.png)

### Register Device Token for Push

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor "Mobile App" as App
participant "DeviceTokenController" as API
participant "RegisterDeviceTokenHandler" as Handler
participant "IPushNotificationService" as Push

App -> API : POST /api/device-tokens\n{token: "fcm_token_abc123",\nplatform: "android"}
API -> Handler : Send(RegisterDeviceTokenCommand)

Handler -> Handler : Verify authenticated user\n(ICurrentUserService.UserId)

Handler -> Push : RegisterDeviceTokenAsync(\nuserId, "fcm_token_abc123", "android")
note right of Push
  Stores DeviceToken entity.
  If token already exists for
  this user, it is a no-op.
end note
Push --> Handler : OK

Handler --> API : Result.Success()
API --> App : 200 OK

@enduml
```

![Register Device Token for Push](register-device-token-for-push.png)

### Real-Time SignalR Notification Push

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor "Dashboard Browser" as Browser
participant "NotificationHub" as Hub
participant "CreateNotificationHandler" as Handler
participant "IApplicationDbContext" as DB

== Connection Setup ==
Browser -> Hub : Connect WebSocket\n(JWT auth, join photographer group)
Hub --> Browser : Connected

== Notification Arrives ==
Handler -> DB : Create Notification
Handler -> DB : SaveChangesAsync()

Handler -> Hub : SendToGroupAsync(\nphotographerId,\n"NewNotification",\n{id, eventType, title, message,\nclientName, link, createdAt})

Hub -> Browser : WebSocket message:\n"NewNotification" payload

Browser -> Browser : Update bell badge count\nShow toast notification\nPrepend to notification panel

@enduml
```

![Real-Time SignalR Notification Push](real-time-signalr-notification-push.png)
