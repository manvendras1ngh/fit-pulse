# Gym Tracking App — MVP 0 Build Plan

## Context

Building a clean, mobile-first gym tracking webapp. The goal is a dead-simple workout logger with progress visualization — log sets fast, see strength gains, stay motivated. The foundation should be extensible for future features (gamification, app launch) but MVP 0 is ruthlessly scoped.

---

## Core Objective (Non-Negotiable)

After 7 days of usage, a user must be able to:

- Login with Google
- Start logging a workout within 10 seconds of opening the app
- See today's planned workout automatically (if a plan exists)
- Log sets in under 20 seconds
- View strength progress graph
- See best lifts
- View weekly summary

Everything else is out of scope.

---

## Decisions Locked In

### Critical Questions (Resolved)

1. Warm-up sets do NOT count toward volume → add `is_warmup boolean default false` to `workout_sets`
2. No logging past dates in MVP
3. User picks kg or lbs → `preferred_unit` enum on `profiles`. **Weight is always stored in kg (canonical unit).** Convert to/from lbs only at the display/input layer.
4. Rest days = no workout_plan_day for that day (implicit)
5. One active plan at a time → enforced at DB level via partial unique index: `CREATE UNIQUE INDEX one_active_plan ON workout_plans(user_id) WHERE is_active = true;`
6. Users CAN add custom exercises during a workout (inline)
7. No PR notifications — show PRs on profile/progress page only
8. Level computed dynamically on page load (not stored)
9. No cardio in MVP
10. Deleting a plan does NOT delete logs → `ON DELETE SET NULL` on `workout_logs.plan_id`
11. Weight always stored in kg — convert to/from lbs at display/input layer only
12. Profile row created via Supabase DB trigger (`AFTER INSERT ON auth.users`), not application code
13. `workout_date` computed on the **client** in user's local timezone, never server-side
14. Exercises use soft-delete (`is_deleted`) — never hard-delete exercises with references
15. Workout plans are optional. Users can log workouts without a plan (freestyle mode). `workout_logs.plan_id` and `day_name` are NULL for freestyle workouts. All progress tracking, graphs, and levels work identically for planned and freestyle workouts.
16. Exercise picker is shared between plan creation and workout logging — same search/browse UX, same component.

---

## Tech Stack

### Frontend

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** (progress graphs)

### Backend

- **Supabase** (Postgres, Auth with Google, RLS)
- Row Level Security on every table
- Server components for data fetching (read operations)
- **Server Actions** for all mutations (create/update/delete) — keeps browser Supabase client read-only
- Client components only for interactive elements (set logging, form inputs)
- Supabase CLI for local dev and migrations (`supabase init`, `supabase migration new`)
- Auto-generate TypeScript types: `supabase gen types typescript > lib/types.ts`

### Deployment

- **Vercel** (frontend)
- **Supabase** hosted DB

---

## Database Schema

### profiles (auto-created via DB trigger on auth.users)

```sql
CREATE TYPE unit_preference AS ENUM ('kg', 'lbs');

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text NOT NULL,
  avatar_url text,
  preferred_unit unit_preference DEFAULT 'kg',
  created_at timestamptz DEFAULT now()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Level is computed dynamically — not stored.

### workout_plans

```sql
CREATE TABLE workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) <= 100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enforce one active plan per user at DB level
CREATE UNIQUE INDEX one_active_plan ON workout_plans(user_id) WHERE is_active = true;
CREATE INDEX idx_workout_plans_user_active ON workout_plans(user_id, is_active);
```

### workout_plan_days

```sql
CREATE TABLE workout_plan_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  name text NOT NULL CHECK (length(name) <= 100), -- "Push", "Legs"
  UNIQUE(plan_id, day_of_week) -- prevent duplicate days in a plan
);

CREATE INDEX idx_plan_days_lookup ON workout_plan_days(plan_id, day_of_week);
```

### exercises

```sql
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE, -- NULL = system default
  name text NOT NULL CHECK (length(name) <= 100),
  muscle_group text CHECK (muscle_group IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full_body', 'cardio')),
  type text NOT NULL DEFAULT 'strength' CHECK (type IN ('strength', 'cardio')), -- future-proofing for cardio
  is_deleted boolean NOT NULL DEFAULT false, -- soft-delete for exercises with references
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_exercises_user ON exercises(user_id);
```

- System exercises: `user_id` is NULL
- Custom user exercises: `user_id` set
- RLS policy: `WHERE (user_id = (select auth.uid()) OR user_id IS NULL) AND is_deleted = false`
- Soft-delete: set `is_deleted = true` instead of hard deleting. Historical logs preserve exercise references.

### plan_day_exercises

```sql
CREATE TABLE plan_day_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id uuid NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE, -- cascade: removing exercise removes from plan
  position integer NOT NULL CHECK (position > 0),
  UNIQUE(plan_day_id, position) -- prevent duplicate positions
);

