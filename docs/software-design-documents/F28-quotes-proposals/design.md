# F28 - Quotes & Proposals

## Overview

This feature enables photographers to create professional quotes and proposals for prospective clients. A quote lists services and products with descriptions and prices in a clean, itemized view. Photographers build quotes by adding line items, each with a name, description, quantity, and unit price, and the system auto-calculates the total. Quotes can be linked to contacts and projects within the Studio Manager CRM.

When a client accepts a quote, the system automatically generates an invoice draft containing the accepted items, total amount, and due date. The photographer receives a notification of acceptance and can review and edit the auto-generated invoice before sending it to the client. This cross-feature integration with F27 (Invoicing) streamlines the photographer's workflow from proposal to billing.

Quote templates allow photographers to save and reuse common service configurations. Templates store service descriptions, pricing, and terms, enabling quick creation of new quotes from proven packages. Templates are particularly useful for photographers who offer standardized session types (e.g., wedding packages, portrait sessions, event coverage).

**L2 Requirements:** QOT-4.6.1 (Quote Creation), QOT-4.6.2 (Quote Acceptance), QOT-4.6.3 (Quote Templates)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Quote` | Entity | Quote/proposal with items, status lifecycle, template support, and auto-generated invoice linkage. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `QuoteItem` | Entity | Individual service/product line item with name, description, quantity, unit price, and calculated total. |
| `QuoteStatus` | Enum | `Draft`, `Sent`, `Viewed`, `Accepted`, `Declined`, `Expired`, `Cancelled`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateQuoteCommand` | Command | Creates a new quote with title, notes, items, and contact/project linkage. Auto-calculates total. Returns quote ID. |
| `UpdateQuoteCommand` | Command | Updates title, notes, and line items on a draft quote. Recalculates total. |
| `DeleteQuoteCommand` | Command | Soft-deletes a quote. |
| `SendQuoteCommand` | Command | Transitions to `Sent`, sets `SentAt`, sends client-facing link via email. |
| `AcceptQuoteCommand` | Command | Client accepts the quote. Transitions to `Accepted`, sets `AcceptedAt`, dispatches `GenerateInvoiceFromQuoteCommand`, notifies photographer. |
| `DeclineQuoteCommand` | Command | Client declines the quote. Transitions to `Declined`. |
| `CancelQuoteCommand` | Command | Photographer cancels a sent quote. |
| `ViewQuoteQuery` | Query | Returns full quote detail. Transitions to `Viewed` if currently `Sent`. |
| `ListQuotesQuery` | Query | Paginated list filterable by status and contact. |
| `GetQuoteByTokenQuery` | Query | Client-facing quote view via secure access token (no auth required). |
| `SaveQuoteTemplateCommand` | Command | Saves a quote as a reusable template (sets `IsTemplate = true`). |
| `ListQuoteTemplatesQuery` | Query | Lists all quote templates for the photographer. |
| `ApplyQuoteTemplateCommand` | Command | Creates a new quote from a template, copying items and terms. |
| `QuoteDto` | DTO | Quote summary for list views. |
| `QuoteDetailDto` | DTO | Full quote detail with items. |
| `QuoteTemplateDto` | DTO | Template summary. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateQuoteCommandHandler` | Handler | Creates `Quote` + `QuoteItem` entities, calculates total, persists. |
| `SendQuoteCommandHandler` | Handler | Generates secure client token, sends email via `IEmailService`, updates status. |
| `AcceptQuoteCommandHandler` | Handler | Validates quote is in `Sent`/`Viewed` status, transitions to `Accepted`, dispatches `GenerateInvoiceFromQuoteCommand` via MediatR, sends photographer notification. |
| `ApplyQuoteTemplateHandler` | Handler | Clones template quote and items into a new draft quote linked to specified contact/project. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `QuotesController` | Controller | Authenticated endpoints: `POST` (create), `PUT /{id}` (update), `DELETE /{id}`, `POST /{id}/send`, `POST /{id}/cancel`, `GET` (list), `GET /{id}` (detail). |
| `QuoteTemplatesController` | Controller | Authenticated endpoints: `POST` (save template), `GET` (list templates), `POST /{id}/apply` (create from template). |
| `QuotePublicController` | Controller | Anonymous endpoints: `GET /quotes/view/{token}` (client view), `POST /quotes/accept/{token}` (accept), `POST /quotes/decline/{token}` (decline). |

---

## Class Diagrams

### Domain Layer -- Quote Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Quote {
  +Id : Guid
  +PhotographerId : Guid
  +ContactId : Guid?
  +ProjectId : Guid?
  +Title : string
  +Notes : string?
  +Status : QuoteStatus
  +TotalCents : long
  +SentAt : DateTime?
  +AcceptedAt : DateTime?
  +GeneratedInvoiceId : Guid?
  +IsTemplate : bool
  +TemplateName : string?
  +IsDeleted : bool
  +DeletedAt : DateTime?
  +CreatedBy : string?
  +UpdatedBy : string?
}

class QuoteItem {
  +Id : Guid
  +QuoteId : Guid
  +Name : string
  +Description : string?
  +Quantity : int
  +UnitPriceCents : long
  +TotalCents : long
  +SortOrder : int
}

enum QuoteStatus {
  Draft
  Sent
  Viewed
  Accepted
  Declined
  Expired
  Cancelled
}

Quote "1" --> "*" QuoteItem : Items
Quote --> QuoteStatus : uses
@enduml
```

