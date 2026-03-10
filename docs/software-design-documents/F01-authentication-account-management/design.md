# F01 - Authentication & Account Management

## Overview

This feature encompasses the full lifecycle of a photographer's identity on the Anansi platform: creating an account, authenticating, recovering access, managing sessions, maintaining account settings, and ultimately deleting an account when desired. It is the security gateway through which every other feature is accessed.

Registration collects email, password, and basic business information, creating both an ASP.NET Core Identity user and a `Photographer` domain entity. Authentication issues JWT access tokens and opaque refresh tokens, with a configurable session timeout enforced by middleware. Password recovery follows the standard email-reset-link flow. Account settings provide a single surface for personal info, business details, notification preferences, connected integrations, billing overview, and password changes.

Storage monitoring is also housed here because it is tied to the photographer's account limits. The system tracks `StorageUsedBytes` on the `Photographer` entity and raises domain-level warnings at 80%, 90%, and 95% of the plan's storage allocation. Account deletion performs a soft-delete with an optional data-export step that packages the photographer's galleries, documents, and financial records before marking the account as deleted.

**L2 Requirements:** SEC-11.2.1 (Authentication), SEC-11.2.2 (Account Settings), SEC-11.2.3 (Storage Monitoring)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Photographer` | Entity | Core identity entity storing personal/business info, integration credentials, storage usage, and branding references. Implements `IAuditableEntity` and `ISoftDeletable`. |
| `BaseEntity` | Abstract | Provides `Id` (Guid), `CreatedAt`, `UpdatedAt` for all entities. |
| `IAuditableEntity` | Interface | Adds `CreatedBy` / `UpdatedBy` tracking. |
| `ISoftDeletable` | Interface | Adds `IsDeleted` / `DeletedAt` for logical deletion. |
| `StorageWarningLevel` | Enum | Values: `None`, `Warning80`, `Warning90`, `Critical95`. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `RegisterCommand` | Command | Creates Identity user + `Photographer` entity. Accepts email, password, first/last name, business name. Returns user ID, photographer ID, and JWT. |
| `LoginCommand` | Command | Validates credentials, returns access token, refresh token, and expiration. |
| `ForgotPasswordCommand` | Command | Generates a time-limited reset token and sends an email via `IEmailService`. |
| `ResetPasswordCommand` | Command | Validates the reset token and sets the new password. |
| `ChangePasswordCommand` | Command | Authenticated password change requiring current password verification. |
| `LogoutCommand` | Command | Invalidates the current session/refresh token. |
| `GetAccountSettingsQuery` | Query | Returns the authenticated photographer's full profile. |
| `UpdateAccountSettingsCommand` | Command | Updates personal info, business info, notification preferences, integrations, and password. |
| `DeleteAccountCommand` | Command | Accepts `exportFirst` flag. When true, generates a data export before soft-deleting the account. |
| `GetStorageUsageQuery` | Query | Returns current storage used, plan limit, per-collection breakdown, and warning level. |
| `ICurrentUserService` | Interface | Provides `UserId`, `PhotographerId`, `IsAuthenticated` from the HTTP context. |
| `ITokenService` | Interface | Generates JWT access tokens and opaque refresh tokens. |
| `IEmailService` | Interface | Sends plain and templated emails for password reset and notifications. |
| `IStorageService` | Interface | File upload/download/delete operations and pre-signed URL generation. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `RegisterCommandHandler` | Handler | Coordinates Identity `UserManager` to create the user, then creates the `Photographer` entity and issues a token. |
| `LoginCommandHandler` | Handler | Uses `SignInManager` for credential validation, then calls `TokenService`. |
| `ForgotPasswordCommandHandler` | Handler | Generates Identity reset token, constructs reset URL, sends email. |
| `ResetPasswordCommandHandler` | Handler | Validates Identity reset token, calls `ResetPasswordAsync`. |
| `ChangePasswordCommandHandler` | Handler | Calls Identity `ChangePasswordAsync` with old/new passwords. |
| `LogoutCommandHandler` | Handler | Clears session state and optionally revokes refresh tokens. |
| `TokenService` | Service | Implements `ITokenService`. Creates HS256-signed JWTs with claims for user ID, email, photographer ID, and roles. Generates cryptographically random refresh tokens. |
| `CurrentUserService` | Service | Implements `ICurrentUserService`. Extracts claims from `HttpContext.User`. |
| `ApplicationDbContext` | DbContext | EF Core context with `DbSet<Photographer>`. Applies tenant filtering and soft-delete query filters. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `AuthController` | Controller | Endpoints: `POST register`, `POST login`, `POST forgot-password`, `POST reset-password`, `POST change-password`, `POST logout`. Anonymous endpoints for register/login/forgot/reset. |
| `AccountController` | Controller | Endpoints: `GET settings`, `PUT settings`, `DELETE` (account deletion), `GET storage`. All require `[Authorize]`. |
| `SessionTimeoutMiddleware` | Middleware | Checks elapsed time since last activity. If exceeds configurable timeout (default 30 min), clears session and returns 401. Updates `LastActivity` timestamp on each request. |

---

## Class Diagrams

### Domain Layer -- Identity & Account Entities

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

interface IAuditableEntity {
  +CreatedBy : string?
  +UpdatedBy : string?
}

interface ISoftDeletable {
  +IsDeleted : bool
  +DeletedAt : DateTime?
}

class Photographer {
  +Email : string
  +FirstName : string
  +LastName : string
  +BusinessName : string
  +Phone : string?
  +Address : string?
  +City : string?
  +Province : string?
  +PostalCode : string?
  +Country : string?
  +Website : string?
  +LogoUrl : string?
  +ProfileIconUrl : string?
  +FaviconUrl : string?
  +BrandColorHex : string?
  +FontTheme : string?
  +StripeAccountId : string?
  +PayPalEmail : string?
  +GoogleCalendarId : string?
  +ZoomAccountId : string?
  +GoogleAnalyticsId : string?
  +FacebookPixelId : string?
  +Subdomain : string
  +ActivePlanId : Guid?
  +StorageUsedBytes : long
  +IdentityUserId : string?
}

enum StorageWarningLevel {
  None
  Warning80
  Warning90
  Critical95
}

BaseEntity <|-- Photographer
IAuditableEntity <|.. Photographer
ISoftDeletable <|.. Photographer
Photographer ..> StorageWarningLevel : uses
@enduml
```

