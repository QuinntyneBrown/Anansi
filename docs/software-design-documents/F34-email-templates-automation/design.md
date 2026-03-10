# F34 - Email Templates & Automation

## Overview

Email Templates & Automation enables photographers to create reusable email templates and configure automated emails for key workflow events. Templates fall into three categories: Gallery Email Templates (used when sending gallery invitations, with personalization variables for client name, gallery link, and password), Studio Manager Email Templates (usable at any workflow stage including inquiry, booking, invoicing, and delivery, with variable substitution for client data), and Branded Gallery Invites (incorporating the photographer's logo, header image, and brand colors alongside a direct gallery link and optional password/PIN).

Automated emails cover four key scenarios. Booking Emails send a confirmation automatically upon successful booking and a configurable session reminder before the shoot. Document Reminders send automated follow-ups for unsigned contracts, unpaid invoices, and incomplete questionnaires, with configurable frequency and automatic cessation once the action is completed. Gallery Expiry Reminders notify configurable recipient groups (specific clients, all viewers, downloaders, favoriters, or purchasers) at configurable intervals before a collection expires (e.g., 14, 7, 3 days before). Payment Confirmations send an email when a payment is processed, including the amount paid, payment method, and remaining balance.

The `AutomatedEmailConfig` entity stores per-photographer, per-event-type configuration, while the `EmailTemplate` entity provides the content. A background job (`AutomatedEmailJob`) periodically evaluates pending triggers -- upcoming sessions needing reminders, overdue documents, expiring galleries -- and dispatches emails through the template engine with variable substitution.

**L2 Requirements:** EML-5.2.1 (Gallery Email Templates), EML-5.2.2 (Studio Manager Email Templates), EML-5.2.3 (Branded Gallery Invites), EML-5.3.1 (Booking Emails), EML-5.3.2 (Document Reminders), EML-5.3.3 (Gallery Expiry Reminders), EML-5.3.4 (Payment Confirmations)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `EmailTemplate` | Entity (existing) | Reusable email template with name, category ("Gallery", "StudioManager", "BrandedInvite"), subject line, body (plain + HTML), header image URL, and branding flag. Implements `ITenantEntity`, `ISoftDeletable`. |
| `AutomatedEmailConfig` | Entity (existing) | Per-photographer configuration for automated emails. Stores event type (BookingConfirmation, SessionReminder, ContractReminder, InvoiceReminder, QuestionnaireReminder, GalleryExpiryReminder, PaymentConfirmation), enabled flag, linked template ID, timing offset, reminder frequency, recipient types (JSON), and days-before-event schedule. |
| `Photographer` | Entity (existing) | Provides branding data (LogoUrl, ProfileIconUrl, BrandColorHex) used in branded gallery invites. |
| `BookingRecord` | Entity (existing) | Booking with `StartTime` used for session reminder scheduling. |
| `Contract` | Entity (existing) | Contract with `Status` and `AutoRemindersEnabled` for document reminder triggers. |
| `Invoice` | Entity (existing) | Invoice with `Status`, `DueDate`, and `AutoRemindersEnabled` for payment reminder triggers. |
| `Questionnaire` | Entity (existing) | Questionnaire with `Status` and `AutoRemindersEnabled` for completion reminder triggers. |
| `Collection` | Entity (existing) | Gallery collection with `ExpiryDate` for gallery expiry reminder triggers. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateEmailTemplateCommand` | Command | Creates a new `EmailTemplate` with name, category, subject, body, and optional branding configuration. Validates required fields per category. |
| `UpdateEmailTemplateCommand` | Command | Updates an existing template's fields. |
| `DeleteEmailTemplateCommand` | Command | Soft-deletes an email template. |
| `ListEmailTemplatesQuery` | Query | Paginated list of templates for the photographer, optionally filtered by category. |
| `GetEmailTemplateQuery` | Query | Returns a single template by ID. |
| `PreviewEmailTemplateQuery` | Query | Renders a template with sample variable substitution so the photographer can preview the result. |
| `CreateAutomatedEmailConfigCommand` | Command | Creates or updates an `AutomatedEmailConfig` for a specific event type. Validates timing/frequency values. |
| `UpdateAutomatedEmailConfigCommand` | Command | Updates configuration fields (enabled, template, timing, frequency, recipients). |
| `ListAutomatedEmailConfigsQuery` | Query | Returns all automated email configurations for the photographer. |
| `SendBrandedGalleryInviteCommand` | Command | Sends a gallery invitation email using the photographer's branding, a selected template, and personalization variables (client name, gallery link, password/PIN). |
| `SendPaymentConfirmationCommand` | Command (internal) | Triggered after payment processing. Sends confirmation email with amount, method, and remaining balance using the configured template. |
| `ITemplateRenderService` | Interface | Renders an email template body by substituting variables (e.g., `{{client_name}}`, `{{gallery_link}}`, `{{password}}`). Applies branding (logo, colors) for branded invites. |
| `EmailTemplateDto` | DTO | Read model for template: Id, Name, Category, SubjectLine, Body, HtmlBody, HeaderImageUrl, UseBranding. |
| `AutomatedEmailConfigDto` | DTO | Read model for config: Id, EventType, IsEnabled, EmailTemplateId, TimingOffsetHours, ReminderFrequencyDays, RecipientTypes, DaysBeforeEvent. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `TemplateRenderService` | Service | Implements `ITemplateRenderService`. Performs Mustache-style variable substitution on template bodies. Wraps content in branded HTML layout (logo, header image, brand colors) for branded invites. |
| `AutomatedEmailJob` | Background Job | Runs on a schedule (e.g., every 15 minutes). Evaluates each automated email type for pending triggers. |
| `BookingEmailProcessor` | Component | Sub-processor for `AutomatedEmailJob`. Sends booking confirmations for newly confirmed bookings and session reminders based on `TimingOffsetHours` before `StartTime`. |
| `DocumentReminderProcessor` | Component | Sub-processor for `AutomatedEmailJob`. Finds unsigned contracts, unpaid invoices, and incomplete questionnaires with `AutoRemindersEnabled`. Sends reminders at configured frequency. Skips completed items. |
| `GalleryExpiryReminderProcessor` | Component | Sub-processor for `AutomatedEmailJob`. Finds collections approaching expiry within configured day thresholds. Resolves recipient lists based on configured types (viewers, downloaders, favoriters, purchasers). Sends reminders. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `EmailTemplatesController` | Controller | Endpoints: `POST /api/email/templates` (create), `GET /api/email/templates` (list), `GET /api/email/templates/{id}` (get), `PUT /api/email/templates/{id}` (update), `DELETE /api/email/templates/{id}` (delete), `POST /api/email/templates/{id}/preview` (preview with variables). All require `[Authorize]`. |
| `AutomatedEmailsController` | Controller | Endpoints: `POST /api/email/automation` (create config), `GET /api/email/automation` (list configs), `PUT /api/email/automation/{id}` (update config). All require `[Authorize]`. |
| `GalleryInvitesController` | Controller | Endpoint: `POST /api/galleries/{collectionId}/invite` (send branded gallery invite). Requires `[Authorize]`. |

---

## Class Diagrams

### Domain Layer - Email Template & Automation Entities

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

class EmailTemplate {
  +PhotographerId : Guid
  +Name : string
  +Category : string
  +SubjectLine : string?
  +Body : string
  +HtmlBody : string?
  +HeaderImageUrl : string?
  +UseBranding : bool
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

class AutomatedEmailConfig {
  +PhotographerId : Guid
  +EventType : string
  +IsEnabled : bool
  +EmailTemplateId : Guid?
  +TimingOffsetHours : int?
  +ReminderFrequencyDays : int?
  +RecipientTypes : string?
  +DaysBeforeEvent : string?
}

BaseEntity <|-- EmailTemplate
BaseEntity <|-- AutomatedEmailConfig
AutomatedEmailConfig --> EmailTemplate : uses

note right of EmailTemplate
  Category values:
  "Gallery"
  "StudioManager"
  "BrandedInvite"
end note

note right of AutomatedEmailConfig
  EventType values:
  "BookingConfirmation"
  "SessionReminder"
  "ContractReminder"
  "InvoiceReminder"
  "QuestionnaireReminder"
  "GalleryExpiryReminder"
  "PaymentConfirmation"
end note

@enduml
```

### Domain Layer - Entities Triggering Automated Emails

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class BookingRecord {
  +PhotographerId : Guid
  +ClientEmail : string
  +StartTime : DateTime
  +Status : BookingStatus
}

class Contract {
  +PhotographerId : Guid
  +ContactId : Guid?
  +Status : ContractStatus
  +AutoRemindersEnabled : bool
  +ReminderIntervalDays : int?
  +LastReminderSentAt : DateTime?
}

class Invoice {
  +PhotographerId : Guid
  +ContactId : Guid?
  +Status : InvoiceStatus
  +DueDate : DateTime?
  +AutoRemindersEnabled : bool
  +ReminderIntervalDays : int?
  +LastReminderSentAt : DateTime?
}

class Questionnaire {
  +PhotographerId : Guid
  +ContactId : Guid?
  +Status : QuestionnaireStatus
  +AutoRemindersEnabled : bool
  +ReminderIntervalDays : int?
  +LastReminderSentAt : DateTime?
}

class Collection {
  +PhotographerId : Guid
  +ExpiryDate : DateTime?
}

note bottom of BookingRecord
  Triggers:
  BookingConfirmation
  SessionReminder
end note

note bottom of Contract
  Triggers:
  ContractReminder
end note

note bottom of Invoice
  Triggers:
  InvoiceReminder
end note

@enduml
```

### Application Layer - Commands, Queries, and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CreateEmailTemplateCommand <<Command>> {
  +Name : string
  +Category : string
  +SubjectLine : string?
  +Body : string
  +HtmlBody : string?
  +HeaderImageUrl : string?
  +UseBranding : bool
}

class UpdateEmailTemplateCommand <<Command>> {
  +Id : Guid
  +Name : string
  +SubjectLine : string?
  +Body : string
  +HtmlBody : string?
}

class ListEmailTemplatesQuery <<Query>> {
  +Category : string?
  +Page : int
  +PageSize : int
}

class CreateAutomatedEmailConfigCommand <<Command>> {
  +EventType : string
  +IsEnabled : bool
  +EmailTemplateId : Guid?
  +TimingOffsetHours : int?
  +ReminderFrequencyDays : int?
  +RecipientTypes : string?
  +DaysBeforeEvent : string?
}

class SendBrandedGalleryInviteCommand <<Command>> {
  +CollectionId : Guid
  +RecipientEmail : string
  +RecipientName : string?
  +TemplateId : Guid?
  +IncludePassword : bool
  +IncludeDownloadPin : bool
}

class SendPaymentConfirmationCommand <<Command>> {
  +PaymentRecordId : Guid
}

interface ITemplateRenderService <<Interface>> {
  +RenderAsync(templateId, variables) : string
  +RenderBrandedAsync(templateId, variables, branding) : string
}

class EmailTemplateDto <<DTO>> {
  +Id : Guid
  +Name : string
  +Category : string
  +SubjectLine : string?
  +Body : string
  +UseBranding : bool
}

class AutomatedEmailConfigDto <<DTO>> {
  +Id : Guid
  +EventType : string
  +IsEnabled : bool
  +EmailTemplateId : Guid?
  +TimingOffsetHours : int?
  +ReminderFrequencyDays : int?
}

SendBrandedGalleryInviteCommand --> ITemplateRenderService
SendPaymentConfirmationCommand --> ITemplateRenderService

@enduml
```

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EmailTemplatesController <<ApiController>> {
  -_mediator : IMediator
  +Create(command) : IActionResult
  +List(category, page) : IActionResult
  +Get(id) : IActionResult
  +Update(id, command) : IActionResult
  +Delete(id) : IActionResult
  +Preview(id, variables) : IActionResult
}

class AutomatedEmailsController <<ApiController>> {
  -_mediator : IMediator
  +CreateConfig(command) : IActionResult
  +ListConfigs() : IActionResult
  +UpdateConfig(id, command) : IActionResult
}

class GalleryInvitesController <<ApiController>> {
  -_mediator : IMediator
  +SendInvite(collectionId, command) : IActionResult
}

class AutomatedEmailJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_templateRender : ITemplateRenderService
  -_emailService : IEmailService
  +ProcessPendingEmails() : Task
}

