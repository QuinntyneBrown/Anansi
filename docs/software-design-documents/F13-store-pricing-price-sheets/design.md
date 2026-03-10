# F13 - Store Pricing & Price Sheets

## Overview

Store Pricing & Price Sheets provides photographers with a comprehensive pricing management system for their online store products. At the individual product level, each size and variation carries a three-tier pricing structure: cost (the lab price or base cost), markup (the photographer's profit margin), and final price (what the client pays, which equals cost plus markup). Both manual price entry and percentage-based markup are supported, giving photographers flexibility to set prices either as absolute amounts or relative to lab costs.

The bulk markup tool enables photographers to apply a percentage-based markup to an entire product category (e.g., all canvas prints) in a single operation. This is critical for efficiency when labs change their pricing or when a photographer wants to standardize margins. The bulk tool respects individually customized prices by default, requiring explicit confirmation before overriding them, preventing accidental loss of per-variation pricing decisions.

Price sheets add a layer of contextual pricing: photographers can create multiple named price sheets, each containing a set of product variations with override prices. Different price sheets can be assigned to different collections, allowing, for example, wedding collections to use premium pricing while mini-session collections use promotional rates. Download-only price sheets restrict available products to digital downloads only (no physical products). A default price sheet can be designated to auto-apply to newly created collections. The platform also enforces a commission structure: free-plan photographers pay 15% platform commission on all store sales, while all paid plans have 0% commission, clearly displayed in account settings.

**L2 Requirements:** STR-2.3.1, STR-2.3.2, STR-2.3.3, STR-2.3.4

---

## Components

### Domain Layer (Anansi.Domain)

**ProductVariation** (`Entities/Store/ProductVariation.cs`) -- The primary carrier of per-variation pricing. Contains `CostCents` (lab or base cost), `MarkupCents` (photographer profit), `PriceCents` (client-facing total), and `IsCustomPriced` flag that protects individually set prices from bulk overwrite.

**PriceSheet** (`Entities/Store/PriceSheet.cs`) -- A named pricing context assignable to collections. Has a photographer owner, name, description, `IsDownloadOnly` flag (restricting to digital products), and `IsDefault` flag (auto-assigned to new collections). Owns a collection of `PriceSheetItem` entries.

**PriceSheetItem** (`Entities/Store/PriceSheetItem.cs`) -- A junction entity linking a `PriceSheet` to a `ProductVariation` with an override price. When a collection uses a specific price sheet, the item prices from the sheet take precedence over the base variation prices.

**Product** (`Entities/Store/Product.cs`) -- The parent entity owning variations. The `ProductType` field is used as the category key for bulk markup operations.

### Application Layer (Anansi.Application)

**ApplyBulkMarkup** (`Features/Store/Commands/ApplyBulkMarkup.cs`) -- Command/handler that applies a percentage markup to all active variations of a given `ProductType` for the authenticated photographer. Accepts `MarkupPercentage` and `OverrideCustomPriced` flag. Computes `MarkupCents = CostCents * percentage / 100` and `PriceCents = CostCents + MarkupCents` for each variation. Returns the count of updated variations.

**CreatePriceSheet** (`Features/Store/Commands/CreatePriceSheet.cs`) -- Command/handler that creates a new price sheet with optional inline items. If `IsDefault` is true, ensures no other sheet is currently default (or unsets the previous default).

**UpdatePriceSheet** -- Modifies price sheet metadata (name, description, download-only, default). Handles default-uniqueness constraint.

**DeletePriceSheet** -- Soft-deletes a price sheet. Does not affect orders already placed under that sheet's pricing.

**AddPriceSheetItems / RemovePriceSheetItems** -- Manages the set of product variation overrides within a price sheet.

**GetPriceSheets / GetPriceSheetById** -- Queries returning price sheet data with their items, including resolved product and variation names.

**ProductDto / BulkMarkupRequest** (`DTOs/Store/ProductDto.cs`) -- Request record carrying `ProductType`, `MarkupPercentage`, and `OverrideCustomPriced`.

**PriceSheetDto / PriceSheetItemDto** (`DTOs/Store/PriceSheetDto.cs`) -- DTOs for price sheet CRUD operations.

### API Layer (Anansi.Api)

**ProductsController** (`Controllers/ProductsController.cs`) -- Exposes `POST /api/products/bulk-markup` for the bulk markup tool.

**PriceSheetsController** (`Controllers/PriceSheetsController.cs`) -- RESTful controller for CRUD operations on price sheets and their items.

### Infrastructure Layer (Anansi.Infrastructure)

**ApplicationDbContext** -- Configures `PriceSheet` and `PriceSheetItem` entity mappings, including the foreign key from `PriceSheetItem` to `ProductVariation` and the cascade behavior on price sheet deletion.

---

## Class Diagrams

### Domain -- Pricing Model

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Store" {
  class Product {
    +Id : Guid
    +PhotographerId : Guid
    +Name : string
    +ProductType : ProductType
    +IsActive : bool
  }

  class ProductVariation {
    +Id : Guid
    +ProductId : Guid
    +Name : string
    +Sku : string?
    +CostCents : long
    +MarkupCents : long
    +PriceCents : long
    +IsCustomPriced : bool
    +IsActive : bool
  }

  class PriceSheet {
    +Id : Guid
    +PhotographerId : Guid
    +Name : string
    +Description : string?
    +IsDownloadOnly : bool
    +IsDefault : bool
    +IsDeleted : bool
    +DeletedAt : DateTime?
  }

  class PriceSheetItem {
    +Id : Guid
    +PriceSheetId : Guid
    +ProductVariationId : Guid
    +PriceCents : long
  }
}

