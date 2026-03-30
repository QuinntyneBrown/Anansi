# 2. Studio Manager (CRM)

The Studio Manager is your business command center. It is the first thing you see after signing in and the place where you manage contacts, track projects, create invoices and contracts, handle bookings, communicate with clients, and monitor your revenue. Every other part of the platform -- galleries, store, website, booking -- feeds data back into the Studio Manager.

**Navigation:** The Studio Manager uses a persistent 260px sidebar on the left side of the screen at the desktop reference width of 1440px. The sidebar background matches the main canvas (`#1A1A1C`) with navigation items stacked vertically. Each item shows a Lucide icon and label in Inter 14px. The active item is highlighted with a `#C9A962` gold left border accent and the text shifts to `#F5F5F0` white. Inactive items use `#A0A0A3` muted text.

**Sidebar sections (top to bottom):**

| Icon | Label | Destination |
|------|-------|-------------|
| `layout-dashboard` | Dashboard | Overview home screen |
| `users` | Contacts | Contact list and CRM |
| `kanban` | Projects | Pipeline board |
| `calendar` | Calendar | Booking calendar |
| `file-text` | Documents | Contracts, invoices, questionnaires, quotes |
| `inbox` | Inbox | Client messaging |
| `bar-chart-2` | Reports | Financial reports |
| `settings` | Settings | Account and preferences |

On tablet (768px) the sidebar collapses to icon-only mode (60px wide). On mobile (402px) the sidebar is replaced by a bottom navigation pill bar.

---

## Dashboard

**Design ID:** SM-13.1.1
**Navigation path:** Sidebar > Dashboard (default landing page after sign-in)

The Dashboard gives you an at-a-glance view of your business. The content area fills the remaining viewport width to the right of the 260px sidebar (i.e., approximately 1180px on a 1440px screen). All content sits on the `#1A1A1C` background with 32px padding from the edges.

### Revenue Metric Cards

The top of the dashboard displays **4 metric cards** in a horizontal row with 16px gaps between them. Each card uses the `#242426` surface, 20px corner radius, 1px `#3A3A3C` border, and 24px internal padding.

| Card | Contents |
|------|----------|
| **Total Revenue** | Dollar amount in Cormorant Garamond 28px bold `#F5F5F0`, label "Total Revenue" in Inter 12px `#A0A0A3` above, percentage change badge (green `#6E9E6E` for positive, red for negative) |
| **Pending Invoices** | Count and total dollar value of unpaid invoices |
| **Upcoming Sessions** | Number of confirmed bookings in the next 7 days |
| **Active Galleries** | Count of currently published collections |

### Upcoming Sessions List

Below the metric cards, a section titled "Upcoming Sessions" (Inter 16px semibold) displays the next 5 confirmed bookings as list item cards. Each card shows:

- Client name (Inter 14px semibold, `#F5F5F0`)
- Session type name and date/time (Inter 13px, `#A0A0A3`)
- Location or video call indicator (Lucide `map-pin` or `video` icon)
- Status badge (Confirmed = `#6E9E6E` sage green pill, Pending = `#C9A962` gold pill)

Cards are stacked vertically with 8px gaps.

### Recent Activity Feed

To the right of the Upcoming Sessions list (or below it on narrower viewports), a "Recent Activity" section shows the latest events across your account:

- New bookings, payments received, contracts signed, gallery downloads, form submissions
- Each entry: Lucide icon + description text + relative timestamp ("2 hours ago")
- Entries use Inter 13px with `#A0A0A3` secondary text and `#F5F5F0` for client names

### Quick Actions

At the bottom of the dashboard (or in a prominent position on mobile), four quick-action buttons are displayed in a horizontal row:

| Button | Icon | Action |
|--------|------|--------|
| New Invoice | `file-plus` | Opens the Invoice Builder (SM-13.5.2) |
| New Contract | `file-signature` | Opens the Contract Editor (SM-13.5.1) |
| Add Contact | `user-plus` | Opens the Create Contact dialog |
| New Booking | `calendar-plus` | Opens the manual booking creation flow |

