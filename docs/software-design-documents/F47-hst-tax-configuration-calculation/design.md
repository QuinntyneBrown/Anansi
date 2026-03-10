# F47 - HST Tax Configuration & Calculation

## Overview

This feature introduces Ontario Harmonized Sales Tax (HST) support tailored for Canadian photographers operating on the Anansi platform. Rather than the generic per-region tax rate configuration in F15 (Store Checkout), this feature provides a dedicated tax profile with HST-specific fields: the HST rate (defaulting to 13%), the CRA Business Number (HST registration number), and a registration status that reflects the photographer's GST/HST obligations (`NotRegistered`, `Voluntary`, `Mandatory`). The tax profile is a single record per photographer, managed through a dedicated settings endpoint.

When a photographer creates an invoice, the system automatically calculates HST on each taxable line item. The HST amount is computed as the sum of all taxable line item totals multiplied by the configured HST rate, and is displayed as a separate line on the invoice. Line items can be individually marked as tax-exempt (`isTaxExempt = true`), in which case they are excluded from the HST calculation. This ensures that services like consultation fees or digital-only deliverables can be billed without tax when appropriate.

The HST calculation also carries through from quotes to invoices. When a client accepts a quote (F28) and the system auto-generates an invoice draft via `GenerateInvoiceFromQuoteCommand`, the HST rate and tax-exempt flags from the quote items are preserved on the generated invoice. This ensures tax consistency from proposal through billing without requiring the photographer to reconfigure tax settings on the generated invoice.

**L2 Requirements:** TAX-21.1.1 (Tax Profile Configuration), TAX-21.1.2 (Tax Profile Retrieval), TAX-21.2.1 (HST Calculation on Invoices)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `TaxProfile` | Entity | Photographer's HST configuration: `HstRate` (decimal, default 13.0), `HstRegistrationNumber` (string, CRA Business Number), `RegistrationStatus`. One record per photographer. Implements `ITenantEntity`, `IAuditableEntity`. |
| `HstRegistrationStatus` | Enum | `NotRegistered`, `Voluntary`, `Mandatory`. Determines the photographer's GST/HST registration posture with CRA. |
| `InvoiceLineItem` | Entity (existing, extended) | Extended with `IsTaxExempt` (bool, default `false`). When `true`, the line item is excluded from HST calculation. |
| `QuoteItem` | Entity (existing, extended) | Extended with `IsTaxExempt` (bool, default `false`). Carries through to generated invoice line items. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `UpdateTaxProfileCommand` | Command | Upserts the photographer's `TaxProfile`. Accepts `HstRate`, `HstRegistrationNumber`, `RegistrationStatus`. Validates HST rate is between 0-100, registration number format is valid BN (9 digits + 2 letters + 4 digits). Returns 200 with updated profile (TAX-21.1.1). |
| `GetTaxProfileQuery` | Query | Returns the photographer's `TaxProfile` with all fields. If no profile exists, returns defaults (13%, no registration number, `NotRegistered`) (TAX-21.1.2). |
| `CreateInvoiceCommand` | Command (existing, extended) | Extended to load the photographer's `TaxProfile` when calculating tax. The `TaxRatePercent` on the invoice is populated from `TaxProfile.HstRate`. Tax calculation sums only non-exempt line items before applying the rate (TAX-21.2.1). |
| `RecalculateInvoiceTotalsCommand` | Command (existing, extended) | Updated to respect `IsTaxExempt` on line items. `TaxAmountCents = sum(taxable items' TotalCents) * HstRate / 100`. |
| `GenerateInvoiceFromQuoteCommand` | Command (existing, extended) | Extended to carry `IsTaxExempt` from `QuoteItem` to `InvoiceLineItem` during invoice generation from accepted quotes. |
| `TaxProfileDto` | DTO | Read model: `HstRate`, `HstRegistrationNumber`, `RegistrationStatus`. |
| `TaxProfileValidator` | Validator | FluentValidation: HST rate 0-100 range, optional BN format validation (regex for CRA Business Number format). |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `UpdateTaxProfileHandler` | Handler | Loads or creates `TaxProfile` for the photographer. Validates and persists HST rate, registration number, and status. |
| `GetTaxProfileHandler` | Handler | Queries `TaxProfile` by `PhotographerId`. Returns default values if no record exists. |
| `CreateInvoiceCommandHandler` | Handler (existing, extended) | After building line items, loads `TaxProfile`, filters out tax-exempt items, calculates `TaxAmountCents = sum(taxableItemTotals) * hstRate / 100`, sets `TaxRatePercent` from profile. |
| `GenerateInvoiceFromQuoteHandler` | Handler (existing, extended) | Maps `QuoteItem.IsTaxExempt` to `InvoiceLineItem.IsTaxExempt` during the quote-to-invoice conversion. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `TaxProfileController` | Controller | Authenticated endpoints: `PUT /api/tax-profile` (update tax profile), `GET /api/tax-profile` (retrieve tax profile). |
| `InvoicesController` | Controller (existing) | Existing `POST /api/invoices` endpoint now automatically applies HST from the tax profile during invoice creation. |

