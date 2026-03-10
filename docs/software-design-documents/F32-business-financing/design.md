# F32 - Business Financing

## Overview

Business Financing (Capital) provides eligible photographers with access to funding directly through the Anansi platform. The feature enables photographers to apply for financing and receive an offer that includes a funding amount, a flat fee (not compounding interest), and clear repayment terms. The application process requires no credit check and has no impact on the photographer's personal credit score. Eligibility is determined internally based on the photographer's platform payment history and account standing.

Once a financing offer is accepted, funds are deposited directly to the photographer's linked bank account within 1-2 business days. Repayment is automatic: a disclosed percentage of every incoming platform payment is withheld and applied to the outstanding balance. The repayment percentage is clearly communicated before the photographer accepts the offer, ensuring full transparency. The `FinancingApplication` entity tracks the full lifecycle from application through funding to complete repayment.

The financing flow integrates with the existing payment processing pipeline. When a `PaymentRecord` is created for a photographer who has an active financing application, the repayment deduction is automatically calculated, recorded as a `FinancingRepayment`, and the application's `RepaidCents` balance is updated. Once the total owed (offered amount plus flat fee) is fully repaid, the application status transitions to "Repaid" and automatic deductions cease.

**L2 Requirements:** CAP-4.11.1 (Financing Application), CAP-4.11.2 (Repayment)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `FinancingApplication` | Entity (existing) | Tracks the financing lifecycle: requested amount, offered amount, flat fee, repayment percentage, total repaid, status (Pending/Approved/Active/Repaid/Declined), and timestamps for approval, funding, and full repayment. Implements `ITenantEntity`. |
| `FinancingRepayment` | Entity | Records each individual repayment deduction. Links to both the `FinancingApplication` and the triggering `PaymentRecord`. Stores the deducted amount in cents. |
| `FinancingApplicationStatus` | Enum | Pending, Approved, Active, Repaid, Declined. Replaces the current string-based status on `FinancingApplication`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ApplyForFinancingCommand` | Command (existing) | Creates a new `FinancingApplication` with status "Pending". Validates that the photographer does not already have an active application. |
| `GetFinancingApplicationQuery` | Query (existing) | Returns the current financing application details for a given application ID. |
| `AcceptFinancingOfferCommand` | Command | Transitions an approved application to "Active" status. Records the photographer's acceptance of the disclosed repayment percentage and terms. Triggers fund disbursement via `IFinancingService`. |
| `DeclineFinancingOfferCommand` | Command | Transitions an approved application to "Declined" status. |
| `ListFinancingHistoryQuery` | Query | Returns all financing applications for the authenticated photographer, ordered by creation date. |
| `ListRepaymentsQuery` | Query | Returns paginated repayment records for a specific financing application. |
| `ProcessFinancingRepaymentCommand` | Command (internal) | Called by the payment pipeline when a new `PaymentRecord` is created. Calculates the repayment deduction, creates a `FinancingRepayment`, and updates the application's `RepaidCents`. Marks application as "Repaid" when fully paid. |
| `IFinancingService` | Interface | Abstracts eligibility evaluation, offer generation, and fund disbursement. Implemented in Infrastructure. |
| `FinancingApplicationDto` | DTO (existing) | Read model for financing application details. |
| `FinancingRepaymentDto` | DTO | Read model for repayment records: Id, ApplicationId, PaymentRecordId, DeductedAmountCents, CreatedAt. |
| `FinancingOfferDto` | DTO | Offer details returned after eligibility evaluation: offered amount, flat fee, repayment percentage, estimated repayment timeline. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `FinancingService` | Service | Implements `IFinancingService`. Evaluates eligibility based on platform payment history (minimum volume/tenure), generates offers with configurable terms, and initiates fund disbursement through Stripe Connect payouts. |
| `FinancingRepaymentJob` | Background Job | Listens for new payment events (or is called inline during `RecordPayment`). For photographers with active financing, calculates deduction and invokes `ProcessFinancingRepaymentCommand`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `FinancingController` | Controller | Endpoints: `POST /api/financing/apply` (submit application), `GET /api/financing/{id}` (get application), `POST /api/financing/{id}/accept` (accept offer), `POST /api/financing/{id}/decline` (decline offer), `GET /api/financing` (list history), `GET /api/financing/{id}/repayments` (list repayments). All require `[Authorize]`. |

---

## Class Diagrams

### Domain Layer - Financing Entities

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

class FinancingApplication {
  +PhotographerId : Guid
  +RequestedAmountCents : long
  +OfferedAmountCents : long?
  +FlatFeeCents : long?
  +RepaymentPercentage : decimal?
  +RepaidCents : long
  +Status : string
  +ApprovedAt : DateTime?
  +FundedAt : DateTime?
  +RepaidAt : DateTime?
}

class FinancingRepayment {
  +PhotographerId : Guid
  +ApplicationId : Guid
  +PaymentRecordId : Guid
  +DeductedAmountCents : long
}

class PaymentRecord {
  +PhotographerId : Guid
  +AmountCents : long
  +FeeCents : long
  +NetAmountCents : long
  +PaymentMethod : PaymentMethod
}

BaseEntity <|-- FinancingApplication
BaseEntity <|-- FinancingRepayment
BaseEntity <|-- PaymentRecord

FinancingApplication "1" --> "*" FinancingRepayment : Repayments
FinancingRepayment --> PaymentRecord : triggered by

@enduml
```

