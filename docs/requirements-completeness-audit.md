# Requirements Completeness Audit

Date: 2026-03-11

## Scope

This audit compares the implemented repository contents against:

- `docs/specs/L1.md`
- `docs/specs/L2.md`
- `docs/features.md`

This refresh specifically re-checks the repository after new Angular UI components and app shells were added.

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
- `Medium`: substantial code exists, but important acceptance criteria, workflow depth, or user-facing composition are still missing
- `Low`: mostly interfaces, stubs, or design/docs; weak end-to-end implementation evidence
- `Excluded`: intentionally out of scope

This is a repository audit, not a product demo. A feature can remain below `High` even when routed pages now exist if the deeper workflow, integration layer, or requirement breadth is still incomplete.

## Executive Summary

The repository remains broad and requirement-aware, with the strongest completeness in the .NET backend and acceptance-test surface: authentication, plans, CRM, contacts/projects/documents, payments foundations, tax, directory/discovery, presets, and events are well represented.

The biggest change since the prior audit is frontend composition. The previous finding that four of the six top-level Angular apps were empty placeholder shells is no longer accurate. All six top-level Angular apps now have non-empty route tables, and `booking-site`, `online-store`, `website-builder`, and `mobile-gallery` now render real shell components plus routed domain pages. Each of those apps also has route unit tests and Playwright shell/navigation coverage.

That materially improves evidence for `F15`, `F16` to `F22`, `F25`, `F36`, and `F44`. The remaining frontend gap is narrower: the apps are now assembled, but several still expose only a subset of the workflows described in the requirements. Website Builder currently routes only template/page/SEO surfaces, store routing is shopper-focused rather than full management coverage, gallery-admin routes are still absent from `studio-manager`, and several flows are covered mainly by shell-level or smoke-level tests rather than full end-to-end behavior.

Several advanced requirement areas still stop at interface/stub level rather than concrete implementation: Lightroom plugin, concrete print-lab adapters, push/device registration, template-management API breadth, and the full business financing lifecycle.

## Evidence Snapshot

- .NET solution projects: 5
- API controllers: 43
- Acceptance test files: 44
- Angular workspace project folders: 9
- Angular domain libraries: 17
- Top-level Angular applications: 6 of 6 now have non-empty route tables
- Shared component directories under `projects/components/src/lib`: 20

Build/test caveat:

- This refresh focused on repository completeness and UI composition; it did not re-run the full root build/test matrix.
- The repo still has no tracked `global.json`, so SDK selection remains machine-dependent.
- The prior audit observed root build instability under floating SDK selection and file-access issues; that reproducibility concern remains open until a clean root build/test is re-verified.

## Major Findings

### 1. Top-level web app composition has materially improved

The previous “empty shell” finding is closed. `booking-site`, `online-store`, `website-builder`, and `mobile-gallery` now have:

- non-empty route tables
- composed app shells (`booking-top-bar`, `store-top-bar`, `builder-sidebar`, `gallery-mobile-bar`)
- lazy-loaded domain components behind real routes
- route unit tests
- Playwright shell/navigation coverage

This materially improves repository evidence for public booking, storefront, website builder, and mobile-gallery delivery.

### 2. Frontend gaps are now about workflow breadth, not missing shells

The repo now exposes more complete app entry points, but several requirement areas remain only partially surfaced:

- `website-builder` routes only `templates`, `pages`, and `seo`; blog, richer editor tooling, hosting/domain management, and analytics are not surfaced as top-level app routes
- `online-store` routes shopper flows (`shop`, `cart`, `checkout`), but store-management/admin surfaces are not composed into a top-level app
- `booking-site` routes session selection and booking form pages, but broader booking confirmation/payment/intake behavior is only lightly evidenced at app level
- `studio-manager` still does not route photographer-facing gallery organization/admin, quotes, or questionnaires

### 3. Integration-heavy and financing features remain uneven

The repository models many integrations, but several remain partial:

- `F12` print lab integration exposes abstractions and handlers but no concrete lab adapter/service implementation under `src/`
- `F40` push notifications expose `IPushNotificationService`, but there is no concrete device-token registration/controller/service flow under `src/`
- `F42` Lightroom plugin still stops at `ILightroomSyncService` and test/docs references; there is no controller, command/query surface, or plugin code
- `F43` webhooks/API keys/custom code exist partially, but the broader template-management API described in requirements is not present
- `F32` business financing includes basic apply/get flows, but not accept/decline/history/repayment lifecycle implementation

### 4. Reproducibility is still weaker than the docs imply

`README.md` describes straightforward `dotnet build` / `dotnet test` usage, but repository verification remains weaker than it should be because SDK pinning is still absent and a clean root build/test has not yet been re-established.

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
  Evidence: `tests/Anansi.Tests.Acceptance/Galleries/DownloadTests.cs`, gallery/download models, delivery activity coverage, client/mobile gallery routed pages
  Gap: full client/store/download UX breadth is not fully surfaced in routed apps

- `F07 Proofing & Favorites`: `Medium`
  Evidence: `FavoritesController`, favorites tests, `FavoritesPageComponent`, routed favorites pages in gallery apps
  Gap: photographer favorites dashboard/admin composition is not clearly routed

- `F08 Gallery Privacy & Access Control`: `Medium`
  Evidence: privacy tests, password entry component, privacy entities/configuration, routed password page in `mobile-gallery`
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
  Gap: shopper-facing `online-store` is now routed, but store-management/admin surfaces are not composed into a top-level app

- `F12 Print Lab Integration & Fulfillment`: `Low`
  Evidence: `LabsController`, `ILabIntegrationService`, `SubmitLabOrderCommandHandler`, fulfillment tests
  Gap: no concrete `LabIntegrationService` or lab-specific adapters under `src/`

