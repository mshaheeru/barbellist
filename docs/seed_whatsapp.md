TWO FEATURES — build both in this session.

FEATURE 1: DEMO SEED DATA

Create a seed script that populates the database with realistic demo data for pitching Barbellist to gym owners. This should be triggerable from the Settings page via a "Load Demo Data" button (only visible to owner role, with a confirmation modal).

When triggered, create the following for the current gym_id:

PACKAGES (3):
- "Basic" — Rs. 4,500/month, features: ["Gym floor access", "Locker"], color: #1B5E3C
- "Standard" — Rs. 7,500/month, features: ["Gym floor access", "Locker", "Cardio zone", "1 PT session/week"], color: #C9861B, bmi_min: 25, bmi_max: 35, recommended_goals: ["weight_loss", "general_fitness"]
- "Premium" — Rs. 12,000/month, features: ["Full access", "Locker", "Sauna", "3 PT sessions/week", "Diet plan"], color: #1F1F1F

STAFF (7):
- Imran Malik, Head Trainer, Rs. 65,000
- Sadia Khan, Trainer, Rs. 45,000
- Yasir Ahmed, Trainer, Rs. 42,000
- Rashid Ali, Cashier, Rs. 35,000
- Nasreen Bibi, Cleaner, Rs. 22,000
- Kamran Sheikh, Cleaner, Rs. 22,000
- Junaid Iqbal, Manager, Rs. 55,000

MEMBERS (25):
Use these realistic Pakistani names, randomly assign packages, varied statuses:
- Ahmed Khan, Bilal Sheikh, Muhammad Usman, Hassan Raza, Ali Raza, Umer Farooq, Saad Malik, Hamza Siddiqui, Faisal Qureshi, Zubair Ahmed, Tariq Mehmood, Kashif Nawaz, Danish Rehman, Waqar Shah, Asad Hussain, Ayesha Malik, Fatima Riaz, Zainab Iqbal, Sara Ahmed, Hina Butt, Rabia Noor, Amna Tariq, Sana Javed, Nadia Akhtar, Maryam Khan
- 18 active, 3 overdue (fee_dues with status='overdue'), 2 frozen, 2 expired
- Random realistic WhatsApp numbers (+92 3XX XXXXXXX)
- Heights: 155-185cm, Weights: 55-110kg (BMI auto-calculated by trigger)
- Membership dates: staggered over the last 6 months
- Generate QR tokens for all members (sign with QR_SIGNING_SECRET env var using jose)

ATTENDANCE (last 60 days):
- Generate 8-15 random member check-ins per day (weekdays more, weekends less)
- 3-5 staff check-ins per day
- Methods: mix of 'qr' (80%) and 'manual' (20%)
- Check-in times: mostly 6-8 AM and 5-9 PM (realistic gym peak hours)

PAYMENTS (last 2 months):
- Generate monthly fee payments for most active members
- 3 members should have partial payments
- 5 members should have no payment for current month (overdue)
- Payment methods: Cash 45%, EasyPaisa 25%, JazzCash 20%, Bank Transfer 10%

FEE DUES:
- Generate fee_dues for last 2 months for all active members
- Match with payments: paid members = status 'paid', overdue members = status 'overdue', partial = status 'partial'
- Due dates: 1st of each month

EXPENSES (last 2 months):
- All 7 staff salaries for each month (category: 'salary')
- K-Electric bill: Rs. 62,000 and Rs. 58,000 (category: 'utilities')
- SSGC gas: Rs. 18,000 and Rs. 15,000 (category: 'utilities')
- Water tanker: Rs. 8,000/month (category: 'utilities')
- Floor cleaner + supplies: Rs. 3,200 and Rs. 4,100 (category: 'cleaning')
- Treadmill belt repair: Rs. 8,500 (category: 'repairs')
- Bulb replacement: Rs. 2,400 (category: 'maintenance')
- Tea/refreshments: Rs. 1,800/month (category: 'miscellaneous')
- Payment methods: varied (Cash, Bank Transfer, EasyPaisa, JazzCash)

