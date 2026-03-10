# F44 - Design System & UI Components

## Overview

The Design System & UI Components feature defines the visual foundation for the entire Anansi platform. It establishes a comprehensive set of design tokens (colors, typography, spacing, corner radius) and shared UI components that every screen in the application consumes. Rather than being a traditional backend feature with CRUD operations, this feature produces a centralized token system, a component library, and the infrastructure to serve and theme these elements consistently across the web dashboard, client-facing pages, and mobile apps.

The design tokens codify the Elegant Luxury aesthetic: a dark palette anchored by page background `#1A1A1C`, card surface `#242426`, and gold accent `#C9A962`, with Cormorant Garamond for display typography and Inter for body/UI text. These tokens are expressed as CSS custom properties for the web, a JSON token file for the mobile apps, and C# constants for server-side rendering decisions (e.g., email templates). The spacing and radius scales are deliberately constrained to maintain visual consistency -- gaps range from 4px to 40px, padding from 4px to 32px, and corner radii from 16px to 34px.

The shared component catalog covers buttons (5 variants), form inputs (8 control types with 4 states each), cards (standard and metric variants), navigation (sidebar, top bar, mobile tab bar), data tables, badges, modals/dialogs, toasts, empty states, and loading indicators. Each component is documented with its token usage, responsive behavior, and interaction states. On the server side, a `DesignTokensController` serves the current token set as JSON so that client apps can dynamically theme themselves, and a `ComponentManifest` query returns metadata about all available components for the website builder's element toolbox.

**L2 Requirements:** DSN-12.1.1 (Color Tokens), DSN-12.1.2 (Typography Tokens), DSN-12.1.3 (Spacing Tokens), DSN-12.1.4 (Corner Radius Tokens), DSN-12.2.1 (Buttons), DSN-12.2.2 (Form Inputs), DSN-12.2.3 (Cards), DSN-12.2.4 (Navigation), DSN-12.2.5 (Tables), DSN-12.2.6 (Badges), DSN-12.2.7 (Modals/Dialogs), DSN-12.2.8 (Toasts), DSN-12.2.9 (Empty States), DSN-12.2.10 (Loading States), DSN-12.2.11 (Responsive Layouts), DSN-12.2.12 (System States)

---

## Components

### Domain Layer (Anansi.Domain)

| Component | Type | Description |
|-----------|------|-------------|
| `DesignToken` | Value Object | Immutable record representing a single design token with `Category` (Color, Typography, Spacing, Radius), `Key` (e.g., `color.page.bg`), `Value` (e.g., `#1A1A1C`), and optional `Description`. |
| `DesignTokenCategory` | Enum | `Color`, `Typography`, `Spacing`, `CornerRadius`. |
| `ComponentVariant` | Enum | `Primary`, `Secondary`, `Outline`, `Ghost`, `Destructive` (for buttons); `Success`, `Warning`, `Error`, `Info`, `Neutral` (for badges). |
| `InputState` | Enum | `Default`, `Focused`, `Error`, `Disabled`. |

### Application Layer (Anansi.Application)

| Component | Type | Description |
|-----------|------|-------------|
| `GetDesignTokensQuery` | Query | Returns the full design token set, optionally filtered by `DesignTokenCategory`. |
| `GetComponentManifestQuery` | Query | Returns metadata for all shared components: name, variants, supported props, and default values. Used by the website builder toolbox. |
| `DesignTokenDto` | DTO | `Category`, `Key`, `Value`, `Description`. |
| `ComponentManifestDto` | DTO | `ComponentName`, `Variants`, `Props`, `DefaultValues`, `ResponsiveBehavior`. |
| `DesignTokensProvider` | Service | Static provider that returns the canonical token set. Reads from an embedded JSON file or code constants. No database dependency. |

### Infrastructure Layer (Anansi.Infrastructure)

| Component | Type | Description |
|-----------|------|-------------|
| `DesignTokensProvider` | Service | Implements the token provider. Loads tokens from an embedded `design-tokens.json` resource file. Caches in memory. |

### API Layer (Anansi.Api)

