# 1. Getting Started

This section covers everything from creating your account to choosing a plan. By the end you will be signed in and ready to explore the platform.

---

## Creating an Account

**Design ID:** AUTH-19.1.1 (desktop), AUTH-19.1.2 (mobile)

### Desktop Layout (1440px viewport)

The Sign Up screen presents a single centered card (480px wide) over the dark `#1A1A1C` background. The card surface uses `#242426` with a 20px corner radius and a subtle 1px `#3A3A3C` border.

**Card contents from top to bottom:**

1. **Logo** -- The gold "Anansi" wordmark rendered in Cormorant Garamond at 28px, colored `#C9A962`, centered at the top of the card.
2. **Heading** -- "Create Your Account" in Inter 20px semibold, `#F5F5F0` text, centered below the logo with 24px spacing.
3. **Form fields** -- Four stacked input fields, each full-width within the card with 16px vertical gaps:
   - Email address
   - Password (with show/hide toggle icon from Lucide)
   - First name and Last name (displayed as a two-column row)
   - Business name
4. **Create Account button** -- Full-width primary button with `#C9A962` gold background, dark text, 12px corner radius, 48px height.
5. **Divider** -- A horizontal line with centered "or" text in `#8A8A8D` at 14px.
6. **Google sign-in button** -- Full-width outline button with a Google icon on the left, `#3A3A3C` border, `#F5F5F0` text.
7. **Sign-in link** -- "Already have an account? Sign In" in Inter 14px, with "Sign In" rendered as a `#C9A962` gold link. Centered at the bottom of the card with 20px top spacing.

The entire card has 40px internal padding on all sides.

### Mobile Layout (402px viewport)

On mobile the card stretches full-width with 28px horizontal padding from the screen edges. All elements remain stacked vertically. The first/last name fields switch from a two-column row to a single column. The logo size and font sizes stay the same to maintain brand presence on smaller screens.

### How It Works

1. Enter your email, choose a password, fill in your name and business name.
2. Tap **Create Account**.
3. The system creates your photographer profile and returns an authentication token. You are immediately signed in and taken to the plan selection screen (AUTH-19.1.6).

> **Tip:** You can also sign up with Google. Tapping the Google button opens an OAuth consent screen. Your name and email are pulled from your Google account; you will still be asked for a business name on the next screen.

> **Note:** Passwords must be at least 8 characters. The platform stores hashed passwords and never displays them in plain text.

---

## Signing In

**Design ID:** AUTH-19.1.3 (desktop), AUTH-19.1.4 (mobile)

### Desktop Layout

The Sign In screen uses the same centered 480px card layout as Sign Up. The card contents are:

1. **Logo** -- Gold "Anansi" wordmark (Cormorant Garamond 28px, `#C9A962`), centered.
2. **Heading** -- "Welcome Back" in Inter 20px semibold, `#F5F5F0`.
3. **Form fields** -- Two stacked inputs with 16px gap:
   - Email address
   - Password (with show/hide toggle)
4. **Forgot password link** -- Right-aligned below the password field, Inter 14px, `#C9A962` gold text. Navigates to the password recovery flow.
5. **Sign In button** -- Full-width gold primary button (`#C9A962`), 48px height.
6. **Divider** -- Horizontal line with centered "or" text.
7. **Google sign-in button** -- Full-width outline button with Google icon.
8. **Sign-up link** -- "Don't have an account? Sign Up" centered at the bottom, with "Sign Up" as a `#C9A962` link.

### Mobile Layout

Same full-width adaptation as the Sign Up mobile screen with 28px padding.

### Navigation

- Direct URL: the default route when not authenticated.
- From the Sign Up screen: tap the "Already have an account? Sign In" link.

> **Tip:** The platform issues a JWT token on successful sign-in with a refresh token for seamless session continuation. You stay signed in until you explicitly sign out or the refresh token expires.

---

## Password Recovery

Password recovery is a three-step flow, each step presented on its own screen within the same centered 480px card layout.

### Step 1: Enter Email

**Design ID:** AUTH-19.1.5A

**Card contents:**

1. **Logo** -- Gold "Anansi" wordmark, same as other auth screens.
2. **Heading** -- "Reset Password" in Inter 20px semibold.
3. **Instructions** -- "Enter the email address associated with your account and we'll send you a link to reset your password." in Inter 14px, `#A0A0A3` secondary text, centered.
4. **Email field** -- Single full-width input.
5. **Send Reset Link button** -- Full-width gold primary button.
6. **Back to Sign In link** -- Centered at the bottom, Inter 14px, `#C9A962` link text.

**What happens:** The system sends a password reset email containing a unique, time-limited token. The API endpoint accepts a `ForgotPasswordCommand` with the email address.

### Step 2: Check Your Email

**Design ID:** AUTH-19.1.5B

**Card contents:**

1. **Mail icon** -- A Lucide `mail` icon rendered at 48px in `#C9A962` gold, centered at the top.
2. **Heading** -- "Check Your Email" in Inter 20px semibold.
3. **Instructions** -- "We've sent a password reset link to [email]. Please check your inbox and click the link to continue." in Inter 14px, secondary text. The email address is displayed in `#F5F5F0` bold.
4. **Resend link** -- "Didn't receive it? Resend" with "Resend" as a `#C9A962` link. Includes a 60-second cooldown timer shown inline.
5. **Back to Sign In link** -- Centered at the bottom.