![Domain Layer -- Quote Entities](domain-layer-quote-entities.png)

### Application Layer -- Quote Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Quotes.Commands" {
  class CreateQuoteCommand <<record>> {
    +Title : string
    +Notes : string?
    +ContactId : Guid?
    +ProjectId : Guid?
    +Items : List<QuoteItemInput>
  }

  class UpdateQuoteCommand <<record>> {
    +QuoteId : Guid
    +Title : string
    +Notes : string?
    +Items : List<QuoteItemInput>
  }

  class SendQuoteCommand <<record>> {
    +QuoteId : Guid
  }

  class AcceptQuoteCommand <<record>> {
    +Token : string
  }

  class DeclineQuoteCommand <<record>> {
    +Token : string
  }

  class CancelQuoteCommand <<record>> {
    +QuoteId : Guid
  }

  class DeleteQuoteCommand <<record>> {
    +QuoteId : Guid
  }
}

package "Features.Quotes.Queries" {
  class ViewQuoteQuery <<record>> {
    +QuoteId : Guid
  }

  class ListQuotesQuery <<record>> {
    +Status : QuoteStatus?
    +ContactId : Guid?
    +Page : int
    +PageSize : int
  }

  class GetQuoteByTokenQuery <<record>> {
    +Token : string
  }
}

class QuoteItemInput <<record>> {
  +Name : string
  +Description : string?
  +Quantity : int
  +UnitPriceCents : long
}

interface IEmailService {
  +SendAsync()
  +SendTemplatedAsync()
}

SendQuoteCommand ..> IEmailService : uses
@enduml
```

![Application Layer -- Quote Commands & Queries](application-layer-quote-commands-queries.png)

### Application Layer -- Quote Templates

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Quotes.Templates" {
  class SaveQuoteTemplateCommand <<record>> {
    +QuoteId : Guid
    +TemplateName : string
  }

  class ListQuoteTemplatesQuery <<record>>

  class ApplyQuoteTemplateCommand <<record>> {
    +TemplateId : Guid
    +ContactId : Guid?
    +ProjectId : Guid?
  }
}

class QuoteDto <<record>> {
  +Id : Guid
  +Title : string
  +Status : QuoteStatus
  +TotalCents : long
  +ContactName : string?
  +SentAt : DateTime?
  +AcceptedAt : DateTime?
}

class QuoteDetailDto <<record>> {
  +Id : Guid
  +Title : string
  +Notes : string?
  +Status : QuoteStatus
  +TotalCents : long
  +Items : List<QuoteItemDto>
  +GeneratedInvoiceId : Guid?
  +ContactName : string?
}

class QuoteTemplateDto <<record>> {
  +Id : Guid
  +TemplateName : string
  +ItemCount : int
  +TotalCents : long
  +CreatedAt : DateTime
}
@enduml
```

