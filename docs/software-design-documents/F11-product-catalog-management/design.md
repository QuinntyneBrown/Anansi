# F11 - Product Catalog Management

## Overview

Product Catalog Management is the foundation of the Anansi Online Store, enabling photographers to configure and sell a wide range of physical and digital products through their client galleries. The feature encompasses six distinct product categories: print products (photographic prints across multiple substrates including canvas, metal, wood, bamboo, mounted, framed, wall art, large format, square, and standouts), photo albums and books with extensive customization options, greeting cards with a built-in template designer, digital downloads with configurable resolutions and auto-delivery, bundled packages combining physical and digital items, and self-fulfilled custom products managed entirely by the photographer.

Each product type supports configurable size and variation options with independent pricing per variation. Print products include a photo overlay preview system that composites the client's selected image onto the product mockup, giving clients a realistic visualization before purchase. Albums and books expose hundreds of customization axes (cover type, paper stock, dimensions, page count) and leverage a bulk pricing markup tool so photographers can efficiently set margins across all variations. Greeting cards integrate a template-driven designer where clients choose from hundreds of pre-built layouts and customize them with their photos.

Digital downloads support both single-image and full-gallery delivery at photographer-defined resolutions, with automatic file delivery triggered upon payment confirmation. Packages allow photographers to bundle any combination of physical and digital products into a single purchasable item at a set price. Self-fulfilled products provide a lightweight mechanism for photographers to sell custom goods (e.g., USB drives, custom frames) where the platform notifies the photographer with order details and shipping address, and the photographer handles production and shipping independently.

**L2 Requirements:** STR-2.1.1, STR-2.1.2, STR-2.1.3, STR-2.1.4, STR-2.1.5, STR-2.1.6

---

## Components

### Domain Layer (Anansi.Domain)

**Product** (`Entities/Store/Product.cs`) -- The aggregate root for all store products. Holds the product name, description, type (from `ProductType` enum covering 17 substrate/product types), fulfillment type (Lab, SelfFulfilled, Digital), optional lab partner assignment, color correction toggle, photo overlay preview URL, and digital resolution options. Owns a collection of `ProductVariation` children and, for packages, a collection of `PackageItem` children.

**ProductVariation** (`Entities/Store/ProductVariation.cs`) -- Represents a specific size or configuration option within a product. Each variation carries its own SKU, lab cost (in cents), markup (in cents), final client-facing price (in cents), and a flag indicating whether the price was individually customized or set by a bulk operation. The three-tier pricing model (cost + markup = price) is central to the store's revenue mechanics.

**PackageItem** (`Entities/Store/PackageItem.cs`) -- A join entity linking a package-type `Product` to one or more included products and their optional variations, with a quantity. This enables photographers to compose bundles of prints, albums, and digital downloads into a single purchasable package.

**ProductType** (`Enums/ProductType.cs`) -- Enumerates all supported product categories: Print, MountedPrint, CanvasPrint, MetalPrint, WoodPrint, FramedPrint, WallArt, LargeFormat, SquarePrint, Standout, BambooPanel, Album, Book, GreetingCard, DigitalDownload, Package, SelfFulfilled.

**FulfillmentType** (`Enums/FulfillmentType.cs`) -- Distinguishes how a product is fulfilled: Lab (auto-sent to print lab), SelfFulfilled (photographer ships), Digital (auto-delivered file).

### Application Layer (Anansi.Application)

**CreateProduct** (`Features/Store/Commands/CreateProduct.cs`) -- Command/handler that creates a new product with optional inline variations. Validates product name, type, fulfillment type, and variation pricing. Returns a `ProductDto`.

**UpdateProduct** (`Features/Store/Commands/UpdateProduct.cs`) -- Command/handler that modifies an existing product's metadata (name, description, active status, lab settings, preview URL). Does not modify variations directly.

**DeleteProduct** (`Features/Store/Commands/DeleteProduct.cs`) -- Soft-deletes a product, setting `IsDeleted = true` and `DeletedAt` to the current UTC timestamp.

**GetProductsQuery / GetProductByIdQuery** (`Features/Store/Queries/`) -- Read-side queries returning paginated product lists (filterable by `ProductType`) and individual product details, respectively.

**ProductDto / ProductVariationDto / PackageItemDto** (`DTOs/Store/ProductDto.cs`) -- Data transfer objects carrying product data to the API layer. Includes request records for creation and update operations.

**IApplicationDbContext** (`Interfaces/IApplicationDbContext.cs`) -- Exposes `DbSet<Product>`, `DbSet<ProductVariation>`, and `DbSet<PackageItem>` for persistence operations.

