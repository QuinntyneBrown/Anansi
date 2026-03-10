# F02 - Subscription & Plan Management

## Overview

This feature implements the tiered pricing architecture that governs every capability in Anansi. Four product areas each offer free and paid tiers: Client Gallery (Free/Basic/Plus/Pro/Ultimate), Website Builder (Free/Plus/Pro), Studio Manager (Free/Plus/Pro), and Suite bundles (Starter/Pro/Ultimate) that combine all three at a discount. The `Plan` entity defines each tier with monthly and annual pricing, while `PlanFeatureGate` entries encode the specific limits and toggles that each tier unlocks.

Subscription management allows photographers to subscribe, upgrade, downgrade, and cancel at any time. Plan changes apply proration -- unused time on the current plan is credited toward the new plan -- orchestrated through the Stripe Billing API. Annual billing offers a minimum 15% discount over monthly rates, and Suite bundles offer at least 25% savings versus purchasing products individually. Free tiers never require a credit card.

Feature gating is the runtime enforcement layer. Before any gated operation (e.g., uploading a RAW file, enabling auto-fulfillment, or creating a fourth session type), the system checks the photographer's active plan against the relevant `PlanFeatureGate` entry. This is exposed as a reusable query (`CheckFeatureAccessQuery`) and can be called from any feature's handler to enforce plan limits consistently.

**L2 Requirements:** PLN-10.1.1 (Free Tiers), PLN-10.1.2 (Paid Tiers), PLN-10.1.3 (Suite Bundle), PLN-10.2.1 (Gallery Gates), PLN-10.2.2 (Website Gates), PLN-10.2.3 (Studio Manager Gates), PLN-10.2.4 (Suite Gates)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Plan` | Entity | Defines a pricing tier for a product area. Stores monthly/annual price in cents, suite bundle flag, and active status. Has a collection of `PlanFeatureGate` entries. Implements `ISoftDeletable`. |
| `PlanFeatureGate` | Entity | Key-value pair encoding a single feature limit or toggle for a plan (e.g., `storage_gb` = `"3"`, `raw_upload` = `"false"`, `video_hours` = `"unlimited"`). |
| `Subscription` | Entity | Links a `Photographer` to a `Plan` with billing interval, Stripe subscription ID, current period dates, price, proration credit, and cancellation state. Implements `ITenantEntity` and `ISoftDeletable`. |
| `PlanProduct` | Enum | `Gallery`, `Website`, `StudioManager`, `Suite` |
| `PlanTier` | Enum | `Free`, `Basic`, `Plus`, `Pro`, `Ultimate` |
| `BillingInterval` | Enum | `Monthly`, `Annual` |
| `SubscriptionStatus` | Enum | `Active`, `PastDue`, `Cancelled`, `Trialing` |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetPlansQuery` | Query | Lists all available plans, optionally filtered by `PlanProduct`. Returns plan details with feature gates and pricing. Public (no auth required). |
| `CreatePlanCommand` | Command | Admin operation to define a new plan with pricing and feature gates. |
| `UpdatePlanCommand` | Command | Admin operation to modify an existing plan's pricing or feature gates. |
| `GetCurrentSubscriptionQuery` | Query | Returns the authenticated photographer's active subscription with plan details. |
| `CreateSubscriptionCommand` | Command | Subscribes a photographer to a plan. For free tiers, no Stripe interaction. For paid tiers, creates a Stripe subscription and stores the subscription ID. |
| `ChangeSubscriptionCommand` | Command | Upgrade or downgrade. Calculates proration credit, updates Stripe subscription, and swaps the local plan reference. |
| `CancelSubscriptionCommand` | Command | Cancels at period end (default) or immediately. Updates Stripe and sets local cancellation state. |
| `CheckFeatureAccessQuery` | Query | Given a `featureKey`, checks the photographer's active plan for the corresponding gate value. Returns allowed/denied with the current value and limit. |
| `IPaymentService` | Interface | Stripe integration for creating payment intents, checkout sessions, connected accounts, and refunds. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PlanConfiguration` | EF Config | Maps `Plan` entity with product/tier composite indexing and price constraints. |
| `PlanFeatureGateConfiguration` | EF Config | Maps feature gates with foreign key to `Plan` and unique index on `(PlanId, FeatureKey)`. |
| `SubscriptionConfiguration` | EF Config | Maps subscription with foreign key to `Plan` and `Photographer`, with unique index on active subscriptions per photographer. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `PlansController` | Controller | Endpoints: `GET /api/plans` (public), `POST /api/plans` (admin), `PUT /api/plans/{id}` (admin), `GET /api/plans/subscription`, `POST /api/plans/subscription`, `PUT /api/plans/subscription`, `DELETE /api/plans/subscription`, `GET /api/plans/features/{featureKey}`. |

---

## Class Diagrams

### Domain Layer -- Plan & Subscription Entities

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

interface ISoftDeletable {
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

interface ITenantEntity {
  +PhotographerId : Guid
}

class Plan {
  +Product : PlanProduct
  +Tier : PlanTier
  +Name : string
  +Description : string?
  +MonthlyPriceCents : long
  +AnnualPriceCents : long
  +IsSuiteBundle : bool
  +IsActive : bool
  +FeatureGates : ICollection<PlanFeatureGate>
}

class PlanFeatureGate {
  +PlanId : Guid
  +FeatureKey : string
  +FeatureValue : string
  +Description : string?
}

class Subscription {
  +PhotographerId : Guid
  +PlanId : Guid
  +BillingInterval : BillingInterval
  +Status : SubscriptionStatus
  +CurrentPeriodStart : DateTime
  +CurrentPeriodEnd : DateTime
  +StripeSubscriptionId : string?
  +PriceCents : long
  +ProrationCreditCents : long
  +CancelledAt : DateTime?
  +CancelAtPeriodEnd : bool
}

enum PlanProduct {
  Gallery
  Website
  StudioManager
  Suite
}

enum PlanTier {
  Free
  Basic
  Plus
  Pro
  Ultimate
}

enum BillingInterval {
  Monthly
  Annual
}

enum SubscriptionStatus {
  Active
  PastDue
  Cancelled
  Trialing
}

BaseEntity <|-- Plan
BaseEntity <|-- PlanFeatureGate
BaseEntity <|-- Subscription
ISoftDeletable <|.. Plan
ISoftDeletable <|.. Subscription
ITenantEntity <|.. Subscription

Plan "1" *-- "many" PlanFeatureGate : contains
Subscription "many" --> "1" Plan : references
Plan --> PlanProduct
Plan --> PlanTier
Subscription --> BillingInterval
Subscription --> SubscriptionStatus
@enduml
```

