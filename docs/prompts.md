# Barbellist — Complete Implementation Document

## Project Overview

**Barbellist** is a multi-tenant gym management SaaS platform for independent gyms worldwide. It replaces paper registers with a connected digital system covering members, fees, attendance, staff, expenses, inventory, and owner analytics.

**Current Project State:**
- Next.js 16 project is ALREADY scaffolded (app/, components/, lib/ folders exist)
- Landing page is ALREADY live at barbellist.com — do NOT rebuild it
- Backend is Next.js Server Actions (`src/actions/`) + Route Handlers (`app/api/`) — no separate backend
- Supabase is connected via MCP in Cursor
- UI designs for ALL screens already exist in `designfiles/` folder — TRANSLATE THEM EXACTLY, do not redesign

**Design Files Location (source of truth for ALL UI):**
- `designfiles/GymFlow Mockups.dc.html` — all app screens (dashboard, members, fees, attendance, staff, expenses, inventory, cards, kiosk, reports)
- `designfiles/Sidebar.dc.html` — sidebar/navigation design
- `designfiles/Barbellist Deck.dc.html` — pitch deck screens
- `designfiles/Barbellist Landing/` — landing page (already deployed)
- `designfiles/screenshots/` — exported screen images for reference

**CRITICAL DESIGN RULE:** Before building ANY screen, open the corresponding design file and translate it pixel-for-pixel to Next.js 16 + Mantine UI + vanilla CSS. Do NOT invent new layouts, colors, or component styles. The designs are the spec.

**Tech Stack:**
- Frontend: Next.js 16 (App Router, Server Components, Server Actions)
- UI: **Mantine UI only** + pure vanilla CSS (NO Tailwind)
- Data layer: Supabase (Auth, Database, Realtime, Storage, RLS) via Server Actions + Route Handlers
- Styling: Mantine theme/components + vanilla CSS (`globals.css`, CSS Modules)
- Deployment: Cloudflare Pages via `@cloudflare/next-on-pages`
- Supabase connection: via MCP in Cursor
- Icons: Lucide React
- Charts: Recharts
- QR Generation: `qrcode` npm package
- Card PDF Generation: `@react-pdf/renderer` or Puppeteer (server-side)
- WhatsApp Integration: WhatsApp Business Cloud API (Meta)

**Brand Palette:**
- Forest Green: `#1B5E3C` (primary)
- Amber/Gold: `#C9861B` (accent)
- Off-white: `#FAF7F2` (background)
- Charcoal: `#1F1F1F` (text)
- Soft grey: `#E8E5DF` (dividers)

**Multi-Tenant Strategy:**
- Single database, shared schema
- Every table has a `gym_id` column (except `gyms` itself)
- Row Level Security (RLS) on every table, filtering by `gym_id` derived from the authenticated user's metadata
- A user belongs to exactly one gym (stored in `auth.users.raw_user_meta_data.gym_id`)
- Supabase Auth handles authentication; role is stored in user metadata (`owner`, `manager`, `cashier`, `trainer`, `cleaner`)


## Prompt Sequence

Each prompt below is a self-contained unit. Run them sequentially in Cursor. Each prompt assumes the previous ones are complete.

### ⚠️ UNIVERSAL RULE FOR ALL PROMPTS BELOW:
Before building ANY screen, **OPEN the corresponding design from `designfiles/GymFlow Mockups.dc.html`** (or `Sidebar.dc.html` for navigation) and **translate the design EXACTLY to Next.js 16 + Mantine + vanilla CSS.** Do NOT invent new layouts or deviate from the mockups. The designs are the spec — your job is faithful translation, not redesign.

---

### PROMPT 1: Supabase Setup, Auth & Dashboard Layout

```
You are building "Barbellist" — a multi-tenant gym management SaaS.

PROJECT STATE:
- Next.js 16 project is ALREADY scaffolded (app/, components/, lib/ exist)
- Landing page is ALREADY live at barbellist.com — do NOT touch it
- UI designs for ALL screens exist in `designfiles/` — you MUST match them exactly

TECH STACK:
- Next.js 16 (App Router, Server Components, Server Actions)
- Supabase (Auth, DB, Realtime, Storage) — connect via MCP
- Tailwind CSS 4 (already configured)
- Lucide React for icons
- Deploy target: Cloudflare Pages

DESIGN REFERENCE:
- OPEN `designfiles/Sidebar.dc.html` — match the sidebar navigation EXACTLY (colors, icons, layout, active states)
- OPEN `designfiles/GymFlow Mockups.dc.html` — look at the Owner Dashboard screen for layout reference (top bar, greeting, overall page structure)

STEP 1 — INSTALL DEPENDENCIES & SUPABASE SETUP:
1. Install: @supabase/supabase-js, @supabase/ssr, lucide-react, recharts, qrcode, jose (for JWT/QR token signing), react-hook-form, @hookform/resolvers, zod, sonner (toast)
2. Set up Supabase client utilities:
   - lib/supabase/client.ts (browser client)
   - lib/supabase/server.ts (server client using cookies)
   - lib/supabase/proxy.ts (auth session refresh for route protection)
3. Set up Next.js proxy.ts at root that:
   - Refreshes Supabase auth session
   - Redirects unauthenticated users from /dashboard/* to /login
   - Redirects authenticated users from /login to /dashboard
4. Create environment variables template (.env.local.example):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - QR_SIGNING_SECRET (for signing QR tokens)
   - WHATSAPP_API_TOKEN (placeholder)
   - WHATSAPP_PHONE_NUMBER_ID (placeholder)

STEP 2 — BRAND THEME & LAYOUT SHELL:
1. Extend Tailwind config with the Barbellist brand palette (if not already):
   - primary: #1B5E3C (forest green)
   - accent: #C9861B (amber/gold)
   - background: #FAF7F2 (off-white)
   - foreground: #1F1F1F (charcoal)
   - muted: #E8E5DF (soft grey)
2. Create the authenticated layout at app/(dashboard)/layout.tsx:
   - **MATCH the sidebar design from `designfiles/Sidebar.dc.html` EXACTLY** — same nav items, icons, colors, active state styling, bottom user section
   - Nav items: Dashboard, Members, Staff, Attendance, Fees, Expenses, Inventory, Packages, Cards, Reports, Settings
   - Top bar: gym name (from context), user avatar, notification bell placeholder
   - Sidebar collapsible on mobile (hamburger toggle)
3. Create a GymProvider context (React context) that:
   - Fetches the current user's gym data from Supabase on mount
   - Provides gym_id, gym name, currency, user role to all children
   - Provides the Supabase client instance

STEP 3 — AUTH PAGES:
1. app/(auth)/login/page.tsx — email + password login form
2. app/(auth)/signup/page.tsx — gym registration form:
   - Gym name, owner name, email, password, phone, city, country
   - On submit: create gym row, create auth user with gym_id and role='owner' in user_metadata, create staff row for owner
3. Style both pages with Barbellist branding — centered card on off-white background, forest green primary button, amber accents
4. Add loading states, error handling, and form validation (Zod) throughout

STEP 4 — TYPES:
Create comprehensive TypeScript types in lib/types.ts that match EVERY table in the database schema provided. Use proper type unions for status/role/category enums.

FOLDER STRUCTURE after this prompt:
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  (dashboard)/
    layout.tsx
    dashboard/page.tsx (placeholder)
lib/
  supabase/
    client.ts
    server.ts
    proxy.ts
  constants.ts (brand colors, nav items)
  types.ts (TypeScript types matching DB schema)
components/
  ui/ (Button, Input, Card, Badge, Modal, Table — reusable primitives)
  sidebar.tsx
  top-bar.tsx
  gym-provider.tsx
middleware.ts
```

