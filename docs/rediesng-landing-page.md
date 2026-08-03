LANDING PAGE REDESIGN — barbellist.com/home

I've audited the current page. Make the following specific changes. Do NOT rebuild from scratch — surgically edit what exists.

---

CRITICAL BUG FIX — DO THIS FIRST:

The pricing comparison table currently shows:
"Barbellist $600/mo · 200 members"

This is wrong — it makes Barbellist look MORE expensive than competitors.
Fix to: "Barbellist $9/mo minimum · scales per member"
Or remove the table entirely and replace with this one line:
"A fraction of what US platforms charge — and built for how your gym actually works."

---

SECTION CHANGES (in order from top to bottom):

1. NAV — SIMPLIFY
Remove "Features" and "FAQ" from nav links.
Keep only: Pricing | Sign In | [WhatsApp button]
The WhatsApp button in nav: keep it, but make it more visible — amber background, white text, "💬 WhatsApp us"

2. HERO — REWRITE HEADLINE ONLY (keep layout and dashboard visual)

Replace current headline:
"You opened a gym to run it — not drown in spreadsheets. Barbellist handles the rest. Get your weekend back."

With:
"Your gym is losing money right now.
You just don't know exactly how much."

Replace current subheadline with:
"Barbellist shows you every overdue member, every missing payment, and every expense — in one dashboard. Built for independent gyms. Priced so it pays for itself."

Change ALL "Order Now" CTAs across the entire page to "Start free"
The primary CTA button: "Start free — no card required" → /signup
Keep "Watch 2-min demo" as secondary text link

Trust line below CTA (replace current):
"Free for 3 months · No setup fee · Cancel anytime · First 50 gyms only at this price"

3. DELETE THIS SECTION ENTIRELY:
The "Who builds Barbellist — 10+ engineers. One team." section.
Remove it completely. Gym owners do not care about engineering team size.
This space will be replaced by the new Founders section (see below).

4. KEEP "The old way / With Barbellist" TWO-COLUMN SECTION
But tighten the copy on the left column (old way). Replace with:
"Overdue members go unnoticed for weeks. You find out only when they show up at the front desk. Cash is untracked. Expenses are in a WhatsApp chat or a drawer. And when someone asks if the gym is profitable — you genuinely don't know."

Right column (with Barbellist) — keep as is.

5. FEATURE GRID (6 tiles) — KEEP BUT RENAME THE SECTION
Change heading from:
"One platform for the entire gym."
To:
"Everything that used to take your weekend — automated."

Keep all 6 feature tiles and their UI snippets. They are visually good.
But remove the word "Management" from each tile title:
- "Member Management" → "Members"
- "Automated Fee Reminders" → "Fee Reminders"
(keep others as is)

6. BLEEDING CASH SECTION — KEEP ALMOST ENTIRELY
This section is strong. Make only these changes:
- The "$9 a month" line is correct — keep it
- Bold the three bullet pain points (make the ❌ bullets larger and bolder)
- After "Barbellist doesn't cost you money. It rescues the money you are already losing." — add one line:
  "Join the first 50 gyms. Lock in early pricing before it changes."

7. THREE PRODUCT DEEP-DIVE ROWS — DELETE ALL THREE
Remove:
- "Your gym, in one glance" (Owner Dashboard row)
- "Check-in that feels like a product" (Attendance row)
- "Run the whole business" (Expenses row)

These repeat information already shown in the feature grid. Removing them cuts the page length by ~30%.

8. ADD NEW SECTION: FOUNDERS (insert between Bleeding Cash and Pricing)

Heading: "Built in Karachi. By people who get it."

Two founder cards side by side (stacked on mobile):

Card 1:
- [Photo placeholder: src="/founders/shaheer.jpg"]
- Name: Shaheer
- Role: Founder & CEO, Tuspire Tech
- One line: "I built Barbellist because I watched a gym owner lose Rs. 20,000 a month — and not know it."

Card 2:
- [Photo placeholder: src="/founders/partner.jpg"]
- Name: [Partner name]
- Role: Co-founder & Lead Developer, Tuspire Tech
- One line: "Every feature in Barbellist was built to solve a real problem, not to fill a feature list."

Below both cards, centered:
"We answer support questions personally. Not a chatbot. Not a ticket system. Us."

WhatsApp direct line:
"💬 WhatsApp Shaheer directly: +92 336 7808477"
(this is already visible in the page source as the wa.me number)

Style: Cream cards (#FAF7F2), 16px border radius, soft shadow, circular photos 96px, forest green name, muted grey role text, amber accent line at bottom of each card.

9. PRICING SECTION — THREE CHANGES ONLY
a) Fix the comparison table bug (described above)
b) Add below the two pricing cards, before the comparison:

Small amber banner/badge (full width of the pricing section):
"⚡ Early Access — First 50 gyms only. Lock in $1/member before standard pricing applies."

c) Add a third option below the two cards — not a pricing card, a contact option:
"Running more than 3 locations? → Talk to us about custom pricing."
Small text, links to WhatsApp

10. TESTIMONIALS — KEEP ALL THREE, ADD ONE CHANGE
Below the three testimonial cards, add a small line:
"Real gym owners. Real results. No actors."
(Muted grey, small font, centered — this directly addresses skepticism about fake testimonials)

11. FAQ — DELETE ENTIRELY FROM THIS PAGE
Remove the FAQ section.
Create a new page at app/(public)/faq/page.tsx with all 6 questions.
Add a link to it in the footer under Resources: "FAQ"
The landing page doesn't need FAQ — it adds length without adding conversion value.

12. FINAL CTA BAND — SMALL CHANGES ONLY
Change "Order Now — no card required" to "Start free — no card required"
Keep "Your paper register won't miss you." headline — it's good.
Add below the CTA button:
"or 💬 WhatsApp us first → +92 336 7808477"
(Some gym owners will WhatsApp before signing up — give them that path right here)

13. FOOTER — ONE CHANGE
Remove "Powered by TuspireTech" from the footer bottom strip.
It makes Barbellist look like a white-label product rather than its own brand.
Instead add: "Made with ❤️ in Karachi"

---

GLOBAL CHANGES (apply across entire page):

a) Replace every instance of "Order Now" with "Start free" — do a global find and replace

b) Add this urgency line near EVERY CTA button (small text below each button):
"Early Access pricing ends when 50 gyms join."

c) Maximum content width: change from current width to max-w-4xl (896px) centered
Narrower = easier to read = less cognitive load

d) Ensure the WhatsApp floating button (bottom right corner) is visible on ALL scroll positions — if it's not already sticky/fixed, make it fixed position so it's always accessible

e) Mobile check: ensure hero headline breaks correctly on 390px width — "Your gym is losing money right now." should be on one line or break naturally, not awkwardly mid-word

---

FOUNDERS PHOTOS:
For now use placeholder images at /public/founders/shaheer.jpg and /public/founders/partner.jpg
Add a comment in the code: // TODO: Replace with actual founder photos
The placeholder should be a solid forest green circle with initials (S and the partner's initial) — do not use a generic person icon

---

DO NOT CHANGE:
- Any colors, fonts, or brand tokens
- The dashboard UI mockup in the hero
- The kiosk check-in visual
- The WhatsApp deep-link URL (already correct: wa.me/923367808477)
- The SEO metadata (already correctly set)
- The sticky nav behavior
- The footer link structure (just remove "Powered by TuspireTech")