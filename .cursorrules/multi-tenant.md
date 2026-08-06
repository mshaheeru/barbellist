# Multi-Tenant Patterns

## When to use
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
```

---

## New Table Checklist

When creating any new table:

```sql
CREATE TABLE public.new_feature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  -- ...
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_new_feature_gym ON public.new_feature(gym_id);
ALTER TABLE public.new_feature ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gym_isolation" ON public.new_feature
  FOR ALL USING (gym_id = public.get_current_gym_id());
```

**Never skip RLS.**

---

## Auth claims (IMPORTANT)

Use **`app_metadata`** for `gym_id`, `organization_id`, and `role`. Never authorize from `user_metadata`.

Helpers: `lib/auth/claims.ts`.

---

## Role-Based Access

- **owner**: full access; multi-branch; billing; create/delete branches
- **manager**: ops except settings/billing/branches
- **cashier / trainer / cleaner**: scoped to single branch

Only **owners** can access multiple branches.

---

## Security Testing Checklist

- [ ] Branch A owner sees only Branch A data
- [ ] Switching to Branch B shows only B
- [ ] Non-owner cannot switch branches
- [ ] RLS + gym_id filters on all ops tables
- [ ] Claims from app_metadata
