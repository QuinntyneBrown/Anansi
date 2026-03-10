# F33 - Email Inbox & Communication

## Overview

The Email Inbox feature provides a unified communication hub within Studio Manager where photographers can manage all client conversations in one place. Every conversation is threaded by client, ensuring that all messages exchanged with a particular client (or email address) appear in a single, chronological thread. Photographers can compose new messages via a "New Message" button, and when a client replies to any message, the response is automatically threaded into the existing conversation.

File attachments are supported on all messages, with a maximum size of 25MB per message and compatibility with 30+ file types including documents (PDF, DOCX), images (JPG, PNG, GIF), video (MP4), and archives (ZIP). Attachment size validation occurs on the server side, rejecting oversized files with a clear error message before storage. Files are uploaded to blob storage and linked to the message via the `EmailAttachment` entity.

Real-time notification is central to the inbox experience. When a client responds, an instant in-app notification is delivered via the existing `Notification` entity and optionally through push notifications. An email notification is also sent to the photographer's account email address. Notification preferences are configurable per photographer, allowing control over which channels (in-app, email, push) are active and which event types trigger alerts.

**L2 Requirements:** EML-5.1.1 (Unified Inbox), EML-5.1.2 (File Attachments), EML-5.1.3 (Notifications)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `EmailConversation` | Entity (existing) | Threaded conversation with a client. Scoped by `PhotographerId`, linked to optional `ContactId`. Tracks subject, client email/name, read status, and last message timestamp. Implements `ITenantEntity`, `ISoftDeletable`. |
| `EmailMessage` | Entity (existing) | Individual message within a conversation. Stores sender info, body (plain and HTML), read status, and sent timestamp. `IsFromPhotographer` flag distinguishes direction. |
| `EmailAttachment` | Entity (existing) | File attachment on a message. Records file name, content type, size in bytes, and blob storage URL. Max 25MB per message enforced at the Application layer. |
| `Notification` | Entity (existing) | In-app notification with `EventType = MessageReceived`. Links to the photographer and includes a deep link to the conversation. |
| `NotificationPreference` | Entity (existing) | Per-photographer, per-event-type configuration for notification delivery channels (in-app, email, push). |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ListConversationsQuery` | Query | Paginated list of `EmailConversation` records for the authenticated photographer, ordered by `LastMessageAt` descending. Returns unread count per conversation. |
| `GetConversationQuery` | Query | Returns a single conversation with all its messages and attachments, ordered chronologically. Marks the conversation as read. |
| `ComposeMessageCommand` | Command | Creates a new `EmailConversation` (or threads into an existing one by client email), creates the `EmailMessage`, uploads attachments, sends the email via `IEmailService`, and updates `LastMessageAt`. |
| `ReplyToConversationCommand` | Command | Adds a new `EmailMessage` to an existing conversation, handles attachments, sends the email, and updates `LastMessageAt`. |
| `ReceiveInboundEmailCommand` | Command (internal) | Called by the inbound email webhook handler. Matches the incoming email to an existing conversation by client email (or creates a new one), creates the `EmailMessage` with attachments, marks conversation as unread, creates an in-app `Notification`, sends email notification to the photographer, and optionally triggers a push notification. |
| `MarkConversationReadCommand` | Command | Sets `IsRead = true` on the conversation and all its unread messages. |
| `DeleteConversationCommand` | Command | Soft-deletes a conversation. |
| `UploadAttachmentCommand` | Command (internal) | Validates file size (max 25MB per message total), validates file type against the allowed list, uploads to blob storage via `IStorageService`, and returns the `EmailAttachment` record. |
| `ConversationDto` | DTO | Read model for conversation list: Id, Subject, ClientName, ClientEmail, LastMessagePreview, LastMessageAt, IsRead, UnreadCount. |
| `ConversationDetailDto` | DTO | Full conversation with nested messages and attachments. |
| `EmailMessageDto` | DTO | Read model for a single message: Id, IsFromPhotographer, SenderName, Body, SentAt, Attachments. |
| `EmailAttachmentDto` | DTO | Read model for attachment: Id, FileName, ContentType, FileSizeBytes, DownloadUrl. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `InboundEmailWebhookHandler` | Service | Receives inbound emails from the email provider (e.g., SendGrid Inbound Parse, Mailgun Routes). Parses sender, subject, body, and attachments. Invokes `ReceiveInboundEmailCommand`. |
| `EmailService` | Service (existing) | Implements `IEmailService`. Sends outbound emails through the configured email provider. |
| `StorageService` | Service (existing) | Implements `IStorageService`. Handles attachment upload to blob storage and presigned URL generation for downloads. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `EmailController` | Controller (existing, extended) | Endpoints: `GET /api/email/conversations` (list), `GET /api/email/conversations/{id}` (detail), `POST /api/email/conversations` (compose new), `POST /api/email/conversations/{id}/reply` (reply), `PUT /api/email/conversations/{id}/read` (mark read), `DELETE /api/email/conversations/{id}` (soft-delete), `POST /api/email/inbound` (webhook for inbound emails). Compose and reply endpoints accept multipart form data for file attachments. |

---

## Class Diagrams

### Domain Layer - Email Entities

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

class EmailConversation {
  +PhotographerId : Guid
  +ContactId : Guid?
  +Subject : string
  +ClientEmail : string?
  +ClientName : string?
  +IsRead : bool
  +LastMessageAt : DateTime?
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

class EmailMessage {
  +ConversationId : Guid
  +IsFromPhotographer : bool
  +SenderEmail : string
  +SenderName : string?
  +Body : string
  +HtmlBody : string?
  +IsRead : bool
  +SentAt : DateTime
}

class EmailAttachment {
  +MessageId : Guid
  +FileName : string
  +ContentType : string
  +FileSizeBytes : long
  +StorageUrl : string
}

BaseEntity <|-- EmailConversation
BaseEntity <|-- EmailMessage
BaseEntity <|-- EmailAttachment

EmailConversation "1" --> "*" EmailMessage : Messages
EmailMessage "1" --> "*" EmailAttachment : Attachments

@enduml
```