![Application Layer -- Quote Templates](application-layer-quote-templates.png)

### API Layer -- Quote Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class QuotesController <<ApiController>> {
  -_mediator : IMediator
  +Create(CreateQuoteCommand) : IActionResult
  +Update(Guid, UpdateQuoteCommand) : IActionResult
  +Delete(Guid) : IActionResult
  +Send(Guid) : IActionResult
  +Cancel(Guid) : IActionResult
  +List(ListQuotesQuery) : IActionResult
  +Get(Guid) : IActionResult
}

class QuoteTemplatesController <<ApiController>> {
  -_mediator : IMediator
  +SaveTemplate(SaveQuoteTemplateCommand) : IActionResult
  +ListTemplates() : IActionResult
  +ApplyTemplate(Guid, ApplyQuoteTemplateCommand) : IActionResult
}

class QuotePublicController <<ApiController>> {
  -_mediator : IMediator
  +ViewQuote(string token) : IActionResult
  +AcceptQuote(string token) : IActionResult
  +DeclineQuote(string token) : IActionResult
}

QuotesController --> "IMediator" : sends commands/queries
QuoteTemplatesController --> "IMediator" : sends commands/queries
QuotePublicController --> "IMediator" : sends commands/queries
@enduml
```

![API Layer -- Quote Controllers](api-layer-quote-controllers.png)

---

## Sequence Diagrams

### Create Quote

```plantuml
@startuml
actor Photographer as P
participant "QuotesController" as QC
participant "MediatR" as M
participant "CreateQuoteHandler" as CH
participant "ApplicationDbContext" as DB

P -> QC : POST /api/quotes\n{title, notes, contactId, items[]}
QC -> M : Send(CreateQuoteCommand)
M -> CH : Handle(command)

CH -> CH : Validate (FluentValidation)\n- At least one item required\n- Positive quantities and prices

alt validation fails
  CH --> M : Result.Failure(errors)
  M --> QC : Result.Failure
  QC --> P : 400 Bad Request
end

CH -> CH : Calculate item totals\n(qty * unitPrice per item)
CH -> CH : Calculate quote total\n(sum of all item totals)

CH -> DB : Quotes.Add(quote)
CH -> DB : QuoteItems.AddRange(items)
CH -> DB : SaveChangesAsync()
CH --> M : Result.Success(quoteId)
M --> QC : Result.Success
QC --> P : 201 Created {quoteId}
@enduml
```

![Create Quote](create-quote.png)

### Send Quote to Client

```plantuml
@startuml
actor Photographer as P
participant "QuotesController" as QC
participant "MediatR" as M
participant "SendQuoteHandler" as SH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

P -> QC : POST /api/quotes/{id}/send
QC -> M : Send(SendQuoteCommand)
M -> SH : Handle(command)

SH -> DB : Load Quote with Contact

alt quote not in Draft status
  SH --> M : Result.Failure("Only drafts can be sent")
  M --> QC : Result.Failure
  QC --> P : 400 Bad Request
end

SH -> SH : Generate secure client\naccess token

SH -> DB : quote.Status = Sent\nquote.SentAt = UtcNow
SH -> DB : SaveChangesAsync()

SH -> ES : SendTemplatedAsync(\nclient.Email,\n"Quote from {businessName}",\nquoteViewLink, totalAmount)

SH --> M : Result.Success
M --> QC : Result.Success
QC --> P : 200 OK
@enduml
```

![Send Quote to Client](send-quote-to-client.png)

### Client Accepts Quote (Auto-generates Invoice)

```plantuml
@startuml
actor Client as C
participant "QuotePublicController" as QPC
participant "MediatR" as M
participant "AcceptQuoteHandler" as AH
participant "ApplicationDbContext" as DB
participant "GenerateInvoiceFromQuoteHandler" as GIH
participant "IEmailService" as ES

