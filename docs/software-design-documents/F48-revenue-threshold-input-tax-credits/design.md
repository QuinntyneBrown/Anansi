# F48 - Revenue Threshold & Input Tax Credits

## Overview

This feature provides Canadian photographers with tools to monitor their GST/HST registration obligations and manage Input Tax Credits (ITCs). The CRA requires businesses to register for GST/HST once their taxable revenue exceeds $30,000 over four consecutive calendar quarters. Anansi tracks rolling four-quarter revenue from `PaymentRecord` data and presents a threshold dashboard showing the rolling revenue total, percentage of threshold reached, a quarterly breakdown array, and an alert level that escalates through `None`, `Warning` (75%), `Critical` (90%), and `Exceeded` (100%).

When a payment is recorded and the rolling revenue crosses a threshold boundary (75% or 90%), the system generates an in-app notification with category "Tax" using the existing notification infrastructure (F40). Notifications are rate-limited to one per quarter per threshold level, preventing duplicate alerts when multiple payments push revenue above the same boundary within a single quarter. The `Exceeded` alert at 100% indicates the photographer has surpassed the $30,000 threshold and should register.

The expense tracking component allows photographers to record business expenses with HST paid, enabling ITC calculation. Each expense captures the total amount, HST paid in cents, a category (Equipment, Software, Studio, Travel, Supplies, Marketing, Professional Services, Other), date, and description. The ITC summary endpoint aggregates data for a date range: total HST collected (from invoice payments), total HST paid on expenses, net HST owing (collected minus paid), and a category-level breakdown. This data is formatted for CRA filing purposes and can be exported alongside the financial reporting CSV (F31).

**L2 Requirements:** TAX-21.3.1 (Revenue Threshold Tracking), TAX-21.3.2 (Threshold Alert Notifications), TAX-21.4.1 (Business Expense Tracking), TAX-21.4.2 (ITC Summary)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `BusinessExpense` | Entity | A business expense record: `AmountCents`, `HstPaidCents`, `Category`, `ExpenseDate`, `Description`, `VendorName`. Implements `ITenantEntity`, `IAuditableEntity`. |
| `ExpenseCategory` | Enum | `Equipment`, `Software`, `Studio`, `Travel`, `Supplies`, `Marketing`, `ProfessionalServices`, `Other`. |
| `ThresholdAlertRecord` | Entity | Tracks which threshold alerts have been sent per quarter to prevent duplicates. Contains `PhotographerId`, `QuarterStart` (DateTime), `AlertLevel`. Implements `ITenantEntity`. |
| `ThresholdAlertLevel` | Enum | `None`, `Warning`, `Critical`, `Exceeded`. Corresponds to 0%, 75%, 90%, and 100% of the $30,000 CRA threshold. |
| `PaymentRecord` | Entity (existing) | Used as the source of revenue data for threshold calculation. Aggregated by quarter. |
| `Notification` | Entity (existing) | Threshold crossing alerts create notifications with `Category = Tax`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetRevenueThresholdQuery` | Query | Calculates rolling four-quarter revenue from `PaymentRecord` data. Returns `rollingRevenue`, `thresholdPercentage`, `quarterlyBreakdown[]`, and `alertLevel` (TAX-21.3.1). |
| `CheckThresholdCrossingCommand` | Command | Triggered after a payment is recorded. Calculates current rolling revenue, determines if a new threshold level has been crossed, and if so creates a notification via the existing notification system. Rate-limited to one notification per quarter per level (TAX-21.3.2). |
| `CreateBusinessExpenseCommand` | Command | Creates a `BusinessExpense` record with amount, HST paid, category, date, and description. Returns 201 with the expense record (TAX-21.4.1). |
| `ListBusinessExpensesQuery` | Query | Paginated list of expenses filterable by category and date range. |
| `GetItcSummaryQuery` | Query | Aggregates HST data for a date range. Returns `hstCollected` (from invoices), `hstPaidOnExpenses`, `netHstOwing`, and `categoryBreakdown[]` (TAX-21.4.2). |
| `ExportItcSummaryQuery` | Query | Produces a CSV export of ITC data for CRA filing purposes. |
| `RevenueThresholdDto` | DTO | Read model: `RollingRevenueCents`, `ThresholdCents` (3000000), `ThresholdPercentage`, `QuarterlyBreakdown[]`, `AlertLevel`. |
| `QuarterlyRevenueDto` | DTO | Per-quarter breakdown: `QuarterLabel` (e.g., "2026-Q1"), `QuarterStart`, `QuarterEnd`, `RevenueCents`. |
| `BusinessExpenseDto` | DTO | Read model: `Id`, `AmountCents`, `HstPaidCents`, `Category`, `ExpenseDate`, `Description`, `VendorName`, `CreatedAt`. |
| `ItcSummaryDto` | DTO | Read model: `HstCollectedCents`, `HstPaidOnExpensesCents`, `NetHstOwingCents`, `CategoryBreakdown[]`. |
| `CategoryItcBreakdownDto` | DTO | Per-category ITC: `Category`, `ExpenseCount`, `TotalAmountCents`, `TotalHstPaidCents`. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetRevenueThresholdHandler` | Handler | Queries `PaymentRecord` for last 4 calendar quarters (non-refund records), groups by quarter, sums amounts, calculates percentage and alert level. |
| `CheckThresholdCrossingHandler` | Handler | Calculates rolling revenue, determines current alert level, checks `ThresholdAlertRecord` for existing alert in current quarter at that level, creates notification if new crossing detected. |
| `CreateBusinessExpenseHandler` | Handler | Validates and persists the `BusinessExpense` entity. |
| `GetItcSummaryHandler` | Handler | Queries `PaymentRecord` for HST collected (sum of `TaxCents` in date range), queries `BusinessExpense` for HST paid (sum of `HstPaidCents`), calculates net, groups expenses by category. |
| `ExportItcSummaryHandler` | Handler | Builds CSV with HST collected, HST paid, net owing, and per-category detail rows. |
| `PaymentRecordedEventHandler` | Event Handler (extended) | Listens for payment recorded events and dispatches `CheckThresholdCrossingCommand` to evaluate threshold crossing. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `TaxProfileController` | Controller (extended) | Extended with: `GET /api/tax-profile/threshold` (revenue threshold dashboard), `POST /api/tax-profile/expenses` (create expense), `GET /api/tax-profile/expenses` (list expenses), `GET /api/tax-profile/itc-summary` (ITC summary with date range). |

