# F12 - Print Lab Integration & Fulfillment

## Overview

Print Lab Integration & Fulfillment handles the automated production and shipping pipeline that connects client orders to professional print laboratories. When a client purchases a lab-fulfilled product and payment is confirmed, the system automatically transmits the order to the photographer's configured print lab for production and direct-to-client shipping. All shipments are white-label, meaning no lab branding or platform branding appears on the packaging. The lab cost is deducted from the client payment, and the photographer retains the markup as profit. Lab color correction options are configurable on a per-product basis.

The platform integrates with a minimum of four lab partners: WHCC, ProDPI, Miller's, and Loxley Colour. Photographers select their preferred lab at the product or account level. Lab pricing (cost) is fetched via each lab's API and displayed alongside the photographer's markup and the final client-facing price, enabling transparent pricing management. Lab pricing auto-updates when labs change their rates, with the system periodically polling or receiving webhooks for pricing changes and storing the latest costs in the `LabProduct` catalog.

For products that are not lab-fulfilled, the self-fulfillment workflow applies: the photographer receives a notification containing order details and the client's shipping address, manually produces or procures the item, and marks the order as shipped with tracking information. The system supports both fulfillment models on a per-product basis, and a single order can contain a mix of lab-fulfilled and self-fulfilled items, each routed through its respective workflow.

**L2 Requirements:** STR-2.2.1, STR-2.2.2, STR-2.2.3, INT-8.2.1, INT-8.2.2

---

## Components

### Domain Layer (Anansi.Domain)

**LabOrder** (`Entities/Integrations/LabOrder.cs`) -- Represents a single order transmitted to a print lab. Tracks the lab name, external lab order ID, status (Pending, Transmitted, InProduction, Shipped, Delivered, Failed), image file reference, product specifications, size, quantity, full shipping address, cost breakdown (lab cost, markup, client price), tracking number, and timestamps for transmission and shipment.

**LabProduct** (`Entities/Integrations/LabProduct.cs`) -- A cached catalog entry representing a product available from a specific lab, with lab name, product name, category, size, cost in cents, availability flag, and a timestamp of when the price was last updated. Used for displaying lab pricing alongside photographer markup.

**LabPartner** (`Enums/LabPartner.cs`) -- Enumerates supported labs: WHCC, ProDPI, Millers, LoxleyColour.

**LabOrderStatus** (`Enums/LabOrderStatus.cs`) -- Tracks the lifecycle of a lab order: Pending, Transmitted, InProduction, Shipped, Delivered, Failed.

**Order** (`Entities/Store/Order.cs`) -- The store order entity, which includes `FulfillmentType`, `LabPartner`, and `LabOrderReference` fields linking it to the lab fulfillment pipeline.

### Application Layer (Anansi.Application)

**ILabIntegrationService** (`Interfaces/ILabIntegrationService.cs`) -- The abstraction over lab partner APIs. Exposes `SubmitOrderAsync` (transmit order to lab, returns external order ID), `GetOrderStatusAsync` (poll lab for current status and tracking), and `GetPricingAsync` (fetch current lab product catalog with costs).

**SubmitLabOrderCommand** (`Features/Integrations/Commands/`) -- Command/handler invoked when a paid order contains lab-fulfilled items. Builds a `LabOrderRequest`, calls `ILabIntegrationService.SubmitOrderAsync`, creates a `LabOrder` record, and updates the store `Order` with the lab reference.

**GetLabPricingQuery** (`Features/Integrations/Queries/`) -- Query that retrieves cached lab pricing from `LabProduct` records, optionally refreshing from the lab API if stale.

**IApplicationDbContext** -- Exposes `DbSet<LabOrder>` and `DbSet<LabProduct>` for persistence.

### API Layer (Anansi.Api)

**LabsController** (`Controllers/LabsController.cs`) -- Exposes `GET /api/labs/pricing/{labName}` (retrieve lab product catalog with costs) and `POST /api/labs/orders` (manually submit a lab order).

**OrdersController** (`Controllers/OrdersController.cs`) -- The `PUT /api/orders/{id}/status` endpoint allows photographers to update fulfillment status and add tracking info for self-fulfilled orders.