---

## Class Diagrams

### Domain Layer -- Tax Profile Entity

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class TaxProfile {
  +Id : Guid
  +PhotographerId : Guid
  +HstRate : decimal
  +HstRegistrationNumber : string?
  +RegistrationStatus : HstRegistrationStatus
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

enum HstRegistrationStatus {
  NotRegistered
  Voluntary
  Mandatory
}

TaxProfile --> HstRegistrationStatus : uses
TaxProfile --> "1" Photographer : PhotographerId
@enduml
```

### Domain Layer -- Extended Invoice & Quote Line Items

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class InvoiceLineItem {
  +Id : Guid
  +InvoiceId : Guid
  +Name : string
  +Description : string?
  +Quantity : int
  +UnitPriceCents : long
  +TotalCents : long
  +**IsTaxExempt : bool**
  +SortOrder : int
}

class QuoteItem {
  +Id : Guid
  +QuoteId : Guid
  +Name : string
  +Description : string?
  +Quantity : int
  +UnitPriceCents : long
  +TotalCents : long
  +**IsTaxExempt : bool**
  +SortOrder : int
}

class Invoice {
  +Id : Guid
  +TaxRatePercent : decimal
  +TaxAmountCents : long
  +SubtotalCents : long
  +TotalCents : long
}

Invoice "1" --> "*" InvoiceLineItem : LineItems

note bottom of InvoiceLineItem
  IsTaxExempt = true excludes
  the item from HST calculation.
  TaxAmountCents = sum of
  non-exempt item totals * HstRate
end note
@enduml
```

### Application Layer -- Tax Profile Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Tax.Commands" {
  class UpdateTaxProfileCommand <<record>> {
    +HstRate : decimal
    +HstRegistrationNumber : string?
    +RegistrationStatus : HstRegistrationStatus
  }
}

package "Features.Tax.Queries" {
  class GetTaxProfileQuery <<record>>
}

class TaxProfileDto <<record>> {
  +HstRate : decimal
  +HstRegistrationNumber : string?
  +RegistrationStatus : HstRegistrationStatus
}

class TaxProfileValidator <<Validator>> {
  +HstRate : 0..100
  +HstRegistrationNumber : optional BN regex
  +RegistrationStatus : valid enum
}

UpdateTaxProfileCommand ..> TaxProfileValidator : validated by
GetTaxProfileQuery ..> TaxProfileDto : returns
@enduml
```

### Application Layer -- Extended Invoice Creation

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
    +LineItems : List<LineItemInput>
  }
}

class LineItemInput <<record>> {
  +Name : string
  +Description : string?
  +Quantity : int
  +UnitPriceCents : long
  +IsTaxExempt : bool
}

package "Features.Invoices.Handlers" {
  class CreateInvoiceCommandHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
    +Handle(cmd, ct) : Result<InvoiceDetailDto>
  }
}

CreateInvoiceCommandHandler ..> CreateInvoiceCommand
CreateInvoiceCommandHandler --> TaxProfile : loads HST rate

note right of CreateInvoiceCommandHandler
  1. Build line items
  2. Load TaxProfile
  3. Filter taxable items
     (IsTaxExempt = false)
  4. TaxAmountCents =
     sum(taxable totals) * hstRate / 100
  5. TotalCents =
     subtotal + tax - discount
end note
@enduml
```

### API Layer -- Tax Profile Controller

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class TaxProfileController <<ApiController>> {
  -_mediator : IMediator
  +UpdateTaxProfile(UpdateTaxProfileCommand) : IActionResult
  +GetTaxProfile() : IActionResult
}

TaxProfileController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### Update Tax Profile

```plantuml
@startuml
actor Photographer as P
participant "TaxProfileController" as TPC
participant "MediatR" as M
participant "UpdateTaxProfileHandler" as UH
participant "ApplicationDbContext" as DB

P -> TPC : PUT /api/tax-profile\n{hstRate: 13.0,\nhstRegistrationNumber:\n"123456789RT0001",\nregistrationStatus: "Mandatory"}
TPC -> M : Send(UpdateTaxProfileCommand)
M -> UH : Handle(command)

UH -> UH : Validate (FluentValidation)\n- hstRate: 0..100\n- BN format: 9 digits + RT + 4 digits
alt validation fails
  UH --> M : Result.Failure(errors)
  M --> TPC : Result.Failure
  TPC --> P : 400 Bad Request
end

UH -> DB : Find TaxProfile\nby PhotographerId
alt existing profile found
  UH -> DB : Update HstRate,\nHstRegistrationNumber,\nRegistrationStatus
else no existing profile
  UH -> DB : TaxProfiles.Add(\nphotographerId, hstRate,\nregistrationNumber, status)
end

UH -> DB : SaveChangesAsync()
UH --> M : Result.Success(TaxProfileDto)
M --> TPC : Result.Success
TPC --> P : 200 OK\n{hstRate: 13.0,\nhstRegistrationNumber:\n"123456789RT0001",\nregistrationStatus: "Mandatory"}
@enduml
```