---

## Class Diagrams

### Domain Layer -- Business Expense & Threshold Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class BusinessExpense {
  +Id : Guid
  +PhotographerId : Guid
  +AmountCents : long
  +HstPaidCents : long
  +Category : ExpenseCategory
  +ExpenseDate : DateTime
  +Description : string
  +VendorName : string?
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

class ThresholdAlertRecord {
  +Id : Guid
  +PhotographerId : Guid
  +QuarterStart : DateTime
  +AlertLevel : ThresholdAlertLevel
  +CreatedAt : DateTime
}

enum ExpenseCategory {
  Equipment
  Software
  Studio
  Travel
  Supplies
  Marketing
  ProfessionalServices
  Other
}

enum ThresholdAlertLevel {
  None
  Warning
  Critical
  Exceeded
}

BusinessExpense --> ExpenseCategory : uses
ThresholdAlertRecord --> ThresholdAlertLevel : uses
@enduml
```

### Application Layer -- Revenue Threshold Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Tax.Threshold" {
  class GetRevenueThresholdQuery <<record>>

  class CheckThresholdCrossingCommand <<record>> {
    +PhotographerId : Guid
    +PaymentAmountCents : long
  }
}

class RevenueThresholdDto <<record>> {
  +RollingRevenueCents : long
  +ThresholdCents : long
  +ThresholdPercentage : decimal
  +QuarterlyBreakdown : List<QuarterlyRevenueDto>
  +AlertLevel : ThresholdAlertLevel
}

class QuarterlyRevenueDto <<record>> {
  +QuarterLabel : string
  +QuarterStart : DateTime
  +QuarterEnd : DateTime
  +RevenueCents : long
}

GetRevenueThresholdQuery ..> RevenueThresholdDto : returns
@enduml
```

### Application Layer -- Expense Commands & ITC Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Tax.Expenses" {
  class CreateBusinessExpenseCommand <<record>> {
    +AmountCents : long
    +HstPaidCents : long
    +Category : ExpenseCategory
    +ExpenseDate : DateTime
    +Description : string
    +VendorName : string?
  }

  class ListBusinessExpensesQuery <<record>> {
    +Category : ExpenseCategory?
    +FromDate : DateTime?
    +ToDate : DateTime?
    +Page : int
    +PageSize : int
  }
}

package "Features.Tax.Itc" {
  class GetItcSummaryQuery <<record>> {
    +From : DateTime
    +To : DateTime
  }

  class ExportItcSummaryQuery <<record>> {
    +From : DateTime
    +To : DateTime
  }
}

class BusinessExpenseDto <<record>> {
  +Id : Guid
  +AmountCents : long
  +HstPaidCents : long
  +Category : ExpenseCategory
  +ExpenseDate : DateTime
  +Description : string
  +VendorName : string?
  +CreatedAt : DateTime
}

