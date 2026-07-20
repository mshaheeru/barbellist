# API Patterns Skill

## When to use this skill
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

## Hook Patterns

### Pattern 1: Paginated List (has `meta`)
```typescript
export function useMembers(params: MemberFilters = {}) {
  const gymId = useGymId();
  return useQuery({
    queryKey: ['members', gymId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({ ...params, gym_id: gymId });
      const response = await fetch(`/api/members?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch members');
      return response.json();  // ✅ return FULL response — { data: [], meta: {} }
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!gymId,
  });
}

// Component
const { data, isLoading, error } = useMembers(filters);
const members = data?.data || [];   // ✅ double .data
const meta = data?.meta;             // ✅ pagination at root
```

### Pattern 2: Single Item (no `meta`)
```typescript
export function useMember(id: string | undefined) {
  const gymId = useGymId();
  return useQuery({
    queryKey: ['members', gymId, id],
    queryFn: async () => {
      const response = await fetch(`/api/members/${id}`);
      if (!response.ok) throw new Error('Failed to fetch member');
      const json = await response.json();
      return json.data;  // ✅ return just the item
    },
    enabled: !!id && !!gymId,
    staleTime: 2 * 60 * 1000,
  });
}

// Component
const { data: member } = useMember(id);
// member is the direct object — no .data needed
```

### Pattern 3: Array Without Meta
```typescript
export function useMemberAttendance(memberId: string | undefined) {
  const gymId = useGymId();
  return useQuery({
    queryKey: ['attendance', gymId, memberId],
    queryFn: async () => {
      const response = await fetch(`/api/attendance/member/${memberId}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const json = await response.json();
      return json.data;  // ✅ return just the array
    },
    enabled: !!memberId && !!gymId,
  });
}

// Component
const { data: attendance } = useMemberAttendance(id);
const records = attendance || [];  // ✅ direct access
```

### Pattern 4: Mutation via Server Action
```typescript
export function useCreateMember() {
  const queryClient = useQueryClient();
  const gymId = useGymId();
  return useMutation({
    mutationFn: async (input: CreateMemberInput) => {
      const result = await createMemberAction(input);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', gymId] });
      toast.success('Member added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
```

### Pattern 5: Server Action (Next.js 16 — preferred for forms)
```typescript
// src/actions/members.ts
'use server'

export async function createMember(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const gymId = user?.user_metadata?.gym_id;

  if (!gymId) return { error: 'Not authenticated' };

  const parsed = CreateMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data, error } = await supabase
    .from('members')
    .insert({ ...parsed.data, gym_id: gymId })
    .select('id, name, member_code')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard/members');
  return { data };
}

// Component — using useActionState (React 19)
'use client'
import { useActionState } from 'react';
import { createMember } from '@/actions/members';

const [state, action, isPending] = useActionState(createMember, null);
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
  const response = await fetch('/api/members');
  const json = await response.json();
  console.log('raw response:', json);
  return json;
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