### Get Tax Profile

```plantuml
@startuml
actor Photographer as P
participant "TaxProfileController" as TPC
participant "MediatR" as M
participant "GetTaxProfileHandler" as GH
participant "ApplicationDbContext" as DB

P -> TPC : GET /api/tax-profile
TPC -> M : Send(GetTaxProfileQuery)
M -> GH : Handle(query)

GH -> DB : Find TaxProfile\nby PhotographerId
alt profile exists
  DB --> GH : TaxProfile entity
  GH -> GH : Map to TaxProfileDto
else no profile found
  GH -> GH : Return defaults:\nhstRate = 13.0,\nregistrationNumber = null,\nstatus = NotRegistered
end

GH --> M : Result.Success(TaxProfileDto)
M --> TPC : Result.Success
TPC --> P : 200 OK\n{hstRate, hstRegistrationNumber,\nregistrationStatus}
@enduml
```

### Create Invoice with HST Calculation

```plantuml
@startuml
actor Photographer as P
participant "InvoicesController" as IC
participant "MediatR" as M
participant "CreateInvoiceCommandHandler" as CH
participant "ApplicationDbContext" as DB

P -> IC : POST /api/invoices\n{title: "Wedding Package",\nlineItems: [\n  {name: "Photography", qty: 1,\n   unitPriceCents: 350000,\n   isTaxExempt: false},\n  {name: "Travel", qty: 1,\n   unitPriceCents: 15000,\n   isTaxExempt: true}\n]}
IC -> M : Send(CreateInvoiceCommand)
M -> CH : Handle(command)

CH -> CH : Validate (FluentValidation)

CH -> DB : Generate next invoice number

CH -> CH : Calculate line item totals:\nPhotography = 350000\nTravel = 15000

CH -> CH : Subtotal = 365000

CH -> DB : Load TaxProfile\nfor PhotographerId
DB --> CH : TaxProfile\n{hstRate: 13.0}

CH -> CH : Filter taxable items:\nPhotography (350000)\n(Travel excluded: isTaxExempt=true)

CH -> CH : TaxAmountCents =\n350000 * 13 / 100 = 45500

CH -> CH : TotalCents =\n365000 + 45500 = 410500

CH -> DB : Invoices.Add(invoice\nwith TaxRatePercent = 13.0,\nTaxAmountCents = 45500)
CH -> DB : InvoiceLineItems.AddRange(\nwith IsTaxExempt flags)
CH -> DB : SaveChangesAsync()

CH --> M : Result.Success(invoiceId)
M --> IC : Result.Success
IC --> P : 201 Created\n{invoiceId, invoiceNumber,\nsubtotalCents: 365000,\ntaxAmountCents: 45500,\ntotalCents: 410500}
@enduml
```

### HST Carry-Through from Quote to Invoice

```plantuml
@startuml
participant "AcceptQuoteCommandHandler" as AQH
participant "MediatR" as M
participant "GenerateInvoiceFromQuoteHandler" as GIH
participant "ApplicationDbContext" as DB

AQH -> M : Send(GenerateInvoiceFromQuoteCommand\n{quoteId})
M -> GIH : Handle(command)

GIH -> DB : Load Quote with QuoteItems
DB --> GIH : Quote {\n  items: [\n    {name: "Photography",\n     unitPriceCents: 350000,\n     isTaxExempt: false},\n    {name: "Consultation",\n     unitPriceCents: 10000,\n     isTaxExempt: true}\n  ]\n}

GIH -> DB : Load TaxProfile\nfor PhotographerId
DB --> GIH : TaxProfile\n{hstRate: 13.0}

GIH -> GIH : Map QuoteItems to\nInvoiceLineItems:\n- Copy name, description,\n  qty, unitPrice\n- **Copy IsTaxExempt flag**

GIH -> GIH : Subtotal = 360000

GIH -> GIH : Filter taxable items:\nPhotography (350000)\n(Consultation excluded)

GIH -> GIH : TaxAmountCents =\n350000 * 13 / 100 = 45500

GIH -> GIH : TotalCents =\n360000 + 45500 = 405500

GIH -> DB : Generate invoice number

GIH -> DB : Invoices.Add(draftInvoice\nwith Status = Draft,\nTaxRatePercent = 13.0,\nTaxAmountCents = 45500)
GIH -> DB : InvoiceLineItems.AddRange(\nwith IsTaxExempt preserved)

GIH -> DB : quote.GeneratedInvoiceId\n= newInvoice.Id
GIH -> DB : SaveChangesAsync()

GIH --> M : Result.Success(invoiceId)
@enduml
```