CREATE INDEX idx_plan_day_exercises_lookup ON plan_day_exercises(plan_day_id, position);
```

### workout_logs

```sql
CREATE TABLE workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES workout_plans(id) ON DELETE SET NULL,
  workout_date date NOT NULL, -- computed on CLIENT in user's local timezone
  day_name text, -- denormalized: preserves plan day name even if plan changes
  started_at timestamptz, -- future-proofing: workout duration tracking
  completed_at timestamptz, -- future-proofing: workout duration tracking
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, workout_date)
);

CREATE INDEX idx_workout_logs_user ON workout_logs(user_id);
```

- One workout per day (MVP rule)
- `ON DELETE SET NULL` on plan_id — logs survive plan deletion
- `day_name` is intentional denormalization — preserves what user saw even if plan changes later
- `started_at`/`completed_at` nullable for MVP, set automatically when workout page opens/closes

### workout_sets

```sql
CREATE TABLE workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id uuid NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- denormalized for RLS performance
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE SET NULL, -- preserve sets if exercise soft-deleted
  set_number integer NOT NULL CHECK (set_number > 0),
  weight numeric(7,2) NOT NULL CHECK (weight >= 0), -- always stored in kg
  reps integer NOT NULL CHECK (reps > 0),
  is_warmup boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workout_log_id, exercise_id, set_number) -- prevent double-tap duplicates
);

-- Critical indexes for query performance
CREATE INDEX idx_sets_log ON workout_sets(workout_log_id);
CREATE INDEX idx_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX idx_sets_user ON workout_sets(user_id); -- for RLS
CREATE INDEX idx_sets_progress ON workout_sets(exercise_id, is_warmup, weight); -- index-only scan for best lifts
```

- `user_id` denormalized from `workout_logs` for RLS performance (avoids subquery on highest-volume table)
- `weight` is `numeric(7,2)` — supports up to 99,999.99. Bare `numeric` returns as string in JS.
- **Weight is always stored in kg.** Convert at display/input layer.

---

## Row Level Security (Mandatory)

### Direct user_id tables (simple policies)
- `profiles`: `id = (select auth.uid())`
- `workout_plans`: `user_id = (select auth.uid())`
- `workout_logs`: `user_id = (select auth.uid())`
- `workout_sets`: `user_id = (select auth.uid())` (uses denormalized user_id — no subquery needed)

### Tables without user_id (subquery policies)
- `workout_plan_days`: `plan_id IN (SELECT id FROM workout_plans WHERE user_id = (select auth.uid()))`
- `plan_day_exercises`: subquery through workout_plan_days → workout_plans. Use a security definer function for performance.

### Special case: exercises
- SELECT: `user_id = (select auth.uid()) OR user_id IS NULL` (users see own + system exercises)
- INSERT: `user_id = (select auth.uid())` (cannot create system exercises)
- UPDATE: `user_id = (select auth.uid())` (cannot modify system exercises)
- DELETE: `user_id = (select auth.uid())` (cannot delete system exercises)

### Important
- Use `(select auth.uid())` (with parentheses) not `auth.uid()` — the select form is cached per query, the function form is called per row.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code. Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` for browser.

---

## Core User Flow

### Step 1: Login

- Google only
- Profile row auto-created via DB trigger (not app code) — eliminates "authenticated but no profile" bug
- Redirect to dashboard
- Handle auth errors gracefully: revoked Google access, expired callback codes → redirect to `/login?error=...`

### Step 2: Dashboard

Dashboard adapts to user state. "Start Workout" is ALWAYS available.

**No plan, first time:**
- "Ready to lift?" + large "Start Workout" CTA
- No mention of plans. No prompts to create one.

**No plan, returning user:**
- "Start Workout" CTA (or "Continue Workout" if log exists today)
- Weekly summary below

**Has plan, today is a plan day, no workout started:**
- "Today: Chest Day" with exercise list preview
- "Start Workout" CTA
- Day switcher: dropdown showing all plan days + "Freestyle" option
- Weekly summary