---

### PROMPT 2: Member Management (CRUD + Profiles)

```
CONTEXT: Barbellist gym management SaaS. Project scaffolded with auth, layout, and Supabase connected. Database schema already migrated. GymProvider context provides gym_id to all dashboard pages.

DESIGN REFERENCE — OPEN THESE BEFORE CODING:
- OPEN `designfiles/GymFlow Mockups.dc.html` and find the "Members List" screen — match EXACTLY
- OPEN `designfiles/GymFlow Mockups.dc.html` and find the "Member Profile" screen — match EXACTLY
- Match table layout, pill badge styles, filter chips, photo sizes, spacing, colors pixel-for-pixel

BUILD THE MEMBER MANAGEMENT MODULE:

PAGE 1 — Members List (app/(dashboard)/members/page.tsx):
- Server Component that fetches members for current gym_id
- Search bar (searches name, phone, member_code)
- Filter chips: All | Active | Overdue | Due Soon | Frozen | New (this month)
- Sortable table columns: Photo (circular 40px) | Name | Member ID | Package | Fee Status | Last Check-in | Join Date | Actions
- Fee status as colored pill badges:
  - Green "Paid" — no overdue dues
  - Red "Overdue 12d" — has overdue fee_dues, show days count
  - Amber "Due in 3d" — due_date within next 7 days
  - Grey "Frozen" — status = frozen
- Fee status is computed by joining fee_dues table: check for any fee_due where status = 'overdue' or where due_date is within 7 days and status = 'pending'
- "+ Add Member" primary button top right → opens the onboarding wizard (Prompt 3)
- Pagination: 20 per page, cursor-based
- Empty state: designed, not just "No members" — show an illustration placeholder and "Add your first member to get started" CTA

PAGE 2 — Member Profile (app/(dashboard)/members/[id]/page.tsx):
- Hero header: large circular photo (120px), name, member_code, package tier as amber ribbon, active/overdue status badge, WhatsApp icon button (opens wa.me link), Call icon button (tel: link)
- Tabs below hero: Overview | Attendance | Payments | Progress | Notes
- OVERVIEW TAB (default):
  - Contact info card (phone, whatsapp, email, address, emergency contact)
  - Current package card with renewal countdown ("Expires in 18 days")
  - Attendance streak: last 30 days as small squares — green = attended, grey = missed (query attendance table for this member, last 30 days)
  - Health snapshot: BMI value with category label (Underweight/Normal/Overweight/Obese), weight, height
- ATTENDANCE TAB:
  - Monthly calendar view showing check-in days (green dots)
  - Total check-ins this month / streak count
  - Table of recent check-ins: date, time, method (QR/fingerprint/manual)
- PAYMENTS TAB:
  - Payment history table: Date | Amount | Method | Type | Period Covered | Recorded By
  - Outstanding dues section at top (from fee_dues where status != 'paid')
  - "Record Payment" button → opens payment modal
- PROGRESS TAB:
  - Weight/BMI over time chart (if multiple measurements exist — placeholder for now)
  - Fitness goals display
- NOTES TAB:
  - Simple notes list with add/edit/delete
- RIGHT SIDEBAR quick actions: Record Payment, Freeze Membership, Reprint Card, Edit Member, Delete Member (with confirmation)

SERVER ACTIONS needed:
- getMembersList(gym_id, filters, search, page)
- getMemberById(id)
- updateMember(id, data)
- deleteMember(id) — soft delete by setting status to 'cancelled'
- freezeMember(id, freeze_start, freeze_end, reason)
- unfreezeMember(id)

Use Supabase client from server components. All queries must filter by gym_id. Handle loading states with Suspense boundaries. Handle errors gracefully.
```

---

### PROMPT 3: Member Onboarding Wizard

