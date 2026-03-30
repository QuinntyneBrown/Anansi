# Canadian & Cultural Features

Anansi includes specialized features for Canadian photographers, with a focus on the Toronto Black photography community. These tools cover Canadian payment methods, tax compliance, cultural discovery, editing presets for melanin-rich skin tones, and community event coordination.

---

## Interac e-Transfer (L25)

Accept payments via Interac e-Transfer -- Canada's most widely used person-to-person payment method. Photographers can send payment requests from invoices, and clients see Interac as a familiar option at checkout.

### Interac Settings (INT-25.1.1)

**Navigation:** Dashboard > Settings > Payments > Interac e-Transfer

Configure Interac e-Transfer as a payment method:

- **Enable/Disable toggle** -- turn Interac payments on or off
- **Registered email** -- the email address linked to your Interac account
- **Status indicator** -- shows whether Interac is active on your invoices and store

Once enabled, Interac e-Transfer appears as a payment option on all your invoices and in your store checkout.

### Payment Request Management (INT-25.1.2)

**Navigation:** Dashboard > Payments > Interac Requests

An admin table listing all your Interac payment requests. Each row shows:

| Column | Description |
|--------|-------------|
| Reference Code | Unique alphanumeric code (e.g., "ANANSI-INV-1042") |
| Amount | Payment amount |
| Client Email | Recipient's email address |
| Invoice Number | Linked invoice reference |
| Status | Badge -- Pending (gold), Completed (green), Expired (red) |
| Date | Date the request was created |

**Filter tabs** across the top: All / Pending / Completed / Expired. The active filter tab uses a gold accent.

**Key interactions:**

- Use the status filter tabs to focus on pending requests that need your attention.
- Click a row to view the request detail with a "Confirm Receipt" action.
- Once you receive the e-Transfer in your bank, click "Confirm Receipt" to reconcile the payment against the invoice. The invoice updates its paid amount automatically.

### Create Payment Request (INT-25.1.3)

**Navigation:** Dashboard > Invoices > [Invoice] > Send Interac Request

A modal dialog opens with:

- **Amount** -- pre-filled from the invoice's outstanding balance
- **Client email** -- pre-filled from the invoice's client
- **Expiry date** -- date picker to set when the request expires
- **Reference code preview** -- the auto-generated unique code
- **"Send Request"** gold primary button

### Client Payment Instructions (INT-25.1.4)

**Navigation:** Client views an invoice or selects Interac at checkout

When a client selects Interac e-Transfer, they see a payment instructions card (500px width) containing:

- **Amount due** -- prominently displayed
- **Photographer's Interac email** -- the email to send the transfer to
- **Payment reference code** -- the unique code to include in the transfer message
- **3 transfer steps:**
  1. Open your banking app and select Interac e-Transfer
  2. Send the amount to the email shown above
  3. Include the reference code in the message field
- **"I've Sent the Transfer"** confirmation button -- notifies the photographer that the client has initiated the transfer

**Tip:** Remind clients to include the reference code in their transfer message. This makes reconciliation straightforward when you confirm receipt.

---

## HST Calculator & Tax Tracker (L26)

Built-in Ontario HST (13%) support with revenue threshold tracking and Input Tax Credit (ITC) management.

### Tax Profile (TAX-26.1.1)

**Navigation:** Dashboard > Settings > Tax

Configure your Canadian tax settings:

- **HST toggle** -- enable or disable HST collection
- **HST rate** -- defaults to 13% for Ontario; configurable for other provinces
- **Registration number** -- your CRA Business Number
- **Registration status** -- Not Registered / Voluntary / Mandatory

### Tax Dashboard (TAX-26.1.2)

**Navigation:** Dashboard > Finances > Tax

The tax dashboard displays three metric cards across the top:

| Card | Description |
|------|-------------|
| HST Rate | Your configured rate (e.g., "13%") |
| Revenue YTD | Year-to-date revenue from all payment sources |
| Threshold | Progress toward the $30,000 CRA registration threshold |

Below the metric cards, a **Revenue Threshold Widget** shows:

- **Progress visualization** -- a bar or circular indicator showing your rolling four-quarter revenue as a percentage of $30,000
- **Current amount** -- your exact rolling revenue figure
- **Quarterly breakdown** -- four bars representing each of the last four calendar quarters with individual revenue amounts

### Threshold Alert Banner (TAX-26.1.3)

When your rolling revenue crosses critical thresholds, a dismissible alert banner appears at the top of the dashboard:

| Threshold | Style | Message |
|-----------|-------|---------|
| Below 75% | Green | No banner displayed |
| 75% reached | Gold warning | "Your rolling revenue has reached 75% of the $30,000 HST registration threshold. Consider registering voluntarily." |
| 90% reached | Red critical | "Your rolling revenue is at 90% of the $30,000 threshold. HST registration may be required soon. Consult your accountant." |
| 100% exceeded | Red persistent | "You have exceeded the $30,000 threshold. CRA requires HST registration." |

**Tip:** The threshold tracker uses a rolling four-quarter period, not a calendar year. Revenue from the oldest quarter drops off as new quarters are added. Keep an eye on this if your revenue is seasonal.

### Expense & ITC Tracking (TAX-26.2.x)

**Navigation:** Dashboard > Finances > Tax > Expenses

Track your business expenses and the HST you pay on them to calculate Input Tax Credits.

**Summary Cards (top row):**

| Card | Description |
|------|-------------|
| HST Collected | Total HST collected from clients on invoices and store orders |
| HST Paid (ITCs) | Total HST you paid on business expenses |
| Net HST Owing | HST Collected minus ITCs -- what you owe CRA |

**Category Filter Chips:**

A row of selectable filter chips to narrow the expense list by category:

- Equipment
- Software
- Studio
- Travel
- Supplies
- Marketing
- Professional Services
- Other

