# F17 - Website Pages & Content

## Overview

The Website Pages & Content feature covers the page management system and specialized content blocks that allow photographers to build rich, multi-page websites. It builds on the Flex Editor foundation from F16 by providing the page-level organizational structure and several domain-specific content integrations.

Page Management (WEB-3.2.1) supports nine page types -- homepage, portfolio, about, services, contact, pricing, gallery, blog, and custom -- each addable, removable, and reorderable within the website navigation. Every page has a configurable URL slug for clean URLs and can be individually password-protected or hidden from navigation. Pages serve as containers for the drag-and-drop elements defined in the Flex Editor, and the sort order determines their position in the site navigation.

The feature also introduces four specialized element types. Client Gallery Blocks (WEB-3.2.2) embed Anansi client galleries directly within website pages, supporting multiple display formats (grid, featured collection) and allowing visitors to browse galleries without leaving the website. Instagram Feed Integration (WEB-3.2.3) connects a photographer's Instagram account to display a live feed with configurable photo count, size, and click behavior. Custom Embed Code blocks (WEB-3.2.4) allow Pro-plan users to inject arbitrary HTML, JavaScript, or iframe content for tracking pixels, widgets, custom forms, and video players. Landing Page Templates (WEB-3.2.5) provide ready-made page templates for common use cases like booking and mini session promos, available for one-click addition to any website.

## Components

### Domain Layer

**WebsitePage** (`Anansi.Domain.Entities.Website.WebsitePage`) -- Represents a page within a website. Key properties include `PageType` (from the `WebsitePageType` enum), `Slug` for URL routing, `SortOrder` for navigation ordering, `ShowInNavigation` and `IsVisible` for display control, and `PagePasswordHash` for per-page password protection. Also stores SEO metadata (`MetaTitle`, `MetaDescription`, `OgImageUrl`). Implements `ITenantEntity` and `ISoftDeletable`.

**PageElement** (`Anansi.Domain.Entities.Website.PageElement`) -- The element entity supports content blocks via the `ElementType` enum. For Client Gallery Blocks, the `ContentJson` field stores the gallery configuration (collection IDs, display type). For Instagram Feed, it stores feed configuration (photo count, size, click behavior). For Custom Embed, it stores the raw HTML/JS/iframe code. The `ElementType` enum values `ClientGalleryBlock`, `InstagramFeed`, `CustomEmbed`, and `LandingPageBlock` map to these features.

**LandingPageTemplate** (`Anansi.Domain.Entities.Website.LandingPageTemplate`) -- A system-provided template for landing pages. Contains `UseCase` (booking, mini-session-promo, etc.), `LayoutDefinitionJson` for the structural definition, and `PreviewImageUrl` for catalog display.

### Application Layer

**CreatePageCommand / CreatePageHandler** -- Creates a new page within a website. Validates slug uniqueness within the website, calculates next sort order, optionally hashes a page password, and stores SEO metadata. Returns `WebsitePageDto`.

**UpdatePageCommand / UpdatePageHandler** -- Updates page properties including title, slug, page type, visibility, navigation inclusion, password, and SEO fields. Re-validates slug uniqueness when changed.

**DeletePageCommand / DeletePageHandler** -- Soft-deletes a page and cascades to its child elements and breakpoint overrides.

**ListPagesQuery / ListPagesHandler** -- Returns all pages for a website ordered by `SortOrder`, supporting the navigation reordering UI.

**ReorderPagesCommand / ReorderPagesHandler** -- Accepts an ordered list of page IDs and updates `SortOrder` values to match the new sequence.

**CreateElementCommand / CreateElementHandler** -- (Shared with F16) Handles creation of all element types. For `ClientGalleryBlock`, validates that the referenced collection IDs exist and belong to the photographer. For `InstagramFeed`, validates that the photographer has a connected Instagram account. For `CustomEmbed`, validates the photographer's plan allows custom code (Pro tier). For `LandingPageBlock`, loads the landing page template's layout definition and creates child elements accordingly.

**ListLandingPageTemplatesQuery / ListLandingPageTemplatesHandler** -- Returns active landing page templates for catalog display.

**ConfigureInstagramFeedCommand / ConfigureInstagramFeedHandler** -- (In `Features.Integrations.Commands`) Connects or updates the photographer's Instagram account integration, storing the access token.

### Infrastructure Layer

**EF Core Configurations** -- Entity configurations for `WebsitePage` define indexes on `(WebsiteId, Slug)` for uniqueness checks and `(WebsiteId, SortOrder)` for ordered queries. `LandingPageTemplate` configuration maps the system-provided templates with a seeded data set.

### API Layer

**WebsitePagesController** (`api/websites/{websiteId}/pages`) -- CRUD endpoints for page management. `POST` creates a page, `PUT` updates, `DELETE` soft-deletes, `GET` lists all pages for a website. Includes `PUT reorder` for drag-and-drop navigation reordering.

**WebsiteTemplatesController** (`api/website-templates/landing-pages`) -- Lists available landing page templates for the one-click addition flow.

**PageElementsController** (`api/websites/{websiteId}/pages/{pageId}/elements`) -- Shared controller for all element types including the content-specific blocks.

## Class Diagrams

### Domain Layer -- Page Management

![Domain Layer -- Page Management](domain-layer-page-management.png)

### Domain Layer -- Content Blocks & Landing Page Templates

![Domain Layer -- Content Blocks & Landing Page Templates](domain-layer-content-blocks-landing-page-templates.png)

### Application Layer -- Page Commands & Queries

![Application Layer -- Page Commands & Queries](application-layer-page-commands-queries.png)

### API Layer -- Page & Content Controllers

![API Layer -- Page & Content Controllers](api-layer-page-content-controllers.png)

## Sequence Diagrams

### Create a New Page (WEB-3.2.1)

![Create a New Page (WEB-3.2.1)](create-a-new-page-web-3-2-1.png)

### Reorder Pages in Navigation (WEB-3.2.1)

![Reorder Pages in Navigation (WEB-3.2.1)](reorder-pages-in-navigation-web-3-2-1.png)

### Add Client Gallery Block to Page (WEB-3.2.2)

![Add Client Gallery Block to Page (WEB-3.2.2)](add-client-gallery-block-to-page-web-3-2-2.png)

### Add Instagram Feed Block (WEB-3.2.3)

![Add Instagram Feed Block (WEB-3.2.3)](add-instagram-feed-block-web-3-2-3.png)

### Add Custom Embed Block with Plan Check (WEB-3.2.4)

![Add Custom Embed Block with Plan Check (WEB-3.2.4)](add-custom-embed-block-with-plan-check-web-3-2-4.png)

### Add Landing Page from Template (WEB-3.2.5)

![Add Landing Page from Template (WEB-3.2.5)](add-landing-page-from-template-web-3-2-5.png)
