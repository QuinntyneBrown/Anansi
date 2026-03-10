# F39 - Custom Domains

## Overview

Custom Domains allows photographers on paid plans to serve their galleries and websites from their own domain names instead of the default `username.anansi.com` platform subdomain. Gallery custom domains use a CNAME-based subdomain pattern (e.g., `gallery.yourdomain.com`), while website custom domains support both apex domains (`yourdomain.com`) and subdomains (`www.yourdomain.com`). Every custom domain receives auto-provisioned SSL via Let's Encrypt or a managed certificate provider, ensuring HTTPS is available without manual intervention.

The connection workflow follows a three-phase process: registration, DNS verification, and SSL provisioning. When a photographer registers a custom domain, the system generates a unique verification token and returns step-by-step DNS configuration instructions (CNAME and TXT records). The photographer configures their DNS provider, then triggers a verification check. Once the TXT record is confirmed, the domain is marked as verified and SSL provisioning begins automatically. The system periodically monitors certificate expiry and renews certificates before they lapse.

All users receive a free platform subdomain (`username.anansi.com`) that routes to their primary gallery or website. This subdomain is provisioned at account creation and cannot be removed. Custom domains are additive -- they do not replace the platform subdomain but provide a branded alternative. The `CustomDomain` entity and its CQRS commands already exist in the codebase; this design document describes their full behavior, the DNS verification infrastructure, SSL lifecycle management, and the routing middleware that directs incoming requests to the correct photographer's content.

**L2 Requirements:** BRD-7.3.1 (Gallery Custom Domain), BRD-7.3.2 (Website Custom Domain)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CustomDomain` | Entity (existing) | Stores `DomainName`, `Purpose` (Gallery/Website), `IsVerified`, `SslStatus`, `SslCertificateId`, `SslExpiresAt`, `DnsInstructions`, `VerificationToken`, `VerifiedAt`. Implements `ITenantEntity`. |
| `DomainPurpose` | Enum (existing) | `Gallery`, `Website`. Determines routing behavior and DNS instruction template. |
| `SslStatus` | Enum (existing) | `Pending`, `Active`, `Expired`, `Failed`. Tracks the lifecycle of the SSL certificate. |
| `Photographer` | Entity (existing) | Contains `Subdomain` (the free `username.anansi.com` slug), `CustomGalleryDomain`, and `CustomWebsiteDomain` (quick-lookup fields updated when a domain is verified). |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CreateCustomDomainCommand` | Command (existing) | Registers a new custom domain. Validates domain format (regex), checks for global uniqueness, generates verification token, generates DNS instructions, and persists the entity. Plan-gated: rejects if the photographer's plan does not include custom domains. |
| `VerifyCustomDomainCommand` | Command (existing) | Triggers DNS verification for a registered domain. Calls `IDnsVerificationService` to check the TXT record matches the verification token. On success, marks `IsVerified = true` and initiates SSL provisioning via `ISslProvisioningService`. |
| `ListCustomDomainsQuery` | Query (existing) | Returns all custom domains for the photographer, ordered by creation date. |
| `DeleteCustomDomainCommand` | Command (existing) | Removes a custom domain and its SSL certificate. Updates the photographer's quick-lookup domain fields to null. |
| `CheckDomainDnsCommand` | Command | Performs a live DNS lookup without marking the domain as verified. Returns current CNAME and TXT records so the photographer can diagnose configuration issues. |
| `RenewSslCertificateCommand` | Command | Triggered by a scheduled job when a certificate is within 30 days of expiry. Calls `ISslProvisioningService` to renew and updates `SslExpiresAt`. |
| `GetSubdomainAvailabilityQuery` | Query | Checks whether a desired platform subdomain (`username.anansi.com`) is available. Used during registration and account settings. |
| `CustomDomainDto` | DTO (existing) | Read model: ID, domain name, purpose, is verified, SSL status, SSL expiry, DNS instructions, verified at, created at. |
| `DnsCheckResultDto` | DTO | Read model for DNS diagnostic: domain name, CNAME target found, TXT records found, verification match status. |
| `IDnsVerificationService` | Interface | Performs DNS lookups (CNAME, TXT) against public DNS resolvers. Returns structured results. |
| `ISslProvisioningService` | Interface | Provisions and renews SSL certificates for verified custom domains. Abstracts the certificate authority integration. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `DnsVerificationService` | Service | Implements `IDnsVerificationService`. Queries public DNS resolvers (e.g., Google 8.8.8.8, Cloudflare 1.1.1.1) for CNAME and TXT records. Compares TXT record values against the stored verification token. |
| `SslProvisioningService` | Service | Implements `ISslProvisioningService`. Integrates with Let's Encrypt (ACME protocol) or a managed provider (e.g., Azure Front Door, Cloudflare) to issue and renew certificates. Stores certificate identifiers on the `CustomDomain` entity. |
| `SslRenewalBackgroundJob` | BackgroundJob | Runs daily. Queries all `CustomDomain` records where `SslStatus = Active` and `SslExpiresAt` is within 30 days. Dispatches `RenewSslCertificateCommand` for each. |
| `DomainRoutingMiddleware` | Middleware | Inspects the `Host` header on incoming requests. Maps custom domains to photographer IDs by querying a cached lookup table of verified `CustomDomain` records. Sets the tenant context (`PhotographerId`) for downstream handlers. Falls back to platform subdomain resolution for `*.anansi.com` requests. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CustomDomainsController` | Controller | Endpoints: `POST /api/domains` (create), `POST /api/domains/{id}/verify` (verify), `POST /api/domains/{id}/dns-check` (diagnostic), `GET /api/domains` (list), `DELETE /api/domains/{id}` (remove). All require `[Authorize]`. |
| `SubdomainController` | Controller | Endpoints: `GET /api/subdomain/availability?name={slug}` (check availability), `PUT /api/subdomain` (change subdomain on account settings). |

---

## Class Diagrams

### Domain Layer - Custom Domain Entities

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

class CustomDomain {
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

class Photographer {
  +Subdomain : string
  +CustomGalleryDomain : string?
  +CustomWebsiteDomain : string?
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

BaseEntity <|-- CustomDomain
BaseEntity <|-- Photographer
CustomDomain --> DomainPurpose
CustomDomain --> SslStatus
Photographer "1" --> "0..*" CustomDomain : Domains

@enduml
```