**Has plan, today is a plan day, workout already started:**
- "Today: Chest Day"
- "Continue Workout" CTA with brief summary ("3 exercises, 9 sets so far")
- Weekly summary

**Has plan, today is rest day:**
- "Rest day! Next workout: Leg Day (Tuesday)"
- "Start Workout" still available (for freestyle or picking any plan day)
- Day switcher: all plan days + "Freestyle"
- Weekly summary

Logic:

```
// All date computation on CLIENT in user's local timezone
todayDate = new Date().toLocaleDateString('en-CA')  // YYYY-MM-DD
today = new Date().getDay()  // 0-6

existingLog = query workout_logs WHERE user_id AND workout_date = todayDate
activePlan = query workout_plans WHERE user_id AND is_active = true
todayPlanDay = query workout_plan_days WHERE plan_id AND day_of_week = today

if (existingLog) → "Continue Workout"
else → "Start Workout"

if (todayPlanDay) → show plan day name + exercise preview + day switcher
else if (activePlan) → show "Rest day" + day switcher
else → show just the Start Workout button (no plan context)
```

"Manage Plans" accessible from navigation sidebar/menu — never blocking main flow.

### Step 3: Start Workout / Continue Workout

**Starting a new workout:**
1. Fetch-or-create `workout_log` for today using `INSERT ... ON CONFLICT (user_id, workout_date) DO NOTHING` + subsequent SELECT (atomic)
2. If from a plan day: set `plan_id` and `day_name` on the log, pre-load plan exercises
3. If freestyle (no plan or user chose "Freestyle"): `plan_id` = NULL, `day_name` = NULL, open exercise picker immediately
4. Set `started_at = now()`

**Continuing an existing workout:**
1. Load existing `workout_log` + all `workout_sets` for today
2. If log has `plan_id`/`day_name`, show plan exercises with logged sets filled in
3. User can always add more exercises via picker (even on planned workouts)

**Workout Page Layout:**

```
[Header: "Chest Day" or "Freestyle Workout"]
[+ Add Exercise] button (always visible)

Exercise Card: Bench Press
  Set 1: [100 kg] [8 reps] [warmup?] [delete]
  Set 2: [100 kg] [6 reps] [warmup?] [delete]
  [+ Add Set]

Exercise Card: Incline DB Press
  (no sets yet)
  [+ Add Set]

[+ Add Exercise]
```

**Exercise Picker (triggered by "+ Add Exercise"):**
- Bottom sheet or full-screen modal
- Search bar at top (filters as you type, debounced 250ms)
- Grouped by muscle group: Chest, Back, Shoulders, Biceps, Triceps, Legs, Core
- System exercises first, then user's custom exercises (marked "Custom")
- "Can't find it? Create custom exercise" at bottom — name (required), muscle group (optional)
- Tapping an exercise adds it to the current workout immediately

**Day Switcher (only if user has an active plan):**
- Dropdown on dashboard or workout page header
- Shows all plan day names + "Freestyle"
- Switching BEFORE any sets logged: swaps pre-loaded exercises, updates `plan_id`/`day_name`
- Switching AFTER sets logged: blocked — show toast "Finish this workout first, or add exercises individually"

- Debounce "Add Set" button (300ms) to prevent double-tap duplicates
- On mutation failure: show error state on the failed set (red border + retry), do NOT silently remove
- Do NOT clear client state on network failure — let user keep logging, retry when connectivity returns

### Step 4: Edit Same Day

User can:

- Edit weight / reps
- Delete set
- Add more sets
- Toggle warmup
- Add more exercises (always, via exercise picker)

Cannot edit previous dates in MVP.

---

## Progress Tracking (Graphs)

Only shown after 7+ logged workouts.

### Graph 1 — Total Volume Over Time

```sql
SELECT workout_date, SUM(weight * reps)
FROM workout_sets
JOIN workout_logs ON workout_sets.workout_log_id = workout_logs.id
WHERE is_warmup = false
GROUP BY workout_date
```

Line chart via Recharts.

### Graph 2 — Exercise Progress

Select specific exercise. Compute estimated 1RM:

```
1RM = weight * (1 + reps/30)
```

(Epley formula — reasonable for reps < 10, less accurate above that.)

Plot by date.

---

## Best Lifts (Profile Page)

```sql
SELECT exercise_id, MAX(weight)
FROM workout_sets
WHERE is_warmup = false
GROUP BY exercise_id
```

Or compute best estimated 1RM. Display top 3 lifts. No manual editing.

---

## Level System (Computed Dynamically)

