Yes, you can localize pricing by country — and I actually think you **should**. But there is one important problem with **PKR 399/member**:

At 100 members, that becomes **PKR 39,900/month**.
At 150 members, it becomes **PKR 59,850/month**.

So if **PKR 35,000 feels too expensive**, PKR 399/member only looks cheaper at first glance. For many gyms it becomes **more expensive than your current plan**.

At today's exchange rates, **PKR 399 ≈ $1.43 ≈ AED 5.28 ≈ SAR 5.40 per member**.

| Members | PKR 399/member | Equivalent USD |      UAE |    Saudi |
| ------: | -------------: | -------------: | -------: | -------: |
|      50 |     PKR 19,950 |           ~$72 | ~AED 264 | ~SAR 270 |
|      75 |     PKR 29,925 |          ~$107 | ~AED 396 | ~SAR 405 |
|     100 |     PKR 39,900 |          ~$143 | ~AED 528 | ~SAR 540 |
|     150 |     PKR 59,850 |          ~$215 | ~AED 792 | ~SAR 810 |

So the concept is good. **The number needs thought.**

## I would NOT simply convert PKR prices

Don't make your code do:

> PKR 399 → live FX conversion → AED 5.28

That creates ugly prices and means your pricing moves with currencies.

Instead create **fixed local price books**.

For example:

**Pakistan:** Rs. 299/member/month
**UAE:** AED 7/member/month
**Saudi Arabia:** SAR 7/member/month
**Rest of world:** $1.99/member/month

Those aren't supposed to be exchange-rate equivalents.

They're **market-specific prices**.

That's completely normal for SaaS.

And I would not describe it internally as:

> "UAE is rich so charge them more."

Think:

> **What price is reasonable relative to the value Barbellist creates and the alternatives available in that market?**

That's a much better pricing philosophy.

---

# My recommendation for Barbellist specifically

I would test this:

### 🇵🇰 Pakistan

**Rs. 299 / member / month**

with perhaps:

> Minimum Rs. 7,500/month

Examples:

50 members → Rs. 14,950
100 → Rs. 29,900
150 → Rs. 44,850

That feels much more sellable than suddenly asking a 100-member local gym for Rs.35k before you have major proof.

---

### 🇦🇪 UAE

I would **not** use AED 4–5 simply because that's the converted Pakistani price.

I'd start around:

## **AED 7 / member / month**

So:

50 → AED 350
100 → AED 700
150 → AED 1,050

For an actual business-critical gym operating system, AED 700/month for a 100-member gym is not an outrageous amount if Barbellist genuinely handles collections, retention, attendance, reminders, etc.

You could later test AED 9.

---

### 🇸🇦 Saudi Arabia

Similarly:

## **SAR 7 / member / month**

50 → SAR 350
100 → SAR 700
150 → SAR 1,050

Again, I'd rather start here and learn than arbitrarily charge the exact Pakistani FX value.

---

### 🌎 US / UK / elsewhere

For USD:

## **$1.99 / member / month**

Examples:

50 → $99.50
100 → $199
150 → $298.50

This gives you a sensible entry point relative to the established gym-software market.

If Barbellist eventually delivers the entire Revenue Recovery System we've been discussing — collections, lead CRM, dunning, reactivation, retention automation, etc. — you could reasonably push higher.

---

# But I'd add one very important pricing rule

Don't allow pricing to grow forever.

Imagine a 900-member gym:

> 900 × $1.99 = $1,791/month

At that point they'll compare you against enterprise systems and question it.

Have a cap or tiers.

For example:

**$1.99/member**
**up to 200 members**

Then:

> **200+ members — talk to us**

Same locally:

**Rs.299/member**
up to 200 members

**200+ → Custom**

This keeps the offer simple for independent gyms without punishing bigger customers.

---

# Your pricing card could become dramatically simpler

Instead of this:

> Founding Gym
> Rs.35,000/month
> Up to 150 members...

I'd show:

### Founding Gym

# **Rs. 299**

### / active member / month

**You only pay for members you're managing.**

✓ Personal migration & setup
✓ Revenue leak dashboard
✓ WhatsApp reminders
✓ At-risk member alerts
✓ QR cards & check-in

**First 30 days free**

**[ Start free → ]**

Then tiny text:

> Minimum monthly subscription applies. Custom pricing for 200+ members.

Very easy to understand.

---

## One thing I'd be careful with: “active member”

Define it inside your billing system.

Otherwise gym owners will ask:

> What if someone freezes?

> What about expired members?

> Former members?

> Leads?

> Staff?

I would charge only for:

> **Active paid memberships**

Former members, leads, staff records, archived members = free.

That actually becomes part of the sales pitch:

> **You only pay for active members.**

Much nicer than charging for every contact in the database.

---

# If you want the simplest answer

I would **not** do:

**PKR 399 → automatically converted currency**

And I would probably **not choose PKR 399 at all** if your concern is that Rs.35,000 feels expensive.

I'd launch roughly:

> 🇵🇰 **Rs.299/member**
> 🇦🇪 **AED 7/member**
> 🇸🇦 **SAR 7/member**
> 🌍 **$1.99/member**

with a sensible minimum and custom pricing above ~200 members.

Your geo-detection code should therefore pick a **pricing table based on country**, not calculate an exchange rate.

That's commercially much stronger and gives you freedom to adjust each market independently as you learn willingness-to-pay.
