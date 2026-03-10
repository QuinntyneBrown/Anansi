# F15 - Store Checkout & Orders

## Overview

Store Checkout & Orders is the transactional core of the Anansi Online Store, handling the complete purchase lifecycle from cart submission through payment processing, tax and shipping calculation, discount application, order creation, fulfillment routing, and ongoing order management. The checkout flow accepts multiple payment methods -- credit/debit cards, Apple Pay, Google Pay, PayPal, and offline payments -- with Stripe as the primary payment processor. The system creates a Stripe PaymentIntent (or PayPal order) based on the chosen method, applies any coupon or gift card discounts, calculates taxes and shipping, and upon successful payment confirmation, persists the order and routes items to the appropriate fulfillment channel.

Tax configuration allows photographers to define tax rates by region or jurisdiction (e.g., state, province, country). During checkout, the system determines the applicable tax rate based on the client's shipping address and applies it to the taxable order subtotal. Tax amounts are tracked per order and flow into financial reports. Shipping configuration supports multiple delivery methods (standard, express, etc.) with flat-rate costs and estimated delivery windows. Shipping costs are calculated at checkout based on the selected method. Free shipping can be achieved through coupon codes.

Order management provides photographers with a comprehensive dashboard to view order details, payment status, fulfillment status, and tracking information. Orders are searchable by client name or email and filterable by status. Real-time notifications alert photographers to new orders via in-app notifications and optionally email. The order status lifecycle flows from Pending through Processing, Shipped, Delivered, with branching paths for Cancelled and Refunded states. For lab-fulfilled orders, status updates propagate from the lab integration layer; for self-fulfilled orders, the photographer manually updates status and adds tracking information.

**L2 Requirements:** STR-2.5.1, STR-2.5.2, STR-2.5.3, STR-2.5.4

---

## Components

### Domain Layer (Anansi.Domain)

**Order** (`Entities/Store/Order.cs`) -- The aggregate root for store orders. Contains client contact info, full shipping address, order status, payment method, Stripe payment intent ID, financial breakdown (subtotal, tax, shipping, discount, total, commission), applied coupon and gift card codes, tracking info, shipping method reference, fulfillment type, and lab partner. Owns a collection of `OrderItem` children.

**OrderItem** (`Entities/Store/OrderItem.cs`) -- A line item in an order, referencing the purchased product and optional variation. Captures the product name, variation name, quantity, unit price, total price (all in cents at time of purchase), and the selected photo URL for print products.

**TaxRate** (`Entities/Store/TaxRate.cs`) -- A per-region tax rate configured by the photographer. Contains the region identifier (state, province, country code), tax percentage, name, and active flag.

**ShippingMethod** (`Entities/Store/ShippingMethod.cs`) -- A shipping option with name, description, flat-rate cost in cents, estimated delivery timeframe, and active flag.

**OrderStatus** (`Enums/OrderStatus.cs`) -- Lifecycle states: Pending, Processing, Shipped, Delivered, Cancelled, Refunded.

**PaymentMethod** (`Enums/PaymentMethod.cs`) -- Accepted payment methods: CreditCard, DebitCard, ApplePay, GooglePay, PayPal, BankTransfer, Klarna, Affirm, TapToPay, Offline, GiftCard.

### Application Layer (Anansi.Application)

**CreateOrder** -- The primary checkout command/handler. Validates the cart items, resolves effective prices (base or price-sheet override), calculates subtotal, applies coupon discount, applies gift card balance, looks up the applicable tax rate by shipping region, adds shipping cost, computes commission (15% free plan, 0% paid), creates the Order and OrderItems, processes payment via `IPaymentService` or `IPayPalService`, and routes to fulfillment (lab submission or photographer notification).

**UpdateOrderStatus** -- Allows photographers to update order status and add tracking information. Used for self-fulfillment workflow and manual corrections.

**GetOrders** -- Paginated query with filtering by `OrderStatus` and text search across client name and email.

**GetOrderById** -- Single-order detail query including all line items.

**CreateTaxRate / UpdateTaxRate / DeleteTaxRate** -- CRUD commands for managing per-region tax rates.

**CreateShippingMethod / UpdateShippingMethod / DeleteShippingMethod** -- CRUD commands for managing shipping options.

**IPaymentService** (`Interfaces/IPaymentService.cs`) -- Stripe abstraction exposing `CreatePaymentIntentAsync`, `CreateCheckoutSessionAsync`, `RefundAsync`, and `CreateConnectedAccountAsync`.

**IPayPalService** (`Interfaces/IPayPalService.cs`) -- PayPal abstraction exposing `CreateOrderAsync`, `CaptureOrderAsync`, and `RefundAsync`.

