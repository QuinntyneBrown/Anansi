# 3. Client Galleries

Client Galleries are the core photo and video delivery system. This section covers everything from uploading and organizing your work (the photographer's admin view) to the experience your clients see when they browse, favorite, and download their images.

---

## Gallery Admin

The Gallery Admin screens are the photographer-facing management interface. You access them from the top-level navigation or from the sidebar after entering the Gallery section.

### Collection List

**Design ID:** GAL-14.1.1
**Navigation path:** Top navigation > Galleries (or dashboard quick link)

The Collection List is the home screen of your gallery management. It displays all your collections in a searchable, filterable grid or list.

**Top bar:**

| Element | Position | Description |
|---------|----------|-------------|
| Search field | Left | Text input with Lucide `search` icon, placeholder "Search collections...", filters by title |
| Star filter | Center-left | Toggle to show only starred collections |
| Status tabs | Center | Horizontal tabs: **All**, **Published**, **Draft**, **Hidden**, **Expired** |
| + New Collection button | Right | Gold primary button (`#C9A962`) |

The active status tab has a `#C9A962` gold underline. The collection statuses map to these meanings:

| Status | Meaning |
|--------|---------|
| Draft | Created but not yet shared with clients |
| Published | Live and accessible to clients |
| Hidden | Manually hidden or expired |
| Expired | Past the expiration date (auto-hidden) |

**Collection cards:**

Each collection displays as a card (`#242426` surface, 20px radius, 1px `#3A3A3C` border) showing:

- **Cover thumbnail** -- The collection's cover photo scaled to fit the card, 16:9 aspect ratio at the top
- **Title** -- Inter 14px semibold, `#F5F5F0`, below the thumbnail
- **Meta info** -- Inter 12px, `#A0A0A3`: media count (e.g., "124 photos, 2 videos"), set count, date created
- **Star icon** -- Lucide `star` in the top-right corner of the thumbnail. Filled gold (`#C9A962`) if starred, outline if not. Click to toggle.
- **Status badge** -- Pill badge in the bottom-right of the thumbnail overlay

Cards are arranged in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile) with 16px gaps.

> **Tip:** Star your active client collections for quick access. Use the star filter to see only current work and hide completed galleries from your daily view.

### Collection Upload

**Design ID:** GAL-14.1.2
**Navigation path:** Galleries > [select a collection] > Upload (or + New Collection > Upload step)

The upload screen provides a drag-and-drop interface for adding photos and videos to a collection.

**Upload area:**

A large dashed-border rectangle (`#3A3A3C` dashed border, 24px radius) centered on the screen:

- **Icon** -- Lucide `upload-cloud` at 48px, `#C9A962` gold, centered
- **Primary text** -- "Drag and drop files here" in Inter 16px, `#F5F5F0`
- **Secondary text** -- "or click to browse" in Inter 14px, `#A0A0A3`
- **Supported formats** -- "JPEG, PNG, GIF, RAW (CR2, CR3, NEF, ARW, DNG, RAF, ORF, RW2), MP4, MOV" in Inter 12px, `#666`

When files are dropped (or selected via the file browser), the upload area transitions to a progress view:

**Progress bars:**

Each file displays as a row:

| Element | Description |
|---------|-------------|
| File thumbnail | Small preview (40px square) on the left |
| File name | Inter 13px, `#F5F5F0` |
| File size | Inter 12px, `#A0A0A3` |
| Progress bar | Horizontal bar, `#3A3A3C` background, `#C9A962` gold fill, rounded ends |
| Percentage | Inter 12px, `#A0A0A3`, right of the bar |
| Status | Lucide `check-circle` in `#6E9E6E` green on completion, or `alert-circle` in red on failure with a "Retry" link |

Multiple files upload simultaneously with parallel upload streams. Failed uploads show an error message and a retry button without requiring you to re-select successful files.

**Bulk folder upload:**

Dragging an entire folder creates a collection with the folder name. Sub-folders become sets within the collection, preserving the nested structure. Empty folders are ignored.

**Supported file types and limits:**

| Type | Formats | Max Size |
|------|---------|----------|
| Photos | JPEG, PNG, GIF | 50 MB per file |
| RAW | CR2, CR3, NEF, ARW, DNG, RAF, ORF, RW2 | Plan-dependent (Pro/Ultimate) |
| Video | MP4, MOV, AVI, M4V | Up to 4K resolution, duration by plan |

> **Note:** RAW file support requires a Pro or Ultimate gallery plan. RAW files are processed for preview thumbnails, and originals are available for download, but they cannot be used for print fulfillment.

### Collection Settings

**Navigation path:** Galleries > [select a collection] > Settings

