COMPLETE LANDING PAGE REVAMP — barbellist.com/home

You are rebuilding the Barbellist landing page from the ground up.
Read the current page at app/(public)/home/page.tsx before touching 
anything. Keep ALL existing components, images, and assets — just 
rebuild the structure, copy, and visual design around them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE NEW POSITIONING — UNDERSTAND THIS FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Old: "Gym Management Software"
New: "Gym Revenue Recovery System"

Old story: "Here are our features"
New story: "Your gym is leaking money. We find it. We recover it. 
            We prove exactly how much. Then we charge less than 
            what we recover in week one."

Every section on this page must answer ONE question:
"How does this make or save the gym owner money?"
If a section can't answer that question — it doesn't exist on this page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM — APPLY GLOBALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AESTHETIC: Dark futuristic premium SaaS.
References: Linear, Vercel, Raycast, Ramp.
Dark background. Single amber accent. 
Oversized bold typography. Minimal elements.
Let whitespace and type do the work.
NOT a fitness brand. A premium financial/revenue tool 
that happens to serve gyms.

COLORS:
--bg-primary:    #0A0A0A   (near-black base)
--bg-card:       #111111   (card surfaces)
--bg-card-hover: #161616   (card hover)
--border:        #1F1F1F   (subtle borders)
--text-primary:  #FAFAFA   (white text)
--text-muted:    #6B7280   (muted grey)
--accent:        #C9861B   (amber — USE SPARINGLY)
--accent-glow:   rgba(201, 134, 27, 0.15) (ambient glow)
--green:         #1B5E3C   (forest green — secondary only)
--green-muted:   rgba(27, 94, 60, 0.15)
--red-muted:     rgba(220, 38, 38, 0.1)
--white-5:       rgba(255,255,255,0.05)
--white-10:      rgba(255,255,255,0.1)

