# API Patterns

## When to use
Load when: creating React Query hooks, debugging data not showing, writing Server Actions or Route Handlers, response structure questions.

---

## Response Flow (Full Picture)

```
Server Action / Route Handler  → { data: T, error?: string, meta?: {...} }
HTTP response (Route Handler)  → { data: T, error?: string, meta?: {...} }
React Query hook               → returns response as-is or response.data
Component                      → query.data?.data (paginated) or query.data (single)
```

Server Actions and Route Handlers return `{ data, error? }` directly — no interceptor layer.

---

## Server Action Pattern (preferred for mutations)

```typescript
// src/actions/members.ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateMemberSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
})

export async function createMember(formData: FormData) {
  const parsed = CreateMemberSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const gymId = user?.user_metadata?.gym_id
  if (!gymId) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('members')
    .insert({ ...parsed.data, gym_id: gymId })
    .select('id, name, member_code')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/members')
  return { data }
}
```

---

## Route Handler Pattern (for client-fetchable data)

```typescript
// app/api/members/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const QuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  status: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const gymId = user?.user_metadata?.gym_id
  if (!gymId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 })

  const { page, limit, status } = parsed.data
  const offset = (page - 1) * limit

  let qb = supabase
    .from('members')
    .select('id, name, phone, status', { count: 'exact' })
    .eq('gym_id', gymId)

  if (status) qb = qb.eq('status', status)

  const { data, error, count } = await qb
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    data: data || [],
    meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
  })
}
```

---

## Hook Patterns

### Pattern 1: Paginated List (has `meta`)
```typescript
export function useMembers(params: MemberFilters = {}) {
  const gymId = useGymId()
  return useQuery({
    queryKey: ['members', gymId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({ ...params, gym_id: gymId })
      const response = await fetch(`/api/members?${searchParams}`)
      if (!response.ok) throw new Error('Failed to fetch members')
      return response.json() // ✅ return FULL response — { data: [], meta: {} }
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!gymId,
  })
}

// Component
const { data, isLoading, error } = useMembers(filters)
const members = data?.data || []   // ✅ double .data
const meta = data?.meta             // ✅ pagination at root
```

### Pattern 2: Single Item (no `meta`)
```typescript
export function useMember(id: string | undefined) {
  const gymId = useGymId()
  return useQuery({
    queryKey: ['members', gymId, id],
    queryFn: async () => {
      const response = await fetch(`/api/members/${id}`)
      if (!response.ok) throw new Error('Failed to fetch member')
      const json = await response.json()
      return json.data  // ✅ return just the item
    },
    enabled: !!id && !!gymId,
    staleTime: 2 * 60 * 1000,
  })
}

// Component
const { data: member } = useMember(id)
// member is the direct object — no .data needed
```

### Pattern 3: Mutation via Server Action
```typescript
export function useCreateMember() {
  const queryClient = useQueryClient()
  const gymId = useGymId()
  return useMutation({
    mutationFn: async (input: CreateMemberInput) => {
      const result = await createMemberAction(input)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', gymId] })
      toast.success('Member added successfully')
    },
  })
}
```

---

## The Decision Rule (Memorise)
```
Does the endpoint return `meta`?
  YES → return response          → component: data?.data  + data?.meta
  NO  → return response.data     → component: data
```

---

## Debugging — Data Not Showing

**Step 1: Network Tab**
- Open DevTools → Network → find the API call
- Check: Is gym_id being sent? Is response correct shape?

**Step 2: Console log the hook**
```typescript
queryFn: async () => {
  const response = await fetch('/api/members')
  const json = await response.json()
  console.log('raw response:', json)
  return json
}
```

**Step 3: Check alignment**

| Network shows | Hook returns | Component accesses |
|--------------|-------------|-------------------|
| `{ data:[], meta:{} }` | `response` (full json) | `data?.data` |
| `{ data:{} }` | `response.data` | `data` |

**Red flags:**
- `query.data?.data?.data` → wrong return shape (triple nesting = bug)
- Data is `undefined` but Network shows data → hook/component mismatch
- Data shows for one gym but not another → gym_id filter missing or wrong
