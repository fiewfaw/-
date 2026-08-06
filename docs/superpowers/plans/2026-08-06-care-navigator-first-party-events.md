# Care Navigator First-party Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collect six anonymous first-party journey events from the Baan Kaiyaphap website and Care Navigator in a protected Supabase marketing project without collecting contact, clinical, or assessment data.

**Architecture:** One dependency-free browser client serves the root website, the Next.js static export, and all seven Team 4 pages. It sends a strict allowlisted batch to one public Supabase Edge Function; the function validates and normalizes the batch before writing explicit columns to an RLS-protected table. The browser never receives a database key, direct table access stays closed, and collector failure never blocks screening, plan generation, or Copy for AI.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, browser JavaScript, Vitest, Node built-in tests, Supabase Postgres, Supabase Edge Functions (Deno), GitHub Pages.

## Global Constraints

- Target only Supabase project `kvldhsvqxnonthmtpukb` (`fiewfaw@gmail.com's Project`).
- Do not inspect, migrate, deploy to, or modify clinical project `ccjoqwgmxbjzctougndh` (`baan-physio-clinical-core`).
- Public browser events are exactly `discovery_entry`, `authority_asset_viewed`, `app_started`, `team4_viewed`, `personal_plan_created`, and `ai_summary_copied`.
- Never send or store names, phone numbers, email addresses, precise locations, diagnoses, symptoms, answers, scores, plan text, chat content, full URLs, query strings, IP addresses, or raw user-agent strings.
- Use a UUID stored in `sessionStorage`; do not create a cross-session visitor identifier.
- Queue at most 50 events, send at most 10 per request, and never block the user journey when collection fails.
- The Edge Function accepts only approved production and localhost origins, JSON bodies no larger than 16 KB, and no unknown fields.
- Enable RLS, create no public table policy, revoke public table/view access, and keep the table out of Realtime.
- Do not add `@supabase/supabase-js` to the public application; the client uses `fetch` only.
- Verify current Supabase changelog and Edge Function documentation immediately before implementation.
- Preserve all unrelated changes in the dirty worktree; stage only files explicitly listed in each task.

---

## File Map

- `care-app/public/js/first-party-events.js`: dependency-free browser/CommonJS event contract, source classification, session queue, retry, and public API.
- `care-app/tests/first-party-events.node.cjs`: deterministic client contract and failure-safety tests.
- `care-app/supabase/functions/_shared/marketing-event-schema.ts`: pure request validation and normalization used by the Edge Function.
- `care-app/supabase/functions/_shared/marketing-event-schema.test.ts`: validator tests runnable by Vitest.
- `care-app/supabase/functions/collect-marketing-events/index.ts`: HTTP/CORS/rate-limit/database boundary.
- `care-app/supabase/migrations/`: contains the `marketing_events` migration whose exact timestamped filename is created and printed by `supabase migration new marketing_events`; the file owns the table, constraints, aggregate views, privileges, indexes, and retention procedure.
- `care-app/src/lib/analytics/trackMarketingEvent.ts`: typed Next.js adapter around `window.CareNavigatorEvents`.
- `care-app/src/lib/analytics/trackMarketingEvent.test.ts`: adapter failure-safety and payload tests.
- `care-app/src/app/layout.tsx`: loads the shared browser client in the static app.
- `care-app/src/app/page.tsx`: records the first Team 1 selection as `app_started`.
- `care-app/src/app/page.test.tsx`: verifies tracking occurs once and navigation remains intact.
- Seven `care-app/public/team4-*-mockup.html` files: record result view, successful plan generation, and successful Copy for AI.
- `care-app/tests/beta-static-routes.check.cjs`: proves all seven plans load and call the shared collector at approved success boundaries.
- `index.html`, `about.html`, `blog/post.html`: record anonymous discovery and authority-asset views.
- `tests/site-first-party-events.check.cjs`: static verification for canonical website instrumentation.
- `docs/marketing/first-party-events-operations.md`: owner runbook for verification, aggregate review, retention, and incident disablement.

---

### Task 1: Shared browser event contract and failure-safe client

**Files:**
- Create: `care-app/public/js/first-party-events.js`
- Create: `care-app/tests/first-party-events.node.cjs`