```
CONTEXT: Barbellist. Members list page exists. Build the multi-step onboarding wizard for new members.

BUILD THE ONBOARDING WIZARD (app/(dashboard)/members/new/page.tsx):

A 4-step wizard with a progress indicator at top showing:
Step 1: Personal Info → Step 2: Health Assessment → Step 3: Package Selection → Step 4: Payment

STEP 1 — PERSONAL INFO:
- Fields: Name*, Phone*, WhatsApp, Email, Date of Birth, Gender (select), Address, Emergency Contact Name, Emergency Contact Phone
- Photo capture: either upload from device OR capture via webcam (use navigator.mediaDevices.getUserMedia for webcam — show live preview, capture button, retake button)
- Upload photo to Supabase Storage "member-photos" bucket
- Back button disabled (first step), Next button validates required fields

STEP 2 — HEALTH ASSESSMENT:
- Fields: Height (cm)*, Weight (kg)*, Fitness Goals (multi-select checkboxes: Weight Loss, Muscle Gain, General Fitness, Endurance, Flexibility, Rehabilitation)
- Auto-compute BMI on the client side as user types height/weight
- Show BMI result with color-coded category:
  - < 18.5: "Underweight" (amber)
  - 18.5–24.9: "Normal" (green)
  - 25–29.9: "Overweight" (amber)
  - 30+: "Obese" (red)
- Visual BMI gauge/indicator

STEP 3 — PACKAGE SELECTION:
- Fetch packages for this gym from Supabase
- Display as cards (3-column grid or scrollable on mobile)
- Each card: package name, price (formatted with gym's currency_symbol), duration, feature list, "Select" button
- ONE package gets an amber "Recommended for [Name]" badge — determined by:
  1. Match member's BMI range against package's bmi_min/bmi_max
  2. Match member's fitness_goals against package's recommended_goals
  3. Pick the package with the highest overlap score
- If no packages have BMI/goal data configured, just show all without recommendation
- Selected package gets a green border/highlight

STEP 4 — PAYMENT:
- Summary card: member name, selected package, price, period
- Payment method selector: 4 large pill buttons with recognizable styling — Cash, EasyPaisa (green tint), JazzCash (red tint), Bank Transfer
- Amount input pre-filled with package price
- "Full Amount" / "Partial" toggle — if partial, allow entering custom amount
- Notes field
- Checkbox: "Send WhatsApp receipt to member" (default checked if whatsapp number provided)
- "Complete Registration" button

ON SUBMIT (Server Action — createMemberWithPayment):
1. Insert member row with all data from steps 1-3, generate member_code via trigger
2. Generate signed QR token: sign the member ID + gym_id with QR_SIGNING_SECRET using jose (HS256 JWT), store as card_qr_token on the member
3. Set membership_start = today, membership_end = today + package.duration_days
4. Create a payment row for the initial payment
5. Create a fee_due row with status = 'paid' (or 'partial') for this period
6. Return the created member — redirect to member profile page
7. Show success toast with option to "Print Card" or "Add Another Member"

Handle all validation, loading states, and error cases. Wizard state should persist across steps (use React state, not URL params — losing state on back-navigation would be frustrating).
```

---

### PROMPT 4: Fee Management & Payment Recording

```
CONTEXT: Barbellist. Members exist with profiles. Build fee tracking and payment recording.

BUILD FEE MANAGEMENT:

PAGE — Fees Overview (app/(dashboard)/fees/page.tsx):
- Top summary cards (3):
  - "Collected This Month" (green) — sum of payments this month
  - "Outstanding" (red) — sum of fee_dues where status IN ('pending', 'overdue', 'partial')
  - "Due This Week" (amber) — fee_dues where due_date within next 7 days and status = 'pending'
- Filter bar: date range picker, status filter (All, Paid, Pending, Overdue, Partial, Waived)
- Table: Member Photo | Member Name | Amount Due | Amount Paid | Balance | Due Date | Status (pill) | Days Overdue | Actions
- Actions per row:
  - "Record Payment" → opens payment modal
  - "Send Reminder" → triggers WhatsApp reminder (Prompt 9)
  - "Waive" → sets status to waived (owner/manager only)
- Sort by: due date, amount, days overdue
- Bulk action: select multiple → "Send Reminders to Selected"

PAYMENT MODAL (components/modals/record-payment-modal.tsx):
- Triggered from fees page, member profile, or members list
- Props: member (with their current outstanding dues)
- Top: member card (photo, name, package)
- Outstanding dues breakdown: list each unpaid fee_due with month and amount
- Total due calculated
- Payment method: 4 pill buttons (Cash, EasyPaisa, JazzCash, Bank Transfer)
- Amount input with "Full Amount" / "Partial" toggle
- If partial: amount can be less than total; distribute payment across oldest dues first (FIFO)
- Notes field
- Checkbox: "Send WhatsApp receipt to member"
- "Record Payment" button

SERVER ACTIONS:
- recordPayment(data):
  1. Insert payment row
  2. Update fee_dues: apply payment amount FIFO (oldest due first)
     - If payment fully covers a due: set status = 'paid', amount_paid = amount_due
     - If partially covers: set status = 'partial', increment amount_paid
  3. If WhatsApp receipt checked, queue a receipt message (just log to reminders table for now — actual sending in Prompt 9)
  4. Log to audit_log
- getFeesOverview(gym_id, filters)
- waiveFeeDue(fee_due_id) — set status = 'waived'

AUTOMATED FEE GENERATION (important business logic):
Create a utility function generateMonthlyDues(gym_id) that:
1. For each active member in the gym:
   - Check if a fee_due already exists for the current month (generated_for_month)
   - If not, create one with amount_due = member's package price, due_date = 1st of current month (or membership anniversary date), status = 'pending'
2. For any fee_due where due_date < today AND status IN ('pending', 'partial'):
   - Update status to 'overdue'
3. This function will be called via a Supabase Edge Function on a cron schedule (daily) — for now, just build the function as a server action that can be triggered manually from Settings, and document that it needs to be set up as a cron.

ROLE-BASED ACCESS:
- Owner, Manager, Cashier: can record payments
- Trainer, Cleaner: read-only on fees (show the page but hide action buttons)
- Only Owner can waive dues
```

---

### PROMPT 5: Attendance System (QR Check-In)