class TemplateRenderService <<Service>> {
  +RenderAsync(templateId, variables) : string
  +RenderBrandedAsync(templateId, variables, branding) : string
}

interface ITemplateRenderService <<Interface>>

TemplateRenderService ..|> ITemplateRenderService
AutomatedEmailJob --> ITemplateRenderService
AutomatedEmailJob --> IEmailService

@enduml
```

---

## Sequence Diagrams

### Create and Use Gallery Email Template

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "EmailTemplatesController" as API
participant "MediatR" as M
participant "CreateTemplateHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/email/templates\n{name: "Gallery Welcome",\ncategory: "Gallery",\nsubjectLine: "Your photos are ready!",\nbody: "Hi {{client_name}}, your\ngallery is ready: {{gallery_link}}"}
API -> M : Send(CreateEmailTemplateCommand)
M -> Handler : Handle(command)

Handler -> Handler : Resolve PhotographerId
Handler -> Handler : Validate required fields

Handler -> DB : Create EmailTemplate\n{Name, Category, Subject, Body}
Handler -> DB : SaveChangesAsync()

Handler --> M : Result<EmailTemplateDto>
M --> API : Result.Success
API --> Photographer : 201 Created (EmailTemplateDto)

@enduml
```

### Send Branded Gallery Invite

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "GalleryInvitesController" as API
participant "MediatR" as M
participant "SendInviteHandler" as Handler
participant "IApplicationDbContext" as DB
participant "ITemplateRenderService" as Render
participant "IEmailService" as Email

