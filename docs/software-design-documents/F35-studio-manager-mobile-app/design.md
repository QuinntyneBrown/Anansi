# F35 - Studio Manager Mobile App

## Overview

The Studio Manager Mobile App is a native iOS and Android application that gives photographers on-the-go access to their core Studio Manager capabilities. The app provides booking management (view upcoming sessions, manage the calendar, accept or decline pending bookings), invoice management (create, edit, send invoices, view payment status), client communication (full Inbox access with read, reply, compose, and file attachments), and document management (create, edit, share contracts and questionnaires, view signing/completion status). The app is free for all registered Anansi users regardless of their subscription plan and is distributed through the iOS App Store and Google Play.

A key differentiating feature is Tap to Pay, which allows photographers to collect in-person payments directly from the mobile app. The photographer initiates a payment on-screen, and the client taps their credit/debit card, phone, or watch to complete the transaction. The system supports credit cards, debit cards, Apple Pay, and Google Pay. A QR code fallback is available when contactless payment fails, generating a payment link the client can scan and pay through. Tip collection is integrated into the Tap to Pay flow, presented to the client before final confirmation.

Push notifications keep photographers informed in real time about new bookings, payments received, contracts signed, invoice payments, new messages, and form submissions. Notification preferences are configurable per event type. The mobile app consumes the same API endpoints as the web application, ensuring data consistency. Platform-specific functionality (NFC/Tap to Pay, push notification registration, camera/file picker for attachments) is handled in the native layers, while business logic remains in the shared backend.

**L2 Requirements:** MOB-6.1.1 (Booking Management), MOB-6.1.2 (Invoice Management), MOB-6.1.3 (Tap to Pay), MOB-6.1.4 (Client Communication), MOB-6.1.5 (Document Management), MOB-6.1.6 (Push Notifications), MOB-6.1.7 (Availability)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `BookingRecord` | Entity (existing) | Session booking with status (Pending, Confirmed, Declined, Cancelled, Completed, NoShow), client details, timing, and location. |
| `SessionType` | Entity (existing) | Session type definition with duration, pricing, availability windows. |
| `Invoice` | Entity (existing) | Invoice with line items, status tracking, tips, and payment schedules. |
| `InvoiceLineItem` | Entity (existing) | Individual line item on an invoice. |
| `EmailConversation` | Entity (existing) | Threaded conversation with a client. |
| `EmailMessage` | Entity (existing) | Individual email message within a conversation. |
| `EmailAttachment` | Entity (existing) | File attachment on a message. |
| `Contract` | Entity (existing) | Contract with e-signature support and status tracking. |
| `Questionnaire` | Entity (existing) | Questionnaire with questions and response tracking. |
| `PaymentRecord` | Entity (existing) | Transaction record for all payments, including Tap to Pay. |
| `Notification` | Entity (existing) | In-app notification entry. |
| `NotificationPreference` | Entity (existing) | Per-event notification channel preferences. |
| `DeviceToken` | Entity | Stores registered push notification device tokens per user. Tracks platform (iOS/Android), token string, and registration date. Used by `IPushNotificationService` for targeted delivery. |
| `PaymentMethod` | Enum (existing) | Includes `TapToPay` value for in-person contactless payments. |

### Application Layer

The mobile app reuses existing CQRS commands and queries from the web application. The following lists the primary operations consumed by each mobile feature area, plus new mobile-specific commands.

**Booking Management (MOB-6.1.1):**

| Component | Type | Description |
|-----------|------|-------------|
| `ListBookingsQuery` | Query (existing) | Returns upcoming bookings for the photographer, filterable by date range and status. |
| `GetBookingQuery` | Query (existing) | Returns a single booking with full details. |
| `UpdateBookingStatusCommand` | Command (existing) | Accepts or declines a pending booking by updating its `BookingStatus`. |

**Invoice Management (MOB-6.1.2):**