**IEmailService** (`Interfaces/IEmailService.cs`) -- Used to send order confirmation emails to clients and new-order notifications to photographers.

### API Layer (Anansi.Api)

**OrdersController** (`Controllers/OrdersController.cs`) -- Exposes `GET /api/orders` (list with filter/search/pagination), `GET /api/orders/{id}` (detail), `POST /api/orders` (checkout), and `PUT /api/orders/{id}/status` (update status/tracking).

**TaxRatesController** (`Controllers/TaxRatesController.cs`) -- CRUD endpoints for tax rate management.

**ShippingMethodsController** (`Controllers/ShippingMethodsController.cs`) -- CRUD endpoints for shipping method management.

### Infrastructure Layer (Anansi.Infrastructure)

**StripePaymentService** -- Concrete implementation of `IPaymentService` using the Stripe .NET SDK. Handles payment intent creation, checkout session setup, and refund processing against the photographer's Stripe Connected Account.

**PayPalService** -- Concrete implementation of `IPayPalService` using PayPal's REST API.

**ApplicationDbContext** -- Configures Order, OrderItem, TaxRate, and ShippingMethod entity mappings, including the Order -> ShippingMethod navigation and cascade delete behavior for order items.

---

## Class Diagrams

### Domain -- Order Aggregate

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Store" {
  class Order {
    +Id : Guid
    +PhotographerId : Guid
    +ClientName : string
    +ClientEmail : string
    +ClientPhone : string?
    +ShippingAddress : string?
    +ShippingCity : string?
    +ShippingProvince : string?
    +ShippingPostalCode : string?
    +ShippingCountry : string?
    +Status : OrderStatus
    +PaymentMethod : PaymentMethod
    +PaymentIntentId : string?
    +SubtotalCents : long
    +TaxCents : long
    +ShippingCents : long
    +DiscountCents : long
    +TotalCents : long
    +CommissionCents : long
    +CommissionPercentage : decimal
    +CouponCode : string?
    +GiftCardCode : string?
    +TrackingNumber : string?
    +TrackingUrl : string?
    +ShippingMethodId : Guid?
    +FulfillmentType : FulfillmentType
    +LabPartner : LabPartner?
    +LabOrderReference : string?
    +IsDeleted : bool
  }

  class OrderItem {
    +Id : Guid
    +OrderId : Guid
    +ProductId : Guid
    +ProductVariationId : Guid?
    +ProductName : string
    +VariationName : string?
    +Quantity : int
    +UnitPriceCents : long
    +TotalCents : long
    +SelectedPhotoUrl : string?
  }

  class ShippingMethod {
    +Id : Guid
    +PhotographerId : Guid
    +Name : string
    +Description : string?
    +CostCents : long
    +EstimatedDelivery : string?
    +IsActive : bool
  }
}

Order "1" --> "*" OrderItem : Items
Order --> "0..1" ShippingMethod : ShippingMethodNavigation
OrderItem --> "1" Product : Product
OrderItem --> "0..1" ProductVariation : ProductVariation

@enduml
```

### Domain -- Tax & Shipping Configuration

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Store" {
  class TaxRate {
    +Id : Guid
    +PhotographerId : Guid
    +Name : string
    +Region : string
    +Percentage : decimal
    +IsActive : bool
    +IsDeleted : bool
    +DeletedAt : DateTime?
  }

  class ShippingMethod {
    +Id : Guid
    +PhotographerId : Guid
    +Name : string
    +Description : string?
    +CostCents : long
    +EstimatedDelivery : string?
    +IsActive : bool
    +IsDeleted : bool
    +DeletedAt : DateTime?
  }
}

package "Anansi.Domain.Enums" {
  enum OrderStatus {
    Pending
    Processing
    Shipped
    Delivered
    Cancelled
    Refunded
  }

  enum PaymentMethod {
    CreditCard
    DebitCard
    ApplePay
    GooglePay
    PayPal
    Offline
    GiftCard
  }
}

note bottom of TaxRate
  STR-2.5.2: Rates configurable by region
  Auto-calculated at checkout
  Tracked in financial reports
end note

note bottom of ShippingMethod
  STR-2.5.3: Multiple delivery methods
  Flat-rate cost calculation
  Free shipping via coupon codes
end note

@enduml
```

### Application -- Checkout Command & Payment Interfaces

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Store.Commands" {
  class CreateOrderCommand <<record>> {
    +Request : CreateOrderRequest
  }
  class CreateOrderHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
    -_paymentService : IPaymentService
    -_payPalService : IPayPalService
    -_emailService : IEmailService
    -_labService : ILabIntegrationService
    +Handle(cmd, ct) : Result<OrderDto>
  }

  class UpdateOrderStatusCommand <<record>> {
    +Id : Guid
    +Request : UpdateOrderStatusRequest
  }
}

