# Website Builder

Create a professional photography website with drag-and-drop editing, responsive previews, a full blogging platform, and built-in SEO tools. No coding required -- though Pro plan users can inject custom code when needed.

---

## Template Gallery (WEB-16.1.1)

**Navigation:** Dashboard > Website > Templates

**Layout:** A grid of template preview cards organized by category. Each card shows a 240px tall preview image of the template design.

**Category Tabs:**

| Tab | Description |
|-----|-------------|
| All | Every available template |
| Business | Brand-focused layouts emphasizing services, about, and contact |
| Portfolio | Work-focused layouts prioritizing image grids and galleries |
| One-Page | Single-page designs with all content on one scrollable page |

**Template Card Elements:**

- **Preview image** (240px height) -- screenshot of the template's homepage
- **Template name** -- displayed below the preview
- **Preview button** -- opens a full interactive preview of the template in a new view
- **Select button** -- gold primary button to apply this template to your site

**Key interactions:**

- Use the category tabs to filter templates by type.
- Click "Preview" to browse the template interactively before committing. The preview shows desktop, tablet, and mobile renderings.
- Click "Select" to apply the template. Your existing content (text, images, pages, blog posts) is preserved when switching templates.

**Tip:** You can maintain up to 10 draft sites simultaneously, each with a different template. Use this to experiment with layouts before publishing.

---

## Flex Editor (WEB-16.1.2)

**Navigation:** Dashboard > Website > Edit Site

The Flex Editor is your main workspace for building and customizing your website. It uses a 3-panel layout with a top toolbar.

### Top Toolbar (52px height)

The toolbar spans the full width and contains:

| Element | Position | Description |
|---------|----------|-------------|
| Undo / Redo | Left | Arrow buttons to step through your edit history |
| Viewport Toggles | Center | Three icons -- Desktop, Tablet, Mobile -- to switch the canvas preview size |
| Draft Selector | Right | Dropdown showing the current draft site, with option to switch between up to 10 drafts |
| Publish Button | Far right | Gold primary button. Publishes the current draft as your live site |
| Draft Status | Right of Publish | Indicator showing "Draft" or "Published" |

### Left Panel -- Pages & Elements (280px width)

The left panel is divided into two sections:

**Pages List (upper section):**

A list of your site's pages, displayed in navigation order:

- Home
- About
- Portfolio
- Contact
- Blog
- (Any custom pages you have added)

Each page row shows the page name with a drag handle for reordering. Click a page to load it on the canvas. Right-click (or use the three-dot menu) for page actions: Duplicate, Delete, Set as Homepage, and Page Settings (title, URL slug, password protection).

**Elements Grid (lower section):**

A grid of draggable elements you can add to any page:

| Element | Icon | Description |
|---------|------|-------------|
| Text | Type icon | Heading, paragraph, or custom text block |
| Image | Image icon | Single image with optional link |
| Button | Rectangle icon | Clickable button with customizable label and action |
| Video | Play icon | YouTube, Vimeo, or self-hosted video embed |
| Shape | Circle icon | Decorative shapes and dividers |
| Slider | Layers icon | Image carousel/slideshow |
| Grid | Grid icon | Multi-image grid layout |
| Columns | Columns icon | Multi-column layout container |

Drag any element from this grid onto the canvas to add it to the current page. You can also access 100+ ready-made layout blocks (pre-designed sections) from a "Layout Blocks" tab within this panel.

### Center Canvas

The main editing area displays the current page at the selected viewport width:

- **Desktop** -- full-width canvas
- **Tablet** -- 768px centered canvas
- **Mobile** -- 402px centered canvas

Elements on the canvas show outlines on hover and selection handles (resize, rotate, move) when clicked. Rulers and alignment guides appear to help with precise positioning.

Customizations made at one viewport size can be independent -- you can adjust layout, sizing, and visibility per breakpoint.

### Right Panel -- Properties (300px width)

When an element is selected on the canvas, the right panel shows its properties organized into three tabs:

**Style Tab:**

- Background color / image
- Border (width, color, radius)
- Opacity
- Shadow (if applicable)
- Font family, size, weight, color (for text elements)
- Scroll animation (fade in, scale up, slide in, unfold)

**Layout Tab:**

- Width and height
- Padding and margin
- Position (relative, absolute)
- Alignment (horizontal, vertical)
- Z-index / layer order (bring to front, send to back)
- Display on specific breakpoints (show/hide per viewport)

**Content Tab:**

- Text content (for text elements)
- Image source and alt text (for image elements)
- Link URL and target
- Video URL (for video embeds)
- Button label and action

**Key interactions:**

- Drag elements from the left panel onto the canvas.
- Click an element on the canvas to select it and view its properties in the right panel.
- Switch viewport toggles to preview and customize responsive behavior.
- Reorder pages by dragging them in the page list.
- Publish your site with the gold Publish button when ready.

**Tip:** Design your desktop layout first, then switch to tablet and mobile viewports to fine-tune the responsive experience. Each breakpoint remembers its own layout adjustments.

---

## Blog Editor (WEB-16.2.1)

**Navigation:** Dashboard > Website > Blog > [New Post] or [Edit Post]