| Component | Type | Description |
|-----------|------|-------------|
| `CreateInvoiceCommand` | Command (existing) | Creates an invoice with line items, tax, and optional deposit. |
| `UpdateInvoiceCommand` | Command (existing) | Edits invoice fields and line items. |
| `SendInvoiceCommand` | Command (existing) | Sends the invoice to the client, updating status to Sent. |
| `ListInvoicesQuery` | Query (existing) | Returns paginated invoices with status filter (paid/pending/overdue). |

**Tap to Pay (MOB-6.1.3):**

| Component | Type | Description |
|-----------|------|-------------|
| `InitiateTapToPayCommand` | Command | Creates a Stripe Terminal `PaymentIntent` for the specified amount, returns a client secret for the native NFC reader SDK. Includes optional tip amount. |
| `CompleteTapToPayCommand` | Command | Called after successful NFC/contactless payment. Creates a `PaymentRecord` with `PaymentMethod = TapToPay`, links to the invoice if applicable, and records the tip. |
| `GeneratePaymentQrCommand` | Command | Generates a time-limited payment link and QR code as a fallback when contactless payment fails. Creates a Stripe Checkout session. |
| `TapToPayResultDto` | DTO | Result of initiating Tap to Pay: client secret, payment intent ID. |
| `PaymentQrDto` | DTO | QR fallback result: payment URL, QR code data URI, expiration. |

**Client Communication (MOB-6.1.4):**

| Component | Type | Description |
|-----------|------|-------------|
| `ListConversationsQuery` | Query (existing) | Paginated conversation list. |
| `GetConversationQuery` | Query (existing) | Full conversation with messages. |
| `ComposeMessageCommand` | Command (existing) | New message with attachments from mobile camera/file picker. |
| `ReplyToConversationCommand` | Command (existing) | Reply with attachments. |

**Document Management (MOB-6.1.5):**

| Component | Type | Description |
|-----------|------|-------------|
| `CreateContractCommand` | Command (existing) | Creates a contract from mobile. |
| `UpdateContractCommand` | Command (existing) | Edits contract content. |
| `SendContractCommand` | Command (existing) | Sends contract to client for signing. |
| `ListContractsQuery` | Query (existing) | Lists contracts with status filter. |
| `CreateQuestionnaireCommand` | Command (existing) | Creates a questionnaire from mobile. |
| `SendQuestionnaireCommand` | Command (existing) | Sends questionnaire to client. |
| `ListQuestionnairesQuery` | Query (existing) | Lists questionnaires with status filter. |

**Push Notifications (MOB-6.1.6):**

| Component | Type | Description |
|-----------|------|-------------|
| `RegisterDeviceCommand` | Command | Registers a device token for push notifications. Stores platform (iOS/Android) and token via `IPushNotificationService`. |
| `UnregisterDeviceCommand` | Command | Removes a device token when the user logs out or uninstalls. |
| `UpdateNotificationPreferencesCommand` | Command (existing) | Configures which event types trigger push notifications. |
| `IPushNotificationService` | Interface (existing) | Sends push notifications to registered devices. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `StripeTerminalService` | Service | Manages Stripe Terminal integration for Tap to Pay. Creates connection tokens for the mobile SDK, handles payment intent creation for NFC readers, and manages the Stripe Terminal reader lifecycle. |
| `PushNotificationService` | Service (existing, extended) | Implements `IPushNotificationService`. Extended to support both Apple Push Notification Service (APNs) for iOS and Firebase Cloud Messaging (FCM) for Android. Routes notifications to the correct platform based on device token registration. |
| `PushNotificationDispatcher` | Service | Listens for domain events (booking confirmed, payment received, contract signed, invoice paid, message received, form submitted) and dispatches push notifications based on the photographer's notification preferences. |

### API Layer

The mobile app consumes the existing API endpoints. The following are the mobile-specific additions.

