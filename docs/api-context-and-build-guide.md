# Secure Escape API Context and Build Guide

## Project Framing

Secure Escape is being presented as a banking application where the Secure Escape safety service is already integrated into the bank's ecosystem. The user sees a normal mobile banking app: login, accounts, cards, beneficiaries, transactions, and settings. The Secure Escape layer quietly changes system behavior when the user authenticates with a duress PIN.

The backend should therefore be built as one integrated banking API:

- Normal banking layer: users, accounts, cards, beneficiaries, transactions.
- Secure Escape layer: duress sessions, decoy profiles, alerts, risk evaluation, notifications, audit logs.
- Fraud/admin layer: bank staff, alert actions, investigation workflows.

The most important concept is that duress does not belong to the user permanently. Duress belongs to a specific login session.

```text
User = the bank customer
AuthCredential = the customer's password/PIN hashes
UserSession = the current login session, either Normal or Duress
BankTransaction = a normal bank transaction with Secure Escape risk fields
Alert = a fraud/security case created during danger
AuditLog = proof of what the system did
```

## Final Model List

The API currently uses these models:

```text
AdminUser
Alert
AlertAction
ApiClient
AuditLog
AuthCredential
BankAccount
BankIntegration
BankTransaction
Beneficiary
Card
DecoyProfile
LocationEvent
NotificationAttempt
RiskEvaluation
User
UserSession
```

## Model Responsibilities

### BankIntegration

Represents the bank whose mobile app has integrated Secure Escape.

Examples:

```text
BankName: GlobalOne Bank
BankCode: GLOBAL_ONE
Status: Active
WebhookUrl: https://globalone.example/api/secure-escape/events
```

Relationships:

```text
BankIntegration 1 -> many Users
BankIntegration 1 -> many ApiClients
BankIntegration 1 -> many AdminUsers
```

### ApiClient

Represents an authorized app or bank system allowed to call this API.

Examples:

```text
globalone-mobile-app
globalone-fraud-dashboard
```

Purpose:

- Authenticate trusted bank systems.
- Track API scopes.
- Store a hashed client secret, never a raw secret.

Relationships:

```text
ApiClient many -> 1 BankIntegration
```

### User

Represents the bank customer.

The user model should store profile and ownership information only. It should not store password hashes, PIN hashes, or duress state.

Relationships:

```text
User many -> 1 BankIntegration
User 1 -> 1 AuthCredential
User 1 -> many BankAccounts
User 1 -> many Cards
User 1 -> many Beneficiaries
User 1 -> many UserSessions
User 1 -> many DecoyProfiles
User 1 -> many Alerts
User 1 -> many AuditLogs
```

### AuthCredential

Stores the customer's sensitive login material.

Contains:

```text
PasswordHash
NormalPinHash
DuressPinHash
```

Important rules:

- Never store raw passwords.
- Never store raw PINs.
- Use a real password hashing algorithm such as BCrypt or Argon2.
- The login service must compare user input against these hashes.

Relationships:

```text
AuthCredential 1 -> 1 User
```

### BankAccount

Represents the customer's real bank account.

Examples:

```text
Main Account
Savings Account
Credit Account
```

Secure Escape rule:

- In a normal session, show real account balances.
- In a duress session, do not expose the real balance. Use the active DecoyProfile instead.

Relationships:

```text
BankAccount many -> 1 User
BankAccount 1 -> many Cards
BankAccount 1 -> many BankTransactions
```

### Card

Represents a debit, credit, or virtual card linked to a bank account.

Security rules:

- Store only safe display information.
- Do not store full card number.
- Do not store CVV.
- LastFourDigits is acceptable for UI display.

Relationships:

```text
Card many -> 1 User
Card many -> 1 BankAccount
```

### Beneficiary

Represents a saved recipient the customer can pay or transfer money to.

Relationships:

```text
Beneficiary many -> 1 User
Beneficiary 1 -> many BankTransactions
```

### UserSession

Represents one login session in the banking app.

This is one of the central models in the system.

Session modes:

```text
Normal
Duress
```

Session statuses:

```text
Active
Expired
Terminated
```

Rules:

- Normal PIN creates a Normal session.
- Duress PIN creates a Duress session.
- Transactions, alerts, risk evaluations, location events, and audit logs should link back to the session.

Relationships:

```text
UserSession many -> 1 User
UserSession 1 -> many BankTransactions
UserSession 1 -> many Alerts
UserSession 1 -> many LocationEvents
UserSession 1 -> many RiskEvaluations
UserSession 1 -> many AuditLogs
```

### DecoyProfile

Represents the fake or safer financial view shown during duress mode.

Example:

```text
Real balance: R28,840
DisplayBalance: R850
EmergencyBudget: R200
Tier1Limit: R500
Tier2Limit: R5,000
Tier2DelayHours: 24
```

Rules:

- Each user can have one active decoy profile.
- Normal sessions ignore the decoy profile for balance display.
- Duress sessions use the decoy profile to decide what the app shows and what transaction limits apply.

Relationships:

```text
DecoyProfile many -> 1 User
```

### BankTransaction

Represents every banking transaction made in the app.

This is not only for duress transactions. Normal transactions and duress transactions both go here.

Normal transaction example:

```text
Session.Mode: Normal
TransactionType: Transfer
Status: Approved
Flagged: false
RiskLevel: Low
RiskScore: 0.05
```

Duress transaction example:

```text
Session.Mode: Duress
TransactionType: Transfer
Status: Delayed or DecoyApproved
Flagged: true
RiskLevel: High
RiskScore: 0.92
```

Rules:

- Every transaction belongs to a user, session, and source bank account.
- Beneficiary is optional because withdrawals, card payments, and prepaid purchases may not use a saved beneficiary.
- During a duress session, the transaction should be evaluated against the user's active decoy profile.

Relationships:

```text
BankTransaction many -> 1 User
BankTransaction many -> 1 UserSession
BankTransaction many -> 1 BankAccount
BankTransaction many -> 0/1 Beneficiary
BankTransaction 1 -> many RiskEvaluations
```

### Alert

Represents a fraud/security case created when danger is detected.

Examples:

```text
DuressLogin
DuressTransaction
SuspiciousRetry
HighRiskTransaction
```

Alert lifecycle:

```text
Open -> Investigating -> Resolved
Open -> FalseAlarm
```

Relationships:

```text
Alert many -> 1 User
Alert many -> 1 UserSession
Alert 1 -> many AlertActions
Alert 1 -> many LocationEvents
Alert 1 -> many NotificationAttempts
```

### AlertAction

Represents an action taken by the fraud team on an alert.

Examples:

```text
Viewed
Assigned
CalledUser
FrozeAccount
ContactedAuthorities
MarkedFalseAlarm
Resolved
```

Relationships:

```text
AlertAction many -> 1 Alert
AlertAction many -> 0/1 AdminUser
```

### LocationEvent

Represents a captured location point during a session or alert.

Sources:

```text
Gps
IpAddress
Device
Manual
```

Rules:

- UserSessionId is required.
- AlertId is optional.
- A location can be captured before an alert is created, then linked later.

Relationships:

```text
LocationEvent many -> 1 UserSession
LocationEvent many -> 0/1 Alert
```

### RiskEvaluation

Represents the system's risk result for a session or transaction.

Rules:

- UserSessionId is required.
- BankTransactionId is optional because some risk evaluations happen before a transaction exists.
- ReasonsJson stores the explanation, such as duress PIN matched or high transfer amount during duress.

Relationships:

```text
RiskEvaluation many -> 1 UserSession
RiskEvaluation many -> 0/1 BankTransaction
```

### NotificationAttempt

Represents an attempt to send a silent alert notification.

Channels:

```text
Sms
Email
Push
Webhook
SapsApi
```

Statuses:

```text
Pending
Sent
Failed
Retrying
```

Relationships:

```text
NotificationAttempt many -> 1 Alert
```

### AuditLog

Represents an append-only record of important system events.

Examples:

```text
PinVerification
NormalPinMatched
DuressPinMatched
LoginFailed
SessionCreated
TransactionCreated
TransactionEvaluated
AlertCreated
AlertStatusUpdated
NotificationSent
NotificationFailed
DecoyProfileUpdated
AccountFrozen
```

