# F23 - Contacts & CRM

## Overview

This feature provides the contact management backbone of the Anansi Studio Manager. Photographers can maintain three types of contacts -- Client, Lead, and Other -- each storing first/last name, email, phone, address, and notes. Contact type is manually changeable at any time, and the system automatically converts a Lead to a Client when a booking is confirmed or a payment is received (with manual override always available).

Each contact has a centralized profile view that aggregates every touchpoint: personal details, all associated documents (contracts, invoices, questionnaires), email conversation history, sessions and bookings, linked galleries, and payment history. This profile serves as the single source of truth for the photographer-client relationship, with all associated items navigable from one screen.

The feature also includes CSV contact import with column mapping and duplicate detection (by email, with merge or skip options), and a lead capture form system. Lead capture forms support configurable fields (first name, last name, email, message as defaults, plus custom fields of type short text, long text, multiple choice, checkboxes, and date with calendar/time picker). Forms are shareable via direct link and embeddable on external websites via a code snippet. When submitted, the form auto-creates a contact (Lead by default), sends a notification to the photographer's Inbox and account email, and auto-creates a project card on the pipeline board.

**L2 Requirements:** CRM-4.1.1 (Contact Types), CRM-4.1.2 (Contact Profiles), CRM-4.1.3 (Automatic Lead Conversion), CRM-4.1.4 (Contact Import), CRM-4.1.5 (Lead Capture Forms)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Contact` | Entity | Core contact entity storing personal info, `ContactType`, and navigation to `Projects`. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `ContactType` | Enum | `Lead`, `Client`, `Other`. |
| `LeadCaptureForm` | Entity | Form definition with `Name`, `Description`, `DefaultContactType`, `Slug` (shareable link), `EmbedCode`, and `IsActive`. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `LeadCaptureFormField` | Entity | Custom field on a form: `Label`, `FieldType` (QuestionType), `IsRequired`, `SortOrder`, `Options` (JSON for choice fields). |
| `LeadCaptureFormSubmission` | Entity | A form submission linking to auto-created `Contact`. Stores `ResponseData` (JSON), submitter info, and `Message`. |
| `QuestionType` | Enum | `ShortText`, `LongText`, `MultipleChoice`, `Checkboxes`, `Date`, `Email`. |
| `ContactConvertedEvent` | Domain Event | Raised when a Lead is converted to Client (automatic or manual). Carries `ContactId` and `ConversionReason`. |
| `FormSubmittedEvent` | Domain Event | Raised when a lead capture form is submitted. Carries `FormId`, `SubmissionId`, `ContactId`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateContactCommand` | Command | Creates a new contact. Validates required fields and email uniqueness per photographer. |
| `UpdateContactCommand` | Command | Updates contact details. Allows manual type change. |
| `DeleteContactCommand` | Command | Soft-deletes a contact. |
| `GetContactQuery` | Query | Returns a single contact with all profile data. |
| `GetContactProfileQuery` | Query | Returns the full contact profile: details, documents, email history, bookings, galleries, payments. |
| `ListContactsQuery` | Query | Returns paginated, filterable, searchable contact list. Supports filtering by `ContactType`. |
| `ChangeContactTypeCommand` | Command | Manually changes a contact's type (CRM-4.1.1). |
| `ConvertLeadToClientCommand` | Command | Automatically triggered on booking/payment. Changes type to Client, raises `ContactConvertedEvent`. Manual override available. |
| `ImportContactsCsvCommand` | Command | Accepts a CSV file, column mapping configuration, and duplicate handling strategy (merge/skip). Returns import results. |
| `ValidateContactImportQuery` | Query | Previews the import: shows mapped columns, detected duplicates, and validation errors before committing. |
| `CreateLeadCaptureFormCommand` | Command | Creates a new form with fields and generates a slug and embed code. |
| `UpdateLeadCaptureFormCommand` | Command | Updates form definition and fields. |
| `DeleteLeadCaptureFormCommand` | Command | Soft-deletes a form. |
| `GetLeadCaptureFormQuery` | Query | Returns form definition for editing. |
| `ListLeadCaptureFormsQuery` | Query | Returns all forms for the photographer. |
| `SubmitLeadCaptureFormCommand` | Command | Public-facing. Validates required fields, creates contact, creates submission, raises `FormSubmittedEvent`. |
| `IContactImportService` | Interface | Parses CSV, maps columns, detects duplicates. Methods: `ParseCsvAsync`, `MapColumnsAsync`, `DetectDuplicatesAsync`. |
| `INotificationDispatcher` | Interface | Sends in-app and email notifications on form submission. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateContactHandler` | Handler | Validates email uniqueness within photographer scope, creates `Contact` entity. |
| `ImportContactsCsvHandler` | Handler | Uses `IContactImportService` to parse CSV, detect duplicates, and bulk-create/merge contacts. |
| `SubmitLeadCaptureFormHandler` | Handler | Validates form fields, creates `Contact` (or finds existing by email), creates `LeadCaptureFormSubmission`, auto-creates `Project` in first pipeline stage, dispatches notifications via `INotificationDispatcher` and `IEmailService`. |
| `ConvertLeadToClientHandler` | Handler | Changes `ContactType` to `Client`, raises `ContactConvertedEvent`. Called by booking/payment event handlers. |
| `ContactImportService` | Service | Implements `IContactImportService`. Uses CsvHelper for parsing. Column mapping heuristics match common header names to contact fields. |
| `FormSubmittedEventHandler` | Event Handler | Listens for `FormSubmittedEvent`. Creates Inbox notification and sends email to photographer. |
| `ContactConfiguration` | EF Config | Configures unique constraint on `(PhotographerId, Email)`. Indexes on `ContactType`, `LastName`. |
| `LeadCaptureFormConfiguration` | EF Config | Configures unique constraint on `(PhotographerId, Slug)`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ContactsController` | Controller | CRUD endpoints: `GET /api/contacts` (list), `GET /api/contacts/{id}` (detail), `GET /api/contacts/{id}/profile` (full profile), `POST /api/contacts`, `PUT /api/contacts/{id}`, `DELETE /api/contacts/{id}`, `PUT /api/contacts/{id}/type` (change type). All require `[Authorize]`. |
| `ContactImportController` | Controller | Endpoints: `POST /api/contacts/import/preview` (validate/preview), `POST /api/contacts/import` (execute import). Require `[Authorize]`. |
| `LeadCaptureFormsController` | Controller | CRUD endpoints: `GET /api/forms` (list), `GET /api/forms/{id}`, `POST /api/forms`, `PUT /api/forms/{id}`, `DELETE /api/forms/{id}`. All require `[Authorize]`. |
| `FormSubmissionController` | Controller | Public endpoint: `POST /api/forms/{slug}/submit` -- processes form submission without authentication. |

