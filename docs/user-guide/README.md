# Anansi Platform -- User Guide

Anansi is an all-in-one platform built for photographers who want to run their entire business from a single place. From delivering client galleries and selling prints to building a professional website, managing contacts, sending invoices, and booking sessions, Anansi replaces the patchwork of disconnected tools with one cohesive system. The platform is designed with future customization for Toronto Black photographers, including cultural discovery features, community event calendars, and skin-tone-optimized editing presets.

This guide walks you through every screen and workflow so you can get the most out of the platform from day one.

---

## Table of Contents

### Part 1 -- Core Platform

| # | Section | File | Description |
|---|---------|------|-------------|
| 1 | [Getting Started](01-getting-started.md) | `01-getting-started.md` | Account creation, sign-in, password recovery, and plan selection |
| 2 | [Studio Manager (CRM)](02-studio-manager.md) | `02-studio-manager.md` | Dashboard, contacts, projects board, calendar, documents, inbox, reports, and settings |
| 3 | [Client Galleries](03-client-galleries.md) | `03-client-galleries.md` | Gallery administration, uploads, client-facing gallery experience, lightbox, favorites, and privacy |

### Part 2 -- Selling, Publishing, and Mobile *(separate document)*

| # | Section | File | Description |
|---|---------|------|-------------|
| 4 | Online Store | `04-online-store.md` | Product catalog, pricing, fulfillment, promotions, and checkout |
| 5 | Website Builder | `05-website-builder.md` | Templates, flex editor, pages, blog, SEO, and hosting |
| 6 | Booking & Scheduling | `06-booking.md` | Booking site, session types, calendar sync, intake documents, and payments |
| 7 | Mobile Apps | `07-mobile-apps.md` | Studio Manager mobile app and client-facing gallery PWA |
| 8 | Canadian Features | `08-canadian-features.md` | Interac e-Transfer, HST calculator, cultural discovery, skin tone presets, and Toronto events |

---

## Quick Start

Follow these five steps to go from zero to your first delivered gallery:

1. **Create your account** -- Sign up with your email and business name, then choose a plan ([Getting Started](01-getting-started.md)).
2. **Set up your studio** -- Add your logo, brand colors, and business information in Studio Manager Settings ([Studio Manager](02-studio-manager.md#settings)).
3. **Add your first contact** -- Create a client record with name, email, and phone so documents and galleries are linked to the right person ([Contacts](02-studio-manager.md#contacts)).
4. **Upload a gallery** -- Create a collection, drag your photos in, choose a cover style and theme, then publish ([Client Galleries](03-client-galleries.md#gallery-admin)).
5. **Send the invite** -- Email your client a branded gallery link with optional password protection ([Client Galleries](03-client-galleries.md#sharing-and-invitations)).

---

## Design Files

The platform's UI is defined in two Pencil design documents stored in this repository:

| File | Contents |
|------|----------|
| `docs/ui-design.pen` | Core application screens -- authentication, Studio Manager, Client Galleries, Online Store, Website Builder, Booking, Mobile Apps, and the shared design system |
| `docs/ui-design-localized-features.pen` | Canadian and community features -- Interac e-Transfer, HST calculator and threshold tracker, cultural specialization tags and neighborhood discovery, skin tone preset library, and Toronto Black events calendar |

These files use the Pencil format and must be opened with the Pencil editor or accessed through the Pencil MCP tools. They are the source of truth for all layout dimensions, spacing values, and design token references cited throughout this guide.

---

## Design System at a Glance

Every screen in Anansi follows a shared visual language:

| Token | Value |
|-------|-------|
| Background | `#1A1A1C` (dark charcoal) |
| Card surfaces | `#242426` |
| Gold accent | `#C9A962` |
| Success / confirmation | `#6E9E6E` (sage green) |
| Primary text | `#F5F5F0` (warm off-white) |
| Display font | Cormorant Garamond |
| Body / UI font | Inter |
| Card corner radius | 20px |
| Borders | 1px solid `#3A3A3C` |
| Icon set | Lucide |
| Spacing scale | 4, 8, 12, 16, 20, 24, 28, 40px |

The dark luxury aesthetic keeps the focus on the photographs while providing a premium feel that matches the quality of a professional photographer's brand.

---

## Conventions Used in This Guide

- **Design IDs** such as `SM-13.1.1` or `AUTH-19.1.1` reference specific screens in the design files. Use these IDs to locate the exact mockup in `ui-design.pen` or `ui-design-localized-features.pen`.
- **Dimensions** (e.g., "260px sidebar", "480px card") describe the desktop layout at the reference width of 1440px. Tablet (768px) and mobile (402px) layouts adapt responsively.
- **Navigation paths** show how to reach a screen, written as `Sidebar > Section > Page`.
- **Callout blocks** highlight tips, warnings, and plan-specific features:

> **Tip:** Practical advice for getting the most out of a feature.

> **Note:** Important context or behavior to be aware of.

> **Pro plan:** Features marked this way require an upgraded plan.
