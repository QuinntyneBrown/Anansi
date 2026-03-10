# F27 - Invoicing

## Overview

This feature provides photographers with a comprehensive invoicing system for billing clients. The invoice builder allows creating line-item invoices with names, descriptions, quantities, and unit prices, with auto-calculated subtotals, tax, discounts, and totals. Invoices support custom branding through header images and color palettes, plus custom header fields (VAT, ABN, business ID) configurable in Settings > Preferences.

Payment schedules enable splitting an invoice into multiple installments with specific due dates, each independently payable and individually status-tracked. The deposit/retainer flow lets photographers set a deposit amount with the remaining balance as a separate installment, and invoices auto-generated from bookings support this split natively. Tax support applies configurable percentage-based rates displayed as a separate line, flowing into financial reports. Gratuity/tips present clients with 5%, 10%, 15%, or custom tip options at payment time, tracked separately in reports.

Automated payment reminders send emails before, on, and after due dates at configurable intervals, with confirmation emails on successful payment (available on upgraded plans). Invoice templates let photographers save configurations with pre-filled line items and settings for reuse. Invoices can also be auto-generated as drafts from accepted quotes (cross-feature with F28), with all items, totals, and due dates carried over and editable before sending.

**L2 Requirements:** INV-4.5.1 (Invoice Builder), INV-4.5.2 (Payment Schedules), INV-4.5.3 (Deposit/Retainer), INV-4.5.4 (Payment Reminders), INV-4.5.5 (Tax Support), INV-4.5.6 (Gratuity/Tips), INV-4.5.7 (Invoice Templates)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Invoice` | Entity | Invoice with line items, tax, tips, payment schedules, branding, reminders, and template support. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `InvoiceLineItem` | Entity | Individual billable item with name, description, quantity, unit price, and calculated total. |
| `InvoicePaymentSchedule` | Entity | Single installment within a payment schedule: label, amount, due date, paid status, and Stripe payment intent reference. |
| `InvoiceStatus` | Enum | `Draft`, `Sent`, `Viewed`, `PartiallyPaid`, `Paid`, `Overdue`, `Cancelled`, `Refunded`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateInvoiceCommand` | Command | Creates a new invoice with title, line items, contact/project linkage, tax rate, and optional deposit configuration. Auto-generates invoice number. Returns invoice ID. |
| `UpdateInvoiceCommand` | Command | Updates line items, tax rate, branding, notes, custom header fields, tip settings, and reminder configuration on a draft invoice. |
| `DeleteInvoiceCommand` | Command | Soft-deletes an invoice. |
| `SendInvoiceCommand` | Command | Transitions to `Sent`, sets `SentAt`, sends payment link to client via email. |
| `RecalculateInvoiceTotalsCommand` | Command | Recalculates subtotal, tax, and total from line items. Called internally after line item changes. |
| `ConfigurePaymentScheduleCommand` | Command | Sets up multiple installments with amounts and due dates. Validates total matches invoice total. |
| `ConfigureDepositCommand` | Command | Sets deposit amount and creates two installments: deposit (due immediately) and balance (due on specified date). |
| `RecordPaymentCommand` | Command | Records a payment against a specific installment. Updates installment status, invoice `PaidCents`, and transitions invoice status (`PartiallyPaid` or `Paid`). |
| `RecordTipCommand` | Command | Records a tip amount against an invoice payment. |
| `ViewInvoiceQuery` | Query | Returns full invoice detail. Transitions status to `Viewed` if currently `Sent`. |
| `ListInvoicesQuery` | Query | Paginated list filterable by status, contact, date range. |
| `GetInvoiceByTokenQuery` | Query | Client-facing invoice view via secure token (no auth required). |
| `GetInvoicePaymentSummaryQuery` | Query | Returns payment breakdown: installments, paid amounts, remaining balance. |
| `SaveInvoiceTemplateCommand` | Command | Saves invoice configuration as a reusable template. |
| `ListInvoiceTemplatesQuery` | Query | Lists all invoice templates for the photographer. |
| `ApplyInvoiceTemplateCommand` | Command | Creates a new invoice from a template with pre-filled line items and settings. |
| `CancelInvoiceCommand` | Command | Cancels an invoice, setting status to `Cancelled`. |
| `ProcessOverdueInvoicesCommand` | Command | Background job: finds invoices with past-due installments, transitions to `Overdue`. |
| `SendPaymentRemindersCommand` | Command | Background job: sends reminder emails for upcoming/overdue installments. |
| `GenerateInvoiceFromQuoteCommand` | Command | Creates a draft invoice from an accepted quote's items and total (cross-feature with F28). |
| `InvoiceDto` | DTO | Invoice summary for list views. |
| `InvoiceDetailDto` | DTO | Full invoice detail with line items, schedules, and payment history. |
| `InvoiceTemplateDto` | DTO | Template summary. |
| `PaymentScheduleDto` | DTO | Installment detail with status. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateInvoiceCommandHandler` | Handler | Generates sequential invoice number, creates `Invoice` + `InvoiceLineItem` entities, calculates totals, persists. |
| `SendInvoiceCommandHandler` | Handler | Generates client access token, sends email with payment link, updates status. |
| `RecordPaymentCommandHandler` | Handler | Validates installment, marks as paid, updates `PaidCents`, transitions invoice status. Integrates with `IPaymentService` for Stripe confirmation. |
| `ConfigurePaymentScheduleHandler` | Handler | Validates installment amounts sum to invoice total, creates/replaces `InvoicePaymentSchedule` records. |
| `ProcessOverdueInvoicesHandler` | Handler | Queries installments past due date and unpaid, updates parent invoice status. |
| `SendPaymentRemindersHandler` | Handler | Checks plan eligibility, queries installments needing reminders, sends emails. |
| `InvoiceOverdueJob` | Background Job | Recurring job dispatching `ProcessOverdueInvoicesCommand`. |
| `PaymentReminderJob` | Background Job | Recurring job dispatching `SendPaymentRemindersCommand`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `InvoicesController` | Controller | Authenticated endpoints: `POST` (create), `PUT /{id}` (update), `DELETE /{id}`, `POST /{id}/send`, `POST /{id}/schedule` (configure payment schedule), `POST /{id}/deposit` (configure deposit), `POST /{id}/cancel`, `GET` (list), `GET /{id}` (detail), `GET /{id}/payments` (payment summary). |
| `InvoiceTemplatesController` | Controller | Authenticated endpoints: `POST` (save template), `GET` (list templates), `POST /{id}/apply` (create from template). |
| `InvoicePublicController` | Controller | Anonymous endpoints: `GET /invoices/view/{token}` (client view), `POST /invoices/pay/{token}` (client payment with tip). |

---

## Class Diagrams

### Domain Layer -- Invoice Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Invoice {
  +Id : Guid
  +PhotographerId : Guid
  +ContactId : Guid?
  +ProjectId : Guid?
  +InvoiceNumber : string
  +Title : string
  +Notes : string?
  +HeaderImageUrl : string?
  +BrandColorHex : string?
  +Status : InvoiceStatus
  +SentAt : DateTime?
  +DueDate : DateTime?
  +SubtotalCents : long
  +TaxRatePercent : decimal
  +TaxAmountCents : long
  +DiscountCents : long
  +TotalCents : long
  +PaidCents : long
  +TipsEnabled : bool
  +TipAmountCents : long
  +DepositAmountCents : long?
  +AutoRemindersEnabled : bool
  +ReminderIntervalDays : int?
  +LastReminderSentAt : DateTime?
  +IsTemplate : bool
  +TemplateName : string?
  +CustomHeaderFields : string?
}

class InvoiceLineItem {
  +Id : Guid
  +InvoiceId : Guid
  +Name : string
  +Description : string?
  +Quantity : int
  +UnitPriceCents : long
  +TotalCents : long
  +SortOrder : int
}

class InvoicePaymentSchedule {
  +Id : Guid
  +InvoiceId : Guid
  +Label : string
  +AmountCents : long
  +DueDate : DateTime
  +IsPaid : bool
  +PaidAt : DateTime?
  +PaymentIntentId : string?
  +SortOrder : int
}

enum InvoiceStatus {
  Draft
  Sent
  Viewed
  PartiallyPaid
  Paid
  Overdue
  Cancelled
  Refunded
}

Invoice "1" --> "*" InvoiceLineItem : LineItems
Invoice "1" --> "*" InvoicePaymentSchedule : PaymentSchedules
Invoice --> InvoiceStatus : uses
@enduml
```