---

## Class Diagrams

### Domain Layer -- Contact & CRM Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Contact {
  +Id : Guid
  +PhotographerId : Guid
  +FirstName : string
  +LastName : string
  +Email : string
  +Phone : string?
  +Address : string?
  +City : string?
  +Province : string?
  +PostalCode : string?
  +Country : string?
  +Notes : string?
  +ContactType : ContactType
}

enum ContactType {
  Lead
  Client
  Other
}

class Project {
  +Id : Guid
  +PhotographerId : Guid
  +ContactId : Guid?
  +StageId : Guid
  +Name : string
  +ProjectType : string?
  +SortOrder : int
}

Contact "1" --> "*" Project : Projects
Contact ..> ContactType
@enduml
```

### Domain Layer -- Lead Capture Form Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class LeadCaptureForm {
  +Id : Guid
  +PhotographerId : Guid
  +Name : string
  +Description : string?
  +DefaultContactType : ContactType
  +Slug : string
  +EmbedCode : string?
  +IsActive : bool
}

class LeadCaptureFormField {
  +Id : Guid
  +FormId : Guid
  +Label : string
  +FieldType : QuestionType
  +IsRequired : bool
  +SortOrder : int
  +Options : string?
}

class LeadCaptureFormSubmission {
  +Id : Guid
  +FormId : Guid
  +ContactId : Guid?
  +ResponseData : string
  +SubmitterEmail : string?
  +SubmitterFirstName : string?
  +SubmitterLastName : string?
  +Message : string?
}

enum QuestionType {
  ShortText
  LongText
  MultipleChoice
  Checkboxes
  Date
  Email
}

LeadCaptureForm "1" --> "*" LeadCaptureFormField : Fields
LeadCaptureForm "1" --> "*" LeadCaptureFormSubmission : Submissions
LeadCaptureFormSubmission --> "0..1" Contact : Contact
LeadCaptureFormField ..> QuestionType
@enduml
```

### Application Layer -- Contact Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Contacts.Commands" {
  class CreateContactCommand <<record>> {
    +FirstName : string
    +LastName : string
    +Email : string
    +Phone : string?
    +Address : string?
    +Notes : string?
    +ContactType : ContactType
  }

  class UpdateContactCommand <<record>> {
    +ContactId : Guid
    +FirstName : string
    +LastName : string
    +Email : string
    +Phone : string?
    +Notes : string?
  }

  class ChangeContactTypeCommand <<record>> {
    +ContactId : Guid
    +NewType : ContactType
  }

  class ConvertLeadToClientCommand <<record>> {
    +ContactId : Guid
    +Reason : string
  }

  class DeleteContactCommand <<record>> {
    +ContactId : Guid
  }
}