**Interfaces:**
- Produces `CareNavigatorEvents.track(eventName, dimensions?) -> boolean` and `CareNavigatorEvents.flush() -> Promise<void>`.
- Exports `normalizeEvent`, `classifyDiscovery`, and `createClient` through CommonJS for Node tests.
- `dimensions` may contain only `discovery_source`, `asset_type`, `asset_id`, `entry_variant`, `campaign_id`, `creative_id`, and `app_version`.

- [ ] **Step 1: Write the failing Node contract tests**

Cover these exact cases with `node:assert/strict`: six accepted event names; a seventh event rejected; unknown and forbidden fields rejected; UUID session creation; session reuse; UTM/referrer classification; queue capped at 50 by dropping the oldest event; batches capped at 10; duplicate `event_id` ignored; delivery failure retained without throwing; `Do Not Track` and `care_navigator_analytics_opt_out=1` disabling collection.

```js
assert.equal(normalizeEvent({ event_name: 'app_started' }, context).event_name, 'app_started')
assert.throws(() => normalizeEvent({ event_name: 'app_started', phone: '0812345678' }, context))
assert.equal(classifyDiscovery({ utmSource: 'facebook', referrer: '' }), 'facebook_paid')
assert.equal(classifyDiscovery({ utmSource: '', referrer: 'https://www.google.com/' }), 'google_organic')
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node tests/first-party-events.node.cjs` from `care-app`.

Expected: FAIL because `public/js/first-party-events.js` does not exist.

- [ ] **Step 3: Implement the allowlisted client**

Use the following contract constants and behavior:

```js
const EVENT_NAMES = new Set([
  'discovery_entry',
  'authority_asset_viewed',
  'app_started',
  'team4_viewed',
  'personal_plan_created',
  'ai_summary_copied',
])
const DIMENSION_KEYS = new Set([
  'discovery_source', 'asset_type', 'asset_id', 'entry_variant',
  'campaign_id', 'creative_id', 'app_version',
])
const QUEUE_KEY = 'care_navigator_event_queue_v1'
const SESSION_KEY = 'care_navigator_anonymous_session_v1'
const MAX_QUEUE = 50
const MAX_BATCH = 10
```

`track()` must generate an event UUID, normalize only approved dimensions, persist the bounded queue, schedule a non-blocking flush, and return `false` instead of throwing on storage/network failure. `flush()` must POST `{schema_version: 1, events}` as JSON, use `keepalive: true`, remove only accepted event IDs, and retry at 1, 3, and 10 seconds at most during the page session. Read collector endpoint and app version from the loading script's `data-endpoint` and `data-app-version` attributes.

- [ ] **Step 4: Run the Node test and confirm GREEN**

Run: `node tests/first-party-events.node.cjs`.

Expected: all client contract tests pass and no network request contains a forbidden field.

- [ ] **Step 5: Commit the isolated client deliverable**

```powershell
git add -- care-app/public/js/first-party-events.js care-app/tests/first-party-events.node.cjs
git commit -m "feat: add anonymous first-party event client"
```

---

### Task 2: Database schema, private aggregate views, and retention boundary

**Files:**
- Create through Supabase CLI: the exact timestamped file printed by `npx.cmd supabase migration new marketing_events` inside `care-app/supabase/migrations/`

**Interfaces:**
- Produces `public.marketing_events`, `public.marketing_daily_events`, `public.marketing_source_funnel`, `public.marketing_asset_performance`, and `public.purge_expired_marketing_events(retain_days integer)`.
- Public roles have no direct table, view, or function access.

- [ ] **Step 1: Verify current Supabase commands and create the migration filename through the CLI**

Run from `care-app`:

```powershell
npx.cmd supabase --version
npx.cmd supabase migration --help
npx.cmd supabase migration new marketing_events
```

Record the exact generated path and use that same file for every remaining step in this task. Do not hand-create a timestamped migration filename.

- [ ] **Step 2: Write the schema migration**

The migration must create explicit columns and checks:

```sql
create table public.marketing_events (
  event_id uuid primary key,
  received_at timestamptz not null default now(),
  occurred_at timestamptz not null,
  event_name text not null check (event_name in (
    'discovery_entry','authority_asset_viewed','app_started',
    'team4_viewed','personal_plan_created','ai_summary_copied'
  )),
  anonymous_session_id uuid not null,
  discovery_source text check (discovery_source is null or discovery_source in (
    'google_organic','google_business_profile','facebook_organic','facebook_paid',
    'ai_referral','word_of_mouth','direct','other'
  )),
  asset_type text check (asset_type is null or asset_type in (
    'knowledge_article','credential_story','case_outcome','video',
    'about_profile','care_navigator','service_page','review'
  )),
  asset_id text check (asset_id is null or asset_id ~ '^[a-z0-9][a-z0-9_-]{0,119}$'),
  entry_variant text check (entry_variant is null or entry_variant ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  campaign_id text check (campaign_id is null or campaign_id ~ '^[A-Za-z0-9_-]{1,100}$'),
  creative_id text check (creative_id is null or creative_id ~ '^[A-Za-z0-9_-]{1,100}$'),
  app_version text not null check (app_version ~ '^[A-Za-z0-9._-]{1,40}$'),
  schema_version smallint not null default 1 check (schema_version = 1),
  check (occurred_at between received_at - interval '24 hours' and received_at + interval '5 minutes')
);
alter table public.marketing_events enable row level security;
revoke all on public.marketing_events from public, anon, authenticated;
```

Add indexes on `received_at`, `(event_name, received_at)`, `(discovery_source, received_at)`, and `(asset_type, asset_id, received_at)`. Create the three aggregate views with `WITH (security_invoker = true)`, then revoke all view privileges from `public`, `anon`, and `authenticated`. Create `purge_expired_marketing_events(retain_days integer default 180)` as `SECURITY INVOKER`, require `retain_days between 30 and 730`, and revoke execute from public roles. Do not create public policies or add the table to Realtime.

- [ ] **Step 3: Apply only to the approved marketing project**

Before applying, list projects and assert target ref equals `kvldhsvqxnonthmtpukb`. Apply the reviewed SQL with the Supabase migration tool to that ref only. Stop if the displayed project name or ref differs.

- [ ] **Step 4: Verify access and constraints**

Run owner SQL that inserts one synthetic row, retries the same `event_id` with `on conflict do nothing`, attempts an invalid event name inside a rolled-back transaction, queries each aggregate view, and deletes the synthetic row. Verify `pg_policies` returns zero policies for the table and `has_table_privilege('anon', 'public.marketing_events', 'SELECT,INSERT')` plus the authenticated equivalent both return false.

- [ ] **Step 5: Run Supabase security and performance advisors**

Run both advisor types for `kvldhsvqxnonthmtpukb`. Fix any issue caused by this migration, then rerun until this schema introduces no unresolved error-level finding.

- [ ] **Step 6: Commit the generated migration only**

```powershell
git add -- care-app/supabase/migrations/*_marketing_events.sql
git commit -m "feat: add protected marketing event schema"
```

---

### Task 3: Edge Function validation and protected insert boundary

**Files:**
- Create: `care-app/supabase/functions/_shared/marketing-event-schema.ts`
- Create: `care-app/supabase/functions/_shared/marketing-event-schema.test.ts`
- Create: `care-app/supabase/functions/collect-marketing-events/index.ts`

**Interfaces:**
- Produces `validateMarketingBatch(value, receivedAt) -> { ok: true; rows } | { ok: false; status; code }`.
- Public endpoint accepts `POST`/`OPTIONS` and returns `{ accepted: number, duplicate: number, rejected: number }` without echoing input.

- [ ] **Step 1: Write failing validator tests**

Test exact allowed payload, 0 and 11 event batches, unknown fields, every forbidden-key family, invalid UUID/timestamp/enums/slugs, client times outside `receivedAt - 24h` to `receivedAt + 5m`, and normalization of omitted optional dimensions to `null`.

```ts
expect(validateMarketingBatch(validBatch, now)).toMatchObject({ ok: true })
expect(validateMarketingBatch({ ...validBatch, phone: '0812345678' }, now)).toEqual({
  ok: false,
  status: 400,
  code: 'unknown_field',
})
```

- [ ] **Step 2: Run validator tests and confirm RED**

Run: `npm.cmd exec -- vitest run supabase/functions/_shared/marketing-event-schema.test.ts --reporter=verbose`.