Each button uses a `#242426` surface with a Lucide icon (24px, `#C9A962` gold) above a label (Inter 12px, `#F5F5F0`). Buttons have 20px radius and respond with a subtle background lighten on hover.

> **Tip:** The Dashboard refreshes data automatically. Revenue metrics reflect real-time payment data from Stripe. Upcoming sessions pull from your booking calendar.

---

## Contacts

### Contact List

**Design ID:** SM-13.2.1
**Navigation path:** Sidebar > Contacts

The Contacts screen displays all your contacts in a searchable, filterable list.

**Top bar:**
- **Search field** -- Full-width text input with a Lucide `search` icon, placeholder "Search contacts...", Inter 14px. The search matches against name, email, and phone.
- **Filter tabs** -- Horizontal tab bar immediately below the search:

| Tab | Description |
|-----|-------------|
| All | Shows every contact regardless of type |
| Clients | Contacts with type `Client` |
| Leads | Contacts with type `Lead` |
| Other | Contacts with type `Other` |

The active tab has a `#C9A962` gold underline (2px). Inactive tabs use `#A0A0A3` text.

- **Add Contact button** -- Gold primary button (`#C9A962`) at the top right, labeled "+ Add Contact".

**Contact list:**

Each contact is displayed as a list item card (`#242426` surface, 20px radius, 16px padding, 8px gap between cards). Card contents:

| Element | Position | Style |
|---------|----------|-------|
| Avatar | Left, 40px circle | Initials on `#3A3A3C` background, `#F5F5F0` text |
| Name | Next to avatar | Inter 14px semibold, `#F5F5F0` |
| Email | Below name | Inter 13px, `#A0A0A3` |
| Type badge | Right side | Pill badge -- Client: `#6E9E6E` bg, Lead: `#C9A962` bg, Other: `#3A3A3C` bg, all with contrasting text, Inter 11px |

The list supports pagination at the bottom. Clicking a contact opens the Contact Detail screen.

### Contact Detail

**Design ID:** SM-13.2.2
**Navigation path:** Sidebar > Contacts > [click a contact]

The Contact Detail screen is a two-column layout:

**Left column (main content, ~70% width):**

At the top, a profile header shows the contact's avatar (64px), full name (Inter 20px semibold), email, phone, and type badge. Below is an "Edit" button (outline style).

Below the header, **5 horizontal tabs** provide access to different aspects of the relationship:

| Tab | Contents |
|-----|----------|
| **Documents** | All contracts, invoices, and questionnaires associated with this contact, displayed as status-tagged list items (Draft, Sent, Signed, Paid, etc.) |
| **Emails** | Email conversation history from the Inbox, threaded chronologically |
| **Sessions** | All booking records for this contact with date, session type, and status |
| **Galleries** | Linked collections with title, status, and media count |
| **Payments** | Full payment history with amount, method, date, and invoice reference |

Each tab content is a scrollable list of cards. Empty tabs display an empty state illustration with a CTA button (e.g., "Create First Invoice").

**Right column (quick info sidebar, ~30% width):**

A sticky sidebar card (`#242426`, 20px radius) shows at-a-glance details:

- Phone number (with click-to-call link)
- Address (city, province, postal code)
- Contact type
- Date added
- Notes field (editable, auto-saves)
- Total paid (sum of all completed payments)

> **Tip:** When a Lead books a session or makes a payment, the system automatically converts their type to Client. You can always change the type manually from the Contact Detail screen.

> **Note:** Contacts can be imported in bulk via CSV from the Contacts screen. The import wizard maps CSV columns to fields and detects duplicates by email address.

---

## Projects

**Design ID:** SM-13.3.1
**Navigation path:** Sidebar > Projects

The Projects screen presents a visual **Kanban pipeline board** for tracking client workflows from inquiry to completion.

### Board Layout

The board fills the content area to the right of the sidebar. Columns are arranged horizontally and scroll sideways if they exceed the viewport width. Each column represents a workflow stage.

**Default stages (customizable):**

1. Inquiry
2. Booked Session
3. Post-production
4. Completed Project

**Column anatomy:**