package "Features.Contacts.Queries" {
  class ListContactsQuery <<record>> {
    +TypeFilter : ContactType?
    +SearchTerm : string?
    +Page : int
    +PageSize : int
  }

  class GetContactProfileQuery <<record>> {
    +ContactId : Guid
  }

  class ContactProfileDto <<record>> {
    +Contact : ContactDto
    +Documents : List<DocumentSummaryDto>
    +EmailHistory : List<EmailSummaryDto>
    +Bookings : List<BookingSummaryDto>
    +Galleries : List<GallerySummaryDto>
    +Payments : List<PaymentSummaryDto>
  }
}

interface IContactImportService {
  +ParseCsvAsync() : ImportPreview
  +DetectDuplicatesAsync() : List<Duplicate>
}

@enduml
```

### Application Layer -- Import & Form Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.ContactImport" {
  class ImportContactsCsvCommand <<record>> {
    +CsvFile : Stream
    +ColumnMapping : Dictionary<string, string>
    +DuplicateStrategy : DuplicateStrategy
  }

  class ValidateContactImportQuery <<record>> {
    +CsvFile : Stream
  }

  class ImportResultDto <<record>> {
    +Created : int
    +Merged : int
    +Skipped : int
    +Errors : List<string>
  }

  enum DuplicateStrategy {
    Merge
    Skip
  }
}

package "Features.LeadCaptureForms.Commands" {
  class CreateLeadCaptureFormCommand <<record>> {
    +Name : string
    +Description : string?
    +Fields : List<FormFieldDto>
  }

  class SubmitLeadCaptureFormCommand <<record>> {
    +FormSlug : string
    +Responses : Dictionary<Guid, string>
    +FirstName : string
    +LastName : string
    +Email : string
    +Message : string?
  }
}

interface INotificationDispatcher {
  +DispatchAsync(notification) : Task
}

interface IEmailService {
  +SendAsync() : Task
  +SendTemplatedAsync() : Task
}

SubmitLeadCaptureFormCommand ..> INotificationDispatcher : notifies
SubmitLeadCaptureFormCommand ..> IEmailService : emails photographer
@enduml
```

### API Layer -- Contact & Form Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ContactsController <<ApiController>> {
  -_mediator : IMediator
  +List(query) : IActionResult
  +GetById(id) : IActionResult
  +GetProfile(id) : IActionResult
  +Create(cmd) : IActionResult
  +Update(id, cmd) : IActionResult
  +Delete(id) : IActionResult
  +ChangeType(id, cmd) : IActionResult
}

class ContactImportController <<ApiController>> {
  -_mediator : IMediator
  +Preview(csvFile) : IActionResult
  +Import(cmd) : IActionResult
}

class LeadCaptureFormsController <<ApiController>> {
  -_mediator : IMediator
  +List() : IActionResult
  +GetById(id) : IActionResult
  +Create(cmd) : IActionResult
  +Update(id, cmd) : IActionResult
  +Delete(id) : IActionResult
}

class FormSubmissionController <<ApiController>> {
  -_mediator : IMediator
  +Submit(slug, cmd) : IActionResult
}

note right of FormSubmissionController
  Public endpoint.
  No [Authorize] required.
  Anti-spam: rate limiting + honeypot.
end note

ContactsController --> "IMediator" : sends commands/queries
ContactImportController --> "IMediator" : sends commands/queries
LeadCaptureFormsController --> "IMediator" : sends commands/queries
FormSubmissionController --> "IMediator" : sends commands
@enduml
```

---

## Sequence Diagrams

### Create Contact

```plantuml
@startuml
actor Photographer as P
participant "ContactsController" as CC
participant "MediatR" as M
participant "CreateContactHandler" as CH
participant "ApplicationDbContext" as DB

P -> CC : POST /api/contacts\n{firstName, lastName, email,\nphone, contactType: "Lead"}
CC -> M : Send(CreateContactCommand)
M -> CH : Handle()
CH -> DB : Check email uniqueness\nWHERE PhotographerId AND Email
DB --> CH : no duplicate
CH -> DB : Insert Contact
DB --> CH : saved
CH --> M : ContactDto
M --> CC : result
CC --> P : 201 Created {id, firstName, lastName, email}
@enduml
```

### View Contact Profile

```plantuml
@startuml
actor Photographer as P
participant "ContactsController" as CC
participant "MediatR" as M
participant "GetContactProfileHandler" as PH
participant "ApplicationDbContext" as DB