Computed on page load — not stored in DB.

| Level        | Criteria                                     |
| ------------ | -------------------------------------------- |
| Beginner     | < 10 workouts                                |
| Intermediate | 10–30 workouts                               |
| Pro          | 30+ workouts + increasing volume trend       |
| God          | 90+ workouts + strong consistent progression |

---

## UI / UX Rules (Non-Negotiable)

- Mobile-first
- Dark theme default (only theme for MVP)
- Number pad for weight/rep inputs
- One tap to add set
- No multi-page chaos
- No confirmation modals
- Keep interactions under 2 clicks
- Zero entry barrier: first workout loggable within 30 seconds of signup
- Plans are power-user features, never prerequisites
- "Start Workout" always available on dashboard regardless of plan state

---

## Edge Cases

### Covered in MVP
1. **User skips workout day** → Do not auto-shift schedule
2. **User changes plan mid-week** → New logs use new plan only. Old logs retain old plan's day_name.
3. **Exercise deleted** → Soft-delete (`is_deleted = true`). Historical logs and sets remain intact. Exercise hidden from pickers.
4. **Timezone differences** → `workout_date` computed on CLIENT via `new Date().toLocaleDateString('en-CA')`. Never compute server-side — UTC offset breaks for western hemisphere users (e.g., LA at 11 PM = next day UTC).
5. **Double logging** → Prevented by `UNIQUE(user_id, workout_date)` constraint
6. **Double-tap add set** → Prevented by `UNIQUE(workout_log_id, exercise_id, set_number)` + client-side debounce (300ms)
7. **Fetch-or-create race condition** → Use `INSERT ... ON CONFLICT DO NOTHING` + SELECT (atomic)
8. **Token expiry mid-workout** → `@supabase/ssr` handles refresh via middleware on navigation. Server Actions handle auth server-side for mutations.
9. **Plan activation race (two tabs)** → Prevented by partial unique index `one_active_plan` at DB level
10. **Network loss mid-workout** → Do not clear client state. Queue failed mutations. Retry on next successful request. (Not full offline — just basic resilience.)
11. **Unit conversion precision** → Always store in kg. Convert at display layer. Avoid round-trip precision loss.
12. **Traveling user changes timezone** → Known limitation: may get a "double day" or blocked day. Document as acceptable for MVP.
13. **User starts freestyle, later creates a plan** → Old freestyle logs have plan_id = NULL. They still count toward progress, volume, levels, weekly summaries. Creating a plan does NOT retroactively tag old logs.
14. **User switches plan day** → workout_logs.day_name stores what the user chose (e.g., "Leg Day" even if today was a "Chest Day"). Reflects what was actually done.
15. **User adds freestyle exercises to planned workout** → Extra exercises are simply more workout_sets rows on the same workout_log. Log retains plan_id and day_name. No schema change needed.
16. **User never creates a plan** → Full app works: freestyle workouts, progress graphs, best lifts, levels. Only missing: auto-loaded exercises on dashboard and day switching.
17. **User starts workout, logs zero sets, abandons** → Empty workout_log exists. Dashboard shows "Continue Workout" for rest of day. Empty log doesn't affect progress (no sets = no volume).

### Not Handled (MVP 1+)
- Logging past dates
- Offline/PWA
- Multi-device conflict resolution

---

## Build Phases

### Phase 1: Project Setup & Auth

- `npx create-next-app` with TypeScript + Tailwind + App Router
- Install shadcn/ui, @supabase/ssr, @supabase/supabase-js, recharts
- `supabase init` for local development + migrations
- Configure Supabase clients (server via `@supabase/ssr`, browser client)
- Google OAuth login flow with proper error handling (revoked access, expired codes)
- Profile auto-created via DB trigger (not app code)
- Auth middleware using `@supabase/ssr` cookie-based pattern with token refresh
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only)
- Add `app/error.tsx` and `app/global-error.tsx` error boundaries

### Phase 2: Database & RLS

- Schema SQL as Supabase CLI migration files (`supabase/migrations/`)
- All constraints, indexes, and triggers from the schema section above
- Seed system exercises via `supabase/seed.sql` (Bench Press, Squat, Deadlift, OHP, Barbell Row, Pull-ups, Lat Pulldown, Dumbbell Curl, Tricep Pushdown, Leg Press, Romanian Deadlift, Lateral Raise)
- Configure RLS policies per the RLS section above
- Test RLS: user A cannot see user B's data
- Test: user cannot modify system exercises
- Auto-generate TypeScript types: `supabase gen types typescript --local > lib/types.ts`