```
CONTEXT: Barbellist. Members and staff exist. QR tokens are generated for members during onboarding.

BUILD THE ATTENDANCE SYSTEM:

PAGE 1 — Attendance Live Feed (app/(dashboard)/attendance/page.tsx):
- Top: "Live Now" with pulsing green dot animation, "Currently in gym: 34 members · 6 staff"
  - These counts = attendance records for today where check_out_at IS NULL
- Segmented toggle: Members | Staff | All (default: All)
- Timeline feed of today's check-ins:
  - Each entry: photo (40px circle), name, time (formatted), method icon (QR / fingerprint / manual), fee status badge (for members)
  - Staff entries: amber left border, role badge next to name
  - Overdue members: red left border, "Overdue" badge
- Right sidebar:
  - Today's stats: total check-ins, unique members, peak hour so far
  - Staff attendance: "Clocked in: 6/8, Late arrivals: 1"
- Toggle for Today | This Week | This Month views (changes data range)
- Subscribe to Supabase Realtime on the attendance table — new insertions appear at the top of the feed automatically without refresh

PAGE 2 — Kiosk Mode (app/(dashboard)/attendance/kiosk/page.tsx):
- Full-screen mode (hide sidebar and top bar — separate layout or a flag)
- Large branded header: gym logo/name centered
- Two tabs: "Scan QR" (default) | "Manual Entry"
- QR TAB:
  - Use the device camera to scan QR codes (use a library like html5-qrcode or @yudiel/react-qr-scanner)
  - On scan:
    1. Decode the QR → extract the JWT token → verify signature with QR_SIGNING_SECRET using jose
    2. Extract member_id from token payload
    3. Look up member, check fee status (query fee_dues)
    4. Insert attendance record
    5. Show result screen:
       - SUCCESS (fees clear): green background, large member photo, "Welcome back, [Name]!", package badge, "All Clear ✓", check-in count this month, streak
       - WARNING (fees overdue): amber/red background, member photo, "Please see reception", "Fee overdue: Rs. 7,500 · 15 days" in red pill
    6. Auto-dismiss after 4 seconds (show countdown ring), return to scan screen
- MANUAL TAB:
  - Search field — type member name or code
  - Select from results → same check-in flow as QR

SERVER ACTIONS:
- checkInMember(member_id, method):
  1. Query member's fee status from fee_dues
  2. Insert attendance record with fee_status_at_checkin snapshot
  3. Return member info + fee status for display
- checkInStaff(staff_id, method):
  1. Insert attendance record with person_type = 'staff'
- getAttendanceFeed(gym_id, date_range, person_type_filter)
- getLiveGymCounts(gym_id) — count of today's check-ins without check-out

QR TOKEN STRUCTURE:
{
  "sub": "<member_id>",
  "gym": "<gym_id>",
  "iat": <issued_at_timestamp>,
  "type": "barbellist_member_card"
}
Signed with HS256 using QR_SIGNING_SECRET. Verify on scan.

REALTIME:
Subscribe to `attendance` table inserts filtered by gym_id. On new record, prepend to the feed list with a subtle slide-in animation.
```

---

### PROMPT 6: Smart Card Generation

```
CONTEXT: Barbellist. Members exist with QR tokens. Build the card generation system.

BUILD THE CARD GENERATOR:

PAGE — Cards (app/(dashboard)/cards/page.tsx):
- Split view layout (desktop): left 60% card preview, right 40% controls
- Mobile: stacked (controls on top, preview below)

LEFT PANEL — Card Preview:
- Render a membership card at standard ID card proportions (85.6mm × 54mm, displayed scaled up for preview)
- FRONT of card:
  - Background: forest green (#1B5E3C) with subtle geometric pattern
  - Gym logo/name: top-left, white text
  - Member photo: circular, 60px, right side or center
  - Member name: bold, white, prominent
  - Member code: smaller, below name
  - Package tier: amber ribbon/badge
  - QR code: bottom-right, white background square with QR rendered from card_qr_token
- BACK of card:
  - Gym contact info (phone, address)
  - Expiry date: membership_end formatted
  - Small text: "Scan QR code at kiosk for check-in"
  - Barbellist small watermark
- The card should be rendered as a React component using HTML/CSS (NOT canvas) — this makes it easy to iterate on design and also to export

RIGHT PANEL — Controls:
- Member selector: search dropdown, select a member → card preview updates live
- Auto-filled: name, photo, package, QR code, expiry
- Package tier color: pulled from package.color field
- Buttons:
  - "Print Card" (primary) → generates a print-optimized PDF/image:
    Use a server action that renders the card component to HTML, converts to PDF via Puppeteer or @react-pdf/renderer, returns download URL
    OR use client-side html-to-image library to capture the card div as PNG
  - "Send Digital Card via WhatsApp" (secondary) → generates card image, sends via WhatsApp API (queue for Prompt 9)
  - "Regenerate QR Code" → creates a new signed token, invalidates old one

BULK CARD GENERATION (for initial gym onboarding):
- "Generate All Cards" button → iterates through all members without card_issued_at, generates card images, packages as a ZIP or multi-page PDF
- Show progress bar during generation
- Mark card_issued_at and card_printed on each member after generation

SERVER ACTIONS:
- generateCardImage(member_id) → returns image/PDF buffer or URL
- regenerateQRToken(member_id) → new JWT, update card_qr_token in DB
- bulkGenerateCards(gym_id) → generates for all un-issued members
- markCardPrinted(member_id)

QR CODE RENDERING:
Use the 'qrcode' npm package to generate QR code as data URL from the member's card_qr_token value. Render it inside the card component as an <img>.
```

---

### PROMPT 7: Staff Management

```
CONTEXT: Barbellist. Auth and layout exist. Staff table is populated (at minimum the owner from signup).

BUILD STAFF MANAGEMENT:

PAGE 1 — Staff List (app/(dashboard)/staff/page.tsx):
- Similar layout pattern as Members List for consistency
- Filter chips: All | Trainers | Front Desk | Cleaners | Managers | Owner
- Search bar
- Table: Photo | Name | Role (colored badge) | Monthly Salary | Attendance This Month | Last Check-in | Status | Actions
- Role badge colors: Trainer = green, Cleaner = grey, Manager = amber, Cashier = charcoal, Owner = amber outlined
- Attendance column: "22/26 days" with a mini inline progress bar (attendance count / working days this month)
- "+ Add Staff Member" button (visible to owner/manager only)
- Add Staff modal:
  - Fields: Name*, Role* (select), Phone, WhatsApp, Email, Monthly Salary, Commission Rate (%), Joining Date, Photo upload
  - Optionally create a login account: toggle "Give app access" → shows email/password fields → creates Supabase auth user with role in metadata
  - On submit: insert staff row, optionally create auth user, upload photo

PAGE 2 — Staff Profile (app/(dashboard)/staff/[id]/page.tsx):
- Same structural pattern as Member Profile
- Hero: photo, name, role ribbon (amber), joining date, status, WhatsApp + Call buttons
- Tabs: Overview | Attendance | Salary History | Notes
- OVERVIEW TAB:
  - Contact info card
  - Role & monthly salary card with "Last paid: [date], Next due: [date]" (query expenses where category='salary' AND staff_id=this)
  - Attendance streak: last 30 days squares (same component as member profile)
  - For trainers: "X personal training sessions this month" (placeholder — count from attendance or a future PT session table)
- ATTENDANCE TAB:
  - Calendar view + table, same as member attendance but filtered for this staff member
- SALARY HISTORY TAB:
  - Table of all expenses where category='salary' AND staff_id = this staff member
  - Columns: Month | Amount | Payment Method | Paid On | Recorded By
  - "Record Salary Payment" button → opens the Record Expense modal pre-filled with category=salary and this staff member selected
- Quick actions sidebar: Record Salary Payment, Mark Absent Today, Edit, Deactivate

ROLE-BASED ACCESS:
- Only owner and manager can add/edit/deactivate staff
- Only owner can see salary information
- Staff members can view their own profile only (if they have app access)

SERVER ACTIONS:
- getStaffList(gym_id, filters)
- getStaffById(id)
- createStaff(data) — with optional auth user creation
- updateStaff(id, data)
- deactivateStaff(id) — set status to 'inactive'
```