Photographer -> API : POST /api/galleries/{collectionId}/invite\n{recipientEmail, recipientName,\ntemplateId, includePassword: true}
API -> M : Send(SendBrandedGalleryInviteCommand)
M -> Handler : Handle(command)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Get Photographer\n(LogoUrl, BrandColorHex)
Handler -> DB : Get Collection\n(Password, DownloadPin, ShareUrl)
Handler -> DB : Get EmailTemplate (templateId)
DB --> Handler : photographer, collection, template

Handler -> Handler : Build variables map:\n{{client_name}} = recipientName\n{{gallery_link}} = collection.ShareUrl\n{{password}} = collection.Password

Handler -> Render : RenderBrandedAsync(\ntemplate, variables,\n{logo, headerImage, brandColor})
Render --> Handler : Rendered HTML email\nwith branding wrapper

Handler -> Email : SendAsync(\nrecipientEmail,\ntemplate.SubjectLine,\nrenderedHtml)

Handler -> DB : Create EmailInvitation\nrecord for tracking
Handler -> DB : SaveChangesAsync()

Handler --> M : Result.Success
M --> API : Result.Success
API --> Photographer : 200 OK

@enduml
```

### Automated Session Reminder

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "Scheduler" as Sched
participant "AutomatedEmailJob" as Job
participant "IApplicationDbContext" as DB
participant "ITemplateRenderService" as Render
participant "IEmailService" as Email

Sched -> Job : ProcessPendingEmails()\n(every 15 minutes)

Job -> DB : Get AutomatedEmailConfigs\nwhere EventType = "SessionReminder"\nand IsEnabled = true
DB --> Job : List<AutomatedEmailConfig>

loop each config
  Job -> DB : Get BookingRecords\nwhere PhotographerId matches\nand Status = Confirmed\nand StartTime within offset window
  DB --> Job : List<BookingRecord>

  loop each upcoming booking
    Job -> Job : Check if reminder\nalready sent for this booking

    alt not yet sent
      Job -> DB : Get EmailTemplate\n(config.EmailTemplateId)
      DB --> Job : EmailTemplate

      Job -> Job : Build variables:\n{{client_name}}, {{session_date}},\n{{session_time}}, {{location}}

      Job -> Render : RenderAsync(\ntemplate, variables)
      Render --> Job : Rendered email body

      Job -> Email : SendAsync(\nbooking.ClientEmail,\nsubject, renderedBody)

      Job -> DB : Record reminder sent\n(prevent duplicates)
    end
  end
end

Job -> DB : SaveChangesAsync()

@enduml
```