![Domain Layer -- Plan & Subscription Entities](domain-layer-plan-subscription-entities.png)

### Application Layer -- Subscription Commands & Queries

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Plans.Queries" {
  class GetPlansQuery <<record>> {
    +Product : PlanProduct?
  }
  class GetCurrentSubscriptionQuery <<record>>
  class CheckFeatureAccessQuery <<record>> {
    +FeatureKey : string
  }
  class FeatureAccessResult <<record>> {
    +IsAllowed : bool
    +FeatureKey : string
    +CurrentValue : string?
    +PlanLimit : string?
    +PlanName : string
  }
}

package "Features.Plans.Commands" {
  class CreateSubscriptionCommand <<record>> {
    +PlanId : Guid
    +BillingInterval : BillingInterval
    +PaymentMethodId : string?
  }
  class ChangeSubscriptionCommand <<record>> {
    +NewPlanId : Guid
    +NewBillingInterval : BillingInterval?
  }
  class CancelSubscriptionCommand <<record>> {
    +Immediate : bool
  }
  class CreatePlanCommand <<record>>
  class UpdatePlanCommand <<record>>
}

package "DTOs.Plans" {
  class PlanDto {
    +Id : Guid
    +Product : PlanProduct
    +Tier : PlanTier
    +Name : string
    +MonthlyPriceCents : long
    +AnnualPriceCents : long
    +IsSuiteBundle : bool
    +Features : List<FeatureGateDto>
  }
  class SubscriptionDto {
    +Id : Guid
    +PlanId : Guid
    +PlanName : string
    +BillingInterval : BillingInterval
    +Status : SubscriptionStatus
    +CurrentPeriodEnd : DateTime
    +PriceCents : long
  }
}