Rules:

- Use AuditLog for proof of system behavior.
- Do not use AuditLog as the main alert or transaction table.
- EntityType and EntityId allow the audit log to point to any model without needing many nullable foreign keys.

Relationships:

```text
AuditLog many -> 0/1 User
AuditLog many -> 0/1 UserSession
AuditLog many -> 0/1 AdminUser
```

### AdminUser

Represents bank staff who can monitor and respond to Secure Escape alerts.

Roles:

```text
FraudAnalyst
FraudManager
SystemAdmin
```

Relationships:

```text
AdminUser many -> 1 BankIntegration
AdminUser 1 -> many AlertActions
AdminUser 1 -> many AuditLogs
```

## Relationship Map

```text
BankIntegration
  -> ApiClients
  -> AdminUsers
  -> Users

User
  -> AuthCredential
  -> BankAccounts
  -> Cards
  -> Beneficiaries
  -> UserSessions
  -> DecoyProfiles
  -> Alerts
  -> AuditLogs

BankAccount
  -> Cards
  -> BankTransactions

UserSession
  -> BankTransactions
  -> Alerts
  -> LocationEvents
  -> RiskEvaluations
  -> AuditLogs

BankTransaction
  -> RiskEvaluations

Alert
  -> AlertActions
  -> LocationEvents
  -> NotificationAttempts

AdminUser
  -> AlertActions
  -> AuditLogs
```

## Main System Flows

### Normal Login Flow

```text
1. User enters email/password/PIN.
2. API finds User by email.
3. API loads AuthCredential.
4. API verifies password hash.
5. API checks PIN against NormalPinHash.
6. Normal PIN matches.
7. API creates UserSession with Mode = Normal.
8. API writes AuditLog: NormalPinMatched and SessionCreated.
9. API returns JWT, session id, user profile, and mode Normal.
10. Mobile app shows real BankAccount balances.
```

### Duress Login Flow

```text
1. User enters email/password/PIN.
2. API finds User by email.
3. API loads AuthCredential.
4. API verifies password hash.
5. API checks PIN against DuressPinHash.
6. Duress PIN matches.
7. API creates UserSession with Mode = Duress.
8. API creates Alert with Type = DuressLogin and Status = Open.
9. API creates RiskEvaluation with RiskLevel = High.
10. API creates NotificationAttempt records for silent alert delivery.
11. API writes AuditLog: DuressPinMatched, SessionCreated, AlertCreated.
12. API returns JWT, session id, user profile, and mode Duress.
13. Mobile app looks normal but uses DecoyProfile data.
```

### Dashboard Balance Flow

```text
1. Mobile app requests dashboard data.
2. API checks current UserSession.Mode.
3. If Mode = Normal:
   - return real BankAccount balances.
4. If Mode = Duress:
   - return DecoyProfile.DisplayBalance instead of real balances.
   - avoid visible warning or suspicious UI differences.
```

### Normal Transaction Flow

```text
1. User creates a transfer/payment.
2. API confirms session mode is Normal.
3. API creates BankTransaction.
4. API assigns RiskLevel = Low unless other rules apply.
5. API sets Status = Approved or Pending.
6. API writes AuditLog: TransactionCreated and TransactionEvaluated.
7. API returns transaction confirmation.
```

### Duress Transaction Flow

```text
1. User creates a transfer/payment while session mode is Duress.
2. API loads user's active DecoyProfile.
3. API evaluates amount against EmergencyBudget, Tier1Limit, Tier2Limit, and Tier2DelayHours.
4. API creates BankTransaction with Flagged = true.
5. API sets RiskLevel = High or Critical.
6. API sets Status depending on rules:
   - DecoyApproved: app can show success while backend protects funds.
   - Delayed: transfer is delayed for review.
   - Blocked: unsafe transaction is stopped internally.
7. API creates RiskEvaluation.
8. API may create or update Alert.
9. API writes AuditLog: TransactionCreated and TransactionEvaluated.
10. API returns a response that does not reveal duress mode to an attacker.
```

### Fraud Team Alert Flow

