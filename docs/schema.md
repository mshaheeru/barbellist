---

## Complete Database Schema

Below is the full Supabase PostgreSQL schema. Every prompt references tables from this schema — run this FIRST before any feature prompt.

```sql
-- ============================================================
-- BARBELLIST — COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor as a single migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. GYMS (tenant table — no gym_id on itself)
-- ============================================================
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- used in URLs, e.g. "iron-republic"
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'PK',
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  logo_url TEXT,
  timezone TEXT DEFAULT 'Asia/Karachi',
  currency TEXT DEFAULT 'PKR',
  currency_symbol TEXT DEFAULT 'Rs.',
  settings JSONB DEFAULT '{}', -- flexible config: card template, reminder schedules, etc.
  subscription_plan TEXT DEFAULT 'early_bird', -- early_bird | standard | pro
  subscription_status TEXT DEFAULT 'active', -- active | trial | suspended | cancelled
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. STAFF / USERS (gym employees — linked to Supabase Auth)
-- ============================================================
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable if staff doesn't have app login
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  photo_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'trainer', 'cleaner', 'other')),
  monthly_salary NUMERIC(12,2) DEFAULT 0,
  commission_rate NUMERIC(5,2) DEFAULT 0, -- percentage, e.g. 20.00 = 20%
  joining_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_staff_gym ON public.staff(gym_id);

-- ============================================================
-- 3. PACKAGES (membership packages a gym offers)
-- ============================================================
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Basic", "Standard", "Premium"
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30, -- 30 = monthly, 90 = quarterly, 365 = yearly
  features JSONB DEFAULT '[]', -- ["Gym floor access", "Locker", "Personal trainer 2x/week"]
  bmi_min NUMERIC(5,2), -- nullable; for BMI-based recommendation
  bmi_max NUMERIC(5,2), -- nullable; for BMI-based recommendation
  recommended_goals TEXT[], -- e.g. {"weight_loss", "muscle_gain", "general_fitness"}
  color TEXT DEFAULT '#1B5E3C', -- for card/UI theming per tier
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_packages_gym ON public.packages(gym_id);

-- ============================================================
-- 4. MEMBERS (gym members / customers)
-- ============================================================
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_code TEXT NOT NULL, -- human-readable ID, e.g. "MBR-0042"
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  photo_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  -- Health / onboarding data
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  bmi NUMERIC(5,1), -- computed or stored at onboarding
  fitness_goals TEXT[], -- e.g. {"weight_loss", "muscle_gain"}
  -- Membership state
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  membership_start DATE,
  membership_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'expired', 'cancelled')),
  freeze_start DATE,
  freeze_end DATE,
  freeze_reason TEXT,
  -- Card
  card_qr_token TEXT UNIQUE, -- signed token for QR code
  card_issued_at TIMESTAMPTZ,
  card_printed BOOLEAN DEFAULT FALSE,
  -- Referral
  referred_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
  -- Meta
  notes TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gym_id, member_code)
);
CREATE INDEX idx_members_gym ON public.members(gym_id);
CREATE INDEX idx_members_status ON public.members(gym_id, status);
CREATE INDEX idx_members_qr ON public.members(card_qr_token);

-- ============================================================
-- 5. PAYMENTS (fee payments by members)
-- ============================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_type TEXT DEFAULT 'membership' CHECK (payment_type IN ('membership', 'personal_training', 'product', 'other')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'easypaisa', 'jazzcash', 'bank_transfer', 'card', 'other')),
  is_partial BOOLEAN DEFAULT FALSE,
  covers_from DATE, -- period this payment covers (for membership payments)
  covers_to DATE,
  notes TEXT,
  receipt_sent BOOLEAN DEFAULT FALSE,
  receipt_generated BOOLEAN DEFAULT FALSE, -- true after first PNG receipt download
  recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_gym ON public.payments(gym_id);
CREATE INDEX idx_payments_member ON public.payments(member_id);
CREATE INDEX idx_payments_date ON public.payments(gym_id, paid_at);

-- ============================================================
-- 6. FEE DUES (tracks what each member owes)
-- ============================================================
CREATE TABLE public.fee_dues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount_due NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'waived')),
  generated_for_month DATE, -- first day of the month this due is for
  last_reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  notes TEXT, -- e.g. product sale / member-tab context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_fee_dues_gym ON public.fee_dues(gym_id);
CREATE INDEX idx_fee_dues_member ON public.fee_dues(member_id);
CREATE INDEX idx_fee_dues_status ON public.fee_dues(gym_id, status);
CREATE INDEX idx_fee_dues_due_date ON public.fee_dues(gym_id, due_date);

-- ============================================================
-- 7. ATTENDANCE (unified for members AND staff)
-- ============================================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  -- Exactly one of these should be set
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('member', 'staff')),
  check_in_method TEXT DEFAULT 'qr' CHECK (check_in_method IN ('qr', 'fingerprint', 'manual')),
  check_in_at TIMESTAMPTZ DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  fee_status_at_checkin TEXT, -- snapshot: 'clear' | 'overdue' | 'due_soon'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT attendance_person_check CHECK (
    (person_type = 'member' AND member_id IS NOT NULL AND staff_id IS NULL) OR
    (person_type = 'staff' AND staff_id IS NOT NULL AND member_id IS NULL)
  )
);
CREATE INDEX idx_attendance_gym ON public.attendance(gym_id);
CREATE INDEX idx_attendance_member ON public.attendance(member_id);
CREATE INDEX idx_attendance_staff ON public.attendance(staff_id);
CREATE INDEX idx_attendance_date ON public.attendance(gym_id, check_in_at);

-- ============================================================
-- 8. EXPENSES
-- ============================================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('salary', 'utilities', 'maintenance', 'cleaning', 'repairs', 'equipment', 'rent', 'miscellaneous')),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'easypaisa', 'jazzcash', 'bank_transfer', 'card', 'other')),
  -- If category = 'salary', link to staff member
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  salary_month DATE, -- for salary expenses: first day of the month
  is_salary_full_month BOOLEAN DEFAULT TRUE,
  -- Receipt
  receipt_url TEXT, -- Supabase Storage path
  -- Who recorded it
  recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_expenses_gym ON public.expenses(gym_id);
CREATE INDEX idx_expenses_category ON public.expenses(gym_id, category);
CREATE INDEX idx_expenses_date ON public.expenses(gym_id, expense_date);

-- ============================================================
-- 9. INVENTORY ITEMS
-- ============================================================
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('supplements', 'drinks', 'snacks', 'accessories', 'apparel', 'other')),
  description TEXT,
  photo_url TEXT,
  sku TEXT,
  unit_cost NUMERIC(12,2) DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL,
  stock_qty INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inventory_gym ON public.inventory_items(gym_id);

-- ============================================================
-- 10. INVENTORY SALES (POS transactions)
-- ============================================================
CREATE TABLE public.inventory_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL, -- nullable for walk-in
  is_walkin BOOLEAN DEFAULT FALSE,
  subtotal NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'easypaisa', 'jazzcash', 'bank_transfer', 'card', 'member_tab', 'other')),
  recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  sold_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sales_gym ON public.inventory_sales(gym_id);

-- ============================================================
-- 11. INVENTORY SALE ITEMS (line items per sale)
-- ============================================================
CREATE TABLE public.inventory_sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES public.inventory_sales(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL, -- price at time of sale (snapshot)
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sale_items_sale ON public.inventory_sale_items(sale_id);

-- ============================================================
-- 12. REMINDERS LOG (WhatsApp/SMS reminders sent)
-- ============================================================
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  fee_due_id UUID REFERENCES public.fee_dues(id) ON DELETE SET NULL,
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms')),
  template TEXT, -- template name/identifier
  message_body TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'read')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  external_id TEXT, -- WhatsApp API message ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reminders_gym ON public.reminders(gym_id);
CREATE INDEX idx_reminders_member ON public.reminders(member_id);

-- ============================================================
-- 13. LEADS (lightweight CRM — future phase)
-- ============================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  source TEXT DEFAULT 'walk_in' CHECK (source IN ('walk_in', 'referral', 'social_media', 'website', 'phone', 'other')),
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'trial', 'negotiating', 'converted', 'lost')),
  interested_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  follow_up_date DATE,
  converted_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_leads_gym ON public.leads(gym_id);
CREATE INDEX idx_leads_stage ON public.leads(gym_id, stage);

-- ============================================================
-- 14. AUDIT LOG (tracks important changes)
-- ============================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  actor_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g. 'payment_recorded', 'member_frozen', 'expense_added'
  entity_type TEXT, -- e.g. 'member', 'payment', 'expense'
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_gym ON public.audit_log(gym_id);
CREATE INDEX idx_audit_date ON public.audit_log(gym_id, created_at);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's gym_id from JWT metadata
CREATE OR REPLACE FUNCTION public.get_current_gym_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'gym_id')::UUID;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
  SELECT auth.jwt() -> 'user_metadata' ->> 'role';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Auto-generate member code
CREATE OR REPLACE FUNCTION public.generate_member_code()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_code FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.members
  WHERE gym_id = NEW.gym_id;

  NEW.member_code := 'MBR-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_member_code
  BEFORE INSERT ON public.members
  FOR EACH ROW
  WHEN (NEW.member_code IS NULL OR NEW.member_code = '')
  EXECUTE FUNCTION public.generate_member_code();

-- Auto-compute BMI on member insert/update
CREATE OR REPLACE FUNCTION public.compute_bmi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.height_cm IS NOT NULL AND NEW.weight_kg IS NOT NULL AND NEW.height_cm > 0 THEN
    NEW.bmi := ROUND((NEW.weight_kg / ((NEW.height_cm / 100.0) ^ 2))::NUMERIC, 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compute_bmi
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_bmi();

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gyms_updated_at BEFORE UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_fee_dues_updated_at BEFORE UPDATE ON public.fee_dues FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Auto-deduct inventory on sale
CREATE OR REPLACE FUNCTION public.deduct_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.inventory_items
  SET stock_qty = stock_qty - NEW.quantity
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_inventory
  AFTER INSERT ON public.inventory_sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_inventory_on_sale();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Gym: users can only see their own gym
CREATE POLICY "gym_isolation" ON public.gyms
  FOR ALL USING (id = public.get_current_gym_id());

-- All other tables: filter by gym_id
-- (Repeat this pattern for every table with gym_id)

CREATE POLICY "staff_isolation" ON public.staff FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "packages_isolation" ON public.packages FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "members_isolation" ON public.members FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "payments_isolation" ON public.payments FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "fee_dues_isolation" ON public.fee_dues FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "attendance_isolation" ON public.attendance FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "expenses_isolation" ON public.expenses FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "inventory_isolation" ON public.inventory_items FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "sales_isolation" ON public.inventory_sales FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "sale_items_isolation" ON public.inventory_sale_items
  FOR ALL USING (
    sale_id IN (SELECT id FROM public.inventory_sales WHERE gym_id = public.get_current_gym_id())
  );
CREATE POLICY "reminders_isolation" ON public.reminders FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "leads_isolation" ON public.leads FOR ALL USING (gym_id = public.get_current_gym_id());
CREATE POLICY "audit_isolation" ON public.audit_log FOR ALL USING (gym_id = public.get_current_gym_id());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run via Supabase Dashboard or API:
-- 1. "member-photos" — public read, authenticated write
-- 2. "staff-photos" — public read, authenticated write
-- 3. "receipts" — private, authenticated read/write (gym-scoped folder)
-- 4. "gym-assets" — public read (logos, card templates)
-- 5. "inventory-photos" — public read, authenticated write (gym-scoped folder)
```

---