### Application Layer -- Invoice Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Invoices.Commands" {
  class CreateInvoiceCommand <<record>> {
    +Title : string
    +ContactId : Guid?
    +ProjectId : Guid?
    +Notes : string?
    +HeaderImageUrl : string?
    +BrandColorHex : string?
    +TaxRatePercent : decimal
    +TipsEnabled : bool
    +LineItems : List<LineItemInput>
  }

  class UpdateInvoiceCommand <<record>> {
    +InvoiceId : Guid
    +Title : string
    +Notes : string?
    +HeaderImageUrl : string?
    +BrandColorHex : string?
    +TaxRatePercent : decimal
    +TipsEnabled : bool
    +CustomHeaderFields : string?
    +AutoRemindersEnabled : bool
    +ReminderIntervalDays : int?
    +LineItems : List<LineItemInput>
  }

  class SendInvoiceCommand <<record>> {
    +InvoiceId : Guid
  }

  class ConfigurePaymentScheduleCommand <<record>> {
    +InvoiceId : Guid
    +Installments : List<InstallmentInput>
  }

  class ConfigureDepositCommand <<record>> {
    +InvoiceId : Guid
    +DepositAmountCents : long
    +BalanceDueDate : DateTime
  }

  class RecordPaymentCommand <<record>> {
    +InvoiceId : Guid
    +ScheduleId : Guid
    +PaymentIntentId : string?
    +AmountCents : long
  }

  class RecordTipCommand <<record>> {
    +InvoiceId : Guid
    +TipAmountCents : long
  }

  class CancelInvoiceCommand <<record>> {
    +InvoiceId : Guid
  }

  class DeleteInvoiceCommand <<record>> {
    +InvoiceId : Guid
  }
}