| Component | Type | Description |
|-----------|------|-------------|
| `TapToPayController` | Controller | Endpoints: `POST /api/tap-to-pay/initiate` (create payment intent for NFC), `POST /api/tap-to-pay/complete` (record successful payment), `POST /api/tap-to-pay/qr-fallback` (generate QR payment link). All require `[Authorize]`. |
| `DevicesController` | Controller | Endpoints: `POST /api/devices/register` (register push token), `DELETE /api/devices/{token}` (unregister). Require `[Authorize]`. |

---

## Class Diagrams

### Domain Layer - Mobile-Relevant Entities

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

class DeviceToken {
  +UserId : string
  +Token : string
  +Platform : string
  +RegisteredAt : DateTime
  +IsActive : bool
}

class BookingRecord {
  +PhotographerId : Guid
  +ClientEmail : string
  +StartTime : DateTime
  +EndTime : DateTime
  +Status : BookingStatus
}

class Invoice {
  +PhotographerId : Guid
  +ContactId : Guid?
  +InvoiceNumber : string
  +Status : InvoiceStatus
  +TotalCents : long
  +PaidCents : long
  +TipsEnabled : bool
}

class PaymentRecord {
  +PhotographerId : Guid
  +AmountCents : long
  +TipCents : long
  +PaymentMethod : PaymentMethod
  +CardLast4 : string?
}

enum BookingStatus {
  Pending
  Confirmed
  Declined
  Cancelled
  Completed
}

enum InvoiceStatus {
  Draft
  Sent
  Paid
  Overdue
}

BaseEntity <|-- DeviceToken
BaseEntity <|-- BookingRecord
BaseEntity <|-- Invoice
BaseEntity <|-- PaymentRecord
BookingRecord --> BookingStatus
Invoice --> InvoiceStatus

@enduml
```

### Domain Layer - Communication & Document Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class EmailConversation {
  +PhotographerId : Guid
  +ContactId : Guid?
  +Subject : string
  +ClientEmail : string?
  +IsRead : bool
  +LastMessageAt : DateTime?
}

class EmailMessage {
  +ConversationId : Guid
  +IsFromPhotographer : bool
  +SenderEmail : string
  +Body : string
  +SentAt : DateTime
}

class EmailAttachment {
  +MessageId : Guid
  +FileName : string
  +ContentType : string
  +FileSizeBytes : long
  +StorageUrl : string
}

class Contract {
  +PhotographerId : Guid
  +Title : string
  +Status : ContractStatus
}

class Questionnaire {
  +PhotographerId : Guid
  +Title : string
  +Status : QuestionnaireStatus
}

enum ContractStatus {
  Draft
  Sent
  Signed
  Expired
}

enum QuestionnaireStatus {
  Draft
  Sent
  Completed
  Expired
}

EmailConversation "1" --> "*" EmailMessage
EmailMessage "1" --> "*" EmailAttachment
Contract --> ContractStatus
Questionnaire --> QuestionnaireStatus

@enduml
```

### Application Layer - Tap to Pay Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class InitiateTapToPayCommand <<Command>> {
  +AmountCents : long
  +TipCents : long
  +Currency : string
  +InvoiceId : Guid?
  +ContactId : Guid?
  +Description : string?
}

class CompleteTapToPayCommand <<Command>> {
  +PaymentIntentId : string
  +CardLast4 : string?
  +InvoiceId : Guid?
  +ContactId : Guid?
  +TipCents : long
}

class GeneratePaymentQrCommand <<Command>> {
  +AmountCents : long
  +TipCents : long
  +Currency : string
  +InvoiceId : Guid?
  +Description : string?
}

class TapToPayResultDto <<DTO>> {
  +ClientSecret : string
  +PaymentIntentId : string
  +AmountCents : long
  +TipCents : long
}

class PaymentQrDto <<DTO>> {
  +PaymentUrl : string
  +QrCodeDataUri : string
  +ExpiresAt : DateTime
}

class RegisterDeviceCommand <<Command>> {
  +DeviceToken : string
  +Platform : string
}

class UnregisterDeviceCommand <<Command>> {
  +DeviceToken : string
}

