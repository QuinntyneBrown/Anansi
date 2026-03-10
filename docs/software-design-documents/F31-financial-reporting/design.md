# F31 - Financial Reporting

## Overview

Financial Reporting provides photographers with a comprehensive revenue dashboard, detailed transaction history, CSV data export, and invoice tracking. The dashboard aggregates all `PaymentRecord` data to present total revenue, net revenue (after fees, refunds, and disputes), payment method breakdown, tips, and taxes. Visual graphs and charts allow photographers to identify trends, busiest months, and slowest periods at a glance. All dashboard data supports date range filtering with preset ranges (yearly, quarterly, monthly) and fully custom start/end dates.

Transaction details expose every individual payment with its full financial profile: amount, payment method, processing fees, net amount, date, associated client name, and card last 4 digits. The transaction list is searchable by description or card digits and filterable by payment method and date range. Pagination ensures performance with large transaction volumes.

CSV data export produces a downloadable file covering all transactions for a selected period, formatted for direct use in tax filing or sharing with an accountant. Invoice tracking surfaces paid, pending, and overdue invoices directly from the dashboard, with overdue invoices visually highlighted. Monthly aggregation of revenue data enables identification of busiest and slowest months.

**L2 Requirements:** RPT-4.10.1 (Revenue Dashboard), RPT-4.10.2 (Transaction Details), RPT-4.10.3 (Data Export), RPT-4.10.4 (Invoice Tracking)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PaymentRecord` | Entity (existing) | Transaction record storing gross amount, fees, net amount, tips, tax, payment method, card last 4, refund flag, and links to Contact/Invoice/Booking. Implements `ITenantEntity`. |
| `Invoice` | Entity (existing) | Invoice entity with status tracking (Draft, Sent, Viewed, PartiallyPaid, Paid, Overdue, Cancelled, Refunded). Linked to Contact and Project. |
| `PaymentMethod` | Enum (existing) | CreditCard, DebitCard, ApplePay, GooglePay, PayPal, BankTransfer, Klarna, Affirm, TapToPay, Offline, GiftCard. |
| `InvoiceStatus` | Enum (existing) | Draft, Sent, Viewed, PartiallyPaid, Paid, Overdue, Cancelled, Refunded. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetRevenueDashboardQuery` | Query (existing) | Aggregates `PaymentRecord` data within an optional date range. Returns totals for revenue, fees, refunds, tips, taxes, payment method breakdown, and invoice status counts (paid/pending/overdue). |
| `GetMonthlyRevenueQuery` | Query | Returns monthly revenue aggregation for a specified year, enabling busiest/slowest month identification via a time-series dataset suitable for charting. |
| `ListTransactionsQuery` | Query (existing) | Paginated list of `PaymentRecord` entries with optional filters for payment method, date range, and free-text search across description and card last 4. |
| `ExportTransactionsQuery` | Query (existing) | Produces a CSV string of all transactions matching the date range, formatted with columns for Date, Description, Amount, Fee, Net, Tip, Tax, Method, CardLast4, ExternalId, IsRefund. |
| `ListInvoicesByStatusQuery` | Query | Returns paginated invoices filtered by status (paid, pending, overdue) with overdue highlighting. Includes client name, amount, due date. |
| `RevenueDashboardDto` | DTO (existing) | Aggregated dashboard read model with totals, breakdown, and invoice counts. |
| `MonthlyRevenueDto` | DTO | Per-month aggregation: month, year, total revenue, net revenue, transaction count. |
| `PaymentRecordDto` | DTO (existing) | Full transaction detail read model. |
| `InvoiceSummaryDto` | DTO | Lightweight invoice read model for dashboard listing: Id, InvoiceNumber, ClientName, TotalCents, PaidCents, Status, DueDate, IsOverdue. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetMonthlyRevenueHandler` | Handler | Groups `PaymentRecord` by year/month, aggregates totals per period. |
| `ListInvoicesByStatusHandler` | Handler | Queries invoices filtered by status with Contact join for client name. Calculates overdue flag from `DueDate`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ReportsController` | Controller | Endpoints: `GET /api/reports/revenue` (dashboard), `GET /api/reports/revenue/monthly` (chart data), `GET /api/reports/transactions` (paginated list), `GET /api/reports/transactions/export` (CSV download), `GET /api/reports/invoices` (by-status listing). All require `[Authorize]`. |

---

## Class Diagrams

### Domain Layer - Financial Entities

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