---

### PROMPT 8: Expenses, Inventory & POS

```
CONTEXT: Barbellist. Staff exists (needed for expense recording and "recorded_by"). Members exist (needed for inventory sales linkage).

BUILD EXPENSES MODULE:

PAGE — Expenses (app/(dashboard)/expenses/page.tsx):
- Top summary cards (3):
  - "This Month's Expenses" with trend vs last month
  - "Salaries Paid This Month" (sum where category='salary', current month)
  - "Pending / Unpaid" (count + sum where status='pending') — amber alert style
- Filter bar: date range picker, category filter (All + each category), added-by filter, payment method filter
- "+ Record Expense" button
- Table: Date | Category (colored pill) | Description | Added By | Payment Method | Amount | Receipt icon | Actions
- Salary rows: amber left border to visually distinguish
- Category pill colors: Salary=amber, Utilities=blue-grey, Maintenance=charcoal, Cleaning=soft-green, Repairs=rust, Equipment=forest-green, Rent=purple-grey, Miscellaneous=neutral-grey

RECORD EXPENSE MODAL (components/modals/record-expense-modal.tsx):
- Category selector as pill buttons (all 8 categories)
- When "Salary" selected:
  - Show staff picker (search dropdown with photos)
  - Auto-fill amount from staff member's monthly_salary
  - "Full month / Partial / Advance" toggle
  - Month picker (which month is this salary for)
- Description text field
- Amount input (Rs.)
- Payment method: 4 pill buttons (Cash, EasyPaisa, JazzCash, Bank Transfer)
- "Added by" — auto-fill current user, dropdown to change
- Receipt upload (drag-drop zone or camera icon) → upload to Supabase Storage "receipts" bucket
- Notes field (optional)
- "Record Expense" primary button

BUILD INVENTORY MODULE:

PAGE — Inventory (app/(dashboard)/inventory/page.tsx):
- Top summary cards (3):
  - "Items in Stock" (count of active items)
  - "Low Stock Alerts" (count where stock_qty <= low_stock_threshold) — amber
  - "Sales This Month" (sum of inventory_sales.total this month) — green
- Filter bar: category, stock status (All, In Stock, Low, Out of Stock), search
- "+ Add Item" and "Record Sale" buttons
- Table: Photo (small thumbnail) | Item Name | Category | Stock Qty | Unit Cost | Selling Price | Margin % | Status | Actions
- Stock status pills: In Stock (green), Low Stock (amber when qty <= threshold), Out of Stock (red when qty = 0)
- Margin calculated: ((selling_price - unit_cost) / unit_cost * 100)

ADD ITEM MODAL:
- Fields: Name*, Category (select), Description, Photo upload, SKU, Unit Cost, Selling Price*, Initial Stock Qty*, Low Stock Threshold (default 5)

RECORD SALE MODAL (components/modals/record-sale-modal.tsx):
- Top: member picker (optional — "Sale to: [Search member] or Walk-in customer" toggle)
- Item search + add: search inventory items, click to add as line item
- Line items list: Item Name | Qty (stepper +/-) | Unit Price | Line Total | Remove
- Subtotal, optional discount field, calculated total
- Payment method pills: Cash, EasyPaisa, JazzCash, Bank Transfer, "Add to Member Tab" (only enabled when a member is selected — this creates a fee_due of type 'product' instead of processing payment)
- "Complete Sale" button

ON SALE SUBMIT:
1. Insert inventory_sales row
2. Insert inventory_sale_items rows for each line item
3. Trigger deduct_inventory_on_sale automatically reduces stock_qty
4. If payment_method = 'member_tab': create a fee_due for the member with amount = total, type info in notes
5. If a real payment method: insert a payment row linked to the member (if member selected)

SERVER ACTIONS for both modules:
- Expenses: getExpenses, createExpense, updateExpense, deleteExpense
- Inventory: getInventoryItems, createItem, updateItem, getInventorySales, createSale
```

---

### PROMPT 9: WhatsApp Reminders & Notifications