Product "1" --> "*" ProductVariation : Variations
PriceSheet "1" --> "*" PriceSheetItem : Items
PriceSheetItem --> "1" ProductVariation : overrides price of

note right of ProductVariation
  Three-tier pricing:
  PriceCents = CostCents + MarkupCents
  IsCustomPriced protects from bulk overwrite
end note

note right of PriceSheetItem
  Override price takes precedence
  over base ProductVariation.PriceCents
  when this sheet is active
end note

@enduml
```

### Application -- Bulk Markup Command

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Store.Commands" {
  class ApplyBulkMarkupCommand <<record>> {
    +Request : BulkMarkupRequest
  }

  class ApplyBulkMarkupValidator {
    +ApplyBulkMarkupValidator()
  }

  class ApplyBulkMarkupHandler {
    -_db : IApplicationDbContext
    -_currentUser : ICurrentUserService
    +Handle(cmd, ct) : Result<int>
  }
}

package "Anansi.Application.DTOs.Store" {
  class BulkMarkupRequest <<record>> {
    +ProductType : ProductType
    +MarkupPercentage : decimal
    +OverrideCustomPriced : bool
  }
}

ApplyBulkMarkupCommand ..> BulkMarkupRequest
ApplyBulkMarkupHandler ..> ApplyBulkMarkupCommand
ApplyBulkMarkupValidator ..> ApplyBulkMarkupCommand

@enduml
```

### Application -- Price Sheet Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Store" {
  package "Commands" {
    class CreatePriceSheetCommand <<record>> {
      +Request : CreatePriceSheetRequest
    }
    class CreatePriceSheetHandler {
      +Handle(cmd, ct) : Result<PriceSheetDto>
    }

    class UpdatePriceSheetCommand <<record>> {
      +Id : Guid
      +Request : UpdatePriceSheetRequest
    }

    class DeletePriceSheetCommand <<record>> {
      +Id : Guid
    }
  }

  package "Queries" {
    class GetPriceSheetsQuery <<record>> {
      +Page : int
      +PageSize : int
    }
    class GetPriceSheetByIdQuery <<record>> {
      +Id : Guid
    }
  }
}

package "Anansi.Application.DTOs.Store" {
  class PriceSheetDto <<record>> {
    +Id : Guid
    +Name : string
    +IsDownloadOnly : bool
    +IsDefault : bool
    +Items : List<PriceSheetItemDto>
  }
  class PriceSheetItemDto <<record>> {
    +Id : Guid
    +ProductVariationId : Guid
    +ProductVariationName : string
    +PriceCents : long
  }
  class CreatePriceSheetRequest <<record>> {
    +Name : string
    +Description : string?
    +IsDownloadOnly : bool
    +IsDefault : bool
    +Items : List<CreatePriceSheetItemRequest>?
  }
}

CreatePriceSheetCommand ..> CreatePriceSheetRequest
CreatePriceSheetHandler ..> PriceSheetDto

@enduml
```

### API -- Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Api.Controllers" {
  class ProductsController {
    -_mediator : IMediator
    +ApplyBulkMarkup(request) : IActionResult
  }

  class PriceSheetsController {
    -_mediator : IMediator
    +GetPriceSheets(page, pageSize) : IActionResult
    +GetPriceSheet(id) : IActionResult
    +CreatePriceSheet(request) : IActionResult
    +UpdatePriceSheet(id, request) : IActionResult
    +DeletePriceSheet(id) : IActionResult
  }
}

package "MediatR" {
  interface IMediator
}

ProductsController --> IMediator
PriceSheetsController --> IMediator

@enduml
```

---

## Sequence Diagrams

### Apply Bulk Markup to Product Category

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "ProductsController" as ctrl
participant "IMediator" as med
participant "ApplyBulkMarkupValidator" as val
participant "ApplyBulkMarkupHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : POST /api/products/bulk-markup\n{productType=CanvasPrint,\nmarkupPercentage=50,\noverrideCustomPriced=false}
ctrl -> med : Send(ApplyBulkMarkupCommand)
med -> val : Validate
val --> med : pass
med -> handler : Handle(command, ct)
handler -> user : PhotographerId
user --> handler : Guid

