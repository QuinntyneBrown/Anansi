# Mobile Applications

Anansi provides two mobile experiences: the **Studio Manager Mobile App** for photographers (iOS and Android) and the **Mobile Gallery PWA** for clients. Both are free and designed around the dark luxury theme.

---

## Studio Manager Mobile App

The Studio Manager mobile app puts your business management tools in your pocket. Available on iOS and Android at no extra cost for all registered users.

### Home Dashboard (MOB-18.1.1)

**Navigation:** App launch > Home tab

**Layout (402px width):**

- **Status bar** (62px) -- device status bar at the top
- **Header** -- "Anansi" title on the left, notification bell icon with count badge on the right
- **Revenue metric card** -- a prominent card showing your current month's revenue in Cormorant Garamond at 52px
- **Today's Sessions** -- a section listing upcoming session cards with time, client name, and session type
- **Recent Activity** -- a feed of latest events (new bookings, payments received, messages) with icons and timestamps

**Bottom Pill Tab Bar:**

The app uses a persistent bottom navigation bar with five tabs:

| Tab | Icon | Description |
|-----|------|-------------|
| Home | Home icon (active: gold) | Dashboard overview |
| Calendar | Calendar icon | Session calendar |
| Inbox | Mail icon | Client messages |
| Payments | Dollar icon | Invoices and revenue |
| More | Menu icon | Additional settings and features |

