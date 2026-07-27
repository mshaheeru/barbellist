# Barbellist User Guide

A practical guidebook for gym owners and staff. Use this to learn every feature in Barbellist — from signing up, to collecting fees, checking members in, and sending WhatsApp reminders.

---

## Table of contents

1. [What is Barbellist?](#1-what-is-barbellist)
2. [Getting started](#2-getting-started)
3. [Roles & permissions](#3-roles--permissions)
4. [Dashboard](#4-dashboard)
5. [Members](#5-members)
6. [Fees & payments](#6-fees--payments)
7. [WhatsApp reminders & receipts](#7-whatsapp-reminders--receipts)
8. [Attendance & check-in kiosk](#8-attendance--check-in-kiosk)
9. [Staff](#9-staff)
10. [Expenses](#10-expenses)
11. [Inventory (POS)](#11-inventory-pos)
12. [Membership packages](#12-membership-packages)
13. [Membership cards & QR](#13-membership-cards--qr)
14. [Reports](#14-reports)
15. [Settings](#15-settings)
16. [Demo data (for pitching & training)](#16-demo-data-for-pitching--training)
17. [Public website (landing page)](#17-public-website-landing-page)
18. [Common workflows](#18-common-workflows)
19. [Tips & troubleshooting](#19-tips--troubleshooting)

---

## 1. What is Barbellist?

Barbellist is gym management software built for fitness businesses (especially Pakistan and similar markets). It helps you:

- Register and track **members**
- Collect **membership fees**, download **payment receipt images**, and send **WhatsApp reminders**
- Check people in with **QR cards** or manual search
- Manage **staff**, **salaries**, and **expenses**
- Sell supplements and drinks from **inventory**
- Design **membership packages** and **printable QR cards**
- See **reports** on revenue, attendance, and retention

Everything is **gym-scoped**: your data stays private to your gym. Staff only see what their role allows.

---

## 2. Getting started

### 2.1 Create your gym (owner signup)

1. Open Barbellist and go to **Sign up** (`/signup`).
2. Enter:
   - Gym name
   - Your name (owner)
   - Email and password
   - Phone
   - City
   - Country (defaults to Pakistan)
3. Submit. Barbellist creates your gym and logs you in as the **owner**.
4. You land on the **Dashboard**.

### 2.2 Sign in (existing staff)

1. Go to **Login** (`/login`).
2. Enter the email and password given by your gym owner/manager.
3. You are taken to `/dashboard`.

> **Note:** Trainers and cleaners may only see a limited menu (see [Roles](#3-roles--permissions)).

### 2.3 First-time setup checklist (owners)

Do these in order for a smooth launch:

| Step | Where | Why |
|------|--------|-----|
| 1. Complete gym profile | Settings → Gym Profile | Name, address, phone, currency, logo |
| 2. Create packages | Packages | Basic / Standard / Premium (or your tiers) |
| 3. Add staff & app access | Staff or Settings → Staff Access | Front desk, trainers, cleaners |
| 4. (Optional) WhatsApp Business API | Settings → WhatsApp | For *automated* scheduled reminders |
| 5. Customize card design | Settings → Card Design | Logo, colors, what to print on cards |
| 6. Add members | Members → Add Member | Or load Demo Data to explore first |
| 7. Print cards | Cards | QR membership cards for check-in |

Manual fee reminders and receipts work **without** WhatsApp Business API — they open WhatsApp with a ready-made message (see [WhatsApp](#7-whatsapp-reminders--receipts)).

---

## 3. Roles & permissions

Barbellist has these staff roles:

| Role | Typical use |
|------|-------------|
| **Owner** | Full access — billing, demo data, waive fees, salaries, delete gym |
| **Manager** | Day-to-day ops: members, fees, expenses, packages, reports, settings (no owner-only secrets) |
| **Cashier** | Front desk: members, fees, payments, reminders, attendance, inventory sales, staff directory |
| **Trainer** | Members list, attendance, own staff profile |
| **Cleaner** | Attendance and own staff profile |

### 3.1 What each role can open (sidebar)

| Menu | Owner | Manager | Cashier | Trainer | Cleaner |
|------|:-----:|:-------:|:-------:|:-------:|:-------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Members | ✓ | ✓ | ✓ | ✓ | — |
| Staff | ✓ | ✓ | ✓ | Own profile | Own profile |
| Attendance | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fees | ✓ | ✓ | ✓ | — | — |
| Inventory | ✓ | ✓ | ✓ | — | — |
| Expenses | ✓ | ✓ | — | — | — |
| Packages | ✓ | ✓ | — | — | — |
| Cards | ✓ | ✓ | — | — | — |
| Reports | ✓ | ✓ | — | — | — |
| Settings | ✓ | ✓ | — | — | — |

### 3.2 Important action permissions

| Action | Who can do it |
|--------|----------------|
| Record membership payment | Owner, Manager, Cashier |
| Send fee reminder / payment confirmation (WhatsApp) | Owner, Manager, Cashier |
| Waive a fee | **Owner only** |
| Check in other people / run QR kiosk | Owner, Manager, Cashier |
| Check yourself in | Owner, Manager, Cashier, Trainer, Cleaner |
| Manage staff (add/edit/deactivate) | Owner, Manager |
| View / record salaries | **Owner only** |
| Manage expenses | Owner, Manager |
| Manage inventory items | Owner, Manager |
| Record product sales | Owner, Manager, Cashier |
| Manage packages | Owner, Manager |
| Edit WhatsApp API credentials | **Owner only** |
| Load / clear Demo Data | **Owner only** |
| Billing, export all data, delete gym | **Owner only** |
| View profit **amount** on dashboard/reports | **Owner** (managers see charts/labels without the exact profit figure) |

---

## 4. Dashboard

**Path:** Sidebar → **Dashboard** (`/dashboard`)

Your home screen. What you see depends on your role.

### 4.1 KPI cards

| Card | Shown to |
|------|----------|
| Active members | Most roles |
| Revenue (this month) | Owner, Manager, Cashier |
| Expenses (this month) | Owner, Manager |
| Net profit | Owner (amount); Manager (section without amount) |
| Overdue fees | Owner, Manager, Cashier |
| Check-ins / attendance focus | Trainer, Cleaner (instead of money KPIs) |

### 4.2 Charts & lists

- **Revenue / expenses trend** (last ~6 months) — Owner, Manager, Cashier (cashier: revenue-focused)
- **Expense breakdown** by category — Owner, Manager
- **Fee Alerts** — overdue members with:
  - **Remind** — opens WhatsApp with a pre-filled overdue message
  - **Record Payment**
  - **Send All Overdue Reminders** — opens WhatsApp chats one by one (about 1 second apart)
- **At-risk members** — low attendance / churn risk
- **Expiring this week** — renewals coming due

Use **Add Member** in the top bar as a shortcut to onboarding.

---

## 5. Members

### 5.1 Member list

**Path:** Sidebar → **Members**

- Search by name, member ID, or phone
- Filter: All, Active, Overdue, Due Soon, Frozen, New
- Sort: newest, oldest, name A–Z / Z–A
- Click a row to open the member profile
- **Add Member** opens the onboarding wizard

### 5.2 Add a member (onboarding wizard)

**Path:** Members → **Add Member** (`/dashboard/members/new`)

Four steps:

#### Step 1 — Personal info
- Name, phone, WhatsApp, email
- Date of birth, gender, address
- Emergency contact name & phone
- Photo (capture or upload)

#### Step 2 — Health
- Height (cm) and weight (kg)
- BMI is calculated for you
- Fitness goals (e.g. weight loss, muscle gain, general fitness, endurance, flexibility, rehabilitation)

#### Step 3 — Package
- Choose a membership package
- Recommendations may appear based on BMI and goals (if packages define those rules)

#### Step 4 — Payment
- Payment method: Cash, EasyPaisa, JazzCash, Bank Transfer
- Amount (supports partial payment)
- Notes
- Optional: **Send WhatsApp receipt** (uses Cloud API if configured; you can also download a PNG receipt later from the member’s Payments tab)

On save, Barbellist creates the member, membership dates, fee due, and payment. If WhatsApp Business API is configured, it may also send a welcome message and receipt automatically.

### 5.3 Member profile

**Path:** Members → click a member (`/dashboard/members/[id]`)

Tabs:

| Tab | Contents |
|-----|----------|
| **Overview** | Contact, package, fee status, health snapshot, activity streak |
| **Attendance History** | Past check-ins |
| **Payments** | Outstanding dues + payment history |
| **Progress** | Height, weight, BMI, goals (history chart grows as you record more) |
| **Notes** | Internal staff notes (add / edit / delete) |

#### Quick actions (sidebar / profile)

- **Record Payment** — same payment modal as Fees
- **Freeze / Unfreeze** — pause membership (start date, end date, reason)
- **Reprint Card** — opens Cards with this member selected
- **Edit Details** — update contact and demographics
- **Delete Member** — remove with confirmation

#### Payments tab

For each **outstanding due** that is overdue, pending, or partial:

- **Send Reminder** — opens WhatsApp with a ready message for that member

For each **payment** in history:

- **Receipt** — opens a branded payment receipt preview (PNG image). From there you can:
  - **Download Receipt** — saves a WhatsApp-friendly image to your device (filename like `receipt-M001-RCP-A1B2C3D4.png`)
  - **Send Confirmation via WhatsApp** — opens WhatsApp with a text payment confirmation (same template as before; you can attach the downloaded image yourself if you want)

See [Payment receipt images](#66-payment-receipt-images) for details.

---

## 6. Fees & payments

**Path:** Sidebar → **Fees** (`/dashboard/fees`)

### 6.1 Overview

- Summary: overdue members, outstanding balance
- Cards: collected this month, outstanding, due this week
- Filters: date range, status (All / Paid / Pending / Overdue / Partial / Waived)
- Sort by due date, amount, or days overdue

### 6.2 Fee table actions

| Action | Who | What happens |
|--------|-----|--------------|
| **Record Payment** | Owner, Manager, Cashier | Opens payment modal for that member |
| **Send Reminder** | Owner, Manager, Cashier | Opens WhatsApp with fee reminder text; logs the reminder |
| **Waive** | Owner only | Marks the fee as waived (cannot undo) |
| Checkbox + **Send Reminders to Selected** | Owner, Manager, Cashier | Opens multiple WhatsApp chats in sequence with progress (“Sending 1 of 5…”) |

### 6.3 Record Payment modal

Available from Fees, Dashboard, and Member profile.

Fields:

- Amount
- Method: Cash, EasyPaisa, JazzCash, Bank Transfer
- Partial payment toggle
- Notes
- Optional **Send WhatsApp receipt** checkbox (shown when the member has a WhatsApp/phone number)

Payment is applied against open fee dues (oldest first).

**After you save:**

- If the WhatsApp checkbox is **unchecked** — you get a success toast and the modal closes.
- If the checkbox is **checked** — the modal stays open on a **Payment recorded!** step with:
  - **Download Receipt** — opens the PNG receipt preview (see below)
  - **Send Confirmation via WhatsApp** — opens WhatsApp with the text confirmation message
  - **Done** — closes the modal
- If WhatsApp Business API is configured, Barbellist may also send the text receipt automatically (best-effort). The PNG image is never sent automatically — you download it and attach it in WhatsApp yourself if needed.

### 6.4 Fee statuses explained

| Status | Meaning |
|--------|---------|
| Pending | Not paid yet, not overdue |
| Partial | Some money received, balance remains |
| Paid | Fully paid |
| Overdue | Past due date with balance |
| Waived | Owner cancelled the amount owed |

### 6.5 Monthly dues

Barbellist can generate monthly fee dues automatically (scheduled backend job). You do not need a special button for day-to-day use — keep packages and membership dates correct, and dues appear as months roll over.

### 6.6 Payment receipt images

Barbellist can generate a **branded PNG receipt** in the browser (no printer driver or PDF tool required). Images preview nicely in WhatsApp chat when you attach them manually.

**What the receipt shows**

- Gym logo (or icon) and gym name
- “Payment Receipt” heading and receipt number (`RCP-…`)
- Member name and member code
- Date, amount, payment method, period covered, package name
- Gym contact details and a short thank-you line

Gym branding comes from **Settings → Gym Profile** (name, logo, phone, WhatsApp, email).

**How to get one**

1. Open the member → **Payments** tab → **Receipt** on a payment row, **or**
2. After **Record Payment** with the WhatsApp checkbox checked → **Download Receipt** on the success step.

Then:

1. Review the preview.
2. Click **Download Receipt** to save the PNG.
3. (Optional) Click **Send Confirmation via WhatsApp** for a text message, then attach the downloaded image in WhatsApp if you want the member to see the visual receipt.

> Free deep-link WhatsApp cannot attach images automatically. Paid WhatsApp Business API media send is not used for receipt images in this version.

---

## 7. WhatsApp reminders & receipts

Barbellist supports two ways to use WhatsApp for **text** messages. For **image** receipts, see [Payment receipt images](#66-payment-receipt-images).

### 7.1 Manual deep links (no Business API needed) — recommended for desk staff

When you click **Send Reminder** or **Send Confirmation via WhatsApp** (from a receipt preview):

1. Barbellist builds a message from a template.
2. It opens WhatsApp (web or app) with the member’s number and the text already filled in.
3. You tap **Send**.
4. Barbellist logs the action (reminders update “last reminder” / count on the fee; payment confirmations are marked as sent).

**Where it works:**

- Fees page (single + bulk reminders)
- Dashboard → Fee Alerts (single + Send All)
- Member profile → Payments (reminders on dues; receipt confirmation from the **Receipt** preview)

**If the member has no WhatsApp number:**

You will see an error like:  
*“No WhatsApp number on file for [name]. Add it in their profile.”*

#### Message templates

**Overdue**

> Hi {name}, your gym membership fee of {currency}{amount} is overdue by {days} days. Kindly visit the front desk or contact us to clear your dues. Thank you! — {gym_name}

**Due soon**

> Hi {name}, your gym membership fee of {currency}{amount} is due on {date}. Please visit the front desk to renew. Thank you! — {gym_name}

**Receipt**

> Hi {name}, we've received your payment of {currency}{amount} for {period}. Thank you! Your membership is active until {expiry}. — {gym_name}

Phone numbers are normalized for Pakistan-style numbers (e.g. leading `0` → `92…`) so `wa.me` links work.

### 7.2 WhatsApp Business Cloud API (automated)

**Path:** Settings → **WhatsApp Reminders**

Owners can paste:

- API Token
- Phone Number ID

Then use **Test Connection**.

Also configure schedule:

- Days before due (0–30)
- Remind on due date (on/off)
- Overdue repeat every N days (1–30)
- Max reminders per due (1–20)

When configured, automated jobs and some create-member flows can send approved template messages without opening WhatsApp manually.

> Manual desk buttons use deep links so staff can always remind members even if Business API is not set up.

---

## 8. Attendance & check-in kiosk

### 8.1 Live attendance feed

**Path:** Sidebar → **Attendance**

- Date range: Today / This Week / This Month
- Filter: All / Members / Staff
- **LIVE NOW** banner: members in gym, staff in gym, today’s check-ins, peak hour
- Live feed updates as people check in
- Sidebar: totals and hourly traffic bars
- **Open Kiosk** → full-screen check-in mode

### 8.2 Check-in kiosk

**Path:** Attendance → **Open Kiosk** (`/dashboard/attendance/kiosk`)

Designed for a front-desk tablet or phone.

| Tab | Use |
|-----|-----|
| **QR** | Point camera at membership card QR |
| **Manual** | Search member or staff and check in |
| **Fingerprint** | Placeholder UI (not a full biometric product yet) |

After a successful check-in you see a result screen, including fee status at check-in (clear / overdue / due soon).

Frozen members cannot check in normally — the kiosk shows an error.

**Who can check in others:** Owner, Manager, Cashier  
**Who can check themselves in:** Owner, Manager, Cashier, Trainer, Cleaner

Check-in methods stored: `qr`, `manual`, `fingerprint`.

---

## 9. Staff

### 9.1 Staff directory

**Path:** Sidebar → **Staff**

- Owners, managers, and cashiers see the full directory
- Trainers and cleaners are taken to **their own profile** only
- Search and filter by role (Trainers, Front Desk, Cleaners, Managers, Owner)
- Sort by name, join date, or salary (salary visibility: owner)

### 9.2 Add staff

**Who:** Owner, Manager

Fields:

- Name, role, phone, WhatsApp, email
- Monthly salary, commission rate, joining date, photo
- Optional **Give app access** + password (creates a login)

Managers cannot create another **owner**.

### 9.3 Staff profile

Tabs: **Overview · Attendance · Salary History · Notes**

| Feature | Who |
|---------|-----|
| Salary History + Record Salary | Owner |
| Edit details / Deactivate | Owner, Manager |
| Notes | Staff with access to the profile |
| Mark Absent Today | Informational (absence = no check-in that day) |

Recording a salary creates a linked **salary expense**.

---

## 10. Expenses

**Path:** Sidebar → **Expenses**

**Who:** Owner, Manager

### What you can do

- See this month’s totals, salaries paid, pending items
- **Record Expense** with:
  - Category: salary, utilities, maintenance, cleaning, repairs, equipment, rent, miscellaneous
  - Amount, payment method, date
  - Staff link (for salary expenses)
  - Full / partial / advance salary modes
  - Receipt upload, notes
- Filter by date, category, payment method, who recorded it

Salary rows are highlighted so payroll is easy to spot.

---

## 11. Inventory (POS)

**Path:** Sidebar → **Inventory**

**Who:** Owner, Manager, Cashier (cashiers record sales; owners/managers manage the catalog)

### Catalog

- KPIs: items in stock, low-stock alerts, sales this month
- **Add Item:** name, category, description, SKU, cost, selling price, stock qty, low-stock threshold, photo
- Categories: supplements, drinks, snacks, accessories, apparel, other
- Search and filter by category / stock status (in stock, low, out)
- Deactivate items you no longer sell

### Record a sale

- Add one or more line items
- Optional member (or walk-in)
- Payment method (includes **member tab** for charging to the member)
- Stock decreases automatically when the sale is saved

---

## 12. Membership packages

**Path:** Sidebar → **Packages**

**Who:** Owner, Manager

Each package can include:

- Name, description, price
- Duration (e.g. 30 / 90 / 365 days, or custom)
- Feature list (shown on cards / onboarding)
- Color (for UI / card theming)
- Optional BMI range and recommended goals (for onboarding suggestions)
- Active / inactive toggle
- Sort order

**Add / Edit / Delete** with confirmation. Members already on a package are not broken if you delete carefully — prefer deactivating packages you no longer sell.

---

## 13. Membership cards & QR

**Path:** Sidebar → **Cards**

**Who:** Owner, Manager

### Single card

1. Search and select a member (QR token is created if missing).
2. Preview front and back (uses gym logo + card template from Settings).
3. **Print / Download** PNG front and back; marks the card as printed.
4. **Regenerate QR** if a card was lost or compromised (old QR stops working).
5. **Send via WhatsApp** for digital card image — *Coming soon*.

### Bulk generate

Generate cards for all members who do not have issued cards yet. Downloads a ZIP of PNGs and marks them printed. Progress is shown while generating.

### From member profile

Use **Reprint Card** to open Cards with that member pre-selected.

Card appearance is controlled in **Settings → Card Design** (background color, show logo / photo / QR / expiry / package badge).

---

## 14. Reports

**Path:** Sidebar → **Reports**

**Who:** Owner, Manager

Pick a date range, then explore:

| Report | Notes |
|--------|--------|
| Revenue trend | Over time |
| New vs churned members | Growth vs attrition |
| Average retention | KPI |
| Packages mix | Donut |
| Payment methods mix | Donut |
| Profit trend | Owners see amounts; managers see trend without exact profit value |
| Top expense categories | Bars |
| Attendance heatmap | Day × hour intensity |
| **Export CSV** | Download report data |

---

## 15. Settings

**Path:** Sidebar → **Settings**

**Who:** Owner, Manager (some sections owner-only)

Save with the **Save Changes** button at the top where applicable.

### 15.1 Gym Profile

- Gym name, address, city, country
- Phone, WhatsApp, email
- Timezone
- Currency and currency symbol (e.g. PKR / Rs.)
- Logo upload
- Slug is shown read-only (used in system URLs)

### 15.2 WhatsApp Reminders

See [WhatsApp](#7-whatsapp-reminders--receipts).

- Credentials: **Owner only**
- Reminder schedule: Owner and Manager

### 15.3 Card Design

Live preview of membership cards:

- Background color presets
- Toggles: gym logo, member photo, QR code, expiry date, package badge

### 15.4 Staff Access

- See who has login access
- Change roles (owner rules apply — you cannot remove the last owner)
- Invite staff with email + role
- Remove app access

### 15.5 Billing (Owner only)

- Current plan (e.g. Early Bird / Standard / Pro)
- Subscription status
- Active member count and estimated cost
- Contact support / mailto to change plan

### 15.6 Demo Data (Owner only)

See the next section.

### 15.7 Danger Zone (Owner only)

- **Export All Data** — download a ZIP of CSV files for your gym
- **Delete Gym** — type your gym name to confirm; this signs you out and removes the gym

---

## 16. Demo data (for pitching & training)

**Path:** Settings → **Demo Data**  
**Who:** Owner only

Use this when you want a realistic sample gym for demos, training, or sales pitches — without wiping your real data.

### Load Demo Data

1. Open Settings → Demo Data.
2. Click **Load Demo Data**.
3. Confirm: *“This will populate your gym with sample data for demo purposes. Existing data will not be affected.”*
4. Wait for loading to finish.
5. You are redirected to the Dashboard with sample data ready.

If demo data is already loaded, clear it first.

### What gets created

| Area | Sample content |
|------|----------------|
| Packages | Basic (Rs. 4,500), Standard (Rs. 7,500), Premium (Rs. 12,000) |
| Staff | 7 people (trainers, cashier, cleaners, manager) with salaries — no login accounts |
| Members | 25 Pakistani names; mix of active, overdue, frozen, expired; WhatsApp numbers; height/weight/BMI; QR tokens |
| Attendance | ~60 days of member + staff check-ins (peak morning/evening hours; mostly QR) |
| Fees & payments | Last 2 months of dues/payments (paid, partial, overdue) |
| Expenses | Salaries + utilities (electricity, gas, water), cleaning, repairs, tea, etc. |
| Inventory | 10 products (whey, drinks, snacks, accessories) including low/out of stock |
| Sales | 8 recent shop sales (members + walk-ins) |

Demo rows are tagged so they can be removed cleanly.

### Clear Demo Data

1. Click **Clear Demo Data**.
2. Confirm.
3. Only demo-tagged records are deleted. Your real members, payments, and settings stay.

---

## 17. Public website (landing page)

**Path:** `/` redirects to `/home`

Public marketing site for Barbellist (not your gym’s member portal):

- Product features, pricing, FAQ
- Order / contact sales forms
- Demo video modal
- Floating WhatsApp button to chat with Barbellist sales

Use this when evaluating or ordering Barbellist for a new gym. Day-to-day gym ops happen under `/dashboard` after login.

---

## 18. Common workflows

### Collect an overdue fee at the front desk

1. Open **Fees** (or Dashboard → Fee Alerts).
2. Find the member → **Send Reminder** if you need to nudge them on WhatsApp.
3. When they pay → **Record Payment** → choose method → leave **Send WhatsApp receipt** checked if you want follow-up options → save.
4. On the success step (or later from the member’s **Payments** tab → **Receipt**): **Download Receipt** for the PNG, and/or **Send Confirmation via WhatsApp** for the text message. Attach the PNG in WhatsApp yourself if you want them to get the image.

### Onboard a new member end-to-end

1. **Members → Add Member** → complete all 4 steps.
2. **Cards** → select member → Download / Print card.
3. Hand over the card; they check in at the **Kiosk** with QR.

### Start of day at the gym

1. Open **Attendance → Open Kiosk** on the front-desk device.
2. Keep **Fees** or **Dashboard** open on another screen for payments and reminders.
3. Use **Inventory → Record Sale** for shake/supplement purchases.

### End of month (owner / manager)

1. **Reports** — review revenue, expenses, attendance heatmap.
2. **Expenses** — confirm salaries and utilities are logged.
3. **Fees** — chase overdue with bulk WhatsApp reminders.
4. Optional: **Settings → Export All Data** for backup.

### Pitch Barbellist to a prospect

1. Log in as owner on a demo gym (or empty gym).
2. **Settings → Load Demo Data**.
3. Walk through Dashboard, Fees reminders, Kiosk, Cards, Inventory.
4. **Clear Demo Data** when finished (or keep it for the next pitch).

---

## 19. Tips & troubleshooting

| Problem | What to try |
|---------|-------------|
| “No WhatsApp number on file” | Edit the member → add WhatsApp (or phone). Prefer `03XX…` or `+92 3XX…` |
| Reminder button does nothing / popup blocked | Allow pop-ups for Barbellist; try again |
| Bulk reminders opened too few chats | Browser blocked some windows; allow pop-ups and retry selection |
| Member cannot check in on kiosk | Confirm membership is not frozen/expired; regenerate QR if card is old |
| Cannot see Fees / Expenses / Reports | Your role may not allow it — ask the owner |
| Cannot waive a fee | Only the owner can waive |
| Demo load says already loaded | Use **Clear Demo Data**, then Load again |
| QR not generating for demo/members | Ask your admin to ensure signing secret is configured on the server |
| Want automated reminders without clicking | Owner sets WhatsApp Business API + schedule in Settings |
| Receipt image download fails / blank image | Wait a second and try again; confirm the gym logo URL loads (Settings → Gym Profile) |
| Need a full data backup | Owner → Settings → Danger Zone → Export All Data |

### Good habits

- Always store a **WhatsApp** number on members you will remind.
- After recording a payment, download the **receipt PNG** when the member wants proof they can save or share.
- Prefer **packages** + correct **membership end dates** so dues and “expiring” lists stay accurate.
- Use **Freeze** for temporary pauses instead of deleting members.
- Keep **low-stock thresholds** set on inventory so the dashboard alerts stay useful.
- Give cashiers app access for desk work; keep salary and billing to the owner.

---

## Quick reference — main screens

| Screen | URL path | Main jobs |
|--------|----------|-----------|
| Login | `/login` | Sign in |
| Sign up | `/signup` | Create gym + owner |
| Dashboard | `/dashboard` | KPIs, fee alerts, shortcuts |
| Members | `/dashboard/members` | Directory, onboard, profiles |
| Fees | `/dashboard/fees` | Collect, remind, waive |
| Attendance | `/dashboard/attendance` | Live feed |
| Kiosk | `/dashboard/attendance/kiosk` | QR / manual check-in |
| Staff | `/dashboard/staff` | Team & salaries |
| Expenses | `/dashboard/expenses` | Costs & payroll logging |
| Inventory | `/dashboard/inventory` | Stock & sales |
| Packages | `/dashboard/packages` | Membership tiers |
| Cards | `/dashboard/cards` | Print QR cards |
| Reports | `/dashboard/reports` | Analytics & CSV export |
| Settings | `/dashboard/settings` | Gym, WhatsApp, demo, billing |

---

*This guide covers the Barbellist product as implemented for gym owners and staff, including PNG payment receipts, manual WhatsApp deep-link reminders/confirmations, and owner Demo Data load/clear.*
