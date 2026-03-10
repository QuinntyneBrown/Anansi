# F25 - Booking & Scheduling

## Overview

This feature delivers the complete booking and scheduling system for photographers on the Anansi platform. At its core is the online booking site -- a branded, public-facing page displaying the photographer's cover image, profile photo, welcome message, business info, and all published session types. The booking site URL is customizable and the entire page is embeddable on external websites. Clients browse available session types, select a date and time, enter contact information, complete any required intake documents (contracts and questionnaires), and pay the session fee -- all in a single uninterrupted flow.

The system supports two session type variants. Full session types define a name, description, duration, price, per-day availability windows, and location, with plan-based limits (Free = 1, Plus = 3, Pro = unlimited). Mini session types are date-specific with configurable start times per date, spots per time slot, gap/break between slots, multi-date setup, schedule duplication, and a "Nearly sold out" indicator. Both variants support buffer time (pre/post for full sessions, gap between slots for mini sessions) that blocks availability across all session types. Sessions can require manual confirmation (Pending until photographer accepts or declines) and can be set to Public or Hidden (link-only) visibility with configurable display order.

Integration capabilities include two-way Google Calendar sync (within 5 minutes, with busy-blocks-availability and client-as-attendee), video call integration with Zoom and Google Meet (auto-generated unique links included in confirmation emails), intake documents from templates (contracts and questionnaires on upgraded plans), payment processing (full or deposit with auto-invoice for balance), and booking coupons (fixed or percentage discount with expiration and usage limits). A booking confirmation email is sent automatically upon completion.