C -> QPC : POST /api/quotes/accept/{token}
QPC -> M : Send(AcceptQuoteCommand)
M -> AH : Handle(command)

AH -> DB : Load Quote by access token\nwith Items and Contact

alt quote not in Sent/Viewed status
  AH --> M : Result.Failure("Quote cannot be accepted")
  M --> QPC : Result.Failure
  QPC --> C : 400 Bad Request
end

AH -> DB : quote.Status = Accepted\nquote.AcceptedAt = UtcNow
AH -> DB : SaveChangesAsync()

AH -> M : Send(GenerateInvoiceFromQuoteCommand)
M -> GIH : Handle(command)

GIH -> GIH : Map QuoteItems\nto InvoiceLineItems
GIH -> GIH : Calculate subtotal, total
GIH -> DB : Generate invoice number
GIH -> DB : Invoices.Add(draftInvoice)
GIH -> DB : InvoiceLineItems.AddRange(items)
GIH -> DB : quote.GeneratedInvoiceId\n= newInvoice.Id
GIH -> DB : SaveChangesAsync()
GIH --> M : Result.Success(invoiceId)

AH -> ES : SendTemplatedAsync(\nphotographer.Email,\n"Quote Accepted by {clientName}",\nquoteTitle, invoiceLink)

AH --> M : Result.Success
M --> QPC : Result.Success
QPC --> C : 200 OK "Quote accepted.\nYou will receive an invoice shortly."
@enduml
```

![Client Accepts Quote (Auto-generates Invoice)](client-accepts-quote-auto-generates-invoice.png)

### Client Declines Quote

```plantuml
@startuml
actor Client as C
participant "QuotePublicController" as QPC
participant "MediatR" as M
participant "DeclineQuoteHandler" as DH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

C -> QPC : POST /api/quotes/decline/{token}
QPC -> M : Send(DeclineQuoteCommand)
M -> DH : Handle(command)

DH -> DB : Load Quote by access token

alt quote not in Sent/Viewed status
  DH --> M : Result.Failure("Quote cannot be declined")
  M --> QPC : Result.Failure
  QPC --> C : 400 Bad Request
end

DH -> DB : quote.Status = Declined
DH -> DB : SaveChangesAsync()

DH -> ES : SendTemplatedAsync(\nphotographer.Email,\n"Quote Declined",\nquoteTitle, clientName)

DH --> M : Result.Success
M --> QPC : Result.Success
QPC --> C : 200 OK
@enduml
```

![Client Declines Quote](client-declines-quote.png)

### Apply Quote Template

```plantuml
@startuml
actor Photographer as P
participant "QuoteTemplatesController" as QTC
participant "MediatR" as M
participant "ApplyQuoteTemplateHandler" as ATH
participant "ApplicationDbContext" as DB

P -> QTC : POST /api/quote-templates/{id}/apply\n{contactId, projectId}
QTC -> M : Send(ApplyQuoteTemplateCommand)
M -> ATH : Handle(command)

ATH -> DB : Load template Quote\nwith Items (IsTemplate = true)

alt template not found
  ATH --> M : Result.Failure("Template not found")
  M --> QTC : Result.Failure
  QTC --> P : 404 Not Found
end

ATH -> ATH : Clone quote entity\nfrom template\n(new Id, Status = Draft,\nassign contactId/projectId)

ATH -> ATH : Clone all QuoteItems\nwith new IDs

ATH -> DB : Quotes.Add(newQuote)
ATH -> DB : QuoteItems.AddRange(items)
ATH -> DB : SaveChangesAsync()

ATH --> M : Result.Success(newQuoteId)
M --> QTC : Result.Success
QTC --> P : 201 Created {quoteId}
@enduml
```

![Apply Quote Template](apply-quote-template.png)