class PaymentRecord {
  +PhotographerId : Guid
  +ContactId : Guid?
  +InvoiceId : Guid?
  +BookingId : Guid?
  +AmountCents : long
  +FeeCents : long
  +NetAmountCents : long
  +TipCents : long
  +TaxCents : long
  +Currency : string
  +PaymentMethod : PaymentMethod
  +ExternalPaymentId : string?
  +CardLast4 : string?
  +Description : string?
  +IsOffline : bool
  +IsRefund : bool
  +GiftCardId : Guid?
}

class Invoice {
  +PhotographerId : Guid
  +ContactId : Guid?
  +InvoiceNumber : string
  +Title : string
  +Status : InvoiceStatus
  +TotalCents : long
  +PaidCents : long
  +DueDate : DateTime?
  +TipAmountCents : long
  +TaxAmountCents : long
}

enum PaymentMethod {
  CreditCard
  DebitCard
  ApplePay
  GooglePay
  PayPal
  BankTransfer
  TapToPay
  Offline
  GiftCard
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

BaseEntity <|-- PaymentRecord
BaseEntity <|-- Invoice
PaymentRecord --> PaymentMethod
Invoice --> InvoiceStatus

@enduml
```

![Domain Layer - Financial Entities](domain-layer-financial-entities.png)

### Application Layer - Queries, DTOs, and Handlers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class GetRevenueDashboardQuery <<Query>> {
  +From : DateTime?
  +To : DateTime?
}

class GetMonthlyRevenueQuery <<Query>> {
  +Year : int
}

class ListTransactionsQuery <<Query>> {
  +MethodFilter : PaymentMethod?
  +Search : string?
  +From : DateTime?
  +To : DateTime?
  +Page : int
  +PageSize : int
}

class ExportTransactionsQuery <<Query>> {
  +From : DateTime?
  +To : DateTime?
}

class ListInvoicesByStatusQuery <<Query>> {
  +Status : InvoiceStatus?
  +Page : int
  +PageSize : int
}

class RevenueDashboardDto <<DTO>> {
  +TotalRevenueCents : long
  +NetRevenueCents : long
  +TotalFeesCents : long
  +TotalRefundsCents : long
  +TotalTipsCents : long
  +TotalTaxCents : long
  +PaymentMethodBreakdown : List
  +PaidInvoiceCount : int
  +PendingInvoiceCount : int
  +OverdueInvoiceCount : int
}

class MonthlyRevenueDto <<DTO>> {
  +Year : int
  +Month : int
  +TotalRevenueCents : long
  +NetRevenueCents : long
  +TransactionCount : int
}

class InvoiceSummaryDto <<DTO>> {
  +Id : Guid
  +InvoiceNumber : string
  +ClientName : string?
  +TotalCents : long
  +PaidCents : long
  +Status : InvoiceStatus
  +DueDate : DateTime?
  +IsOverdue : bool
}

class PaymentRecordDto <<DTO>> {
  +Id : Guid
  +AmountCents : long
  +FeeCents : long
  +NetAmountCents : long
  +PaymentMethod : PaymentMethod
  +CardLast4 : string?
  +CreatedAt : DateTime
}

@enduml
```

![Application Layer - Queries, DTOs, and Handlers](application-layer-queries-dtos-and-handlers.png)

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ReportsController <<ApiController>> {
  -_mediator : IMediator
  +GetRevenueDashboard(from, to) : IActionResult
  +GetMonthlyRevenue(year) : IActionResult
  +ListTransactions(filters) : IActionResult
  +ExportTransactionsCsv(from, to) : IActionResult
  +ListInvoicesByStatus(status, page) : IActionResult
}

class GetRevenueDashboardHandler <<Handler>> {
  -_db : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle() : Result<RevenueDashboardDto>
}

class GetMonthlyRevenueHandler <<Handler>> {
  -_db : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle() : Result<List<MonthlyRevenueDto>>
}

class ListTransactionsHandler <<Handler>> {
  -_db : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle() : Result<PagedList<PaymentRecordDto>>
}

class ExportTransactionsHandler <<Handler>> {
  -_db : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle() : Result<string>
}

class ListInvoicesByStatusHandler <<Handler>> {
  -_db : IApplicationDbContext
  -_currentUser : ICurrentUserService
  +Handle() : Result<PagedList<InvoiceSummaryDto>>
}

ReportsController ..> GetRevenueDashboardHandler
ReportsController ..> GetMonthlyRevenueHandler
ReportsController ..> ListTransactionsHandler
ReportsController ..> ExportTransactionsHandler
ReportsController ..> ListInvoicesByStatusHandler

@enduml
```

![Infrastructure & API Layer](infrastructure-api-layer.png)

---

## Sequence Diagrams

### View Revenue Dashboard

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ReportsController" as API
participant "MediatR" as M
participant "GetRevenueDashboardHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/reports/revenue?\nfrom=2025-01-01&to=2025-12-31
API -> M : Send(GetRevenueDashboardQuery)
M -> Handler : Handle(query)

Handler -> Handler : Resolve PhotographerId\nfrom ICurrentUserService

Handler -> DB : Query PaymentRecords\n(filtered by date range)
DB --> Handler : List<PaymentRecord>

Handler -> Handler : Calculate totals:\ntotalRevenue, fees, refunds,\ntips, tax, netRevenue

Handler -> Handler : Group by PaymentMethod\nfor breakdown

Handler -> DB : Count Invoices by status\n(Paid, Pending, Overdue)
DB --> Handler : paidCount, pendingCount,\noverdueCount

Handler --> M : Result<RevenueDashboardDto>
M --> API : Result.Success
API --> Photographer : 200 OK (RevenueDashboardDto)

@enduml
```

![View Revenue Dashboard](view-revenue-dashboard.png)

### Get Monthly Revenue for Charts

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ReportsController" as API
participant "MediatR" as M
participant "GetMonthlyRevenueHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/reports/revenue/monthly?\nyear=2025
API -> M : Send(GetMonthlyRevenueQuery(2025))
M -> Handler : Handle(query)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Query PaymentRecords\nfor year 2025
DB --> Handler : List<PaymentRecord>

Handler -> Handler : Group by Month,\ncalculate per-month:\nrevenue, net, count

Handler --> M : Result<List<MonthlyRevenueDto>>
M --> API : Result.Success
API --> Photographer : 200 OK\n(12 months of chart data)

note right of Handler
  Busiest/slowest months
  identifiable from monthly
  totals and counts.
end note

@enduml
```

![Get Monthly Revenue for Charts](get-monthly-revenue-for-charts.png)

### List and Search Transactions

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ReportsController" as API
participant "MediatR" as M
participant "ListTransactionsHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/reports/transactions?\nmethod=CreditCard&search=Smith\n&from=2025-06-01&page=1
API -> M : Send(ListTransactionsQuery)
M -> Handler : Handle(query)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Build query with filters:\nPaymentMethod, date range,\nsearch on Description/CardLast4
DB --> Handler : Filtered IQueryable

Handler -> DB : CountAsync()
DB --> Handler : totalCount

Handler -> DB : OrderByDescending(CreatedAt)\n.Skip().Take()
DB --> Handler : List<PaymentRecord>

Handler -> Handler : Project to PaymentRecordDto

Handler --> M : Result<PagedList<PaymentRecordDto>>
M --> API : Result.Success
API --> Photographer : 200 OK (paginated results)

@enduml
```

![List and Search Transactions](list-and-search-transactions.png)

### Export Transactions as CSV

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ReportsController" as API
participant "MediatR" as M
participant "ExportTransactionsHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/reports/transactions/export?\nfrom=2025-01-01&to=2025-12-31
API -> M : Send(ExportTransactionsQuery)
M -> Handler : Handle(query)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Query PaymentRecords\n(filtered by date range)
DB --> Handler : List<PaymentRecord>

Handler -> Handler : Build CSV with header:\nDate, Description, Amount,\nFee, Net, Tip, Tax,\nMethod, CardLast4, ExternalId, IsRefund

Handler -> Handler : Append each record as row,\nformat amounts as dollars

Handler --> M : Result<string> (CSV content)
M --> API : Result.Success
API --> Photographer : 200 OK\nContent-Type: text/csv\nContent-Disposition: attachment;\nfilename="transactions.csv"

@enduml
```

![Export Transactions as CSV](export-transactions-as-csv.png)

### List Invoices by Status

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "ReportsController" as API
participant "MediatR" as M
participant "ListInvoicesByStatusHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/reports/invoices?\nstatus=Overdue&page=1
API -> M : Send(ListInvoicesByStatusQuery)
M -> Handler : Handle(query)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Query Invoices\n(PhotographerId, Status filter,\nexclude templates)
Handler -> DB : Include Contact for client name
DB --> Handler : IQueryable<Invoice>

Handler -> DB : CountAsync()
DB --> Handler : totalCount

Handler -> DB : OrderBy(DueDate)\n.Skip().Take()
DB --> Handler : List<Invoice>

Handler -> Handler : Project to InvoiceSummaryDto,\nset IsOverdue = Status == Overdue\nor DueDate < UtcNow

Handler --> M : Result<PagedList<InvoiceSummaryDto>>
M --> API : Result.Success
API --> Photographer : 200 OK (paginated invoices\nwith overdue highlighting)

@enduml
```

![List Invoices by Status](list-invoices-by-status.png)