class LineItemInput <<record>> {
  +Name : string
  +Description : string?
  +Quantity : int
  +UnitPriceCents : long
}

class InstallmentInput <<record>> {
  +Label : string
  +AmountCents : long
  +DueDate : DateTime
}
@enduml
```

### Application Layer -- Invoice Queries & Templates

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Invoices.Queries" {
  class ViewInvoiceQuery <<record>> {
    +InvoiceId : Guid
  }

  class ListInvoicesQuery <<record>> {
    +Status : InvoiceStatus?
    +ContactId : Guid?
    +FromDate : DateTime?
    +ToDate : DateTime?
    +Page : int
    +PageSize : int
  }

  class GetInvoiceByTokenQuery <<record>> {
    +Token : string
  }

  class GetInvoicePaymentSummaryQuery <<record>> {
    +InvoiceId : Guid
  }
}

package "Features.Invoices.Templates" {
  class SaveInvoiceTemplateCommand <<record>> {
    +InvoiceId : Guid
    +TemplateName : string
  }

  class ListInvoiceTemplatesQuery <<record>>

  class ApplyInvoiceTemplateCommand <<record>> {
    +TemplateId : Guid
    +ContactId : Guid?
    +ProjectId : Guid?
  }
}

package "Features.Invoices.BackgroundJobs" {
  class ProcessOverdueInvoicesCommand <<record>>
  class SendPaymentRemindersCommand <<record>>
}

class GenerateInvoiceFromQuoteCommand <<record>> {
  +QuoteId : Guid
  +DueDate : DateTime?
}

class InvoiceDto <<record>> {
  +Id : Guid
  +InvoiceNumber : string
  +Title : string
  +Status : InvoiceStatus
  +TotalCents : long
  +PaidCents : long
  +ContactName : string?
  +DueDate : DateTime?
}

class InvoiceDetailDto <<record>> {
  +Id : Guid
  +InvoiceNumber : string
  +Title : string
  +Status : InvoiceStatus
  +LineItems : List<LineItemDto>
  +Schedules : List<PaymentScheduleDto>
  +SubtotalCents : long
  +TaxAmountCents : long
  +TotalCents : long
  +PaidCents : long
  +TipAmountCents : long
}
@enduml
```

### API Layer -- Invoice Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class InvoicesController <<ApiController>> {
  -_mediator : IMediator
  +Create(CreateInvoiceCommand) : IActionResult
  +Update(Guid, UpdateInvoiceCommand) : IActionResult
  +Delete(Guid) : IActionResult
  +Send(Guid) : IActionResult
  +ConfigureSchedule(Guid, ConfigurePaymentScheduleCommand) : IActionResult
  +ConfigureDeposit(Guid, ConfigureDepositCommand) : IActionResult
  +Cancel(Guid) : IActionResult
  +List(ListInvoicesQuery) : IActionResult
  +Get(Guid) : IActionResult
  +GetPayments(Guid) : IActionResult
}

class InvoiceTemplatesController <<ApiController>> {
  -_mediator : IMediator
  +SaveTemplate(SaveInvoiceTemplateCommand) : IActionResult
  +ListTemplates() : IActionResult
  +ApplyTemplate(Guid, ApplyInvoiceTemplateCommand) : IActionResult
}