### Automated Document Reminders

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "AutomatedEmailJob" as Job
participant "IApplicationDbContext" as DB
participant "ITemplateRenderService" as Render
participant "IEmailService" as Email

Job -> DB : Get AutomatedEmailConfigs\nwhere EventType in\n("ContractReminder",\n"InvoiceReminder",\n"QuestionnaireReminder")\nand IsEnabled = true
DB --> Job : List<AutomatedEmailConfig>

== Contract Reminders ==

Job -> DB : Get Contracts where\nStatus = Sent and\nAutoRemindersEnabled = true\nand (LastReminderSentAt is null\nor days since >= ReminderFrequencyDays)
DB --> Job : List<Contract>

loop each unsigned contract
  Job -> DB : Get Contact email
  Job -> Render : RenderAsync(template, variables)
  Render --> Job : rendered body
  Job -> Email : SendAsync(contactEmail,\n"Reminder: Contract awaiting signature")
  Job -> DB : Update LastReminderSentAt
end

== Invoice Reminders ==

Job -> DB : Get Invoices where\nStatus in (Sent, Overdue) and\nAutoRemindersEnabled = true\nand days since last reminder >= freq
DB --> Job : List<Invoice>

loop each unpaid invoice
  Job -> Render : RenderAsync(template, variables)
  Job -> Email : SendAsync(contactEmail,\n"Reminder: Invoice payment due")
  Job -> DB : Update LastReminderSentAt
