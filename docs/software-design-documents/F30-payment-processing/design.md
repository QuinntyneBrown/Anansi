# F30 - Payment Processing

## Overview

This feature provides the payment infrastructure that underpins all financial transactions across the Anansi platform, including invoice payments, store purchases, and booking deposits. It integrates multiple payment methods through Stripe as the primary processor: credit/debit cards (2.9% + $0.30 fee), digital wallets (Apple Pay, Google Pay, Link), Buy Now Pay Later (Klarna, Affirm), and bank transfers (ACH, 1% fee). PayPal is supported as an alternative processor for store and invoice payments via API credentials.

For in-person scenarios, Tap to Pay enables NFC-based contactless payments on the photographer's mobile device, with QR code fallback when contactless fails or reaches its limit, and tip support during the flow. Offline payments (cash, check) can be manually recorded against invoices and are tracked in the system and reports. Every transaction is recorded as a `PaymentRecord` entity that captures gross amount, fees, net amount, tips, tax, payment method, and external references.

Payouts follow Stripe's standard timelines: 2 business days for US accounts, 3 business days for Canadian accounts, with first payouts taking 7-10 days for Stripe verification. Eligible users can opt for instant payouts at a 1.5% fee. The payout system provides visibility into pending, in-transit, and completed payouts. All payment data flows into the financial reporting system for revenue tracking, tax calculations, and business analytics.