After uploading, configure your collection's behavior through the settings panel. Settings are organized into sections:

**Privacy settings:**
- Password protection toggle and password field
- Client Exclusive Access toggle and separate password
- Email registration gate toggle
- Collection expiration date picker with reminder configuration

**Design settings:**
- Cover style selector (7 styles: Reef, West, Oakwood, Edge, Harbor, Summit, Cascade)
- Theme toggle (Light / Dark)
- Font family selector (6+ curated options)
- Color palette selector (9+ options, custom hex on paid plans)
- Grid layout toggle (Vertical / Horizontal)

**Download settings:**
- Downloads enabled toggle
- Download PIN toggle and 4-digit PIN field
- Download limit field
- Allowed resolutions checkboxes (Web 640px, Web 1024px, Web 2048px, High 3600px, Original)

**Store settings:**
- Price sheet assignment
- Store enabled toggle

**Language:**
- Dropdown selector: English, Spanish, French, German, Dutch, Chinese (Simplified), Portuguese, Swedish

> **Tip:** Save your preferred configuration as a **Collection Preset** so you can apply the same settings to future collections with one click. Presets store cover style, theme, fonts, colors, layout, download settings, privacy settings, and language.

---

## Client Gallery Experience

These screens describe what your clients see when they visit a gallery link. The client-facing gallery has its own distinct visual treatment separate from the photographer admin.

### Gallery Homepage

**Design ID:** GAL-14.2.1
**Navigation path:** Client visits your gallery URL (e.g., `yourstudio.anansi.com` or custom domain)

The Gallery Homepage is the landing page clients see when they navigate to your gallery root URL. It lists all published collections.

**Desktop layout (1440px):**

| Zone | Height | Description |
|------|--------|-------------|
| Header | 80px | Your logo (left), navigation links (center), and a search icon (right). Background: `#1A1A1C`. Logo rendered as a white version on the dark background. |
| Collection grid | Variable | Responsive grid of collection cover thumbnails. Each cover shows the collection title overlaid at the bottom with a gradient fade. Grid uses 24px gaps. |
| Footer | 60px | "Powered by Anansi" branding (removable on paid plans), social links, and copyright text. Background: `#1A1A1C`. |

**Mobile layout (402px):**

| Zone | Height | Description |
|------|--------|-------------|
| Header | 60px | Condensed with logo centered and a hamburger menu icon on the left |
| Collection grid | Variable | Single-column stack, each collection cover is full-width |
| Footer | 60px | Same content, stacked vertically |

If the homepage has password protection enabled (GAL-1.6.3), visitors see the password entry screen before any collections are visible.

### Collection Cover Page

**Design ID:** GAL-14.2.2
**Navigation path:** Client clicks a collection from the Gallery Homepage

The cover page is the dramatic first impression for each collection. It uses a full-screen image that fills the entire browser viewport.

**Layout:**

- **Background** -- The cover photo fills 100% width and 100% height of the viewport. The photo's focal point can be adjusted by the photographer.
- **Gradient overlay** -- A gradient from transparent (top ~40%) to semi-opaque black (bottom ~60%) ensures text readability.
- **Photographer name/logo** -- Positioned top-center, white, Cormorant Garamond 20px.
- **Collection title** -- Large display text centered vertically in the lower third. Cormorant Garamond 48px (desktop) / 32px (mobile), white, with optional subtitle/description below in Inter 16px.
- **Scroll indicator** -- A Lucide `chevron-down` icon at the bottom-center, animated with a gentle bounce, indicating the client should scroll down to see the photos.

The cover style selected by the photographer (Reef, West, Oakwood, Edge, Harbor, Summit, Cascade) determines the specific arrangement, typography treatment, and overlay pattern. All 7 styles use the full-screen cover photo as a base.

**Video covers:** If the photographer set a YouTube or Vimeo URL, the video plays as a looping, muted background instead of a static image.

### Photo Grid

**Design ID:** GAL-14.2.3
**Navigation path:** Client scrolls past the cover page (or navigates directly to the grid view)

The photo grid displays all images in the collection organized by sets.

**Light theme (`#F5F5F0` background):**

| Element | Style |
|---------|-------|
| Page background | `#F5F5F0` (warm off-white) |
| Set title | Cormorant Garamond 24px, `#1A1A1C` dark text |
| Set description | Inter 14px, `#4A4A4A` |
| Photo thumbnails | 12px gap between images, 32px padding from page edges |
| Grid behavior | Masonry-style vertical or horizontal layout depending on collection setting |

**Dark theme (`#1A1A1C` background):**