end

== Questionnaire Reminders ==

Job -> DB : Get Questionnaires where\nStatus = Sent and\nAutoRemindersEnabled = true\nand days since last reminder >= freq
DB --> Job : List<Questionnaire>

loop each incomplete questionnaire
  Job -> Render : RenderAsync(template, variables)
  Job -> Email : SendAsync(contactEmail,\n"Reminder: Questionnaire pending")
  Job -> DB : Update LastReminderSentAt
end

Job -> DB : SaveChangesAsync()

note right of Job
  Reminders auto-stop when:
  Contract: Status = Signed
  Invoice: Status = Paid
  Questionnaire: Status = Completed
end note

@enduml
```

### Gallery Expiry Reminders

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "AutomatedEmailJob" as Job
participant "IApplicationDbContext" as DB
participant "ITemplateRenderService" as Render
participant "IEmailService" as Email

Job -> DB : Get AutomatedEmailConfigs\nwhere EventType = "GalleryExpiryReminder"\nand IsEnabled = true
DB --> Job : List<AutomatedEmailConfig>

loop each config
  Job -> Job : Parse DaysBeforeEvent\n(e.g., "14,7,3")
  Job -> DB : Get Collections\nwhere PhotographerId matches\nand ExpiryDate is within\nconfigured day thresholds
  DB --> Job : List<Collection>

  loop each expiring collection
    Job -> Job : Parse RecipientTypes JSON\n(e.g., ["all_viewers",\n"all_downloaders"])

    Job -> DB : Resolve recipients based\non type from GalleryActivities
    DB --> Job : List of recipient emails

    loop each recipient
      Job -> Render : RenderAsync(template,\n{collection_name,\nexpiry_date, gallery_link})
      Render --> Job : rendered body
      Job -> Email : SendAsync(\nrecipientEmail,\n"Gallery expiring soon")
    end
  end
end

Job -> DB : SaveChangesAsync()

@enduml
```

### Payment Confirmation Email

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "RecordPaymentHandler" as PayHandler
participant "MediatR" as M
participant "SendConfirmationHandler" as Handler
participant "IApplicationDbContext" as DB
participant "ITemplateRenderService" as Render
participant "IEmailService" as Email

PayHandler -> M : Send(SendPaymentConfirmationCommand\n{paymentRecordId})
M -> Handler : Handle(command)

Handler -> DB : Get PaymentRecord
DB --> Handler : PaymentRecord

Handler -> DB : Get AutomatedEmailConfig\n(EventType = "PaymentConfirmation",\nPhotographerId)
DB --> Handler : config (if enabled)

alt config is null or disabled
  Handler --> M : Result.Success (no-op)
end

Handler -> DB : Get Invoice (if linked)\nfor remaining balance
DB --> Handler : Invoice

Handler -> DB : Get Contact for email
DB --> Handler : Contact

Handler -> DB : Get EmailTemplate\n(config.EmailTemplateId)
DB --> Handler : EmailTemplate

Handler -> Handler : Build variables:\n{{amount_paid}} = formatted amount\n{{payment_method}} = method name\n{{remaining_balance}} = outstanding

Handler -> Render : RenderAsync(template, variables)
Render --> Handler : rendered body

Handler -> Email : SendAsync(\ncontact.Email,\ntemplate.SubjectLine,\nrenderedBody)

Handler --> M : Result.Success

@enduml
```