GetPlansQuery ..> PlanDto : returns
GetCurrentSubscriptionQuery ..> SubscriptionDto : returns
CheckFeatureAccessQuery ..> FeatureAccessResult : returns
@enduml
```

![Application Layer -- Subscription Commands & Queries](application-layer-subscription-commands-queries.png)

### API Layer -- Plans Controller

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class PlansController <<ApiController>> {
  -_mediator : IMediator
  +GetPlans(product?) : IActionResult
  +CreatePlan(request) : IActionResult
  +UpdatePlan(id, request) : IActionResult
  +GetCurrentSubscription() : IActionResult
  +CreateSubscription(request) : IActionResult
  +ChangeSubscription(request) : IActionResult
  +CancelSubscription(immediate?) : IActionResult
  +CheckFeatureAccess(featureKey) : IActionResult
}

note right of PlansController
  GET    /api/plans              [AllowAnonymous]
  POST   /api/plans              [Authorize]
  PUT    /api/plans/{id}         [Authorize]
  GET    /api/plans/subscription [Authorize]
  POST   /api/plans/subscription [Authorize]
  PUT    /api/plans/subscription [Authorize]
  DELETE /api/plans/subscription [Authorize]
  GET    /api/plans/features/{key} [Authorize]
end note

PlansController --> "IMediator"
@enduml
```

![API Layer -- Plans Controller](api-layer-plans-controller.png)

---

## Sequence Diagrams

### Browse Available Plans (Public)

```plantuml
@startuml
actor Visitor as V
participant "PlansController" as PC
participant "MediatR" as M
participant "GetPlansHandler" as GPH
participant "ApplicationDbContext" as DB

V -> PC : GET /api/plans?product=Gallery
PC -> M : Send(GetPlansQuery(Gallery))
M -> GPH : Handle(query)

GPH -> DB : Plans\n  .Where(p => p.Product == Gallery && p.IsActive)\n  .Include(p => p.FeatureGates)\n  .OrderBy(p => p.Tier)

DB --> GPH : List<Plan>

GPH -> GPH : Map to List<PlanDto>\nwith feature descriptions\nand pricing

GPH --> M : Result.Success(plans)
M --> PC : Result.Success
PC --> V : 200 OK [{Free}, {Basic},\n{Plus}, {Pro}, {Ultimate}]
@enduml
```

![Browse Available Plans (Public)](browse-available-plans-public.png)

### Subscribe to a Paid Plan

```plantuml
@startuml
actor Photographer as P
participant "PlansController" as PC
participant "MediatR" as M
participant "CreateSubscriptionHandler" as CSH
participant "ApplicationDbContext" as DB
participant "IPaymentService" as PS

P -> PC : POST /api/plans/subscription\n{planId, billingInterval: Annual,\npaymentMethodId}
PC -> M : Send(CreateSubscriptionCommand)
M -> CSH : Handle(command)

CSH -> DB : Find Plan by planId
alt plan not found
  CSH --> M : Result.Failure("Plan not found")
  M --> PC : 404
  PC --> P : 404 Not Found
end

CSH -> DB : Check existing active subscription
alt already subscribed
  CSH --> M : Result.Failure("Already subscribed.\nUse change endpoint.")
  M --> PC : 400
  PC --> P : 400 Bad Request
end

alt plan.Tier == Free
  CSH -> DB : Create Subscription\n(no Stripe, no payment)
else paid plan
  CSH -> PS : CreateCheckoutSessionAsync(\nstripeAccountId, lineItems,\nsuccessUrl, cancelUrl)
  PS --> CSH : stripeSubscriptionId
  CSH -> DB : Create Subscription\n(with StripeSubscriptionId,\nperiod dates, price)
end

CSH -> DB : SaveChangesAsync()
CSH --> M : Result.Success(SubscriptionDto)
M --> PC : Result.Success
PC --> P : 201 Created
@enduml
```

![Subscribe to a Paid Plan](subscribe-to-a-paid-plan.png)

### Upgrade/Downgrade Plan with Proration

```plantuml
@startuml
actor Photographer as P
participant "PlansController" as PC
participant "MediatR" as M
participant "ChangeSubscriptionHandler" as CH
participant "ApplicationDbContext" as DB
participant "IPaymentService" as PS

P -> PC : PUT /api/plans/subscription\n{newPlanId, newBillingInterval}
PC -> M : Send(ChangeSubscriptionCommand)
M -> CH : Handle(command)

CH -> DB : Load current Subscription\nwith Plan
CH -> DB : Load new Plan by newPlanId

alt same plan
  CH --> M : Result.Failure("Already on this plan")
end

CH -> CH : Calculate proration credit:\nremaining days on current period\n* daily rate of current plan

alt upgrading from Free to Paid
  CH -> PS : Create new Stripe subscription\nwith proration credit applied
  PS --> CH : newStripeSubscriptionId
else changing between paid plans
  CH -> PS : Update Stripe subscription\nto new price with proration
  PS --> CH : updated subscription
else downgrading to Free
  CH -> PS : Cancel Stripe subscription
  note right: Credit is forfeited or\nrefunded per policy
end

CH -> DB : subscription.PlanId = newPlanId
CH -> DB : subscription.PriceCents = newPrice
CH -> DB : subscription.ProrationCreditCents = credit
CH -> DB : subscription.BillingInterval = newInterval
CH -> DB : SaveChangesAsync()

CH --> M : Result.Success(SubscriptionDto)
M --> PC : Result.Success
PC --> P : 200 OK (updated subscription)
@enduml
```