**L2 Requirements:** PAY-4.8.1 (Card Payments), PAY-4.8.2 (Digital Wallets), PAY-4.8.3 (Buy Now Pay Later), PAY-4.8.4 (Bank Transfers), PAY-4.8.5 (PayPal), PAY-4.8.6 (Tap to Pay), PAY-4.8.7 (Offline Payments), PAY-4.8.8 (Payouts)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PaymentRecord` | Entity | Immutable transaction record capturing all financial details: gross, fees, net, tips, tax, method, external reference, offline flag, refund flag. Implements `ITenantEntity`. |
| `PaymentMethod` | Enum | `CreditCard`, `DebitCard`, `ApplePay`, `GooglePay`, `PayPal`, `BankTransfer`, `Klarna`, `Affirm`, `TapToPay`, `Offline`, `GiftCard`. |
| `PayoutRecord` | Entity | Tracks Stripe payout disbursements: amount, status, arrival date, Stripe payout ID. Implements `ITenantEntity`. |
| `PayoutStatus` | Enum | `Pending`, `InTransit`, `Paid`, `Failed`, `Cancelled`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreatePaymentIntentCommand` | Command | Creates a Stripe PaymentIntent for a given amount, currency, and connected account. Supports metadata for invoice/booking/order linkage. Returns client secret for frontend confirmation. |
| `CreateCheckoutSessionCommand` | Command | Creates a Stripe Checkout Session with line items for store purchases. Returns session URL. |
| `ConfirmPaymentCommand` | Command | Webhook-triggered: confirms a payment succeeded, creates `PaymentRecord`, updates linked invoice/order status. |
| `ProcessCardPaymentCommand` | Command | Processes a credit/debit card payment via Stripe PaymentIntent (PAY-4.8.1). |
| `ProcessDigitalWalletPaymentCommand` | Command | Processes Apple Pay, Google Pay, or Link payment. Uses same Stripe PaymentIntent flow with wallet-specific payment method types (PAY-4.8.2). |
| `ProcessBnplPaymentCommand` | Command | Creates a Klarna or Affirm payment session. Client pays in installments; photographer receives full amount upfront (PAY-4.8.3). |
| `ProcessBankTransferCommand` | Command | Initiates ACH bank transfer via Stripe. Applies 1% fee (PAY-4.8.4). |
| `ProcessPayPalPaymentCommand` | Command | Creates PayPal order, returns redirect URL for client approval. On capture, creates `PaymentRecord` (PAY-4.8.5). |
| `ProcessTapToPayCommand` | Command | Initiates NFC contactless payment on mobile. On failure/limit, generates QR code with payment link fallback. Supports tip input (PAY-4.8.6). |
| `RecordOfflinePaymentCommand` | Command | Manually records a cash/check payment against an invoice. Creates `PaymentRecord` with `IsOffline = true` (PAY-4.8.7). |
| `RefundPaymentCommand` | Command | Initiates full or partial refund via Stripe or PayPal. Creates a refund `PaymentRecord`. |
| `RequestInstantPayoutCommand` | Command | Requests an instant payout from Stripe (1.5% fee). Validates eligibility (PAY-4.8.8). |
| `ListPaymentRecordsQuery` | Query | Paginated payment history filterable by method, date range, invoice/booking. |
| `GetPaymentRecordQuery` | Query | Returns detail for a single payment. |
| `GetPayoutSummaryQuery` | Query | Returns payout overview: pending, in-transit, available balance, next scheduled payout. |
| `ListPayoutsQuery` | Query | Paginated payout history with status and dates. |
| `GetPaymentMethodsQuery` | Query | Returns available payment methods for a photographer's account based on Stripe capabilities and configuration. |
| `HandleStripeWebhookCommand` | Command | Processes incoming Stripe webhook events (payment_intent.succeeded, payout.paid, charge.refunded, etc.). |
| `HandlePayPalWebhookCommand` | Command | Processes incoming PayPal webhook/IPN notifications. |
| `PaymentRecordDto` | DTO | Payment transaction summary. |
| `PaymentRecordDetailDto` | DTO | Full payment detail with all fields. |
| `PayoutDto` | DTO | Payout summary. |
| `PaymentMethodsDto` | DTO | Available payment method options for the photographer. |
| `IPaymentService` | Interface | Stripe operations: create payment intent, create checkout session, refund, create connected account. |
| `IPayPalService` | Interface | PayPal operations: create order, capture order, refund. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `StripePaymentService` | Service | Implements `IPaymentService`. Wraps Stripe SDK for PaymentIntent creation, Checkout Sessions, refunds, and connected account management. |
| `PayPalPaymentService` | Service | Implements `IPayPalService`. Wraps PayPal REST API for order creation, capture, and refunds. |
| `ConfirmPaymentCommandHandler` | Handler | Creates `PaymentRecord` with calculated fees, updates linked invoice installment/order status. |
| `ProcessCardPaymentHandler` | Handler | Creates Stripe PaymentIntent with card payment method type, returns client secret. |
| `ProcessDigitalWalletPaymentHandler` | Handler | Creates PaymentIntent with wallet-specific payment method types (apple_pay, google_pay, link). |
| `ProcessBnplPaymentHandler` | Handler | Creates Stripe Checkout Session with Klarna/Affirm payment method types. |
| `ProcessBankTransferHandler` | Handler | Creates PaymentIntent with `us_bank_account` payment method type, applies 1% fee. |
| `ProcessPayPalPaymentHandler` | Handler | Creates PayPal order via `IPayPalService`, returns approval URL. |
| `ProcessTapToPayHandler` | Handler | Creates Stripe Terminal PaymentIntent for NFC. On failure, generates QR code with payment link. |
| `RecordOfflinePaymentHandler` | Handler | Creates `PaymentRecord` with `IsOffline = true`, updates invoice paid amount. |
| `RefundPaymentHandler` | Handler | Calls Stripe or PayPal refund API, creates refund `PaymentRecord`. |
| `HandleStripeWebhookHandler` | Handler | Parses and validates Stripe webhook signatures, routes events to appropriate handlers. |
| `HandlePayPalWebhookHandler` | Handler | Validates PayPal webhook/IPN, routes events. |
| `RequestInstantPayoutHandler` | Handler | Calls Stripe Payout API with `method: instant`, creates `PayoutRecord`. |
| `StripeWebhookMiddleware` | Middleware | Validates Stripe webhook signatures before passing to handler. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PaymentsController` | Controller | Authenticated endpoints: `POST /create-intent` (payment intent), `POST /checkout-session` (store checkout), `POST /record-offline` (offline payment), `POST /refund/{id}`, `GET` (list payments), `GET /{id}` (payment detail), `GET /methods` (available methods). |
| `PayoutsController` | Controller | Authenticated endpoints: `GET /summary` (payout overview), `GET` (list payouts), `POST /instant` (request instant payout). |
| `TapToPayController` | Controller | Authenticated endpoints: `POST /initiate` (start NFC payment), `POST /qr-fallback` (generate QR code). |
| `StripeWebhookController` | Controller | Anonymous endpoint: `POST /webhooks/stripe` (Stripe event handler). |
| `PayPalWebhookController` | Controller | Anonymous endpoint: `POST /webhooks/paypal` (PayPal event handler). |

---

## Class Diagrams

### Domain Layer -- Payment Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PaymentRecord {
  +Id : Guid
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
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

class PayoutRecord {
  +Id : Guid
  +PhotographerId : Guid
  +AmountCents : long
  +FeeCents : long
  +NetAmountCents : long
  +Currency : string
  +Status : PayoutStatus
  +StripePayoutId : string?
  +ArrivalDate : DateTime?
  +IsInstant : bool
  +CreatedAt : DateTime
  +UpdatedAt : DateTime
}

enum PaymentMethod {
  CreditCard
  DebitCard
  ApplePay
  GooglePay
  PayPal
  BankTransfer
  Klarna
  Affirm
  TapToPay
  Offline
  GiftCard
}

enum PayoutStatus {
  Pending
  InTransit
  Paid
  Failed
  Cancelled
}

PaymentRecord --> PaymentMethod : uses
PayoutRecord --> PayoutStatus : uses
@enduml
```

