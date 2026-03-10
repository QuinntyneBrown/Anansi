# F46 - Interac e-Transfer Integration

## Overview

This feature adds Interac e-Transfer as a Canadian payment method across the Anansi platform. Photographers can generate Interac payment requests directly from invoices, each with a unique reference code in the format "ANANSI-INV-XXXX". When a client sends the e-Transfer outside the platform, the photographer manually confirms receipt within Anansi, which reconciles the payment by creating a `PaymentRecord`, updating the invoice's `PaidCents`, and transitioning its status to `Paid` or `PartiallyPaid`. Payment requests are tracked through a `Pending`, `Completed`, `Expired` lifecycle, with a paginated list filterable by status.

A background job runs on a recurring schedule to automatically expire stale payment requests that have passed their `ExpiryDate`. Photographers configure their Interac email address and enable/disable the feature through a dedicated settings endpoint. When enabled, clients see Interac e-Transfer as a payment option during store checkout -- the system creates the order with `PaymentMethod = InteracETransfer`, generates a reference code, and displays the photographer's Interac email along with payment instructions. The order remains in `Pending` status until the photographer confirms receipt.

The integration is intentionally manual on the reconciliation side, reflecting how Interac e-Transfer works in practice: the actual money movement happens through the banking system, and Anansi tracks the request/confirmation lifecycle. This keeps the implementation simple while providing photographers with a familiar Canadian payment rail that avoids credit card processing fees.

**L2 Requirements:** INT-20.1.1 (Create Payment Request), INT-20.1.2 (Confirm Payment), INT-20.1.3 (List Payment Requests), INT-20.1.4 (Background Expiry), INT-20.2.1 (Interac Settings), INT-20.2.2 (Store Checkout with Interac)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `InteracPaymentRequest` | Entity | Tracks an Interac e-Transfer payment request. Contains `InvoiceId`, `OrderId` (nullable, for store orders), `PaymentReference` (unique "ANANSI-INV-XXXX" code), `AmountCents`, `RecipientEmail`, `Status`, `ExpiryDate`, `ConfirmedAt`. Implements `ITenantEntity`, `IAuditableEntity`. |
| `InteracPaymentRequestStatus` | Enum | `Pending`, `Completed`, `Expired`. |
| `InteracSettings` | Entity | Photographer's Interac configuration: `InteracEmail`, `IsEnabled`. Implements `ITenantEntity`. One record per photographer. |
| `PaymentMethod` | Enum (existing, extended) | Extended with `InteracETransfer` value alongside existing methods. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateInteracPaymentRequestCommand` | Command | Creates a payment request from an invoice. Generates unique "ANANSI-INV-XXXX" reference code, calculates expiry date (default 30 days), loads photographer's Interac email. Returns 201 with `paymentReference`, `amount`, `recipientEmail`, `expiryDate` (INT-20.1.1). |
| `ConfirmInteracPaymentCommand` | Command | Confirms receipt of an Interac payment. Transitions request to `Completed`, creates `PaymentRecord` with `PaymentMethod = InteracETransfer`, updates invoice `PaidCents` and status (INT-20.1.2). |
| `ListInteracPaymentRequestsQuery` | Query | Paginated list of payment requests filtered by `Status`. Ordered by `CreatedAt` descending (INT-20.1.3). |
| `ExpireStaleInteracRequestsCommand` | Command | Background job command: finds all `Pending` requests past their `ExpiryDate` and transitions them to `Expired` (INT-20.1.4). |
| `UpdateInteracSettingsCommand` | Command | Upserts the photographer's `InteracSettings`: sets `InteracEmail` and `IsEnabled` flag (INT-20.2.1). |
| `GetInteracSettingsQuery` | Query | Returns the photographer's current Interac configuration (INT-20.2.1). |
| `CreateStoreOrderWithInteracCommand` | Command | Store checkout with `PaymentMethod = InteracETransfer`. Creates the order in `Pending` status, generates an `InteracPaymentRequest`, returns the payment reference and photographer's Interac email (INT-20.2.2). |
| `InteracPaymentRequestDto` | DTO | Read model: `Id`, `InvoiceId`, `OrderId`, `PaymentReference`, `AmountCents`, `RecipientEmail`, `Status`, `ExpiryDate`, `ConfirmedAt`, `CreatedAt`. |
| `InteracSettingsDto` | DTO | Read model: `InteracEmail`, `IsEnabled`. |
| `InteracCheckoutResultDto` | DTO | Store checkout result: `OrderId`, `PaymentReference`, `AmountCents`, `InteracEmail`, `Instructions`. |
| `InteracPaymentRequestValidator` | Validator | FluentValidation: validates `InvoiceId` exists, invoice is in payable status, photographer has Interac enabled, and Interac email is configured. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateInteracPaymentRequestHandler` | Handler | Loads invoice and photographer settings, validates Interac is enabled, generates unique reference code using sequential counter + random suffix, creates `InteracPaymentRequest`, persists. |
| `ConfirmInteracPaymentHandler` | Handler | Loads request and linked invoice, validates request is `Pending`, creates `PaymentRecord` with `IsOffline = false` and `PaymentMethod = InteracETransfer`, updates invoice `PaidCents`, transitions invoice status. |
| `ExpireStaleInteracRequestsHandler` | Handler | Queries `InteracPaymentRequests` where `Status = Pending AND ExpiryDate < UtcNow`, batch-updates to `Expired`. |
| `InteracExpiryBackgroundJob` | Background Job | Recurring job (runs hourly) dispatching `ExpireStaleInteracRequestsCommand`. |
| `CreateStoreOrderWithInteracHandler` | Handler | Creates `Order` with `PaymentMethod = InteracETransfer` and `Status = Pending`, creates linked `InteracPaymentRequest`, returns checkout result with instructions. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `InteracController` | Controller | Authenticated endpoints: `POST /api/interac/payment-requests` (create request from invoice), `POST /api/interac/payment-requests/{id}/confirm` (confirm receipt), `GET /api/interac/payment-requests` (list with status filter). |
| `InteracSettingsController` | Controller | Authenticated endpoints: `PUT /api/settings/interac` (update settings), `GET /api/settings/interac` (get settings). |
| `StoreCheckoutController` | Controller (extended) | Extended checkout endpoint: `POST /api/store/checkout` with `paymentMethod = InteracETransfer` routes to `CreateStoreOrderWithInteracCommand`. |

---

## Class Diagrams

### Domain Layer -- Interac Entities

![Domain Layer -- Interac Entities](domain-layer-interac-entities.png)

### Application Layer -- Interac Commands

![Application Layer -- Interac Commands](application-layer-interac-commands.png)

### Application Layer -- Interac Queries & DTOs

![Application Layer -- Interac Queries & DTOs](application-layer-interac-queries-dtos.png)

### API Layer -- Interac Controllers

![API Layer -- Interac Controllers](api-layer-interac-controllers.png)

---

## Sequence Diagrams

### Create Interac Payment Request from Invoice

![Create Interac Payment Request from Invoice](create-interac-payment-request-from-invoice.png)

### Confirm Interac Payment Receipt

![Confirm Interac Payment Receipt](confirm-interac-payment-receipt.png)

### List Interac Payment Requests

![List Interac Payment Requests](list-interac-payment-requests.png)

### Background Expiry of Stale Requests

![Background Expiry of Stale Requests](background-expiry-of-stale-requests.png)

### Update Interac Settings

![Update Interac Settings](update-interac-settings.png)

### Store Checkout with Interac e-Transfer

![Store Checkout with Interac e-Transfer](store-checkout-with-interac-e-transfer.png)
