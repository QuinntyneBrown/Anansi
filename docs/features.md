# Anansi Platform - Feature List

> Features derived from L2 requirements. Each feature groups related L2 requirements into
> an implementable unit with its own software design document in `docs/software-design-documents/`.

---

## F01 - Authentication & Account Management

User registration, login, password recovery, session management, account settings, and onboarding flow.

**L2 Requirements:** SEC-11.2.1, SEC-11.2.2, SEC-11.2.3

---

## F02 - Subscription & Plan Management

Tiered pricing (Free/Basic/Plus/Pro/Ultimate), feature gating per plan, upgrade/downgrade with proration, suite bundles, and billing management.

**L2 Requirements:** PLN-10.1.1, PLN-10.1.2, PLN-10.1.3, PLN-10.2.1, PLN-10.2.2, PLN-10.2.3, PLN-10.2.4

---

## F03 - Media Upload & Processing

Browser drag-and-drop upload, bulk folder upload, video processing (up to 4K), RAW file support, file validation, thumbnail generation, and CDN delivery with progressive loading.

**L2 Requirements:** GAL-1.1.1, GAL-1.1.2, GAL-1.1.4, GAL-1.1.5, GAL-1.1.6, UX-11.3.3

---

## F04 - Gallery Organization

Collections and sets, bulk gallery creation, starring/bookmarking, collection presets, and sorting/arrangement controls.

**L2 Requirements:** GAL-1.2.1, GAL-1.2.2, GAL-1.2.3, GAL-1.2.4

---

## F05 - Gallery Design & Customization

Cover styles (7+), video/GIF covers, light/dark themes, typography (6+ fonts), color palettes (9+), grid layouts (vertical/horizontal), set titles/descriptions, slideshow mode, and per-collection language selection (8+ languages).

**L2 Requirements:** GAL-1.3.1, GAL-1.3.2, GAL-1.3.3, GAL-1.3.4, GAL-1.3.5, GAL-1.3.6, GAL-1.3.7, GAL-1.3.8, GAL-1.8.1

---

## F06 - Photo Delivery & Downloads

Multi-resolution downloads (web/high-res/original), download PIN, per-collection download limits, async ZIP generation with email notification, and download activity tracking with CSV export.

**L2 Requirements:** GAL-1.4.1, GAL-1.4.2, GAL-1.4.3, GAL-1.4.4, GAL-1.4.5

---

## F07 - Proofing & Favorites

Client-created favorite lists, comments on favorites, photographer-preset favorite categories, configurable favorite limits, favorite list sharing/downloading/digital delivery, Lightroom-compatible export, and favorite activity dashboard.

**L2 Requirements:** GAL-1.5.1, GAL-1.5.2, GAL-1.5.3, GAL-1.5.4, GAL-1.5.5, GAL-1.5.6

---

## F08 - Gallery Privacy & Access Control

Collection password protection, client exclusive access with expanded visibility, homepage password, email registration gate, private photos, collection expiration with auto-hide, and automated expiry reminder emails.

**L2 Requirements:** GAL-1.6.1, GAL-1.6.2, GAL-1.6.3, GAL-1.6.4, GAL-1.6.5, GAL-1.6.6, GAL-1.6.7

---

## F09 - Gallery Sharing & Social

Email invitations with branded templates, social media sharing (Facebook, Instagram, Pinterest, WhatsApp, Messenger, Threads), Quick Share links for selected photos, QR code generation, and gallery embedding via iframe/JS snippet.

**L2 Requirements:** GAL-1.7.1, GAL-1.7.2, GAL-1.7.3, GAL-1.7.4, GAL-1.7.5

---

## F10 - Gallery Analytics & Activity

Per-collection activities tab (downloads, favorites, private photos, email registrations), activity filtering and CSV export, and Google Analytics (GA4) integration for gallery visitor tracking.

**L2 Requirements:** GAL-1.9.1, GAL-1.9.2

---

## F11 - Product Catalog Management

Print products (multiple types/sizes), photo albums and books with customization, greeting card designer with templates, digital downloads, product packages (bundles), and self-fulfilled custom products.

**L2 Requirements:** STR-2.1.1, STR-2.1.2, STR-2.1.3, STR-2.1.4, STR-2.1.5, STR-2.1.6

---

## F12 - Print Lab Integration & Fulfillment

