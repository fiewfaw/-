# Care Navigator Lead Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a consent-based, temporary Lead Registry that gives every personalized Team 4 plan an opaque reference code usable by external AI and privately resolvable by the official LINE OA chatbot.

**Architecture:** Keep the existing anonymous Google Sheets event collector unchanged. Add a separate owner-only Lead Spreadsheet managed by a dedicated Apps Script storage service; expose it only through a small Node 20 gateway on the Contabo VPS. A shared browser client connects all seven static Team 4 pages, retains only opaque recovery data in the browser, preserves the existing service/pricing page, and opens LINE OA with a prefilled lead-code message that the user sends once.

**Tech Stack:** Static HTML/JavaScript, Node.js 20 built-ins, Google Apps Script, Google Sheets, LINE Messaging API, Node test runner, existing Care Navigator static tests, Docker Compose, Nginx/TLS.

## Global Constraints

- Preserve all approved Team 4 layouts, clinical rules, exercise content, and existing service/pricing copy.
- Keep `Care Navigator - Marketing Events` and its six-event Apps Script receiver unchanged and anonymous.
- Create a different owner-only spreadsheet named `Care Navigator - Pending Leads`.
- Do not write to `baan-physio-clinical-core`.
- Never put names, phone numbers, precise locations, plan text, recovery tokens, or raw chat messages in URLs, analytics events, browser logs, server logs, or LINE lookup audit rows.
- Public clients may create and recover only their own pending plan with a matching recovery token; lead code alone is never a public read credential.
- Copy for AI contains the plan and opaque lead code, but no contact data or recovery token.
- Pending leads expire after 14 days; confirmed/contacted leads after 90 days; converted or closed lead data follows the approved 30-day purge rules.
- Lead-system failure must never block access to the locally generated personalized plan.
- Use synthetic lead data until expiry, deletion, LINE signature verification, masked confirmation, and owner notification pass end to end.
- Do not print Google, LINE, VPS, or owner notification secrets in commands, test output, commits, or chat.

---

### Task 1: Shared Lead Contract And Review Page

**Files:**
- Create: `care-app/public/js/lead-registry-contract.js`
- Create: `care-app/tests/lead-registry-contract.node.cjs`
- Create: `care-app/lead-registry-review.html`

**Interfaces:**
- Produces `CareNavigatorLeadContract.normalizeCreateInput(value)`.
- Produces `CareNavigatorLeadContract.validateCreateInput(value)` returning `{ ok, value?, error? }`.
- Produces `CareNavigatorLeadContract.wrapAiSummary({ leadCode, planSummary })`.
- Defines the seven exact plan IDs in `CareNavigatorLeadContract.PLAN_TYPES`.

- [ ] **Step 1: Write the failing contract tests**

Test these exact plan IDs:

```js
const PLAN_TYPES = [
  'walk-confidence',
  'return-strength',
  'stroke-arm-leg',
  'hip-recovery',
  'knee-recovery',
  'parkinson-mobility',
  'bedbound-transfer',
]
```

Assert that normalization strips non-digits from phone numbers, caps them at 10 digits, trims names/areas, rejects unknown keys, rejects coordinate/Maps URL fields, caps `plan_summary` at 12 KB UTF-8, and builds the approved `CARE NAVIGATOR PLAN V1` envelope without contact fields.

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```powershell
node care-app/tests/lead-registry-contract.node.cjs
```

Expected: failure because `lead-registry-contract.js` does not exist.

- [ ] **Step 3: Implement the dependency-free contract module**

Use a UMD wrapper matching `lead-phone-validation.js`. The accepted create keys are exactly:

```js
[
  'schema_version', 'request_id', 'contact_name', 'phone', 'service_area',
  'plan_type', 'plan_summary', 'consent_version', 'consented_at', 'app_version',
]
```

Use consent version `lead-temp-v1`, schema version `1`, and a 12 KB UTF-8 limit measured with `TextEncoder` in browsers and `Buffer.byteLength` in Node.

- [ ] **Step 4: Build the text-first review page**