**L2 Requirements:** BKG-4.3.1 (Online Booking Site), BKG-4.3.2 (Full Session Types), BKG-4.3.3 (Mini Session Types), BKG-4.3.4 (Booking Flow), BKG-4.3.5 (Google Calendar Sync), BKG-4.3.6 (Buffer Time), BKG-4.3.7 (Manual Confirmation Mode), BKG-4.3.8 (Session Visibility), BKG-4.3.9 (Intake Documents), BKG-4.3.10 (Booking Payment), BKG-4.3.11 (Video Call Integration), BKG-4.3.12 (Booking Coupons)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `SessionType` | Entity | Defines a bookable session with `Name`, `Description`, `DurationMinutes`, `PriceCents`, `Location`, `Visibility`, `SortOrder`, `BufferBeforeMinutes`, `BufferAfterMinutes`, `RequireManualConfirmation`, `IsMiniSession`, `MiniSessionGapMinutes`, `MiniSessionSpotsPerSlot`, `AvailabilityWindows` (JSON), `VideoCallType`, `RequirePayment`, `DepositAmountCents`, `IntakeDocumentIds` (JSON), `CoverImageUrl`. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `MiniSessionDate` | Entity | Date-specific configuration for mini sessions: `SessionTypeId`, `Date`, `StartTimes` (JSON array of time strings). |
| `BookingRecord` | Entity | A booked session storing `SessionTypeId`, `ContactId`, `ProjectId`, client info, `StartTime`, `EndTime`, `Status`, `Location`, `VideoCallLink`, `GoogleCalendarEventId`, `AmountPaidCents`, `CouponCode`, `DiscountCents`. Implements `ITenantEntity`, `ISoftDeletable`, `IAuditableEntity`. |
| `BookingCoupon` | Entity | Discount code for bookings: `Code`, `CouponType`, `PercentageValue`, `FixedAmountCents`, `ExpirationDate`, `UsageLimit`, `TimesUsed`, `IsActive`. Implements `ITenantEntity`, `ISoftDeletable`. |
| `BookingStatus` | Enum | `Pending`, `Confirmed`, `Declined`, `Cancelled`, `Completed`, `NoShow`. |
| `SessionVisibility` | Enum | `Public`, `Hidden`. |
| `CouponType` | Enum | `PercentageOff`, `FixedAmountOff`, `FreeGiveaway`. |
| `BookingSiteConfig` | Entity | Per-photographer booking site settings: `CoverImageUrl`, `ProfilePhotoUrl`, `WelcomeMessage`, `CustomSlug`, `IsPublished`, `EmbedCode`. Implements `ITenantEntity`. |
| `BookingConfirmedEvent` | Domain Event | Raised when a booking is confirmed (auto or manual). Triggers calendar sync, confirmation email, and lead conversion. |
| `BookingDeclinedEvent` | Domain Event | Raised when a photographer declines a pending booking. Triggers client notification. |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetBookingSiteQuery` | Query | Public. Returns the booking site configuration and all visible session types for a photographer (filtered by visibility). |
| `GetAvailableSlotsQuery` | Query | Public. Returns available date/time slots for a session type within a date range. Considers availability windows, existing bookings, buffer time, Google Calendar busy blocks, and mini session spot counts. |
| `CreateBookingCommand` | Command | Public. Processes the complete booking flow: validates slot availability, creates contact (or finds existing), processes payment (if required), applies coupon, creates `BookingRecord`, generates video call link (if configured), sends confirmation email. |
| `ConfirmBookingCommand` | Command | Photographer confirms a pending booking (manual confirmation mode). Changes status to `Confirmed`, raises `BookingConfirmedEvent`. |
| `DeclineBookingCommand` | Command | Photographer declines a pending booking. Changes status to `Declined`, raises `BookingDeclinedEvent`. |
| `CancelBookingCommand` | Command | Cancels a booking. Handles refund logic if payment was made. |
| `CreateSessionTypeCommand` | Command | Creates a full or mini session type. Validates plan-tier session type limits. |
| `UpdateSessionTypeCommand` | Command | Updates session type configuration. |
| `DeleteSessionTypeCommand` | Command | Soft-deletes a session type. |
| `ReorderSessionTypesCommand` | Command | Batch-updates `SortOrder` for session types on the booking site. |
| `CreateMiniSessionDateCommand` | Command | Adds date/time slots to a mini session type. |
| `DuplicateMiniSessionScheduleCommand` | Command | Copies start times from one `MiniSessionDate` to other dates. |
| `UpdateBookingSiteCommand` | Command | Updates booking site branding: cover image, profile photo, welcome message, custom slug. |
| `CreateBookingCouponCommand` | Command | Creates a booking coupon with type, value, expiration, and usage limit. |
| `UpdateBookingCouponCommand` | Command | Updates coupon details. |
| `DeleteBookingCouponCommand` | Command | Soft-deletes a coupon. |
| `ValidateCouponQuery` | Query | Public. Validates a coupon code and returns the discount amount for a given session price. |
| `ListBookingsQuery` | Query | Returns paginated bookings for the photographer, filterable by status and date range. |
| `GetBookingDetailQuery` | Query | Returns full booking details including linked documents and payment info. |
| `IGoogleCalendarService` | Interface | Two-way calendar sync. Methods: `CreateEventAsync`, `UpdateEventAsync`, `DeleteEventAsync`, `GetBusyBlocksAsync`, `SyncIncomingChangesAsync`. |
| `IVideoCallService` | Interface | Generates video call links. Methods: `CreateMeetingAsync(provider, booking)`. |
| `IPaymentService` | Interface (existing) | Processes booking payments and creates payment intents. |
| `IEmailService` | Interface (existing) | Sends booking confirmation and notification emails. |
| `IPlanGateService` | Interface | Validates session type count against plan limits. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `GetAvailableSlotsHandler` | Handler | Core availability engine. For full sessions: generates slots from availability windows, subtracts booked slots + buffer time + Google Calendar busy blocks. For mini sessions: reads `MiniSessionDate.StartTimes`, subtracts booked spots, calculates "Nearly sold out" when remaining spots <= 2. |
| `CreateBookingHandler` | Handler | Orchestrates the booking flow: re-validates availability (double-booking guard), applies coupon discount, processes payment via `IPaymentService`, creates `BookingRecord`, auto-creates contact and project, generates video call link, sends confirmation. |
| `ConfirmBookingHandler` | Handler | Changes status to `Confirmed`, raises `BookingConfirmedEvent` which triggers `GoogleCalendarService.CreateEventAsync` and confirmation email. |
| `GoogleCalendarService` | Service | Implements `IGoogleCalendarService`. Uses Google Calendar API. Creates events with client as attendee. Reads busy/free blocks to exclude from availability. |
| `GoogleCalendarSyncBackgroundService` | Background Service | Runs every 5 minutes. Polls Google Calendar for changes (new/updated/deleted events) and updates Anansi availability accordingly. Two-way sync. |
| `VideoCallService` | Service | Implements `IVideoCallService`. Integrates with Zoom API and Google Meet API. Generates unique meeting links for each booking. |
| `BookingConfirmedEventHandler` | Event Handler | Listens for `BookingConfirmedEvent`. Creates Google Calendar event, sends confirmation email, triggers lead-to-client conversion. |
| `SessionTypeConfiguration` | EF Config | Index on `(PhotographerId, Visibility)`. Unique constraint on `(PhotographerId, Name)`. |
| `BookingRecordConfiguration` | EF Config | Index on `(PhotographerId, StartTime)` for availability queries. Index on `(SessionTypeId, StartTime)`. |
| `BookingCouponConfiguration` | EF Config | Unique constraint on `(PhotographerId, Code)`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `BookingSiteController` | Controller | Public endpoints: `GET /api/booking/{slug}` (site page), `GET /api/booking/{slug}/sessions/{sessionTypeId}/slots` (available slots). Photographer endpoints: `PUT /api/booking/site` (update branding), `GET /api/booking/site` (get config). |
| `SessionTypesController` | Controller | Authenticated CRUD: `POST /api/session-types`, `GET /api/session-types`, `GET /api/session-types/{id}`, `PUT /api/session-types/{id}`, `DELETE /api/session-types/{id}`, `PUT /api/session-types/reorder`. |
| `MiniSessionsController` | Controller | Authenticated endpoints: `POST /api/session-types/{id}/dates` (add dates), `PUT /api/session-types/{id}/dates/{dateId}` (update), `DELETE /api/session-types/{id}/dates/{dateId}`, `POST /api/session-types/{id}/dates/duplicate` (copy schedule). |
| `BookingsController` | Controller | Public: `POST /api/bookings` (create booking), `POST /api/bookings/validate-coupon` (check coupon). Authenticated: `GET /api/bookings` (list), `GET /api/bookings/{id}` (detail), `PUT /api/bookings/{id}/confirm`, `PUT /api/bookings/{id}/decline`, `PUT /api/bookings/{id}/cancel`. |
| `BookingCouponsController` | Controller | Authenticated CRUD: `POST /api/booking-coupons`, `GET /api/booking-coupons`, `PUT /api/booking-coupons/{id}`, `DELETE /api/booking-coupons/{id}`. |

---

## Class Diagrams

### Domain Layer -- Session Type & Booking Entities

![Domain Layer -- Session Type & Booking Entities](domain-layer-session-type-booking-entities.png)

### Domain Layer -- Booking Site & Coupon Entities

![Domain Layer -- Booking Site & Coupon Entities](domain-layer-booking-site-coupon-entities.png)

### Application Layer -- Booking Commands

![Application Layer -- Booking Commands](application-layer-booking-commands.png)

### Application Layer -- Booking Queries

![Application Layer -- Booking Queries](application-layer-booking-queries.png)

### Infrastructure Layer -- Calendar & Video Call Services

![Infrastructure Layer -- Calendar & Video Call Services](infrastructure-layer-calendar-video-call-services.png)

### API Layer -- Booking Controllers

![API Layer -- Booking Controllers](api-layer-booking-controllers.png)

---

## Sequence Diagrams

### View Booking Site & Available Slots

![View Booking Site & Available Slots](view-booking-site-available-slots.png)

### Complete Booking Flow

![Complete Booking Flow](complete-booking-flow.png)

### Manual Booking Confirmation

![Manual Booking Confirmation](manual-booking-confirmation.png)

### Google Calendar Two-Way Sync

![Google Calendar Two-Way Sync](google-calendar-two-way-sync.png)

### Mini Session Availability with "Nearly Sold Out"

![Mini Session Availability with "Nearly Sold Out"](mini-session-availability-with-nearly-sold-out.png)

### Apply Booking Coupon

![Apply Booking Coupon](apply-booking-coupon.png)
