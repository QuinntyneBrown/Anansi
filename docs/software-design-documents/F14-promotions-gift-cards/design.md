# F14 - Promotions & Gift Cards

## Overview

Promotions & Gift Cards enables photographers to drive sales and provide flexible payment options through two complementary mechanisms: coupon codes and gift cards. Coupon codes support three discount types -- percentage off, fixed dollar amount off, and free giveaway ("Buy X, Get Y Free") -- each applicable to either the entire order or specific items. Every coupon can be configured with an expiration date, a usage limit (maximum number of redemptions), and a minimum order threshold. Clients apply coupon codes during checkout, and the discount is calculated and displayed in the order summary before payment.

The promotional coupon banner system allows photographers to surface active promotions at the top of their gallery or store pages. The banner displays configurable text (e.g., "Use code HOLIDAY20 for 20% off!"), uses a photographer-defined background color, and can be toggled visible or hidden per coupon. This provides a passive promotional channel without requiring clients to already know a coupon code.

Gift cards offer a stored-value payment instrument. Photographers create gift cards with a custom dollar amount and optional expiration date. Cards are deliverable via branded email (containing recipient name, sender name, custom message, and the card code) or as a manual code the photographer shares directly. At checkout, clients enter a gift card code to apply the balance against the order total. If the gift card balance exceeds the order total, the remaining balance is preserved for future purchases. If the balance is less than the total, the client pays the difference via their selected payment method. Photographers can view all gift cards and their current balances through the management dashboard.

**L2 Requirements:** STR-2.4.1, STR-2.4.2, STR-2.4.3, GFT-4.9.1, GFT-4.9.2

---

## Components

### Domain Layer (Anansi.Domain)

**Coupon** (`Entities/Store/Coupon.cs`) -- Represents a discount coupon created by a photographer. Contains the coupon code (unique per photographer), type (`CouponType`: PercentageOff, FixedAmountOff, FreeGiveaway), scope (`CouponScope`: EntireOrder, SpecificItems), percentage value (for percentage-off type), fixed amount in cents (for fixed-amount-off type), minimum order threshold in cents, expiration date, usage limit, times-used counter, and active flag. Also carries banner configuration: banner text, banner color hex, and show-banner toggle.

**CouponType** (`Enums/CouponType.cs`) -- Enumerates discount mechanisms: PercentageOff, FixedAmountOff, FreeGiveaway.

**CouponScope** (`Enums/CouponScope.cs`) -- Defines applicability: EntireOrder (discount applies to full order total) or SpecificItems (discount applies only to qualifying items).

**GiftCard** (`Entities/Store/GiftCard.cs`) -- A stored-value payment instrument. Tracks the card code (unique), original amount in cents, remaining balance in cents, optional expiry date, recipient details (email, name), sender name, custom message, and active flag. Balance decrements on each redemption and persists for future use.

**Order** (`Entities/Store/Order.cs`) -- The order entity includes `CouponCode` and `GiftCardCode` fields capturing which promotions were applied, along with `DiscountCents` for the total discount amount.

### Application Layer (Anansi.Application)

**CreateCoupon** (`Features/Store/Commands/CreateCoupon.cs`) -- Command/handler that creates a new coupon. Validates code uniqueness per photographer, enum values, and conditional field requirements (percentage value required for PercentageOff, fixed amount for FixedAmountOff).

**UpdateCoupon** -- Modifies coupon active status, expiration, usage limit, and banner settings.

**DeleteCoupon** -- Soft-deletes a coupon.

**ValidateCoupon** -- Query that checks a coupon code's validity at checkout time: existence, active status, not expired, not exceeding usage limit, minimum order threshold met. Returns the computed discount amount.

**CreateGiftCard** (`Features/Store/Commands/CreateGiftCard.cs`) -- Command/handler that creates a gift card, generates a unique code, and optionally triggers branded email delivery.

**RedeemGiftCard** -- Command that applies a gift card balance to an order. Deducts the used amount from `BalanceCents`, recording the transaction. If balance reaches zero, marks the card as fully redeemed.