Show four tables: public create fields, server-generated fields, Sheet columns, and lifecycle transitions. Include one external-AI copy example and one LINE bot confirmation example. Do not include a form that sends data.

- [ ] **Step 5: Run the focused test and verify GREEN**

```powershell
node care-app/tests/lead-registry-contract.node.cjs
```

Expected: `PASS lead registry contract`.

- [ ] **Step 6: Commit the contract slice**

```powershell
git add -- care-app/public/js/lead-registry-contract.js care-app/tests/lead-registry-contract.node.cjs care-app/lead-registry-review.html
git commit -m "feat: define Care Navigator lead contract"
```

### Task 2: Private Google Sheets Lead Storage

**Files:**
- Create: `care-app/apps-script/lead-registry/Code.gs`
- Create: `care-app/apps-script/lead-registry/appsscript.json`
- Create: `care-app/apps-script/lead-registry/README.md`
- Create: `care-app/tests/google-sheets-lead-registry.node.cjs`

**Interfaces:**
- Consumes server-only envelopes `{ action, gateway_secret, request_id, payload }`.
- Produces counts/minimal result JSON; never echoes full rows.
- Storage actions: `createLead`, `recoverPlan`, `lookupLead`, `confirmLead`, `updateLeadStatus`, `expireLeads`.

- [ ] **Step 1: Write failing storage tests**

Cover workbook headers, strict actions, shared-secret rejection, idempotent create, random code shape, collision retry, recovery-token hash matching, masked lookup response, valid status transitions, append-only history, lookup audit result codes, and 14/90/30-day expiry behavior.

Use these exact `Leads` headers:

```js
[
  'lead_id', 'lead_code', 'created_at', 'expires_at', 'status',
  'contact_name', 'phone', 'service_area', 'plan_type', 'plan_summary',
  'consent_version', 'consented_at', 'app_version', 'source',
  'confirmed_at', 'contacted_at', 'resume_token_hash', 'request_id',
]
```

- [ ] **Step 2: Run the storage test and verify RED**

```powershell
node care-app/tests/google-sheets-lead-registry.node.cjs
```

Expected: failure because the Lead Registry Apps Script does not exist.

- [ ] **Step 3: Implement pure validation and state functions first**

Export pure functions under `module.exports` for Node tests while keeping Apps Script globals. Generate lead codes from the alphabet `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` with 16 random characters grouped as `CN-XXXX-XXXX-XXXX-XXXX`. Hash recovery tokens with SHA-256 before storage.

- [ ] **Step 4: Implement owner workbook setup**

Read `LEAD_SPREADSHEET_ID` and `LEAD_GATEWAY_SECRET` from Apps Script Properties. `setupWorkbook()` creates `Leads`, `Status History`, `Lookup Audit`, and `Data Dictionary`, freezes row 1, applies filters, and never shares the spreadsheet.

- [ ] **Step 5: Implement locked create/recover/lookup/update operations**

Use `LockService.getScriptLock()`. Check duplicate `request_id` before insertion. `recoverPlan` returns only `lead_code`, `plan_type`, `plan_summary`, and `expires_at`. `lookupLead` returns masked contact plus plan information only after gateway-secret validation. No action returns the recovery-token hash.

- [ ] **Step 6: Implement daily expiry**

`installDailyExpiryTrigger()` creates one daily trigger for `expireLeads`. Purge contact and plan cells according to lifecycle rules while retaining status/timestamps. Do not delete anonymous marketing data because it is in a different spreadsheet.

- [ ] **Step 7: Run tests and verify GREEN**

```powershell
node care-app/tests/google-sheets-lead-registry.node.cjs
```

Expected: `PASS Google Sheets lead registry`.

- [ ] **Step 8: Commit the storage slice**

```powershell
git add -- care-app/apps-script/lead-registry care-app/tests/google-sheets-lead-registry.node.cjs
git commit -m "feat: add private Sheets lead storage"
```

### Task 3: VPS Lead Gateway Core