![Domain Layer -- Identity & Account Entities](domain-layer-identity-account-entities.png)

### Application Layer -- Auth Commands & Interfaces

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.Auth.Commands" {
  class RegisterCommand <<record>> {
    +Email : string
    +Password : string
    +FirstName : string
    +LastName : string
    +BusinessName : string
  }

  class RegisterResponse <<record>> {
    +UserId : string
    +PhotographerId : Guid
    +Token : string
  }

  class LoginCommand <<record>> {
    +Email : string
    +Password : string
  }

  class LoginResponse <<record>> {
    +Token : string
    +RefreshToken : string
    +ExpiresAt : DateTime
    +PhotographerId : Guid?
  }

  class ForgotPasswordCommand <<record>> {
    +Email : string
  }

  class ResetPasswordCommand <<record>> {
    +Token : string
    +NewPassword : string
  }

  class ChangePasswordCommand <<record>> {
    +CurrentPassword : string
    +NewPassword : string
  }

  class LogoutCommand <<record>>
}

package "Features.Account" {
  class GetAccountSettingsQuery <<record>>
  class UpdateAccountSettingsCommand <<record>>
  class DeleteAccountCommand <<record>> {
    +ExportFirst : bool
  }
}

package "Features.Storage" {
  class GetStorageUsageQuery <<record>>
}

interface ITokenService {
  +GenerateAccessToken()
  +GenerateRefreshToken()
}

interface ICurrentUserService {
  +UserId : string?
  +PhotographerId : Guid?
  +IsAuthenticated : bool
}

interface IEmailService {
  +SendAsync()
  +SendTemplatedAsync()
}

RegisterCommand ..> ITokenService : uses
LoginCommand ..> ITokenService : uses
ForgotPasswordCommand ..> IEmailService : uses
@enduml
```

![Application Layer -- Auth Commands & Interfaces](application-layer-auth-commands-interfaces.png)

### Infrastructure Layer -- Identity Services

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

interface ITokenService {
  +GenerateAccessToken()
  +GenerateRefreshToken()
}

interface ICurrentUserService {
  +UserId : string?
  +PhotographerId : Guid?
  +IsAuthenticated : bool
}

class TokenService {
  -_configuration : IConfiguration
  +GenerateAccessToken() : string
  +GenerateRefreshToken() : string
}

class CurrentUserService {
  -_httpContextAccessor : IHttpContextAccessor
  +UserId : string?
  +PhotographerId : Guid?
  +IsAuthenticated : bool
}

class RegisterCommandHandler {
  -_userManager : UserManager
  -_dbContext : IApplicationDbContext
  -_tokenService : ITokenService
  +Handle() : Result<RegisterResponse>
}

class LoginCommandHandler {
  -_signInManager : SignInManager
  -_tokenService : ITokenService
  -_dbContext : IApplicationDbContext
  +Handle() : Result<LoginResponse>
}

class ForgotPasswordCommandHandler {
  -_userManager : UserManager
  -_emailService : IEmailService
  +Handle() : Result
}

class ResetPasswordCommandHandler {
  -_userManager : UserManager
  +Handle() : Result
}

ITokenService <|.. TokenService
ICurrentUserService <|.. CurrentUserService
RegisterCommandHandler --> ITokenService
LoginCommandHandler --> ITokenService
@enduml
```

