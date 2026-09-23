# Duress transaction tiers

At duress PIN login the API creates a `DuressBudgets` record for that session.
It selects the first active Cheque account (ordered by account name), falling
back to the first active account. Other accounts display zero in that session.

The modes now use different persona policies:

- **Low Profile:** the decoy balance is 7% of available funds, rounded to cents
   and clamped to R200–R50,000. Its cumulative spending limit is the full decoy
   balance, and a new-beneficiary transfer above 50% of the original decoy
   balance requires verification.
- **Realistic Decoy:** the decoy balance is 20% of available funds, rounded to
   cents. Its cumulative spending limit is 30% of that original decoy balance,
   and a new-beneficiary transfer above 30% of the original decoy balance
   requires verification. The 20% balance is a believable account view; it is
   not the amount the customer can spend under duress.

Configured setup amounts are capped at the real account balance. The older tier
fields remain in the profile contract for compatibility, but session budgets use
the mode-specific policy above.

`OriginalBalance` is fixed for the session; `RemainingBalance` decreases only
on an approved payment. `OriginalSpendingLimit` and
`RemainingSpendingLimit` track the separate cumulative duress spending cap.
A missing budget fails closed: accounts show zero and transfers are rejected.
Real balances never replace the decoy in responses.
If actual funds are below the R200 display floor, the API still prevents an
overdraft and returns a generic processing failure without revealing funds.

“New beneficiary” means a beneficiary created in duress mode. The API records
`CreatedUnderDuress` when the beneficiary is added and uses that internal marker
for tier decisions. Payments and later sessions never clear it. Beneficiaries
created in normal mode are existing, even if they have never been paid. The older
session beneficiary snapshot is retained for schema compatibility, but no longer
controls the tier decision. The marker is not returned to the customer app.

Order of evaluation:

1. Above the remaining decoy funds or actual account funds: fail with a normal
   insufficient-funds or generic processing message. This applies to both modes
   and to cash sends as well as transfers.
2. Every transaction during duress above the mode's pending threshold remains
   `Pending`, with a security verification message. This includes existing
   beneficiaries, beneficiaries created during duress, transfers, and cash
   sends. No funds are reserved or debited.
3. Otherwise, the transaction must fit within `RemainingSpendingLimit`; if it
   does not, it fails without debiting funds.
4. Otherwise pay immediately and debit actual funds, remaining decoy funds,
   and remaining spending limit. Cash sends follow the same threshold and
   cumulative-cap rules as transfers.

There is no timer or automatic release for pending transfers. A customer may
submit a smaller transfer while an earlier one remains pending. These are
separate records; the earlier request is not automatically approved or cancelled.

## Fraud review

The existing session evidence panel includes approve/reject controls for pending
transfers. The endpoint is:

`POST /api/v1/admin/duress-sessions/{sessionId}/transactions/{transactionId}/review`

Body: `{ "approve": true }` or `{ "approve": false }`.

Fraud analysts must be assigned to the case. Analysts/managers must belong to
the customer's bank; SystemAdmin may review across banks. Approval rechecks
remaining decoy funds, actual funds, and account status. If funds no longer
cover the request, it stays pending until rejection or a later valid review.
Rejection records `Failed` with an ordinary verification-failed message.
Review decisions are audited privately. Optimistic concurrency checks protect
budget/account debits and prevent repeat approval of an already-reviewed record.

Customer responses map internal `DecoyApproved` to `Approved` and omit Secure
Escape codes. Duress transaction history includes only the current session's
transactions; earlier real-account spending is not exposed. Decoy View badges
are displayed on home and account screens for development visibility. Existing alert/location collection is
retained. The project's external notification/fraud providers are still
simulations; this change does not install a real bank, SMS, or webhook provider.

## Deployment and verification

Apply `AddDuressSessionBudgets` and `TrackBeneficiaryDuressCreation` before deploying the new API,
then release the mobile/web client and fraud dashboard. No production database
has been modified by this implementation. For EF CLI operations set
`SECUREESCAPE_MIGRATION_CONNECTION` securely to the target connection string;
the design-time factory intentionally defaults to a non-production localhost
placeholder. Existing duress sessions without a budget require a fresh PIN
login; they cannot fall back to showing or spending the real balance.

Run `dotnet test SecureEscape.Api.Tests/SecureEscape.Api.Tests.csproj`.
Tests cover the R50,000 → pending → R25,000 immediate → insufficient example,
exact threshold boundaries, immutable beneficiary classification, original
threshold retention, account privacy, concurrent budget writes, and staff review.
Also verify on a device with a migrated test database and the dashboard, including
normal-mode transfers and the pending-message/another-transfer flow.
