# Requirements Completeness Audit

Date: 2026-03-10

## Scope

This audit compares the implemented repository contents against:

- `docs/specs/L1.md`
- `docs/specs/L2.md`
- `docs/features.md`

Source evidence was taken from:

- `src/`
- `tests/Anansi.Tests.Acceptance/`
- Angular workspace projects under `src/Anansi.Web/projects/`

Explicitly excluded from analysis:

- `F35 - Studio Manager Mobile App`
- Native iOS/Android app implementation concerns

## Method

Status legend:

- `High`: strong implementation evidence across API/application/domain, plus tests and/or surfaced web UI
- `Medium`: substantial code exists, but important acceptance criteria or user-facing composition are still missing
- `Low`: mostly interfaces, stubs, or design/docs; weak end-to-end implementation evidence
- `Excluded`: intentionally out of scope

This is a repository audit, not a product demo. A feature can score below `High` even when backend code exists if the top-level app wiring, integration layer, or requirement breadth is still incomplete.

## Executive Summary

The repository is broad and requirement-aware, with a strong backend/application surface and a sizable acceptance-test suite. The codebase is most complete in the .NET backend domains: authentication, plans, CRM, contacts/projects/documents, store data models, tax, cultural discovery, presets, and events.

The main completeness gap is the user-facing web composition. Several Angular domain libraries are implemented, but four of the six top-level apps are still placeholder shells with empty route tables:

- `src/Anansi.Web/projects/booking-site/src/app/app.routes.ts`
- `src/Anansi.Web/projects/online-store/src/app/app.routes.ts`
- `src/Anansi.Web/projects/website-builder/src/app/app.routes.ts`
- `src/Anansi.Web/projects/mobile-gallery/src/app/app.routes.ts`

Those same apps still contain Angular starter placeholder templates in:

- `src/Anansi.Web/projects/booking-site/src/app/app.html`
- `src/Anansi.Web/projects/online-store/src/app/app.html`
- `src/Anansi.Web/projects/website-builder/src/app/app.html`
- `src/Anansi.Web/projects/mobile-gallery/src/app/app.html`

There are also several advanced requirement areas that stop at interface/stub level rather than concrete implementation: Lightroom plugin, concrete print-lab adapters, push/device registration, and the full business financing lifecycle.

## Evidence Snapshot

- .NET solution projects: 5
- API controllers: 43
- Acceptance test files: 44
- Angular workspace project folders: 9
- Angular domain libraries: 17

Observed build/test caveat:

- The repo does not contain a `global.json`, so SDK selection floats to the machine default.
- On this machine, `dotnet build` selected `.NET 11.0.100-preview.1` and failed before compilation because of workload SDK resolution.
- Forcing `.NET 9.0.308` improved SDK selection, but build verification still hit file access/locking issues in `obj/`.
- Result: repository health could not be confirmed by a clean successful build from the root as-is.

## Major Findings

### 1. Top-level web apps are materially incomplete

`studio-manager` and `client-gallery` are composed into routed applications, but `booking-site`, `online-store`, `website-builder`, and `mobile-gallery` are not. This weakens requirement coverage for:

- `F15` Store checkout/order flows
- `F16` to `F22` Website Builder
- `F25` client booking site
- `F36` Mobile Gallery PWA

The domain libraries exist for several of these areas, but the actual app shells are not assembled into working applications.

### 2. Integration-heavy features are uneven

The repository models many integrations, but several remain partial:

- `F12` Print lab integration exposes abstractions and handlers but no concrete lab adapter/service implementation under `src/`
- `F42` Lightroom plugin has only `ILightroomSyncService` and test stubs; there is no `LightroomController`, command/query set, or plugin code in the repo
- `F40` push notification/device token flow is designed but not concretely present in `src/`
- `F43` webhooks/API keys/custom code exist partially, but the broader template API described in requirements is not present

### 3. Business financing is only partially implemented

The repo includes financing entities and basic apply/get flows, but not the broader workflow described in the requirements and design docs:

- no accept/decline offer commands
- no repayment processing implementation
- no financing history endpoints
- no financing-specific controller surface beyond `PaymentsController` apply/get endpoints