### Phase 3: Dashboard (Home Screen) — MOVED UP

- `/dashboard` — home screen
- "Start Workout" / "Continue Workout" CTA (no plan dependency)
- Weekly summary (workouts completed this week)
- Current level badge (computed dynamically)
- Detect existing workout_log for today (continue vs start)
- Empty states for new users — NO plan creation prompts

### Phase 4: Workout Logging (Core) — FREESTYLE-FIRST

- `/dashboard/workout` — today's workout
- Fetch-or-create `workout_log` for today (plan_id = NULL for freestyle)
- Exercise picker: search/browse system exercises, create custom exercises inline
- Exercise cards with weight/reps inputs (number pad)
- Add set button (one tap)
- Warmup toggle per set
- Optimistic UI updates
- Edit/delete sets (today only)
- **This phase works fully WITHOUT any plan.**

### Phase 5: Plan Integration Layer — NEW

- Extend dashboard to show today's plan day when active plan exists
- Day switcher UI (dropdown: plan days + "Freestyle")
- Extend workout page to pre-load plan exercises when starting from a plan day
- Set `plan_id`/`day_name` on workout_log when starting a planned workout

### Phase 6: Plan Creation Flow — MOVED DOWN

- `/dashboard/plan` — create/edit workout plan
- Select plan name
- Assign exercises to each weekday (reuses exercise picker from Phase 4)
- Simple list UI (no drag-drop)
- Enforce single active plan
- Accessible from navigation menu, NOT from main dashboard flow

### Phase 7: Progress & Profile

- `/dashboard/progress` — graphs
  - Total volume over time (line chart)
  - Per-exercise estimated 1RM over time (line chart, exercise selector)
  - Only show after 7+ logged workouts
- `/dashboard/profile` — best lifts
  - Top 3 lifts by estimated 1RM
  - Level display with criteria breakdown

### Phase 8: Polish & Deploy

- Mobile responsiveness pass
- Dark theme styling
- Loading states, empty states, error boundaries
- Vercel deployment
- Supabase production project setup

---

## Mutation Pattern

All write operations use Next.js Server Actions:
- Server Actions handle auth server-side (no token in browser for mutations)
- Each mutation wrapped in try/catch with user-visible toast error (shadcn/ui Sonner)
- Optimistic UI: update client state immediately, rollback on failure with error state
- Components never import Supabase directly — all DB calls go through `lib/queries/`

---

## Error Handling Strategy

- `app/error.tsx` — per-page error boundary with "Something went wrong" + retry button
- `app/global-error.tsx` — root layout error boundary
- Mutation failures → toast notification via shadcn/ui Sonner
- Auth expiry → redirect to `/login`
- RLS errors on SELECT → empty results (Supabase behavior) → show empty state
- RLS errors on INSERT/UPDATE/DELETE → catch and show toast
- Network failure during workout → preserve client state, show retry option

---

## Loading & Empty States

| Page | Empty State | Loading |
|---|---|---|
| Dashboard (new user, no plan) | "Ready to lift? Start your first workout." + CTA | Skeleton |
| Dashboard (returning, no plan) | "Start Workout" CTA + weekly summary | Skeleton |
| Dashboard (plan, rest day) | "Rest day! Next workout: [day]. Or start one anyway." | Skeleton |
| Workout (freestyle, no exercises added) | "Search for an exercise to get started" + picker open | Skeleton |
| Workout (plan, no exercises in plan day) | "No exercises in this day. Add some, or go freestyle." | Skeleton |
| Progress (< 7 workouts) | "Log 7 workouts to unlock charts" | Skeleton |
| Best lifts (no data) | "Complete a workout to see best lifts" | Skeleton |

---

## Migration Strategy

- Use Supabase CLI from day one: `supabase init`, `supabase start`, `supabase migration new`
- All schema changes live in `supabase/migrations/` as SQL files
- Seed data in `supabase/seed.sql`
- Deploy via `supabase db push` to hosted project
- **Never** make schema changes directly in Supabase dashboard for production
- TypeScript types auto-generated after each migration

---

## Environment Variables

```
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server only, NEVER in client code
```

Same variables set in Vercel dashboard for production.

---