Expected: FAIL because the validator does not exist.

- [ ] **Step 3: Implement the pure validator**

Use closed object-key sets at the envelope and event levels. Reject keys matching `name`, `phone`, `email`, `diagnosis`, `symptom`, `answer`, `score`, `plan`, `message`, `url`, `coordinate`, `latitude`, `longitude`, or `location`, case-insensitively. Validate all strings before producing database rows; do not retain the input object.

- [ ] **Step 4: Implement the HTTP handler**

The handler must:

1. Permit `https://baankaiyaphap-chonburi.com`, `http://127.0.0.1:3000` through `http://127.0.0.1:3999`, and equivalent `localhost` ports only.
2. Return `204` for allowed `OPTIONS`; reject other methods with `405`.
3. Require `application/json`, numeric `content-length <= 16384` when present, and also reject decoded text above 16 KB.
4. Validate before initializing the database insert payload.
5. Count rows for the session in the preceding hour and return `429` if the request would exceed 120 events.
6. Use server-side `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; never return either value.
7. Insert with `onConflict: 'event_id'` and `ignoreDuplicates: true`.
8. Log only request ID, status, counts, and error code; never log request bodies or dimensions.
9. Return `503` on database failure so the browser retains its queue.

- [ ] **Step 5: Run validator tests and a local HTTP smoke test**

Run the focused Vitest file, then serve the function locally and invoke valid, duplicate, forbidden-field, oversized, disallowed-origin, and wrong-method requests. Confirm no response echoes event data.

- [ ] **Step 6: Deploy only to the approved project**

Deploy `collect-marketing-events` to `kvldhsvqxnonthmtpukb` with JWT verification disabled for this function only. Invoke the deployed endpoint with one synthetic event, replay it, reject a `phone` field, reject a disallowed origin, and remove the synthetic database row after verification.

- [ ] **Step 7: Commit the function and validator**

```powershell
git add -- care-app/supabase/functions/_shared/marketing-event-schema.ts care-app/supabase/functions/_shared/marketing-event-schema.test.ts care-app/supabase/functions/collect-marketing-events/index.ts
git commit -m "feat: add validated marketing event collector"
```

---

### Task 4: Next.js app entry instrumentation

**Files:**
- Create: `care-app/src/lib/analytics/trackMarketingEvent.ts`
- Create: `care-app/src/lib/analytics/trackMarketingEvent.test.ts`
- Modify: `care-app/src/app/layout.tsx`
- Modify: `care-app/src/app/page.tsx`
- Modify: `care-app/src/app/page.test.tsx`

**Interfaces:**
- Consumes `window.CareNavigatorEvents.track` from Task 1.
- Produces `trackMarketingEvent(name, dimensions?) -> boolean` and `trackMarketingEventOnce(key, name, dimensions?) -> boolean`.
- The layout loads the shared script using the configured base path and deployed Edge Function endpoint.

- [ ] **Step 1: Write failing adapter and landing-page tests**

Test absent global returns `false`, a throwing global returns `false`, valid calls are forwarded unchanged, and `trackMarketingEventOnce` marks only `sessionStorage`. Update the landing test so two clicks in one session produce one `app_started` call while the selected goal and `/problems` navigation remain unchanged.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `npm.cmd exec -- vitest run src/lib/analytics/trackMarketingEvent.test.ts src/app/page.test.tsx --reporter=verbose`.

- [ ] **Step 3: Implement the typed adapter and script loading**

Declare the six-event union and approved dimension interface. Catch all errors. In `layout.tsx`, load `/care-navigator/js/first-party-events.js` through the existing base-path helper with `defer`, `data-endpoint` set to the deployed function URL, and `data-app-version="beta-analytics-1"`.

- [ ] **Step 4: Instrument first Team 1 selection**

In the existing `choose(goalId)` handler, call:

```ts
trackMarketingEventOnce('app_started', 'app_started', {
  entry_variant: 'care_navigator_home',
  app_version: 'beta-analytics-1',
})
```

Do not send `goalId`; it describes the user's health intent and is outside the public analytics contract. Navigation must run whether tracking returns true or false.

- [ ] **Step 5: Run focused and full app tests**

Run the focused files, then `npm.cmd test -- --reporter=verbose` with existing single-worker Vitest settings.

- [ ] **Step 6: Commit only the adapter and app instrumentation**

```powershell
git add -- care-app/src/lib/analytics/trackMarketingEvent.ts care-app/src/lib/analytics/trackMarketingEvent.test.ts care-app/src/app/layout.tsx care-app/src/app/page.tsx care-app/src/app/page.test.tsx
git commit -m "feat: track anonymous Care Navigator starts"
```

---

### Task 5: Instrument all seven Team 4 result pages

**Files:**
- Modify: `care-app/public/team4-walk-confidence-mockup.html`
- Modify: `care-app/public/team4-return-strength-mockup.html`
- Modify: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Modify: `care-app/public/team4-hip-recovery-mockup.html`
- Modify: `care-app/public/team4-knee-recovery-mockup.html`
- Modify: `care-app/public/team4-parkinson-mobility-mockup.html`
- Modify: `care-app/public/team4-bedbound-transfer-mockup.html`
- Modify: `care-app/tests/beta-static-routes.check.cjs`

**Interfaces:**
- Consumes `CareNavigatorEvents.track` from Task 1.
- Each page emits `team4_viewed` once, `personal_plan_created` only after a plan is visibly rendered, and `ai_summary_copied` only after `navigator.clipboard.writeText` resolves.

- [ ] **Step 1: Extend the static route test and confirm RED**

Require every page to load `js/first-party-events.js` with the deployed endpoint and app version. Require literal calls for all three Team 4 events. Reject calls containing plan IDs, answers, scores, names, phone values, locations, or generated summary text.

- [ ] **Step 2: Add page-view tracking**

After loading the shared script on each page, call:

```js
CareNavigatorEvents.track('team4_viewed', {
  asset_type: 'care_navigator',
  entry_variant: 'team4_result',
  app_version: 'beta-analytics-1'
})
```

Do not send which plan was selected.

- [ ] **Step 3: Add successful plan-generation tracking**

Place `personal_plan_created` immediately after each page's existing render function successfully reveals the personalized plan. Do not fire on validation failure or button click alone.

- [ ] **Step 4: Add successful Copy for AI tracking**

Place `ai_summary_copied` after the awaited clipboard write succeeds. Do not fire in the rejection branch or include clipboard text.

- [ ] **Step 5: Run static and browser smoke checks**

Run `npm.cmd run test:beta:static`. Open every plan, generate a plan with valid synthetic form data, and use a mocked collector to confirm event names without inspecting or sending form values.

- [ ] **Step 6: Commit the seven-page instrumentation**

```powershell
git add -- care-app/public/team4-*-mockup.html care-app/tests/beta-static-routes.check.cjs
git commit -m "feat: track anonymous Team 4 completion events"
```

---

### Task 6: Instrument website discovery and authority assets

**Files:**
- Modify: `index.html`
- Modify: `about.html`
- Modify: `blog/post.html`
- Create: `tests/site-first-party-events.check.cjs`

**Interfaces:**
- Consumes `/care-navigator/js/first-party-events.js` from Task 1.
- Homepage emits `discovery_entry`; About emits `discovery_entry` and `authority_asset_viewed/about_profile`; valid article detail emits `discovery_entry` and `authority_asset_viewed/knowledge_article` with only the controlled slug.

- [ ] **Step 1: Write the failing static website check**

Verify all three pages load the canonical Care Navigator script from `/care-navigator/js/first-party-events.js`, use the deployed endpoint, and contain only approved events/dimensions. Require article tracking to occur after `applyArticleMetadata(meta, slug)` receives a valid article and to send `asset_id: slug`, not `location.href` or `location.search`.

- [ ] **Step 2: Run the check and confirm RED**

Run: `node tests/site-first-party-events.check.cjs`.

- [ ] **Step 3: Instrument canonical pages**

Use `classifyDiscovery` for `discovery_source`. Map UTM values only to the eight approved source categories. Read `utm_campaign` and `utm_content` only when they match `^[A-Za-z0-9_-]{1,100}$`; otherwise send `null`. Emit authority views once per session per controlled asset ID.

- [ ] **Step 4: Verify canonical and fallback behavior**

Run the static check. Load homepage, About, one valid article slug, and one invalid slug with a local mocked endpoint. Confirm valid pages emit expected events and an invalid article emits no authority view.

- [ ] **Step 5: Commit website instrumentation**

```powershell
git add -- index.html about.html blog/post.html tests/site-first-party-events.check.cjs
git commit -m "feat: track anonymous website authority journeys"
```

---

### Task 7: Owner operations, aggregate QA, and privacy audit

**Files:**
- Create: `docs/marketing/first-party-events-operations.md`

**Interfaces:**
- Produces exact owner procedures for health checks, aggregate review, 180-day purge, disabling collection, and validating that forbidden data never enters storage.

- [ ] **Step 1: Write the operations guide**

Include exact SQL for daily counts, source funnel, authority assets, Care Navigator completion, duplicate event IDs, unexpected enum values, and raw-data expiry. Include the monthly owner command:

```sql
select public.purge_expired_marketing_events(180);
```

Include an emergency disable action that removes or blanks `data-endpoint` in the public script tags; the app remains usable and queued events remain session-bounded. State that raw event rows are not exported to advertising platforms and are never joined to phone numbers or clinical records.

- [ ] **Step 2: Run a forbidden-data audit**

Query `information_schema.columns` and sampled synthetic rows to prove the table has no contact/health/free-text column. Search function logs for the synthetic UUID and confirm logs contain request/count metadata but not event dimensions or payload bodies.

- [ ] **Step 3: Commit the runbook**

```powershell
git add -- docs/marketing/first-party-events-operations.md
git commit -m "docs: add first-party events operations guide"
```

---

### Task 8: Full verification, narrow publication, and live journey

**Files:**
- Update generated deployment bundle: `care-navigator/`
- Publish only files proven by the final diff allowlist.

**Interfaces:**
- Produces a live anonymous event journey at `https://baankaiyaphap-chonburi.com/` and `https://baankaiyaphap-chonburi.com/care-navigator/` while preserving all app functions.

