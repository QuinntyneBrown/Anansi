# Design System Reference

This reference documents the visual foundation, design tokens, and component library that power every screen in Anansi. The design system uses an Elegant Luxury dark theme, providing a premium backdrop that lets photography take center stage.

---

## Color Palette

### Core Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#1A1A1C` | Page and app background -- the darkest surface |
| Card Surface | `#242426` | Card backgrounds, panels, modals, and elevated surfaces |
| Gold Accent | `#C9A962` | Primary actions, selected states, prices, highlights, and branding |
| Text Primary | `#F5F5F0` | Warm off-white for body text and headings |
| Success Green | `#6E9E6E` | Sage green for success states, confirmations, and positive indicators |

### Supporting Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Border | `#3A3A3C` | Subtle 1px border strokes for cards, inputs, and dividers |
| Error Red | (contextual) | Destructive actions, error states, overdue badges |
| Warning Gold | `#C9A962` | Warning alerts (shares the gold accent) |
| Info Blue | (contextual) | Informational toasts and indicators |

### Design Principles

- **Zero shadows.** Elevation is communicated through surface color changes (#1A1A1C to #242426), not drop shadows.
- **Subtle borders.** A 1px stroke in #3A3A3C provides just enough definition without visual weight.
- **Gold as the accent color.** Used sparingly for primary actions, selections, and pricing. Overuse diminishes its premium feel.

---

## Typography

### Font Families

| Font | Role | Usage |
|------|------|-------|
| **Cormorant Garamond** | Display / Titles | Headings, hero text, prices, photographer names, confirmation messages. The serif character gives a refined, editorial quality. |
| **Inter** | Body / UI | Paragraphs, labels, buttons, form inputs, table text, navigation. Clean and highly legible at all sizes. |

### Type Scale

| Context | Font | Size | Weight | Example Usage |
|---------|------|------|--------|---------------|
| Hero heading | Cormorant Garamond | 52px | 600 | Revenue metric on mobile dashboard |
| Page heading | Cormorant Garamond | 42px | 600 | "Booking Confirmed!", photographer name on booking page, directory hero |
| Price display | Cormorant Garamond | 36px | 600 | Product price on store detail page |
| Section heading | Cormorant Garamond | 28px | 600 | Blog post title in editor |
| Subsection | Cormorant Garamond | 24px | 600 | Session price on booking cards |
| Body large | Inter | 16px | 400 | Primary body text, descriptions |
| Body regular | Inter | 14px | 400 | Table text, form labels, secondary text |
| Caption | Inter | 12px | 400 | Timestamps, helper text, badges |
| Button | Inter | 14-16px | 500 | Button labels |

---

## Spacing Scale

A consistent spacing scale based on 4px increments:

| Token | Value | Common Usage |
|-------|-------|-------------|
| xs | 4px | Tight gaps (icon-to-label, badge padding) |
| sm | 8px | Grid gaps (photo grid), compact spacing |
| md | 12px | Input padding, small card gaps |
| base | 16px | Standard padding, section gaps |
| lg | 20px | Mobile card gaps, larger section spacing |
| xl | 24px | Card padding, panel gutters |
| 2xl | 28px | Major section dividers |
| 3xl | 32px | Desktop card gaps (booking landing) |
| 4xl | 40px | Large section padding, page-level spacing |

### Layout-Specific Spacing

| Context | Value |
|---------|-------|
| Booking landing horizontal padding (desktop) | 120px |
| Booking session card gap (desktop) | 32px |
| Booking session card gap (mobile) | 20px |
| Photo grid gap | 8px |
| Calendar day cell size | 40x40px |

---

## Corner Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| sm | 12px | Small elements, badges, chips |
| md | 16px | Buttons, input fields |
| lg | 18px | Cards, dialogs |
| xl | 20px | Profile cards, content cards |
| 2xl | 22px | Large cards, panels |
| 3xl | 24px | Modals, overlays |
| 4xl | 26px | Feature cards |
| full | 34px | Pill buttons, tab bars, rounded containers |

### Special Radius Values

| Element | Radius |
|---------|--------|
| Mobile lightbox image | 8px |
| Profile images | 50% (fully circular) |
| Bottom pill tab bar | 34px |

---

## Component Catalog

### Buttons

Five button variants, each available in multiple sizes:

| Variant | Background | Text Color | Border | Usage |
|---------|-----------|------------|--------|-------|
| **Primary** | `#C9A962` (gold) | `#1A1A1C` (dark) | None | Main calls to action -- "Book Now", "Add to Cart", "Publish", "Save" |
| **Secondary** | `#242426` (card surface) | `#F5F5F0` (text) | 1px `#3A3A3C` | Secondary actions -- "Cancel", "Back", "Save Draft" |
| **Outline** | Transparent | `#F5F5F0` (text) | 1px `#3A3A3C` | Tertiary actions -- "Preview", "Learn More" |
| **Ghost** | Transparent | `#F5F5F0` (text) | None | Subtle actions -- icon buttons, inline links, "Not now" |
| **Destructive** | Red variant | White | None | Dangerous actions -- "Delete", "Remove", "Cancel Booking" |

**Sizes:** Small (32px height), Medium (40px height), Large (48px height).

All buttons use Inter font at 14-16px with 500 weight.

### Form Inputs

| Input Type | Description |
|-----------|-------------|
| **Text Input** | Single-line text field with 1px #3A3A3C border, 12px padding, #242426 background |
| **Textarea** | Multi-line text area with the same styling as text inputs |
| **Select / Dropdown** | Styled dropdown with chevron-down icon, same border treatment |
| **Checkbox** | Square checkbox. Checked state uses gold fill with a white check icon |
| **Radio** | Circular radio button. Selected state uses gold fill |
| **Toggle** | Horizontal slider toggle. Active state uses gold track |
| **Date Picker** | Calendar grid popup with month navigation. Selected date uses gold background |

All inputs use Inter font. Labels appear above the input in 14px weight 500. Helper text appears below in 12px. Error text appears below in red.

### Cards

| Card Type | Description |
|-----------|-------------|
| **Metric Card** | Displays a key number (Cormorant Garamond, large) with a label below. Used for revenue, tax thresholds, SEO metrics. |
| **Content Card** | General-purpose card with optional image, title, description, and actions. #242426 surface, 20px radius. |
| **List Item Card** | Compact horizontal card for lists (invoices, sessions, conversations). Contains an icon/avatar, title, subtitle, and right-aligned metadata. |

All cards use #242426 background on #1A1A1C page background. 1px #3A3A3C border. No shadows.

### Navigation

| Component | Description |
|-----------|-------------|
| **Sidebar** | Vertical navigation panel on desktop (240-280px width). Menu items with icons and labels. Active item highlighted with gold accent. |
| **Top Bar** | Horizontal bar across the top of pages. Contains page title, action buttons, and navigation breadcrumbs. |
| **Breadcrumbs** | Text path showing navigation hierarchy (e.g., "Store / Products / Canvas Print"). Separator is a forward slash or chevron. |
| **Tabs** | Horizontal tab bar for filtering content. Active tab uses gold text and underline. Used for product catalog filters, status filters, category filters. |
| **Pill Tab Bar** | Mobile-only bottom navigation. Rounded pill shape (34px radius). Active tab icon in gold. Used in Studio Manager mobile app. |

### Data Display

| Component | Description |
|-----------|-------------|
| **Table** | Data table with #242426 row backgrounds, 1px #3A3A3C borders between rows. Header row in slightly lighter shade. Sortable columns indicated by chevron icons. |
| **List** | Vertical list of items. Each item is a list item card or a simple row with dividers. |
| **Badge** | Small colored label for status indicators. Variants: gold (pending/active), green (success/paid), red (error/overdue), gray (inactive/expired). Rounded corners (12px). |
| **Status Indicator** | Dot or pill showing current state. Uses the same color variants as badges. |
| **Avatar** | Circular image for profile photos. Sizes: 32px (compact), 48px (standard), 80px (large), 120px (hero). |

### Feedback

| Component | Description |
|-----------|-------------|
| **Alert Banner** | Full-width bar at the top of a page or section. Variants: gold (warning), red (critical), green (success), blue (info). Dismissible with an X button. |
| **Toast** | Temporary notification that appears in the top-right (desktop) or top-center (mobile). Has a colored left bar: green (success), red (error), gold (warning), blue (info). Contains icon, title, message, and close button. Auto-dismisses after a few seconds. |
| **Progress Bar** | Horizontal bar showing completion. Fill color is gold. Used for upload progress, threshold tracking. |
| **Loading Spinner** | Circular animation in gold. Inline size (16px) for buttons, standard size (32px) for sections, page size (64px) for full-page loading. |
| **Empty State** | Illustration or icon, heading, description, and CTA button. Used when no data is available (no collections, no contacts, no invoices, etc.). Each context has a unique icon and actionable CTA. |

### Overlays

| Component | Description |
|-----------|-------------|
| **Modal / Dialog** | Centered card overlay on a dark semi-transparent backdrop. Contains a title, content area, and action buttons. Destructive variant uses a warning icon and red confirm button. |
| **Dropdown** | Floating menu anchored to a trigger element. List of options with hover highlighting. |
| **Tooltip** | Small floating text box that appears on hover. Dark background with light text. Positioned above, below, left, or right of the trigger. |
| **Popover** | Larger floating panel with richer content than a tooltip. Triggered by click rather than hover. |

### Mobile Navigation

| Component | Description |
|-----------|-------------|
| **Bottom Pill Tab Bar** | 5-tab navigation fixed to the bottom of the screen. Tabs: Home, Calendar, Inbox, Payments, More. Active tab icon is gold. Bar has 34px radius and sits on #242426 surface. |
| **Status Bar** | 62px device status bar area at the top of mobile screens. |
| **Top Bar (Mobile)** | 56px navigation bar with back arrow, page title, and action icons. Used in gallery PWA and mobile screens. |
| **Bottom Action Bar** | 56px bar at the bottom of mobile lightbox and gallery screens. Contains action icons (heart, share, download). |

---

## Icon Library

Anansi uses **Lucide Angular** as its icon set. Lucide provides clean, consistent 24px line icons that complement the luxury aesthetic.

### Key Icons by Feature Area

**Navigation & Actions:**

| Icon Name | Usage |
|-----------|-------|
| `home` | Home tab, dashboard |
| `calendar` | Calendar tab, date-related features |
| `mail` | Inbox tab, email |
| `dollar-sign` | Payments tab, financial features |
| `menu` | More menu, hamburger toggle |
| `bell` | Notification center |
| `search` | Search bars, directory search |
| `plus` | Add/create actions, quantity increment |
| `minus` | Quantity decrement |
| `x` | Close, dismiss, remove |
| `check` | Confirm, success states |
| `chevron-down` | Dropdowns, scroll indicators, gallery cover |
| `chevron-right` | List navigation, "more" indicators |
| `chevron-left` | Back navigation |

**Gallery & Media:**

| Icon Name | Usage |
|-----------|-------|
| `heart` | Favorite/unfavorite photos and presets |
| `share` | Share gallery, photo, or link |
| `download` | Download photo or file |
| `message-circle` | Comments on photos |
| `image` | Image elements, featured image upload |
| `play` | Video playback, video elements |
| `layers` | Slider/carousel elements |
| `grid-3x3` | Grid layout elements |
| `columns-3` | Column layout elements |
| `upload` | File upload areas |

**Business & Store:**

| Icon Name | Usage |
|-----------|-------|
| `clock` | Session duration display |
| `shopping-cart` | Store cart with count badge |
| `tag` | Coupon codes, cultural tags |
| `credit-card` | Payment methods |
| `file-text` | Contracts, invoices, documents |
| `users` | Contacts, client management |
| `bar-chart` | Reports, analytics |
| `settings` | Settings pages |
| `nfc` | Tap to Pay NFC indication |

**Formatting (Blog Editor):**

| Icon Name | Usage |
|-----------|-------|
| `bold` | Bold text formatting |
| `italic` | Italic text formatting |
| `underline` | Underline text formatting |
| `heading` | Heading level selection |
| `list` | Bullet/numbered list |
| `link` | Insert hyperlink |

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | 402px | Studio Manager mobile app, Gallery PWA |
| Tablet | 768px | Tablet preview in Flex Editor, responsive layouts |
| Desktop | 1440px | Full desktop layouts, Flex Editor default |

The Flex Editor supports independent customization at each breakpoint. Gallery grids switch from multi-column to 2-column (mobile). Sidebars collapse into tab bars or bottom sheets on mobile.

---

## Panel & Layout Dimensions

Common panel widths used across the application:

| Panel | Width | Context |
|-------|-------|---------|
| Sidebar navigation | 240-280px | Dashboard sidebar, Flex Editor left panel |
| Right properties panel | 300px | Flex Editor element properties |
| Blog sidebar | 320px | Blog editor metadata panel |
| Time slot column | 340px | Booking date/time selection |
| Booking summary | 380px | Booking payment step sidebar |
| Events sidebar | 380px | Events calendar upcoming events |
| Create preset panel | 400px | Skin tone preset creation form |
| Service area card | 400px | Neighborhood configuration |
| Product info panel | 440px | Store product detail right panel |
| Product editor panel | 460px | Store product editor image/pricing |
| Auth card | 480px | Sign up / sign in centered card |
| Confirmation card | 500px | Booking confirmation details |
| Interac instructions | 500px | Client payment instructions card |

---

## Design Tokens Summary

A consolidated reference of all design tokens:

```
Colors:
  background:       #1A1A1C
  card-surface:     #242426
  gold-accent:      #C9A962
  text-primary:     #F5F5F0
  success-green:    #6E9E6E
  border:           #3A3A3C

Typography:
  display-font:     Cormorant Garamond
  body-font:        Inter

Spacing:
  4  | 8  | 12 | 16 | 20 | 24 | 28 | 40  (px)

Corner Radius:
  12 | 16 | 18 | 20 | 22 | 24 | 26 | 34  (px)

Border:
  width: 1px
  style: solid
  color: #3A3A3C

Shadows:
  none (elevation via surface color only)
```
