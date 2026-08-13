# Care Navigator Google Sheets API Migration Design

**Date:** 2026-08-13
**Status:** Ready for owner review
**Scope:** Replace the Lead Registry's Apps Script transport with direct Google Sheets API access from the existing VPS gateway.

## Objective

Keep the existing private `Care Navigator - Pending Leads` spreadsheet and its four tabs, but stop using the Apps Script web app for create, recovery, lookup, status updates, and deletion. The Node gateway on the VPS will call the Google Sheets API directly through a dedicated service account.

This migration does not enable real lead intake. The public browser endpoint remains blank and Caddy continues returning `503` for `/v1/*` until synthetic verification passes and the owner explicitly approves real data.

## Selected Architecture

```text
Care Navigator browser
        |
        | HTTPS, strict public contract
        v
VPS Lead Gateway
        |
        | Google service-account credential
        | Sheets API, spreadsheet ID allowlist
        v
Care Navigator - Pending Leads
```

- Create a dedicated Google Cloud project for the Care Navigator Lead Registry.
- Enable only the Google Sheets API required by this service.
- Create one service account used only by the VPS gateway.
- Share only the Lead Registry spreadsheet with that service-account email as Editor.
- Do not share Drive folders, the anonymous marketing workbook, Gmail, or the Clinical Core.
- Store the service-account credential only in `/docker/care-navigator-leads/secrets/` on the VPS with owner-only permissions.
- Mount the credential read-only into the gateway container. Never copy it into the Docker image, repository, browser JavaScript, logs, screenshots, or chat.

## Preserved Contracts

The workbook remains compatible with the approved design:

- `Leads`
- `Status History`
- `Lookup Audit`
- `Data Dictionary`

The gateway storage interface remains:

- `createLead`
- `recoverPlan`
- `lookupLead`
- `confirmLead`
- `updateLeadStatus`
- `expireLeads`
- `purgeLead`

The browser, Team 4 pages, lead-code format, recovery-token hashing, status transitions, consent version, and 14/90/30-day retention rules do not change.

## Google Authentication

The gateway signs a short-lived OAuth access-token request with the service-account private key and requests the narrow `https://www.googleapis.com/auth/spreadsheets` scope. Tokens stay in memory only and are refreshed before expiry.

Every storage operation also checks that the configured spreadsheet ID equals the single approved Lead Registry ID. A credential being valid is not sufficient to permit another spreadsheet.

## Storage Behaviour

### Reads

Read only the explicit columns in the three operational tabs. Do not request whole Drive files or list the owner's Drive.

### Writes

- `createLead` checks `request_id` before appending to preserve idempotency.
- Status changes update the current lead row and append a separate immutable history row.
- Lookup attempts append only the approved audit fields.
- Public recovery returns only lead code, plan type, plan summary, and expiry.
- No operation returns the recovery-token hash.

### Concurrency

The gateway serializes workbook mutations through one bounded in-process queue because this is a low-volume local service. Each operation rereads the relevant rows before writing. Duplicate `request_id` and invalid status transitions remain rejected. A future multi-instance deployment must replace this queue with a stronger shared lock before scaling beyond one gateway container.

## Retention And Scheduled Cleanup

Move the authoritative daily expiry job to the VPS. A separate one-shot command invokes `expireLeads` through the same storage module, and a host timer runs it daily. Apps Script may remain in the Google account temporarily for rollback reference, but it is not part of the active data path and its trigger should be removed after the VPS expiry test passes.

Purging clears contact name, phone, service area, plan summary, and recovery-token hash while retaining only lifecycle evidence already approved by the Lead Registry design.

## Failure Handling

- Google API authentication failure: return `503`, log only a request ID and safe failure code.
- Google API rate limit or transient `5xx`: retry a small bounded number of times with backoff.
- Invalid or unexpected API response: fail closed; do not claim the lead was saved.
- Duplicate browser retry: return the existing lead through `request_id` idempotency.
- Sheet schema drift: fail health readiness and block writes until the expected headers are restored.
- Lead-system failure never blocks the locally generated personalized plan.

## Security Boundaries

- Service-account email receives Editor access to only one private spreadsheet.
- Credential file permission is owner read-only and mounted read-only.
- Container runs as the existing non-root Node user.
- Spreadsheet ID and credential never reach public JavaScript.
- Names, phone numbers, plan summaries, tokens, and credential material never enter logs.
- Anonymous marketing events and Clinical Core remain untouched.
- Caddy keeps `/v1/*` disabled during migration; `/healthz` may remain public.

## Verification Gates

1. Unit tests cover token creation, API requests, row mapping, idempotent create, recovery, status transitions, purge, schema drift, and safe logging.
2. A synthetic lead completes create, recovery, wrong-token rejection, and purge through the public HTTPS hostname while `/v1/*` is temporarily opened only for the controlled test.
3. The final Sheet row is `expired` and all personal/plan/token cells are blank.
4. Daily expiry is invoked once manually and its VPS timer is verified.
5. The service account cannot read the anonymous marketing workbook or any unshared spreadsheet.
6. Caddy returns `503` for `/v1/*` after the test until owner approval.
7. The browser endpoint remains blank until explicit real-data approval.

## Rollback

- Keep the current Apps Script source and deployment reference without using it.
- Before changing the gateway, archive the current container configuration and image tag.
- If Sheets API verification fails, restore the previous gateway image but leave public intake disabled.
- Revoking access requires removing the service-account email from the spreadsheet and deleting or disabling its credential in Google Cloud.

## Acceptance Criteria

- The VPS gateway uses Google Sheets API directly and no longer calls the Apps Script web app.
- Only the dedicated Lead Registry spreadsheet is shared with the service account.
- All focused tests and synthetic end-to-end checks pass.
- Automatic expiry works from the VPS.
- No real contact data is accepted before a separate explicit owner approval.