**Files:**
- Create: `care-app/services/lead-gateway/package.json`
- Create: `care-app/services/lead-gateway/src/contracts.mjs`
- Create: `care-app/services/lead-gateway/src/storage-client.mjs`
- Create: `care-app/services/lead-gateway/src/server.mjs`
- Create: `care-app/services/lead-gateway/test/gateway.test.mjs`
- Create: `care-app/services/lead-gateway/Dockerfile`
- Create: `care-app/services/lead-gateway/compose.yaml`
- Create: `care-app/services/lead-gateway/.env.example`

**Interfaces:**
- `POST /v1/leads` creates or idempotently returns a pending lead.
- `POST /v1/leads/recover` recovers only plan text with matching lead code and recovery token.
- `GET /healthz` returns `{ "ok": true }` without dependency details.
- `postStorageAction(action, payload)` sends a server-authenticated form POST to the dedicated Apps Script deployment.

- [ ] **Step 1: Write gateway tests with a fake storage client**

Test exact production origin `https://baankaiyaphap-chonburi.com`, approved localhost origins, JSON-only POSTs, 16 KB request cap, closed schema, rate cap, idempotent request IDs, counts/minimal responses, unavailable-storage `503`, and absence of contact values in logs.

- [ ] **Step 2: Run tests and verify RED**

```powershell
node --test care-app/services/lead-gateway/test/gateway.test.mjs
```

Expected: module-not-found failure.

- [ ] **Step 3: Implement contracts and storage client**

Use Node 20 built-ins only. Read `LEAD_STORAGE_URL` and `LEAD_STORAGE_SECRET` from environment. Send `application/x-www-form-urlencoded` with one `payload` field so the Apps Script receiver can parse it consistently.

- [ ] **Step 4: Implement HTTP server boundaries**

Accept `OPTIONS` and the documented methods only. Add exact CORS, bounded body reading before JSON parse, request-ID logs with result codes only, a coarse in-memory rate cap, and no body logging. Generate a 32-byte URL-safe recovery token server-side and return it only on successful create.

- [ ] **Step 5: Add container configuration**

Run as a non-root Node user, expose only port `8787` inside the Compose network, set `restart: unless-stopped`, mount no host secrets, and load `/docker/care-navigator-leads/.env` through Compose.

- [ ] **Step 6: Run gateway tests and verify GREEN**

```powershell
node --test care-app/services/lead-gateway/test/gateway.test.mjs
```

- [ ] **Step 7: Commit the gateway core**

```powershell
git add -- care-app/services/lead-gateway
git commit -m "feat: add Care Navigator lead gateway"
```

### Task 4: Shared Browser Lead Client

**Files:**
- Create: `care-app/public/js/lead-registry-config.js`
- Create: `care-app/public/js/lead-registry-client.js`
- Create: `care-app/tests/lead-registry-client.node.cjs`

**Interfaces:**
- `CareNavigatorLeads.createLead(payload)`.
- `CareNavigatorLeads.getActiveLead()`.
- `CareNavigatorLeads.recoverPlan()`.
- `CareNavigatorLeads.copyForAi(planSummary)`.
- `CareNavigatorLeads.markConsultIntent()`.
- Stores only `{ leadCode, recoveryToken, expiresAt, planType, planPath }` under `care_navigator_lead_v1`.

- [ ] **Step 1: Write failing browser-client tests**

Cover create success, create retry, storage outage, exact local-storage keys, no contact/plan persistence, expiry cleanup, same-browser recovery, shared AI envelope, clipboard denial, and consult intent. Assert that names, phone, area, summary, and precise location never appear in browser storage.

- [ ] **Step 2: Run tests and verify RED**

```powershell
node care-app/tests/lead-registry-client.node.cjs
```

- [ ] **Step 3: Implement the browser client**

Read the endpoint only from `window.CARE_NAVIGATOR_LEAD_CONFIG.endpoint`. Use `crypto.randomUUID()` for `request_id`. Keep the personalized plan visible when create fails. `copyForAi()` recovers the summary when necessary, wraps it through the shared contract, and writes it to the clipboard.

- [ ] **Step 4: Run tests and verify GREEN**