![Domain Layer -- Payment Entities](domain-layer-payment-entities.png)

### Application Layer -- Payment Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Payments.Commands" {
  class CreatePaymentIntentCommand <<record>> {
    +AmountCents : long
    +Currency : string
    +InvoiceId : Guid?
    +BookingId : Guid?
    +Metadata : Dictionary<string, string>?
  }

  class ProcessCardPaymentCommand <<record>> {
    +AmountCents : long
    +Currency : string
    +InvoiceId : Guid?
    +BookingId : Guid?
  }

  class ProcessDigitalWalletPaymentCommand <<record>> {
    +AmountCents : long
    +Currency : string
    +WalletType : string
    +InvoiceId : Guid?
    +BookingId : Guid?
  }

  class ProcessBnplPaymentCommand <<record>> {
    +AmountCents : long
    +Currency : string
    +Provider : string
    +InvoiceId : Guid?
    +SuccessUrl : string
    +CancelUrl : string
  }

  class ProcessBankTransferCommand <<record>> {
    +AmountCents : long
    +Currency : string
    +InvoiceId : Guid?
  }

  class ConfirmPaymentCommand <<record>> {
    +StripeEventId : string
    +PaymentIntentId : string
    +AmountCents : long
    +PaymentMethodType : string
  }
}

interface IPaymentService {
  +CreatePaymentIntentAsync()
  +CreateCheckoutSessionAsync()
  +RefundAsync()
  +CreateConnectedAccountAsync()
}
@enduml
```

![Application Layer -- Payment Commands](application-layer-payment-commands.png)

### Application Layer -- PayPal, Tap to Pay, and Offline Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Payments.PayPal" {
  class ProcessPayPalPaymentCommand <<record>> {
    +AmountCents : long
    +Currency : string
    +Description : string
    +InvoiceId : Guid?
    +ReturnUrl : string
    +CancelUrl : string
  }

  class HandlePayPalWebhookCommand <<record>> {
    +WebhookBody : string
    +WebhookId : string
  }
}

package "Features.Payments.TapToPay" {
  class ProcessTapToPayCommand <<record>> {
    +AmountCents : long
    +Currency : string
    +InvoiceId : Guid?
    +TipCents : long
  }

  class GenerateQrFallbackCommand <<record>> {
    +PaymentIntentId : string
    +AmountCents : long
  }
}

package "Features.Payments.Offline" {
  class RecordOfflinePaymentCommand <<record>> {
    +InvoiceId : Guid
    +AmountCents : long
    +PaymentMethod : string
    +Description : string?
  }
}

package "Features.Payments.Refunds" {
  class RefundPaymentCommand <<record>> {
    +PaymentRecordId : Guid
    +AmountCents : long?
    +Reason : string?
  }
}

interface IPayPalService {
  +CreateOrderAsync()
  +CaptureOrderAsync()
  +RefundAsync()
}

ProcessPayPalPaymentCommand ..> IPayPalService : uses
@enduml
```