### 4. Reproducibility is weaker than the docs imply

`README.md` describes straightforward `dotnet build` / `dotnet test` usage, but the repo currently lacks SDK pinning and did not build cleanly in the observed environment. That is a repository completeness issue because it affects the ability to verify all requirements.

## Feature Coverage

### Client Galleries

- `F01 Authentication & Account Management`: `High`
  Evidence: `AuthController`, `AccountController`, `src/Anansi.Application/Features/Auth`, `tests/Anansi.Tests.Acceptance/Auth`, `src/Anansi.Web/projects/domain/auth`

- `F02 Subscription & Plan Management`: `High`
  Evidence: `PlansController`, `src/Anansi.Application/Features/Plans`, `tests/Anansi.Tests.Acceptance/Plans`, `PlanSelectionComponent`

- `F03 Media Upload & Processing`: `Medium`
  Evidence: `CollectionsController`, `GalleryMediaController`, gallery upload tests, storage/CDN interfaces, gallery domain code
  Gap: no clearly wired photographer-facing gallery admin app route surface

- `F04 Gallery Organization`: `Medium`
  Evidence: `CollectionSetsController`, `CollectionPresetsController`, `tests/Anansi.Tests.Acceptance/Galleries/OrganizationTests.cs`, `src/Anansi.Web/projects/domain/gallery-organization`
  Gap: domain library exists but is not surfaced by a top-level routed gallery admin app

- `F05 Gallery Design & Customization`: `Medium`
  Evidence: gallery design/language tests, gallery entities/settings, branding and website typography infrastructure
  Gap: photographer-facing configuration UI composition is incomplete

- `F06 Photo Delivery & Downloads`: `Medium`
  Evidence: `tests/Anansi.Tests.Acceptance/Galleries/DownloadTests.cs`, gallery/download models, delivery activity coverage
  Gap: full client/store/download UX breadth is not fully surfaced in routed apps

- `F07 Proofing & Favorites`: `Medium`
  Evidence: `FavoritesController`, favorites tests, `FavoritesPageComponent`
  Gap: photographer favorites dashboard/admin composition is not clearly routed

- `F08 Gallery Privacy & Access Control`: `Medium`
  Evidence: privacy tests, password entry component, privacy entities/configuration
  Gap: broader admin configuration UX remains incomplete

- `F09 Gallery Sharing & Social`: `Medium`
  Evidence: sharing tests, `QuickShareLink` models/configuration, shared dialog components
  Gap: comprehensive end-to-end share UI composition is not obvious at app level

- `F10 Gallery Analytics & Activity`: `Medium`
  Evidence: activity tests, analytics DTOs/entities, notification/events infrastructure
  Gap: dedicated surfaced analytics UI appears incomplete

### Store / Commerce

- `F11 Product Catalog Management`: `Medium`
  Evidence: `ProductsController`, `PriceSheetsController`, `tests/Anansi.Tests.Acceptance/Store/ProductTests.cs`, store management/storefront domain components
  Gap: `online-store` app itself is still an empty routed shell

- `F12 Print Lab Integration & Fulfillment`: `Low`
  Evidence: `LabsController`, `ILabIntegrationService`, `SubmitLabOrderCommandHandler`, fulfillment tests
  Gap: no concrete `LabIntegrationService` or lab-specific adapters under `src/`

- `F13 Store Pricing & Price Sheets`: `Medium`
  Evidence: `PriceSheetsController`, pricing entities/configuration, price sheet tests
  Gap: top-level storefront/admin app composition incomplete

- `F14 Promotions & Gift Cards`: `Medium`
  Evidence: `CouponsController`, `GiftCardsController`, acceptance tests, payment/store DTOs
  Gap: client/storefront composition incomplete

- `F15 Store Checkout & Orders`: `Medium`
  Evidence: `OrdersController`, payment/order tests, `StoreBrowsePageComponent`, `CartPageComponent`, `CheckoutPageComponent`
  Gap: `online-store` app has empty routes and placeholder app template

### Website Builder