| Component | Type | Description |
|-----------|------|-------------|
| `DesignTokensController` | Controller | `GET /api/design-tokens` returns the full token set as JSON. `GET /api/design-tokens/{category}` returns tokens filtered by category. Public endpoint (no auth required) so client apps can theme themselves. |
| `ComponentManifestController` | Controller | `GET /api/components/manifest` returns the component catalog metadata. Used by the website builder. |

### Frontend (Anansi.Web / Client Apps)

| Component | Type | Description |
|-----------|------|-------------|
| `tokens.css` | CSS File | CSS custom properties generated from the design token set. Imported at the root of the application. |
| `Button` | Component | Five variants (Primary, Secondary, Outline, Ghost, Destructive) with 20px border radius, disabled state at 0.4 opacity. |
| `FormInput` | Component | Text, Textarea, Select, Checkbox, Radio, Toggle, DatePicker. Four states: Default (border #3A3A3C), Focused (border #C9A962), Error (border red, message below), Disabled (0.4 opacity). |
| `Card` | Component | Header/Content/Actions slot layout. Metric variant for dashboard KPIs. Hover state with subtle border highlight. |
| `Sidebar` | Component | 260px width, dark background, collapsible on tablet/mobile. |
| `TopBar` | Component | 64px height, contains breadcrumbs, search, notifications, profile. |
| `MobileTabBar` | Component | 62px height, pill-shaped active indicator with 34px radius. Fixed bottom position. |
| `DataTable` | Component | Sortable column headers, hover rows, pagination footer. |
| `Badge` | Component | Success (#6E9E6E), Warning (amber), Error (red), Info (blue), Neutral (#4A4A4C). |
| `Modal` | Component | 70% overlay, max 560px width, confirmation and destructive variants. |
| `Toast` | Component | Top-right on desktop, top-center on mobile. Color bar on left. Auto-dismiss 5s. Max stack 3. |
| `EmptyState` | Component | Centered layout: icon + heading + description + CTA button. |
| `LoadingState` | Component | Skeleton pulse, gold spinner (#C9A962), progress bar. |

---

## Class Diagrams

### Domain -- Design Token Value Objects & Enums

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class DesignToken <<record>> {
  +Category : DesignTokenCategory
  +Key : string
  +Value : string
  +Description : string?
}

enum DesignTokenCategory {
  Color
  Typography
  Spacing
  CornerRadius
}

enum ComponentVariant {
  Primary
  Secondary
  Outline
  Ghost
  Destructive
  Success
  Warning
  Error
  Info
  Neutral
}

enum InputState {
  Default
  Focused
  Error
  Disabled
}

DesignToken ..> DesignTokenCategory

@enduml
```

### Application -- Token Queries & DTOs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Features.DesignSystem.Queries" {
  class GetDesignTokensQuery <<record>> {
    +Category : DesignTokenCategory?
  }

  class GetComponentManifestQuery <<record>>
}

package "DTOs.DesignSystem" {
  class DesignTokenDto <<record>> {
    +Category : string
    +Key : string
    +Value : string
    +Description : string?
  }

  class ComponentManifestDto <<record>> {
    +ComponentName : string
    +Variants : List<string>
    +Props : List<ComponentPropDto>
    +DefaultValues : Dictionary<string, string>
    +ResponsiveBehavior : string?
  }

  class ComponentPropDto <<record>> {
    +Name : string
    +Type : string
    +Required : bool
    +DefaultValue : string?
    +Description : string?
  }
}

class DesignTokensProvider <<service>> {
  +GetAllTokens() : IReadOnlyList<DesignToken>
  +GetTokensByCategory(category) : IReadOnlyList<DesignToken>
  +GetToken(key) : DesignToken?
}

GetDesignTokensQuery ..> DesignTokensProvider : uses
GetComponentManifestQuery ..> ComponentManifestDto

@enduml
```

### Token Catalog -- Color Tokens

```plantuml
@startuml
skinparam classAttributeIconSize 0
hide empty methods

object "Color Tokens" as CT {
  color.page.bg = "#1A1A1C"
  color.card.bg = "#242426"
  color.card.expanded = "#2A2A2C"
  color.text.primary = "#F5F5F0"
  color.text.secondary = "#6E6E70"
  color.text.tertiary = "#4A4A4C"
  color.border.default = "#3A3A3C"
  color.accent.gold = "#C9A962"
  color.status.success = "#6E9E6E"
  color.status.warning = "#D4A843"
  color.status.error = "#D44A4A"
  color.status.info = "#4A8ED4"
  color.overlay = "rgba(0,0,0,0.7)"
}

object "Typography Tokens" as TT {
  font.display.family = "Cormorant Garamond"
  font.display.weight.light = "300"
  font.display.weight.medium = "500"
  font.body.family = "Inter"
  font.body.weight.regular = "400"
  font.body.weight.medium = "500"
  font.body.weight.semibold = "600"
  font.size.xs = "10px"
  font.size.sm = "12px"
  font.size.base = "14px"
  font.size.lg = "16px"
  font.size.xl = "20px"
  font.size.2xl = "24px"
  font.size.3xl = "32px"
  font.size.4xl = "40px"
  font.size.5xl = "52px"
}

object "Spacing Tokens" as ST {
  spacing.gap.xs = "4px"
  spacing.gap.sm = "8px"
  spacing.gap.md = "12px"
  spacing.gap.lg = "16px"
  spacing.gap.xl = "24px"
  spacing.gap.2xl = "32px"
  spacing.gap.3xl = "40px"
  spacing.padding.xs = "4px"
  spacing.padding.sm = "8px"
  spacing.padding.md = "12px"
  spacing.padding.lg = "16px"
  spacing.padding.xl = "24px"
  spacing.padding.2xl = "32px"
}

object "Radius Tokens" as RT {
  radius.sm = "16px"
  radius.md = "20px"
  radius.lg = "24px"
  radius.xl = "34px"
}

@enduml
```

### Component Catalog -- Buttons & Form Inputs

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Components" {
  class Button <<component>> {
    +variant : ComponentVariant
    +size : "sm" | "md" | "lg"
    +disabled : bool
    +loading : bool
    +icon : string?
    +onClick : Action
    --
    radius: 20px
    disabled opacity: 0.4
  }

  class FormInput <<component>> {
    +type : "text" | "textarea" | "select" | "checkbox" | "radio" | "toggle" | "date"
    +label : string
    +value : string
    +placeholder : string?
    +error : string?
    +required : bool
    +disabled : bool
    --
    default border: #3A3A3C
    focused border: #C9A962
    error border: red
    disabled opacity: 0.4
  }

  class DatePicker <<component>> {
    +selectedDate : DateTime?
    +minDate : DateTime?
    +maxDate : DateTime?
    +format : string
  }
}

note right of Button
  Variants:
  - Primary: gold bg #C9A962, dark text
  - Secondary: card bg #242426, light text
  - Outline: transparent bg, gold border
  - Ghost: transparent, text-only
  - Destructive: red bg, white text
end note

FormInput <|-- DatePicker

@enduml
```

### Component Catalog -- Cards, Navigation & Data Display

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Layout Components" {
  class Card <<component>> {
    +header : Slot
    +content : Slot
    +actions : Slot
    +variant : "standard" | "metric"
    +hoverable : bool
    --
    bg: #242426
    radius: 24px
  }

  class Sidebar <<component>> {
    +collapsed : bool
    +menuItems : MenuItem[]
    --
    width: 260px
    bg: #1A1A1C
  }

  class TopBar <<component>> {
    +breadcrumbs : string[]
    +showSearch : bool
    +notificationCount : int
    --
    height: 64px
  }

  class MobileTabBar <<component>> {
    +tabs : TabItem[]
    +activeIndex : int
    --
    height: 62px
    pill radius: 34px
  }
}

package "Data Components" {
  class DataTable <<component>> {
    +columns : ColumnDef[]
    +rows : object[]
    +sortable : bool
    +pagination : bool
    +pageSize : int
  }

  class Badge <<component>> {
    +variant : ComponentVariant
    +label : string
    --
    success: #6E9E6E
    warning: amber
    error: red
    info: blue
    neutral: #4A4A4C
  }
}

@enduml
```

### Component Catalog -- Overlays & Feedback

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

package "Overlay Components" {
  class Modal <<component>> {
    +title : string
    +content : Slot
    +actions : Slot
    +variant : "default" | "confirmation" | "destructive"
    +onClose : Action
    --
    overlay: 70% opacity
    maxWidth: 560px
  }

  class Toast <<component>> {
    +message : string
    +type : "success" | "error" | "warning" | "info"
    +autoDismiss : bool
    +duration : int
    --
    desktop: top-right
    mobile: top-center
    color bar left
    auto-dismiss: 5s
    max stack: 3
  }
}

package "State Components" {
  class EmptyState <<component>> {
    +icon : string
    +heading : string
    +description : string
    +ctaLabel : string?
    +ctaAction : Action?
    --
    centered layout
  }

  class LoadingState <<component>> {
    +variant : "skeleton" | "spinner" | "progress"
    +progress : int?
    --
    skeleton: pulse animation
    spinner: gold #C9A962
    progress: gold bar
  }
}

@enduml
```

### API -- Design System Controllers

```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty methods

class DesignTokensController <<ApiController>> {
  -_mediator : IMediator
  +GetTokens(category?) : IActionResult
  +GetTokensCss() : ContentResult
}

class ComponentManifestController <<ApiController>> {
  -_mediator : IMediator
  +GetManifest() : IActionResult
}

note right of DesignTokensController
  Public endpoints (no auth).
  GET /api/design-tokens
  GET /api/design-tokens/{category}
  GET /api/design-tokens/css
end note

DesignTokensController --> "IMediator"
ComponentManifestController --> "IMediator"

@enduml
```

---

## Sequence Diagrams

### Load Design Tokens (Client App Initialization)

```plantuml
@startuml
actor "Client App" as App
participant "DesignTokensController" as DTC
participant "MediatR" as M
participant "GetDesignTokensHandler" as H
participant "DesignTokensProvider" as TP

App -> DTC : GET /api/design-tokens
DTC -> M : Send(GetDesignTokensQuery)
M -> H : Handle(query)
H -> TP : GetAllTokens()
TP -> TP : Return cached token set\n(loaded from embedded\ndesign-tokens.json)
TP --> H : IReadOnlyList<DesignToken>
H -> H : Map to DesignTokenDto[]
H --> M : Result.Success(tokens)
M --> DTC : Result.Success
DTC --> App : 200 OK {\n  colors: {page_bg: "#1A1A1C", ...},\n  typography: {display_family: "Cormorant Garamond", ...},\n  spacing: {gap_xs: "4px", ...},\n  radius: {sm: "16px", ...}\n}

App -> App : Apply tokens as CSS\ncustom properties\n(--color-page-bg, etc.)
@enduml
```

### Serve Design Tokens as CSS Custom Properties

```plantuml
@startuml
actor Browser as B
participant "DesignTokensController" as DTC
participant "MediatR" as M
participant "GetDesignTokensHandler" as H
participant "DesignTokensProvider" as TP

B -> DTC : GET /api/design-tokens/css
DTC -> M : Send(GetDesignTokensQuery)
M -> H : Handle(query)
H -> TP : GetAllTokens()
TP --> H : tokens[]

H -> H : Generate CSS:\n:root {\n  --color-page-bg: #1A1A1C;\n  --color-card-bg: #242426;\n  --color-accent-gold: #C9A962;\n  --font-display: "Cormorant Garamond";\n  --font-body: "Inter";\n  --spacing-gap-sm: 8px;\n  --radius-md: 20px;\n  ...\n}

H --> M : CSS string
M --> DTC : Result.Success
DTC --> B : 200 OK\nContent-Type: text/css\n:root { --color-page-bg: #1A1A1C; ... }

note right of B
  Linked in <head> as:
  <link rel="stylesheet"
    href="/api/design-tokens/css">
end note
@enduml
```

### Get Component Manifest (Website Builder Toolbox)

```plantuml
@startuml
actor Photographer as P
participant "Website Builder UI" as WB
participant "ComponentManifestController" as CMC
participant "MediatR" as M
participant "GetComponentManifestHandler" as H

P -> WB : Open website builder\nelement toolbox
WB -> CMC : GET /api/components/manifest
CMC -> M : Send(GetComponentManifestQuery)
M -> H : Handle(query)

H -> H : Build manifest from\nstatic component registry

H --> M : Result.Success([\n  {name: "Button", variants: [...],\n   props: [{name: "label", type: "string"}]},\n  {name: "Card", variants: ["standard","metric"]},\n  {name: "FormInput", variants: [...],\n   props: [{name: "type", type: "enum"}]},\n  ...\n])

M --> CMC : Result.Success
CMC --> WB : 200 OK [{components}]

WB -> WB : Render element toolbox\nwith component cards
WB --> P : Drag-and-drop components\navailable in sidebar
@enduml
```

### Render Page with Responsive Token Application

```plantuml
@startuml
actor Client as C
participant "Browser" as B
participant "Anansi Web" as AW
participant "CSS Token Layer" as CSS

C -> B : Navigate to photographer's\ngallery page

B -> AW : GET /gallery/{slug}
AW --> B : HTML + CSS + JS

B -> CSS : Load :root CSS variables\n(design tokens)

alt viewport >= 1440px (desktop)
  CSS -> CSS : Apply desktop layout tokens\n--sidebar-width: 260px\n--topbar-height: 64px\n--grid-columns: 4
else viewport >= 768px (tablet)
  CSS -> CSS : Apply tablet layout tokens\n--sidebar-width: 0 (collapsed)\n--grid-columns: 2
else viewport < 768px (mobile)
  CSS -> CSS : Apply mobile layout tokens\n--sidebar-width: 0\n--tabbar-height: 62px\n--grid-columns: 1
end

B -> B : Render page with\napplied token values

B --> C : Fully responsive page\nwith consistent design tokens
@enduml
```

### Toast Notification Lifecycle

```plantuml
@startuml
actor User as U
participant "Action Trigger" as AT
participant "Toast Manager" as TM
participant "Toast Stack" as TS

U -> AT : Perform action\n(e.g., save settings)

AT -> TM : showToast({\nmessage: "Settings saved",\ntype: "success",\nduration: 5000\n})

TM -> TS : Check current stack size

alt stack.length >= 3
  TM -> TS : Remove oldest toast\n(FIFO)
end

TM -> TS : Add new toast to stack\n(position: top-right desktop,\ntop-center mobile)

TS --> U : Toast appears with\ngreen color bar + message

TM -> TM : Start 5s auto-dismiss timer

alt user clicks dismiss
  U -> TM : Dismiss toast
  TM -> TS : Remove toast (slide out)
else timer expires
  TM -> TS : Auto-remove toast\n(fade out animation)
end
@enduml
```

### Modal Confirmation Flow (Destructive Action)

```plantuml
@startuml
actor User as U
participant "Trigger Component" as TC
participant "Modal Manager" as MM
participant "Modal (Destructive)" as MD

U -> TC : Click "Delete Gallery"
TC -> MM : openModal({\nvariant: "destructive",\ntitle: "Delete Gallery",\ncontent: "This action cannot be undone.\nAll photos will be permanently deleted.",\nconfirmLabel: "Delete",\ncancelLabel: "Cancel"\n})

MM -> MD : Render modal with\n70% overlay backdrop

MD --> U : Modal appears:\n- Title: "Delete Gallery"\n- Warning description\n- Red "Delete" button\n- Gray "Cancel" button

alt user clicks Cancel
  U -> MD : Click "Cancel"
  MD -> MM : Close modal
  MM --> U : Modal dismissed,\nno action taken
else user clicks Delete
  U -> MD : Click "Delete"
  MD -> TC : onConfirm callback
  TC -> TC : Execute delete action
  TC -> MM : Close modal
  MM --> U : Modal dismissed,\naction executed
end
@enduml
```
