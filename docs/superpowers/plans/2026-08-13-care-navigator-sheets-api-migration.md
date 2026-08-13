# Care Navigator Sheets API Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Lead Registry's unreliable Apps Script transport with direct Google Sheets API access from the existing VPS gateway while keeping real lead intake disabled.

**Architecture:** A dedicated Google service account receives Editor access to only `Care Navigator - Pending Leads`. The Node 20 gateway obtains short-lived OAuth tokens, validates the workbook schema, and performs the existing storage actions through the Sheets API. A single gateway instance serializes mutations; a VPS timer runs retention cleanup.

**Tech Stack:** Node.js 20 built-ins, Google OAuth 2.0 service-account JWT, Google Sheets API v4, Node test runner, Docker Compose, Caddy, systemd timer.

## Global Constraints

- Keep the existing spreadsheet ID and four approved tabs.
- Do not share the anonymous marketing workbook, Drive folders, Gmail, or Clinical Core.
- Store credentials only on the VPS under `/docker/care-navigator-leads/secrets/` with owner-only permissions and a read-only container mount.
- Do not add Google client credentials to source control, browser JavaScript, screenshots, logs, or chat.
- Preserve the existing storage-action interface and Lead Registry data contract.
- Keep `care-app/public/js/lead-registry-config.js` endpoint blank throughout implementation.
- Keep Caddy returning `503` for `/v1/*` except during a controlled synthetic smoke test.
- Use synthetic lead data only until explicit owner approval enables real contact storage.
- Do not modify the anonymous first-party marketing event collector or Clinical Core.

---

### Task 1: Google Sheets API Storage Client

**Files:**
- Create: `care-app/services/lead-gateway/src/google-auth.mjs`
- Create: `care-app/services/lead-gateway/src/sheets-api.mjs`
- Create: `care-app/services/lead-gateway/src/sheets-storage.mjs`
- Create: `care-app/services/lead-gateway/test/sheets-storage.node.mjs`
- Modify: `care-app/services/lead-gateway/src/storage-client.mjs`
- Modify: `care-app/services/lead-gateway/package.json`

**Interfaces:**
- `createGoogleAccessTokenProvider({ clientEmail, privateKey, fetchImpl, now }) -> async () => accessToken`
- `createSheetsApi({ spreadsheetId, accessToken, fetchImpl }) -> { getValues, appendValues, updateValues }`
- `createSheetsStorage(options) -> async (action, payload, requestId) => result`
- Existing `createStorageClient(options)` selects `sheets` storage by `LEAD_STORAGE_DRIVER=sheets` and preserves the current gateway interface.

- [ ] **Step 1: Write failing OAuth and Sheets-storage tests**

Cover JWT claims and one-hour maximum token lifetime, token caching, spreadsheet ID allowlist, exact headers, row mapping, idempotent create by `request_id`, recovery-token hash matching, masked lookup, status transitions, audit append, expiry, purge, schema drift, and absence of personal data in thrown errors.

- [ ] **Step 2: Run tests to verify RED**

Run:

```powershell
node --test care-app/services/lead-gateway/test/sheets-storage.node.mjs
```

Expected: module-not-found failure for `google-auth.mjs`.

- [ ] **Step 3: Implement service-account OAuth with Node built-ins**

Use `crypto.createSign('RSA-SHA256')` for the JWT assertion, POST only to `https://oauth2.googleapis.com/token`, request only `https://www.googleapis.com/auth/spreadsheets`, cache the access token in memory, and refresh it at least 60 seconds before expiry.

- [ ] **Step 4: Implement the bounded Sheets API wrapper**

Allow only the configured spreadsheet ID and these ranges:

```js
const ALLOWED_TABS = new Set(['Leads', 'Status History', 'Lookup Audit', 'Data Dictionary'])
```

Use `values.get`, `values.append`, and `values.update`. Reject non-JSON, `401`, `403`, `429`, and `5xx` responses with safe error codes that contain no response body.

- [ ] **Step 5: Implement the existing storage actions**

Use the approved headers and state transitions. Serialize mutations through one promise queue. Reread `Leads` before each mutation, compare `request_id` before append, and clear only approved sensitive columns during purge.

- [ ] **Step 6: Select Sheets storage without breaking test injection**

Keep `options.storageClient` behavior unchanged in `server.mjs`. `createStorageClient(options)` uses `sheets` only when explicitly configured; otherwise it retains the old Apps Script adapter solely for rollback while public intake remains disabled.

- [ ] **Step 7: Run focused tests to verify GREEN**

Run:

```powershell
node --test care-app/services/lead-gateway/test/sheets-storage.node.mjs
npm.cmd test --prefix care-app/services/lead-gateway
```

Expected: all tests pass.

- [ ] **Step 8: Commit the storage client**

```powershell
git add -- care-app/services/lead-gateway/src care-app/services/lead-gateway/test care-app/services/lead-gateway/package.json
git commit -m "feat: add direct Sheets API lead storage"
```

### Task 2: Service Account And Workbook Access

**Files:**
- Modify: `care-app/services/lead-gateway/compose.yaml`
- Create: `care-app/services/lead-gateway/.env.example`
- Create outside Git: `/docker/care-navigator-leads/secrets/google-service-account.json`

**Interfaces:**
- Environment: `LEAD_STORAGE_DRIVER=sheets`, `LEAD_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_FILE=/run/secrets/google-service-account.json`.
- Read-only mount: `/docker/care-navigator-leads/secrets/google-service-account.json:/run/secrets/google-service-account.json:ro`.