Automatic order routing to print labs (WHCC, ProDPI, Miller's, Loxley Colour), white-label shipping, self-fulfillment workflow with tracking, lab pricing display, and lab color correction options.

**L2 Requirements:** STR-2.2.1, STR-2.2.2, STR-2.2.3, INT-8.2.1, INT-8.2.2

---

## F13 - Store Pricing & Price Sheets

Custom markup/pricing per product variation, bulk markup tool, multiple price sheets assignable to collections, download-only price sheets, and commission structure (15% free / 0% paid).

**L2 Requirements:** STR-2.3.1, STR-2.3.2, STR-2.3.3, STR-2.3.4

---

## F14 - Promotions & Gift Cards

Coupon codes (percentage, fixed, free giveaway) with expiration and usage limits, promotional coupon banners in galleries, gift cards with custom amounts and optional expiry, branded email delivery, and balance tracking/redemption at checkout.

**L2 Requirements:** STR-2.4.1, STR-2.4.2, STR-2.4.3, GFT-4.9.1, GFT-4.9.2

---

## F15 - Store Checkout & Orders

Shopping cart, multi-step checkout (shipping, payment, confirmation), payment method acceptance (cards, wallets, PayPal), tax calculation, shipping cost configuration, order management with status tracking, and order notifications.

**L2 Requirements:** STR-2.5.1, STR-2.5.2, STR-2.5.3, STR-2.5.4

---

## F16 - Website Builder Core

Template library (8+ templates, categorized), flex editor with drag-and-drop, 100+ layout blocks, element toolbox (images, text, buttons, shapes, sliders, carousels, grids, accordions), layer management, responsive preview (desktop/tablet/mobile), per-breakpoint customization, and up to 10 draft sites.

**L2 Requirements:** WEB-3.1.1, WEB-3.1.2, WEB-3.1.3

---

## F17 - Website Pages & Content

Page management (add, remove, reorder, URL slugs), client gallery blocks embedded in website, Instagram feed integration, custom HTML/JS embed code blocks, and landing page templates.

**L2 Requirements:** WEB-3.2.1, WEB-3.2.2, WEB-3.2.3, WEB-3.2.4, WEB-3.2.5

---

## F18 - Blog Platform

Blog post creation with rich text, images, categories, custom URLs, and scheduled publication. Multiple blog layouts (grid, stacked, alternated), pagination with "Load More", category filtering, post duplication, and blog migration from other platforms.

**L2 Requirements:** WEB-3.3.1, WEB-3.3.2, WEB-3.3.3

---

## F19 - Website Design & Typography

1,000+ font library with custom font upload, font configuration per element or site-wide, 40+ color palettes with 200+ combinations, custom hex colors, and site-wide scroll animations (fade in, scale up, slide in, unfold).

**L2 Requirements:** WEB-3.4.1, WEB-3.4.2, WEB-3.4.3

---

## F20 - SEO & Discovery

SEO manager with page titles, descriptions, and audit. AI-powered alt text generation (individual and bulk), AI page description generation, URL redirects (301/302), custom page URLs, and per-page Open Graph image configuration.

**L2 Requirements:** WEB-3.5.1, WEB-3.5.2, WEB-3.5.3, WEB-3.5.4, WEB-3.5.5

---

## F21 - Website Hosting & Domains

Free unlimited hosting with SSL, platform subdomain, custom domain support (apex and subdomains) with DNS instructions, per-page and site-wide password protection, and right-click image protection.

**L2 Requirements:** WEB-3.6.1, WEB-3.6.2, WEB-3.6.3, WEB-3.6.4

---

## F22 - Website Analytics

Built-in analytics (visitors, geography, session duration, top pages) with date filtering, Google Analytics GA4 integration (configuration-only), and Facebook Pixel integration with standard PageView events.

**L2 Requirements:** WEB-3.7.1, WEB-3.7.2, WEB-3.7.3

---

## F23 - Contacts & CRM

Contact types (Client, Lead, Other), centralized contact profiles with linked documents/emails/sessions/galleries/payments, automatic lead-to-client conversion, CSV contact import with duplicate detection, and lead capture forms with custom fields (embeddable and shareable).

**L2 Requirements:** CRM-4.1.1, CRM-4.1.2, CRM-4.1.3, CRM-4.1.4, CRM-4.1.5

---

## F24 - Project Pipeline Board

Visual Kanban board with customizable stages (add, remove, rename, reorder), drag-and-drop project cards, project detail view with linked documents/sessions/payments, and auto-created project cards on form submissions.

**L2 Requirements:** CRM-4.2.1, CRM-4.2.2, CRM-4.2.3

---

## F25 - Booking & Scheduling

Online booking site (branded, customizable URL, embeddable), full session types with availability windows, mini session types with date slots and gap/break settings, client booking flow (date/time selection, contact info, intake documents, payment), Google Calendar two-way sync, buffer time, manual confirmation mode, session visibility (public/hidden), video call integration (Zoom/Google Meet), and booking coupons.

**L2 Requirements:** BKG-4.3.1, BKG-4.3.2, BKG-4.3.3, BKG-4.3.4, BKG-4.3.5, BKG-4.3.6, BKG-4.3.7, BKG-4.3.8, BKG-4.3.9, BKG-4.3.10, BKG-4.3.11, BKG-4.3.12

---

## F26 - Contracts & E-Signatures

Rich content contract editor, client-fillable fields, auto-population variables (client data), digital e-signatures on any device, multi-signer support, photographer pre-signing, contract templates with samples, document expiry with auto-cancel, and automatic reminder emails.

**L2 Requirements:** CON-4.4.1, CON-4.4.2, CON-4.4.3, CON-4.4.4, CON-4.4.5, CON-4.4.6, CON-4.4.7

---

## F27 - Invoicing

Invoice builder with line items, payment schedules with multiple installments, deposit/retainer collection, automatic payment reminders (before, on, after due date), tax support, gratuity/tip option, invoice templates, and auto-generated invoices from booking and quote acceptance.

**L2 Requirements:** INV-4.5.1, INV-4.5.2, INV-4.5.3, INV-4.5.4, INV-4.5.5, INV-4.5.6, INV-4.5.7

---

## F28 - Quotes & Proposals

Quote creation with itemized services/products, client acceptance flow with auto-generated invoice draft, and reusable quote templates.

**L2 Requirements:** QOT-4.6.1, QOT-4.6.2, QOT-4.6.3

---

## F29 - Questionnaires

Drag-and-drop question builder (short text, long text, multiple choice, checkboxes, date, email), required field toggle, questionnaire templates with samples, standalone sending and booking intake, public sharing for multiple submissions, document expiry, and automatic reminders.

**L2 Requirements:** QST-4.7.1, QST-4.7.2, QST-4.7.3, QST-4.7.4

---

## F30 - Payment Processing

Stripe integration (cards, digital wallets, BNPL via Klarna/Affirm, bank transfers), PayPal integration, Tap to Pay (NFC with QR fallback), offline payment recording, standard and instant payouts, and transaction fee management.

**L2 Requirements:** PAY-4.8.1, PAY-4.8.2, PAY-4.8.3, PAY-4.8.4, PAY-4.8.5, PAY-4.8.6, PAY-4.8.7, PAY-4.8.8

---

## F31 - Financial Reporting

Revenue dashboard with graphs/charts (total, net, by payment method, tips, taxes), date range filtering, transaction detail view with search, CSV data export for tax/accounting, and paid/pending/overdue invoice tracking.

**L2 Requirements:** RPT-4.10.1, RPT-4.10.2, RPT-4.10.3, RPT-4.10.4

---

## F32 - Business Financing

Financing eligibility and application (no credit check), flat fee disclosure, automatic repayment via percentage of incoming payments, and direct bank deposit of funds.

**L2 Requirements:** CAP-4.11.1, CAP-4.11.2

---

## F33 - Email Inbox & Communication

Unified inbox with threaded conversations per client, new message composition, file attachments (30+ types, 25MB), instant in-app and email notifications for client responses.

**L2 Requirements:** EML-5.1.1, EML-5.1.2, EML-5.1.3

---

## F34 - Email Templates & Automation

Gallery email templates with personalization variables, studio manager email templates for all workflow stages, branded gallery invite emails (logo, header, colors), automated booking confirmation and session reminders, contract/invoice/questionnaire reminder emails, gallery expiry reminders (configurable recipients and timing), and payment confirmation emails.

**L2 Requirements:** EML-5.2.1, EML-5.2.2, EML-5.2.3, EML-5.3.1, EML-5.3.2, EML-5.3.3, EML-5.3.4

---

## F35 - Studio Manager Mobile App

Native iOS and Android app for booking management, calendar, invoice creation/sending, Tap to Pay for in-person payments, client communication (inbox), document management (contracts/questionnaires), and push notifications for all business events.

**L2 Requirements:** MOB-6.1.1, MOB-6.1.2, MOB-6.1.3, MOB-6.1.4, MOB-6.1.5, MOB-6.1.6, MOB-6.1.7

---

## F36 - Mobile Gallery PWA

Progressive Web App for client photo delivery: up to 200 curated images, custom app icon from client's photo, add-to-home-screen prompt, offline support, photographer branding and contact info, social sharing, call-to-action buttons, and plan-based limits.

**L2 Requirements:** MOB-6.2.1, MOB-6.2.2, MOB-6.2.3, MOB-6.2.4

---

## F37 - Branding & Identity

Profile icon, logo upload across all touchpoints (galleries, website, documents, emails), auto-generated white cover logo, custom favicon, platform branding removal on paid plans, document branding (header images, brand colors), and consistent font theme across booking site, contracts, invoices, questionnaires, and emails.

**L2 Requirements:** BRD-7.1.1, BRD-7.1.2, BRD-7.1.3, BRD-7.1.4, BRD-7.1.5, BRD-7.4.1, BRD-7.4.2

---

## F38 - Watermarking

Text watermarks (customizable content, font, opacity, scale, position), image/logo watermarks (transparent PNG), per-gallery toggle, display-only overlay (not burned into downloads), and watermark persistence on social media shares.

**L2 Requirements:** BRD-7.2.1, BRD-7.2.2, BRD-7.2.3

---

## F39 - Custom Domains

Gallery custom domain (subdomain), website custom domain (apex and subdomain), auto-provisioned SSL, DNS configuration instructions, and free platform subdomain.

**L2 Requirements:** BRD-7.3.1, BRD-7.3.2

---

## F40 - Notification System

Real-time in-app notification center (bell icon with unread count, filterable by category), notification events for all business activities (downloads, orders, favorites, signatures, payments, bookings, messages, form submissions), configurable email notification preferences (per event type, digest vs. real-time), and mobile push notifications (within 30 seconds).

**L2 Requirements:** NTF-9.1.1, NTF-9.1.2, NTF-9.2.1, NTF-9.3.1

---

## F41 - Integrations Hub

Google Calendar two-way sync, Zoom and Google Meet video call auto-linking, Google Analytics GA4 tracking, Facebook Pixel tracking, Instagram Feed live display, Stripe payment processing connection, and PayPal payment acceptance.

**L2 Requirements:** INT-8.1.2, INT-8.1.3, INT-8.1.4, INT-8.1.5, INT-8.1.6, INT-8.1.7, INT-8.1.8

---

## F42 - Lightroom Plugin

Publish and re-publish collections from Lightroom Classic, sync collection/set structure, view client favorite lists within Lightroom, and plugin installation via Plugin Manager.

**L2 Requirements:** GAL-1.1.3, INT-8.1.1

---

## F43 - Webhooks & API

Outgoing webhooks for key events (booking, payment, contract, form submission), configurable webhook URLs, JSON payloads, custom HTML/JS code injection in website header/footer, and REST API for template management with API key authentication.

**L2 Requirements:** INT-8.3.1, INT-8.3.2, INT-8.3.3

---

## F44 - Design System & UI Components

Design tokens (colors, typography, spacing, corner radius), shared components (buttons, form inputs, cards, navigation, tables, badges, modals, toasts, empty states, loading states), responsive layouts (desktop 1440px, tablet 768px, mobile 402px), and system states (loading skeletons, error states, success confirmations).

**L2 Requirements:** DSN-12.1.1, DSN-12.1.2, DSN-12.1.3, DSN-12.1.4, DSN-12.2.1, DSN-12.2.2, DSN-12.2.3, DSN-12.2.4, DSN-12.2.5, DSN-12.2.6, DSN-12.2.7, DSN-12.2.8, DSN-12.2.9, DSN-12.2.10, DSN-12.2.11, DSN-12.2.12

---

## F45 - Data Security & Content Protection

TLS 1.2+ encryption on all connections, PCI DSS compliance via Stripe (no raw card storage), bcrypt password hashing, server-side content protection (gallery passwords, download PIN validation, watermark application), right-click protection, responsive design for all client-facing pages, CDN delivery with adaptive bitrate video streaming, and Chromecast/AirPlay casting support.

**L2 Requirements:** SEC-11.1.1, SEC-11.1.2, UX-11.3.1, UX-11.3.2, UX-11.3.3, UX-11.3.4

---

## F46 - Interac e-Transfer Integration

Interac e-Transfer as a Canadian payment method. Photographers generate payment requests from invoices with unique reference codes, confirm receipt to reconcile payments, and track request status (Pending/Completed/Expired). Clients see Interac as a checkout option with transfer instructions and reference codes. Stale requests auto-expire.

**L2 Requirements:** INT-20.1.1, INT-20.1.2, INT-20.1.3, INT-20.1.4, INT-20.2.1, INT-20.2.2

---

## F47 - HST Tax Configuration & Calculation

Ontario HST (13%) support for Canadian photographers. Tax profile configuration with HST rate, registration number, and registration status (NotRegistered/Voluntary/Mandatory). Automatic HST calculation on invoice line items with tax-exempt item support. HST displayed as a separate line item with registration number. Carry-through from quotes to generated invoices.

**L2 Requirements:** TAX-21.1.1, TAX-21.1.2, TAX-21.2.1

---

## F48 - Revenue Threshold & Input Tax Credits

Rolling four-quarter revenue tracking against the $30,000 CRA mandatory HST registration threshold. Dashboard widget showing progress percentage with alert notifications at 75% and 90% (once per quarter). Quarterly revenue breakdown. Business expense tracking with HST paid (categorized: Equipment, Software, Studio, Travel, Supplies, Marketing, Professional Services). Net HST calculation (collected minus ITCs) and ITC summary export for CRA filing.

**L2 Requirements:** TAX-21.3.1, TAX-21.3.2, TAX-21.4.1, TAX-21.4.2

---

## F49 - Cultural Specialization Tags

Photographers tag profiles with cultural expertise areas from a predefined library (Caribbean Wedding, Nigerian Traditional, Ghanaian Engagement, etc.) plus custom tags (max 20 per photographer, 50 chars each). Tags displayed on public profile and directory. Available tags list includes predefined tags plus custom tags used by 3+ photographers. Primary neighborhood selection from predefined Toronto neighborhoods and service area radius (5-100 km) with lat/lng geocoding.

**L2 Requirements:** TAG-22.1.1, TAG-22.1.2, TAG-22.2.1

---

## F50 - Photographer Directory Search

Public-facing directory search API. Search photographers by cultural specialization tags (relevance-ranked by match count), by neighborhood/distance (Haversine formula, filtered by service radius), or combined tag + location search. Paginated results with profile summary cards including name, business name, profile image, tags, neighborhood, and relevance score.

**L2 Requirements:** TAG-22.3.1, TAG-22.3.2, TAG-22.3.3

---

## F51 - Skin Tone Preset Library

Curated photo editing presets for melanin-rich skin tones. Presets store Lightroom-compatible adjustment values (Temperature, Tint, Exposure, Contrast, HSL arrays for 8 channels, split toning). Organized by skin tone range (Light/Medium/Deep/VeryDeep) and shooting context (StudioPortrait/OutdoorNatural/EventReception/GoldenHour/LowLight/Flash). Browse, search, favorite presets. Full CRUD for contributors with public/private visibility. Platform-seeded presets (8+ curated defaults, non-editable). Soft-delete with "unavailable" indication on others' favorites.

**L2 Requirements:** PRE-23.1.1, PRE-23.2.1, PRE-23.2.2, PRE-23.2.3, PRE-23.3.1, PRE-23.3.2, PRE-23.3.3

---

## F52 - Events Calendar & Booking Integration

Pre-populated calendar of Toronto Black cultural events and festivals (Caribana, Afrofest, KUUMBA, etc.) with seed data. List events by date range, category, and neighborhood with recurring event instance generation. Sync events to photographer's booking calendar as availability blocks (Available/Blocked/Tentative). Create event-linked session types with availability scoped to event dates. Dashboard upcoming events widget.

**L2 Requirements:** EVT-24.1.1, EVT-24.2.1, EVT-24.2.2, EVT-24.2.3

---

## F53 - Community Event Submissions

Photographers submit new community events for calendar inclusion. Moderation workflow (Pending/Approved/Rejected) with self-moderation for MVP (own events auto-approve). Recurring event support (Annual/Monthly/Weekly). Edit and cancel submitted events — edits to approved events reset to Pending for re-review. Soft-delete on cancellation. Rejection notifications with reason.