### Infrastructure Layer (Anansi.Infrastructure)

**LabIntegrationService** -- Concrete implementation of `ILabIntegrationService`. Contains adapter logic for each supported lab's API (WHCC, ProDPI, Miller's, Loxley Colour). Handles authentication, request/response mapping, and error handling per lab. Uses `HttpClient` with named clients for each lab.

**LabPricingSyncJob** -- A background hosted service (or Hangfire recurring job) that periodically polls each lab's pricing API and upserts `LabProduct` records, keeping cached pricing current (INT-8.2.2).

---

## Class Diagrams

### Domain -- Lab Integration Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Integrations" {
  class LabOrder {
    +Id : Guid
    +PhotographerId : Guid
    +StoreOrderId : Guid?
    +LabName : string
    +ExternalLabOrderId : string?
    +Status : LabOrderStatus
    +ImageFileKey : string
    +ProductSpecifications : string
    +Size : string
    +Quantity : int
    +ShippingName : string
    +ShippingAddress : string
    +ShippingCity : string
    +ShippingProvince : string
    +ShippingPostalCode : string
    +ShippingCountry : string
    +LabCostCents : long
    +MarkupCents : long
    +ClientPriceCents : long
    +TrackingNumber : string?
    +TransmittedAt : DateTime?
    +ShippedAt : DateTime?
  }

  class LabProduct {
    +Id : Guid
    +LabName : string
    +ProductName : string
    +Category : string
    +Size : string
    +LabCostCents : long
    +PriceLastUpdated : DateTime
    +IsAvailable : bool
  }
}

package "Anansi.Domain.Enums" {
  enum LabPartner {
    WHCC
    ProDPI
    Millers
    LoxleyColour
  }

  enum LabOrderStatus {
    Pending
    Transmitted
    InProduction
    Shipped
    Delivered
    Failed
  }
}

LabOrder ..> LabOrderStatus
LabOrder ..> LabPartner : LabName maps to

@enduml
```

### Domain -- Order-to-Lab Relationship

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Store" {
  class Order {
    +Id : Guid
    +PhotographerId : Guid
    +Status : OrderStatus
    +FulfillmentType : FulfillmentType
    +LabPartner : LabPartner?
    +LabOrderReference : string?
    +TrackingNumber : string?
    +TrackingUrl : string?
  }

  class OrderItem {
    +Id : Guid
    +OrderId : Guid
    +ProductId : Guid
    +ProductVariationId : Guid?
    +SelectedPhotoUrl : string?
  }

  class Product {
    +Id : Guid
    +FulfillmentType : FulfillmentType
    +LabPartner : LabPartner?
    +LabColorCorrectionEnabled : bool
  }
}

package "Anansi.Domain.Entities.Integrations" {
  class LabOrder {
    +Id : Guid
    +StoreOrderId : Guid?
    +ExternalLabOrderId : string?
    +Status : LabOrderStatus
  }
}

Order "1" --> "*" OrderItem : Items
OrderItem --> "1" Product
Order "1" ..> "0..*" LabOrder : StoreOrderId
@enduml
```

### Application -- Lab Integration Service Interface

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Interfaces" {
  interface ILabIntegrationService {
    +SubmitOrderAsync(request, ct) : Task<string>
    +GetOrderStatusAsync(labName, externalOrderId, ct) : Task<LabOrderStatusResult>
    +GetPricingAsync(labName, ct) : Task<IReadOnlyList<LabPricingResult>>
  }

  class LabOrderRequest {
    +LabName : string
    +ImageFileUrl : string
    +ProductSpecifications : string
    +Size : string
    +Quantity : int
    +ShippingName : string
    +ShippingAddress : string
    +ShippingCity : string
    +ShippingProvince : string
    +ShippingPostalCode : string
    +ShippingCountry : string
  }

  class LabOrderStatusResult {
    +Status : string
    +TrackingNumber : string?
  }

  class LabPricingResult {
    +ProductName : string
    +Category : string
    +Size : string
    +LabCostCents : long
  }
}