**GetGiftCards / GetGiftCardByCode** -- Queries for listing gift cards and looking up a card by code.

**CouponDto / CreateCouponRequest / UpdateCouponRequest** (`DTOs/Store/CouponDto.cs`) -- DTOs for coupon CRUD.

**GiftCardDto / CreateGiftCardRequest** (`DTOs/Store/GiftCardDto.cs`) -- DTOs for gift card operations.

### API Layer (Anansi.Api)

**CouponsController** (`Controllers/CouponsController.cs`) -- RESTful endpoints for coupon management: CRUD operations plus a `POST /api/coupons/validate` endpoint for checkout-time validation.

**GiftCardsController** (`Controllers/GiftCardsController.cs`) -- Endpoints for gift card creation, listing, and balance lookup.

### Infrastructure Layer (Anansi.Infrastructure)

**ApplicationDbContext** -- Configures Coupon and GiftCard entity mappings, including unique index on (PhotographerId, Code) for coupons and unique index on Code for gift cards.

**IEmailService** -- Used to send branded gift card delivery emails containing the card code, amount, sender message, and redemption instructions.

---

## Class Diagrams

### Domain -- Coupon Entity

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Store" {
  class Coupon {
    +Id : Guid
    +PhotographerId : Guid
    +Code : string
    +CouponType : CouponType
    +Scope : CouponScope
    +PercentageValue : decimal?
    +FixedAmountCents : long?
    +MinimumOrderCents : long?
    +ExpirationDate : DateTime?
    +UsageLimit : int?
    +TimesUsed : int
    +IsActive : bool
    +BannerText : string?
    +BannerColorHex : string?
    +ShowBanner : bool
    +IsDeleted : bool
    +DeletedAt : DateTime?
  }
}

package "Anansi.Domain.Enums" {
  enum CouponType {
    PercentageOff
    FixedAmountOff
    FreeGiveaway
  }

  enum CouponScope {
    EntireOrder
    SpecificItems
  }
}

Coupon ..> CouponType
Coupon ..> CouponScope

note bottom of Coupon
  STR-2.4.1: All three coupon types
  STR-2.4.2: Banner fields for promotion display
  Code is unique per photographer
end note

@enduml
```

### Domain -- Gift Card Entity

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Domain.Entities.Store" {
  class GiftCard {
    +Id : Guid
    +PhotographerId : Guid
    +Code : string
    +OriginalAmountCents : long
    +BalanceCents : long
    +ExpiryDate : DateTime?
    +RecipientEmail : string?
    +RecipientName : string?
    +SenderName : string?
    +Message : string?
    +IsActive : bool
    +IsDeleted : bool
    +DeletedAt : DateTime?
  }
}

package "Anansi.Domain.Entities.Store" as store2 {
  class Order {
    +GiftCardCode : string?
    +DiscountCents : long
  }
}

GiftCard ..> Order : balance applied\nat checkout

note bottom of GiftCard
  STR-2.4.3 / GFT-4.9.1 / GFT-4.9.2:
  Remaining balance saved for future use
  Code is globally unique
  Deliverable via branded email
end note

@enduml
```

### Application -- Coupon Commands & Validation

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Store" {
  package "Commands" {
    class CreateCouponCommand <<record>> {
      +Request : CreateCouponRequest
    }
    class CreateCouponHandler {
      -_db : IApplicationDbContext
      -_currentUser : ICurrentUserService
      +Handle(cmd, ct) : Result<CouponDto>
    }

    class UpdateCouponCommand <<record>> {
      +Id : Guid
      +Request : UpdateCouponRequest
    }

    class DeleteCouponCommand <<record>> {
      +Id : Guid
    }
  }

  package "Queries" {
    class ValidateCouponQuery <<record>> {
      +Code : string
      +OrderSubtotalCents : long
      +ItemIds : List<Guid>?
    }
    class ValidateCouponHandler {
      +Handle(query, ct) : Result<CouponValidationResult>
    }
  }
}

