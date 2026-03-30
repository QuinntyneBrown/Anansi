# Booking & Scheduling

Let clients book sessions directly from your branded booking page. Anansi handles date/time selection, intake documents (contracts and questionnaires), deposit collection, and confirmation -- all in one seamless flow.

---

## Booking Landing Page

### Desktop View (BKG-17.1.1)

**Navigation:** [Your Booking URL] (e.g., yourname.anansi.com/booking)

**Layout:** A branded landing page that showcases your session offerings.

**Cover Section:**

- **Profile image** -- 120px circular photo with a gold (#C9A962) border
- **Photographer name** -- displayed in Cormorant Garamond at 42px
- **Welcome text** -- a customizable greeting or tagline below your name

**Session Type Cards:**

Below the cover section, your available session types are displayed as cards. Each card contains:

- **Session name** -- the title of the session type (e.g., "Portrait Session", "Wedding Package")
- **Duration** -- displayed with a clock icon (Lucide `clock`), e.g., "60 min"
- **Price** -- displayed in Cormorant Garamond at 24px in gold (#C9A962), e.g., "$350"
- **Description** -- a brief summary of what the session includes
- **"Book Now" button** -- gold primary button to begin the booking flow

**Desktop spacing:** Cards are arranged with 32px gap between them and 120px horizontal padding from the page edges.

**Key interactions:**

- Clients scroll through your session types and click "Book Now" on the one they want.
- Sessions marked as hidden or link-only do not appear on this page -- they are only accessible via direct URL.
- If manual confirmation mode is enabled, the "Book Now" button text changes to "Request Booking."

**Tip:** Order your session types strategically. Place your most popular or highest-value offering first, as it gets the most visibility.

---

### Mobile View (BKG-17.1.2)

**Navigation:** Same URL, viewed on a mobile device

**Layout:** The mobile booking page adapts to a single-column layout:

- The cover section stacks vertically with the profile image, name, and welcome text centered.
- Session type cards stack in a single column with 20px gap between them.
- All content uses full-width layout with standard mobile margins.

Everything else functions identically to the desktop version.

---

## Date & Time Selection (BKG-17.1.3)

**Navigation:** Booking Landing > Book Now > Select Date & Time

**Layout:** A two-column layout for choosing when to book.

### Left Column -- Calendar

A month-view calendar with:

- **Month navigation** -- left/right arrows to move between months
- **Day cells** -- 40x40px cells for each day of the month
- **Available dates** -- displayed in the default text color, clickable
- **Unavailable dates** -- dimmed/grayed out, not clickable
- **Selected date** -- highlighted with a gold (#C9A962) background

Days are marked available based on your configured availability schedule. Google Calendar sync ensures your existing appointments are respected, preventing double-bookings.

### Right Column -- Time Slots (340px width)

When a date is selected, the right column displays:

- **Available time slots** -- selectable buttons showing start times (e.g., "10:00 AM", "2:00 PM")
- **Selected slot** -- highlighted in gold
- **Session info card** -- a compact card showing the session name, duration, and price for reference

Time slots respect your configured buffer time (pre and post session) and advance booking limits.

**Key interactions:**

- Click a date on the calendar to see available time slots.
- Click a time slot to select it. The slot highlights in gold.
- Click "Continue" to proceed to the contact information form or intake documents.
- If the session is a mini session type, available date slots and start times are shown instead of the full calendar.

**Tip:** The calendar respects your Google Calendar sync. If you have a personal appointment at 2 PM, that slot will not appear as available to clients.

---

## Contact Information (BKG-17.1.4)

**Navigation:** Date/Time Selection > Continue

A form collecting the client's details:

- **First Name** -- required text input
- **Last Name** -- required text input
- **Email** -- required email input
- **Phone** -- required phone input
- **Custom fields** -- any additional fields you configured for this session type (short text, long text, multiple choice, checkboxes, date/time)

A "Next" button advances to the intake document flow or payment step, depending on your session configuration.

---

## Intake Document Flow (BKG-17.1.5)

**Navigation:** Contact Info > Next

If you have attached contracts or questionnaires to the session type, the client completes them in sequence. A step indicator at the top shows progress:

```
(1) Info  -->  (2) Contract  -->  (3) Questionnaire  -->  (4) Payment
```

**Contract Signing View:**

- Scrollable contract text with your terms
- Client-fillable fields (initials, address, custom info) highlighted inline
- Signature pad at the bottom for the client to draw or type their signature
- "Sign" button to complete the contract

**Questionnaire View:**

- List of questions with appropriate input types (text, multiple choice, checkboxes, date)
- Required questions marked with an asterisk
- "Submit" button to complete the questionnaire

Steps without attached documents are skipped automatically.

---

## Payment (BKG-17.1.6)

**Navigation:** Intake Flow > Payment

**Layout:** A two-column layout for payment collection.

### Left Column -- Payment Form

- **Amount display** -- the full session fee or deposit amount, shown prominently in gold (#C9A962). If a deposit is configured, it shows "Deposit: $150" rather than the full price.
- **Payment method tabs** -- Card, Apple Pay / Google Pay, PayPal
- **Card inputs** -- card number, expiry, CVC (rendered by Stripe Elements)
- **Coupon field** -- optional text input with "Apply" button for booking promotional codes

### Right Column -- Booking Summary Sidebar (380px width)

A summary card showing:

| Detail | Value |
|--------|-------|
| Session Type | e.g., "Portrait Session" |
| Date | Selected date |
| Time | Selected time slot |
| Duration | e.g., "60 min" |
| Price | Full session fee |
| Deposit | Amount due now (if split payment) |
| Remaining | Balance due later (if applicable) |

A "Book Now" gold primary button with the amount displayed (e.g., "Book Now -- $150") sits below the summary.

**Key interactions:**

- Select your preferred payment method from the tabs.
- Enter card details securely via Stripe Elements.
- Apply a coupon code for a discount.
- Click "Book Now" to complete the booking and process payment.
- If the photographer has enabled installment payments, the summary shows the deposit amount due now and the remaining balance schedule.

**Tip:** If manual confirmation mode is enabled for the session type, the button reads "Request Booking" instead and payment is not collected until the photographer approves the request.

---

## Booking Confirmation (BKG-17.1.7)

**Navigation:** Payment > Confirm

**Layout:** A centered confirmation screen.

**Success Indicator:**

- A large check circle icon (80px) in sage green (#6E9E6E)
- **"Booking Confirmed!"** heading in Cormorant Garamond at 42px

**Details Card (500px width):**

A card displaying the booking summary:

| Detail | Value |
|--------|-------|
| Session Type | e.g., "Portrait Session" |
| Date | Booked date |
| Time | Booked time |
| Duration | Session length |
| Location | Session location or "TBD" |
| Photographer | Your name and contact info |
| Amount Paid | Deposit or full amount |

**Calendar Buttons:**

Three buttons to add the session to the client's calendar:

- **Google Calendar** -- opens Google Calendar with pre-filled event details
- **Apple Calendar** -- downloads an .ics file for Apple Calendar
- **Outlook** -- downloads an .ics file for Outlook

**Confirmation Email Note:**

Text below the card: "You'll receive a confirmation email with these details shortly."

**Key interactions:**

- Click any calendar button to save the session to a personal calendar.
- The confirmation email is sent automatically with all booking details, location, and any notes from the photographer.

**Tip:** The confirmation page is your last touchpoint before the session. Make sure your session type descriptions include location details or a note about how you will follow up with location information.

---

## Photographer Booking Management

### Session Type Management (BKG-17.2)

**Navigation:** Dashboard > Booking > Session Types

Create and manage the session types that appear on your booking page:

- **Full sessions** -- standard bookings with configurable duration, pricing, and availability windows.
- **Mini sessions** -- shorter sessions with specific date slots, start times, and gaps/breaks between clients. Mini sessions can display a "Nearly sold out" urgency indicator when most slots are filled.

Each session type can include:

- Duration and pricing
- Availability schedule (days of week, hours)
- Buffer time before and after sessions
- Advance booking limits
- Intake documents (contracts + questionnaires)
- Payment/deposit requirements
- Visibility setting (public on booking page or hidden/link-only)
- Video call integration (Zoom or Google Meet link)

### Calendar View

**Navigation:** Dashboard > Booking > Calendar

A visual calendar (month, week, or day view) showing all booked sessions. Google Calendar two-way sync keeps everything in one place with automatic conflict detection.

### Pending Bookings

**Navigation:** Dashboard > Booking > Pending

When manual confirmation mode is enabled, incoming booking requests appear here for you to accept or decline.

---

## Quick Reference

| Task | Navigation |
|------|-----------|
| Create a session type | Dashboard > Booking > Session Types > + New |
| View booked sessions | Dashboard > Booking > Calendar |
| Review pending requests | Dashboard > Booking > Pending |
| Manage availability | Dashboard > Booking > Session Types > [Type] > Availability |
| Add intake documents | Dashboard > Booking > Session Types > [Type] > Intake Documents |
| Configure deposit | Dashboard > Booking > Session Types > [Type] > Payment |
| Create booking coupon | Dashboard > Booking > Coupons > + New |
| Share booking link | Dashboard > Booking > Settings > Share Link |