### Application Layer - Commands, Queries, and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class ApplyForFinancingCommand <<Command>> {
  +RequestedAmountCents : long
}

class AcceptFinancingOfferCommand <<Command>> {
  +ApplicationId : Guid
}

class DeclineFinancingOfferCommand <<Command>> {
  +ApplicationId : Guid
}

class ProcessFinancingRepaymentCommand <<Command>> {
  +PaymentRecordId : Guid
}

class GetFinancingApplicationQuery <<Query>> {
  +Id : Guid
}

class ListFinancingHistoryQuery <<Query>> {
}

class ListRepaymentsQuery <<Query>> {
  +ApplicationId : Guid
  +Page : int
  +PageSize : int
}

class FinancingApplicationDto <<DTO>> {
  +Id : Guid
  +RequestedAmountCents : long
  +OfferedAmountCents : long?
  +FlatFeeCents : long?
  +RepaymentPercentage : decimal?
  +RepaidCents : long
  +Status : string
}

class FinancingRepaymentDto <<DTO>> {
  +Id : Guid
  +ApplicationId : Guid
  +PaymentRecordId : Guid
  +DeductedAmountCents : long
  +CreatedAt : DateTime
}

class FinancingOfferDto <<DTO>> {
  +OfferedAmountCents : long
  +FlatFeeCents : long
  +RepaymentPercentage : decimal
  +EstimatedRepaymentMonths : int
}

interface IFinancingService <<Interface>> {
  +EvaluateEligibilityAsync() : bool
  +GenerateOfferAsync() : FinancingOfferDto
  +DisburseFundsAsync() : Task
}

ApplyForFinancingCommand ..> IFinancingService
AcceptFinancingOfferCommand ..> IFinancingService

@enduml
```

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class FinancingController <<ApiController>> {
  -_mediator : IMediator
  +Apply(command) : IActionResult
  +GetApplication(id) : IActionResult
  +AcceptOffer(id) : IActionResult
  +DeclineOffer(id) : IActionResult
  +ListHistory() : IActionResult
  +ListRepayments(id, page) : IActionResult
}

class FinancingService <<Service>> {
  -_db : IApplicationDbContext
  -_paymentService : IPaymentService
  +EvaluateEligibilityAsync() : bool
  +GenerateOfferAsync() : FinancingOfferDto
  +DisburseFundsAsync() : Task
}

interface IFinancingService <<Interface>> {
  +EvaluateEligibilityAsync() : bool
  +GenerateOfferAsync() : FinancingOfferDto
  +DisburseFundsAsync() : Task
}

FinancingService ..|> IFinancingService
FinancingController ..> ApplyForFinancingCommand
FinancingController ..> AcceptFinancingOfferCommand
FinancingController ..> GetFinancingApplicationQuery

@enduml
```

---

## Sequence Diagrams

### Apply for Financing

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "FinancingController" as API
participant "MediatR" as M
participant "ApplyForFinancingHandler" as Handler
participant "IFinancingService" as FS
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/financing/apply\n{requestedAmountCents: 500000}
API -> M : Send(ApplyForFinancingCommand)
M -> Handler : Handle(command)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Check for existing active\nFinancingApplication
DB --> Handler : null (no active application)