Active chips use the gold (#C9A962) background. Inactive chips use a bordered style.

**Expense Table:**

| Column | Description |
|--------|-------------|
| Date | Expense date |
| Description | What the expense was for |
| Amount | Total expense amount |
| HST Paid | HST portion of the expense |
| Category | Category badge |
| Actions | Edit / Delete buttons |

The "+ Add Expense" button in the table header opens a form with fields for description, amount, HST paid, category dropdown, and date picker.

**ITC Summary Report (TAX-26.2.3):**

A report view showing:

- Total HST collected on revenue
- Total ITCs (HST on expenses)
- Net HST owing (collected minus paid)
- Category breakdown chart showing ITCs by expense type
- Date range selector to view specific periods
- Export button for CRA filing

**Tip:** Export your ITC summary before each quarterly filing. The report provides everything your accountant needs to complete your HST return.

---

## Cultural Discovery (L27)

Connect with clients who are looking for photographers with specific cultural expertise. Tag your profile with specializations and set your service area to appear in the public directory.

### Profile & Cultural Tags (DIR-27.1.1)

**Navigation:** Dashboard > Settings > Profile > Cultural Specializations

Tag your profile with cultural expertise areas using chip-style selectors:

**Active tags** display with a gold (#C9A962) background and dark text. **Inactive tags** display with a bordered outline on the dark surface.

**Predefined tags include:**

- Caribbean Wedding
- Nigerian Traditional
- Ghanaian Engagement
- Ethiopian/Eritrean Ceremony
- Somali Wedding
- Caribana/Carnival
- Afrofest Coverage
- Church/Gospel Event
- Natural Hair Photography
- Melanin Portraiture
- African Fashion
- Cultural Portraits
- Community Event
- Black Family
- Maternity/Newborn

You can also create custom tags (free text, up to 50 characters). Maximum of 20 tags per profile. A counter shows "x / 20" so you know how many you have used.

**Key interactions:**

- Click a predefined tag to toggle it on or off.
- Type in the custom tag input to create a new tag and press Enter to add it.
- Click the X on any selected tag chip to remove it.
- Tags appear on your public profile and in directory search results.

### Service Area (DIR-27.1.2)

**Navigation:** Dashboard > Settings > Profile > Service Area

A configuration card (400px width) for setting your location and coverage:

- **Neighborhood dropdown** -- select your primary Toronto neighborhood from predefined options:
  - Little Jamaica / Eglinton West
  - Jane-Finch / Black Creek
  - Scarborough / Malvern
  - Rexdale / Etobicoke North
  - Weston
  - Lawrence Heights
  - Downsview
  - St. James Town
  - Kensington Market
  - Liberty Village
  - The Annex
  - Yorkville
  - Downtown Core
  - North York Centre
  - Mississauga
- **Radius slider** -- set your service area from 5 to 100 km, with a value label showing the current setting
- **Save button** -- gold primary button

**Tip:** Set your radius generously. Many Toronto-area photographers serve the entire GTA. A 50 km radius from Downtown Core covers most of the metropolitan area.

### Public Directory Search (DIR-27.1.3)

**Navigation:** [Platform URL]/directory (public page)

The directory is a public-facing search page where potential clients can find photographers.

**Hero Section:**

- **Heading** -- "Find Your Perfect Photographer" in Cormorant Garamond at 42px
- **Search bar** -- text input for searching by name or keyword

**Filter Controls:**

- **Cultural tag filter chips** -- clickable chips for the most popular cultural tags. Active chips use gold background; inactive use bordered style.
- **Neighborhood dropdown** -- filter by Toronto neighborhood
- **Sort options** -- Relevance, Distance, or Rating

**Results Grid:**

A 3-column grid (desktop) of photographer profile cards. Each card (DIR-27.1.4) contains:

- **Profile image** -- circular photo
- **Photographer name** -- primary text
- **Business name** -- secondary text
- **Cultural tags** -- up to 5 tags displayed as small chips
- **Neighborhood** -- location text
- **"View Profile"** action button

Cards follow the standard card styling: #242426 surface, 20px border radius.

**Key interactions:**

- Enter search terms in the search bar to find photographers by name.
- Click cultural tag chips to filter by specialization. Multiple tags can be active simultaneously (results match ANY selected tag).
- Select a neighborhood to filter by proximity.
- Sort results by relevance (most matching tags), distance (nearest first), or rating.
- Click "View Profile" to see the photographer's full public profile with portfolio, booking link, and contact info.

---

## Skin Tone Preset Library (L28)

A curated library of photo editing presets designed for melanin-rich skin tones, organized by skin tone range and shooting context.

### Preset Browsing (PRE-28.1.1)

**Navigation:** Dashboard > Presets

**Filter Bar:**

Two dropdown filters at the top of the page:

- **Skin Tone Range** -- Light, Medium, Deep, Very Deep
- **Shooting Context** -- Studio Portrait, Outdoor Natural, Event Reception, Golden Hour, Low Light, Flash

**Preset Cards Grid:**

Each preset card displays:

- **Thumbnail** -- before/after preview image showing the preset's effect
- **Preset name** -- title text
- **Skin tone badge** -- e.g., "Deep" with a colored indicator
- **Context badge** -- e.g., "Golden Hour"
- **Favorite count** -- heart icon with number of photographers who have favorited this preset
- **Favorite toggle** -- heart icon to add/remove from your favorites

Cards are sorted by popularity (favorite count) by default.

**Key interactions:**

- Use the filter dropdowns to narrow presets by skin tone and context.
- Click a card to open the preset detail panel.
- Click the heart icon to favorite a preset for quick access later.
- Search by name using the search bar above the grid.

### Preset Detail (PRE-28.1.2)

**Navigation:** Presets > [Preset Name]

A detail panel or modal showing:

- **Before/After preview** -- side-by-side or slider comparison of the preset's effect
- **Preset name** and **description**
- **Author** -- photographer name or "Anansi" for platform presets
- **Skin tone range** and **shooting context**
- **Favorite toggle** -- heart icon

**Adjustment Values (grouped by section):**

| Section | Values |
|---------|--------|
| Basic | Temperature, Tint, Exposure, Contrast, Highlights, Shadows, Whites, Blacks, Clarity, Vibrance, Saturation |
| HSL (Hue/Saturation/Luminance) | Values for 8 color channels |
| Color Grading | Split Tone Highlight Hue/Saturation, Shadow Hue/Saturation |

- **Export/Apply button** -- gold primary button to export the preset in Lightroom-compatible format

### Create / Edit Preset (PRE-28.1.3)

**Navigation:** Presets > + Create New (or edit an existing one)

A creation form panel (400px width) with sections:

**Metadata:**

- Name (text input)
- Description (textarea)
- Visibility (Public / Private toggle)

**Classification:**

- Skin Tone Range dropdown (Light / Medium / Deep / Very Deep)
- Shooting Context dropdown (Studio Portrait / Outdoor Natural / Event Reception / Golden Hour / Low Light / Flash)

**Adjustment Sliders:**

Organized into the same groups as the detail view (Basic, HSL, Color Grading), with slider inputs for each value.

- **Save** -- gold primary button
- **Cancel** -- secondary button

**Tip:** Start with one of the platform's curated presets (marked "Anansi" as author) and adjust from there. These seed presets cover all four skin tone ranges and provide a solid foundation for custom work.

---

## Toronto Black Events Calendar (L29)

A pre-populated calendar of recurring Toronto Black cultural events and festivals. Sync events to your booking calendar, create event-specific packages, and discover community-submitted events.

### Events Calendar View (EVT-29.1.1)

**Navigation:** Dashboard > Events

**Layout:**

- **Month-view calendar** with colored dot indicators on dates that have events. Each dot's color corresponds to the event's category.
- **Category filter chips** across the top: Festival, Cultural, Community, Religious, Market. Active chips use gold background.
- **Neighborhood filter** -- dropdown to filter events by Toronto neighborhood
- **List/Grid toggle** -- switch between calendar view and a list view of events

**Event Sidebar (380px, desktop):**

On the right side of the calendar, a sidebar shows **Upcoming Events** -- the next several events in chronological order. Each event in the sidebar shows:

- Event name
- Date range
- Category badge (colored by category)
- Neighborhood / venue

**Key interactions:**

- Click a date on the calendar to see events on that day.
- Click an event name to open its detail card.
- Use category filter chips to show only specific event types.
- Toggle between calendar and list view depending on your preference.

**Tip:** Sync major festivals to your booking calendar at the start of each year. Events like Caribana and Afrofest generate significant photography demand.

### Event Detail (EVT-29.1.2)

**Navigation:** Events > [Event Name]

A detail card or modal showing:

| Field | Description |
|-------|-------------|
| Event Name | Title text |
| Description | Full event description |
| Dates | Start and end dates, with recurrence info |
| Venue / Location | Where the event takes place |
| Neighborhood | Toronto neighborhood mapping |
| Category | Badge (Festival / Cultural / Community / Religious / Market) |
| Website | Link to the event's official website |

**Action Buttons:**

- **Sync to Calendar** -- adds the event to your booking calendar as an availability block (Available, Blocked, or Tentative)
- **Create Package** -- creates a new session type linked to this event, with availability automatically scoped to the event dates

### Event Submission Form (EVT-29.1.3)

**Navigation:** Events > + Submit Event

A form for submitting community events for review:

| Field | Description |
|-------|-------------|
| Event Name | Required text input |
| Description | Textarea for event details |
| Start Date | Date picker (required) |
| End Date | Date picker |
| Venue | Text input for location |
| Neighborhood | Dropdown with predefined Toronto neighborhoods |
| Category | Dropdown -- Festival, Cultural, Community, Religious, Market |
| Recurrence | Selector -- None, Annual, Monthly, Weekly |
| Website URL | Optional link to event page |

A **live preview card** appears alongside the form, showing how the event will look in the calendar once approved.

Submitted events enter a moderation queue. For the initial release, your own submitted events auto-approve.

### Dashboard Widget (EVT-29.1.4)

**Navigation:** Dashboard (sidebar widget)

A compact card on your main dashboard showing the next 3-5 upcoming events:

- Event name
- Date
- Category badge (color-coded)
- "View All" link to open the full events calendar

**Seed Events:**

The calendar comes pre-populated with major Toronto Black cultural events:

| Event | Typical Timing | Category |
|-------|---------------|----------|
| Toronto Caribbean Carnival (Caribana) | July-August | Festival |
| Afrofest | July | Festival |
| Afro-Carib Fest | Summer | Cultural |
| KUUMBA | February | Cultural |
| Toronto Black Film Festival | February | Cultural |
| Black History Month | February | Community |

**Tip:** Create event-linked session types well in advance of major festivals. When clients search for Caribana photographers, having a dedicated "Caribana Portrait Package" makes you stand out in search results.

---

## Quick Reference

| Task | Navigation |
|------|-----------|
| Enable Interac e-Transfer | Dashboard > Settings > Payments > Interac |
| Send an Interac payment request | Dashboard > Invoices > [Invoice] > Send Interac Request |
| Confirm an e-Transfer receipt | Dashboard > Payments > Interac Requests > [Request] > Confirm |
| Configure HST | Dashboard > Settings > Tax |
| View threshold status | Dashboard > Finances > Tax |
| Add a business expense | Dashboard > Finances > Tax > Expenses > + Add |
| Export ITC summary | Dashboard > Finances > Tax > ITC Summary > Export |
| Edit cultural tags | Dashboard > Settings > Profile > Cultural Specializations |
| Set service area | Dashboard > Settings > Profile > Service Area |
| Browse presets | Dashboard > Presets |
| Create a preset | Dashboard > Presets > + Create New |
| View events calendar | Dashboard > Events |
| Submit a community event | Dashboard > Events > + Submit Event |
| Sync event to calendar | Dashboard > Events > [Event] > Sync to Calendar |