**Layout:** A two-panel editor for creating and managing blog posts.

### Left Panel -- Editor

- **Title Input** -- large text field styled in Cormorant Garamond at 28px. This is the post's headline.
- **Rich Text Toolbar** -- a formatting bar with buttons for:
  - **Bold** (B)
  - **Italic** (I)
  - **Underline** (U)
  - **Heading** (H1, H2, H3 options)
  - **List** (bullet and numbered)
  - **Link** (insert/edit hyperlink)
  - **Image** (insert inline image)
- **Body Textarea** -- the main writing area below the toolbar. Supports rich text formatting, inline images, and embedded content.

### Right Sidebar (320px width)

The sidebar contains metadata and SEO fields for the post:

| Field | Description |
|-------|-------------|
| Publication Date | Date picker. Set a future date to schedule the post. |
| URL Slug | Auto-generated from the title, editable for custom URLs. |
| Featured Image | Upload area for the post's cover/thumbnail image. |
| Category | Dropdown or tag selector for post categorization. |
| SEO Title | Custom title tag for search engines (with character count). |
| SEO Description | Meta description for search results (with character count). |

**Action Buttons:**

- **Preview** -- opens the post in a preview window as visitors will see it.
- **Publish / Schedule** -- gold primary button. If a future date is set, it schedules the post; otherwise, it publishes immediately.
- **Save Draft** -- saves without publishing.

**Key interactions:**

- Write your post in the left editor with rich formatting.
- Set the publication date to schedule posts for the future.
- Customize the URL slug for SEO-friendly URLs.
- Upload a featured image that appears in blog listings and social shares.
- Fill in SEO fields to control how the post appears in search results.

**Tip:** Use the SEO Title and Description fields even if they seem redundant. Search engines use these over your post title, giving you a chance to write click-optimized copy for search results.

---

## SEO Manager (WEB-16.2.2)

**Navigation:** Dashboard > Website > SEO

**Layout:** The SEO Manager provides an overview of your site's search engine optimization health with tools to improve it.

### Metric Cards (top row, 3 cards)

| Card | Description |
|------|-------------|
| Pages Optimized | Count of pages with complete SEO data (title + description + alt text) |
| Missing Alt Text | Count of images across your site that lack alt text |
| Missing Descriptions | Count of pages without a meta description |

Each card displays the count prominently with a label below. Green indicates good health; gold or red indicates items needing attention.

### Page SEO Table

A table listing every page on your site with its SEO status:

| Column | Description |
|--------|-------------|
| Page | Page name with a link to edit |
| Title | Current SEO title (editable inline) |
| Description | Current meta description (editable inline, with character count) |
| Health | Green/yellow/red indicator based on completeness |

### AI Tools

- **AI Generate** buttons appear next to description and alt text fields. Click to have AI generate optimized text based on your page content.
- **Bulk AI Alt Text** generates alt text for all images missing it across your site.

### Run Audit Button

A gold primary button labeled "Run Audit" performs a full-site SEO scan and updates all metric cards and health indicators. The audit checks for:

- Missing page titles
- Missing meta descriptions
- Missing image alt text
- Duplicate titles or descriptions
- Broken links (if detectable)

**Key interactions:**

- Click "Run Audit" to refresh your SEO health data.
- Edit titles and descriptions directly in the table.
- Use AI Generate buttons for quick, optimized copy.
- Click a page name to jump to the Flex Editor for that page.

**Tip:** Run an audit before publishing any major site update. The Missing Alt Text count is especially important for accessibility and image search rankings.

---

## Additional Website Features

### Typography & Design

- **Font library** -- 1,000+ font families available, plus custom font upload support (WOFF, WOFF2, TTF, OTF).
- **Color palettes** -- 40+ palettes with 200+ combinations. Custom hex color entry is supported everywhere.
- **Scroll animations** -- four site-wide animation types (fade in, scale up, slide in, unfold) that trigger as visitors scroll.

### Hosting & Security

- **Free hosting** -- unlimited bandwidth, no extra charges.
- **SSL certificate** -- free, auto-renewing SSL on all sites including custom domains.
- **Custom domain** -- connect your own domain (e.g., www.yourname.com). Available on paid plans.
- **Password protection** -- protect individual pages or your entire site.
- **Right-click protection** -- optional setting to prevent visitors from right-clicking to save images.

### Analytics

- **Built-in analytics** -- visitor count, geography, session duration, and page views.
- **Google Analytics (GA4)** -- connect your GA4 property for advanced tracking.
- **Facebook Pixel** -- add your pixel for ad tracking and retargeting.

---

## Quick Reference

| Task | Navigation |
|------|-----------|
| Choose a template | Dashboard > Website > Templates |
| Edit your site | Dashboard > Website > Edit Site |
| Add a page | Edit Site > Left Panel > Pages > + Add Page |
| Add an element | Edit Site > Left Panel > Elements > Drag to canvas |
| Write a blog post | Dashboard > Website > Blog > + New Post |
| Check SEO health | Dashboard > Website > SEO > Run Audit |
| Connect a domain | Dashboard > Website > Settings > Domain |
| View analytics | Dashboard > Website > Analytics |