```text
1. Fraud team opens alert dashboard.
2. API returns open/investigating alerts.
3. Fraud analyst opens alert detail.
4. API returns user, session, transactions, locations, notification attempts, and alert actions.
5. Analyst takes action: freeze account, call user, contact authorities, resolve case.
6. API creates AlertAction.
7. API updates Alert.Status where needed.
8. API writes AuditLog.
```

## API Build Principles

### Architecture Layers

Use this structure for each feature:

```text
Controllers -> Services -> Repositories/AppDbContext -> Database
```

Controllers should:

- Receive HTTP requests.
- Validate DTOs via model validation.
- Call services.
- Return safe response DTOs.

Services should:

- Hold business rules.
- Decide normal vs duress behavior.
- Create sessions, alerts, risk evaluations, notifications, and audit logs.

Repositories can be used if the team wants a repository pattern, but EF Core via AppDbContext is acceptable for a student project if service logic stays clean.

DTOs should be used for all request and response shapes. Do not return EF models directly from controllers.

### Security Rules

- Require JWT for normal mobile app endpoints after login.
- Never return password hash or PIN hash.
- Never expose raw duress behavior in mobile responses.
- Store enum values as strings for readability.
- Use HTTPS.
- Use BCrypt/Argon2 for password and PIN hashing.
- Avoid logging raw PINs, passwords, full account secrets, or full card numbers.

## Recommended Controller List

```text
AuthController
ProfileController
AccountsController
CardsController
BeneficiariesController
TransactionsController
SecureEscapeController
SessionsController
AlertsController
AdminAlertsController
AuditLogsController
BankIntegrationsController
ApiClientsController
```

## API Endpoints

Base path recommendation:

```text
/api/v1
```

Your current API uses `/api/Auth/login` and `/api/Profile/me`. You can keep those while developing, but the final structure should move toward versioned routes.

### Auth Endpoints

#### POST `/api/v1/auth/login`

Purpose:

Authenticate the banking app user using email, password, and PIN. Creates either a Normal or Duress session.

Request:

```json
{
  "email": "test@secureescape.com",
  "password": "Password123",
  "pin": "1234",
  "deviceInfo": "iPhone 13",
  "ipAddress": "192.168.1.1",
  "latitude": -25.7479,
  "longitude": 28.2293
}
```

Response:

```json
{
  "userId": "guid",
  "sessionId": "guid",
  "fullName": "Test User",
  "email": "test@secureescape.com",
  "token": "jwt",
  "mode": "Normal"
}
```

Duress response should still look successful. It may include `"mode": "Duress"` for internal frontend logic during the demo, but in a production-style build, be careful because visible duress flags can expose the user.

Service responsibilities:

- Verify password hash.
- Compare PIN against NormalPinHash and DuressPinHash.
- Create UserSession.
- Write AuditLog.
- If duress: create Alert, RiskEvaluation, NotificationAttempt, optional LocationEvent.
- Return JWT with UserId and SessionId claims.

#### POST `/api/v1/auth/logout`

Purpose:

End the current session.

Response:

```json
{
  "message": "Logged out successfully"
}
```

Service responsibilities:

- Set UserSession.Status = Terminated.
- Set EndedAt.
- Write AuditLog.

#### POST `/api/v1/auth/change-pin`

Purpose:

Change the normal app PIN.

Request:

```json
{
  "currentPin": "1234",
  "newPin": "5678"
}
```

Service responsibilities:

- Verify current normal PIN.
- Hash new PIN.
- Update AuthCredential.NormalPinHash.
- Write AuditLog.

#### POST `/api/v1/auth/change-password`

Purpose:

Change the user password.

Request:

```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

### Profile Endpoints

#### GET `/api/v1/profile/me`

Purpose:

Return current logged-in customer profile.

Response:

```json
{
  "id": "guid",
  "bankCustomerId": "cust_123",
  "fullName": "Test User",
  "email": "test@secureescape.com",
  "phoneNumber": "+27821234567",
  "status": "Active"
}
```

#### PATCH `/api/v1/profile/me`

Purpose:

Update safe profile fields such as phone number.

### Account Endpoints

#### GET `/api/v1/accounts`

Purpose:

Return account cards for the dashboard.

Behavior:

- Normal session returns real balances.
- Duress session returns decoy balance behavior.

Response:

```json
[
  {
    "id": "guid",
    "accountName": "Main Account",
    "accountType": "Savings",
    "availableBalance": 28840.00,
    "currentBalance": 28840.00,
    "currency": "ZAR",
    "status": "Active"
  }
]
```

Duress behavior:

The response should look normal, but values should be based on DecoyProfile.

#### GET `/api/v1/accounts/{accountId}`

Purpose:

Return account detail and recent transactions.

#### GET `/api/v1/accounts/{accountId}/transactions`

Purpose:

Return transactions for one account.

Query parameters:

```text
from
to
status
type
page
pageSize
```

### Card Endpoints

#### GET `/api/v1/cards`

Purpose:

Return user's cards.

#### GET `/api/v1/cards/{cardId}`

Purpose:

Return card detail.

#### PATCH `/api/v1/cards/{cardId}/status`

Purpose:

Freeze, block, activate, or cancel a card.

Request:

```json
{
  "cardStatus": "Frozen"
}
```

### Beneficiary Endpoints

#### GET `/api/v1/beneficiaries`

Purpose:

Return saved beneficiaries.

#### POST `/api/v1/beneficiaries`

Purpose:

Create a beneficiary.

Request:

```json
{
  "name": "Rent Account",
  "bankName": "GlobalOne Bank",
  "accountNumber": "1234567890",
  "reference": "Monthly rent"
}
```

#### PATCH `/api/v1/beneficiaries/{beneficiaryId}`

Purpose:

Update beneficiary details.

#### DELETE `/api/v1/beneficiaries/{beneficiaryId}`

Purpose:

Soft-delete or deactivate a beneficiary.

Recommended behavior:

Set Status = Inactive instead of hard deleting.

### Transaction Endpoints

#### POST `/api/v1/transactions`

Purpose:

Create a banking transaction.

Request:

```json
{
  "bankAccountId": "guid",
  "beneficiaryId": "guid",
  "transactionType": "Transfer",
  "amount": 500.00,
  "currency": "ZAR",
  "description": "Payment"
}
```

Normal response:

```json
{
  "transactionId": "guid",
  "bankReference": "TXN-20260518-0001",
  "status": "Approved",
  "flagged": false,
  "riskLevel": "Low",
  "createdAt": "2026-05-18T10:00:00Z"
}
```

Duress response:

The response should avoid revealing danger to an attacker. Depending on demo needs, it may show Approved or Processing while internally storing Delayed, DecoyApproved, or Flagged.

Service responsibilities:

- Load current UserSession.
- Validate account belongs to user.
- Validate beneficiary belongs to user when supplied.
- Create BankTransaction.
- If session is Normal, approve normally.
- If session is Duress, evaluate against DecoyProfile.
- Create RiskEvaluation.
- Create or update Alert if needed.
- Write AuditLog.

#### GET `/api/v1/transactions/{transactionId}`

Purpose:

Return one transaction detail.

#### GET `/api/v1/transactions`

Purpose:

Return user's transaction history.

Query parameters:

```text
accountId
from
to
status
type
page
pageSize
```

### Secure Escape Setup Endpoints

#### GET `/api/v1/secure-escape/decoy-profile`

Purpose:

Return the user's active decoy profile.

#### PUT `/api/v1/secure-escape/decoy-profile`

Purpose:

Create or update the user's active decoy profile.

Request:

```json
{
  "profileType": "LowProfile",
  "displayBalance": 850.00,
  "emergencyBudget": 200.00,
  "tier1Limit": 500.00,
  "tier2Limit": 5000.00,
  "tier2DelayHours": 24
}
```

Service responsibilities:

- Ensure only one active profile per user, or deactivate older profiles.
- Write AuditLog: DecoyProfileUpdated.

#### POST `/api/v1/secure-escape/duress-pin`

Purpose:

Set or update the duress PIN.

Request:

```json
{
  "currentPassword": "Password123",
  "duressPin": "0000"
}
```

Service responsibilities:

- Verify password.
- Hash duress PIN.
- Update AuthCredential.DuressPinHash.
- Write AuditLog.

#### POST `/api/v1/secure-escape/test-mode`

Purpose:

Optional demo endpoint to simulate duress behavior without real emergency notification.

Use carefully and clearly label as demo-only.

### Session Endpoints

#### GET `/api/v1/sessions/current`

Purpose:

Return the current session.

Response:

```json
{
  "sessionId": "guid",
  "mode": "Normal",
  "status": "Active",
  "startedAt": "2026-05-18T10:00:00Z"
}
```

#### GET `/api/v1/sessions/{sessionId}`

Purpose:

Return session detail for admin/fraud investigation.

Should be admin-only.

#### GET `/api/v1/sessions/{sessionId}/transactions`

Purpose:

Return all transactions in a session.

Should be admin-only or internal.

### Alert Endpoints For Fraud Team

These should require admin/fraud-team authorization.

#### GET `/api/v1/admin/alerts`

Purpose:

Return alerts for the fraud dashboard.

Query parameters:

```text
status
severity
type
from
to
page
pageSize
```

#### GET `/api/v1/admin/alerts/{alertId}`

Purpose:

Return alert detail.

Include:

- Alert.
- User profile.
- Session.
- Transactions.
- Location events.
- Notification attempts.
- Alert actions.

#### PATCH `/api/v1/admin/alerts/{alertId}/status`

Purpose:

Update alert status.

Request:

```json
{
  "status": "Investigating",
  "notes": "Fraud analyst opened the case."
}
```

Service responsibilities:

- Update Alert.Status.
- Set ResolvedAt if status is Resolved or FalseAlarm.
- Create AlertAction.
- Write AuditLog.

#### POST `/api/v1/admin/alerts/{alertId}/actions`

Purpose:

Add an action to an alert timeline.

Request:

```json
{
  "actionType": "FrozeAccount",
  "notes": "Main account frozen pending verification."
}
```

Service responsibilities:

- Create AlertAction.
- Apply side effects where needed, such as setting BankAccount.Status = Frozen.
- Write AuditLog.

### Location Endpoints

#### POST `/api/v1/location-events`

Purpose:

Capture a location point for the current session.

Request:

```json
{
  "latitude": -25.7479,
  "longitude": 28.2293,
  "accuracyMeters": 15.5,
  "locationSource": "Gps"
}
```

Service responsibilities:

- Link to current UserSession.
- If there is an open alert for the session, link AlertId.
- Write AuditLog if needed.

#### GET `/api/v1/admin/alerts/{alertId}/locations`

Purpose:

Return locations linked to an alert.

Admin-only.

### Audit Endpoints

#### GET `/api/v1/admin/audit-logs`

Purpose:

Return audit events for compliance and investigation.

Query parameters:

```text
userId
sessionId
adminUserId
eventType
from
to
page
pageSize
```

Admin-only.

### Bank Integration Endpoints

These are mostly setup/admin endpoints.

#### GET `/api/v1/admin/bank-integrations`

Return all bank integrations.

#### POST `/api/v1/admin/bank-integrations`

Create a bank integration.

#### PATCH `/api/v1/admin/bank-integrations/{bankIntegrationId}`

Update a bank integration.

### API Client Endpoints

Admin/system-only.

#### GET `/api/v1/admin/api-clients`

Return API clients.

#### POST `/api/v1/admin/api-clients`

Create API client credentials.

Request:

```json
{
  "bankIntegrationId": "guid",
  "clientId": "globalone-mobile-app",
  "clientSecret": "raw-secret-only-shown-once",
  "scopes": "auth:login transactions:create alerts:read"
}
```

Service responsibilities:

- Hash client secret.
- Store only ClientSecretHash.

#### PATCH `/api/v1/admin/api-clients/{apiClientId}/revoke`

Revoke an API client.

## Suggested Services

Build services around business capabilities:

```text
AuthService
SessionService
TokenService
ProfileService
AccountService
CardService
BeneficiaryService
TransactionService
SecureEscapeService
RiskService
AlertService
NotificationService
AuditService
AdminUserService
BankIntegrationService
ApiClientService
```

### AuthService

Responsibilities:

- Validate login credentials.
- Detect normal vs duress PIN.
- Create UserSession.
- Trigger alert creation for duress.
- Return JWT/session response.

### TransactionService

Responsibilities:

- Create transactions.
- Check session mode.
- Apply normal transaction behavior.
- Apply duress transaction behavior.
- Call RiskService.
- Call AlertService when needed.
- Write AuditLogs.

### SecureEscapeService

Responsibilities:

- Manage decoy profiles.
- Update duress PIN.
- Decide what dashboard balances should be shown during duress.

### AlertService

Responsibilities:

- Create alerts.
- List alerts for fraud team.
- Update alert status.
- Create alert actions.
- Link transactions, locations, notifications, and audit data.

### RiskService

Responsibilities:

- Generate risk score and risk level.
- Store RiskEvaluation.
- Explain reasons in ReasonsJson.

Initial simple risk rules:

```text
Normal session = Low risk
Duress session = High risk
Duress session + amount over Tier1Limit = High risk
Duress session + amount over Tier2Limit = Critical risk
Repeated failed login = Medium/High risk
```

### NotificationService

Responsibilities:

- Create NotificationAttempt records.
- Send webhook/SMS/email/push where implemented.
- Mark attempts as Sent, Failed, or Retrying.

For the demo, it is acceptable to create the records without actually sending external messages.

### AuditService

Responsibilities:

- Central helper for writing AuditLog records.
- Prevent duplicate audit-writing logic from being scattered across controllers.

## Suggested DTO Folder Structure

```text
DTOs/
  Request/
    LoginRequestDto.cs
    CreateTransactionRequestDto.cs
    UpsertDecoyProfileRequestDto.cs
    SetDuressPinRequestDto.cs
    CreateBeneficiaryRequestDto.cs
    UpdateAlertStatusRequestDto.cs
    CreateAlertActionRequestDto.cs
  Response/
    LoginResponseDto.cs
    ProfileResponseDto.cs
    AccountSummaryResponseDto.cs
    BankTransactionResponseDto.cs
    DecoyProfileResponseDto.cs
    AlertSummaryResponseDto.cs
    AlertDetailResponseDto.cs