```
CONTEXT: Barbellist. Fee management, payments, and member data all exist. Build the WhatsApp notification system.

BUILD WHATSAPP INTEGRATION:

ARCHITECTURE:
- Use WhatsApp Business Cloud API (Meta) via direct HTTP calls
- API calls go through a server action or API route (NOT client-side — API token must stay server-side)
- All sent messages are logged in the `reminders` table

UTILITY: lib/whatsapp.ts
- sendWhatsAppMessage(to: string, templateName: string, templateParams: object): Promise<{success, messageId}>
  - POST to https://graph.facebook.com/v21.0/{WHATSAPP_PHONE_NUMBER_ID}/messages
  - Headers: Authorization: Bearer {WHATSAPP_API_TOKEN}
  - Body: standard WhatsApp Cloud API message format
  - Handle errors, rate limits, invalid numbers gracefully
  - Return the message ID for logging

TEMPLATE MESSAGES TO SUPPORT (these correspond to WhatsApp Business approved templates — the gym owner will need to create these in Meta Business Manager):

1. FEE_REMINDER_BEFORE_DUE:
   - "Hi {{1}}, your gym membership fee of {{2}} is due on {{3}}. Please visit the front desk or contact us to renew. Thank you! — {{4}}"
   - Params: member name, amount, due date, gym name

2. FEE_REMINDER_OVERDUE:
   - "Hi {{1}}, your gym membership fee of {{2}} is overdue by {{3}} days. Kindly clear your dues at the earliest. — {{4}}"
   - Params: member name, amount, days overdue, gym name

3. PAYMENT_RECEIPT:
   - "Hi {{1}}, we've received your payment of {{2}} for {{3}}. Thank you! Your membership is active until {{4}}. — {{5}}"
   - Params: member name, amount, period, expiry date, gym name

4. WELCOME_NEW_MEMBER:
   - "Welcome to {{1}}, {{2}}! Your Member ID is {{3}}. We're excited to have you. See you at the gym! 💪"
   - Params: gym name, member name, member code

SERVER ACTIONS:

sendFeeReminder(fee_due_id):
1. Fetch the fee_due with member details
2. Determine which template (before_due vs overdue)
3. Call sendWhatsAppMessage with member's whatsapp number
4. Insert reminders row with status, template, message body, external_id
5. Update fee_due: last_reminder_sent_at, increment reminder_count

sendPaymentReceipt(payment_id):
1. Fetch payment with member details and fee period
2. Call sendWhatsAppMessage with receipt template
3. Log to reminders table
4. Update payment: receipt_sent = true

sendBulkReminders(gym_id, filter: 'overdue' | 'due_soon'):
1. Fetch all matching fee_dues with member whatsapp numbers
2. Send reminders sequentially with 1-second delay between each (rate limit protection)
3. Return summary: {sent: X, failed: Y, skipped_no_whatsapp: Z}

UI INTEGRATION:
- On the Fees page: "Send Reminder" button per row, "Send Reminders to Selected" bulk action
- On the Member Profile payments tab: "Send Receipt" button per payment row
- On the Dashboard: "Send All Overdue Reminders" quick action
- Settings page: configure reminder schedule (e.g., "auto-send 3 days before due, again on due date, again 3 days after overdue") — store in gym.settings JSONB
- For now, auto-sending is manual-trigger or via a to-be-built cron. Build the settings UI and the function, document the cron setup needed.

FALLBACK: If WhatsApp API credentials are not configured (empty env vars), show a warning banner on Settings page: "WhatsApp reminders are not configured. Add your API credentials in Settings to enable automated reminders." All "send reminder" buttons should be disabled with a tooltip explaining this.
```

---

### PROMPT 10: Owner Dashboard

```
CONTEXT: Barbellist. All data modules exist (members, fees, payments, attendance, expenses, inventory, staff). Build the main dashboard.

BUILD THE OWNER DASHBOARD (app/(dashboard)/dashboard/page.tsx):

This is the first page the owner sees after login. It must load fast and feel alive.

TOP — Greeting:
- "Assalam-o-Alaikum, [Owner Name]" (or just "Good [morning/afternoon/evening], [Name]" based on time)
- Date: "Thursday, 10 July 2026 · Here's how [Gym Name] is doing today."

KPI ROW — 5 cards in a horizontal row (responsive: 2-3 per row on mobile):
1. "Active Members" — count of members where status = 'active'. Small text: "+X this month" (joined_at in current month)
2. "Revenue · [Month]" — sum of payments.amount this month. Forest green. Small text: "+X% vs [last month]"
3. "Expenses · [Month]" — sum of expenses.amount this month. Charcoal. Small text: trend vs last month
4. "Net Profit · [Month]" — revenue minus expenses. Large, amber background if positive. Show "+X% vs last month" trend chip
5. "Overdue Fees" — count of fee_dues where status = 'overdue'. Red text. Small text: "X members outstanding"

REVENUE VS EXPENSES VS PROFIT CHART:
- 6-month area/line chart using Recharts
- Forest green line: revenue (sum of payments per month)
- Charcoal line: expenses (sum of expenses per month)
- Amber filled area between them: profit
- X-axis: month labels, Y-axis: currency amounts
- Tooltip on hover showing exact values

EXPENSE BREAKDOWN THIS MONTH:
- Horizontal bar chart showing category totals
- Categories sorted by amount descending
- Forest green bars, amber highlight on largest
- Each bar labeled with category name and amount

TWO-COLUMN SECTION below:

LEFT — FEE ALERTS:
- List of top 10 overdue members (sorted by days overdue, descending)
- Each row: photo (32px), name, days overdue (red badge), amount, "Send Reminder" button
- "View all" link → goes to /fees filtered by overdue

RIGHT — AT-RISK MEMBERS:
- Members who haven't checked in for 10+ days (query: active members whose latest attendance.check_in_at is > 10 days ago or NULL)
- Each row: photo, name, "Last seen X days ago", "Call" button (tel: link)
- "View all" link → goes to /members filtered appropriately

BOTTOM — EXPIRING THIS WEEK:
- Horizontal scrollable cards for members whose membership_end is within the next 7 days
- Each card: photo, name, package, "Expires in X days", "Renew" button (→ payment modal)

DATA FETCHING:
- Use Server Components with parallel data fetching (Promise.all for all dashboard queries)
- Each section can be a separate async component with its own Suspense boundary and skeleton loader
- Queries needed:
  - Active member count + this month's new joins
  - Sum payments this month + last month (for trend)
  - Sum expenses this month + last month
  - Monthly revenue/expense totals for last 6 months (for chart)
  - Expense breakdown by category this month
  - Top 10 overdue fee_dues with member info
  - At-risk members (no attendance in 10+ days)
  - Members with membership_end in next 7 days

ROLE-BASED:
- Owner: sees everything including profit and expenses
- Manager: sees everything except profit numbers (replace with "—")
- Cashier: sees member count, revenue, overdue fees only
- Trainer/Cleaner: sees only member count and attendance stats
```

---

### PROMPT 11: Reports & Analytics