![Application Layer -- PayPal, Tap to Pay, and Offline Commands](application-layer-paypal-tap-to-pay-and-offline-commands.png)

### Application Layer -- Payout & Webhook Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Payouts" {
  class RequestInstantPayoutCommand <<record>> {
    +AmountCents : long
    +Currency : string
  }

  class GetPayoutSummaryQuery <<record>>

  class ListPayoutsQuery <<record>> {
    +Status : PayoutStatus?
    +FromDate : DateTime?
    +ToDate : DateTime?
    +Page : int
    +PageSize : int
  }
}

package "Features.Payments.Queries" {
  class ListPaymentRecordsQuery <<record>> {
    +PaymentMethod : PaymentMethod?
    +InvoiceId : Guid?
    +BookingId : Guid?
    +FromDate : DateTime?
    +ToDate : DateTime?
    +Page : int
    +PageSize : int
  }

  class GetPaymentRecordQuery <<record>> {
    +PaymentRecordId : Guid
  }

  class GetPaymentMethodsQuery <<record>>
}

package "Features.Payments.Webhooks" {
  class HandleStripeWebhookCommand <<record>> {
    +WebhookBody : string
    +StripeSignature : string
  }
}

class PaymentRecordDto <<record>> {
  +Id : Guid
  +AmountCents : long
  +FeeCents : long
  +NetAmountCents : long
  +PaymentMethod : PaymentMethod
  +Description : string?
  +IsOffline : bool
  +CreatedAt : DateTime
}

class PayoutDto <<record>> {
  +Id : Guid
  +AmountCents : long
  +FeeCents : long
  +Status : PayoutStatus
  +ArrivalDate : DateTime?
  +IsInstant : bool
}

class PaymentMethodsDto <<record>> {
  +CardEnabled : bool
  +ApplePayEnabled : bool
  +GooglePayEnabled : bool
  +LinkEnabled : bool
  +KlarnaEnabled : bool
  +AffirmEnabled : bool
  +AchEnabled : bool
  +PayPalEnabled : bool
  +TapToPayEnabled : bool
}
@enduml
```

![Application Layer -- Payout & Webhook Commands](application-layer-payout-webhook-commands.png)

### API Layer -- Payment Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PaymentsController <<ApiController>> {
  -_mediator : IMediator
  +CreateIntent(CreatePaymentIntentCommand) : IActionResult
  +CreateCheckoutSession(CreateCheckoutSessionCommand) : IActionResult
  +RecordOffline(RecordOfflinePaymentCommand) : IActionResult
  +Refund(Guid, RefundPaymentCommand) : IActionResult
  +List(ListPaymentRecordsQuery) : IActionResult
  +Get(Guid) : IActionResult
  +GetMethods() : IActionResult
}

class PayoutsController <<ApiController>> {
  -_mediator : IMediator
  +GetSummary() : IActionResult
  +List(ListPayoutsQuery) : IActionResult
  +RequestInstant(RequestInstantPayoutCommand) : IActionResult
}

class TapToPayController <<ApiController>> {
  -_mediator : IMediator
  +Initiate(ProcessTapToPayCommand) : IActionResult
  +QrFallback(GenerateQrFallbackCommand) : IActionResult
}

class StripeWebhookController <<ApiController>> {
  -_mediator : IMediator
  +HandleWebhook() : IActionResult
}

class PayPalWebhookController <<ApiController>> {
  -_mediator : IMediator
  +HandleWebhook() : IActionResult
}

PaymentsController --> "IMediator" : sends commands/queries
PayoutsController --> "IMediator" : sends commands/queries
TapToPayController --> "IMediator" : sends commands/queries
@enduml
```