package "Anansi.Infrastructure.Services" {
  class LabIntegrationService {
    -_httpClientFactory : IHttpClientFactory
    +SubmitOrderAsync(request, ct) : Task<string>
    +GetOrderStatusAsync(labName, externalOrderId, ct) : Task<LabOrderStatusResult>
    +GetPricingAsync(labName, ct) : Task<IReadOnlyList<LabPricingResult>>
  }
}

LabIntegrationService ..|> ILabIntegrationService
ILabIntegrationService ..> LabOrderRequest
ILabIntegrationService ..> LabOrderStatusResult
ILabIntegrationService ..> LabPricingResult

@enduml
```

### Infrastructure -- Lab Adapters

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Infrastructure.Services" {
  class LabIntegrationService {
    -_httpClientFactory : IHttpClientFactory
    -_adapters : Dictionary<string, ILabAdapter>
    +SubmitOrderAsync(request, ct) : Task<string>
    +GetOrderStatusAsync(labName, orderId, ct) : Task<LabOrderStatusResult>
    +GetPricingAsync(labName, ct) : Task<IReadOnlyList<LabPricingResult>>
  }

  interface ILabAdapter {
    +LabName : string
    +SubmitAsync(request, ct) : Task<string>
    +GetStatusAsync(orderId, ct) : Task<LabOrderStatusResult>
    +GetPricingAsync(ct) : Task<IReadOnlyList<LabPricingResult>>
  }

  class WhccAdapter {
    +LabName : string = "WHCC"
  }
  class ProDpiAdapter {
    +LabName : string = "ProDPI"
  }
  class MillersAdapter {
    +LabName : string = "Millers"
  }
  class LoxleyAdapter {
    +LabName : string = "LoxleyColour"
  }

  class LabPricingSyncJob {
    -_serviceScopeFactory : IServiceScopeFactory
    +ExecuteAsync(ct) : Task
  }
}

LabIntegrationService --> ILabAdapter : routes by LabName
WhccAdapter ..|> ILabAdapter
ProDpiAdapter ..|> ILabAdapter
MillersAdapter ..|> ILabAdapter
LoxleyAdapter ..|> ILabAdapter
LabPricingSyncJob --> ILabAdapter : polls pricing

@enduml
```

---

## Sequence Diagrams

### Automatic Lab Fulfillment on Payment

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "Checkout Flow" as checkout
participant "IPaymentService" as payment
participant "CreateOrderHandler" as orderHandler
participant "IApplicationDbContext" as db
participant "ILabIntegrationService" as labService
participant "Print Lab API" as labApi

Client -> checkout : Complete purchase\n(lab-fulfilled product)
checkout -> payment : CreatePaymentIntentAsync()
payment --> checkout : PaymentIntent confirmed

checkout -> orderHandler : Handle(CreateOrderCommand)
orderHandler -> db : Create Order entity\n(FulfillmentType=Lab)
orderHandler -> db : SaveChangesAsync()
db --> orderHandler : Order persisted

loop for each lab-fulfilled OrderItem
  orderHandler -> labService : SubmitOrderAsync(\nLabOrderRequest)
  labService -> labApi : POST /orders\n{image, specs, shipping}
  labApi --> labService : {externalOrderId}
  labService --> orderHandler : externalOrderId

  orderHandler -> db : Create LabOrder record\n(status=Transmitted)
  orderHandler -> db : Update Order.LabOrderReference
end

