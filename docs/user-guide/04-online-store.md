# Online Store

Sell prints, digital downloads, albums, and custom products directly from your client galleries. Anansi's integrated store handles everything from product setup to fulfillment, with Stripe-powered payments and optional print lab automation.

---

## Store Admin

Manage your product catalog, pricing, orders, and promotions from the Store section of your dashboard.

### Product Catalog (STR-15.1.1)

**Navigation:** Dashboard > Store > Products

**Layout:** The product catalog uses your standard sidebar + top bar layout. The top bar displays the "Store" heading on the left and a gold "+ Add Product" button on the right.

Below the top bar, a horizontal tab row lets you filter the product list:

| Tab | Contents |
|-----|----------|
| All Products | Every product in your store |
| Prints | Photographic prints, canvas, metal, wood, framed |
| Digital | Digital downloads (single or full gallery) |
| Albums | Photo albums and books |
| Packages | Bundles of physical and digital products |
| Self-Fulfilled | Custom products you ship yourself |

The product table displays columns for:

- **Thumbnail** -- small product preview image
- **Name** -- product title
- **Type** -- badge indicating product category (Print, Digital, Album, etc.)
- **Price Range** -- lowest to highest variation price
- **Status** -- active/inactive indicator

**Key interactions:**

- Click any row to open the Product Editor for that item.
- Use the tab bar to quickly narrow your view to a specific product type.
- The "+ Add Product" button opens a fresh Product Editor with a type selector.

**Tip:** If you sell both lab-fulfilled prints and self-fulfilled products, you can manage them side by side. Use the Prints and Self-Fulfilled tabs to switch between them quickly.

---

### Product Editor (STR-15.1.2)

**Navigation:** Dashboard > Store > Products > [Product Name]

**Layout:** A breadcrumb trail at the top shows your navigation path (Store / Products / Product Name). Below it, the editor uses a two-column layout:

**Left column (form area):**

- **Product Name** -- text input field
- **Type Selector** -- dropdown to choose product type (Print, Digital, Album, Package, Self-Fulfilled)
- **Description** -- rich text area for product details
- **Bulk Markup Tool** -- apply a percentage markup across all variations in one action

**Right column (460px panel):**

- **Image Preview** -- product mockup with the client's photo overlaid, showing how the final product will look
- **Pricing Section** -- displays the variation pricing table

**Variation Pricing Table:**

The heart of the product editor is the variation matrix. This table maps size against paper/finish type, with three value columns per cell:

| Size | Paper Type | Cost (Lab) | Markup | Client Price |
|------|-----------|------------|--------|-------------|
| 8x10 | Lustre | $8.00 | $12.00 | $20.00 |
| 8x10 | Metallic | $10.00 | $15.00 | $25.00 |
| 11x14 | Lustre | $12.00 | $18.00 | $30.00 |
| 11x14 | Metallic | $15.00 | $20.00 | $35.00 |

- **Cost** is set by your lab partner (read-only for auto-fulfilled products).
- **Markup** is your profit margin -- editable per variation.
- **Client Price** = Cost + Markup (calculated automatically).

You can enter prices manually or use the Bulk Markup Tool to apply a percentage across an entire product category.

**Key interactions:**

- Click any cell in the markup column to edit that variation's price.
- Use the Bulk Markup Tool to set a uniform margin (e.g., 200%) across all sizes at once.
- Upload or change the product mockup image from the right panel.

**Tip:** Use the Bulk Markup Tool first to set a baseline, then fine-tune individual variations. High-demand sizes like 8x10 and 11x14 often support higher margins.

---

### Order Management (STR-15.1.3)

**Navigation:** Dashboard > Store > Orders

**Layout:** A filterable order table with status-based views. The top of the page includes filter tabs for order status.

**Order Table Columns:**