class InvoicePublicController <<ApiController>> {
  -_mediator : IMediator
  +ViewInvoice(string token) : IActionResult
  +PayInvoice(string token, PayInvoiceRequest) : IActionResult
}

InvoicesController --> "IMediator" : sends commands/queries
InvoiceTemplatesController --> "IMediator" : sends commands/queries
InvoicePublicController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### Create Invoice with Line Items

```plantuml
@startuml
actor Photographer as P
participant "InvoicesController" as IC
participant "MediatR" as M
participant "CreateInvoiceHandler" as CH
participant "ApplicationDbContext" as DB

P -> IC : POST /api/invoices\n{title, contactId, lineItems[],\ntaxRatePercent, tipsEnabled}
IC -> M : Send(CreateInvoiceCommand)
M -> CH : Handle(command)

CH -> CH : Validate (FluentValidation)
alt validation fails
  CH --> M : Result.Failure(errors)
  M --> IC : Result.Failure
  IC --> P : 400 Bad Request
end

CH -> DB : Generate next invoice number\n(e.g., INV-2026-0001)

CH -> CH : Calculate line item totals\n(qty * unitPrice per item)
CH -> CH : Calculate subtotal\n(sum of line items)
CH -> CH : Calculate tax\n(subtotal * taxRatePercent / 100)
CH -> CH : Calculate total\n(subtotal + tax - discount)

CH -> DB : Invoices.Add(invoice)
CH -> DB : InvoiceLineItems.AddRange(items)
CH -> DB : SaveChangesAsync()
CH --> M : Result.Success(invoiceId)
M --> IC : Result.Success
IC --> P : 201 Created {invoiceId, invoiceNumber}
@enduml
```

### Configure Payment Schedule with Deposit

```plantuml
@startuml
actor Photographer as P
participant "InvoicesController" as IC
participant "MediatR" as M
participant "ConfigureDepositHandler" as DH
participant "ApplicationDbContext" as DB

P -> IC : POST /api/invoices/{id}/deposit\n{depositAmountCents,\nbalanceDueDate}
IC -> M : Send(ConfigureDepositCommand)
M -> DH : Handle(command)

DH -> DB : Load Invoice
alt invoice not in Draft status
  DH --> M : Result.Failure("Schedule only\nconfigurable on drafts")
  M --> IC : Result.Failure
  IC --> P : 400 Bad Request
end

alt deposit >= total
  DH --> M : Result.Failure("Deposit must be\nless than total")
  M --> IC : Result.Failure
  IC --> P : 400 Bad Request
end

DH -> DB : Remove existing\nPaymentSchedules for invoice

DH -> DB : Add Installment 1:\nLabel="Deposit"\nAmount=depositAmountCents\nDueDate=now

DH -> DB : Add Installment 2:\nLabel="Remaining Balance"\nAmount=total - deposit\nDueDate=balanceDueDate

DH -> DB : invoice.DepositAmountCents\n= depositAmountCents
DH -> DB : SaveChangesAsync()
DH --> M : Result.Success
M --> IC : Result.Success
IC --> P : 200 OK
@enduml
```

### Client Pays Invoice Installment

```plantuml
@startuml
actor Client as C
participant "InvoicePublicController" as IPC
participant "MediatR" as M
participant "RecordPaymentHandler" as RPH
participant "ApplicationDbContext" as DB
participant "IPaymentService" as PS
participant "IEmailService" as ES

C -> IPC : POST /api/invoices/pay/{token}\n{scheduleId, paymentMethodId,\ntipPercent}
IPC -> M : Send(RecordPaymentCommand)
M -> RPH : Handle(command)

RPH -> DB : Load Invoice with\nPaymentSchedules

alt installment already paid
  RPH --> M : Result.Failure("Already paid")
  M --> IPC : Result.Failure
  IPC --> C : 400 Bad Request
end

RPH -> PS : CreatePaymentIntentAsync(\ninstallment.AmountCents + tipCents,\ncurrency, stripeAccountId)
PS --> RPH : paymentIntentId

RPH -> DB : schedule.IsPaid = true\nschedule.PaidAt = UtcNow\nschedule.PaymentIntentId = paymentIntentId

RPH -> DB : invoice.PaidCents +=\ninstallment.AmountCents
RPH -> DB : invoice.TipAmountCents += tipCents

RPH -> RPH : Check all installments paid?
alt all paid
  RPH -> DB : invoice.Status = Paid
else some remaining
  RPH -> DB : invoice.Status = PartiallyPaid
end

RPH -> DB : SaveChangesAsync()

RPH -> ES : SendTemplatedAsync(\nclient.Email,\n"Payment Confirmation",\namountPaid, remaining)

RPH -> ES : SendTemplatedAsync(\nphotographer.Email,\n"Payment Received",\namountPaid, invoiceNumber)

RPH --> M : Result.Success
M --> IPC : Result.Success
IPC --> C : 200 OK {confirmationId}
@enduml
```