![Upgrade/Downgrade Plan with Proration](upgrade-downgrade-plan-with-proration.png)

### Cancel Subscription

```plantuml
@startuml
actor Photographer as P
participant "PlansController" as PC
participant "MediatR" as M
participant "CancelSubscriptionHandler" as CH
participant "ApplicationDbContext" as DB
participant "IPaymentService" as PS

P -> PC : DELETE /api/plans/subscription?immediate=false
PC -> M : Send(CancelSubscriptionCommand(false))
M -> CH : Handle(command)

CH -> DB : Load active Subscription
alt no active subscription
  CH --> M : Result.Failure("No active subscription")
end

alt subscription has StripeSubscriptionId
  alt immediate == true
    CH -> PS : Cancel Stripe subscription immediately
    CH -> DB : subscription.Status = Cancelled\nsubscription.CancelledAt = UtcNow
  else cancel at period end
    CH -> PS : Set Stripe cancel_at_period_end = true
    CH -> DB : subscription.CancelAtPeriodEnd = true\nsubscription.CancelledAt = UtcNow
  end
else free plan
  CH -> DB : subscription.Status = Cancelled\nsubscription.CancelledAt = UtcNow
end

CH -> DB : SaveChangesAsync()
CH --> M : Result.Success
M --> PC : Result.Success
PC --> P : 204 No Content
@enduml
```

![Cancel Subscription](cancel-subscription.png)

### Check Feature Access (Runtime Gating)

```plantuml
@startuml
actor "Any Feature Handler" as FH
participant "MediatR" as M
participant "CheckFeatureAccessHandler" as CFH
participant "ApplicationDbContext" as DB

FH -> M : Send(CheckFeatureAccessQuery("raw_upload"))
M -> CFH : Handle(query)

CFH -> DB : Get Photographer by CurrentUser
CFH -> DB : Get active Subscription\nwith Plan and FeatureGates

alt no active subscription
  CFH -> CFH : Assume Free tier\nfor all products
end

CFH -> DB : Find PlanFeatureGate\nwhere FeatureKey == "raw_upload"

alt gate not found
  CFH --> M : FeatureAccessResult {\n  IsAllowed: false,\n  PlanLimit: "Not available"\n}
else gate.FeatureValue == "true"
  CFH --> M : FeatureAccessResult {\n  IsAllowed: true,\n  PlanName: "Pro"\n}
else gate.FeatureValue == "false"
  CFH --> M : FeatureAccessResult {\n  IsAllowed: false,\n  PlanLimit: "Requires Pro or higher"\n}
end

M --> FH : FeatureAccessResult
@enduml
```

![Check Feature Access (Runtime Gating)](check-feature-access-runtime-gating.png)

### Feature Gate Reference Table

The following table shows the key feature gates used across all plan tiers. Each gate is stored as a `PlanFeatureGate` record with a string key and string value.

| Feature Key | Free | Basic | Plus | Pro | Ultimate |
|---|---|---|---|---|---|
| `storage_gb` | 3 | 10 | 100 | 1000 | unlimited |
| `video_minutes_hd` | 0 | 30 | 60 | 120 | 300 |
| `video_4k` | false | false | false | true | true |
| `custom_domain` | false | true | true | true | true |
| `store_commission_pct` | 15 | 0 | 0 | 0 | 0 |
| `branding_removal` | false | true | true | true | true |
| `raw_upload` | false | false | false | true | true |
| `auto_fulfillment` | false | false | false | true | true |
| `coupons` | false | false | false | true | true |
| `website_pages` | 15 | - | unlimited | unlimited | unlimited |
| `blog_posts` | 5 | - | unlimited | unlimited | unlimited |
| `session_types` | 1 | - | 3 | unlimited | unlimited |
| `contracts` | 3 | - | unlimited | unlimited | unlimited |
| `custom_code_injection` | false | - | false | true | true |
| `document_reminders` | false | - | true | true | true |
| `annual_discount_pct` | - | 15 | 15 | 15 | 15 |