| Element | Style |
|---------|-------|
| Stage header | Inter 14px semibold `#F5F5F0`, with a count badge showing the number of cards in the stage |
| Column background | `#1A1A1C` (same as page background, stages are separated visually by 16px gutters) |
| Column width | Equal distribution, minimum 280px per column |
| Stage actions | Three-dot menu (`...`) in the header offering Rename, Delete, and Add Stage After |

### Project Cards

Each project is represented by a card within its stage column. Cards use `#242426` surface, 16px radius, 12px padding, and 8px vertical gaps between cards.

**Card contents:**

- **Project name** -- Inter 14px semibold, `#F5F5F0`
- **Client name** -- Inter 13px, `#A0A0A3` (linked to contact)
- **Project type badge** -- Small pill badge (e.g., "Wedding", "Portrait", "Event") in `#3A3A3C` background, Inter 11px
- **Date created** -- Inter 12px, `#666`

### Drag and Drop

Cards can be **dragged between columns** to move projects through your pipeline. While dragging, the card elevates slightly and the target column highlights with a subtle `#C9A962` gold dashed border.

### Stage Customization

To customize your pipeline:

1. Click the three-dot menu on any stage header.
2. Select **Rename** to change the stage name inline.
3. Select **Delete** to remove the stage (cards are moved to the adjacent stage).
4. Select **Add Stage After** to insert a new column to the right.
5. Stages can be reordered by dragging the stage header.

A new project card is created automatically when a lead capture form submission arrives. The card appears in the first stage (Inquiry) and is linked to the auto-created contact.

> **Tip:** Customize your stages to match your actual workflow. Some photographers add stages like "Contract Sent", "Deposit Received", or "Gallery Delivered" for more granular tracking.

---

## Calendar

**Design ID:** SM-13.4.1
**Navigation path:** Sidebar > Calendar

The Calendar screen displays all your booked sessions, availability, and scheduled events.

### View Toggle

At the top of the calendar, three toggle buttons let you switch views:

| View | Button Label | Description |
|------|-------------|-------------|
| Month | `Month` | Full month grid with small indicator dots on days that have bookings |
| Week | `Week` | 7-column grid with time slots (hours on the Y-axis) showing session blocks |
| Day | `Day` | Single-day timeline with full session detail cards |

The active view button uses `#C9A962` gold background with dark text. Inactive buttons use `#242426` background with `#A0A0A3` text.

### Navigation

- **Left/Right chevrons** -- Lucide `chevron-left` and `chevron-right` icons flanking the current date/month label. Clicking navigates backward/forward by one unit (month, week, or day depending on the view).
- **Today button** -- A small text button that snaps the calendar back to the current date.
- **Date label** -- Cormorant Garamond 20px, `#F5F5F0`, showing the current month/year, week range, or date.

### Month View

Each day cell in the month grid shows:

- Day number (Inter 14px)
- Up to 3 colored indicator dots representing booked sessions:
  - Confirmed sessions: `#6E9E6E` sage green dot
  - Pending sessions: `#C9A962` gold dot
- If more than 3 sessions exist, a "+N more" label appears

Clicking a day opens a **selected day detail panel** (320px wide) that slides in from the right side of the calendar. This panel shows:

- Date heading (Inter 16px semibold)
- List of all sessions for that day with time, client name, session type, and status badge
- A "New Booking" button at the bottom

### Week and Day Views

These views display session blocks as colored rectangles positioned on a time grid:

- Block height represents duration
- Block color matches the session status (green for confirmed, gold for pending)
- Block contents: client name and session type in Inter 12px
- Clicking a block opens the booking detail

### Google Calendar Integration

If you have connected Google Calendar (Settings > Integrations), two-way sync is active:

- Anansi bookings appear on your Google Calendar
- Google Calendar events with "busy" status automatically block corresponding time slots in Anansi
- Conflict detection prevents double-booking

> **Tip:** Use the Day view before a busy shoot day to review all sessions, locations, and client details in sequence.

---

## Documents

The Documents section is accessed from `Sidebar > Documents`. It contains four document types, each with its own editor. The screen opens to a tabbed list view where you can filter by Contracts, Invoices, Questionnaires, and Quotes.

