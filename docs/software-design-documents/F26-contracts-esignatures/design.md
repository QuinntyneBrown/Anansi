# F26 - Contracts & E-Signatures

## Overview

This feature provides photographers with a full-lifecycle contract management system: authoring rich-content contracts, collecting client-fillable fields, auto-populating variables from contact profiles, capturing legally-timestamped e-signatures on any device, and managing document expiry with automated reminders. Contracts are first-class documents within the Studio Manager CRM, linkable to contacts and projects.

The contract editor supports structured rich content (headings, bold, italic, lists, paragraphs) stored as sanitized HTML, plus custom header images for branding. Client-fillable fields can be inserted anywhere in the document body with custom labels and optional pre-fill values. Auto-population variables (e.g., `{{client_name}}`, `{{client_email}}`) resolve from the linked contact's profile data when the contract is sent; custom variables prompt the photographer for values at send time.

E-signatures are captured digitally with timestamp, IP address, and user-agent metadata. By default, every contract includes a photographer and a client signature block at the bottom. Photographers can pre-sign before sending. Multi-signer support allows adding a second client signer (e.g., a spouse). Contract templates let photographers save and reuse configurations including content, fields, and variables, with at least three sample templates for common photography scenarios. Document expiry auto-cancels unsigned contracts after a configurable period, and automatic reminder emails nudge clients at configurable intervals until they sign (both features available on upgraded plans).

**L2 Requirements:** CON-4.4.1 (Contract Editor), CON-4.4.2 (Client-Fillable Fields), CON-4.4.3 (Auto-Population Variables), CON-4.4.4 (E-Signatures), CON-4.4.5 (Contract Templates), CON-4.4.6 (Document Expiry), CON-4.4.7 (Automatic Reminders)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Contract` | Entity | Rich-content contract with HTML body, header image, status lifecycle, expiry settings, reminder configuration, and template flag. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `ContractField` | Entity | Client-fillable field or auto-population variable inserted in the contract body. Stores label, default value, client-entered value, variable key, and sort order. |
| `ContractSignature` | Entity | Digital signature record capturing signer name, email, role (Photographer/Client/SecondClient), Base64 signature data, timestamp, IP, and user-agent. |
| `ContractStatus` | Enum | `Draft`, `Sent`, `Viewed`, `Signed`, `Expired`, `Cancelled`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateContractCommand` | Command | Creates a new contract with title, HTML content, header image, fields, and linked contact/project. Returns the contract ID. |
| `UpdateContractCommand` | Command | Updates content, fields, header image, expiry settings, and reminder configuration on a draft contract. |
| `DeleteContractCommand` | Command | Soft-deletes a contract. |
| `SendContractCommand` | Command | Transitions status to `Sent`, sets `SentAt`, calculates `ExpiresAt`, resolves auto-population variables from contact profile, and sends email to client via `IEmailService`. |
| `PreSignContractCommand` | Command | Captures the photographer's signature before sending. |
| `SignContractCommand` | Command | Captures a client signature (or second-client signature) with timestamp, IP, user-agent. When all required signatures are collected, transitions status to `Signed` and stops reminders. |
| `AddSignerCommand` | Command | Adds a second client signer to the contract (multi-signer support). |
| `ViewContractQuery` | Query | Returns full contract detail including content, fields, and signature status. Transitions status to `Viewed` if currently `Sent`. |
| `ListContractsQuery` | Query | Returns paginated list of contracts for the authenticated photographer, filterable by status and contact. |
| `GetContractByTokenQuery` | Query | Returns the client-facing contract view using a secure access token (no auth required). |
| `SaveContractTemplateCommand` | Command | Saves a contract configuration as a reusable template (sets `IsTemplate = true` with a template name). |
| `ListContractTemplatesQuery` | Query | Returns all saved contract templates for the photographer. |
| `ApplyContractTemplateCommand` | Command | Creates a new contract from a template, copying content, fields, and variables. Prompts for custom variable values. |
| `CancelContractCommand` | Command | Manually cancels a sent/viewed contract, setting status to `Cancelled`. |
| `ProcessContractExpiryCommand` | Command | Background job command: finds contracts past `ExpiresAt`, transitions to `Expired`, notifies photographer. |
| `SendContractRemindersCommand` | Command | Background job command: finds contracts due for reminders based on interval, sends email, updates `LastReminderSentAt`. |
| `ContractDto` | DTO | Contract summary for list views. |
| `ContractDetailDto` | DTO | Full contract detail with content, fields, signatures. |
| `ContractTemplateDto` | DTO | Template summary for selection. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateContractCommandHandler` | Handler | Validates input, creates `Contract` + `ContractField` entities, persists to database. |
| `SendContractCommandHandler` | Handler | Resolves auto-population variables from `Contact` profile, generates secure client access token, sends email via `IEmailService`, updates status. |
| `SignContractCommandHandler` | Handler | Validates signer role, creates `ContractSignature`, checks if all required signatures are present, transitions to `Signed`. |
| `ProcessContractExpiryHandler` | Handler | Queries contracts where `ExpiresAt < UtcNow` and `Status = Sent/Viewed`, updates to `Expired`, sends notification. |
| `SendContractRemindersHandler` | Handler | Queries contracts due for reminder, validates plan supports reminders, sends email, updates timestamp. |
| `ContractExpiryJob` | Background Job | Hangfire/Quartz recurring job that dispatches `ProcessContractExpiryCommand`. |
| `ContractReminderJob` | Background Job | Hangfire/Quartz recurring job that dispatches `SendContractRemindersCommand`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ContractsController` | Controller | Authenticated endpoints: `POST` (create), `PUT /{id}` (update), `DELETE /{id}`, `POST /{id}/send`, `POST /{id}/pre-sign`, `POST /{id}/add-signer`, `POST /{id}/cancel`, `GET` (list), `GET /{id}` (detail). |
| `ContractTemplatesController` | Controller | Authenticated endpoints: `POST` (save template), `GET` (list templates), `POST /{id}/apply` (create from template). |
| `ContractPublicController` | Controller | Anonymous endpoints: `GET /contracts/view/{token}` (client view), `POST /contracts/sign/{token}` (client signature). |

---

## Class Diagrams

### Domain Layer -- Contract Entities

![Domain Layer -- Contract Entities](domain-layer-contract-entities.png)

### Application Layer -- Contract Commands & Queries

![Application Layer -- Contract Commands & Queries](application-layer-contract-commands-queries.png)

### Application Layer -- Contract Template Commands

![Application Layer -- Contract Template Commands](application-layer-contract-template-commands.png)

### API Layer -- Contract Controllers

![API Layer -- Contract Controllers](api-layer-contract-controllers.png)

---

## Sequence Diagrams

### Create and Send Contract

![Create and Send Contract](create-and-send-contract.png)

### Send Contract to Client

![Send Contract to Client](send-contract-to-client.png)

### Client Views and Signs Contract

![Client Views and Signs Contract](client-views-and-signs-contract.png)

### Photographer Pre-Signs Contract

![Photographer Pre-Signs Contract](photographer-pre-signs-contract.png)

### Contract Expiry Background Job

![Contract Expiry Background Job](contract-expiry-background-job.png)

### Contract Reminder Background Job

![Contract Reminder Background Job](contract-reminder-background-job.png)

### Apply Contract Template

![Apply Contract Template](apply-contract-template.png)