![Infrastructure Layer -- Identity Services](infrastructure-layer-identity-services.png)

### API Layer -- Controllers & Middleware

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class AuthController <<ApiController>> {
  -_mediator : IMediator
  +Register(RegisterCommand) : IActionResult
  +Login(LoginCommand) : IActionResult
  +ForgotPassword(ForgotPasswordCommand) : IActionResult
  +ResetPassword(ResetPasswordCommand) : IActionResult
  +ChangePassword(ChangePasswordCommand) : IActionResult
  +Logout() : IActionResult
}

class AccountController <<ApiController>> {
  -_mediator : IMediator
  +GetSettings() : IActionResult
  +UpdateSettings(UpdateAccountSettingsCommand) : IActionResult
  +DeleteAccount(exportFirst: bool) : IActionResult
  +GetStorageUsage() : IActionResult
}

class SessionTimeoutMiddleware {
  -_next : RequestDelegate
  -_timeout : TimeSpan
  +InvokeAsync(HttpContext) : Task
}

note right of SessionTimeoutMiddleware
  Reads "Session:TimeoutMinutes" from config.
  Checks LastActivity in session state.
  Returns 401 if idle > timeout.
end note

AuthController --> "IMediator" : sends commands
AccountController --> "IMediator" : sends commands/queries
@enduml
```

![API Layer -- Controllers & Middleware](api-layer-controllers-middleware.png)

---

## Sequence Diagrams

### User Registration

```plantuml
@startuml
actor Photographer as P
participant "AuthController" as AC
participant "MediatR" as M
participant "RegisterCommandHandler" as RH
participant "UserManager" as UM
participant "ApplicationDbContext" as DB
participant "TokenService" as TS

P -> AC : POST /api/auth/register\n{email, password, firstName,\nlastName, businessName}
AC -> M : Send(RegisterCommand)
M -> RH : Handle(command)

RH -> RH : Validate (FluentValidation)
alt validation fails
  RH --> M : Result.Failure(errors)
  M --> AC : Result.Failure
  AC --> P : 400 Bad Request
end

RH -> UM : CreateAsync(user, password)
alt user already exists
  RH --> M : Result.Failure("Email already registered")
  M --> AC : Result.Failure
  AC --> P : 409 Conflict
end

RH -> DB : Photographers.Add(photographer)
RH -> DB : SaveChangesAsync()
RH -> TS : GenerateAccessToken(userId, email, photographerId)
TS --> RH : JWT token
RH --> M : Result.Success(RegisterResponse)
M --> AC : Result.Success
AC --> P : 200 OK {userId, photographerId, token}
@enduml
```

![User Registration](user-registration.png)

### User Login

```plantuml
@startuml
actor Photographer as P
participant "AuthController" as AC
participant "MediatR" as M
participant "LoginCommandHandler" as LH
participant "SignInManager" as SM
participant "ApplicationDbContext" as DB
participant "TokenService" as TS

P -> AC : POST /api/auth/login\n{email, password}
AC -> M : Send(LoginCommand)
M -> LH : Handle(command)

LH -> SM : PasswordSignInAsync(email, password)
alt invalid credentials
  LH --> M : Result.Failure("Invalid credentials")
  M --> AC : Result.Failure
  AC --> P : 401 Unauthorized
end

LH -> DB : Photographers.FirstOrDefault(email)
LH -> TS : GenerateAccessToken(userId, email, photographerId)
TS --> LH : JWT token
LH -> TS : GenerateRefreshToken()
TS --> LH : refresh token
LH --> M : Result.Success(LoginResponse)
M --> AC : Result.Success
AC --> P : 200 OK {token, refreshToken, expiresAt, photographerId}
@enduml
```

![User Login](user-login.png)

### Password Recovery Flow

```plantuml
@startuml
actor Photographer as P
participant "AuthController" as AC
participant "MediatR" as M
participant "ForgotPasswordHandler" as FH
participant "UserManager" as UM
participant "IEmailService" as ES
participant "ResetPasswordHandler" as RH

