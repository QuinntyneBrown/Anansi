# F21 - Website Hosting & Domains

## Overview

This feature provides the hosting infrastructure and domain management capabilities for every photographer website on the Anansi platform. Every published website receives free, unlimited hosting with no bandwidth limits or throttling. SSL certificates are automatically provisioned and renewed for all sites, ensuring every visitor connection is encrypted without requiring any photographer action.

Each photographer is assigned a free platform subdomain (username.anansi.com) derived from their `Subdomain` field on the `Photographer` entity. Photographers on paid plans can connect a custom domain -- either an apex domain or a subdomain -- by following step-by-step DNS instructions. The platform verifies DNS propagation, provisions an SSL certificate for the custom domain, and begins serving the website at the new address. The `CustomDomain` entity in the Branding namespace tracks verification state, SSL certificate lifecycle, and DNS instructions.

Security features complement the hosting layer. Password protection can be applied at the entire-site level (stored on `Website.SitePasswordHash`) or per-page (stored on `WebsitePage.PagePasswordHash`). Right-click image protection is enabled by default, suppressing the browser context menu on images to discourage casual downloading; it is toggleable via Settings > Advanced and stored as `Website.RightClickProtectionEnabled`.

**L2 Requirements:** WEB-3.6.1 (Hosting), WEB-3.6.2 (Custom Domain), WEB-3.6.3 (Password Protection), WEB-3.6.4 (Right-Click Protection)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Website` | Entity | Core website entity. Stores `Subdomain`, `SslEnabled`, `CustomDomain`, `CustomDomainVerified`, `SitePasswordHash`, and `RightClickProtectionEnabled`. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `WebsitePage` | Entity | Individual page within a website. Stores `PagePasswordHash` for per-page password protection (WEB-3.6.3). |
| `CustomDomain` | Entity | Tracks custom domain setup including `DomainName`, `Purpose`, `IsVerified`, `SslStatus`, `SslCertificateId`, `SslExpiresAt`, `DnsInstructions`, and `VerificationToken`. |
| `DomainPurpose` | Enum | `Gallery`, `Website` -- distinguishes custom domain usage. |
| `SslStatus` | Enum | `Pending`, `Active`, `Expired`, `Failed` -- tracks SSL certificate lifecycle. |
| `WebsiteStatus` | Enum | `Draft`, `Published`, `Archived` -- controls whether a site is publicly accessible. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ConfigureSubdomainCommand` | Command | Sets or updates the photographer's platform subdomain. Validates uniqueness. |
| `ConnectCustomDomainCommand` | Command | Initiates custom domain connection: validates plan tier, creates `CustomDomain` record, generates DNS instructions and verification token. |
| `VerifyCustomDomainCommand` | Command | Checks DNS propagation for the domain, updates `IsVerified`, triggers SSL provisioning. |
| `RemoveCustomDomainCommand` | Command | Disconnects a custom domain, revokes SSL certificate, deletes the `CustomDomain` record. |
| `GetDnsInstructionsQuery` | Query | Returns step-by-step DNS configuration instructions for a pending custom domain. |
| `SetSitePasswordCommand` | Command | Hashes and stores a password for the entire website (`Website.SitePasswordHash`). |
| `SetPagePasswordCommand` | Command | Hashes and stores a password for a specific page (`WebsitePage.PagePasswordHash`). |
| `RemovePasswordCommand` | Command | Removes password protection from a site or specific page. |
| `ValidateSitePasswordCommand` | Command | Validates a visitor-provided password against the stored hash. Returns an access cookie/token on success. |
| `UpdateRightClickProtectionCommand` | Command | Toggles `RightClickProtectionEnabled` on the `Website` entity. |
| `GetHostingStatusQuery` | Query | Returns hosting details: subdomain URL, custom domain status, SSL status, protection settings. |
| `ISslService` | Interface | Provisions and renews SSL certificates. Methods: `ProvisionAsync`, `RenewAsync`, `RevokeAsync`. |
| `IDnsVerificationService` | Interface | Checks DNS records. Methods: `VerifyAsync`, `GenerateInstructionsAsync`. |
| `IPlanGateService` | Interface | Checks whether the photographer's current plan supports a given feature (e.g., custom domains). |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `ConnectCustomDomainHandler` | Handler | Validates paid plan via `IPlanGateService`, creates `CustomDomain` entity, calls `IDnsVerificationService.GenerateInstructionsAsync` for DNS instructions. |
| `VerifyCustomDomainHandler` | Handler | Calls `IDnsVerificationService.VerifyAsync`. On success, calls `ISslService.ProvisionAsync` and updates `CustomDomain.SslStatus`. |
| `SslService` | Service | Implements `ISslService`. Integrates with Let's Encrypt (or similar ACME provider) for certificate provisioning and renewal. |
| `DnsVerificationService` | Service | Implements `IDnsVerificationService`. Queries DNS records to verify CNAME/A record configuration. |
| `SslRenewalBackgroundService` | Background Service | Periodic job that checks `CustomDomain.SslExpiresAt` and renews certificates approaching expiration. |
| `PasswordHashingService` | Service | Uses BCrypt to hash and verify site/page passwords. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `HostingController` | Controller | Endpoints: `GET /api/websites/{id}/hosting` (status), `PUT /api/websites/{id}/subdomain`, `POST /api/websites/{id}/domain` (connect), `POST /api/websites/{id}/domain/verify`, `DELETE /api/websites/{id}/domain`. All require `[Authorize]`. |
| `WebsiteSecurityController` | Controller | Endpoints: `PUT /api/websites/{id}/password`, `DELETE /api/websites/{id}/password`, `PUT /api/websites/{id}/pages/{pageId}/password`, `DELETE /api/websites/{id}/pages/{pageId}/password`, `PUT /api/websites/{id}/right-click-protection`. All require `[Authorize]`. |
| `SiteAccessController` | Controller | Public endpoint: `POST /api/sites/{subdomain}/access` -- validates visitor password, returns access token/cookie. |
| `SiteRenderMiddleware` | Middleware | Intercepts requests to `*.anansi.com` and custom domains. Resolves the `Website` entity, checks publication status and password protection, injects right-click protection script if enabled. |