### Contract Editor

**Design ID:** SM-13.5.1
**Navigation path:** Sidebar > Documents > Contracts > + New Contract (or click an existing contract)

The Contract Editor is a full-width rich text editing environment for creating professional client contracts.

**Layout:**

The editor fills the content area with 32px padding. The toolbar is fixed at the top.

**Rich text toolbar:**

A horizontal toolbar offers formatting controls:

| Control | Icon/Label |
|---------|-----------|
| Bold | `B` |
| Italic | `I` |
| Heading levels | `H1`, `H2`, `H3` |
| Bullet list | Lucide `list` |
| Numbered list | Lucide `list-ordered` |
| Alignment | Left, Center, Right |

**Variable insertion toolbar:**

A secondary toolbar row (or dropdown) provides auto-population variables. When inserted, variables appear as highlighted inline tokens (gold `#C9A962` background pill) in the contract body:

| Variable | Token Display | Auto-fills With |
|----------|--------------|----------------|
| Client Name | `{{client_name}}` | Contact's full name |
| Email | `{{email}}` | Contact's email address |
| Phone | `{{phone}}` | Contact's phone number |
| Date | `{{date}}` | Current date or specified date |
| Custom | `{{custom:label}}` | Prompted when applying template |

**Contract body:**

The main editing area uses a `#242426` card surface with generous padding. Text renders in Inter 14px, `#F5F5F0`. Headers use larger sizes per the heading level.

**Signature area:**

At the bottom of the contract, a signature section is displayed:

- **E-signature toggle** -- A toggle switch labeled "Require E-Signature" (default: on). When enabled, signature fields appear for both the photographer and client.
- **Signature fields** -- Two signature blocks side by side:
  - Left: "Photographer Signature" with the photographer's name, a signature pad area (dashed border), and a "Pre-sign" button
  - Right: "Client Signature" with the client's name and a signature pad area (filled by the client when they receive the contract)
- **Add Signer button** -- An outline button to add a second client signer (e.g., a spouse or partner) with their own signature field

**Right panel (contract settings):**

A 320px settings panel on the right shows:

- Assigned contact (searchable dropdown)
- Status badge (Draft, Sent, Signed, Expired)
- Expiry settings (optional, configurable number of days)
- Auto-reminder toggle and interval
- Save as Template option
- Send button (gold primary button)

> **Tip:** Start with one of the 3 included sample contract templates (Portrait Session, Wedding, Event) and customize it for your business. Save your customized version as a template for future use.

> **Pro plan:** Document expiry and automatic reminders require an upgraded plan.

### Invoice Builder

**Design ID:** SM-13.5.2
**Navigation path:** Sidebar > Documents > Invoices > + New Invoice (or click an existing invoice)

The Invoice Builder lets you create professional invoices with itemized line items, taxes, and payment schedules.

**Layout:**

The invoice preview occupies the main content area, styled as a document card (`#242426` surface, 24px radius, 40px padding) to look like a printed invoice.

**Invoice header:**

- Your business logo and name (top left)
- Invoice number (auto-generated, editable), Inter 14px, `#A0A0A3`
- Client name and contact info (top right, pulled from the assigned contact)
- Invoice date and due date

**Line items table:**

A structured table with the following columns:

| Column | Width | Alignment |
|--------|-------|-----------|
| Item Name | ~40% | Left |
| Description | ~25% | Left |
| Qty | ~10% | Center |
| Unit Price | ~12% | Right |
| Total | ~13% | Right |

Each row is editable inline. An "Add Line Item" button (Inter 13px, `#C9A962` gold text, no background) sits below the table.

**Totals section:**

Below the line items, right-aligned:

| Label | Value |
|-------|-------|
| Subtotal | Sum of all line items |
| Tax (configurable %) | Calculated tax amount |
| Discount | Discount amount (if any) |
| **Total** | **Grand total in Cormorant Garamond 24px bold, `#C9A962` gold** |

**Payment schedule section:**

Below the totals, a payment schedule area allows splitting the invoice into installments:

- Each installment row shows: Label (e.g., "Deposit", "Final Payment"), Amount, Due Date, Paid status
- "Add Installment" button to split further
- Each installment tracks its own paid/unpaid status independently

**Right panel (invoice settings):**

- Assigned contact
- Status badge (Draft, Sent, Viewed, PartiallyPaid, Paid, Overdue)
- Tax rate configuration
- Tips toggle (enables 5%, 10%, 15%, custom tip options for the client)
- Auto-reminder toggle
- Save as Template option
- Send button

> **Tip:** Enable tips on your invoices. Many clients appreciate the option to add a gratuity, and it is tracked separately in your financial reports.

---

## Inbox

**Design ID:** SM-13.6.1
**Navigation path:** Sidebar > Inbox

The Inbox provides a unified email communication hub for all client conversations.

### Split-Pane Layout

The Inbox uses a two-pane horizontal layout:

**Left pane -- Conversation list (360px wide):**

- **Header** -- "Inbox" in Inter 16px semibold with a "New Message" button (gold outline) at the top right.
- **Conversation cards** -- Stacked vertically, each showing:
  - Client avatar (36px circle)
  - Client name (Inter 14px semibold, `#F5F5F0`)
  - Message preview (Inter 13px, `#A0A0A3`, truncated to one line)
  - Timestamp (Inter 12px, `#666`, top right)
  - Unread indicator: a small `#C9A962` gold dot next to unread conversations
- The active/selected conversation has a `#242426` background highlight with a left gold border.
- The list is scrollable.

**Right pane -- Message thread:**

The selected conversation's messages display in a threaded view:

- **Client messages** align to the **left** with a `#242426` background bubble, 16px radius, 12px padding
- **Photographer messages** (your replies) align to the **right** with a `#3A3A3C` background bubble
- Each message shows the sender name, timestamp, and message body in Inter 14px
- File attachments appear as inline cards with a file icon, name, and size
- Messages are ordered chronologically (oldest at top, newest at bottom)

**Reply compose area:**

Fixed at the bottom of the right pane:

- Text input field with placeholder "Type a message...", Inter 14px
- Attachment button (Lucide `paperclip` icon) supporting 30+ file types up to 25 MB
- Template selector button (Lucide `file-text` icon) to insert a saved email template
- Send button (Lucide `send` icon, `#C9A962` gold)

> **Tip:** Use email templates for common communications like gallery delivery messages, booking confirmations, or follow-ups. Create templates in Settings > Email Templates and insert them with one click from the compose area.

---

## Reports

**Design ID:** SM-13.7.1
**Navigation path:** Sidebar > Reports

The Reports screen is a financial dashboard that gives you visibility into your revenue, payments, and business health.

### Revenue Metric Cards

The top section displays **4 metric cards** in a horizontal row (same card style as the Dashboard):

| Card | Description |
|------|-------------|
| **Total Revenue** | Gross revenue for the selected period |
| **Net Revenue** | Revenue after fees, refunds, and disputes |
| **Tips** | Total gratuities received |
| **Taxes Collected** | Total tax collected on invoices |

Each card shows the dollar amount in Cormorant Garamond 24px bold, `#F5F5F0`, with the label above in Inter 12px `#A0A0A3`.

### Revenue Bar Chart

Below the metric cards, a bar chart visualizes revenue over time:

- X-axis: time periods (months by default, adjustable)
- Y-axis: dollar amounts
- Bars use `#C9A962` gold fill
- Hover tooltip shows the exact amount for each period
- A date range selector at the top right allows filtering: This Year, This Quarter, This Month, or Custom range

### Transaction Table

Below the chart, a full transaction table lists every payment:

| Column | Description |
|--------|-------------|
| Date | Transaction date |
| Client | **Client name resolved from the contact record** (not just an ID) |
| Description | Invoice title or payment description |
| Amount | Gross amount |
| Method | Payment method icon + label (Card, PayPal, Tap to Pay, etc.) |
| Fees | Platform and processing fees |
| Net | Amount after fees |

The table supports:

- Search by client name or description
- Sort by any column (click column header)
- Pagination
- CSV export button at the top right