```
CONTEXT: Barbellist. All data modules populated. Build the reports page.

BUILD REPORTS (app/(dashboard)/reports/page.tsx):

Top: date range picker (default: current month) + "Export" button (CSV export of visible data)

REPORT GRID — 6 cards/charts in a responsive grid (3×2 on desktop, 1 column on mobile):

1. REVENUE TREND (line chart):
   - Monthly revenue over selected period (or last 6 months if period > 6 months)
   - Forest green line on light background

2. PROFIT TREND (line chart):
   - Monthly profit (revenue - expenses) over time
   - Amber line on light green tint background

3. NEW vs CHURNED (grouped bar chart):
   - Per month: green bars = new members (joined_at), red bars = churned (status changed to cancelled/expired)
   - Net growth line overlay

4. PACKAGE DISTRIBUTION (donut chart):
   - Count of active members per package
   - Use package.color for each segment, fallback to palette

5. PAYMENT METHOD BREAKDOWN (donut chart):
   - Percentage of payments by method (Cash, EasyPaisa, JazzCash, Bank Transfer, etc.)
   - Show real calculated percentages

6. ATTENDANCE HEATMAP:
   - 7 rows (days of week) × 24 columns (hours) grid
   - Color intensity = check-in count for that hour/day combination
   - Forest green intensity scale (white → light green → dark green)
   - Helps owner identify peak hours for staffing

7. TOP EXPENSE CATEGORIES (horizontal bar chart):
   - Same as dashboard but with the full selected date range, not just current month

All charts use Recharts with the Barbellist color palette. No default Recharts colors — override everything.

DATA QUERIES:
All queries parameterized by gym_id and the selected date range.
- Revenue by month: GROUP BY date_trunc('month', paid_at)
- Expenses by month: GROUP BY date_trunc('month', expense_date)
- Member joins by month: GROUP BY date_trunc('month', joined_at)
- Member churn by month: members whose status changed to cancelled/expired in that month (use updated_at or a status_changed_at if you want to add that column)
- Package distribution: GROUP BY package_id, JOIN packages for names
- Payment methods: GROUP BY payment_method on payments table
- Attendance heatmap: extract dow and hour from check_in_at, GROUP BY both, COUNT

EXPORT:
- "Export" button generates a CSV with: month, revenue, expenses, profit, new_members, churned_members, active_members
- Use a server action that runs the queries and returns CSV text, trigger download on client
```

---

### PROMPT 12: Packages & Settings

```
CONTEXT: Barbellist. All core features built. Build the configuration pages.

BUILD PACKAGES PAGE (app/(dashboard)/packages/page.tsx):
- Grid of package cards showing: name, price, duration, features list, BMI range (if set), recommended goals, active/inactive toggle, color swatch
- "+ Add Package" button
- Edit/delete actions on each card
- Add/Edit Package modal:
  - Name, Description, Price, Duration (select: 30/90/180/365 days or custom), Features (dynamic add/remove list), BMI range (min/max, optional), Recommended Goals (multi-select), Color picker, Sort order, Active toggle
- Drag-and-drop reorder (or manual sort_order input) for display order during onboarding

BUILD SETTINGS PAGE (app/(dashboard)/settings/page.tsx):

Sectioned form layout:

SECTION 1 — Gym Profile:
- Gym name, address, city, country, phone, WhatsApp, email
- Logo upload (Supabase Storage "gym-assets")
- Timezone selector, Currency selector

SECTION 2 — WhatsApp Configuration:
- WhatsApp API Token (masked input, only owner)
- WhatsApp Phone Number ID
- Test button: sends a test message to the owner's WhatsApp
- Reminder schedule config:
  - "Send reminder X days before due date" (number input, default 3)
  - "Send reminder on due date" (toggle, default on)
  - "Send overdue reminder every X days" (number input, default 3)
  - "Max reminders per due" (number input, default 5)
- Store all in gym.settings JSONB

SECTION 3 — Card Template:
- Card background color override
- Show/hide elements toggle (gym logo, member photo, QR, expiry)
- Preview of card with current settings

SECTION 4 — Staff & Roles:
- Table of current staff with role assignments
- Quick role change dropdown
- Invite new staff member (sends email invite)

SECTION 5 — Billing (read-only for now):
- Current plan: Early Bird / Standard / Pro
- Member count and current monthly cost
- "Contact support to change plan" link

SECTION 6 — Danger Zone:
- "Export All Data" — CSV export of all tables
- "Delete Gym" — requires typing gym name to confirm, irreversible

SERVER ACTIONS:
- updateGymSettings(gym_id, data)
- updateGymProfile(gym_id, data)
- testWhatsAppConnection(gym_id)
- exportAllData(gym_id) — generates ZIP of CSVs for all tables
```

---

### PROMPT 13: Landing Page — ALREADY DEPLOYED (Skip or Polish Only)

```
CONTEXT: Barbellist. The landing page is ALREADY live at barbellist.com. It was built separately and deployed.

⚠️ DO NOT REBUILD THE LANDING PAGE FROM SCRATCH.

The landing page design exists in `designfiles/Barbellist Landing/` for reference. It is already deployed and working.

ONLY do the following if needed:

1. Ensure routing works correctly:
   - "/" → landing page (public, already built)
   - "/login" → auth login page
   - "/signup" → auth registration page
   - "/dashboard" → authenticated app (requires auth)
2. Ensure "Start free" and "Sign In" buttons on the landing page correctly link to /signup and /login
3. If the landing page needs integration into the Next.js app (currently may be external/static), move it into app/(public)/page.tsx with a separate layout (no sidebar, no auth required)
4. Match the design from `designfiles/Barbellist Landing/` exactly if any changes are needed
5. Do NOT rebuild sections that already work — only fix routing/linking issues
```

---

### PROMPT 14: Polish, Edge Cases & Deployment