---

## Class Diagrams

### Domain Layer -- Hosting & Domain Entities

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class Website {
  +Id : Guid
  +PhotographerId : Guid
  +Name : string
  +Status : WebsiteStatus
  +Subdomain : string
  +SslEnabled : bool
  +CustomDomain : string?
  +CustomDomainVerified : bool
  +SitePasswordHash : string?
  +RightClickProtectionEnabled : bool
}

class WebsitePage {
  +Id : Guid
  +WebsiteId : Guid
  +Title : string
  +Slug : string
  +PagePasswordHash : string?
  +IsVisible : bool
}

class CustomDomain {
  +Id : Guid
  +PhotographerId : Guid
  +DomainName : string
  +Purpose : DomainPurpose
  +IsVerified : bool
  +SslStatus : SslStatus
  +SslCertificateId : string?
  +SslExpiresAt : DateTime?
  +DnsInstructions : string?
  +VerificationToken : string?
  +VerifiedAt : DateTime?
}

enum DomainPurpose {
  Gallery
  Website
}

enum SslStatus {
  Pending
  Active
  Expired
  Failed
}

enum WebsiteStatus {
  Draft
  Published
  Archived
}

Website "1" --> "*" WebsitePage : Pages
Website ..> WebsiteStatus
CustomDomain ..> DomainPurpose
CustomDomain ..> SslStatus
@enduml
```

![Domain Layer -- Hosting & Domain Entities](domain-layer-hosting-domain-entities.png)

### Application Layer -- Hosting Commands & Interfaces

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Hosting.Commands" {
  class ConfigureSubdomainCommand <<record>> {
    +WebsiteId : Guid
    +Subdomain : string
  }

  class ConnectCustomDomainCommand <<record>> {
    +WebsiteId : Guid
    +DomainName : string
  }

  class VerifyCustomDomainCommand <<record>> {
    +WebsiteId : Guid
  }

  class RemoveCustomDomainCommand <<record>> {
    +WebsiteId : Guid
  }
}

package "Features.Hosting.Queries" {
  class GetDnsInstructionsQuery <<record>> {
    +WebsiteId : Guid
  }

  class GetHostingStatusQuery <<record>> {
    +WebsiteId : Guid
  }
}

package "Features.Security.Commands" {
  class SetSitePasswordCommand <<record>> {
    +WebsiteId : Guid
    +Password : string
  }

  class SetPagePasswordCommand <<record>> {
    +WebsiteId : Guid
    +PageId : Guid
    +Password : string
  }

  class UpdateRightClickProtectionCommand <<record>> {
    +WebsiteId : Guid
    +Enabled : bool
  }
}

interface ISslService {
  +ProvisionAsync()
  +RenewAsync()
  +RevokeAsync()
}

interface IDnsVerificationService {
  +VerifyAsync()
  +GenerateInstructionsAsync()
}

interface IPlanGateService {
  +HasFeatureAsync()
}

ConnectCustomDomainCommand ..> IPlanGateService : checks plan
ConnectCustomDomainCommand ..> IDnsVerificationService : generates instructions
VerifyCustomDomainCommand ..> IDnsVerificationService : verifies DNS
VerifyCustomDomainCommand ..> ISslService : provisions cert
@enduml
```