## Folder Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── callback/route.ts
├── dashboard/
│   ├── page.tsx              # Home dashboard
│   ├── layout.tsx            # Auth guard + nav
│   ├── workout/page.tsx      # Today's workout logger
│   ├── plan/page.tsx         # Plan creation/edit
│   ├── progress/page.tsx     # Graphs
│   └── profile/page.tsx      # Best lifts + level
├── error.tsx                  # Per-page error boundary
├── global-error.tsx           # Root layout error boundary
├── layout.tsx
└── page.tsx                  # Landing → redirect
lib/
├── supabase/
│   ├── client.ts             # Browser client
│   ├── server.ts             # Server client
│   └── middleware.ts          # Auth middleware (@supabase/ssr)
├── actions/                   # Server Actions for mutations
│   ├── workouts.ts
│   ├── plans.ts
│   └── exercises.ts
├── queries/                   # Supabase query functions (read-only)
│   ├── workouts.ts
│   ├── plans.ts
│   ├── exercises.ts
│   └── progress.ts
├── utils/
│   ├── level.ts              # Level computation logic
│   └── units.ts              # kg/lbs conversion (toDisplay, toStorage)
└── types.ts                  # Auto-generated via supabase gen types
components/
├── workout/
│   ├── exercise-card.tsx
│   ├── set-row.tsx
│   ├── add-exercise.tsx
│   └── exercise-picker.tsx    # Search/browse/create exercises (shared with plan)
├── dashboard/
│   ├── today-summary.tsx
│   ├── weekly-summary.tsx
│   └── day-switcher.tsx       # Dropdown to switch plan day or go freestyle
├── progress/
│   ├── volume-chart.tsx
│   └── exercise-progress-chart.tsx
├── plan/
│   └── day-editor.tsx
└── ui/                        # shadcn components
supabase/
├── migrations/
│   └── 00001_initial_schema.sql  # All tables, indexes, triggers, RLS
├── seed.sql                       # System exercises
└── config.toml
```

---

## What Is NOT Included in MVP 0

- Diet tracking
- Coach dashboards
- Community
- Blog system
- Comments / sharing
- Streak gamification
- Notifications
- Realtime updates
- Rest timer
- Offline / PWA support
- Cardio tracking

Those belong to MVP 1 or 2.

---

## MVP 0 Success Criteria

You know it works if:

- User logs 5+ workouts in a week
- Logging takes < 20 seconds
- Graphs reflect visible progression
- User checks progress page voluntarily

If they don't open the progress page, your UX failed.

---

## Verification Checklist

1. **Auth**: Login with Google → profile created → redirected to dashboard
2. **Plan**: Create a PPL plan → exercises assigned to 6 days → rest day has no entry
3. **Logging**: Start workout → log 3 exercises × 3 sets each → under 60 seconds total
4. **Data isolation**: Create second test user → verify zero data leakage via RLS
5. **Progress**: After 7+ workout logs → volume chart renders → exercise 1RM chart renders
6. **Best lifts**: Profile page shows top 3 by estimated 1RM
7. **Unit toggle**: Switch to lbs in profile → all weight displays convert
8. **Mobile**: Full flow usable on 375px width viewport
9. **Edge cases**: Skip a day → next day shows correct workout. Delete plan → old logs remain.
10. **Timezone**: User in UTC-8 at 11 PM → workout_date is today (not tomorrow)
11. **Unit storage**: Log 100kg → switch to lbs → displays 220.46 lbs → switch back → displays 100 kg (no precision loss)
12. **Double-tap**: Tap "Add Set" rapidly → only one set created
13. **Token expiry**: Wait 1+ hour mid-workout → next set save still works (token refreshed)
14. **Exercise soft-delete**: Delete custom exercise → historical sets still show exercise name → exercise hidden from picker
15. **Network resilience**: Disable network mid-workout → client state preserved → re-enable → sets save on retry
16. **Freestyle workout**: New user with no plan → tap Start Workout → search "Bench Press" → add → log 3 sets → under 30 seconds
17. **Plan pre-load**: User with plan → dashboard shows "Chest Day" → Start Workout → exercises pre-loaded
18. **Day switch**: Dashboard shows "Chest Day" → switch to "Leg Day" → exercises swap → start → workout_logs.day_name = "Leg Day"
19. **Freestyle from plan**: User with plan → switch to "Freestyle" → empty workout with picker → plan_id = NULL
20. **Continue workout**: Start workout → close app → reopen → "Continue Workout" → previous sets visible
21. **Mixed workout**: Start planned "Chest Day" → log sets → add "Bicep Curls" (not in plan) → all sets saved
22. **No-plan lifecycle**: Never create plan → log 10 freestyle workouts → graphs work → best lifts show → level advances