![API Layer -- Payment Controllers](api-layer-payment-controllers.png)

---

## Sequence Diagrams

### Card Payment via Stripe PaymentIntent

```plantuml
@startuml
actor Client as C
participant "InvoicePublicController" as IPC
participant "MediatR" as M
participant "ProcessCardPaymentHandler" as CPH
participant "IPaymentService" as PS
participant "ApplicationDbContext" as DB

C -> IPC : POST /api/invoices/pay/{token}\n{paymentMethodId, scheduleId}
IPC -> M : Send(ProcessCardPaymentCommand)
M -> CPH : Handle(command)

CPH -> DB : Load Invoice and\nPaymentSchedule

CPH -> DB : Load Photographer\n(StripeAccountId)

CPH -> PS : CreatePaymentIntentAsync(\namountCents, currency,\nstripeAccountId, metadata)
PS --> CPH : clientSecret

CPH --> M : Result.Success(clientSecret)
M --> IPC : Result.Success
IPC --> C : 200 OK {clientSecret}

note right of C
  Client-side Stripe.js confirms
  the PaymentIntent using
  the clientSecret.
  On success, Stripe fires webhook.
end note
@enduml
```

![Card Payment via Stripe PaymentIntent](card-payment-via-stripe-paymentintent.png)

### Stripe Webhook Confirms Payment

```plantuml
@startuml
participant "Stripe" as S
participant "StripeWebhookController" as SWC
participant "MediatR" as M
participant "HandleStripeWebhookHandler" as SWH
participant "ConfirmPaymentHandler" as CPH
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

S -> SWC : POST /webhooks/stripe\n(payment_intent.succeeded)
SWC -> SWC : Validate webhook signature

SWC -> M : Send(HandleStripeWebhookCommand)
M -> SWH : Handle(command)

SWH -> SWH : Parse event type:\npayment_intent.succeeded

SWH -> M : Send(ConfirmPaymentCommand)
M -> CPH : Handle(command)

CPH -> CPH : Calculate fees:\n2.9% + $0.30 for card\n1% for ACH

CPH -> DB : PaymentRecords.Add(\namountCents, feeCents,\nnetAmountCents, method,\nexternalPaymentId)

CPH -> DB : Load linked Invoice\nand PaymentSchedule

CPH -> DB : schedule.IsPaid = true\nschedule.PaidAt = UtcNow\nschedule.PaymentIntentId = piId

CPH -> DB : invoice.PaidCents += amount

CPH -> CPH : Check all installments paid?
alt all paid
  CPH -> DB : invoice.Status = Paid
else some remaining
  CPH -> DB : invoice.Status = PartiallyPaid
end

CPH -> DB : SaveChangesAsync()

CPH -> ES : SendTemplatedAsync(\nclient.Email,\n"Payment Confirmation")
CPH -> ES : SendTemplatedAsync(\nphotographer.Email,\n"Payment Received")

CPH --> M : Result.Success
SWH --> M : Result.Success
SWC --> S : 200 OK
@enduml
```

![Stripe Webhook Confirms Payment](stripe-webhook-confirms-payment.png)

### PayPal Payment Flow

```plantuml
@startuml
actor Client as C
participant "InvoicePublicController" as IPC
participant "MediatR" as M
participant "ProcessPayPalHandler" as PPH
participant "IPayPalService" as PPS
participant "PayPalWebhookController" as PPWC
participant "HandlePayPalWebhookHandler" as PPWH
participant "ApplicationDbContext" as DB

== Step 1: Create PayPal Order ==
C -> IPC : POST /api/invoices/pay/{token}\n{method: "paypal"}
IPC -> M : Send(ProcessPayPalPaymentCommand)
M -> PPH : Handle(command)

PPH -> PPS : CreateOrderAsync(\npaypalEmail, amountCents,\ncurrency, description,\nreturnUrl, cancelUrl)
PPS --> PPH : approvalUrl

PPH --> M : Result.Success(approvalUrl)
M --> IPC : Result.Success
IPC --> C : 200 OK {approvalUrl}

C -> C : Redirect to PayPal\nfor approval

== Step 2: Capture on Webhook ==
participant "PayPal" as PP
PP -> PPWC : POST /webhooks/paypal\n(CHECKOUT.ORDER.APPROVED)
PPWC -> M : Send(HandlePayPalWebhookCommand)
M -> PPWH : Handle(command)

PPWH -> PPS : CaptureOrderAsync(orderId)
PPS --> PPWH : captureResult (success)

PPWH -> DB : PaymentRecords.Add(\nmethod=PayPal,\nexternalPaymentId=captureId)
PPWH -> DB : Update invoice status
PPWH -> DB : SaveChangesAsync()
PPWH --> M : Result.Success
PPWC --> PP : 200 OK
@enduml
```