P -> CC : GET /api/contacts/{id}/profile
CC -> M : Send(GetContactProfileQuery)
M -> PH : Handle()
PH -> DB : Load Contact with Id
DB --> PH : contact
PH -> DB : Query Contracts\nWHERE ContactId = {id}
DB --> PH : contracts
PH -> DB : Query Invoices\nWHERE ContactId = {id}
DB --> PH : invoices
PH -> DB : Query Questionnaires\nWHERE ContactId = {id}
DB --> PH : questionnaires
PH -> DB : Query EmailMessages\nWHERE ContactId = {id}
DB --> PH : emails
PH -> DB : Query BookingRecords\nWHERE ContactId = {id}
DB --> PH : bookings
PH -> DB : Query PaymentRecords\nWHERE ContactId = {id}
DB --> PH : payments
PH -> PH : Assemble ContactProfileDto
PH --> M : ContactProfileDto
M --> CC : result
CC --> P : 200 OK {contact, documents,\nemailHistory, bookings, payments}
@enduml
```

### Automatic Lead-to-Client Conversion

```plantuml
@startuml
participant "BookingConfirmedEventHandler" as BEH
participant "MediatR" as M
participant "ConvertLeadToClientHandler" as CLH
participant "ApplicationDbContext" as DB
participant "INotificationDispatcher" as ND

BEH -> M : Send(ConvertLeadToClientCommand\n{contactId, reason: "Booking confirmed"})
M -> CLH : Handle()
CLH -> DB : Load Contact
DB --> CLH : contact (Type = Lead)
CLH -> CLH : contact.ContactType = Client
CLH -> DB : Update Contact
DB --> CLH : saved
CLH -> CLH : Raise ContactConvertedEvent
CLH -> ND : Dispatch("Lead converted to Client")
ND --> CLH : sent
CLH --> M : success
@enduml
```

### CSV Contact Import

```plantuml
@startuml
actor Photographer as P
participant "ContactImportController" as IC
participant "MediatR" as M
participant "ImportContactsCsvHandler" as IH
participant "IContactImportService" as CS
participant "ApplicationDbContext" as DB

P -> IC : POST /api/contacts/import/preview\n(CSV file upload)
IC -> M : Send(ValidateContactImportQuery)
M -> CS : ParseCsvAsync(stream)
CS --> M : ImportPreview {rows, mappedColumns,\nduplicates, errors}
M --> IC : preview
IC --> P : 200 OK {preview with detected duplicates}

P -> IC : POST /api/contacts/import\n{columnMapping, duplicateStrategy: "Merge"}
IC -> M : Send(ImportContactsCsvCommand)
M -> IH : Handle()
IH -> CS : ParseCsvAsync(stream)
CS --> IH : parsed rows

loop for each row
  IH -> DB : Check existing by email
  DB --> IH : existing or null
  alt duplicate found AND strategy = Merge
    IH -> IH : Merge fields into existing contact
    IH -> DB : Update Contact
  else duplicate found AND strategy = Skip
    IH -> IH : Skip row, increment counter
  else no duplicate
    IH -> DB : Insert Contact
  end
end

IH -> DB : SaveChanges
DB --> IH : saved
IH --> M : ImportResultDto {created: 45, merged: 3, skipped: 2}
M --> IC : result
IC --> P : 200 OK {created, merged, skipped, errors}
@enduml
```

### Lead Capture Form Submission

```plantuml
@startuml
actor Visitor as V
participant "FormSubmissionController" as FSC
participant "MediatR" as M
participant "SubmitLeadCaptureFormHandler" as SH
participant "ApplicationDbContext" as DB
participant "INotificationDispatcher" as ND
participant "IEmailService" as ES

V -> FSC : POST /api/forms/{slug}/submit\n{firstName, lastName, email,\nmessage, responses: {...}}
FSC -> M : Send(SubmitLeadCaptureFormCommand)
M -> SH : Handle()
SH -> DB : Load LeadCaptureForm by slug\n(with Fields)
DB --> SH : form
SH -> SH : Validate required fields
SH -> DB : Check existing Contact by email
DB --> SH : null (no existing)
SH -> DB : Create Contact\n(Type = form.DefaultContactType)
DB --> SH : contact
SH -> DB : Create LeadCaptureFormSubmission\n{formId, contactId, responseData}
DB --> SH : submission
SH -> DB : Load first ProjectStage\n(SortOrder = 0)
DB --> SH : inquiryStage
SH -> DB : Create Project\n{contactId, stageId, name}
DB --> SH : project
SH -> ND : Dispatch InboxNotification
ND --> SH : delivered
SH -> ES : SendTemplatedAsync(photographerEmail,\n"new_form_submission", variables)
ES --> SH : sent
SH --> M : SubmissionResultDto
M --> FSC : result
FSC --> V : 201 Created {message: "Submitted"}
@enduml
```
