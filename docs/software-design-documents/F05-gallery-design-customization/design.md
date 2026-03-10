# F05 - Gallery Design & Customization

## Overview

This feature gives photographers full creative control over the visual presentation of their client galleries. Every collection can be independently styled with a combination of cover design, theme, typography, color palette, layout, set descriptions, slideshow behavior, and language -- producing a branded, polished experience for each client. Design changes are per-collection, allowing a photographer to maintain different aesthetics for weddings versus portraits versus events.

Cover design is the first visual impression. Photographers choose from seven or more cover styles (Reef, West, Oakwood, Edge, Harbor, Summit, Cascade), each offering a distinct layout for the cover photo. The cover photo is selectable from the collection's uploaded images with an adjustable focal point for precise cropping. Video and GIF covers are also supported: a YouTube or Vimeo URL can be provided, and the video plays as a looping, muted background behind the cover overlay. Below the cover, the gallery body offers a light or dark theme toggle (both WCAG AA compliant), a selection of six or more curated font families with real-time preview, nine or more color palettes with custom hex entry on paid plans, and vertical or horizontal grid layouts. Set titles and descriptions support basic formatting (bold, italic, line breaks).

Slideshow mode provides an immersive viewing experience where images display full-screen in sequence with smooth transitions, adjustable speed (slow/medium/fast), auto-loop toggle, and manual next/previous navigation. Multi-language support allows the photographer to set a language per collection from eight or more options, translating all client-facing UI text and automated emails into the selected language.

**L2 Requirements:** GAL-1.3.1 (Cover Styles), GAL-1.3.2 (Video/GIF Covers), GAL-1.3.3 (Theme Toggle), GAL-1.3.4 (Typography), GAL-1.3.5 (Color Palettes), GAL-1.3.6 (Grid Layouts), GAL-1.3.7 (Set Titles & Descriptions), GAL-1.3.8 (Slideshow Mode), GAL-1.8.1 (Language Selection)

---

## Components

### Domain Layer

| Component | Type | Description |
|-----------|------|-------------|
| `Collection` | Entity | Stores all design settings as properties: `CoverStyle`, `CoverPhotoId`, `CoverFocalPointX/Y`, `CoverVideoUrl`, `CoverVideoAutoplay`, `Theme`, `FontFamily`, `ColorPalette`, `CustomColorHex`, `Layout`, `SlideshowSpeed`, `SlideshowAutoLoop`, `Language`. |
| `CollectionSet` | Entity | Stores `Title` and `Description` (supporting basic formatting) for display above the set's photos. |
| `CoverStyle` | Enum | `Reef`, `West`, `Oakwood`, `Edge`, `Harbor`, `Summit`, `Cascade` |
| `ThemeMode` | Enum | `Light`, `Dark` |
| `GridLayout` | Enum | `Vertical`, `Horizontal` |
| `SlideshowSpeed` | Enum | `Slow`, `Medium`, `Fast` |
| `GalleryLanguage` | Enum | `English`, `Spanish`, `French`, `German`, `Dutch`, `ChineseSimplified`, `Portuguese`, `Swedish` |

### Application Layer

| Component | Type | Description |
|-----------|------|-------------|
| `UpdateCollectionCommand` | Command | General-purpose collection update that includes all design fields. The handler applies only the fields that are provided (partial update). |
| `UpdateSetCommand` | Command | Updates set title and description with basic formatting support. |
| `GetCollectionQuery` | Query | Returns the full collection including all design settings for rendering. |
| `GetPublicCollectionQuery` | Query | Client-facing query that returns design settings needed to render the gallery (cover, theme, fonts, colors, layout, language, slideshow config). |
| `CheckFeatureAccessQuery` | Query | Reused from F02 to enforce custom hex color restriction to paid plans. |
| `GalleryMediaDto` | DTO | Includes CDN URLs for cover photo rendering. |
| `CollectionDto` | DTO | Full collection representation including all design fields. |

### Infrastructure Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CollectionConfiguration` | EF Config | Maps all design fields on the `Collection` entity. Enum conversions for `CoverStyle`, `ThemeMode`, `GridLayout`, `SlideshowSpeed`, `GalleryLanguage`. |
| `CollectionSetConfiguration` | EF Config | Maps `Title` (required, max length) and `Description` (optional, max length for formatted text). |
| `GalleryLocalizationService` | Service | Provides translated strings for client-facing UI text in the selected `GalleryLanguage`. |

### API Layer

| Component | Type | Description |
|-----------|------|-------------|
| `CollectionsController` | Controller | The `PUT /api/collections/{id}` endpoint handles all design updates through `UpdateCollectionCommand`. |
| `CollectionSetsController` | Controller | The `PUT /api/collections/{collectionId}/sets/{id}` endpoint handles set title/description updates. |

---

## Class Diagrams

### Domain Layer -- Design Properties on Collection

![Domain Layer -- Design Properties on Collection](domain-layer-design-properties-on-collection.png)

### Application Layer -- Design-Related DTOs

![Application Layer -- Design-Related DTOs](application-layer-design-related-dtos.png)

### Design Configuration -- Fonts and Palettes

![Design Configuration -- Fonts and Palettes](design-configuration-fonts-and-palettes.png)

---

## Sequence Diagrams

### Update Cover Style and Photo

![Update Cover Style and Photo](update-cover-style-and-photo.png)

### Set Video/GIF Cover

![Set Video/GIF Cover](set-video-gif-cover.png)

### Toggle Theme and Set Typography

![Toggle Theme and Set Typography](toggle-theme-and-set-typography.png)

### Apply Color Palette with Custom Hex

![Apply Color Palette with Custom Hex](apply-color-palette-with-custom-hex.png)

### Update Set Title and Description

![Update Set Title and Description](update-set-title-and-description.png)

### Configure Slideshow Mode

![Configure Slideshow Mode](configure-slideshow-mode.png)

### Set Collection Language

![Set Collection Language](set-collection-language.png)

### Gallery Layout Selection

![Gallery Layout Selection](gallery-layout-selection.png)