```powershell
node care-app/tests/lead-registry-client.node.cjs
```

- [ ] **Step 5: Commit the browser client**

```powershell
git add -- care-app/public/js/lead-registry-config.js care-app/public/js/lead-registry-client.js care-app/tests/lead-registry-client.node.cjs
git commit -m "feat: add shared Team 4 lead client"
```

### Task 5: Connect All Seven Team 4 Plans

**Files:**
- Modify: `care-app/public/team4-walk-confidence-mockup.html`
- Modify: `care-app/public/team4-return-strength-mockup.html`
- Modify: `care-app/public/team4-stroke-arm-leg-mockup.html`
- Modify: `care-app/public/team4-hip-recovery-mockup.html`
- Modify: `care-app/public/team4-knee-recovery-mockup.html`
- Modify: `care-app/public/team4-parkinson-mobility-mockup.html`
- Modify: `care-app/public/team4-bedbound-transfer-mockup.html`
- Create: `care-app/tests/team4-lead-registry-integration.node.cjs`

**Interfaces:**
- Each page provides `{ planType, contactName, phone, serviceArea, planSummary }` to `CareNavigatorLeads.createLead()`.
- Each existing Copy for AI button calls `CareNavigatorLeads.copyForAi(planSummary)`.
- Each consultation control calls `CareNavigatorLeads.markConsultIntent()` before navigating to the unchanged `https://baankaiyaphap-chonburi.com/#packages` destination.

- [ ] **Step 1: Write the failing seven-page static integration test**

For every page, assert the shared contract/config/client scripts load in order, the approved plan ID is declared, contact is not interpolated into AI text, consultation destination remains `#packages`, and existing phone/location helpers remain loaded.

- [ ] **Step 2: Run integration test and verify RED**

```powershell
node care-app/tests/team4-lead-registry-integration.node.cjs
```

- [ ] **Step 3: Add compact temporary-storage consent copy**

Place the approved 14-day notice inside each existing lead form near the create-plan action. Do not add a modal, new card, email field, or new visual section. Disable submission until name, exact 10-digit phone, existing required assessments, and the existing area/location rule are valid.

- [ ] **Step 4: Create one pending lead per personalized plan**

After the local plan is built, derive the page's existing AI summary, call `createLead`, and retain the returned context. If the gateway fails, show a compact retry notice while leaving the personalized plan usable.

- [ ] **Step 5: Replace seven direct clipboard calls with the shared wrapper**

Preserve each page's current quantitative assessment, FITT, warnings, and article links. Add only the common envelope and lead code. Never add name, phone, location, or recovery token.

- [ ] **Step 6: Preserve consultation behavior**

Before the existing navigation, store consult intent and active lead context. Do not change button text, visual hierarchy, or the package anchor.

- [ ] **Step 7: Run focused and existing Team 4 tests**

```powershell
node care-app/tests/team4-lead-registry-integration.node.cjs
node care-app/tests/beta-static-routes.check.cjs
node care-app/tests/team4-event-instrumentation.node.cjs
node care-app/tests/lead-phone-validation.node.cjs
```

Expected: all pass; anonymous event instrumentation still contains no lead fields.

- [ ] **Step 8: Commit Team 4 integration**

```powershell
git add -- care-app/public/team4-*-mockup.html care-app/tests/team4-lead-registry-integration.node.cjs
git commit -m "feat: connect Team 4 plans to lead registry"
```

### Task 6: Preserve Lead Context Through Existing Service Page

**Files:**
- Create: `js/lead-line-handoff.js`
- Create: `tests/lead-line-handoff.node.cjs`
- Modify: `index.html`

**Interfaces:**
- Reads opaque active-lead context only from `care_navigator_lead_v1`.
- Rewrites only the existing primary LINE package CTA when an unexpired lead exists.
- Uses official account ID `@110phzex` and the HTTPS `oaMessage` URL scheme.

- [ ] **Step 1: Write failing handoff tests**

Assert no-lead behavior leaves the current LINE URL unchanged; active-lead behavior produces:

```text
https://line.me/R/oaMessage/%40110phzex/?{percent-encoded Thai message and lead code}
```

Assert URL text contains only the short consultation sentence and lead code, never plan/contact data.

- [ ] **Step 2: Run test and verify RED**

```powershell
node tests/lead-line-handoff.node.cjs
```

- [ ] **Step 3: Implement the handoff helper**

On page load and `hashchange`, find the existing package LINE CTA. When valid consult intent exists, set its `href` to the official `oaMessage` URL with:

```text
ต้องการปรึกษาจากแผน Care Navigator
รหัสอ้างอิง: {leadCode}
```

Do not change banner, package text, price, button label, or layout.

- [ ] **Step 4: Load the helper on the existing homepage**

Add one script tag near existing shared scripts. Do not add visible UI.

- [ ] **Step 5: Run test and static website checks**

```powershell
node tests/lead-line-handoff.node.cjs
node care-app/tests/website-event-instrumentation.node.cjs
```

- [ ] **Step 6: Commit service-page handoff**

```powershell
git add -- js/lead-line-handoff.js tests/lead-line-handoff.node.cjs index.html
git commit -m "feat: carry Care Navigator lead into LINE"
```

### Task 7: LINE OA Chatbot Lead Resolution

**Files:**
- Create: `care-app/services/lead-gateway/src/line-signature.mjs`
- Create: `care-app/services/lead-gateway/src/line-client.mjs`
- Create: `care-app/services/lead-gateway/src/line-flow.mjs`
- Create: `care-app/services/lead-gateway/test/line-flow.test.mjs`
- Modify: `care-app/services/lead-gateway/src/server.mjs`
- Modify: `care-app/services/lead-gateway/.env.example`

**Interfaces:**
- `POST /v1/line/webhook` verifies `x-line-signature` against the raw body.
- `extractLeadCode(text)` accepts only the approved `CN-XXXX-XXXX-XXXX-XXXX` shape.
- `handleLineEvent(event, deps)` returns reply messages and storage actions.

- [ ] **Step 1: Write signature and flow tests**

Cover valid/invalid signatures, redelivered webhook IDs, valid/invalid/expired codes, masked confirmation, confirm/refuse/correct actions, ordinary FAQ fallback, emergency keyword priority, and no full contact in replies before confirmation.

- [ ] **Step 2: Run tests and verify RED**

```powershell
node --test care-app/services/lead-gateway/test/line-flow.test.mjs
```

- [ ] **Step 3: Implement raw-body signature verification**

Compute Base64 HMAC-SHA256 with `LINE_CHANNEL_SECRET` and compare through `crypto.timingSafeEqual`. Parse JSON only after verification succeeds.

- [ ] **Step 4: Implement lead-code lookup and masked confirmation**

Resolve through the storage client and reply with masked name, masked phone, and plan title. Use quick-reply/postback actions for `confirm`, `correct`, and `cancel`, carrying only an opaque lead action token.

- [ ] **Step 5: Implement confirmation and owner notification**

On confirmation, append the `confirmed` transition idempotently and push an owner-only summary through the Messaging API using `OWNER_LINE_USER_ID`. Include lead code, full contact, plan title, and callback request; do not include raw assessment answers or full chat history.

- [ ] **Step 6: Implement fallback and safety priority**

Messages without a lead code return a deterministic fallback that links to Care Navigator and offers the existing service-information path. Broader FAQ intent classification is outside this Lead Registry plan. Emergency phrases return the safety message before any lead or sales reply.

- [ ] **Step 7: Run all gateway tests**

```powershell
node --test care-app/services/lead-gateway/test/*.test.mjs
```

- [ ] **Step 8: Commit LINE flow**

```powershell
git add -- care-app/services/lead-gateway
git commit -m "feat: resolve Care Navigator leads in LINE"
```

### Task 8: Operations, Expiry, And Incident Controls

**Files:**
- Create: `docs/marketing/care-navigator-lead-registry-operations.md`
- Create: `care-app/services/lead-gateway/scripts/smoke.mjs`
- Modify: `care-app/apps-script/lead-registry/README.md`
- Modify: `care-app/services/lead-gateway/compose.yaml`

