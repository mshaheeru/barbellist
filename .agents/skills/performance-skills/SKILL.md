# Performance Patterns Skill

## When to use this skill
Load when: writing or reviewing Server Actions / Route Handlers, debugging slow pages, noticing N+1 issues, working on list endpoints, optimizing dashboard stats, React Query tuning.

---

## Server Actions / Route Handlers: N+1 Detection & Fix

### How to Spot N+1
```typescript
// 🔴 CLASSIC N+1 — await inside a loop
for (const member of members) {
  const { data: dues } = await supabase
    .from('fee_dues').select('*').eq('member_id', member.id);
  // 200 members = 200 queries. NEVER.
}

// 🔴 N+1 IN MAP (still N+1, just concurrent)
const results = await Promise.all(
  members.map(m =>
    supabase.from('fee_dues').select('*', { count: 'exact', head: true })
      .eq('member_id', m.id)
  )
);
// 200 members = 200 queries, just fired at once.
```

### The Fix: Batch + In-Memory Group
```typescript
// ✅ SINGLE QUERY — fetch all, group in memory
const { data: allDues } = await supabase
  .from('fee_dues')
  .select('id, member_id, amount_due, status')
  .eq('gym_id', gymId)
  .in('member_id', memberIds);

const duesByMember = allDues.reduce((acc, due) => {
  (acc[due.member_id] ||= []).push(due);
  return acc;
}, {} as Record<string, FeeDue[]>);
```

---

## Sequential → Parallel Queries

### Dashboard Example
```typescript
// 🔴 Sequential — each line waits for previous
const members = await getMemberCount(gymId);
const revenue = await getRevenueThisMonth(gymId);
const expenses = await getExpensesThisMonth(gymId);
const overdue = await getOverdueCount(gymId);
// Wall time: 4 × 20ms = 80ms minimum

// ✅ Parallel — all start simultaneously
const [members, revenue, expenses, overdue] = await Promise.all([
  getMemberCount(gymId),
  getRevenueThisMonth(gymId),
  getExpensesThisMonth(gymId),
  getOverdueCount(gymId),
]);
// Wall time: max(20ms, 20ms, 20ms, 20ms) = 20ms
```

### Two-Wave Pattern (when second depends on first)
```typescript
// Wave 1: independent data
const [membersResult, packagesResult] = await Promise.all([
  supabase.from('members').select('id, name, package_id').eq('gym_id', gymId),
  supabase.from('packages').select('id, name, price').eq('gym_id', gymId),
]);

// Wave 2: depends on wave 1 IDs
const memberIds = membersResult.data?.map(m => m.id) || [];
const [duesResult, attendanceResult] = await Promise.all([
  supabase.from('fee_dues').select('member_id, status').in('member_id', memberIds),
  supabase.from('attendance').select('member_id, check_in_at')
    .in('member_id', memberIds).gte('check_in_at', todayStart),
]);
```

---

## COUNT Without Fetching Rows

```typescript
// 🔴 Fetch all rows just to count
const { data } = await supabase.from('members').select('*').eq('gym_id', gymId);
const count = data?.length;  // Wasteful — fetches all columns of all rows

// ✅ DB-level count, zero rows transferred
const { count } = await supabase
  .from('members')
  .select('*', { count: 'exact', head: true })
  .eq('gym_id', gymId)
  .eq('status', 'active');
```

### Dashboard Stats Pattern
```typescript
export async function getDashboardStats(gymId: string) {
  const today = new Date().toISOString().split('T')[0];
  const monthStart = `${today.slice(0, 7)}-01`;

  const [activeMembers, overdueCount, revenueResult, expenseResult] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId).eq('status', 'active'),
    supabase.from('fee_dues').select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId).eq('status', 'overdue'),
    supabase.from('payments').select('amount')
      .eq('gym_id', gymId).gte('paid_at', monthStart),
    supabase.from('expenses').select('amount')
      .eq('gym_id', gymId).gte('expense_date', monthStart),
  ]);

  const revenue = revenueResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const expenses = expenseResult.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return {
    data: {
      activeMembers: activeMembers.count || 0,
      overdueCount: overdueCount.count || 0,
      revenue,
      expenses,
      profit: revenue - expenses,
    },
  };
}
```

---

## Frontend: React Query Performance

### staleTime Configuration
| Data type | staleTime | Why |
|-----------|-----------|-----|
| `useAuth`, `useGym` | 5 min | Rendered on every page — 0 means every nav = API call |
| Packages, settings | 5 min | Almost never change during a session |
| Members, staff lists | 2 min | Moderate update frequency |
| Fees, attendance | 1-2 min | Updated regularly |
| Live attendance feed | 0 | Use Supabase Realtime, always fresh |

### Gym Switch — Targeted Invalidation
```typescript
// 🔴 Nukes ALL cache — refetch storm
queryClient.invalidateQueries();

// ✅ Only invalidate gym-dependent data
queryClient.invalidateQueries({ queryKey: ['members'] });
queryClient.invalidateQueries({ queryKey: ['fees'] });
queryClient.invalidateQueries({ queryKey: ['attendance'] });
queryClient.invalidateQueries({ queryKey: ['expenses'] });
queryClient.invalidateQueries({ queryKey: ['inventory'] });
queryClient.invalidateQueries({ queryKey: ['staff'] });
// Keep auth cached — it was just verified
```

### Debounce Search
```typescript
const debouncedSearch = useDebounce(search, 300);
useQuery({
  queryKey: ['members', gymId, debouncedSearch],
  enabled: !!gymId && (debouncedSearch.length === 0 || debouncedSearch.length >= 2),
});
```

### Don't Waterfall Independent Queries
```typescript
// 🔴 Waterfall — each waits for previous
const { data: members } = useMembers();
const { data: packages } = usePackages({ enabled: !!members }); // unnecessary wait

// ✅ Fire independent queries in parallel
const { data: members } = useMembers();
const { data: packages } = usePackages(); // independent — fire immediately
```

---

## Review Checklist for New Server Actions / Route Handlers

Before finishing any data-fetching action or handler, scan for:

- [ ] Any `await` inside a `for` / `forEach` / `.map` loop? → batch with `.in()`
- [ ] Multiple independent `await` lines in sequence? → `Promise.all()`
- [ ] Same query called more than once? → fetch once, reuse variable
- [ ] Using `.select('*')`? → specify only needed columns
- [ ] Counting by fetching all rows then `.length`? → use `count: 'exact', head: true`
- [ ] Missing `.eq('gym_id', gymId)` on any query? → MANDATORY
- [ ] Frontend making 3+ requests for counts? → combine into one stats action/handler