package "Anansi.Application.DTOs.Store" {
  class CouponValidationResult <<record>> {
    +IsValid : bool
    +DiscountCents : long
    +ErrorMessage : string?
  }
}

ValidateCouponQuery ..> CouponValidationResult
CreateCouponHandler ..> CreateCouponCommand

@enduml
```

### Application -- Gift Card Commands

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Anansi.Application.Features.Store" {
  package "Commands" {
    class CreateGiftCardCommand <<record>> {
      +Request : CreateGiftCardRequest
    }
    class CreateGiftCardHandler {
      -_db : IApplicationDbContext
      -_currentUser : ICurrentUserService
      -_emailService : IEmailService
      +Handle(cmd, ct) : Result<GiftCardDto>
    }

    class RedeemGiftCardCommand <<record>> {
      +Code : string
      +AmountCents : long
      +OrderId : Guid
    }
    class RedeemGiftCardHandler {
      +Handle(cmd, ct) : Result<long>
    }
  }

  package "Queries" {
    class GetGiftCardsQuery <<record>> {
      +Page : int
      +PageSize : int
    }
    class GetGiftCardByCodeQuery <<record>> {
      +Code : string
    }
  }
}

package "Anansi.Application.DTOs.Store" {
  class GiftCardDto <<record>> {
    +Id : Guid
    +Code : string
    +OriginalAmountCents : long
    +BalanceCents : long
    +ExpiryDate : DateTime?
    +IsActive : bool
  }
}

CreateGiftCardHandler ..> GiftCardDto
RedeemGiftCardHandler --> RedeemGiftCardCommand

note right of RedeemGiftCardHandler
  Returns remaining
  balance in cents
end note

@enduml
```

---

## Sequence Diagrams

### Create Coupon

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "CouponsController" as ctrl
participant "IMediator" as med
participant "CreateCouponValidator" as val
participant "CreateCouponHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db

Photographer -> ctrl : POST /api/coupons\n{code="WINTER25", couponType=PercentageOff,\nscope=EntireOrder, percentageValue=25,\nexpirationDate, usageLimit=100,\nbannerText, showBanner=true}
ctrl -> med : Send(CreateCouponCommand)
med -> val : Validate
val --> med : pass

med -> handler : Handle(command, ct)
handler -> user : PhotographerId
user --> handler : Guid

handler -> db : Coupons\n.AnyAsync(Code == "WINTER25"\n&& PhotographerId == pid)
db --> handler : false (unique)

handler -> handler : Build Coupon entity
handler -> db : Coupons.Add(coupon)
handler -> db : SaveChangesAsync()
db --> handler : success

handler --> med : Result<CouponDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 201 Created {CouponDto}
@enduml
```

### Validate Coupon at Checkout

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "CheckoutController" as ctrl
participant "IMediator" as med
participant "ValidateCouponHandler" as handler
participant "IApplicationDbContext" as db

Client -> ctrl : POST /api/coupons/validate\n{code="WINTER25",\norderSubtotalCents=10000}
ctrl -> med : Send(ValidateCouponQuery)
med -> handler : Handle(query, ct)

handler -> db : Coupons\n.FirstOrDefaultAsync(\nCode == "WINTER25")
db --> handler : Coupon entity

alt coupon not found
  handler --> med : {isValid=false, error="Invalid code"}
else coupon found
  handler -> handler : Check IsActive == true
  handler -> handler : Check ExpirationDate > now
  handler -> handler : Check TimesUsed < UsageLimit
  handler -> handler : Check orderSubtotal >= MinimumOrderCents

  alt all checks pass
    alt CouponType == PercentageOff
      handler -> handler : discountCents =\norderSubtotalCents * 25 / 100
    else CouponType == FixedAmountOff
      handler -> handler : discountCents =\nFixedAmountCents
    else CouponType == FreeGiveaway
      handler -> handler : discountCents =\nprice of qualifying free item
    end

    handler --> med : {isValid=true,\ndiscountCents=2500}
  else validation failed
    handler --> med : {isValid=false,\nerror="reason"}
  end
end

med --> ctrl : Result
ctrl --> Client : 200 OK {CouponValidationResult}
@enduml
```