class ItcSummaryDto <<record>> {
  +HstCollectedCents : long
  +HstPaidOnExpensesCents : long
  +NetHstOwingCents : long
  +CategoryBreakdown : List<CategoryItcBreakdownDto>
}

class CategoryItcBreakdownDto <<record>> {
  +Category : ExpenseCategory
  +ExpenseCount : int
  +TotalAmountCents : long
  +TotalHstPaidCents : long
}

GetItcSummaryQuery ..> ItcSummaryDto : returns
CreateBusinessExpenseCommand ..> BusinessExpenseDto : returns
@enduml
```

### API Layer -- Extended Tax Profile Controller

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class TaxProfileController <<ApiController>> {
  -_mediator : IMediator
  +UpdateTaxProfile(UpdateTaxProfileCommand) : IActionResult
  +GetTaxProfile() : IActionResult
  +GetRevenueThreshold() : IActionResult
  +CreateExpense(CreateBusinessExpenseCommand) : IActionResult
  +ListExpenses(ListBusinessExpensesQuery) : IActionResult
  +GetItcSummary(DateTime from, DateTime to) : IActionResult
  +ExportItcSummary(DateTime from, DateTime to) : IActionResult
}

TaxProfileController --> "IMediator" : sends commands/queries
@enduml
```

---

## Sequence Diagrams

### Get Revenue Threshold Dashboard

```plantuml
@startuml
actor Photographer as P
participant "TaxProfileController" as TPC
participant "MediatR" as M
participant "GetRevenueThresholdHandler" as GTH
participant "ApplicationDbContext" as DB

P -> TPC : GET /api/tax-profile/threshold
TPC -> M : Send(GetRevenueThresholdQuery)
M -> GTH : Handle(query)

GTH -> GTH : Calculate current quarter\nand previous 3 quarters\n(4-quarter rolling window)

GTH -> DB : Query PaymentRecords\nWHERE PhotographerId = {id}\nAND IsRefund = false\nAND CreatedAt >= quarterStart\n(4 quarters ago)\nGROUP BY calendar quarter\nSUM AmountCents

DB --> GTH : Quarterly revenue data

GTH -> GTH : Build quarterly breakdown:\n[{Q2-2025: 800000},\n {Q3-2025: 1200000},\n {Q4-2025: 600000},\n {Q1-2026: 900000}]

GTH -> GTH : rollingRevenue =\nsum(quarterly totals) = 3500000

GTH -> GTH : thresholdPercentage =\n3500000 / 3000000 * 100 = 116.7%

GTH -> GTH : alertLevel =\nExceeded (>= 100%)

GTH --> M : RevenueThresholdDto {\n  rollingRevenueCents: 3500000,\n  thresholdCents: 3000000,\n  thresholdPercentage: 116.7,\n  quarterlyBreakdown: [...],\n  alertLevel: Exceeded\n}
M --> TPC : Result.Success
TPC --> P : 200 OK (RevenueThresholdDto)
@enduml
```

### Threshold Crossing Notification on Payment

```plantuml
@startuml
participant "ConfirmPaymentHandler" as CPH
participant "MediatR" as M
participant "CheckThresholdCrossingHandler" as TCH
participant "ApplicationDbContext" as DB
participant "NotificationEventHandler" as NEH
participant "IApplicationDbContext" as NDB

CPH -> M : Send(CheckThresholdCrossingCommand\n{photographerId, paymentAmountCents})
M -> TCH : Handle(command)

TCH -> DB : Query PaymentRecords\nfor last 4 calendar quarters\nSUM AmountCents
DB --> TCH : rollingRevenue = 2300000

TCH -> TCH : Determine alert level:\n2300000 / 3000000 = 76.7%\nalertLevel = Warning (>= 75%)

TCH -> TCH : Determine current quarter:\nQ1-2026 starts 2026-01-01

TCH -> DB : Query ThresholdAlertRecords\nWHERE PhotographerId = {id}\nAND QuarterStart = 2026-01-01\nAND AlertLevel = Warning
DB --> TCH : No existing record found

TCH -> DB : ThresholdAlertRecords.Add(\nphotographerId,\nquarterStart = 2026-01-01,\nalertLevel = Warning)

TCH -> M : Publish(NotificationEvent {\n  photographerId,\n  eventType: ThresholdWarning,\n  category: Tax,\n  title: "Revenue Threshold Alert",\n  message: "Your rolling revenue\n    has reached 76.7% of the\n    $30,000 CRA threshold.",\n  link: "/settings/tax-profile"\n})

M -> NEH : Handle(NotificationEvent)
NEH -> NDB : Create Notification entity\n(in-app)

TCH -> DB : SaveChangesAsync()
TCH --> M : Result.Success
@enduml
```