InitiateTapToPayCommand ..> TapToPayResultDto
GeneratePaymentQrCommand ..> PaymentQrDto

@enduml
```

### Application Layer - Existing Queries Consumed by Mobile

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Bookings" {
  class ListBookingsQuery <<Query>> {
    +Status : BookingStatus?
    +From : DateTime?
    +To : DateTime?
    +Page : int
  }
  class UpdateBookingStatusCommand <<Command>> {
    +BookingId : Guid
    +NewStatus : BookingStatus
  }
}

package "Invoices" {
  class ListInvoicesQuery <<Query>> {
    +Status : InvoiceStatus?
    +Page : int
  }
  class CreateInvoiceCommand <<Command>> {
    +ContactId : Guid?
    +Title : string
    +LineItems : List
  }
  class SendInvoiceCommand <<Command>> {
    +InvoiceId : Guid
  }
}

package "Documents" {
  class ListContractsQuery <<Query>> {
    +Status : ContractStatus?
    +Page : int
  }
  class ListQuestionnairesQuery <<Query>> {
    +Status : QuestionnaireStatus?
    +Page : int
  }
}

package "Communication" {
  class ListConversationsQuery <<Query>> {
    +Page : int
    +Search : string?
  }
  class ComposeMessageCommand <<Command>> {
    +ClientEmail : string
    +Subject : string
    +Body : string
  }
}

@enduml
```

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class TapToPayController <<ApiController>> {
  -_mediator : IMediator
  +Initiate(command) : IActionResult
  +Complete(command) : IActionResult
  +QrFallback(command) : IActionResult
}

class DevicesController <<ApiController>> {
  -_mediator : IMediator
  +Register(command) : IActionResult
  +Unregister(token) : IActionResult
}

class StripeTerminalService <<Service>> {
  -_stripeConfig : StripeOptions
  +CreateConnectionTokenAsync() : string
  +CreatePaymentIntentAsync(amount, tip) : PaymentIntent
}

class PushNotificationService <<Service>> {
  +SendAsync(userId, title, message) : Task
  +RegisterDeviceTokenAsync(userId, token, platform) : Task
  +UnregisterDeviceTokenAsync(userId, token) : Task
}

class PushNotificationDispatcher <<Service>> {
  -_db : IApplicationDbContext
  -_pushService : IPushNotificationService
  +OnBookingConfirmed(booking) : Task
  +OnPaymentReceived(payment) : Task
  +OnContractSigned(contract) : Task
  +OnMessageReceived(conversation) : Task
  +OnFormSubmitted(questionnaire) : Task
}

interface IPushNotificationService <<Interface>>
interface IPaymentService <<Interface>>

PushNotificationService ..|> IPushNotificationService
PushNotificationDispatcher --> IPushNotificationService
TapToPayController ..> InitiateTapToPayCommand
TapToPayController ..> CompleteTapToPayCommand
TapToPayController ..> GeneratePaymentQrCommand
DevicesController ..> RegisterDeviceCommand

@enduml
```

---

## Sequence Diagrams

### Tap to Pay - Successful Contactless Payment

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "Mobile App\n(iOS/Android)" as App
participant "TapToPayController" as API
participant "MediatR" as M
participant "InitiateHandler" as IH
participant "StripeTerminalService" as Stripe
participant "CompleteHandler" as CH
participant "IApplicationDbContext" as DB

Photographer -> App : Enter amount ($150)\n+ optional tip ($20)
App -> API : POST /api/tap-to-pay/initiate\n{amountCents: 15000,\ntipCents: 2000}
API -> M : Send(InitiateTapToPayCommand)
M -> IH : Handle(command)

IH -> Stripe : CreatePaymentIntentAsync(\n17000, "usd", stripeAccountId)
Stripe --> IH : PaymentIntent\n{clientSecret, id}

IH --> M : Result<TapToPayResultDto>
M --> API : Result.Success
API --> App : {clientSecret, paymentIntentId}

App -> App : Present "Tap to Pay"\nNFC reader screen

actor Client
Client -> App : Taps card/phone/watch
App -> App : Stripe Terminal SDK\nprocesses NFC payment
App -> App : Payment succeeded

App -> API : POST /api/tap-to-pay/complete\n{paymentIntentId, cardLast4: "4242",\ntipCents: 2000}
API -> M : Send(CompleteTapToPayCommand)
M -> CH : Handle(command)

CH -> DB : Create PaymentRecord\n{PaymentMethod: TapToPay,\nAmountCents: 17000,\nTipCents: 2000}

CH -> CH : Calculate fees\n(2.9% + $0.30)

alt linked to invoice
  CH -> DB : Update Invoice.PaidCents
end

CH -> DB : SaveChangesAsync()

CH --> M : Result<PaymentRecordDto>
M --> API : Result.Success
API --> App : 200 OK (receipt data)

App -> App : Display receipt\nto photographer

@enduml
```