### Send Invoice to Client

```plantuml
@startuml
actor Photographer as P
participant "InvoicesController" as IC
participant "MediatR" as M
participant "SendInvoiceHandler" as SH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

P -> IC : POST /api/invoices/{id}/send
IC -> M : Send(SendInvoiceCommand)
M -> SH : Handle(command)

SH -> DB : Load Invoice with Contact\nand PaymentSchedules

alt invoice not in Draft status
  SH --> M : Result.Failure("Only drafts can be sent")
  M --> IC : Result.Failure
  IC --> P : 400 Bad Request
end

alt no payment schedule configured
  SH -> SH : Create single installment\nfor full amount with DueDate
end

SH -> SH : Generate secure payment token

SH -> DB : invoice.Status = Sent\ninvoice.SentAt = UtcNow
SH -> DB : SaveChangesAsync()

SH -> ES : SendTemplatedAsync(\nclient.Email,\n"Invoice from {businessName}",\npaymentLink, amount, dueDate)

SH --> M : Result.Success
M --> IC : Result.Success
IC --> P : 200 OK
@enduml
```

### Payment Reminder Background Job

```plantuml
@startuml
participant "PaymentReminderJob" as JOB
participant "MediatR" as M
participant "SendPaymentRemindersHandler" as SRH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

JOB -> M : Send(SendPaymentRemindersCommand)
M -> SRH : Handle(command)

SRH -> DB : Query InvoicePaymentSchedules\nWHERE IsPaid = false\nAND Invoice.AutoRemindersEnabled = true\nAND Invoice.Status IN\n  (Sent, Viewed, PartiallyPaid)

SRH -> DB : Join Photographer to verify\nplan supports reminders

loop each installment needing reminder
  SRH -> SRH : Determine reminder type:\n- "upcoming" if DueDate > UtcNow\n- "due today" if DueDate = today\n- "overdue" if DueDate < UtcNow

  SRH -> ES : SendTemplatedAsync(\nclient.Email,\nreminderType template,\namount, dueDate,\npaymentLink)

  SRH -> DB : invoice.LastReminderSentAt\n= UtcNow
end

SRH -> DB : SaveChangesAsync()
SRH --> M : Result.Success(reminderCount)
@enduml
```

### Overdue Invoice Processing

```plantuml
@startuml
participant "InvoiceOverdueJob" as JOB
participant "MediatR" as M
participant "ProcessOverdueHandler" as POH
participant "ApplicationDbContext" as DB

JOB -> M : Send(ProcessOverdueInvoicesCommand)
M -> POH : Handle(command)

POH -> DB : Query Invoices WHERE\nStatus IN (Sent, Viewed, PartiallyPaid)\nAND has unpaid schedules\nwith DueDate < UtcNow

loop each newly overdue invoice
  POH -> DB : invoice.Status = Overdue
end

POH -> DB : SaveChangesAsync()
POH --> M : Result.Success(overdueCount)
@enduml
```

### Generate Invoice from Accepted Quote

```plantuml
@startuml
participant "QuoteAcceptanceHandler" as QAH
participant "MediatR" as M
participant "GenerateInvoiceFromQuoteHandler" as GIH
participant "ApplicationDbContext" as DB

QAH -> M : Send(GenerateInvoiceFromQuoteCommand)
M -> GIH : Handle(command)

GIH -> DB : Load Quote with Items\nand Contact

GIH -> GIH : Map QuoteItems to\nInvoiceLineItems\n(name, description,\nqty, unitPrice)

GIH -> GIH : Calculate subtotal,\ntax, total from items

GIH -> DB : Generate invoice number

GIH -> DB : Invoices.Add(draftInvoice\nwith Status = Draft)
GIH -> DB : InvoiceLineItems.AddRange(items)

GIH -> DB : quote.GeneratedInvoiceId\n= newInvoice.Id
GIH -> DB : SaveChangesAsync()

GIH --> M : Result.Success(invoiceId)
@enduml
```