| Column | Description |
|--------|-------------|
| Order Number | Unique identifier (e.g., #1042) |
| Client | Client name |
| Date | Order date |
| Total | Order total amount |
| Status | Badge -- Processing (gold), Shipped (blue), Delivered (green) |
| Fulfillment | Auto (lab) or Self-Fulfilled |

**Order Detail View:**

Click any order row to expand its detail, which shows:

- **Items ordered** -- product name, size, finish, quantity, price per item
- **Shipping address** -- client's delivery address
- **Payment info** -- payment method, transaction ID, amount
- **Tracking** -- carrier, tracking number (editable for self-fulfilled orders)
- **Fulfillment actions** -- for self-fulfilled orders, buttons to mark as Shipped and enter tracking info

**Key interactions:**

- Filter by status using the tab bar (All / Processing / Shipped / Delivered).
- Click an order row to view full details.
- For self-fulfilled orders, use the "Mark as Shipped" button and enter a tracking number.
- Auto-fulfilled orders show lab status updates automatically.

**Tip:** Enable email notifications for new orders so you never miss a self-fulfilled order that needs your attention. Auto-fulfilled orders are sent to the lab automatically -- no action needed from you.

---

### Price Sheet Management (STR-15.1.4)

**Navigation:** Dashboard > Store > Price Sheets

Price sheets let you assign different pricing to different collections. For example, you might offer lower prices for mini-session galleries and premium pricing for wedding galleries.

- **List view** shows each price sheet's name, product count, and the number of collections it is assigned to.
- **Create/Edit** view lets you select which products to include, set pricing, and assign the sheet to one or more collections.
- A default price sheet can be set for all new collections.

**Tip:** Create a "Download Only" price sheet with just digital products for galleries where you want to offer downloads but not prints.

---

### Coupon & Gift Card Management (STR-15.1.5)

**Navigation:** Dashboard > Store > Promotions

**Coupon List** displays: code, type (% off / $ off / free giveaway), usage count, expiry date, and status. The "+ Create Coupon" button opens a form with fields for:

- **Type selector** -- percentage off, fixed amount off, or free giveaway
- **Amount** -- discount value
- **Minimum order** -- optional threshold
- **Expiry date** -- when the coupon expires
- **Usage limit** -- maximum number of redemptions

**Gift Card List** displays: code, original amount, remaining balance, expiry date. The "+ Create Gift Card" button opens a form for:

- **Amount** -- dollar value
- **Expiry** -- optional expiration date
- **Delivery method** -- branded email to recipient or manual code generation

**Tip:** Enable the coupon banner in your gallery settings to display a promotional bar at the top of your storefront. Clients will see the code and discount automatically.

---

## Client Storefront

The shopping experience your clients see when they browse and purchase from your store.

### Storefront Browse (STR-15.2.1)

**Navigation:** [Your Gallery URL] > Store

**Layout:**

- **Top bar** -- store navigation with your branding and a cart icon displaying an item count badge.
- **Desktop:** A 200px category sidebar on the left lists product categories (All, Prints, Digital, Albums, etc.). The main area shows a 3-column product grid.
- **Mobile:** The category sidebar collapses into a horizontal tab bar at the top. Products stack into a single column.

**Product Grid Cards** show:

- Product mockup image with the client's photo overlaid
- Product name below the image
- Starting price (e.g., "From $20.00")

**Key interactions:**

- Click a category in the sidebar (desktop) or tab bar (mobile) to filter products.
- Click any product card to open its detail page.
- The cart icon in the top bar updates its count badge in real time as items are added.

---

### Product Detail (STR-15.2.2)

**Navigation:** Store > [Product Name]

**Layout:** The product detail page splits into two sections:

- **Left area** -- large product image with the client's photo overlaid on the product mockup.
- **Right panel (440px)** -- product information and purchase controls.

**Right panel contents (top to bottom):**

1. **Product name** -- displayed in the body font
2. **Description** -- product details text
3. **Size selector** -- row of selectable size options. The selected size uses a gold (#C9A962) background with dark text. Unselected options use a bordered style on the dark surface.
4. **Finish selector** -- similar row for paper/finish type (Lustre, Metallic, etc.), also with gold selected state.
5. **Quantity controls** -- minus (-) and plus (+) buttons using Lucide icons flanking the current quantity number.
6. **Price** -- displayed in Cormorant Garamond at 36px in gold (#C9A962). Updates dynamically when size or finish selection changes.
7. **Add to Cart** -- full-width gold primary button.

**Key interactions:**

- Tap a size option to select it. The price updates immediately.
- Tap a finish option to refine the selection. Price updates again if the variation has a different cost.
- Use the +/- buttons to adjust quantity. The minimum is 1.
- "Add to Cart" adds the configured item and shows a brief toast confirmation.

**Tip:** Size and finish selectors use the gold highlight to make your current selection unmistakable against the dark background.

---

### Shopping Cart (STR-15.2.3)

**Navigation:** Click the cart icon in the top bar from any store page.

**Layout:** The cart page lists all added items with an order summary section.

**Cart Item Row:**

- **Thumbnail** -- 80x80px product preview image
- **Product details** -- name, selected size, selected finish
- **Quantity controls** -- minus/plus buttons (Lucide icons) with the count between them
- **Price** -- line item total
- **Remove** -- button to delete the item from cart

**Order Summary Section:**

| Line | Value |
|------|-------|
| Subtotal | Sum of all items |
| Shipping | Estimated shipping cost |
| Coupon Code | Text input + "Apply" button |
| Gift Card | Text input + "Apply" button |
| **Total** | **Final amount** |

A gold "Checkout" button sits below the summary.

**Key interactions:**

- Adjust quantity directly in the cart. The subtotal and total update in real time.
- Enter a coupon code and click "Apply" to see the discount reflected immediately.
- Enter a gift card code and click "Apply" to deduct the balance from the total.
- Remove items with the delete button on each row.

**Tip:** Coupon codes and gift cards can be stacked. Apply a coupon first, then a gift card to the remaining balance.

---

### Checkout (STR-15.2.4)

**Navigation:** Cart > Checkout

**Layout:** A 3-step checkout flow with a step indicator at the top showing progress through:

```
(1) Shipping  -->  (2) Payment  -->  (3) Confirmation
```

The active step is highlighted in gold. Completed steps show a checkmark.

**Step 1 -- Shipping:**

- **Contact fields** -- name, email, phone
- **Shipping address** -- street, city, province/state, postal code, country
- **Delivery method** -- selectable options (Standard, Express, etc.) with pricing for each
- "Continue to Payment" button

**Step 2 -- Payment:**

- **Order summary sidebar** -- itemized list with subtotal, shipping, tax, discounts, and total
- **Payment method tabs** -- Card, Apple Pay / Google Pay, PayPal
- **Card input** -- card number, expiry, CVC fields (Stripe Elements)
- **Coupon / Gift Card** -- input fields if not already applied in cart
- "Place Order" gold primary button with the total amount displayed

**Step 3 -- Confirmation:**

- Success check icon in green (#6E9E6E)
- "Order Confirmed" heading
- Order summary: items, total, shipping address, estimated delivery date
- "Continue Browsing" link

**Key interactions:**

- Navigate between steps using the Continue/Back buttons. You can return to previous steps to edit.
- Payment processes through Stripe. Card information never touches the Anansi server.
- Digital-only orders skip the shipping step entirely.

---

## Cart & Payments

### CartService State Management

The cart is managed by a CartService that persists across all store routes. Key behaviors:

- **Cart state** is maintained as the client navigates between product pages, the cart, and checkout.
- **Session persistence** -- the cart survives page refreshes and navigation within the gallery/store.
- **Real-time updates** -- adding items from a product page immediately reflects in the cart icon count badge.
- **Quantity validation** -- the service enforces minimum quantities and prevents invalid states.

### Stripe Integration

All card payments process through Stripe:

- **Stripe Elements** renders the card input fields directly, ensuring PCI compliance.
- **Digital wallets** (Apple Pay, Google Pay) appear automatically when the client's device supports them.
- **PayPal** is available as an alternative payment method if the photographer has connected their PayPal account.
- **Offline payments** can be recorded by the photographer for cash or check transactions.

Transaction fees: 2.9% + $0.30 per card/wallet transaction. No additional platform commission on paid plans.

### Coupon & Gift Card Support

- **Coupons** support percentage off, fixed amount off, and free giveaway types. Each coupon can have an expiration date, usage limit, and minimum order threshold.
- **Gift cards** carry a stored dollar balance. Partial redemption saves the remaining balance for future purchases. Gift cards can be delivered via branded email or as a manual code.
- Both can be applied during checkout. Coupons adjust the subtotal; gift cards reduce the final amount after all other calculations.

**Tip:** As the photographer, you can purchase prints at cost for your own use. Create a 100% discount coupon for personal orders, or use the "Purchase at Cost" option in your admin settings.

---

## Quick Reference

| Task | Navigation |
|------|-----------|
| Add a product | Dashboard > Store > Products > + Add Product |
| Edit pricing | Dashboard > Store > Products > [Product] > Variation table |
| View orders | Dashboard > Store > Orders |
| Create a coupon | Dashboard > Store > Promotions > + Create Coupon |
| Create a gift card | Dashboard > Store > Promotions > + Create Gift Card |
| Manage price sheets | Dashboard > Store > Price Sheets |
| Configure shipping | Dashboard > Store > Settings > Shipping |
| Configure taxes | Dashboard > Store > Settings > Tax |