| Element | Style |
|---------|-------|
| Page background | `#1A1A1C` (dark charcoal) |
| Set title | Cormorant Garamond 24px, `#F5F5F0` white text |
| Set description | Inter 14px, `#A0A0A3` |
| Photo thumbnails | 12px gap, 32px padding |
| Grid behavior | Same masonry layout, adapted for dark surfaces |

**Theme toggle:** A small toggle icon in the gallery header allows clients to switch between light and dark themes. The photographer's chosen default applies on first load, but clients can override it for their session.

**Grid layout modes:**

| Mode | Behavior |
|------|----------|
| Vertical | Column-based masonry. Images maintain their original aspect ratio. Columns fill vertically, creating an organic, Pinterest-like layout. Emphasizes portrait images. |
| Horizontal | Row-based justified layout. Images are arranged in rows with consistent row heights. Landscape images are emphasized. |

### Image Lightbox

**Design ID:** GAL-14.2.4
**Navigation path:** Client clicks any photo in the grid

Clicking a photo in the grid opens the image in a full-screen lightbox overlay.

**Overlay:**

- **Background** -- Semi-transparent dark overlay (`rgba(0, 0, 0, 0.85)`) covering the entire viewport
- **Image** -- Centered, constrained to a maximum of 800px wide by 540px tall (on desktop), maintaining aspect ratio. The image is rendered at high quality.
- **Close button** -- Lucide `x` icon at the top-right corner, `#F5F5F0` white, 24px

**Navigation arrows:**

- **Previous** -- Lucide `chevron-left`, positioned vertically centered on the left side of the viewport
- **Next** -- Lucide `chevron-right`, positioned vertically centered on the right side
- Arrows use `#F5F5F0` white, 32px, with a subtle circular background on hover
- **Keyboard support:** Left/Right arrow keys navigate between images. Escape key closes the lightbox.

**Bottom action bar:**

A horizontal bar fixed to the bottom of the lightbox overlay, centered:

| Button | Icon | Action |
|--------|------|--------|
| Favorite | Lucide `heart` | Add/remove from the active favorite list. Filled `#C9A962` gold when favorited, outline when not. |
| Download | Lucide `download` | Initiates download of the current image (subject to PIN and resolution settings). |
| Share | Lucide `share-2` | Opens a share dialog with options: Facebook, Instagram, Pinterest, WhatsApp, Messenger, Threads, Email, Copy Link. |

Buttons are spaced with 24px gaps, each rendered as 40px circular touch targets with `#F5F5F0` icons.

**Image metadata (optional):**

If the photo contains EXIF data, a small info button (Lucide `info`) shows camera details on tap: camera make/model, lens, focal length, aperture, shutter speed, ISO.

### Favorite List Panel

**Design ID:** GAL-14.2.5
**Navigation path:** Client taps the favorites icon in the gallery header or the heart icon in the lightbox

The Favorite List Panel slides in from the right side of the screen (360px wide on desktop).

**Panel contents:**

- **Header** -- "My Favorites" in Inter 16px semibold, with a close button (Lucide `x`)
- **List selector** -- If multiple favorite lists exist, a dropdown lets the client switch between lists. A "+ New List" button creates a new named list.
- **Favorited photos** -- A vertical grid of thumbnail images (80px squares, 8px gap) showing all photos in the current favorite list
- **Count** -- "12 of 50 selected" (if a favorite limit is set by the photographer)
- **Actions at bottom:**
  - **Share List** -- Generates a unique URL for the favorite list
  - **Download All** -- Downloads all favorited images as a ZIP (subject to PIN and limits)
  - **Send to Email** -- Opens a dialog to email the favorite list to any address

Each thumbnail has a small `x` button on hover/tap to remove it from the list. Clients can also add comments to individual favorited photos by tapping a comment icon on each thumbnail.

> **Tip (for photographers):** Configure preset favorite list categories before publishing a collection. For example, create "Album Picks" and "Social Media Favorites" lists so clients know exactly how to organize their selections.

### Password Entry

**Design ID:** GAL-14.2.6
**Navigation path:** Client visits a password-protected collection

If a collection has password protection enabled, this screen appears before any content is shown.

**Layout:**

A centered card (400px wide) on the `#1A1A1C` background:

- **Lock icon** -- Lucide `lock` at 40px, `#C9A962` gold, centered at top
- **Heading** -- "Enter Password" in Inter 18px semibold, `#F5F5F0`
- **Instructions** -- "This gallery is password protected. Please enter the password to continue." in Inter 14px, `#A0A0A3`
- **Password field** -- Full-width input with show/hide toggle
- **Submit button** -- Full-width gold primary button, "View Gallery"
- **Error state** -- If the password is incorrect, the field border turns red and a message appears: "Incorrect password. Please try again." in Inter 13px, red text