> **Tip:** Use the Reports section monthly to review your revenue trends, identify your busiest periods, and export data for your accountant or tax filing.

---

## Settings

**Design ID:** SM-13.8.1
**Navigation path:** Sidebar > Settings

The Settings screen organizes all account and business configuration into a single scrollable page with distinct sections.

### Account Settings

**Profile section:**

| Field | Description |
|-------|-------------|
| First Name | Your first name |
| Last Name | Your last name |
| Email | Account email (also used for notifications) |
| Business Name | Your studio or business name, displayed on galleries, invoices, and the booking site |
| Timezone | Dropdown selector for your local timezone, affects calendar display and email scheduling |

All fields are editable with a "Save Changes" button at the bottom.

**Business Information section:**

| Field | Description |
|-------|-------------|
| Logo | Upload area for your business logo (PNG, up to 5 MB) |
| Brand color | Hex color picker for your primary brand color |
| Phone | Business phone number |
| Address | Business address (street, city, province, postal code, country) |

### Storage Usage

A **progress bar** displays your current storage consumption against your plan's limit:

- Bar background: `#3A3A3C`
- Fill: `#C9A962` gold (or `#6E9E6E` green if under 50%, transitioning through gold to red as it approaches the limit)
- Label: "X GB of Y GB used" in Inter 14px, `#F5F5F0`
- If storage exceeds 80%, a warning badge appears. At 90%+, the bar turns amber. At 95%+, it turns red with a "Consider upgrading" message.

### Danger Zone

At the bottom of the settings page, a section with a red-tinted border (`#E53935` subtle border) contains destructive actions:

- **Change Password** -- Opens a modal with current password, new password, and confirm password fields
- **Delete Account** -- Requires typing "DELETE" to confirm. Shows a warning about permanent data loss. This action is irreversible.

### Notification Preferences

A dedicated sub-section (or separate tab) for configuring how you receive notifications:

**Notification matrix table:**

| Event | In-App | Email | Push |
|-------|--------|-------|------|
| New Booking | Toggle | Toggle | Toggle |
| Payment Received | Toggle | Toggle | Toggle |
| Contract Signed | Toggle | Toggle | Toggle |
| Invoice Payment | Toggle | Toggle | Toggle |
| New Message | Toggle | Toggle | Toggle |
| Form Submission | Toggle | Toggle | Toggle |
| Gallery Download | Toggle | Toggle | Toggle |
| Store Order | Toggle | Toggle | Toggle |
| Gallery Expiring | Toggle | Toggle | Toggle |
| Quote Accepted | Toggle | Toggle | Toggle |

Each toggle is a small switch component. The defaults have In-App enabled for all events, Email enabled for payments and bookings, and Push enabled for messages.

**Email digest option:**

A radio group offering:
- Real-time (individual emails per event)
- Daily summary (one digest email per day)

> **Tip:** If you are receiving too many email notifications, switch to the Daily Summary digest. You will still see real-time alerts in the app and on your phone via push notifications.

---

## Summary

The Studio Manager is the operational backbone of Anansi. Every client interaction -- from the initial inquiry through delivery and payment -- flows through these screens. The key screens and their design IDs for reference:

| Screen | Design ID | Purpose |
|--------|-----------|---------|
| Dashboard | SM-13.1.1 | Business overview and quick actions |
| Contact List | SM-13.2.1 | Find and filter contacts |
| Contact Detail | SM-13.2.2 | Full client profile with tabs |
| Projects Board | SM-13.3.1 | Kanban pipeline tracking |
| Calendar | SM-13.4.1 | Booking calendar with day detail |
| Contract Editor | SM-13.5.1 | Rich text contracts with e-signatures |
| Invoice Builder | SM-13.5.2 | Line-item invoices with payment schedules |
| Inbox | SM-13.6.1 | Client messaging hub |
| Reports | SM-13.7.1 | Financial dashboard and transactions |
| Settings | SM-13.8.1 | Account, storage, notifications, danger zone |

For the next section, continue to [Client Galleries](03-client-galleries.md) to learn how to upload, organize, and deliver your photography work.