### Tap to Pay - QR Code Fallback

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "Mobile App" as App
participant "TapToPayController" as API
participant "MediatR" as M
participant "QrFallbackHandler" as Handler
participant "IPaymentService" as Payment

Photographer -> App : Contactless payment fails
App -> App : Show "Try QR Code" option
Photographer -> App : Tap "QR Code Fallback"

App -> API : POST /api/tap-to-pay/qr-fallback\n{amountCents: 17000,\ndescription: "Session payment"}
API -> M : Send(GeneratePaymentQrCommand)
M -> Handler : Handle(command)

Handler -> Handler : Resolve PhotographerId

Handler -> Payment : CreateCheckoutSessionAsync(\nstripeAccountId,\nlineItems, successUrl, cancelUrl)
Payment --> Handler : checkoutSessionUrl

Handler -> Handler : Generate QR code\ndata URI from URL

Handler --> M : Result<PaymentQrDto>\n{paymentUrl, qrCodeDataUri,\nexpiresAt}
M --> API : Result.Success
API --> App : PaymentQrDto

App -> App : Display QR code on screen

actor Client
Client -> App : Scans QR code\nwith phone camera
Client -> Client : Completes payment\nin browser

note right of Client
  Stripe Checkout handles
  payment, tip collection,
  Apple Pay, Google Pay,
  and card entry.
end note

@enduml
```

### Mobile Booking Management

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "Mobile App" as App
participant "BookingsController" as API
participant "MediatR" as M
participant "ListBookingsHandler" as LH
participant "UpdateStatusHandler" as UH
participant "IApplicationDbContext" as DB

== View Upcoming Sessions ==

Photographer -> App : Open Calendar tab
App -> API : GET /api/bookings?\nstatus=Confirmed&from=today
API -> M : Send(ListBookingsQuery)
M -> LH : Handle(query)
LH -> DB : Query BookingRecords\n(PhotographerId, Status, DateRange)
DB --> LH : List<BookingRecord>
LH --> M : Result<PagedList<BookingDto>>
M --> API : Result.Success
API --> App : (paginated bookings)
App -> App : Display calendar\nwith booked slots

== Accept Pending Booking ==

Photographer -> App : Tap pending booking\n-> "Accept"
App -> API : PUT /api/bookings/{id}/status\n{newStatus: "Confirmed"}
API -> M : Send(UpdateBookingStatusCommand)
M -> UH : Handle(command)

UH -> DB : Find BookingRecord
DB --> UH : BookingRecord (Pending)

UH -> DB : Set Status = Confirmed
UH -> DB : SaveChangesAsync()

UH --> M : Result.Success
M --> API : Result.Success
API --> App : 200 OK

App -> App : Update calendar view

@enduml
```

### Mobile Invoice Management

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "Mobile App" as App
participant "InvoicesController" as API
participant "MediatR" as M
participant "CreateInvoiceHandler" as CH
participant "SendInvoiceHandler" as SH
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email

== Create Invoice ==

