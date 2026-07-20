# Multi-Tenant Patterns

## When to use
Load when: creating new tables, writing RLS policies, building new features, debugging cross-gym data leaks, onboarding a new gym, or any question about tenant isolation.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Single Supabase DB              │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Gym A   │  │  Gym B   │  │  Gym C   │  │
│  │ gym_id=1 │  │ gym_id=2 │  │ gym_id=3 │  │
│  │          │  │          │  │          │  │
│  │ members  │  │ members  │  │ members  │  │
│  │ payments │  │ payments │  │ payments │  │
│  │ staff    │  │ staff    │  │ staff    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│  All in the SAME tables, isolated by RLS     │
└─────────────────────────────────────────────┘
```

**Strategy:** Single database, shared schema. Every row has `gym_id`. RLS + application-level filtering ensures isolation.

---

## How gym_id Flows Through the System

```
1. Gym owner signs up
   → gyms row created
   → auth.user created with user_metadata: { gym_id: '<uuid>', role: 'owner' }
   → staff row created for owner

2. Owner invites staff
   → auth.user created with user_metadata: { gym_id: '<uuid>', role: 'trainer' }
   → staff row created

3. User logs in → JWT issued with gym_id in claims

4. Every request:
   → Next.js middleware refreshes session, redirects unauthenticated users
   → Server Action / Route Handler reads gym_id from supabase.auth.getUser()
   → Every Supabase query includes .eq('gym_id', gymId)

5. RLS as safety net:
   → Even if application code forgets gym_id filter,
      RLS policy blocks cross-gym reads/writes
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

-- 2. Index gym_id (always — it's in every WHERE clause)
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

**Never skip steps 3-4. RLS is your safety net — if application code has a bug, RLS prevents the data leak.**

---

## Server Action Pattern

```typescript
'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const QuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  status: z.string().optional(),
})

export async function getMembers(query: z.infer<typeof QuerySchema>) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const gymId = user?.user_metadata?.gym_id
  if (!gymId) return { error: 'Not authenticated' }

  const { page, limit, status } = query
  const offset = (page - 1) * limit

  let qb = supabase
    .from('members')
    .select('id, name, status, created_at', { count: 'exact' })
    .eq('gym_id', gymId)  // ← ALWAYS FIRST FILTER

  if (status) qb = qb.eq('status', status)

  const { data, error, count } = await qb
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return { error: error.message }

  return {
    data: data || [],
    meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
  }
}

export async function createMember(input: CreateMemberInput) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const gymId = user?.user_metadata?.gym_id
  if (!gymId) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('members')
    .insert({ ...input, gym_id: gymId })  // ← ALWAYS INCLUDE
    .select('id, name')
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function getMemberById(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const gymId = user?.user_metadata?.gym_id
  if (!gymId) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('members')
    .select('id, name, status, created_at')
    .eq('id', id)
    .eq('gym_id', gymId)  // ← DOUBLE CHECK: id AND gym_id
    .single()

  if (error || !data) return { error: 'Member not found' }
  return { data }
}
```

---

## Role-Based Access

Enforce roles in Server Actions / Route Handlers and UI. RLS is the database safety net.

```typescript
const role = user?.user_metadata?.role
if (!['owner', 'manager'].includes(role)) {
  return { error: 'Insufficient permissions' }
}
```

Roles hierarchy for Barbellist:
- **owner**: full access (settings, billing, delete gym)
- **manager**: everything except settings/billing
- **cashier**: members (read), fees (read + record), attendance (read + check-in), inventory (sales)
- **trainer**: members (read), attendance (read + own check-in)
- **cleaner**: attendance (own check-in only)

---

## Gym Registration Flow

```typescript
async function registerGym(input: RegisterGymInput) {
  // 1. Create gym
  const { data: gym } = await supabase
    .from('gyms')
    .insert({
      name: input.gymName,
      slug: slugify(input.gymName),
      city: input.city,
      country: input.country,
    })
    .select('id, name, slug')
    .single()

  // 2. Create auth user with gym_id in metadata
  const { data: authUser } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    user_metadata: {
      gym_id: gym.id,        // ← THIS IS HOW TENANT IS LINKED
      role: 'owner',
      full_name: input.ownerName,
    },
    email_confirm: true,
  })

  // 3. Create staff record for owner
  await supabase.from('staff').insert({
    gym_id: gym.id,
    auth_user_id: authUser.user.id,
    name: input.ownerName,
    role: 'owner',
    email: input.email,
    phone: input.phone,
  })
}
```

---

## Security Testing Checklist

Before shipping any feature:

- [ ] **Positive test:** Logged in as Gym A owner, can see Gym A data
- [ ] **Negative test:** Logged in as Gym A owner, CANNOT see Gym B data
- [ ] **ID guessing:** Using Gym B member's UUID in Gym A's request returns error, not the data
- [ ] **RLS active:** Table has RLS enabled + gym_isolation policy
- [ ] **No `select('*')`:** Only needed columns are returned
- [ ] **gym_id in WHERE:** Every SELECT, UPDATE, DELETE includes `.eq('gym_id', gymId)`
- [ ] **gym_id in INSERT:** Every INSERT includes `gym_id` in the payload