### Create and Deliver Gift Card via Email

```plantuml
@startuml
skinparam maxMessageSize 200
actor Photographer
participant "GiftCardsController" as ctrl
participant "IMediator" as med
participant "CreateGiftCardHandler" as handler
participant "ICurrentUserService" as user
participant "IApplicationDbContext" as db
participant "IEmailService" as email

Photographer -> ctrl : POST /api/giftcards\n{amountCents=5000,\nrecipientEmail="client@example.com",\nrecipientName="Jane",\nsenderName="Studio ABC",\nmessage="Happy Birthday!"}
ctrl -> med : Send(CreateGiftCardCommand)
med -> handler : Handle(command, ct)

handler -> user : PhotographerId
user --> handler : Guid

handler -> handler : Generate unique code\n(e.g., "GC-A1B2C3D4")
handler -> handler : Build GiftCard entity\n(BalanceCents = AmountCents)

handler -> db : GiftCards.Add(giftCard)
handler -> db : SaveChangesAsync()
db --> handler : success

alt recipientEmail is provided
  handler -> email : SendBrandedGiftCardEmail(\nrecipient, senderName,\namount, code, message)
  email --> handler : sent
end

handler --> med : Result<GiftCardDto>.Success
med --> ctrl : Result
ctrl --> Photographer : 201 Created {GiftCardDto}
@enduml
```

### Redeem Gift Card at Checkout

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "CheckoutFlow" as checkout
participant "RedeemGiftCardHandler" as handler
participant "IApplicationDbContext" as db

Client -> checkout : Apply gift card code\n"GC-A1B2C3D4" to order

checkout -> handler : Handle(RedeemGiftCardCommand\n{code, amountCents=8000, orderId})

handler -> db : GiftCards\n.FirstOrDefaultAsync(\nCode == "GC-A1B2C3D4")
db --> handler : GiftCard\n(BalanceCents = 5000)

handler -> handler : Check IsActive == true
handler -> handler : Check ExpiryDate > now or null

alt balance >= order amount
  handler -> handler : deduct = amountCents\nremaining = balance - amountCents
else balance < order amount
  handler -> handler : deduct = BalanceCents\nremaining = 0
  note right: Client pays difference\nvia payment method
end

handler -> handler : GiftCard.BalanceCents = remaining (0)
handler -> db : SaveChangesAsync()
db --> handler : success

handler --> checkout : Result<long>\n(remainingBalance = 0)

checkout -> checkout : DiscountCents += deduct (5000)\nRemaining 3000 charged\nto payment method

checkout --> Client : Order summary updated\n(Gift card: -$50.00)
@enduml
```

### Display Coupon Banner on Gallery/Store

```plantuml
@startuml
skinparam maxMessageSize 200
actor Client
participant "StorePageController" as ctrl
participant "IMediator" as med
participant "GetActiveBannerHandler" as handler
participant "IApplicationDbContext" as db

Client -> ctrl : GET /api/store/{collectionId}/banner
ctrl -> med : Send(GetActiveBannerQuery(collectionId))
med -> handler : Handle(query, ct)

handler -> db : Collections.FindAsync(collectionId)
db --> handler : Collection (PhotographerId)

handler -> db : Coupons\n.Where(PhotographerId == pid\n&& ShowBanner == true\n&& IsActive == true\n&& (ExpirationDate > now || null))
db --> handler : List<Coupon> (active banners)

alt banners found
  handler -> handler : Select first active banner\n(or highest priority)
  handler --> med : {bannerText, bannerColorHex,\ncouponCode}
else no active banners
  handler --> med : null
end

med --> ctrl : Result
ctrl --> Client : 200 OK\n{bannerText, color, code}\nor 204 No Content
@enduml
```