TYPOGRAPHY:
- Font: Inter (already in project)
- Headlines: font-black tracking-tight leading-none
- Body: font-normal text-base leading-relaxed
- Accent text: font-bold text-[--accent]
- ALL headline text: white (#FAFAFA)
- Support text: muted grey (#6B7280)
- Max line length: 600px (readability)

SPACING: Generous. Section padding: py-32 on desktop, py-20 mobile.
Give everything room to breathe.

ANIMATIONS: 
- Use Tailwind's built-in: transition-all duration-300
- Subtle fade-in on scroll: use CSS @keyframes fadeInUp
  (translateY 20px → 0, opacity 0 → 1, 0.6s ease-out)
- Add to sections: className="animate-fade-in-up"
- Define this animation in globals.css
- Stagger child animations with animation-delay
- NEVER animate the hero — it must load instantly

BUTTONS:
Primary: bg-[--accent] text-black font-bold px-8 py-4 
         rounded-lg hover:brightness-110 transition-all
Secondary: border border-[--white-10] text-white px-8 py-4 
           rounded-lg hover:bg-[--white-5] transition-all
WhatsApp: bg-[#25D366] text-white (WhatsApp green, same shape)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAV — REBUILD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background: bg-black/80 backdrop-blur-md
Border bottom: border-b border-[--white-5]
Sticky top, full width.

Left: Barbellist logo/wordmark (existing asset)
Right: 
  - "Pricing" text link (text-[--text-muted] hover:text-white)
  - "Sign In" text link 
  - "💬 WhatsApp" button (amber, small, px-4 py-2)

Remove all other nav links. Maximum 3 items on right.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full viewport height (min-h-screen).
Background: #0A0A0A with a very subtle radial gradient:
background: radial-gradient(ellipse 80% 50% at 50% -10%, 
  rgba(201,134,27,0.08) 0%, transparent 60%)

This creates a barely-visible amber glow at top center.
DO NOT make it obvious. It should be almost subliminal.

Layout: Two columns on desktop (60/40), stacked on mobile.
Left column: all the text content.
Right column: the existing dashboard screenshot/mockup.

LEFT COLUMN — COPY:

Tiny label above headline (pill shape):
bg-[--white-5] border border-[--white-10] rounded-full 
px-3 py-1 text-xs text-[--text-muted]
Text: "Gym Revenue Recovery System"

Main headline — BIGGEST TEXT ON THE PAGE:
text-6xl md:text-8xl font-black tracking-tighter leading-none
Line 1: "Your gym is"    (text-white)
Line 2: "bleeding"       (text-[--accent] — amber)
Line 3: "money."         (text-white)

Sub-headline (below headline, max-w-lg):
text-xl text-[--text-muted] leading-relaxed mt-6
"Every month, fees go uncollected. Members quietly disappear. 
Cash passes through hands. Most owners find out too late.
Barbellist finds the leaks — and gets the money back."

CTA ROW (mt-10, flex gap-4 flex-wrap):
Button 1 (primary amber): "Start recovering revenue →"
Button 2 (secondary): "💬 WhatsApp us first"

Trust line below CTA (mt-4):
text-sm text-[--text-muted]
"Free for 3 months · No setup fee · First 50 gyms only"

RIGHT COLUMN:
The existing dashboard mockup/screenshot.
Wrap it in a container with:
- Subtle amber glow behind it: 
  box-shadow: 0 0 80px rgba(201,134,27,0.08)
- border border-[--white-5] rounded-2xl overflow-hidden
- The kiosk check-in widget below it (already exists)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — THE LEAK (replaces "Sound familiar?")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background: #0A0A0A
Section label (centered): "THE PROBLEM" in tiny amber caps

Large centered headline:
text-4xl md:text-6xl font-black tracking-tight text-white
"Rs. 15,000–20,000."

Below it, centered muted text:
text-xl text-[--text-muted]
"The average amount an independent gym leaks every month.
Silently. Invisibly. From five predictable places."

Then 5 cards in a bento grid layout (CSS grid):
- 2 cards top row (wide + narrow)
- 2 cards middle row (narrow + wide) 
- 1 card bottom row (full width)

Each card: bg-[--bg-card] border border-[--border] 
rounded-2xl p-6 hover:border-[--white-10] transition-all

Card 1 (large):
Icon: small red dot pulsing (animate-pulse, bg-red-500, 
      w-2 h-2 rounded-full)
Heading: "Overdue fees you're too awkward to chase"
Body (small, muted): "6 weeks pass. You see them every day. 
You say nothing. They owe Rs. 4,200."

Card 2:
Heading: "Members who quietly stopped coming"
Body: "They're 'active' in your register. 
They cancelled in their head 3 weeks ago."

Card 3:
Heading: "Cash that doesn't add up at month end"
Body: "Collected at the desk. Recorded somewhere. 
The total never matches."

Card 4:
Heading: "Leads who enquired and vanished"
Body: "They WhatsApped asking about membership. 
Nobody followed up. They joined the gym across the street."

Card 5 (full width, amber-tinted border):
border-[--accent]/30 bg-gradient-to-r 
from-[--accent-glow] to-transparent
Large text: "None of this is your fault. 
It's a systems problem. 
Barbellist is the system."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — THE NUMBER (new, most important)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background: Slightly different from base — 
use bg-[#0D0D0D] to create subtle section break.

Full-width section, centered content, max-w-4xl mx-auto.

Section label: "WHAT BARBELLIST OWNERS SEE"

The hero element — a mock "recovered revenue" dashboard card:
This is a styled div, NOT a screenshot. Code it as a component.

bg-[--bg-card] border border-[--border] 
rounded-3xl p-8 md:p-12 mx-auto max-w-2xl
Add subtle amber glow: 
box-shadow: 0 0 60px rgba(201,134,27,0.06)

Inside the card:

Top row (flex justify-between items-center):
Left: Small amber pill: "💰 This month"
Right: Small muted text: "Iron Republic · August 2026"

Center (mt-6):
Massive number in amber: 
text-6xl md:text-7xl font-black text-[--accent]
"Rs. 47,200"

Below number, muted text:
"recovered by Barbellist this month"

Divider line: border-t border-[--border] my-6

Then a 2-column breakdown grid:
Left column (each row: label + amount):
  "Overdue fees collected"     Rs. 18,500
  "Expiring memberships saved" Rs. 14,200
  "At-risk members retained"   Rs. 9,800
  "Former members reactivated" Rs. 4,700

Right side: One number, large:
Label (muted, small): "Barbellist cost this month"
Number (white, medium bold): "Rs. 4,999"

Amber highlight box below:
bg-[--accent-glow] border border-[--accent]/20 
rounded-xl p-4 text-center mt-6
Bold white text: 
"ROI this month: 9.4×"
Small muted text: "Every rupee spent on Barbellist 
returned Rs. 9.4 in recovered revenue."

Below the big card, centered muted text:
"These numbers come from real Barbellist gyms.
Your numbers will differ. They will almost certainly 
be positive from week one."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — HOW IT WORKS (replaces feature grid)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOT a feature list. A revenue loop.
3 steps only. Clean. Simple.

Section heading (centered):
"One closed loop. 
 No leaks."

3 cards in a row (stacked mobile):
Each: bg-[--bg-card] border border-[--border] 
rounded-2xl p-8 relative

Card 1:
Step number: "01" (top right, text-[--accent]/30, 
text-8xl font-black absolute)
Icon: magnifying glass or similar (Lucide, amber color)
Heading: "FIND"
Body: "Barbellist scans every member, every day. 
Overdue fees. Missed check-ins. Expiring memberships. 
Members who haven't visited in 10+ days. 
Nothing slips through."

Card 2:
"02"
Icon: lightning bolt (Lucide)
Heading: "RECOVER"
Body: "Automated WhatsApp messages go out. 
Payment links get sent. 
Members who were about to leave get a human message 
that feels personal — sent by your gym, powered by Barbellist."

Card 3:
"03"
Icon: chart/graph (Lucide)
Heading: "PROVE"
Body: "Every dirham recovered is tracked and attributed. 
You see exactly what Barbellist earned you this month. 
Not features. Not clicks. Revenue."

Connecting arrow between cards on desktop 
(→ in amber, absolutely positioned)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — BEFORE / AFTER (keep, redesign)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Two-column layout separated by a thin vertical amber line.
On mobile: stacked with a horizontal amber line.

LEFT COLUMN header:
Small red label pill: "❌ Without Barbellist"

5 rows, each:
- Icon: ✗ in red (text-red-400)
- Short bold white line (the situation)
- Small muted grey line (the consequence)

Row 1: "Member owes 6 weeks fees." / 
        "You find out when they walk in today."
Row 2: "Sunday morning." / 
        "You're chasing payments on WhatsApp. Manually."
Row 3: "Cash collected at desk." / 
        "Month end totals don't match. You don't know why."
Row 4: "Member stopped coming 18 days ago." / 
        "Your register says: Active."
Row 5: "Lead WhatsApped about membership." / 
        "Nobody followed up. They're now at a competitor."

Overall left column bg: very subtle red tint
background: rgba(220, 38, 38, 0.03)
border: border border-red-900/20 rounded-2xl p-8

RIGHT COLUMN header:
Small amber label pill: "✦ With Barbellist"

5 matching rows:
- Icon: ✓ in amber
- Short bold white line
- Small muted line

Row 1: "Overdue flagged on Day 1." / 
        "Payment link sent automatically. Member pays."
Row 2: "Reminders go out at 9 AM." / 
        "You're at the gym floor. Not your phone."
Row 3: "Every collection recorded." / 
        "Owner dashboard shows live cash position."
Row 4: "At-risk alert triggered." / 
        "Automated check-in message sent. Member returns."
Row 5: "Lead captured automatically." / 
        "Follow-up sequence starts. Trial booked."

Right column bg: very subtle green tint
background: rgba(27, 94, 60, 0.05)
border: border border-green-900/30 rounded-2xl p-8

IMPORTANT: Row 3 (cash recording) is your subtle staff 
accountability message. The copy says "Owner sees live cash 
position" — which is accurate from both angles. 
A manager reads this as transparency. 
An owner reads this as control. 
Do not change this framing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — FOUNDERS (keep, small redesign)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep existing content and photos. Just restyle.

Section heading (centered):
"You'll talk to us. Not a support ticket."

Two founder cards side by side (existing content).
Each card: bg-[--bg-card] border border-[--border] 
rounded-2xl p-6
Photo: circular, 80px
Name in white bold
Role in amber small
One-line bio in muted grey
LinkedIn link

Below both cards, centered:
Amber pill button (WhatsApp link):
"💬 WhatsApp Shaheer: +92 336 7808477"

Small muted text below:
"We personally onboard every gym. 
Every support question comes to us directly. 
Not a chatbot."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — PRICING (redesign completely)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Section heading (centered):
"Priced to pay for itself."

Sub-heading (centered, muted):
"If Barbellist doesn't recover more than it costs you 
in month one — you pay nothing. That's the guarantee."

TWO PRICING CARDS side by side:

Card 1 — Early Access:
bg-[--bg-card] border border-[--border] rounded-2xl p-8

Tiny amber pill at top: "⚡ First 50 gyms only"
Plan name: "Early Access"
Huge price: "Rs. 350" / member / month
Below: "3 months free to start"

Feature list (5 items max, ✓ in amber):
✓ Revenue recovery dashboard
✓ Automated WhatsApp reminders  
✓ At-risk member alerts
✓ QR membership cards
✓ Personal onboarding by founders

CTA button (full width, amber):
"Start free — no card needed"

Card 2 — Standard (locked, visual contrast):
Border: border-[--white-5] (dimmer)
bg-[--bg-card]/50 (slightly transparent)

Plan name: "Standard"
Price: "Rs. 999" / member / month
Sub: "After Early Access period"

Feature list: same as above + 
✓ Multi-branch support
✓ Advanced analytics
✓ Priority support

CTA: "Coming soon" (greyed out, disabled)

BELOW BOTH CARDS — competitor anchor:

Simple 3-row comparison table (no fancy styling):
bg-[--bg-card] border border-[--border] rounded-xl p-6 
max-w-xl mx-auto mt-8

Row headers: "Platform" | "Price/month (100 members)"
Row 1: Barbellist Early Access | Rs. 35,000
Row 2 (muted, strikethrough): Legacy US platforms | Rs. 55,000+
Row 3 (muted, strikethrough): Modern US platforms | Rs. 44,000+

Note below: 
text-xs text-[--text-muted] text-center mt-2
"Prices converted at current exchange rate. 
All Barbellist features included. No add-on pricing."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — TESTIMONIALS (keep, restyle)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep the 3 existing testimonials. Just restyle.

Each card: bg-[--bg-card] border border-[--border] 
rounded-2xl p-6

Large amber opening quote mark: text-4xl text-[--accent]/40
Quote text: text-white leading-relaxed
Attribution: text-[--text-muted] text-sm mt-4

Below all cards:
text-xs text-[--text-muted] text-center
"Real gym owners. Real results."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9 — FINAL CTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full-width section.
Background: Keep it #0A0A0A but add the amber radial glow again:
radial-gradient(ellipse 60% 80% at 50% 100%, 
  rgba(201,134,27,0.06) 0%, transparent 60%)

Centered, max-w-2xl:

Large headline:
text-5xl md:text-7xl font-black text-white text-center
Line 1: "Your paper register"
Line 2 (amber): "won't miss you."

Muted text below:
"Set up in under an hour. 
We import your existing member data. 
You'll see your first recovered fee within a week."

CTA buttons (centered, flex gap-4 justify-center):
Primary amber: "Start free — no card required"
Secondary: "💬 WhatsApp us first"

Trust line: "Free for 3 months · No setup fee · Cancel anytime"

Amber scarcity bar below:
bg-[--accent-glow] border border-[--accent]/20 
rounded-full px-6 py-2 text-sm text-[--accent] 
inline-block mx-auto
"⚡ Early Access closes when 50 gyms join"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOOTER (restyle)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

bg-[#050505] border-t border-[--border]
Keep existing link structure.
Logo + tagline left, links right, copyright bottom.
All text in muted grey except logo.
Remove "Powered by TuspireTech" — keep "Made with ❤️"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METADATA — UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In app/(public)/home/page.tsx update metadata:

title: "Barbellist — Gym Revenue Recovery System"
description: "Stop losing Rs. 15,000+ every month. Barbellist 
finds overdue fees, at-risk members, and missed payments — 
then recovers them automatically. Free for 3 months."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL CSS — ADD TO globals.css
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }

Also add scroll-triggered animation using 
IntersectionObserver in a client component:
components/animate-on-scroll.tsx

Add data-animate attribute to sections.
When section enters viewport → add 'is-visible' class.
Use CSS: [data-animate] { opacity: 0; transform: translateY(24px); }
         [data-animate].is-visible { animation: fadeInUp 0.6s ease-out both; }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT DO NOT LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Do NOT keep the "The old way / With Barbellist" 
   two-paragraph text blocks — replaced by Section 5
❌ Do NOT keep the "Everything automated" feature grid 
   — replaced by Section 4
❌ Do NOT show a white or cream background anywhere 
   — entire page is dark
❌ Do NOT use more than 2 CTAs in any single section
❌ Do NOT add country names, city names, or flags 
   in hero or above the fold
❌ Do NOT make the amber glow heavy or obvious — 
   it should be barely there
❌ Do NOT add new features or sections not listed above
❌ Do NOT touch dashboard auth pages, sidebar, or any 
   route outside app/(public)/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK BEFORE COMMITTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After building, verify:
□ Page loads with dark background immediately (no flash of white)
□ Hero headline is the largest text element on the page
□ "Rs. 47,200" recovered revenue number is the 
  second-most prominent element
□ Only ONE primary CTA color (amber) used throughout
□ No section mentions features without connecting to money
□ Mobile layout is readable without horizontal scrolling
□ WhatsApp button appears in nav AND in hero AND in final CTA
□ Pricing shows Rs. 350/member (NOT $1 or $3)
□ The word "management software" does not appear anywhere
□ "Revenue Recovery System" appears at least 3 times