The card uses `#242426` surface, 20px radius, 32px padding.

**Client Exclusive Access:** If the photographer has set a separate client-exclusive password, entering it unlocks additional sets that are hidden from regular password holders. The client sees more content without any visible indication that other viewers see less.

### Mobile Photo Grid

**Design ID:** GAL-14.2.7
**Navigation path:** Client views the gallery on a mobile device (402px viewport)

The mobile gallery experience adapts the desktop grid for touch interaction.

**Key differences from desktop:**

| Aspect | Desktop | Mobile (402px) |
|--------|---------|----------------|
| Grid gap | 12px | 8px |
| Page padding | 32px | 16px |
| Grid columns | 3-4 columns (masonry) | 2 columns |
| Image interaction | Click to lightbox | Tap to lightbox with swipe navigation |
| Lightbox navigation | Arrow buttons + keyboard | Swipe left/right + pinch to zoom |

**Bottom action bar (mobile lightbox):**

On mobile, the lightbox action bar is redesigned for thumb accessibility:

- Positioned at the bottom of the screen, full-width
- Background: `#242426` with 80% opacity
- Buttons: Favorite (heart), Download, Share -- evenly spaced, 48px touch targets
- Swipe up on the action bar reveals additional options

**Pinch to zoom:** Clients can pinch-to-zoom on any image in the mobile lightbox for a closer look. Double-tap resets the zoom level.

> **Tip (for photographers):** Always preview your gallery on a mobile device before sending it to clients. The majority of initial gallery views happen on phones. Use the theme toggle to check both light and dark themes on mobile.

---

## Sharing and Invitations

Once a collection is published, you have several ways to share it with clients:

| Method | Description |
|--------|-------------|
| **Email invitation** | Send a branded email with your logo, header image, and a direct link to the collection. Optionally include the password and download PIN. |
| **Direct link** | Copy the collection URL and share via any channel. |
| **Quick Share** | Select specific photos and generate a unique link showing only those images. Useful for vendor previews or sneak peeks. |
| **QR code** | Generate a downloadable QR code (PNG) that links to the collection. Great for in-person events and printed materials. |
| **Social sharing** | Clients can share from within the gallery to Facebook, Instagram, Pinterest, WhatsApp, Messenger, Threads, or via email. |
| **Embed code** | Get an iframe or JavaScript snippet to display the gallery on any external website. |

> **Tip:** For wedding clients, send the gallery via email invitation with a personalized subject line and message. Include the password in the email so they can jump straight in. Use Quick Share to give a separate link to the wedding planner or vendors with just the ceremony shots.

---

## Gallery Activity and Analytics

**Navigation path:** Galleries > [select a collection] > Activity

Each collection has an Activity tab that tracks:

| Activity Type | Data Captured |
|--------------|---------------|
| Downloads | Who downloaded, when, what resolution, individual or full gallery |
| Favorites | Who favorited which photos, which list, comments added |
| Private photos | Which photos marked private, by whom |
| Email registrations | Name and email of visitors who registered |
| Views | General view activity |

Activity data is filterable by type and date range. A CSV export is available for all activity data.

If you connect Google Analytics (GA4), gallery visitor metrics (page views, geography, session duration) are also tracked.

---

## Summary

The Client Gallery system spans two distinct experiences:

**Photographer admin screens:**

| Screen | Design ID | Purpose |
|--------|-----------|---------|
| Collection List | GAL-14.1.1 | Browse, search, filter, and star collections |
| Collection Upload | GAL-14.1.2 | Drag-and-drop file upload with progress tracking |
| Collection Settings | GAL-14.1.3 | Configure privacy, design, downloads, store, and language |

**Client-facing screens:**

| Screen | Design ID | Purpose |
|--------|-----------|---------|
| Gallery Homepage | GAL-14.2.1 | Collection listing with photographer branding |
| Collection Cover Page | GAL-14.2.2 | Full-screen cover with gradient overlay |
| Photo Grid | GAL-14.2.3 | Masonry image grid with light/dark themes |
| Image Lightbox | GAL-14.2.4 | Full-screen image viewer with favorites, download, share |
| Favorite List Panel | GAL-14.2.5 | Slide-out panel for managing favorite selections |
| Password Entry | GAL-14.2.6 | Centered card for password-protected collections |
| Mobile Photo Grid | GAL-14.2.7 | Touch-optimized grid with swipe and pinch-to-zoom |

For the next section, continue to the Online Store guide to learn about selling prints and digital downloads directly from your galleries.