The active tab is highlighted in gold (#C9A962).

**Key interactions:**

- Tap a session card to view session details, client info, and linked documents.
- Tap the notification bell to open the notification center.
- Swipe between sections or scroll vertically through the dashboard.

---

### Calendar (MOB-18.1.2)

**Navigation:** Bottom tab bar > Calendar

**Layout:**

- **Month view** with dot indicators on dates that have sessions booked
- **Selected date** expands to show a session list below the calendar
- **Floating Action Button (+)** in the bottom-right corner for creating a new session

**Key interactions:**

- Tap a date to see its sessions listed below the calendar.
- Tap a session to view its full details.
- Tap the + FAB to create a new session.
- Swipe left/right to navigate between months.

**Tip:** The calendar syncs two-way with Google Calendar. Changes you make on your phone appear on the web dashboard and vice versa.

---

### Inbox (MOB-18.1.3)

**Navigation:** Bottom tab bar > Inbox

**Layout:**

**Conversation List:**

- Each row shows: client avatar, client name, message preview, time, and unread badge (gold dot)
- Conversations are sorted by most recent message

**Thread View (tap a conversation):**

- Message bubbles in a chat-style layout
- Compose bar at the bottom with text input, attachment button, and send button

**Key interactions:**

- Tap a conversation to open the message thread.
- Type and send messages directly from the app.
- Attach files (30+ file types, up to 25MB) using the attachment button.

---

### Payments (MOB-18.1.4)

**Navigation:** Bottom tab bar > Payments

**Layout:**

- **Revenue summary metric** -- current month's total revenue displayed prominently
- **Invoice list** -- scrollable list showing client name, amount, status badge (Paid in green / Pending in gold / Overdue in red), and date
- **+ New Invoice FAB** -- floating action button to create a new invoice

**Key interactions:**

- Tap an invoice to view details, payment history, and send reminders.
- Tap the + FAB to create and send a new invoice directly from your phone.
- Pull down to refresh the list.

---

### Tap to Pay Flow (MOB-18.1.5)

**Navigation:** Payments > Tap to Pay (or via quick action)

Accept contactless in-person payments using your phone's NFC capability. The flow consists of five sequential screens:

**Screen 1 -- Ready to Tap:**

- Large amount display showing what the client owes
- "Ready to tap" text with an animated NFC icon indicating the phone is ready to receive a contactless card or device
- Hold the client's card or phone near yours to process

**Screen 2 -- Processing:**

- Processing spinner/indicator while the payment is authorized
- Brief screen -- typically 1-3 seconds

**Screen 3 -- Tip Selection:**

- Tip options: 5%, 10%, 15%, and a "Custom" option
- Each option shows the calculated tip amount and new total
- "No Tip" option to skip
- Client taps their preferred tip amount

**Screen 4 -- QR Code Fallback:**

- If the NFC tap fails or the client's card does not support contactless, a QR code is displayed
- The client scans the QR code with their phone to complete payment via a web link

**Screen 5 -- Success Confirmation:**

- Large green (#6E9E6E) check circle icon
- "Payment Successful" heading
- Amount paid and payment method displayed
- "Send Receipt" button to email a receipt to the client
- "Done" button to return to the Payments screen

**Tip:** Tap to Pay works with contactless credit cards, debit cards, Apple Pay, and Google Pay. Make sure NFC is enabled in your phone's settings.

---

### More Menu (MOB-18.1.6)

**Navigation:** Bottom tab bar > More

A full-screen list of additional features:

| Item | Description |
|------|-------------|
| Documents | Access contracts, questionnaires, and quotes |
| Reports | View financial reports and revenue charts |
| Settings | Account settings, branding, integrations |
| Integrations | Connect Google Calendar, Zoom, Stripe, PayPal |
| Help | Support articles and contact |
| Log Out | Sign out of the app |

Each item shows an icon on the left, label in the center, and a chevron-right (Lucide `chevron-right`) on the right.

---

## Mobile Gallery PWA

The Mobile Gallery is a Progressive Web App (PWA) that gives your clients an app-like experience for viewing their photos. Clients can add it to their home screen for instant access.

### Gallery Cover (MOB-18.2.1)

**Navigation:** Client opens their gallery link on a mobile device

**Layout:** A full-screen cover experience:

- **Full-screen cover image** -- the collection's cover photo fills the entire viewport
- **Gradient overlay** -- a dark gradient from bottom to top ensures text readability
- **Photographer logo** -- your logo overlaid on the image
- **Collection title** -- displayed in Cormorant Garamond in large text
- **Scroll indicator** -- a down chevron icon (Lucide `chevron-down`) at the bottom, animated to bounce gently, inviting the client to scroll down to the photo grid

**Key interactions:**

- Scroll down (or tap the chevron) to enter the photo grid.
- The cover auto-selects the collection's designated cover photo.

**Tip:** Choose a striking cover photo for each collection. This is the first thing your client sees, and it sets the tone for the entire gallery experience.

---

### Photo Grid (MOB-18.2.2)

**Navigation:** Scroll past the gallery cover

**Layout:**

- **Top bar (56px)** -- collection title on the left, favorite list icon (Lucide `heart`) and share icon (Lucide `share`) on the right
- **Photo grid** -- 2-column masonry layout with 8px gap between images. Photos are displayed at their natural aspect ratios, creating an organic, Pinterest-style grid.
- **Bottom bar (56px)** -- photographer branding bar with your name/logo and a contact CTA button

**Key interactions:**

- Tap any photo to open it in the mobile lightbox.
- Tap the heart icon in the top bar to view or manage favorite lists.
- Tap the share icon to share the gallery via link, social media, or QR code.
- Tap the contact CTA in the bottom bar to reach the photographer (email, phone, or booking link).

---

### Mobile Lightbox (MOB-18.2.3)

**Navigation:** Tap any photo in the grid

**Layout:** A full-screen image viewer on a black background:

- **Image display** -- 362x500px image area with 8px border radius, centered on the black background
- **Image counter** -- e.g., "12 / 48" showing current position in the collection
- **Bottom action bar** -- a row of icon buttons:

| Icon | Action |
|------|--------|
| Heart (Lucide `heart`) | Add to / remove from favorites |
| Message (Lucide `message-circle`) | Add a comment or edit request |
| Share (Lucide `share`) | Share this specific photo |
| Download (Lucide `download`) | Download this photo (if permitted) |

**Key interactions:**

- **Swipe left/right** to navigate between photos.
- **Pinch to zoom** for close-up inspection.
- **Swipe down** to close the lightbox and return to the grid.
- Tap the heart to favorite/unfavorite. A brief animation confirms the action.
- Tap download to save the image at the permitted resolution.

**Tip:** Clients can create multiple favorite lists and add comments to specific images. This is a great tool for proofing -- ask clients to favorite their selections and leave edit notes directly on each image.

---

### Add to Home Screen (MOB-18.2.4)

**Navigation:** Automatic prompt on first visit (or via browser menu)

A bottom sheet modal prompts the client to install the gallery as a PWA:

- **App icon preview** -- uses the client's favorite photo or the collection cover as the app icon
- **"Add to Home Screen"** heading
- **Instructions** -- device-specific text explaining how to add (iOS and Android have different steps)
- **"Add" button** -- gold primary button to trigger the install prompt
- **"Not now"** -- dismiss link to close the prompt

Once installed, the gallery opens like a native app from the home screen -- no browser chrome, instant loading, with your branding throughout.

---

## Mobile Responsiveness

Beyond the dedicated mobile apps, all Anansi client-facing experiences are fully responsive:

- **Client galleries** adapt to any screen size with optimized grid layouts.
- **Websites** built in the Flex Editor support per-breakpoint customization (desktop, tablet, mobile).
- **Store browsing and checkout** are optimized for mobile with touch-friendly controls, stacked layouts, and simplified navigation.

---

## Quick Reference

| Task | Where |
|------|-------|
| Download Studio Manager app | iOS App Store or Google Play Store |
| Accept in-person payment | App > Payments > Tap to Pay |
| Check today's sessions | App > Home > Today's Sessions |
| Reply to a client | App > Inbox > [Conversation] |
| Create an invoice on the go | App > Payments > + New Invoice |
| Share a gallery PWA link | Dashboard > Galleries > [Collection] > Share |
| Customize gallery cover | Dashboard > Galleries > [Collection] > Design |
