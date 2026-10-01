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

## Fresh Secure Escape Setup Users

These users are seeded without a Secure Escape profile so they can be used to
test the setup flow from the beginning. They use active Zenith Bank cheque
accounts, which also makes them suitable for testing the recommended budget.

**Password for all three users:** `Password@123`

| Customer       | Bank               | Email                         | Normal PIN | Duress PIN |
|----------------|--------------------|-------------------------------|------------|------------|
| Test User One  | Zenith Bank Africa | test.user.one@email.co.za     | 1357       | 9753       |
| Test User Two  | Zenith Bank Africa | test.user.two@email.co.za     | 2468       | 8642       |
| Test User Three| Zenith Bank Africa | test.user.three@email.co.za   | 4826       | 6284       |

The API adds these users when it starts if they do not already exist. Existing
users and existing Secure Escape profiles are left unchanged.

## Additional Test Users

These 20 users are local seeded demo records with active bank accounts for
testing. They are not real external bank or customer accounts. Log in with
the email and normal PIN below, then set the duress PIN during setup.

| Customer | Email | Normal PIN |
|----------|-------|------------|
| Ayanda Maseko | ayanda.maseko@email.co.za | 1001 |
| Sibusiso Ndlovu | sibusiso.ndlovu@email.co.za | 1002 |
| Palesa Mokoena | palesa.mokoena@email.co.za | 1003 |
| Kabelo Molefe | kabelo.molefe@email.co.za | 1004 |
| Nokuthula Dube | nokuthula.dube@email.co.za | 1005 |
| Mandla Khumalo | mandla.khumalo@email.co.za | 1006 |
| Busisiwe Zungu | busisiwe.zungu@email.co.za | 1007 |
| Themba Mthembu | themba.mthembu@email.co.za | 1008 |
| Zinhle Cele | zinhle.cele@email.co.za | 1009 |
| Lungile Hadebe | lungile.hadebe@email.co.za | 1010 |
| Refilwe Modise | refilwe.modise@email.co.za | 1011 |
| Mpho Radebe | mpho.radebe@email.co.za | 1012 |
| Karabo Seema | karabo.seema@email.co.za | 1013 |
| Thandeka Msimang | thandeka.msimang@email.co.za | 1014 |
| Bongani Mahlangu | bongani.mahlangu@email.co.za | 1015 |
| Nandi Zwane | nandi.zwane@email.co.za | 1016 |
| Siyabonga Mkhize | siyabonga.mkhize@email.co.za | 1017 |
| Keaobaka Tlou | keaobaka.tlou@email.co.za | 1018 |
| Lindiwe Mabuza | lindiwe.mabuza@email.co.za | 1019 |
| Tshepo Letsoalo | tshepo.letsoalo@email.co.za | 1020 |

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

EvidencePanel.tsx
CaseManagement.tsx
Timeline.tsx
Finally, the new SessionDetail.tsx

Authorization: Basic QUEyRDE2RDZFNjc3NEY3MEEwMkQxNjI2OTBGMDRGQkEtMDEtMjpfR3lrSUltb0R1RVFvakc1QVZ3ZCp4T0NVVUlIZA==


tokenID
AA2D16D6E6774F70A02D162690F04FBA-01-2


token secret
_GykIImoDuEQojG5AVwd*xOCUUIHd