![Domain Layer - Custom Domain Entities](domain-layer-custom-domain-entities.png)

### Application Layer - Commands, Queries, and Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CreateCustomDomainCommand <<Command>> {
  +DomainName : string
  +Purpose : DomainPurpose
}

class VerifyCustomDomainCommand <<Command>> {
  +DomainId : Guid
}

class DeleteCustomDomainCommand <<Command>> {
  +DomainId : Guid
}

class CheckDomainDnsCommand <<Command>> {
  +DomainId : Guid
}

class RenewSslCertificateCommand <<Command>> {
  +DomainId : Guid
}

class GetSubdomainAvailabilityQuery <<Query>> {
  +DesiredSubdomain : string
}

class CustomDomainDto <<DTO>> {
  +Id : Guid
  +DomainName : string
  +Purpose : DomainPurpose
  +IsVerified : bool
  +SslStatus : SslStatus
  +SslExpiresAt : DateTime?
  +DnsInstructions : string?
  +VerifiedAt : DateTime?
  +CreatedAt : DateTime
}

class DnsCheckResultDto <<DTO>> {
  +DomainName : string
  +CnameTarget : string?
  +TxtRecords : List<string>
  +VerificationMatch : bool
}

interface IDnsVerificationService <<Interface>> {
  +CheckCnameAsync(domain) : string?
  +CheckTxtRecordsAsync(domain) : List<string>
  +VerifyAsync(domain, token) : bool
}

interface ISslProvisioningService <<Interface>> {
  +ProvisionAsync(domain) : SslCertResult
  +RenewAsync(certId) : SslCertResult
  +RevokeAsync(certId) : Task
}

VerifyCustomDomainCommand --> IDnsVerificationService
VerifyCustomDomainCommand --> ISslProvisioningService
RenewSslCertificateCommand --> ISslProvisioningService
CheckDomainDnsCommand --> IDnsVerificationService