![Domain Layer - Email Entities](domain-layer-email-entities.png)

### Domain Layer - Notification Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

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
  +InAppEnabled : bool
  +EmailEnabled : bool
  +PushEnabled : bool
}

enum NotificationEventType {
  MessageReceived
  ...
}

Notification --> NotificationEventType
NotificationPreference --> NotificationEventType

@enduml
```

![Domain Layer - Notification Entities](domain-layer-notification-entities.png)

### Application Layer - Commands, Queries, and DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ListConversationsQuery <<Query>> {
  +Page : int
  +PageSize : int
  +Search : string?
}

class GetConversationQuery <<Query>> {
  +ConversationId : Guid
}

class ComposeMessageCommand <<Command>> {
  +ClientEmail : string
  +ClientName : string?
  +Subject : string
  +Body : string
  +HtmlBody : string?
  +Attachments : List<FileUpload>?
}

class ReplyToConversationCommand <<Command>> {
  +ConversationId : Guid
  +Body : string
  +HtmlBody : string?
  +Attachments : List<FileUpload>?
}

class ReceiveInboundEmailCommand <<Command>> {
  +FromEmail : string
  +FromName : string?
  +Subject : string
  +Body : string
  +HtmlBody : string?
  +Attachments : List<InboundAttachment>?
  +PhotographerId : Guid
}

class MarkConversationReadCommand <<Command>> {
  +ConversationId : Guid
}

class ConversationDto <<DTO>> {
  +Id : Guid
  +Subject : string
  +ClientName : string?
  +ClientEmail : string?
  +LastMessagePreview : string?
  +LastMessageAt : DateTime?
  +IsRead : bool
  +UnreadCount : int
}

class EmailMessageDto <<DTO>> {
  +Id : Guid
  +IsFromPhotographer : bool
  +SenderName : string?
  +Body : string
  +SentAt : DateTime
  +Attachments : List<EmailAttachmentDto>
}

class EmailAttachmentDto <<DTO>> {
  +Id : Guid
  +FileName : string
  +ContentType : string
  +FileSizeBytes : long
  +DownloadUrl : string
}

@enduml
```