### API Layer (Anansi.Api)

**ProductsController** (`Controllers/ProductsController.cs`) -- RESTful controller exposing CRUD endpoints under `api/products`. Includes `GET` (list with filter/pagination), `GET /{id}` (single), `POST` (create), `PUT /{id}` (update), `DELETE /{id}` (soft-delete), and `POST /bulk-markup` for batch pricing operations.

### Infrastructure Layer (Anansi.Infrastructure)

**ApplicationDbContext** -- EF Core DbContext implementing `IApplicationDbContext`. Configures Product, ProductVariation, and PackageItem entity mappings, including the self-referencing relationship on PackageItem (PackageProductId -> Product, IncludedProductId -> Product).

---

## Class Diagrams

### Domain -- Product Aggregate

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
    +Description : string?
    +ProductType : ProductType
    +FulfillmentType : FulfillmentType
    +IsActive : bool
    +LabPartner : LabPartner?
    +LabColorCorrectionEnabled : bool
    +PreviewImageUrl : string?
    +DigitalResolutionOptions : string?
    +IsDeleted : bool
    +DeletedAt : DateTime?
    +CreatedBy : string?
    +UpdatedBy : string?
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

  class PackageItem {
    +Id : Guid
    +PackageProductId : Guid
    +IncludedProductId : Guid
    +IncludedVariationId : Guid?
    +Quantity : int
  }
}

package "Anansi.Domain.Enums" {
  enum ProductType {
    Print
    MountedPrint
    CanvasPrint
    MetalPrint
    WoodPrint
    FramedPrint
    WallArt
    LargeFormat
    SquarePrint
    Standout
    BambooPanel
    Album
    Book
    GreetingCard
    DigitalDownload
    Package
    SelfFulfilled
  }

  enum FulfillmentType {
    Lab
    SelfFulfilled
    Digital
  }
}

Product "1" --> "*" ProductVariation : Variations
Product "1" --> "*" PackageItem : PackageItems (as package)
PackageItem --> "1" Product : IncludedProduct
PackageItem --> "0..1" ProductVariation : IncludedVariation
Product ..> ProductType
Product ..> FulfillmentType

@enduml
```

### Application -- Commands, Queries, and DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Store" {
  package "Commands" {
    class CreateProductCommand <<record>> {
      +Request : CreateProductRequest
    }
    class CreateProductHandler {
      -_db : IApplicationDbContext
      -_currentUser : ICurrentUserService
      +Handle(cmd, ct) : Result<ProductDto>
    }

    class UpdateProductCommand <<record>> {
      +Id : Guid
      +Request : UpdateProductRequest
    }
    class UpdateProductHandler {
      +Handle(cmd, ct) : Result<ProductDto>
    }

    class DeleteProductCommand <<record>> {
      +Id : Guid
    }
    class DeleteProductHandler {
      +Handle(cmd, ct) : Result<bool>
    }
  }

  package "Queries" {
    class GetProductsQuery <<record>> {
      +ProductType : ProductType?
      +Page : int
      +PageSize : int
    }
    class GetProductByIdQuery <<record>> {
      +Id : Guid
    }
  }
}

package "Anansi.Application.DTOs.Store" {
  class ProductDto <<record>> {
    +Id : Guid
    +Name : string
    +Variations : List<ProductVariationDto>
    ...
  }
  class CreateProductRequest <<record>> {
    +Name : string
    +ProductType : ProductType
    +FulfillmentType : FulfillmentType
    +Variations : List<CreateProductVariationRequest>?
    ...
  }
  class CreateProductVariationRequest <<record>> {
    +Name : string
    +CostCents : long
    +MarkupCents : long
    +PriceCents : long
    ...
  }
}

CreateProductCommand ..> CreateProductRequest
CreateProductHandler ..> CreateProductCommand
CreateProductHandler ..> ProductDto

@enduml
```

### API -- ProductsController

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Api.Controllers" {
  class ProductsController {
    -_mediator : IMediator
    +GetProducts(productType?, page, pageSize) : IActionResult
    +GetProduct(id) : IActionResult
    +CreateProduct(request) : IActionResult
    +UpdateProduct(id, request) : IActionResult
    +DeleteProduct(id) : IActionResult
    +ApplyBulkMarkup(request) : IActionResult
  }
}

package "MediatR" {
  interface IMediator {
    +Send<T>(request) : T
  }
}

ProductsController --> IMediator