@enduml
```

![Application Layer - Commands, Queries, and Services](application-layer-commands-queries-and-services.png)

### Infrastructure & API Layer

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class CustomDomainsController <<Controller>> {
  +Create() : ActionResult
  +Verify() : ActionResult
  +DnsCheck() : ActionResult
  +List() : ActionResult
  +Delete() : ActionResult
}

class SubdomainController <<Controller>> {
  +CheckAvailability() : ActionResult
  +ChangeSubdomain() : ActionResult
}

class DnsVerificationService <<Service>> {
  +CheckCnameAsync(domain) : string?
  +CheckTxtRecordsAsync(domain) : List<string>
  +VerifyAsync(domain, token) : bool
}

class SslProvisioningService <<Service>> {
  +ProvisionAsync(domain) : SslCertResult
  +RenewAsync(certId) : SslCertResult
  +RevokeAsync(certId) : Task
}

class SslRenewalBackgroundJob <<BackgroundJob>> {
  -_db : IApplicationDbContext
  -_mediator : IMediator
  +RunAsync() : Task
}

class DomainRoutingMiddleware <<Middleware>> {
  -_domainCache : IConcurrentDictionary
  -_db : IApplicationDbContext
  +InvokeAsync(HttpContext) : Task
}

interface IDnsVerificationService <<Interface>>
interface ISslProvisioningService <<Interface>>

DnsVerificationService ..|> IDnsVerificationService
SslProvisioningService ..|> ISslProvisioningService
SslRenewalBackgroundJob --> ISslProvisioningService
DomainRoutingMiddleware --> IApplicationDbContext

CustomDomainsController ..> CreateCustomDomainCommand
CustomDomainsController ..> VerifyCustomDomainCommand
CustomDomainsController ..> CheckDomainDnsCommand

@enduml
```

![Infrastructure & API Layer](infrastructure-api-layer.png)

---

## Sequence Diagrams

### Register Custom Domain

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "CustomDomainsController" as API
participant "CreateCustomDomainHandler" as Handler
participant "IPlanService" as Plans
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/domains\n{domainName: "gallery.janedoe.com",\npurpose: Gallery}
API -> Handler : Send(CreateCustomDomainCommand)

Handler -> Handler : Verify PhotographerId

Handler -> Plans : HasFeatureAsync(photographerId, "CustomDomain")
Plans --> Handler : true

Handler -> Handler : Validate domain format (regex)

Handler -> DB : Check global uniqueness\n(no other CustomDomain with same name)
DB --> Handler : not exists

Handler -> Handler : Generate verificationToken\n(Guid.NewGuid "N" format)

Handler -> Handler : Generate DNS instructions:\n1. CNAME gallery.janedoe.com -> gallery.anansi.com\n2. TXT _anansi-verify.gallery.janedoe.com = {token}\n3. Wait for propagation

Handler -> DB : Create CustomDomain\n(IsVerified=false, SslStatus=Pending)
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<CustomDomainDto>
API --> Photographer : 201 Created\n{id, domainName, dnsInstructions, sslStatus: Pending}

@enduml
```

![Register Custom Domain](register-custom-domain.png)

### Verify Domain and Provision SSL

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "CustomDomainsController" as API
participant "VerifyCustomDomainHandler" as Handler
participant "IDnsVerificationService" as DNS
participant "ISslProvisioningService" as SSL
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/domains/{id}/verify
API -> Handler : Send(VerifyCustomDomainCommand)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Load CustomDomain by Id & PhotographerId
DB --> Handler : CustomDomain (IsVerified=false)

Handler -> DNS : CheckCnameAsync("gallery.janedoe.com")
DNS --> Handler : "gallery.anansi.com" (correct target)

Handler -> DNS : VerifyAsync("gallery.janedoe.com", verificationToken)
DNS --> Handler : true (TXT record matches)

Handler -> Handler : Set IsVerified = true\nSet VerifiedAt = now

Handler -> SSL : ProvisionAsync("gallery.janedoe.com")
note right of SSL
  Initiates ACME challenge
  (HTTP-01 or DNS-01),
  obtains certificate,
  stores cert ID.
end note
SSL --> Handler : SslCertResult {certId, expiresAt}

Handler -> Handler : Set SslStatus = Active\nSet SslCertificateId, SslExpiresAt

Handler -> DB : Update Photographer.CustomGalleryDomain
Handler -> DB : SaveChangesAsync()

Handler --> API : Result<CustomDomainDto>
API --> Photographer : 200 OK\n{isVerified: true, sslStatus: Active,\nsslExpiresAt: "2027-03-10"}

@enduml
```

![Verify Domain and Provision SSL](verify-domain-and-provision-ssl.png)

### DNS Diagnostic Check

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "CustomDomainsController" as API
participant "CheckDomainDnsHandler" as Handler
participant "IDnsVerificationService" as DNS
participant "IApplicationDbContext" as DB

Photographer -> API : POST /api/domains/{id}/dns-check
API -> Handler : Send(CheckDomainDnsCommand)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Load CustomDomain by Id
DB --> Handler : CustomDomain