- [ ] **Step 1: Create a dedicated Google Cloud project**

Use a Care Navigator-specific project, enable Google Sheets API only, and create one service account named for the Lead Registry.

- [ ] **Step 2: Create and download one JSON credential**

Move it directly to the VPS secret directory, set file mode `600`, and remove the local downloaded copy after verifying the VPS copy hash. Never print credential contents.

- [ ] **Step 3: Share only the private Lead Registry spreadsheet**

Add the service-account email as Editor to spreadsheet ID `1bx4_MM_4PYEw6VtsdK5Rc3zRnMKDGmJkyVjwGrOc1EA`. Do not share its parent folder or any other workbook.

- [ ] **Step 4: Add the read-only secret mount**

Update Compose and `.env.example` with variable names only. Verify `docker compose config` without printing environment values.

- [ ] **Step 5: Verify least privilege with synthetic reads**

Read the four expected tabs from the Lead Registry. Attempt to read one unshared synthetic spreadsheet ID and require a `403` or `404` response.

- [ ] **Step 6: Commit configuration without credentials**

```powershell
git add -- care-app/services/lead-gateway/compose.yaml care-app/services/lead-gateway/.env.example
git commit -m "ops: configure Sheets API service account"
```

### Task 3: VPS Retention Job

**Files:**
- Create: `care-app/services/lead-gateway/scripts/expire-leads.mjs`
- Create: `care-app/services/lead-gateway/ops/care-navigator-lead-expiry.service`
- Create: `care-app/services/lead-gateway/ops/care-navigator-lead-expiry.timer`
- Create: `care-app/services/lead-gateway/test/expiry-runner.node.mjs`
- Modify: `care-app/apps-script/lead-registry/README.md`

**Interfaces:**
- `expire-leads.mjs` invokes `createSheetsStorage()` and `expireLeads` once, prints only `{ ok, purged }`, and returns a non-zero exit code on failure.
- The timer runs daily with persistent catch-up after VPS downtime.

- [ ] **Step 1: Write the failing expiry-runner test**

Assert one storage invocation, minimal output, non-zero exit on failure, and no contact/plan values in stdout or stderr.

- [ ] **Step 2: Run the test to verify RED**

```powershell
node --test care-app/services/lead-gateway/test/expiry-runner.node.mjs
```

- [ ] **Step 3: Implement the one-shot expiry runner**

Load only the service-account file and spreadsheet ID, call `expireLeads`, and print counts only.

- [ ] **Step 4: Add and validate the systemd timer**

Use `OnCalendar=*-*-* 03:15:00 Asia/Bangkok` and `Persistent=true`. Run the service manually once with synthetic rows before enabling the timer.

- [ ] **Step 5: Remove the Apps Script trigger from the active design**

Document that Apps Script remains rollback reference only. After the VPS timer passes, remove the old daily trigger through the Apps Script UI to avoid duplicate cleanup jobs.

- [ ] **Step 6: Commit retention operations**

```powershell
git add -- care-app/services/lead-gateway/scripts care-app/services/lead-gateway/ops care-app/services/lead-gateway/test/expiry-runner.node.mjs care-app/apps-script/lead-registry/README.md
git commit -m "ops: run lead expiry from VPS"
```

### Task 4: Synthetic Release Verification

**Files:**
- Modify: `care-app/services/lead-gateway/scripts/smoke.mjs`
- Modify: `docs/marketing/care-navigator-lead-registry-operations.md`
- Modify only if a defect is found: files from Tasks 1-3.

**Interfaces:**
- Controlled Caddy test temporarily proxies `/v1/*` to the gateway.
- Final Caddy state returns `503` for `/v1/*` and `200` for `/healthz`.

- [ ] **Step 1: Run all local contract and gateway tests**

```powershell
node care-app/tests/lead-registry-contract.node.cjs
node care-app/tests/google-sheets-lead-registry.node.cjs
node care-app/tests/lead-registry-client.node.cjs
node care-app/tests/team4-lead-registry.node.cjs
npm.cmd test --prefix care-app/services/lead-gateway
git diff --check
```

- [ ] **Step 2: Deploy with public intake still disabled**

Build the gateway image, verify non-root execution, read-only credential mount, healthy container, and no published gateway port.

- [ ] **Step 3: Temporarily open `/v1/*` for one controlled synthetic smoke test**

Create a lead with the fixed phone `0800000000`, recover its plan, reject a wrong token, and purge it. Restore Caddy's `503` route in the same operation even if the smoke test fails.

- [ ] **Step 4: Verify final Sheet state**

Require the synthetic row status to be `expired` and `contact_name`, `phone`, `service_area`, `plan_summary`, and `resume_token_hash` to be blank. Confirm history contains the synthetic cleanup reason.

- [ ] **Step 5: Verify daily expiry and access boundaries**

Run the expiry service manually, inspect its minimal output, verify the timer is enabled, and confirm the service account cannot read an unshared spreadsheet.

- [ ] **Step 6: Restore the closed release gate**

Require:

```text
GET  /healthz  -> 200
POST /v1/leads -> 503
browser endpoint -> blank
```

- [ ] **Step 7: Present evidence and request explicit real-data approval**

Do not enable `/v1/*` or set the browser endpoint until the owner separately approves real contact storage.
