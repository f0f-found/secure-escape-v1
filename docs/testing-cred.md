# Secure Escape Testing Credentials

This document contains the default testing credentials for the Secure Escape mobile application and fraud dashboard.

---

# Mobile Banking Users

**Default Password:** `Password@123`

| Customer       | Bank               | Email    | Password | Normal PIN | Duress PIN |
|----------------|--------------------|-------   |----------|------------|------------|
| Thabo Nkosi    | Zenith Bank Africa | thabo.nkosi@email.co.za    | Password@123 | 1234 | 9999 |
| Amara Dlamini  | Zenith Bank Africa | amara.dlamini@email.co.za  | Password@123 | 2222 | 8888 |
| Lerato Mokoena | Zenith Bank Africa | lerato.mokoena@email.co.za | Password@123 | 3333 | 7777 |
| Sipho Zulu     | Savanna Bank       | sipho.zulu@email.co.za     | Password@123 | 4444 | 6666 |
| Naledi Khumalo | Savanna Bank       | naledi.khumalo@email.co.za | Password@123 | 5555 | 0000 |

---

# Fraud Dashboard Administrators

**Default Password:** `Admin@123`

| Name | Organisation | Role | Email | Password |
|------|--------------|------|-------|----------|
| Naledi Vilakazi | Secure Escape | Secure Escape Administrator | admin@secureescape.co.za | Admin@123 |
| Sipho Mahlangu | Zenith Bank Africa | Fraud Analyst | sipho.mahlangu@zenithbank.co.za | Admin@123 |
| Lindiwe Khoza | Zenith Bank Africa | System Administrator | lindiwe.khoza@zenithbank.co.za | Admin@123 |
| Kagiso Moyo | Zenith Bank Africa | Fraud Manager | kagiso.moyo@zenithbank.co.za | Admin@123 |
| Mpho Sithole | Savanna Bank | Fraud Manager | mpho.sithole@savannabank.co.za | Admin@123 |
| Zanele Dube | Savanna Bank | Fraud Analyst | zanele.dube@savannabank.co.za | Admin@123 |

---

# Test Scenarios

## Standard Login

**User**

- Email: `thabo.nkosi@email.co.za`
- Password: `Password@123`
- PIN: `1234`

**Expected Result**

- User logs in successfully.
- Banking dashboard loads normally.
- No fraud alert is created.

---

## Duress Login

**User**

- Email: `thabo.nkosi@email.co.za`
- Password: `Password@123`
- PIN: `9999`

**Expected Result**

- User is authenticated successfully.
- Duress mode is activated.
- A high-priority fraud alert is generated.
- Transactions performed during the session are monitored.
- The alert appears in the Fraud Dashboard.

---

## Bank Administrator Access

**Login**

- Email: `sipho.mahlangu@zenithbank.co.za`
- Password: `Admin@123`

**Expected Result**

- Access is restricted to Zenith Bank Africa.
- Only Zenith Bank customers, alerts, sessions, and transactions are visible.
- No data from Savanna Bank is accessible.

---

## Secure Escape Administrator Access

**Login**

- Email: `admin@secureescape.co.za`
- Password: `Admin@123`

**Expected Result**

- Access to all participating banks.
- View all fraud alerts.
- View all customers.
- View all audit logs.
- Manage bank integrations and platform administration.