### Create Business Expense

```plantuml
@startuml
actor Photographer as P
participant "TaxProfileController" as TPC
participant "MediatR" as M
participant "CreateBusinessExpenseHandler" as CEH
participant "ApplicationDbContext" as DB

P -> TPC : POST /api/tax-profile/expenses\n{amountCents: 150000,\nhstPaidCents: 19500,\ncategory: "Equipment",\nexpenseDate: "2026-02-15",\ndescription: "Camera lens\nSigma 35mm f/1.4",\nvendorName: "Henry's"}
TPC -> M : Send(CreateBusinessExpenseCommand)
M -> CEH : Handle(command)

CEH -> CEH : Validate (FluentValidation)\n- amountCents > 0\n- hstPaidCents >= 0\n- hstPaidCents <= amountCents\n- category: valid enum\n- expenseDate: not in future\n- description: required, max 500 chars
alt validation fails
  CEH --> M : Result.Failure(errors)
  M --> TPC : Result.Failure
  TPC --> P : 400 Bad Request
end

CEH -> DB : BusinessExpenses.Add(\nphotographerId,\namountCents: 150000,\nhstPaidCents: 19500,\ncategory: Equipment,\nexpenseDate: 2026-02-15,\ndescription, vendorName)

CEH -> DB : SaveChangesAsync()
CEH --> M : Result.Success(BusinessExpenseDto)
M --> TPC : Result.Success
TPC --> P : 201 Created\n{id, amountCents, hstPaidCents,\ncategory, expenseDate,\ndescription, vendorName}
@enduml
```

### Get ITC Summary

```plantuml
@startuml
actor Photographer as P
participant "TaxProfileController" as TPC
participant "MediatR" as M
participant "GetItcSummaryHandler" as ISH
participant "ApplicationDbContext" as DB

P -> TPC : GET /api/tax-profile/itc-summary?\nfrom=2025-01-01&to=2025-12-31
TPC -> M : Send(GetItcSummaryQuery)
M -> ISH : Handle(query)

ISH -> DB : Query PaymentRecords\nWHERE PhotographerId = {id}\nAND IsRefund = false\nAND CreatedAt BETWEEN from..to\nSUM TaxCents
DB --> ISH : hstCollectedCents = 52000

ISH -> DB : Query BusinessExpenses\nWHERE PhotographerId = {id}\nAND ExpenseDate BETWEEN from..to\nGROUP BY Category\nSUM AmountCents, SUM HstPaidCents,\nCOUNT(*)
DB --> ISH : Category aggregations

ISH -> ISH : hstPaidOnExpensesCents =\nsum(all category HstPaidCents)\n= 28500

ISH -> ISH : netHstOwingCents =\n52000 - 28500 = 23500

ISH -> ISH : Build categoryBreakdown:\n[{Equipment: 2 expenses,\n  total: 300000,\n  hstPaid: 19500},\n {Software: 4 expenses,\n  total: 60000,\n  hstPaid: 7800},\n {Travel: 1 expense,\n  total: 9231,\n  hstPaid: 1200}]

ISH --> M : ItcSummaryDto {\n  hstCollectedCents: 52000,\n  hstPaidOnExpensesCents: 28500,\n  netHstOwingCents: 23500,\n  categoryBreakdown: [...]\n}
M --> TPC : Result.Success
TPC --> P : 200 OK (ItcSummaryDto)
@enduml
```

### Threshold Duplicate Prevention

```plantuml
@startuml
participant "ConfirmPaymentHandler" as CPH
participant "MediatR" as M
participant "CheckThresholdCrossingHandler" as TCH
participant "ApplicationDbContext" as DB

CPH -> M : Send(CheckThresholdCrossingCommand\n{photographerId, paymentAmountCents})
M -> TCH : Handle(command)

TCH -> DB : Query PaymentRecords\nfor last 4 calendar quarters\nSUM AmountCents
DB --> TCH : rollingRevenue = 2400000

TCH -> TCH : Determine alert level:\n2400000 / 3000000 = 80%\nalertLevel = Warning (>= 75%)

TCH -> TCH : Current quarter: Q1-2026

TCH -> DB : Query ThresholdAlertRecords\nWHERE PhotographerId = {id}\nAND QuarterStart = 2026-01-01\nAND AlertLevel = Warning
DB --> TCH : **Existing record found**\n(alert already sent this quarter)

TCH -> TCH : Skip notification creation\n(duplicate prevention)

TCH --> M : Result.Success\n(no notification sent)

note right of TCH
  Rate-limited to one notification
  per quarter per threshold level.
  Prevents duplicate alerts when
  multiple payments cross the
  same boundary.
end note
@enduml
```