![Application Layer -- Hosting Commands & Interfaces](application-layer-hosting-commands-interfaces.png)

### Infrastructure Layer -- SSL & DNS Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface ISslService {
  +ProvisionAsync(domain) : SslCertResult
  +RenewAsync(certId) : SslCertResult
  +RevokeAsync(certId) : void
}

interface IDnsVerificationService {
  +VerifyAsync(domain, token) : bool
  +GenerateInstructionsAsync(domain) : DnsInstructions
}

class SslService {
  -_acmeClient : IAcmeClient
  -_dbContext : IApplicationDbContext
  +ProvisionAsync(domain) : SslCertResult
  +RenewAsync(certId) : SslCertResult
  +RevokeAsync(certId) : void
}

class DnsVerificationService {
  -_dnsClient : IDnsClient
  +VerifyAsync(domain, token) : bool
  +GenerateInstructionsAsync(domain) : DnsInstructions
}

class SslRenewalBackgroundService {
  -_serviceScopeFactory : IServiceScopeFactory
  +ExecuteAsync(ct) : Task
}

class PasswordHashingService {
  +Hash(plaintext) : string
  +Verify(plaintext, hash) : bool
}

ISslService <|.. SslService
IDnsVerificationService <|.. DnsVerificationService
SslRenewalBackgroundService --> ISslService : renews certificates
@enduml
```

![Infrastructure Layer -- SSL & DNS Services](infrastructure-layer-ssl-dns-services.png)

### API Layer -- Hosting & Security Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class HostingController <<ApiController>> {
  -_mediator : IMediator
  +GetHostingStatus(websiteId) : IActionResult
  +ConfigureSubdomain(websiteId, cmd) : IActionResult
  +ConnectCustomDomain(websiteId, cmd) : IActionResult
  +VerifyCustomDomain(websiteId) : IActionResult
  +RemoveCustomDomain(websiteId) : IActionResult
  +GetDnsInstructions(websiteId) : IActionResult
}

class WebsiteSecurityController <<ApiController>> {
  -_mediator : IMediator
  +SetSitePassword(websiteId, cmd) : IActionResult
  +RemoveSitePassword(websiteId) : IActionResult
  +SetPagePassword(websiteId, pageId, cmd) : IActionResult
  +RemovePagePassword(websiteId, pageId) : IActionResult
  +UpdateRightClickProtection(websiteId, cmd) : IActionResult
}

class SiteAccessController <<ApiController>> {
  -_mediator : IMediator
  +ValidatePassword(subdomain, cmd) : IActionResult
}

class SiteRenderMiddleware {
  -_next : RequestDelegate
  +InvokeAsync(HttpContext) : Task
}

note right of SiteRenderMiddleware
  Resolves website from hostname.
  Checks Published status.
  Enforces password protection.
  Injects right-click protection JS.
end note

HostingController --> "IMediator" : sends commands/queries
WebsiteSecurityController --> "IMediator" : sends commands
SiteAccessController --> "IMediator" : sends commands
@enduml
```

![API Layer -- Hosting & Security Controllers](api-layer-hosting-security-controllers.png)

---

## Sequence Diagrams

### Connect Custom Domain