![Application Layer - Commands, Queries, and DTOs](application-layer-commands-queries-and-dtos.png)

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EmailController <<ApiController>> {
  -_mediator : IMediator
  +ListConversations(page, search) : IActionResult
  +GetConversation(id) : IActionResult
  +ComposeMessage(command, files) : IActionResult
  +ReplyToConversation(id, command, files) : IActionResult
  +MarkRead(id) : IActionResult
  +DeleteConversation(id) : IActionResult
  +InboundWebhook(payload) : IActionResult
}

class InboundEmailWebhookHandler <<Service>> {
  -_mediator : IMediator
  +ProcessInboundEmail(payload) : Task
}

interface IEmailService <<Interface>> {
  +SendAsync(to, subject, htmlBody) : Task
  +SendTemplatedAsync(to, templateId, vars) : Task
}

interface IStorageService <<Interface>> {
  +UploadAsync(stream, key) : Task<string>
  +GetPresignedUrlAsync(key) : string
}

interface IPushNotificationService <<Interface>> {
  +SendAsync(userId, title, message) : Task
}

EmailController ..> ComposeMessageCommand
EmailController ..> ReplyToConversationCommand
EmailController ..> ListConversationsQuery
InboundEmailWebhookHandler ..> ReceiveInboundEmailCommand

@enduml
```

![Infrastructure & API Layer](infrastructure-api-layer.png)

---

## Sequence Diagrams

### Compose and Send New Message

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "EmailController" as API
participant "MediatR" as M
participant "ComposeMessageHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage
participant "IEmailService" as Email

Photographer -> API : POST /api/email/conversations\n{clientEmail, subject, body}\n+ file attachments (multipart)
API -> Handler : Send(ComposeMessageCommand)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Find existing conversation\nby ClientEmail + PhotographerId
DB --> Handler : null (no existing thread)

Handler -> DB : Create EmailConversation\n{Subject, ClientEmail, ClientName}

Handler -> DB : Create EmailMessage\n{IsFromPhotographer=true, Body}

alt has attachments
  Handler -> Handler : Validate total size <= 25MB
  Handler -> Handler : Validate file types allowed
  loop each attachment
    Handler -> Storage : UploadAsync(file stream)
    Storage --> Handler : storageUrl
    Handler -> DB : Create EmailAttachment\n{FileName, ContentType,\nFileSizeBytes, StorageUrl}
  end
end

Handler -> DB : Set LastMessageAt = UtcNow
Handler -> DB : SaveChangesAsync()

Handler -> Email : SendAsync(clientEmail,\nsubject, htmlBody)

Handler --> M : Result<ConversationDto>
M --> API : Result.Success
API --> Photographer : 201 Created (ConversationDto)

@enduml
```

![Compose and Send New Message](compose-and-send-new-message.png)

### Receive Inbound Client Reply

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "Email Provider\n(SendGrid/Mailgun)" as EP
participant "EmailController" as API
participant "InboundEmailWebhookHandler" as Webhook
participant "MediatR" as M
participant "ReceiveInboundHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage
participant "IEmailService" as Email
participant "IPushNotificationService" as Push

EP -> API : POST /api/email/inbound\n(webhook payload)
API -> Webhook : ProcessInboundEmail(payload)
Webhook -> Webhook : Parse sender, subject,\nbody, attachments
Webhook -> M : Send(ReceiveInboundEmailCommand)
M -> Handler : Handle(command)

Handler -> DB : Find EmailConversation\nby ClientEmail + PhotographerId
DB --> Handler : EmailConversation (existing)

Handler -> DB : Create EmailMessage\n{IsFromPhotographer=false,\nSenderEmail, Body}

alt has attachments
  loop each attachment
    Handler -> Storage : UploadAsync(file)
    Storage --> Handler : storageUrl
    Handler -> DB : Create EmailAttachment
  end