package "Anansi.Application.Interfaces" {
  interface IPaymentService {
    +CreatePaymentIntentAsync(...) : Task<string>
    +RefundAsync(...) : Task
  }

  interface IPayPalService {
    +CreateOrderAsync(...) : Task<string>
    +CaptureOrderAsync(...) : Task<PayPalCaptureResult>
    +RefundAsync(...) : Task
  }

  interface ILabIntegrationService {
    +SubmitOrderAsync(...) : Task<string>
  }

  interface IEmailService
}

CreateOrderHandler ..> CreateOrderCommand
CreateOrderHandler --> IPaymentService
CreateOrderHandler --> IPayPalService
CreateOrderHandler --> ILabIntegrationService
CreateOrderHandler --> IEmailService

@enduml
```

### API -- Store Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Api.Controllers" {
  class OrdersController {
    -_mediator : IMediator
    +GetOrders(status?, search?, page, pageSize) : IActionResult
    +GetOrder(id) : IActionResult
    +CreateOrder(request) : IActionResult
    +UpdateOrderStatus(id, request) : IActionResult
  }

  class TaxRatesController {
    -_mediator : IMediator
    +GetTaxRates() : IActionResult
    +CreateTaxRate(request) : IActionResult
    +UpdateTaxRate(id, request) : IActionResult
    +DeleteTaxRate(id) : IActionResult
  }

  class ShippingMethodsController {
    -_mediator : IMediator
    +GetShippingMethods() : IActionResult
    +CreateShippingMethod(request) : IActionResult
    +UpdateShippingMethod(id, request) : IActionResult
    +DeleteShippingMethod(id) : IActionResult
  }
}

package "MediatR" {
  interface IMediator
}

OrdersController --> IMediator
TaxRatesController --> IMediator
ShippingMethodsController --> IMediator

@enduml
```

---

## Sequence Diagrams

### Complete Checkout Flow (Stripe)

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "OrdersController" as ctrl
participant "IMediator" as med
participant "CreateOrderHandler" as handler
participant "IApplicationDbContext" as db
participant "IPaymentService" as stripe
participant "IEmailService" as email

Client -> ctrl : POST /api/orders\n{clientName, email, items[],\nshippingMethodId, couponCode,\npaymentMethod=CreditCard}
ctrl -> med : Send(CreateOrderCommand)
med -> handler : Handle(command, ct)

== Price Resolution ==
handler -> db : Resolve effective prices\nfor each item (base or price sheet)
db --> handler : prices resolved

== Subtotal ==
handler -> handler : Calculate subtotal\nsum(unitPrice * qty)

== Coupon Discount ==
alt couponCode provided
  handler -> db : Coupons.FirstOrDefault(code)
  db --> handler : Coupon entity
  handler -> handler : Validate & calculate discount
  handler -> handler : Increment coupon.TimesUsed
end

== Gift Card ==
alt giftCardCode provided
  handler -> db : GiftCards.FirstOrDefault(code)
  db --> handler : GiftCard entity
  handler -> handler : Deduct balance\n(min of balance, remaining total)
end

== Tax Calculation ==
handler -> db : TaxRates\n.FirstOrDefault(Region matches\nshipping address)
db --> handler : TaxRate (e.g., 13%)
handler -> handler : TaxCents =\n(SubtotalCents - DiscountCents) * 13%

== Shipping ==
handler -> db : ShippingMethods.FindAsync(id)
db --> handler : ShippingMethod
handler -> handler : ShippingCents = method.CostCents

== Commission ==
handler -> handler : Determine plan tier\n(Free=15%, Paid=0%)
handler -> handler : CommissionCents =\nSubtotalCents * commissionRate

== Total ==
handler -> handler : TotalCents =\nSubtotal - Discount + Tax + Shipping

== Payment ==
handler -> stripe : CreatePaymentIntentAsync(\ntotalCents, "cad", stripeAccountId)
stripe --> handler : paymentIntentId

== Persist ==
handler -> db : Create Order + OrderItems
handler -> db : SaveChangesAsync()
db --> handler : success

== Notify ==
handler -> email : Send order confirmation to client
handler -> email : Send new-order notification\nto photographer