This is a confirmation screen only; no form submission occurs here.

### Step 3: Set New Password

**Design ID:** AUTH-19.1.5C

The user reaches this screen by clicking the link in their email. The link contains a reset token.

**Card contents:**

1. **Logo** -- Gold "Anansi" wordmark.
2. **Heading** -- "Set New Password" in Inter 20px semibold.
3. **New password field** -- Full-width input with show/hide toggle.
4. **Confirm password field** -- Full-width input with show/hide toggle.
5. **Password requirements** -- A small checklist below the confirm field showing requirements (minimum 8 characters, etc.) with Lucide `check` icons turning green (`#6E9E6E`) as each requirement is met.
6. **Reset Password button** -- Full-width gold primary button.

**What happens:** The `ResetPasswordCommand` sends the token and new password to the API. On success the user is redirected to the Sign In screen with a toast notification: "Password reset successfully. Please sign in with your new password."

> **Tip:** Reset links expire after a limited time for security. If your link has expired, return to Step 1 and request a new one.

---

## Choosing a Plan

**Design ID:** AUTH-19.1.6

After creating an account (or accessible later from Settings), the plan selection screen helps you choose the right tier for your business.

### Screen Layout

The screen uses the full 1440px viewport width with a dark `#1A1A1C` background. At the top is a step indicator showing your progress through onboarding, with the current step highlighted in gold (`#C9A962`).

Below the step indicator:

1. **Heading** -- "Choose Your Plan" in Cormorant Garamond 32px, `#F5F5F0`, centered.
2. **Billing toggle** -- A pill-shaped toggle (Monthly / Annual) centered below the heading. The annual option shows a savings badge (e.g., "Save 20%") in `#6E9E6E` sage green.
3. **Product tab bar** -- Horizontal tabs to switch between product-specific plans:
   - Client Gallery
   - Website Builder
   - Studio Manager
   - Suite (All-in-One)

### Pricing Cards

Each tab displays its available tiers as horizontal pricing cards. Cards use `#242426` surfaces with 20px radius, 1px `#3A3A3C` borders, and 32px internal padding.

#### Client Gallery Tiers

| Tier | Storage | Key Features | Store Commission |
|------|---------|-------------|-----------------|
| **Free** | 3 GB | Unlimited galleries, basic features | 15% |
| **Basic** | 10 GB | Custom domain, branding removal | 0% |
| **Plus** | 100 GB | Expanded video support | 0% |
| **Pro** | 1 TB | Auto-fulfillment, coupons, RAW support, 4K video | 0% |
| **Ultimate** | Unlimited | Unlimited storage and video | 0% |

#### Website Builder Tiers

| Tier | Pages | Key Features |
|------|-------|-------------|
| **Free** | 15 pages, 100 photos, 5 blog posts | Basic templates, platform subdomain |
| **Plus** | Unlimited | Custom domain, analytics, unlimited blog posts |
| **Pro** | Unlimited | Custom code, URL redirects, AI tools |

#### Studio Manager Tiers

| Tier | Contracts | Session Types | Key Features |
|------|-----------|--------------|-------------|
| **Free** | 3 | 1 | Unlimited invoices, basic CRM |
| **Plus** | Unlimited | 3 | Expanded features |
| **Pro** | Unlimited | Unlimited | Full features, branding removal |

#### Suite (All-in-One) Bundles

| Tier | Storage | Video | Session Types | Savings |
|------|---------|-------|--------------|---------|
| **Starter** | 100 GB | 1 hr | 3 | Up to 37% vs. individual plans |
| **Pro** | 2 TB | 4 hr | Unlimited | Up to 37% vs. individual plans |
| **Ultimate** | Unlimited | 10 hr | Unlimited | Up to 37% vs. individual plans |

### Card Anatomy

Each pricing card contains:

- **Tier name** in Inter 18px semibold, `#F5F5F0`
- **Price** in Cormorant Garamond 36px bold, `#C9A962` gold (monthly or annual rate depending on the toggle)
- **Feature list** with Lucide `check` icons in `#6E9E6E` sage green for included features and `x` icons in `#666` for unavailable features
- **Select Plan button** -- Gold primary button for paid tiers, outline button for the Free tier

The recommended or most popular tier is highlighted with a gold `#C9A962` border (2px) and a "Most Popular" badge at the top-right corner of the card.

### How It Works

1. Toggle between Monthly and Annual billing. Annual billing provides a discount.
2. Browse the product tabs to compare what each product offers at each tier.
3. If you want everything bundled, switch to the **Suite** tab for the all-in-one pricing.
4. Tap **Select Plan** on your chosen tier. Free plans activate immediately with no credit card required. Paid plans redirect to a Stripe checkout for payment details.
5. After plan activation you are taken to the Studio Manager Dashboard.

> **Tip:** You can change your plan at any time from **Settings > Plan & Billing**. Upgrades and downgrades are prorated so you only pay the difference.

> **Note:** The Free tier across all products is fully functional with storage and feature limitations. You can start free and upgrade as your business grows -- no trial period, no credit card required.

---

## What Happens Next

Once you have created your account and selected a plan, you land on the **Studio Manager Dashboard** (covered in the [next section](02-studio-manager.md)). From there you can:

- Add your branding (logo, colors, fonts) in Settings
- Create your first contact
- Upload your first gallery
- Build your website
- Set up your booking site

Each of these workflows is covered in detail in the sections that follow.