![PayPal Payment Flow](paypal-payment-flow.png)

### Buy Now Pay Later (Klarna/Affirm)

```plantuml
@startuml
actor Client as C
participant "PaymentsController" as PC
participant "MediatR" as M
participant "ProcessBnplHandler" as BH
participant "IPaymentService" as PS
participant "ApplicationDbContext" as DB

C -> PC : POST /api/payments/checkout-session\n{provider: "klarna",\namountCents, invoiceId,\nsuccessUrl, cancelUrl}
PC -> M : Send(ProcessBnplPaymentCommand)
M -> BH : Handle(command)

BH -> DB : Load Invoice and\nPhotographer (StripeAccountId)

BH -> PS : CreateCheckoutSessionAsync(\nstripeAccountId, lineItems,\nsuccessUrl, cancelUrl)\nwith payment_method_types:\n["klarna"] or ["affirm"]

PS --> BH : sessionUrl

BH --> M : Result.Success(sessionUrl)
M --> PC : Result.Success
PC --> C : 200 OK {sessionUrl}

note right of C
  Client completes BNPL flow
  on Klarna/Affirm.
  Photographer receives full
  payment upfront via Stripe.
  Stripe webhook confirms.
end note
@enduml
```

![Buy Now Pay Later (Klarna/Affirm)](buy-now-pay-later-klarna-affirm.png)

### Tap to Pay with QR Fallback

```plantuml
@startuml
actor Photographer as P
actor Client as C
participant "TapToPayController" as TPC
participant "MediatR" as M
participant "ProcessTapToPayHandler" as TPH
participant "IPaymentService" as PS
participant "ApplicationDbContext" as DB

P -> TPC : POST /api/tap-to-pay/initiate\n{amountCents, tipCents,\ninvoiceId}
TPC -> M : Send(ProcessTapToPayCommand)
M -> TPH : Handle(command)

TPH -> DB : Load Photographer (StripeAccountId)

TPH -> PS : CreatePaymentIntentAsync(\namountCents + tipCents,\ncurrency, stripeAccountId,\n{payment_method_types:\n["card_present"]})
PS --> TPH : paymentIntentId, clientSecret

TPH --> M : Result.Success(\npaymentIntentId, clientSecret)
M --> TPC : Result.Success
TPC --> P : 200 OK {paymentIntentId,\nclientSecret}

note right of P
  Mobile app presents NFC
  reader via Stripe Terminal SDK.
  Client taps card/phone/watch.
end note

alt NFC succeeds
  P -> P : Payment confirmed\nvia Stripe Terminal SDK
else NFC fails or limit reached
  P -> TPC : POST /api/tap-to-pay/qr-fallback\n{paymentIntentId, amountCents}
  TPC -> M : Send(GenerateQrFallbackCommand)
  M -> M : Generate payment URL\nwith paymentIntentId
  M --> TPC : Result.Success(qrCodeUrl)
  TPC --> P : 200 OK {qrCodeUrl,\nqrCodeImageBase64}

  P -> C : Display QR code\non photographer's phone
  C -> C : Client scans QR,\ncompletes payment\non their own device
end
@enduml
```

![Tap to Pay with QR Fallback](tap-to-pay-with-qr-fallback.png)