@enduml
```

---

## Sequence Diagrams

### Create Product with Variations

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "ProductsController" as ctrl
participant "IMediator" as med
participant "CreateProductValidator" as val
participant "CreateProductHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : POST /api/products\n{name, productType, fulfillmentType, variations[]}
ctrl -> med : Send(CreateProductCommand)
med -> val : Validate(command)
val --> med : ValidationResult (pass)
med -> handler : Handle(command, ct)
handler -> user : PhotographerId
user --> handler : Guid
handler -> handler : Build Product entity\nwith Variations
handler -> db : Products.Add(product)
handler -> db : SaveChangesAsync()
db --> handler : success
handler -> handler : MapToDto(product)
handler --> med : Result<ProductDto>.Success
med --> ctrl : Result<ProductDto>
ctrl --> Photographer : 201 Created {ProductDto}
@enduml
```

### Get Products (Filtered & Paginated)

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "ProductsController" as ctrl
participant "IMediator" as med
participant "GetProductsHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : GET /api/products?productType=Print&page=1&pageSize=20
ctrl -> med : Send(GetProductsQuery)
med -> handler : Handle(query, ct)
handler -> user : PhotographerId
user --> handler : Guid
handler -> db : Products\n.Where(type, photographer)\n.Include(Variations)\n.Skip/Take
db --> handler : List<Product>
handler -> handler : Map to ProductDto list
handler --> med : Result<PagedList<ProductDto>>
med --> ctrl : Result
ctrl --> Photographer : 200 OK {items, page, totalCount}
@enduml
```

### Create Package (Bundle of Products)

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "ProductsController" as ctrl
participant "IMediator" as med
participant "CreateProductHandler" as handler
participant "IApplicationDbContext" as db

Photographer -> ctrl : POST /api/products\n{name, productType=Package,\npackageItems: [{productId, variationId, qty}]}
ctrl -> med : Send(CreateProductCommand)
med -> handler : Handle(command, ct)
handler -> handler : Create Product entity\n(type=Package, fulfillment=Digital or Lab)
handler -> db : Validate included product IDs exist
db --> handler : products found

loop for each PackageItem
  handler -> handler : Create PackageItem entity\n(includedProductId, variationId, qty)
end

handler -> db : Products.Add(product)
handler -> db : SaveChangesAsync()
db --> handler : success
handler --> med : Result<ProductDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 201 Created
@enduml
```

### Update Product

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "ProductsController" as ctrl
participant "IMediator" as med
participant "UpdateProductHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : PUT /api/products/{id}\n{name, description, isActive, labPartner, ...}
ctrl -> med : Send(UpdateProductCommand)
med -> handler : Handle(command, ct)
handler -> user : PhotographerId
user --> handler : Guid
handler -> db : Products.FindAsync(id)
db --> handler : Product entity
handler -> handler : Verify ownership\n(PhotographerId matches)
handler -> handler : Apply field updates
handler -> db : SaveChangesAsync()
db --> handler : success
handler -> handler : MapToDto(product)
handler --> med : Result<ProductDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 200 OK {ProductDto}
@enduml
```

### Delete Product (Soft Delete)

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "ProductsController" as ctrl
participant "IMediator" as med
participant "DeleteProductHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : DELETE /api/products/{id}
ctrl -> med : Send(DeleteProductCommand)
med -> handler : Handle(command, ct)
handler -> user : PhotographerId
user --> handler : Guid
handler -> db : Products.FindAsync(id)
db --> handler : Product entity
handler -> handler : Verify ownership
handler -> handler : Set IsDeleted=true,\nDeletedAt=UtcNow
handler -> db : SaveChangesAsync()
db --> handler : success
handler --> med : Result<bool>.Success
med --> ctrl : Result
ctrl --> Photographer : 204 No Content
@enduml
```

### Digital Download Auto-Delivery on Payment

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "Checkout Flow" as checkout
participant "IPaymentService" as payment
participant "CreateOrderHandler" as handler
participant "IApplicationDbContext" as db
participant "IStorageService" as storage
participant "IEmailService" as email

Client -> checkout : Complete purchase\n(digital download product)
checkout -> payment : CreatePaymentIntentAsync()
payment --> checkout : PaymentIntent confirmed

checkout -> handler : Handle(CreateOrderCommand)
handler -> db : Create Order entity\n(FulfillmentType=Digital)
handler -> db : SaveChangesAsync()
db --> handler : success

handler -> handler : Detect digital items\nin order

loop for each digital OrderItem
  handler -> storage : GeneratePresignedUrl(imageKey,\nresolution)
  storage --> handler : downloadUrl
end

handler -> email : Send delivery email\nwith download links
email --> handler : sent

handler --> checkout : Result<OrderDto>
checkout --> Client : Order confirmation\n+ download links
@enduml
```