Photographer -> App : Tap "New Invoice"
Photographer -> App : Add line items,\nset tax, due date
App -> API : POST /api/invoices\n{contactId, title, lineItems,\ntaxRatePercent, dueDate}
API -> M : Send(CreateInvoiceCommand)
M -> CH : Handle(command)

CH -> DB : Create Invoice\nwith line items
CH -> DB : Calculate totals
CH -> DB : SaveChangesAsync()

CH --> M : Result<InvoiceDto>
M --> API : Result.Success
API --> App : 201 Created (InvoiceDto)

== Send Invoice ==

Photographer -> App : Tap "Send"
App -> API : POST /api/invoices/{id}/send
API -> M : Send(SendInvoiceCommand)
M -> SH : Handle(command)

SH -> DB : Update Status = Sent\nSet SentAt = UtcNow
SH -> DB : Get Contact email
SH -> Email : SendAsync(contactEmail,\n"Invoice from {photographer}")
SH -> DB : SaveChangesAsync()

SH --> M : Result.Success
M --> API : Result.Success
API --> App : 200 OK

@enduml
```

### Push Notification Registration and Delivery

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "Mobile App" as App
participant "DevicesController" as API
participant "MediatR" as M
participant "RegisterDeviceHandler" as RH
participant "IPushNotificationService" as Push
participant "PushNotificationDispatcher" as Dispatcher
participant "IApplicationDbContext" as DB

== Device Registration ==

Photographer -> App : Login to mobile app
App -> App : Request push notification\npermission from OS
App -> App : Receive device token\nfrom APNs/FCM

App -> API : POST /api/devices/register\n{deviceToken: "abc123",\nplatform: "iOS"}
API -> M : Send(RegisterDeviceCommand)
M -> RH : Handle(command)
RH -> Push : RegisterDeviceTokenAsync(\nuserId, "abc123", "iOS")
RH --> M : Result.Success
API --> App : 200 OK

== Push Notification Delivery ==

note over Dispatcher
  Event occurs: client pays invoice
end note

Dispatcher -> DB : Get NotificationPreference\nfor InvoicePaymentReceived
DB --> Dispatcher : preference (push enabled)

Dispatcher -> DB : Create Notification\n{EventType: InvoicePaymentReceived}

Dispatcher -> Push : SendAsync(\nphotographerUserId,\n"Payment Received",\n"$150 from Jane Smith",\n"/invoices/{id}")

Push -> Push : Resolve device tokens\nfor user
Push -> Push : Route to APNs (iOS)\nor FCM (Android)

Push --> App : Push notification appears

Photographer -> App : Taps notification
App -> App : Navigate to invoice detail

@enduml
```

### Mobile Document Management

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "Mobile App" as App
participant "ContractsController" as CAPI
participant "QuestionnairesController" as QAPI
participant "MediatR" as M
participant "IApplicationDbContext" as DB
participant "IEmailService" as Email

== View Document Status ==

Photographer -> App : Open Documents tab
App -> CAPI : GET /api/contracts?\npage=1
CAPI -> M : Send(ListContractsQuery)
M --> CAPI : PagedList<ContractDto>
CAPI --> App : contracts with status\n(Draft, Sent, Signed)

App -> QAPI : GET /api/questionnaires?\npage=1
QAPI -> M : Send(ListQuestionnairesQuery)
M --> QAPI : PagedList<QuestionnaireDto>
QAPI --> App : questionnaires with status\n(Draft, Sent, Completed)

App -> App : Display documents\nwith status badges

== Share Contract from Mobile ==

Photographer -> App : Tap contract -> "Send"
App -> CAPI : POST /api/contracts/{id}/send
CAPI -> M : Send(SendContractCommand)

M -> DB : Update Contract\nStatus = Sent, SentAt = UtcNow
M -> DB : Get Contact email
M -> Email : SendAsync(contactEmail,\n"Contract for review")
M -> DB : SaveChangesAsync()

CAPI --> App : 200 OK
App -> App : Update status badge\nto "Sent"

@enduml
```