== Step 1: Request Reset ==
P -> AC : POST /api/auth/forgot-password\n{email}
AC -> M : Send(ForgotPasswordCommand)
M -> FH : Handle(command)
FH -> UM : FindByEmailAsync(email)
alt user not found
  FH --> M : Result.Success (silent, no info leak)
  M --> AC : Result.Success
  AC --> P : 200 OK "If account exists, reset link sent"
end
FH -> UM : GeneratePasswordResetTokenAsync(user)
UM --> FH : resetToken
FH -> ES : SendAsync(email, subject,\nhtmlBody with reset link)
FH --> M : Result.Success
M --> AC : Result.Success
AC --> P : 200 OK "If account exists, reset link sent"

== Step 2: Reset Password ==
P -> AC : POST /api/auth/reset-password\n{token, newPassword}
AC -> M : Send(ResetPasswordCommand)
M -> RH : Handle(command)
RH -> UM : ResetPasswordAsync(user, token, newPassword)
alt invalid/expired token
  RH --> M : Result.Failure("Invalid or expired token")
  M --> AC : Result.Failure
  AC --> P : 400 Bad Request
end
RH --> M : Result.Success
M --> AC : Result.Success
AC --> P : 200 OK "Password reset successfully"
@enduml
```

![Password Recovery Flow](password-recovery-flow.png)

### Session Timeout Enforcement

```plantuml
@startuml
actor Photographer as P
participant "SessionTimeoutMiddleware" as STM
participant "Session Store" as SS
participant "Next Middleware/Controller" as NXT

P -> STM : Any authenticated request
STM -> STM : Check User.Identity.IsAuthenticated

alt not authenticated
  STM -> NXT : pass through
  NXT --> P : response
end

STM -> SS : GetString("LastActivity")

alt LastActivity exists
  STM -> STM : Parse timestamp,\ncalculate elapsed time
  alt elapsed > timeout (default 30 min)
    STM -> SS : Clear()
    STM --> P : 401 "Session has expired\ndue to inactivity"
  end
end

STM -> SS : SetString("LastActivity",\nDateTime.UtcNow)
STM -> NXT : pass through
NXT --> P : response
@enduml
```

![Session Timeout Enforcement](session-timeout-enforcement.png)

### Account Deletion with Data Export

```plantuml
@startuml
actor Photographer as P
participant "AccountController" as AC
participant "MediatR" as M
participant "DeleteAccountHandler" as DH
participant "IStorageService" as SS
participant "ApplicationDbContext" as DB
participant "IEmailService" as ES

P -> AC : DELETE /api/account?exportFirst=true
AC -> M : Send(DeleteAccountCommand(true))
M -> DH : Handle(command)

DH -> DB : Load Photographer with\nall related data

alt exportFirst == true
  DH -> DH : Package galleries,\ndocuments, invoices,\ncontacts into ZIP
  DH -> SS : UploadAsync(exportZip)
  SS --> DH : exportUrl
  DH -> ES : SendAsync(photographer.Email,\n"Your data export is ready",\ndownload link)
end

DH -> DB : photographer.IsDeleted = true\nphotographer.DeletedAt = UtcNow
DH -> DB : SaveChangesAsync()
DH --> M : Result.Success
M --> AC : Result.Success
AC --> P : 200 OK "Account has been deleted"
@enduml
```

![Account Deletion with Data Export](account-deletion-with-data-export.png)

### Storage Usage Monitoring

```plantuml
@startuml
actor Photographer as P
participant "AccountController" as AC
participant "MediatR" as M
participant "GetStorageUsageHandler" as SH
participant "ApplicationDbContext" as DB

P -> AC : GET /api/account/storage
AC -> M : Send(GetStorageUsageQuery)
M -> SH : Handle(query)

SH -> DB : Get Photographer (StorageUsedBytes)
SH -> DB : Get active Plan + FeatureGates\n(storage_gb limit)
SH -> DB : GroupBy CollectionId\nSUM(FileSizeBytes)\nfrom GalleryMedia

SH -> SH : Calculate warning level:\n>= 95% -> Critical95\n>= 90% -> Warning90\n>= 80% -> Warning80\nelse -> None

SH --> M : StorageUsageDto {\n  usedBytes, limitBytes,\n  usedPercent, warningLevel,\n  perCollectionBreakdown[]\n}
M --> AC : Result.Success
AC --> P : 200 OK (StorageUsageDto)
@enduml
```

![Storage Usage Monitoring](storage-usage-monitoring.png)