handler --> med : Result<OrderDto>.Success
med --> ctrl : Result
ctrl --> Client : 201 Created {OrderDto}
@enduml
```

### Checkout with PayPal

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "OrdersController" as ctrl
participant "CreateOrderHandler" as handler
participant "IPayPalService" as paypal
participant "IApplicationDbContext" as db
participant "IEmailService" as email

Client -> ctrl : POST /api/orders\n{paymentMethod=PayPal, ...}
ctrl -> handler : Handle(command, ct)

handler -> handler : Calculate subtotal,\ndiscount, tax, shipping, total\n(same as Stripe flow)

handler -> paypal : CreateOrderAsync(\npaypalEmail, totalCents, "CAD",\ndescription, returnUrl, cancelUrl)
paypal --> handler : paypalOrderId

handler --> Client : 200 OK\n{paypalOrderId, approvalUrl}

== Client approves on PayPal ==

Client -> ctrl : POST /api/orders/paypal/capture\n{paypalOrderId}
ctrl -> handler : Handle(CapturePayPalCommand)

handler -> paypal : CaptureOrderAsync(paypalOrderId)
paypal --> handler : PayPalCaptureResult\n(isSuccess=true, captureId)

handler -> db : Create Order + OrderItems\n(PaymentIntentId = captureId)
handler -> db : SaveChangesAsync()
db --> handler : success

handler -> email : Send confirmations
handler --> ctrl : Result<OrderDto>
ctrl --> Client : 201 Created {OrderDto}
@enduml
```

### Offline Payment Recording

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "OrdersController" as ctrl
participant "IMediator" as med
participant "CreateOrderHandler" as handler
participant "IApplicationDbContext" as db
participant "IEmailService" as email

Photographer -> ctrl : POST /api/orders\n{paymentMethod=Offline,\nclientName, items[], ...}
ctrl -> med : Send(CreateOrderCommand)
med -> handler : Handle(command, ct)

handler -> handler : Calculate subtotal, tax,\nshipping, discount, total

handler -> handler : Skip payment processor\n(Offline method)

handler -> db : Create Order entity\n(Status=Processing,\nPaymentMethod=Offline,\nPaymentIntentId=null)
handler -> db : Create OrderItems
handler -> db : SaveChangesAsync()
db --> handler : success

handler -> email : Send order confirmation to client
email --> handler : sent

handler --> med : Result<OrderDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 201 Created {OrderDto}

note right of handler
  Offline orders go directly
  to Processing status.
  Photographer records
  cash/check payment externally.
end note
@enduml
```

### Tax Rate Configuration

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "TaxRatesController" as ctrl
participant "IMediator" as med
participant "CreateTaxRateHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : POST /api/taxrates\n{name="Ontario HST",\nregion="ON",\npercentage=13.00}
ctrl -> med : Send(CreateTaxRateCommand)
med -> handler : Handle(command, ct)
handler -> user : PhotographerId
user --> handler : Guid

handler -> handler : Build TaxRate entity\n(PhotographerId, name, region, percentage)
handler -> db : TaxRates.Add(taxRate)
handler -> db : SaveChangesAsync()
db --> handler : success

handler --> med : Result<TaxRateDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 201 Created {TaxRateDto}
@enduml
```

### Order Status Update with Tracking

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "OrdersController" as ctrl
participant "IMediator" as med
participant "UpdateOrderStatusHandler" as handler
participant "IApplicationDbContext" as db
participant "IEmailService" as email

Photographer -> ctrl : PUT /api/orders/{id}/status\n{status=Shipped,\ntrackingNumber="1Z999...",\ntrackingUrl="https://ups.com/..."}
ctrl -> med : Send(UpdateOrderStatusCommand)
med -> handler : Handle(command, ct)

handler -> db : Orders\n.Include(Items)\n.FirstAsync(id)
db --> handler : Order entity

handler -> handler : Verify ownership
handler -> handler : Validate status transition\n(Processing -> Shipped)

handler -> handler : Set Status = Shipped\nTrackingNumber = "1Z999..."\nTrackingUrl = "https://..."

handler -> db : SaveChangesAsync()
db --> handler : success

handler -> email : Send shipping notification\nto client {trackingNumber, trackingUrl}
email --> handler : sent

handler --> med : Result<OrderDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 200 OK {OrderDto}
@enduml
```

### Search and Filter Orders

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "OrdersController" as ctrl
participant "IMediator" as med
participant "GetOrdersHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : GET /api/orders?\nstatus=Shipped&search=jane&page=1&pageSize=20
ctrl -> med : Send(GetOrdersQuery)
med -> handler : Handle(query, ct)

handler -> user : PhotographerId
user --> handler : Guid

handler -> db : Orders\n.Where(PhotographerId == pid)\n.Where(Status == Shipped)\n.Where(ClientName.Contains("jane")\n|| ClientEmail.Contains("jane"))\n.Include(Items)\n.OrderByDescending(CreatedAt)\n.Skip(0).Take(20)
db --> handler : List<Order>, totalCount

handler -> handler : Map to List<OrderDto>
handler --> med : Result<PagedList<OrderDto>>
med --> ctrl : Result
ctrl --> Photographer : 200 OK\n{items[], page, totalCount, totalPages}
@enduml
```