### Record Offline Payment

```plantuml
@startuml
actor Photographer as P
participant "PaymentsController" as PC
participant "MediatR" as M
participant "RecordOfflinePaymentHandler" as ROH
participant "ApplicationDbContext" as DB

P -> PC : POST /api/payments/record-offline\n{invoiceId, amountCents,\npaymentMethod: "cash",\ndescription: "Cash at session"}
PC -> M : Send(RecordOfflinePaymentCommand)
M -> ROH : Handle(command)

ROH -> DB : Load Invoice with\nPaymentSchedules

alt invoice not active
  ROH --> M : Result.Failure("Invoice is not payable")
  M --> PC : Result.Failure
  PC --> P : 400 Bad Request
end

ROH -> DB : PaymentRecords.Add(\namountCents, feeCents=0,\nnetAmountCents=amountCents,\nmethod=Offline, isOffline=true,\ndescription)

ROH -> DB : invoice.PaidCents += amountCents

ROH -> ROH : Find matching unpaid schedule\nand mark as paid (if amount matches)

ROH -> ROH : Check all installments paid?
alt all paid
  ROH -> DB : invoice.Status = Paid
else some remaining
  ROH -> DB : invoice.Status = PartiallyPaid
end

ROH -> DB : SaveChangesAsync()
ROH --> M : Result.Success(paymentRecordId)
M --> PC : Result.Success
PC --> P : 201 Created {paymentRecordId}
@enduml
```

![Record Offline Payment](record-offline-payment.png)

### Request Instant Payout

```plantuml
@startuml
actor Photographer as P
participant "PayoutsController" as PC
participant "MediatR" as M
participant "RequestInstantPayoutHandler" as IPH
participant "IPaymentService" as PS
participant "ApplicationDbContext" as DB

P -> PC : POST /api/payouts/instant\n{amountCents, currency}
PC -> M : Send(RequestInstantPayoutCommand)
M -> IPH : Handle(command)

IPH -> DB : Load Photographer\n(StripeAccountId)

IPH -> IPH : Verify instant payout\neligibility via Stripe

alt not eligible
  IPH --> M : Result.Failure(\n"Instant payouts not available.\nCheck Stripe dashboard.")
  M --> PC : Result.Failure
  PC --> P : 400 Bad Request
end

IPH -> IPH : Calculate fee:\n1.5% of amount

IPH -> PS : Request Stripe Payout\n(method: "instant",\namountCents, stripeAccountId)
PS --> IPH : stripePayoutId

IPH -> DB : PayoutRecords.Add(\namountCents, feeCents,\nstatus=Pending,\nisInstant=true,\nstripePayoutId)
IPH -> DB : SaveChangesAsync()

IPH --> M : Result.Success(payoutId)
M --> PC : Result.Success
PC --> P : 200 OK {payoutId,\nestimatedArrival: "minutes"}
@enduml
```

![Request Instant Payout](request-instant-payout.png)

### Get Payout Summary

```plantuml
@startuml
actor Photographer as P
participant "PayoutsController" as PC
participant "MediatR" as M
participant "GetPayoutSummaryHandler" as GSH
participant "ApplicationDbContext" as DB

P -> PC : GET /api/payouts/summary
PC -> M : Send(GetPayoutSummaryQuery)
M -> GSH : Handle(query)

GSH -> DB : Load Photographer (StripeAccountId)

GSH -> DB : Query PayoutRecords\nGROUP BY Status\nSUM AmountCents

GSH -> DB : Query PaymentRecords\nWHERE not yet paid out\nSUM NetAmountCents\n(available balance)

GSH -> GSH : Determine next scheduled\npayout date:\n- US: +2 business days\n- Canada: +3 business days

GSH --> M : PayoutSummaryDto {\n  pendingCents,\n  inTransitCents,\n  availableBalanceCents,\n  nextPayoutDate,\n  instantPayoutEligible\n}
M --> PC : Result.Success
PC --> P : 200 OK (PayoutSummaryDto)
@enduml
```

![Get Payout Summary](get-payout-summary.png)