handler -> db : ProductVariations\n.Include(Product)\n.Where(Product.ProductType == CanvasPrint\n&& Product.PhotographerId == pid\n&& IsActive)
db --> handler : List<ProductVariation>

loop for each variation
  alt IsCustomPriced && !overrideCustomPriced
    handler -> handler : Skip (preserve custom price)
  else
    handler -> handler : MarkupCents = CostCents * 50 / 100\nPriceCents = CostCents + MarkupCents
    handler -> handler : count++
  end
end

handler -> db : SaveChangesAsync()
db --> handler : success
handler --> med : Result<int>.Success(count)
med --> ctrl : Result
ctrl --> Photographer : 200 OK {updatedCount: 12}
@enduml
```

### Create Price Sheet with Items

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "PriceSheetsController" as ctrl
participant "IMediator" as med
participant "CreatePriceSheetHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : POST /api/pricesheets\n{name, isDefault=true, items[]}
ctrl -> med : Send(CreatePriceSheetCommand)
med -> handler : Handle(command, ct)
handler -> user : PhotographerId
user --> handler : Guid

alt isDefault == true
  handler -> db : PriceSheets\n.Where(PhotographerId == pid\n&& IsDefault)
  db --> handler : existing default sheet?
  alt exists
    handler -> handler : Set existing.IsDefault = false
  end
end

handler -> handler : Create PriceSheet entity

loop for each item in request.Items
  handler -> handler : Create PriceSheetItem\n(ProductVariationId, PriceCents)
end

handler -> db : PriceSheets.Add(priceSheet)
handler -> db : SaveChangesAsync()
db --> handler : success
handler -> handler : MapToDto(priceSheet)
handler --> med : Result<PriceSheetDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 201 Created {PriceSheetDto}
@enduml
```

### Resolve Effective Price for Collection

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "StorePageController" as ctrl
participant "ResolveCollectionPricesHandler" as handler
participant "IApplicationDbContext" as db

Client -> ctrl : GET /api/store/{collectionId}/products
ctrl -> handler : Handle(query)

handler -> db : Collection.FindAsync(collectionId)
db --> handler : Collection\n(PriceSheetId = guid or null)

alt Collection has assigned PriceSheet
  handler -> db : PriceSheetItems\n.Where(PriceSheetId == sheetId)\n.Include(ProductVariation.Product)
  db --> handler : List<PriceSheetItem>

  handler -> handler : Build product list\nusing PriceSheetItem.PriceCents\nas effective price
else No PriceSheet (use base prices)
  handler -> db : Products\n.Include(Variations)\n.Where(IsActive)
  db --> handler : List<Product>

  handler -> handler : Build product list\nusing ProductVariation.PriceCents\nas effective price
end

handler --> ctrl : List<StoreProductDto>
ctrl --> Client : 200 OK {products\nwith effective prices}
@enduml
```

### Commission Calculation on Order

```plantuml
@startuml
skinparam maxMessageSize 200
participant "CreateOrderHandler" as handler
participant "IApplicationDbContext" as db
participant "ICurrentUserService" as user

[-> handler : Handle(CreateOrderCommand)

handler -> db : Subscriptions\n.Where(PhotographerId)\n.FirstOrDefault(IsActive)
db --> handler : Subscription?

alt No active subscription (Free plan)
  handler -> handler : commissionPercentage = 15.0m
else Paid plan
  handler -> handler : commissionPercentage = 0.0m
end

handler -> handler : Calculate subtotal\nfrom order items
handler -> handler : CommissionCents =\n(SubtotalCents * commissionPercentage / 100)
handler -> handler : Set Order.CommissionCents\nand Order.CommissionPercentage

handler -> db : Orders.Add(order)
handler -> db : SaveChangesAsync()

[<-- handler : Result<OrderDto>

note right of handler
  STR-2.3.4:
  Free = 15% commission
  Paid = 0% commission
  Clearly displayed in account settings
end note
@enduml
```

### Set Individual Variation Price (Manual Override)

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "ProductsController" as ctrl
participant "IMediator" as med
participant "UpdateVariationPriceHandler" as handler
participant "IApplicationDbContext" as db

Photographer -> ctrl : PUT /api/products/{productId}/variations/{variationId}\n{costCents=500, markupCents=1000, priceCents=1500}
ctrl -> med : Send(UpdateVariationPriceCommand)
med -> handler : Handle(command, ct)

handler -> db : ProductVariations\n.Include(Product)\n.FirstAsync(id == variationId)
db --> handler : ProductVariation

handler -> handler : Verify ownership\n(Product.PhotographerId)
handler -> handler : Set CostCents = 500\nMarkupCents = 1000\nPriceCents = 1500\nIsCustomPriced = true

handler -> db : SaveChangesAsync()
db --> handler : success
handler --> med : Result<ProductVariationDto>
med --> ctrl : Result
ctrl --> Photographer : 200 OK {variationDto}
@enduml
```