- `F16 Website Builder Core`: `Medium`
  Evidence: `WebsitesController`, `WebsiteTemplatesController`, website application features, `@domain/website-builder` library
  Gap: `website-builder` app routes are empty and the app shell remains placeholder content

- `F17 Website Pages & Content`: `Medium`
  Evidence: `WebsitePagesController`, `PageElementsController`, page/template tests, `PageManagerComponent`
  Gap: full editor composition is not wired into the top-level app

- `F18 Blog Platform`: `Medium`
  Evidence: `BlogController`, website blog tests, blog DTOs/entities
  Gap: no composed blog management UI in the top-level website builder app

- `F19 Website Design & Typography`: `Medium`
  Evidence: `WebsiteTypographyController`, typography features/tests, template/domain website-builder components
  Gap: end-to-end design tooling UI is incomplete

- `F20 SEO & Discovery`: `Medium`
  Evidence: `WebsiteSeoController`, SEO tests, `SeoManagerComponent`
  Gap: component exists, but top-level website builder app does not route to it

- `F21 Website Hosting & Domains`: `Medium`
  Evidence: websites/custom domain/password/branding tests and models
  Gap: routed/published website management UX is incomplete at app level

- `F22 Website Analytics`: `Medium`
  Evidence: analytics DTOs/entities, website tests, integration config endpoints
  Gap: app composition remains incomplete

### Studio Manager / CRM / Booking / Documents / Finance

- `F23 Contacts & CRM`: `High`
  Evidence: `ContactsController`, CRM tests, `ContactListPageComponent`, `ContactDetailPageComponent`

- `F24 Project Pipeline Board`: `High`
  Evidence: `ProjectsController`, project tests, `ProjectBoardPageComponent`

- `F25 Booking & Scheduling`: `Medium`
  Evidence: `BookingsController`, booking tests, `BookingManagementPageComponent`, `BookingFormComponent`, `SessionTypeSelectionComponent`
  Gap: public `booking-site` app is empty-routed and still placeholder

- `F26 Contracts & E-Signatures`: `Medium`
  Evidence: `ContractsController`, contract tests, `ContractListPageComponent`
  Gap: requirement breadth is wider than the currently surfaced UI and implementation evidence

- `F27 Invoicing`: `Medium`
  Evidence: `InvoicesController`, invoice tests, `InvoiceListPageComponent`
  Gap: installment/deposit/reminder/template breadth is only partially visible in surfaced UI

- `F28 Quotes & Proposals`: `Medium`
  Evidence: `QuotesController`, quote tests, quote DTOs/entities
  Gap: no obvious quote UI in routed Angular apps

- `F29 Questionnaires`: `Medium`
  Evidence: `QuestionnairesController`, questionnaire tests, questionnaire DTOs/entities
  Gap: no obvious questionnaire builder UI in routed Angular apps

- `F30 Payment Processing`: `Medium`
  Evidence: `PaymentsController`, finance/payment tests, Stripe/PayPal abstractions, offline/gift card flows
  Gap: no concrete tap-to-pay command/controller flow under `src/`; payout breadth is not fully evidenced

- `F31 Financial Reporting`: `High`
  Evidence: finance tests, `GetRevenueDashboardQuery`, export/transactions endpoints, `RevenueDashboardPageComponent`

- `F32 Business Financing`: `Low`
  Evidence: `FinancingApplication` entity, `ApplyForFinancing`, `GetFinancingApplication`, acceptance test coverage for apply/get
  Gap: missing accept/decline/history/repayment lifecycle implementation

### Email / Communication

- `F33 Email Inbox & Communication`: `Medium`
  Evidence: `EmailController`, email tests, `InboxPageComponent`
  Gap: inbound webhook/provider processing and full attachment workflow are not clearly complete

- `F34 Email Templates & Automation`: `Medium`
  Evidence: email tests, template DTOs, reminder-related requirement references across domains
  Gap: full automation/template management surface is broader than current concrete repo evidence

### Mobile (Non-Native Scope Only)

- `F35 Studio Manager Mobile App`: `Excluded`

- `F36 Mobile Gallery PWA`: `Low`
  Evidence: `mobile-gallery` Angular app folder and README
  Gap: empty route table, placeholder app shell, no concrete offline/PWA implementation evidence in the app itself