Handler -> DNS : CheckCnameAsync(domainName)
DNS --> Handler : cnameTarget (or null)

Handler -> DNS : CheckTxtRecordsAsync(domainName)
DNS --> Handler : List<string> txtRecords

Handler -> Handler : Check if any TXT record\nmatches "anansi-verify={token}"

Handler --> API : DnsCheckResultDto\n{cnameTarget, txtRecords, verificationMatch}
API --> Photographer : 200 OK\n{cnameTarget: null,\ntxtRecords: [],\nverificationMatch: false}

note right of Photographer
  Photographer sees that DNS
  is not yet configured and
  follows the instructions.
end note

@enduml
```

![DNS Diagnostic Check](dns-diagnostic-check.png)

### Domain Routing (Incoming Request)

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Client
participant "DomainRoutingMiddleware" as Middleware
participant "DomainCache" as Cache
participant "IApplicationDbContext" as DB
participant "GalleryController" as Gallery
participant "WebsiteController" as Website

Client -> Middleware : GET https://gallery.janedoe.com/my-wedding
Middleware -> Middleware : Extract Host: gallery.janedoe.com

Middleware -> Cache : Lookup("gallery.janedoe.com")

alt Cache hit
  Cache --> Middleware : {photographerId, purpose: Gallery}
else Cache miss
  Middleware -> DB : Find CustomDomain\n(DomainName, IsVerified=true)
  DB --> Middleware : CustomDomain {photographerId, Gallery}
  Middleware -> Cache : Store(domain -> photographerId, purpose)
end

Middleware -> Middleware : Set HttpContext tenant:\nPhotographerId = {id}

alt Purpose = Gallery
  Middleware -> Gallery : Forward request\n/my-wedding (collection slug)
  Gallery --> Client : 200 OK (gallery page)
else Purpose = Website
  Middleware -> Website : Forward request
  Website --> Client : 200 OK (website page)
end

@enduml
```

![Domain Routing (Incoming Request)](domain-routing-incoming-request.png)

### SSL Certificate Renewal

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

participant "SslRenewalBackgroundJob" as Job
participant "IApplicationDbContext" as DB
participant "RenewSslCertificateHandler" as Handler
participant "ISslProvisioningService" as SSL

Job -> Job : Daily schedule trigger

Job -> DB : Query CustomDomains where\nSslStatus = Active AND\nSslExpiresAt < now + 30 days
DB --> Job : List<CustomDomain>\n(domains needing renewal)

loop For each expiring domain
  Job -> Handler : Send(RenewSslCertificateCommand)

  Handler -> DB : Load CustomDomain
  DB --> Handler : CustomDomain

  Handler -> SSL : RenewAsync(certId)
  SSL --> Handler : SslCertResult {newCertId, newExpiresAt}

  alt Renewal successful
    Handler -> Handler : Update SslCertificateId, SslExpiresAt
    Handler -> DB : SaveChangesAsync()
  else Renewal failed
    Handler -> Handler : Set SslStatus = Failed
    Handler -> DB : SaveChangesAsync()
    note right of Handler
      Alert sent to admin
      and photographer via
      notification system.
    end note
  end
end

@enduml
```

![SSL Certificate Renewal](ssl-certificate-renewal.png)

### Delete Custom Domain

```plantuml
@startuml
skinparam sequenceArrowThickness 1.5
skinparam maxMessageSize 200

actor Photographer
participant "CustomDomainsController" as API
participant "DeleteCustomDomainHandler" as Handler
participant "ISslProvisioningService" as SSL
participant "IApplicationDbContext" as DB
participant "DomainCache" as Cache

Photographer -> API : DELETE /api/domains/{id}
API -> Handler : Send(DeleteCustomDomainCommand)

Handler -> Handler : Verify PhotographerId
Handler -> DB : Load CustomDomain by Id & PhotographerId
DB --> Handler : CustomDomain

alt Has SSL certificate
  Handler -> SSL : RevokeAsync(certId)
  SSL --> Handler : OK
end

Handler -> DB : Update Photographer\n(clear CustomGalleryDomain or CustomWebsiteDomain)

Handler -> DB : Remove CustomDomain entity
Handler -> DB : SaveChangesAsync()

Handler -> Cache : Evict(domainName)

Handler --> API : Result.Success()
API --> Photographer : 200 OK

@enduml
```

![Delete Custom Domain](delete-custom-domain.png)
