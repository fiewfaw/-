# Care Navigator Lead Registry

Dedicated private storage for temporary, consented Care Navigator leads. This project must not share a spreadsheet or deployment with anonymous marketing events.

## Setup

1. Create a private Google Spreadsheet named `Care Navigator - Pending Leads`.
2. Create a separate Apps Script project and add `Code.gs` plus `appsscript.json`.
3. Add Script Properties:
   - `LEAD_SPREADSHEET_ID`: the private spreadsheet ID.
   - `LEAD_GATEWAY_SECRET`: a random server-only secret of at least 32 bytes.
4. Run `setupWorkbook()` once as the owner.
5. Run `installDailyExpiryTrigger()` once as the owner.
6. Deploy as a web app executed as the owner. Only the VPS gateway URL should call it.

Never put either Script Property in browser JavaScript, source control, screenshots, or chat. Keep the spreadsheet owner-only and test with synthetic leads until the full deletion and recovery checks pass.

## Storage actions

- `createLead`
- `recoverPlan`
- `lookupLead`
- `confirmLead`
- `updateLeadStatus`
- `expireLeads`

Each request is a form POST with one `payload` field containing a JSON envelope. Responses are minimal JSON and never echo full Sheet rows.
