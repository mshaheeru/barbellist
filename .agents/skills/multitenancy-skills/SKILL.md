# Multi-Tenant Patterns Skill

## When to use this skill
Load when: creating new tables, writing RLS policies, building new features, debugging cross-gym data leaks, onboarding a new gym/branch, or any question about tenant isolation.

---

## Architecture Overview

```
Organization (billing tenant)
  ├── Gym / Branch A  (gym_id) → members, payments, staff, …
  └── Gym / Branch B  (gym_id) → members, payments, staff, …

Single Supabase DB, shared schema.
Operational isolation key: gym_id (each branch is a gyms row).
Billing lives on organizations only.
```

**Strategy:** Single database, shared schema. Every operational row has `gym_id`. RLS + application-level filtering ensures isolation. Owners belong to an organization and can switch active `gym_id`.

---

## How gym_id Flows Through the System

```
1. Owner signs up
   → organizations row created (billing)
   → first gyms (branch) row created
   → auth.user with app_metadata: { organization_id, gym_id, role: 'owner' }
   → organization_members + staff row for owner

2. Owner creates another branch
   → new gyms row under same organization_id
   → owner staff row created on that branch
   → no data is shared between branches

3. Owner invites staff (at current branch)
   → auth.user with app_metadata: { organization_id, gym_id, role }
   → staff row on current gym only (non-owners cannot multi-branch)

4. Login:
   → Owner with 2+ branches → /select-branch picker
   → Otherwise JWT already has gym_id → /dashboard

5. Every request:
   → Read gym_id / role from app_metadata (via lib/auth/claims.ts)
   → Every Supabase query includes .eq('gym_id', gymId)

6. RLS as safety net:
   → get_current_gym_id() reads app_metadata.gym_id
   → Even if application code forgets gym_id filter, RLS blocks cross-branch reads
```

---

## New Table Checklist

When creating any new table:

```sql
-- 1. Always include gym_id
CREATE TABLE public.new_feature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  -- ... your columns ...
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index gym_id
CREATE INDEX idx_new_feature_gym ON public.new_feature(gym_id);

-- 3. Enable RLS
ALTER TABLE public.new_feature ENABLE ROW LEVEL SECURITY;

-- 4. Create isolation policy
CREATE POLICY "gym_isolation" ON public.new_feature
  FOR ALL USING (gym_id = public.get_current_gym_id());

-- 5. Add updated_at trigger
CREATE TRIGGER trg_new_feature_updated_at
  BEFORE UPDATE ON public.new_feature
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
```

**Never skip steps 3-4. RLS is your safety net.**

---

## Auth claims (IMPORTANT)

Use **`app_metadata`** for `gym_id`, `organization_id`, and `role`. Never authorize from `user_metadata` (user-editable).

Helpers: `lib/auth/claims.ts` (`getUserGymId`, `getUserRole`, `getUserOrganizationId`).

---

## Server Action Pattern

```typescript
'use server'
import { getActionContext } from '@/lib/auth/get-action-context'

export async function getMembers() {
  const ctx = await getActionContext({ requireRole: true })
  if (!ctx) return { error: 'Not authenticated' }

  const { data, error } = await ctx.supabase
    .from('members')
    .select('id, name, status')
    .eq('gym_id', ctx.gymId)  // ← ALWAYS FIRST FILTER

  if (error) return { error: error.message }
  return { data: data || [] }
}
```

---

## Role-Based Access

Roles hierarchy for Barbellist:
- **owner**: full access; multi-branch switch; settings/billing; create branches
- **manager**: everything except settings/billing / branch management
- **cashier**: members (read), fees (read + record), attendance, inventory (sales)
- **trainer**: members (read), attendance (read + own check-in)
- **cleaner**: attendance (own check-in only)

Only **owners** can access multiple branches.

---

## Security Testing Checklist

Before shipping any feature:

- [ ] **Positive test:** Logged in as Branch A owner, can see Branch A data
- [ ] **Negative test:** CANNOT see Branch B data without switching
- [ ] **Owner switch:** Selecting Branch B updates app_metadata.gym_id and shows only B
- [ ] **Non-owner:** No branch picker / cannot switch
- [ ] **RLS active:** Table has RLS enabled + gym_isolation policy
- [ ] **gym_id in WHERE / INSERT:** Always
- [ ] **Claims from app_metadata:** Not user_metadata