end

Handler -> DB : Set Conversation.IsRead = false
Handler -> DB : Set LastMessageAt = UtcNow
Handler -> DB : SaveChangesAsync()

Handler -> DB : Check NotificationPreference\nfor MessageReceived
DB --> Handler : preferences

alt in-app enabled
  Handler -> DB : Create Notification\n{EventType: MessageReceived,\nTitle, Link to conversation}
end

alt email enabled
  Handler -> Email : SendAsync(\nphotographer.Email,\n"New message from {client}")
end

alt push enabled
  Handler -> Push : SendAsync(\nphotographerUserId,\n"New message", link)
end

Handler --> M : Result.Success
API --> EP : 200 OK

@enduml
```

![Receive Inbound Client Reply](receive-inbound-client-reply.png)

### List Conversations (Unified Inbox)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "EmailController" as API
participant "MediatR" as M
participant "ListConversationsHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/email/conversations?\npage=1&pageSize=25
API -> M : Send(ListConversationsQuery)
M -> Handler : Handle(query)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Query EmailConversations\n(PhotographerId, not deleted)\nOrderByDescending(LastMessageAt)

Handler -> DB : For each conversation,\ncount unread messages\nand get last message preview

DB --> Handler : List with unread counts

Handler -> DB : CountAsync() for total
DB --> Handler : totalCount

Handler -> Handler : Project to ConversationDto\nwith UnreadCount,\nLastMessagePreview

Handler --> M : Result<PagedList<ConversationDto>>
M --> API : Result.Success
API --> Photographer : 200 OK\n(paginated conversations)

@enduml
```

![List Conversations (Unified Inbox)](list-conversations-unified-inbox.png)

### Reply to Conversation with Attachments

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "EmailController" as API
participant "MediatR" as M
participant "ReplyHandler" as Handler
participant "IApplicationDbContext" as DB
participant "IStorageService" as Storage
participant "IEmailService" as Email

Photographer -> API : POST /api/email/conversations/{id}/reply\n{body, htmlBody}\n+ file attachments (multipart)
API -> M : Send(ReplyToConversationCommand)
M -> Handler : Handle(command)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Find EmailConversation\n(Id, PhotographerId)
DB --> Handler : EmailConversation

alt not found
  Handler --> M : Result.NotFound
  M --> API : Result.Failure
  API --> Photographer : 404 Not Found
end

alt has attachments
  Handler -> Handler : Validate total size <= 25MB
  alt size exceeded
    Handler --> M : Result.Failure\n("Attachments exceed 25MB limit")
    M --> API : Result.Failure
    API --> Photographer : 400 Bad Request
  end

  loop each file
    Handler -> Storage : UploadAsync(stream)
    Storage --> Handler : storageUrl
  end
end

Handler -> DB : Create EmailMessage\n{IsFromPhotographer=true}
Handler -> DB : Create EmailAttachments
Handler -> DB : Update LastMessageAt
Handler -> DB : SaveChangesAsync()

Handler -> Email : SendAsync(\nclientEmail, subject, htmlBody)

Handler --> M : Result<EmailMessageDto>
M --> API : Result.Success
API --> Photographer : 200 OK (EmailMessageDto)

@enduml
```

![Reply to Conversation with Attachments](reply-to-conversation-with-attachments.png)

### Mark Conversation as Read

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "EmailController" as API
participant "MediatR" as M
participant "MarkReadHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : PUT /api/email/conversations/{id}/read
API -> M : Send(MarkConversationReadCommand)
M -> Handler : Handle(command)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Find EmailConversation\n(Id, PhotographerId)
DB --> Handler : EmailConversation

Handler -> DB : Set Conversation.IsRead = true
Handler -> DB : Update all Messages\nwhere IsRead = false\nSet IsRead = true

Handler -> DB : SaveChangesAsync()

Handler --> M : Result.Success
M --> API : Result.Success
API --> Photographer : 200 OK

@enduml
```

![Mark Conversation as Read](mark-conversation-as-read.png)