orderHandler -> db : SaveChangesAsync()
db --> orderHandler : success
orderHandler --> checkout : Result<OrderDto>
checkout --> Client : Order confirmation
@enduml
```

### Self-Fulfillment Workflow

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
actor Photographer
participant "CreateOrderHandler" as orderHandler
participant "IApplicationDbContext" as db
participant "IEmailService" as email
participant "OrdersController" as ctrl
participant "IMediator" as med
participant "UpdateOrderStatusHandler" as statusHandler

Client -> orderHandler : Order placed\n(self-fulfilled product)
orderHandler -> db : Create Order\n(FulfillmentType=SelfFulfilled,\nstatus=Processing)
orderHandler -> db : SaveChangesAsync()
db --> orderHandler : success

orderHandler -> email : Send notification to photographer\n{orderDetails, shippingAddress, items}
email --> orderHandler : sent
orderHandler --> Client : Order confirmation

== Photographer fulfills order ==

Photographer -> ctrl : PUT /api/orders/{id}/status\n{status=Shipped,\ntrackingNumber, trackingUrl}
ctrl -> med : Send(UpdateOrderStatusCommand)
med -> statusHandler : Handle(command, ct)
statusHandler -> db : Find Order by ID
db --> statusHandler : Order entity
statusHandler -> statusHandler : Set Status=Shipped,\nTrackingNumber, TrackingUrl
statusHandler -> db : SaveChangesAsync()
db --> statusHandler : success

statusHandler -> email : Send shipping notification\nto client with tracking
email --> statusHandler : sent

statusHandler --> med : Result<OrderDto>
med --> ctrl : Result
ctrl --> Photographer : 200 OK
@enduml
```

### Fetch Lab Pricing

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "LabsController" as ctrl
participant "IMediator" as med
participant "GetLabPricingHandler" as handler
participant "IApplicationDbContext" as db
participant "ILabIntegrationService" as labService
participant "Print Lab API" as labApi

Photographer -> ctrl : GET /api/labs/pricing/WHCC
ctrl -> med : Send(GetLabPricingQuery("WHCC"))
med -> handler : Handle(query, ct)

handler -> db : LabProducts\n.Where(labName == "WHCC")\n.OrderBy(Category, Size)
db --> handler : List<LabProduct>

alt cached data is stale (>24h)
  handler -> labService : GetPricingAsync("WHCC")
  labService -> labApi : GET /pricing
  labApi --> labService : [{product, size, cost}...]
  labService --> handler : List<LabPricingResult>
  handler -> db : Upsert LabProduct records
  handler -> db : SaveChangesAsync()
end

handler -> handler : Map to LabPricingDto list
handler --> med : Result<List<LabPricingDto>>
med --> ctrl : Result
ctrl --> Photographer : 200 OK {labPricing[]}
@enduml
```

### Lab Pricing Auto-Sync (Background Job)

```plantuml
@startuml
skinparam maxMessageSize 200
participant "LabPricingSyncJob" as job
participant "ILabAdapter" as adapter
participant "Print Lab API" as labApi
participant "IApplicationDbContext" as db

[-> job : Timer triggers\n(every 24 hours)

loop for each LabPartner [WHCC, ProDPI, Millers, LoxleyColour]
  job -> adapter : GetPricingAsync(ct)
  adapter -> labApi : GET /pricing
  labApi --> adapter : pricing catalog
  adapter --> job : List<LabPricingResult>

  loop for each LabPricingResult
    job -> db : Find LabProduct by\n(labName, productName, size)
    alt exists
      job -> db : Update LabCostCents,\nPriceLastUpdated
    else new product
      job -> db : Create new LabProduct
    end
  end

  job -> db : SaveChangesAsync()
end

[<-- job : Sync complete
@enduml
```

### Lab Order Status Polling

```plantuml
@startuml
skinparam maxMessageSize 200
participant "OrderStatusPollingJob" as job
participant "IApplicationDbContext" as db
participant "ILabIntegrationService" as labService
participant "Print Lab API" as labApi
participant "IEmailService" as email

[-> job : Timer triggers\n(every 1 hour)

job -> db : LabOrders\n.Where(Status in\n[Transmitted, InProduction])
db --> job : List<LabOrder>

loop for each pending LabOrder
  job -> labService : GetOrderStatusAsync(\nlabName, externalOrderId)
  labService -> labApi : GET /orders/{id}/status
  labApi --> labService : {status, trackingNumber}
  labService --> job : LabOrderStatusResult

  alt status changed
    job -> db : Update LabOrder.Status,\nTrackingNumber
    alt status == Shipped
      job -> db : Update parent Order\nTrackingNumber, Status
      job -> email : Notify client\nwith tracking info
    end
  end
end

job -> db : SaveChangesAsync()
[<-- job : Poll complete
@enduml
```