INVENTORY ITEMS (10):
- Whey Protein 2kg (Chocolate), Supplements, cost Rs. 8,500, sell Rs. 11,000, stock 12
- Whey Protein 2kg (Vanilla), Supplements, cost Rs. 8,500, sell Rs. 11,000, stock 3 (low stock)
- Mass Gainer 3kg, Supplements, cost Rs. 9,200, sell Rs. 12,500, stock 6
- BCAA 300g, Supplements, cost Rs. 3,200, sell Rs. 4,500, stock 8
- Gatorade 500ml, Drinks, cost Rs. 140, sell Rs. 250, stock 34
- Sting Energy, Drinks, cost Rs. 65, sell Rs. 120, stock 48
- Nestle Water 1.5L, Drinks, cost Rs. 60, sell Rs. 100, stock 22
- Protein Bar, Snacks, cost Rs. 320, sell Rs. 500, stock 0 (out of stock)
- Lifting Gloves (M), Accessories, cost Rs. 850, sell Rs. 1,500, stock 5
- Shaker Bottle, Accessories, cost Rs. 280, sell Rs. 500, stock 18

INVENTORY SALES (last month, 8 sales):
- Mix of member purchases and walk-ins
- Average 1-3 items per sale
- Payment methods varied

Implementation:
- Create as a Server Action: src/actions/seed.ts
- Add a "Load Demo Data" button in the Settings page under a new "Demo Data" section
- Show a confirmation modal: "This will populate your gym with sample data for demo purposes. Existing data will not be affected."
- Show progress during seeding (or a loading spinner)
- After completion, show success toast and redirect to dashboard
- Also add a "Clear Demo Data" button that removes all seeded records (mark seeded records with a notes field containing 'demo_seed' so they can be identified and deleted)

FEATURE 2: WHATSAPP DEEP-LINK REMINDERS

Make the "Send Reminder" button on the Fees page and Member Profile actually work — without needing WhatsApp Business API setup.

How it works:
- When user clicks "Send Reminder" on an overdue fee_due:
  1. Generate a pre-filled reminder message based on the member's data:
     "Hi [name], your gym membership fee of Rs. [amount] is overdue by [X] days. Kindly visit the front desk or contact us to clear your dues. Thank you! — [gym_name]"
  2. Open WhatsApp via deep link: https://wa.me/[member_whatsapp_number]?text=[encoded_message]
  3. This opens WhatsApp (web or mobile) with the message pre-filled — the staff just hits Send
  4. Log this in the reminders table: channel='whatsapp', status='sent', template='manual_deeplink'
  5. Update fee_due: last_reminder_sent_at, increment reminder_count
  6. Show a toast: "WhatsApp opened with reminder for [member_name]"

- If the member has no WhatsApp number: show a toast error "No WhatsApp number on file for [name]. Add it in their profile."

- On the Fees page bulk action "Send Reminders to Selected":
  1. For each selected overdue member with a WhatsApp number, open wa.me links sequentially (with 1 second delay between each)
  2. Show progress: "Sending 1 of 5..."
  3. Log each in reminders table

- Add the same "Send Reminder" button on:
  - Member Profile → Payments tab (next to each overdue fee_due)
  - Dashboard → Fee Alerts section (next to each overdue member row)

Message templates (stored in a constant, not hardcoded in each button):
- OVERDUE: "Hi {name}, your gym membership fee of {currency}{amount} is overdue by {days} days. Kindly visit the front desk or contact us to clear your dues. Thank you! — {gym_name}"
- DUE_SOON: "Hi {name}, your gym membership fee of {currency}{amount} is due on {date}. Please visit the front desk to renew. Thank you! — {gym_name}"
- RECEIPT: "Hi {name}, we've received your payment of {currency}{amount} for {period}. Thank you! Your membership is active until {expiry}. — {gym_name}"

Also add a "Send Receipt" button next to each payment in Member Profile → Payments tab, using the RECEIPT template.

WhatsApp number formatting:
- Strip spaces, dashes, and leading 0 from the stored number
- Ensure it starts with country code (92 for Pakistan)
- Format: 923001234567 (no + sign in wa.me URL)