```
CONTEXT: Barbellist. All features built. Final polish pass.

TASK 1 — GLOBAL ERROR & LOADING STATES:
- Create app/(dashboard)/error.tsx — branded error boundary with "Something went wrong" message and retry button
- Create app/(dashboard)/loading.tsx — skeleton loaders matching each page's layout (use Tailwind animate-pulse)
- Create app/(dashboard)/not-found.tsx — branded 404 with "Go to Dashboard" link
- Ensure every page has appropriate Suspense boundaries with skeleton fallbacks

TASK 2 — MOBILE RESPONSIVENESS AUDIT:
- Sidebar: collapsible hamburger menu on mobile (< 768px)
- All tables: horizontally scrollable on mobile with sticky first column (name)
- All modals: full-screen on mobile, centered on desktop
- Dashboard KPI cards: 2 per row on mobile, scrollable
- Charts: respect container width, no overflow

TASK 3 — ROLE-BASED UI ENFORCEMENT:
Create a useRole() hook and a <RoleGate role={['owner', 'manager']}> component.
Audit every page and apply:
- Owner: full access everywhere
- Manager: everything except gym deletion, billing, WhatsApp config
- Cashier: Members (read), Fees (read + record payment), Attendance (read + check-in), Inventory (sales only)
- Trainer: Members (read), Attendance (read + own check-in), own Staff Profile
- Cleaner: Attendance (own check-in only), own Staff Profile

TASK 4 — TOAST NOTIFICATIONS:
- Implement a global toast system (use sonner or a custom toast component)
- Success: green, for all successful create/update actions
- Error: red, for failed operations
- Info: amber, for warnings (e.g., "WhatsApp not configured")

TASK 5 — DEPLOYMENT PREPARATION:
1. Install @cloudflare/next-on-pages as devDependency
2. Add wrangler.toml:
   - name = "barbellist"
   - compatibility_flags = ["nodejs_compat"]
   - pages_build_output_dir = ".vercel/output/static"
3. Update package.json scripts:
   - "pages:build": "npx @cloudflare/next-on-pages"
   - "pages:preview": "npx wrangler pages dev .vercel/output/static"
   - "pages:deploy": "npx wrangler pages deploy .vercel/output/static"
4. Ensure all server-side code is compatible with Cloudflare Workers edge runtime:
   - No Node.js-specific APIs that don't work on edge (fs, child_process, etc.)
   - If Puppeteer is used for card generation, move that to a Supabase Edge Function instead
5. Set environment variables in Cloudflare Pages dashboard (not in wrangler.toml)
6. Connect GitHub repo to Cloudflare Pages for automatic deploys on push to main

TASK 6 — SUPABASE EDGE FUNCTION FOR CRON:
Create a Supabase Edge Function: supabase/functions/daily-fee-check/index.ts
- Runs daily (configure via Supabase dashboard cron)
- Calls generateMonthlyDues() logic:
  1. For each gym: generate fee_dues for current month if not exists
  2. Mark overdue any pending dues past their due_date
  3. Send WhatsApp reminders for dues matching the gym's reminder schedule settings
- Use Supabase service role key (server-side, not user-scoped)

TASK 7 — SEED DATA:
Create a seed script (scripts/seed.ts) that:
1. Creates a demo gym "Iron Republic"
2. Creates staff: 1 owner, 2 trainers, 1 cashier, 2 cleaners, 1 manager
3. Creates 3 packages (Basic Rs. 4,500, Standard Rs. 7,500, Premium Rs. 12,000)
4. Creates 25 members with realistic Pakistani names, varied packages, varied fee statuses
5. Creates 60 days of attendance data (varied, realistic patterns)
6. Creates 2 months of expenses (mix of salary, utilities, maintenance, cleaning)
7. Creates inventory items (10 items: supplements, drinks, accessories)
8. Creates some inventory sales
9. All with proper gym_id references
Run with: npx tsx scripts/seed.ts
```

---

## Execution Order Summary

| # | Prompt | What It Builds | Depends On | Design File |
|---|--------|---------------|------------|-------------|
| 0 | DB Schema | Run SQL migration in Supabase | Nothing | N/A |
| 1 | Supabase Setup, Auth & Layout | Auth, sidebar, theme, types | Schema | `Sidebar.dc.html` |
| 2 | Member Management | Member list + profiles | Prompt 1 | `GymFlow Mockups` → Members List, Member Profile |
| 3 | Onboarding Wizard | New member registration | Prompt 2 | `GymFlow Mockups` → Onboarding Step 3 |
| 4 | Fee Management | Fee tracking + payments | Prompt 2 | `GymFlow Mockups` → Fee Management, Record Payment |
| 5 | Attendance | QR check-in + live feed + kiosk | Prompt 3 | `GymFlow Mockups` → Attendance Feed, Kiosk screens |
| 6 | Card Generation | Membership card builder | Prompt 3 | `GymFlow Mockups` → Card Generator |
| 7 | Staff Management | Staff CRUD + profiles | Prompt 1 | `GymFlow Mockups` → Staff List, Staff Profile |
| 8 | Expenses & Inventory | Expense tracking + POS | Prompt 7 | `GymFlow Mockups` → Expenses, Inventory, Record Sale |
| 9 | WhatsApp | Reminders + receipts | Prompt 4 | N/A (backend-only) |
| 10 | Dashboard | Owner analytics | All modules | `GymFlow Mockups` → Owner Dashboard |
| 11 | Reports | Charts + exports | All modules | `GymFlow Mockups` → Reports & Analytics |
| 12 | Packages & Settings | Configuration | Prompt 1 | `GymFlow Mockups` → Settings (if designed) |
| 13 | Landing Page | **ALREADY DEPLOYED** — routing fix only | Prompt 1 | `Barbellist Landing/` |
| 14 | Polish & Deploy | Final pass + deployment | Everything | All designs (audit pass) |

---

## Key Architecture Decisions

1. **Multi-tenancy via RLS, not schemas.** Single shared schema, every query filtered by gym_id via Supabase RLS. Simpler, cheaper, scales to thousands of gyms without schema management overhead.

2. **QR tokens are signed JWTs, not raw IDs.** Prevents fake QR codes. Verify signature on every scan. Tokens can be revoked by regenerating.

3. **Fee dues are pre-generated monthly, not computed on-the-fly.** This gives you a concrete row to track partial payments against, attach reminders to, and report on. The daily cron generates new dues and marks overdue ones.

4. **Attendance is a single unified table for members AND staff.** The person_type discriminator + check constraint keeps it clean while allowing one live feed view.

5. **Expenses include salaries as a category, not a separate table.** Keeps the accounting model simple. The amber-left-border visual distinction is a UI concern, not a data concern.

6. **Inventory sales can be added to a "member tab" (deferred payment).** This creates a fee_due rather than a payment, keeping the financial model consistent.

7. **WhatsApp is the primary notification channel, not email/SMS.** Reflects the actual communication pattern in the target market. SMS is a fallback, email is not used for transactional messages.

8. **Role-based access is enforced at both UI and RLS level.** UI hides buttons/pages the role shouldn't see. RLS prevents data access even if someone crafts a direct API call. Defense in depth.