```

## Recommended Build Order

Build in this order so each feature has the dependencies it needs:

```text
1. Confirm AppDbContext and migrations are stable.
2. Add password/PIN hashing helper.
3. Update AuthService to use AuthCredential and create UserSession.
4. Update TokenService to include UserSessionId and SessionMode claims.
5. Build ProfileController.
6. Build AccountsController with normal vs duress balance behavior.
7. Build SecureEscapeController for decoy profile and duress PIN.
8. Build BeneficiariesController.
9. Build TransactionsController with risk evaluation.
10. Build AlertService and admin alert endpoints.
11. Build LocationEvent endpoint.
12. Build NotificationAttempt behavior.
13. Build AuditLog admin query endpoint.
14. Seed realistic demo data.
```

## JWT Claims Recommendation

The JWT should include:

```text
UserId
Email
FullName
BankIntegrationId
UserSessionId
SessionMode
```

This allows endpoints to know:

- Which customer is calling.
- Which bank they belong to.
- Which session is active.
- Whether the session is Normal or Duress.

## Demo Data Recommendation

Seed one bank:

```text
GlobalOne Bank
```

Seed one user:

```text
FullName: Naomie Demo
Email: test@secureescape.com
Password: Password123
Normal PIN: 1234
Duress PIN: 0000
```

Seed accounts:

```text
Main Account: R28,840.00
Savings Account: R3,789.00
```

Seed decoy profile:

```text
DisplayBalance: R850.00
EmergencyBudget: R200.00
Tier1Limit: R500.00
Tier2Limit: R5,000.00
Tier2DelayHours: 24
```

This supports a clean demo:

```text
Login with 1234 -> real dashboard
Login with 0000 -> same app, decoy balance, alert created silently
```

## Team Notes

- Do not expose EF models directly from controllers.
- Use DTOs for requests and responses.
- Use services for business rules.
- Keep controllers thin.
- Log important actions through AuditService.
- Treat UserSession as the center of Secure Escape behavior.
- Treat BankTransaction as the normal transaction table with risk metadata.
- Treat Alert as the fraud case, not as a generic log.
- Treat AuditLog as proof, not workflow state.