- [ ] **Step 1: Run all local verification gates**

```powershell
node tests/first-party-events.node.cjs
node tests/site-first-party-events.check.cjs
npm.cmd run test:beta:static
npm.cmd test -- --reporter=verbose
$env:NEXT_PUBLIC_BASE_PATH='/care-navigator'; npm.cmd run build
```

Expected: every command exits 0, the full suite uses the repository's single-worker configuration, and the static export includes `js/first-party-events.js` plus all seven instrumented Team 4 pages.

- [ ] **Step 2: Verify collector-outage behavior**

Point the script at an unreachable localhost endpoint. Complete Team 1 through Team 4, generate a personalized plan, and Copy for AI. Confirm all user actions still succeed, no error banner appears, and the queue never exceeds 50 events.

- [ ] **Step 3: Re-run Supabase security gates**

Confirm direct anonymous/authenticated SELECT and INSERT remain denied, valid function invocation writes one row, duplicate invocation writes no second row, forbidden and disallowed-origin requests write zero rows, and security/performance advisors introduce no unresolved error from this feature.

- [ ] **Step 4: Prepare the narrow publication allowlist**

Compare the static export against the clean deployment checkout. Include only the shared client, updated Next static files required by the build, seven Team 4 files, canonical website pages, and build manifests/assets actually changed by this feature. Exclude workspace documents, tests, Supabase source, local review pages, unrelated media, and all user changes outside the allowlist.

- [ ] **Step 5: Publish and verify public HTTP responses**

Publish with the existing GitHub Pages workflow. Confirm homepage, Care Navigator entry, all seven Team 4 pages, and `/care-navigator/js/first-party-events.js` return HTTP 200 from the public domain.

- [ ] **Step 6: Run one synthetic end-to-end public journey**

Use one new session and proceed website entry -> Care Navigator start -> Team 4 result -> personalized plan -> Copy for AI. Query by the synthetic session UUID and confirm the expected ordered events appear exactly once, contain only allowlisted dimensions, and contain no form or clinical data. Delete the synthetic rows after verification.

- [ ] **Step 7: Record release evidence and final commit**

Add the tested commit hash, public URLs, test counts, advisor status, event counts, and synthetic-row deletion confirmation to the operations guide. Stage only the guide and explicit deployment changes, then commit with:

```powershell
git commit -m "chore: publish Care Navigator first-party measurement"
```