### Branding / Domains / Notifications / Integrations

- `F37 Branding & Identity`: `High`
  Evidence: `BrandingController`, branding tests, branding DTOs/entities/configuration

- `F38 Watermarking`: `High`
  Evidence: watermark tests, watermark entities/configuration, branding surface

- `F39 Custom Domains`: `High`
  Evidence: branding/custom domain tests, DTOs/entities/configuration

- `F40 Notification System`: `Medium`
  Evidence: `NotificationsController`, notification tests, notification preference flows, notification panel/settings UI
  Gap: no concrete device-token entity/controller/push registration flow under `src/`

- `F41 Integrations Hub`: `Medium`
  Evidence: `IntegrationsController`, integration tests, interfaces for Google Calendar/Instagram/PayPal/webhooks/labs
  Gap: several integrations appear configuration-level only; some concrete adapter implementations are absent

- `F42 Lightroom Plugin`: `Low`
  Evidence: `ILightroomSyncService`, test stubs, design docs
  Gap: no `LightroomController`, no implementation/service, no plugin assets/code in the repository

- `F43 Webhooks & API`: `Medium`
  Evidence: `WebhooksController`, `ApiKeysController`, webhook/api key entities, integration tests, custom code injection commands
  Gap: broader template-management REST API described in requirements/design is not present

- `F44 Design System & UI Components`: `Medium`
  Evidence: shared `components` library, many domain components, UI design docs/assets
  Gap: cross-app composition is inconsistent and several top-level apps remain placeholders

- `F45 Data Security & Content Protection`: `Medium`
  Evidence: auth/security middleware, privacy/password/watermark tests, content-protection related domain coverage
  Gap: some requirement breadth (e.g. full streaming/casting path) is not strongly evidenced in concrete implementation

### Canadian / Toronto-Specific Extensions

- `F46 Interac e-Transfer Integration`: `High`
  Evidence: `InteracController`, interac tests, DTOs/entities/application features

- `F47 HST Tax Configuration & Calculation`: `High`
  Evidence: `TaxProfileController`, `TaxRatesController`, tax tests, tax entities/configuration

- `F48 Revenue Threshold & Input Tax Credits`: `Medium`
  Evidence: tax/finance features and tests, tax profile/revenue support
  Gap: full alerting/widget/ITC reporting breadth is stronger in requirements than in surfaced UI evidence

- `F49 Cultural Specialization Tags`: `High`
  Evidence: `ProfileController`, discovery tests, profile/service-area models

- `F50 Photographer Directory Search`: `High`
  Evidence: `DirectoryController`, discovery tests, directory/profile DTOs

- `F51 Skin Tone Preset Library`: `High`
  Evidence: `PresetsController`, presets tests, preset entities/DTOs/features

- `F52 Events Calendar & Booking Integration`: `High`
  Evidence: `EventsController`, events tests, events DTOs/entities/features

- `F53 Community Event Submissions`: `High`
  Evidence: `EventsController`, events tests, submission/moderation design and application coverage

## Overall Assessment

At repository level, this is a strong backend-first implementation with meaningful test coverage and a reasonably rich Angular domain-library layer. It is not yet complete against the full requirements set.

The most important gaps are:

1. Missing composition of several top-level Angular apps
2. Partial or absent implementation of advanced integrations
3. Incomplete financing and push-notification flows
4. Build reproducibility issues caused by missing SDK pinning

If judged as a requirements-complete product repository today, the codebase is best described as:

- `Backend/API completeness`: strong
- `Frontend app completeness`: partial
- `Integration completeness`: partial
- `Overall requirements completeness`: medium

## Recommended Next Steps

1. Add `global.json` and restore a clean root build/test path.
2. Compose the routed Angular apps for `booking-site`, `online-store`, `website-builder`, and `mobile-gallery`.
3. Close the low-evidence gaps first: Lightroom plugin, concrete print-lab adapters, device-token/push flow, financing lifecycle.
4. Re-run the audit after build verification and after wiring the top-level apps so the status can move from repository evidence to runnable product evidence.