**Interfaces:**
- Documents setup, backup, purge, revoke, rotate, disable, and restore procedures.
- `smoke.mjs` creates and exercises synthetic leads only.

- [ ] **Step 1: Document exact owner operations**

Include Sheet ownership verification, Apps Script property setup, daily expiry trigger, monthly `.xlsx` backup, manual delete by lead code, gateway disablement, LINE webhook disablement, secret rotation, and evidence that the anonymous workbook remains separate.

- [ ] **Step 2: Implement synthetic smoke script**

The script creates a synthetic lead, recovers it with the matching token, verifies wrong-token rejection, checks masked lookup through a test-only authenticated route disabled in production, and deletes the synthetic lead.

- [ ] **Step 3: Add container health check and bounded logs**

Use `/healthz`, Docker JSON log rotation `10m` x `3`, and no request bodies in logs.

- [ ] **Step 4: Verify documentation and smoke syntax**

```powershell
node --check care-app/services/lead-gateway/scripts/smoke.mjs
rg -n "name|phone|plan_summary|LINE_CHANNEL_SECRET|LEAD_STORAGE_SECRET" docs/marketing/care-navigator-lead-registry-operations.md
```

Expected: documentation names fields and environment variables but contains no actual secret or real patient value.

- [ ] **Step 5: Commit operations slice**

```powershell
git add -- docs/marketing/care-navigator-lead-registry-operations.md care-app/apps-script/lead-registry/README.md care-app/services/lead-gateway
git commit -m "docs: add lead registry operations"
```

### Task 9: Local And Synthetic Release Verification

**Files:**
- Modify only if a verification defect is found in files from Tasks 1-8.

**Interfaces:**
- Produces a release evidence note with test counts, synthetic IDs, public boundary checks, and unresolved external setup items.

- [ ] **Step 1: Run all focused Node checks**

```powershell
node care-app/tests/lead-registry-contract.node.cjs
node care-app/tests/google-sheets-lead-registry.node.cjs
node care-app/tests/lead-registry-client.node.cjs
node care-app/tests/team4-lead-registry-integration.node.cjs
node tests/lead-line-handoff.node.cjs
node --test care-app/services/lead-gateway/test/*.test.mjs
```

- [ ] **Step 2: Run existing regression tests**

```powershell
Set-Location care-app
npm.cmd test
npm.cmd run test:beta:static
npm.cmd run build
```

- [ ] **Step 3: Verify privacy boundaries statically**

Confirm the anonymous Apps Script still rejects lead fields, public JavaScript contains no Google/LINE/server secrets, copied AI envelopes contain no contact data, browser storage contains no contact/plan text, and service-page URLs contain no PII.

- [ ] **Step 4: Build and test the gateway container locally**

```powershell
docker compose -f care-app/services/lead-gateway/compose.yaml config
docker build -t care-navigator-lead-gateway:test care-app/services/lead-gateway
```

- [ ] **Step 5: Create and inspect the owner workbook using synthetic data**

Create a distinct private spreadsheet, run `setupWorkbook()`, confirm four tabs and explicit headers, verify sharing is restricted, and run create/recover/expire with synthetic values only.

- [ ] **Step 6: Deploy the gateway behind HTTPS without enabling real leads**

Use `leads.baankaiyaphap-chonburi.com` behind Nginx on Contabo `62.146.237.161`. Keep the public client endpoint blank until TLS, health check, origin validation, storage secret, LINE signature, expiry trigger, and synthetic smoke pass.

- [ ] **Step 7: Run synthetic end-to-end LINE verification**

Generate a synthetic plan, reach `#packages`, open LINE with the prefilled code, press Send, verify masked confirmation, confirm it, verify one owner notification, and verify duplicate webhook replay creates no duplicate transition or notification.

- [ ] **Step 8: Present release evidence and request real-data approval**

Do not enable the public lead endpoint or real contact storage until the owner explicitly approves the verified synthetic run.