Handler -> FS : EvaluateEligibilityAsync(photographerId)
FS --> Handler : true (eligible)

Handler -> FS : GenerateOfferAsync(\nphotographerId, requestedAmount)
FS --> Handler : FinancingOfferDto\n{offered: 500000, fee: 25000,\nrepayment: 10%}

Handler -> DB : Create FinancingApplication\n(Status = "Approved",\noffered/fee/percentage populated)
Handler -> DB : SaveChangesAsync()

Handler --> M : Result<FinancingApplicationDto>
M --> API : Result.Success
API --> Photographer : 200 OK\n{id, offeredAmount, flatFee,\nrepaymentPercentage, status: "Approved"}

note right of FS
  No credit check required.
  Eligibility based on
  platform payment history.
end note

@enduml
```

### Accept Financing Offer and Fund Disbursement

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "FinancingController" as API
participant "MediatR" as M
participant "AcceptOfferHandler" as Handler
participant "IFinancingService" as FS
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/financing/{id}/accept
API -> M : Send(AcceptFinancingOfferCommand)
M -> Handler : Handle(command)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Find FinancingApplication\n(Id, PhotographerId, Status="Approved")
DB --> Handler : FinancingApplication

alt application not found or wrong status
  Handler --> M : Result.Failure("Not found")
  M --> API : Result.Failure
  API --> Photographer : 404 Not Found
end

Handler -> Handler : Set Status = "Active"
Handler -> Handler : Set ApprovedAt = UtcNow

Handler -> FS : DisburseFundsAsync(\nphotographerId, offeredAmountCents)

note right of FS
  Funds deposited to
  photographer's bank
  within 1-2 business days
  via Stripe Connect payout.
end note

Handler -> Handler : Set FundedAt = UtcNow
Handler -> DB : SaveChangesAsync()

Handler --> M : Result<FinancingApplicationDto>
M --> API : Result.Success
API --> Photographer : 200 OK\n{status: "Active", fundedAt}

@enduml
```

### Automatic Repayment on Payment Received

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "RecordPaymentHandler" as PayHandler
participant "MediatR" as M
participant "ProcessRepaymentHandler" as RepayHandler
participant "IApplicationDbContext" as DB

PayHandler -> DB : Create PaymentRecord
PayHandler -> DB : SaveChangesAsync()

PayHandler -> M : Send(ProcessFinancingRepaymentCommand\n{paymentRecordId})
M -> RepayHandler : Handle(command)

RepayHandler -> DB : Find active FinancingApplication\nfor PhotographerId
DB --> RepayHandler : FinancingApplication\n{RepaymentPercentage: 10%}

alt no active financing
  RepayHandler --> M : Result.Success (no-op)
end

RepayHandler -> DB : Find PaymentRecord
DB --> RepayHandler : PaymentRecord\n{NetAmountCents: 10000}

RepayHandler -> RepayHandler : Calculate deduction:\n10000 * 10% = 1000 cents

RepayHandler -> RepayHandler : Cap deduction at\nremaining balance

RepayHandler -> DB : Create FinancingRepayment\n{deductedAmountCents: 1000}
RepayHandler -> DB : Update application\nRepaidCents += 1000

RepayHandler -> RepayHandler : Check if fully repaid:\nRepaidCents >= OfferedAmountCents\n+ FlatFeeCents

alt fully repaid
  RepayHandler -> DB : Set Status = "Repaid"\nSet RepaidAt = UtcNow
end

RepayHandler -> DB : SaveChangesAsync()
RepayHandler --> M : Result.Success

@enduml
```

### View Financing History

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "FinancingController" as API
participant "MediatR" as M
participant "ListFinancingHistoryHandler" as Handler
participant "IApplicationDbContext" as DB

Photographer -> API : GET /api/financing
API -> M : Send(ListFinancingHistoryQuery)
M -> Handler : Handle(query)

Handler -> Handler : Resolve PhotographerId

Handler -> DB : Query FinancingApplications\n(PhotographerId)\nOrderByDescending(CreatedAt)
DB --> Handler : List<FinancingApplication>

Handler -> Handler : Project to\nList<FinancingApplicationDto>

Handler --> M : Result<List<FinancingApplicationDto>>
M --> API : Result.Success
API --> Photographer : 200 OK\n(financing history)

@enduml
```