```plantuml
@startuml
actor Photographer as P
participant "HostingController" as HC
participant "MediatR" as M
participant "ConnectCustomDomainHandler" as CH
participant "IPlanGateService" as PG
participant "IDnsVerificationService" as DNS
participant "ApplicationDbContext" as DB

P -> HC : POST /api/websites/{id}/domain\n{domainName: "studio.example.com"}
HC -> M : Send(ConnectCustomDomainCommand)
M -> CH : Handle()
CH -> PG : HasFeatureAsync("CustomDomain")
PG --> CH : true (paid plan)
CH -> DNS : GenerateInstructionsAsync("studio.example.com")
DNS --> CH : DnsInstructions {cname, token}
CH -> DB : Create CustomDomain entity\n(IsVerified=false, SslStatus=Pending)
CH -> DB : Update Website.CustomDomain
DB --> CH : saved
CH --> M : DnsInstructions + verificationToken
M --> HC : result
HC --> P : 200 OK {dnsInstructions, verificationToken}
@enduml
```

![Connect Custom Domain](connect-custom-domain.png)

### Verify Custom Domain & Provision SSL

```plantuml
@startuml
actor Photographer as P
participant "HostingController" as HC
participant "MediatR" as M
participant "VerifyCustomDomainHandler" as VH
participant "IDnsVerificationService" as DNS
participant "ISslService" as SSL
participant "ApplicationDbContext" as DB

P -> HC : POST /api/websites/{id}/domain/verify
HC -> M : Send(VerifyCustomDomainCommand)
M -> VH : Handle()
VH -> DB : Load CustomDomain entity
DB --> VH : customDomain
VH -> DNS : VerifyAsync(domainName, token)
DNS --> VH : true (DNS propagated)
VH -> DB : CustomDomain.IsVerified = true
VH -> SSL : ProvisionAsync(domainName)
SSL --> VH : SslCertResult {certId, expiresAt}
VH -> DB : Update SslStatus=Active,\nSslCertificateId, SslExpiresAt
VH -> DB : Website.CustomDomainVerified = true
DB --> VH : saved
VH --> M : success
M --> HC : result
HC --> P : 200 OK {verified: true, sslActive: true}
@enduml
```

![Verify Custom Domain & Provision SSL](verify-custom-domain-provision-ssl.png)

### Visitor Accesses Password-Protected Site

```plantuml
@startuml
actor Visitor as V
participant "SiteRenderMiddleware" as MW
participant "ApplicationDbContext" as DB
participant "SiteAccessController" as SAC
participant "MediatR" as M
participant "PasswordHashingService" as PH

V -> MW : GET studio.anansi.com/portfolio
MW -> DB : Resolve Website by subdomain
DB --> MW : Website (SitePasswordHash != null)
MW --> V : 403 + password prompt page

V -> SAC : POST /api/sites/studio/access\n{password: "secret123"}
SAC -> M : Send(ValidateSitePasswordCommand)
M -> PH : Verify(password, storedHash)
PH --> M : true
M --> SAC : accessToken
SAC --> V : 200 OK + Set-Cookie: site_access={token}

V -> MW : GET studio.anansi.com/portfolio\n(Cookie: site_access={token})
MW -> DB : Resolve Website by subdomain
MW -> MW : Validate access token
MW --> V : 200 OK + rendered page\n(right-click protection JS injected)
@enduml
```

![Visitor Accesses Password-Protected Site](visitor-accesses-password-protected-site.png)

### SSL Certificate Auto-Renewal

```plantuml
@startuml
participant "SslRenewalBackgroundService" as BG
participant "ApplicationDbContext" as DB
participant "ISslService" as SSL

BG -> DB : Query CustomDomain\nWHERE SslExpiresAt < NOW + 30 days\nAND SslStatus = Active
DB --> BG : List<CustomDomain>

loop for each expiring domain
  BG -> SSL : RenewAsync(domain.SslCertificateId)
  SSL --> BG : SslCertResult {newCertId, newExpiresAt}
  BG -> DB : Update SslCertificateId, SslExpiresAt
  DB --> BG : saved
end

BG -> BG : Sleep until next check interval
@enduml
```

![SSL Certificate Auto-Renewal](ssl-certificate-auto-renewal.png)