- `F13 Store Pricing & Price Sheets`: `Medium`
  Evidence: `PriceSheetsController`, pricing entities/configuration, price sheet tests
  Gap: full storefront/admin composition remains incomplete

- `F14 Promotions & Gift Cards`: `Medium`
  Evidence: `CouponsController`, `GiftCardsController`, acceptance tests, payment/store DTOs
  Gap: promotion/gift-card UX is not clearly surfaced in the routed top-level apps

- `F15 Store Checkout & Orders`: `Medium`
  Evidence: `OrdersController`, payment/order tests, `StoreBrowsePageComponent`, `CartPageComponent`, `CheckoutPageComponent`, routed `online-store` shell, route specs, Playwright e2e
  Gap: the top-level shopper app is now composed, but deeper order-confirmation/payment breadth is still evidenced mostly by smoke-level UI coverage

### Website Builder

- `F16 Website Builder Core`: `Medium`
  Evidence: `WebsitesController`, `WebsiteTemplatesController`, website application features, `@domain/website-builder` library, routed `website-builder` shell
  Gap: the top-level app now exists, but it currently exposes only template/page/SEO surfaces rather than the broader builder toolset in the requirements

- `F17 Website Pages & Content`: `Medium`
  Evidence: `WebsitePagesController`, `PageElementsController`, page/template tests, `PageManagerComponent`, routed `pages` app route
  Gap: full editor composition is still limited

- `F18 Blog Platform`: `Medium`
  Evidence: `BlogController`, website blog tests, blog DTOs/entities
  Gap: no composed blog management UI in the top-level website builder app

- `F19 Website Design & Typography`: `Medium`
  Evidence: `WebsiteTypographyController`, typography features/tests, template/domain website-builder components
  Gap: end-to-end design tooling UI remains incomplete beyond the current template/page/SEO surfaces

- `F20 SEO & Discovery`: `Medium`
  Evidence: `WebsiteSeoController`, SEO tests, `SeoManagerComponent`, routed `seo` app route
  Gap: SEO surface is now routed, but wider discovery/optimization breadth is not fully evidenced end to end

- `F21 Website Hosting & Domains`: `Medium`
  Evidence: websites/custom domain/password/branding tests and models
  Gap: routed/published website management UX is incomplete at app level

- `F22 Website Analytics`: `Medium`
  Evidence: analytics DTOs/entities, website tests, integration config endpoints
  Gap: analytics UI is not surfaced in the current website-builder routes

### Studio Manager / CRM / Booking / Documents / Finance

- `F23 Contacts & CRM`: `High`
  Evidence: `ContactsController`, CRM tests, `ContactListPageComponent`, `ContactDetailPageComponent`

- `F24 Project Pipeline Board`: `High`
  Evidence: `ProjectsController`, project tests, `ProjectBoardPageComponent`

- `F25 Booking & Scheduling`: `Medium`
  Evidence: `BookingsController`, booking tests, `BookingManagementPageComponent`, `BookingFormComponent`, `SessionTypeSelectionComponent`, routed `booking-site` shell, route specs, Playwright e2e
  Gap: the public booking app is now composed, but deeper payment/intake/confirmation behavior is only lightly evidenced at app level

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

- `F36 Mobile Gallery PWA`: `Medium`
  Evidence: routed `mobile-gallery` shell, gallery/favorites/password routes, route specs, Playwright mobile navigation tests, manifest link, Apple web-app meta tags, `manifest.webmanifest`
  Gap: no concrete service-worker/offline-sync/offline-cache implementation evidence was found in the app

### Branding / Domains / Notifications / Integrations

- `F37 Branding & Identity`: `High`
  Evidence: `BrandingController`, branding tests, branding DTOs/entities/configuration

- `F38 Watermarking`: `High`
  Evidence: watermark tests, watermark entities/configuration, branding surface

- `F39 Custom Domains`: `High`
  Evidence: branding/custom domain tests, DTOs/entities/configuration

- `F40 Notification System`: `Medium`
  Evidence: `NotificationsController`, notification tests, notification preference flows, notification panel/settings UI, `IPushNotificationService`
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
  Evidence: shared `components` library with 20 component directories, many domain components, composed shells across all six top-level Angular apps, UI design docs/assets
  Gap: cross-app composition is much improved, but several features still expose only narrow shell-level slices of the intended workflows

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

At repository level, this remains a strong backend-first implementation with meaningful test coverage and a richer Angular application layer than in the prior pass. It is still not complete against the full requirements set, but the frontend evidence has improved materially.

The most important gaps are:

1. Expanding the new top-level Angular shells into fuller requirement workflows
2. Completing advanced integrations and the financing lifecycle
3. Surfacing missing photographer/admin routes such as gallery organization, quotes, and questionnaires
4. Restoring reproducible root build/test verification with SDK pinning

If judged as a requirements-complete product repository today, the codebase is best described as:

- `Backend/API completeness`: strong
- `Frontend shell completeness`: materially improved
- `Frontend workflow completeness`: partial
- `Integration completeness`: partial
- `Overall requirements completeness`: medium

## Recommended Next Steps

1. Add a tracked `global.json` and re-establish a clean root build/test path.
2. Expand the newly composed apps from shell routing into full workflows, especially Website Builder editor/blog/analytics, store order completion/admin, booking payment/confirmation, and gallery-admin tooling.
3. Surface missing admin workflows in routed apps, especially gallery organization, quotes, and questionnaires.
4. Close the low-evidence gaps first: Lightroom plugin, concrete print-lab adapters, device-token/push flow, template-management API breadth, and financing lifecycle.
