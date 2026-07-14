# Secure Escape — Software Requirements Specification (SRS)

**Version:** 1.0
**Project:** Secure Escape
**Prepared By:** Rorisang Putu
**Document Type:** Software Requirements Specification (SRS)

---

# 1. Introduction

## 1.1 Purpose

The purpose of this document is to define the functional and non-functional requirements for Secure Escape, a duress-detection banking solution designed to allow customers to silently signal that they are operating under coercion while continuing to use their banking application normally.

The system enables fraud teams to receive real-time alerts, investigate incidents, monitor customer activity, and coordinate response actions without increasing risk to the customer.

---

## 1.2 Scope

Secure Escape is integrated into a banking ecosystem and consists of three primary applications:

* Mobile Banking Application
* Backend API
* Fraud Monitoring Dashboard

The system allows customers to authenticate using either a normal PIN or a secret duress PIN.

When a duress PIN is entered:

* The application behaves normally.
* A duress session is created.
* Fraud alerts are generated.
* Location and device information are captured.
* Fraud analysts receive real-time notifications.
* Evidence is preserved for investigation.

---

## 1.3 Intended Audience

This document is intended for:

* Software Developers
* System Architects
* Test Engineers
* Product Owners
* Business Analysts
* Fraud Operations Teams
* Project Stakeholders

---

# 2. Overall Description

## 2.1 Product Perspective

Secure Escape operates as an extension of an existing banking platform.

The system introduces:

* Duress-aware authentication
* Fraud monitoring capabilities
* Incident investigation workflows
* Evidence collection services

The solution does not replace existing banking functionality and instead integrates into existing authentication and transaction workflows.

---

## 2.2 Product Objectives

The system shall:

* Allow customers to silently indicate danger.
* Notify fraud teams in real time.
* Preserve evidence for investigation.
* Reduce financial exposure where possible.
* Support incident escalation and response.

---

## 2.3 User Classes

### Customer

A banking customer using the mobile application.

Responsibilities:

* Authenticate using PIN.
* Perform banking transactions.
* Configure duress settings.

---

### Fraud Analyst

Internal bank employee responsible for monitoring alerts.

Responsibilities:

* Review active incidents.
* Assess risk.
* Record investigation notes.
* Escalate cases.

---

### Fraud Manager

Supervisory role.

Responsibilities:

* Manage fraud operations.
* Review analyst actions.
* Generate reports.

---

### System Administrator

Responsible for system maintenance.

Responsibilities:

* Manage users.
* Configure permissions.
* Monitor system health.

---

# 3. System Architecture

The system consists of three major components:

## Mobile Banking App

Technology:

* React Native
* Expo

Responsibilities:

* Authentication
* Banking operations
* Duress PIN setup
* Location permission management

---

## Backend API

Technology:

* ASP.NET Core (.NET 8)

Responsibilities:

* Authentication
* Session management
* Alert generation
* Risk evaluation
* Transaction monitoring
* Notification processing

---

## Fraud Dashboard

Technology:

* React
* TypeScript

Responsibilities:

* Alert monitoring
* Investigation workflows
* Incident management
* Reporting

---

# 4. Functional Requirements

---

# FR-1 User Authentication

## Description

The system shall authenticate customers using either a normal PIN or a duress PIN.

### Inputs

* Account Number
* PIN

### Outputs

* Authenticated Session

### Acceptance Criteria

* Normal PIN creates standard session.
* Duress PIN creates duress session.
* Authentication response time < 3 seconds.

---

# FR-2 Duress PIN Configuration

## Description

The system shall allow customers to configure a secret duress PIN.

### Acceptance Criteria

* Duress PIN stored securely.
* Duress PIN differs from normal PIN.
* Customer can update duress PIN.

---

# FR-3 Duress Session Creation

## Description

The system shall create a duress session whenever a duress PIN is entered.

### Acceptance Criteria

* Session flagged as DURESS.
* Session timestamp recorded.
* Device information recorded.
* Location information recorded.

---

# FR-4 Fraud Alert Generation

## Description

The system shall automatically generate an alert when a duress session begins.

### Acceptance Criteria

* Alert created immediately.
* Alert visible on dashboard.
* Alert assigned severity level.

---

# FR-5 Location Tracking

## Description

The system shall collect customer location information during duress sessions.

### Acceptance Criteria

* Latitude recorded.
* Longitude recorded.
* Timestamp recorded.
* Location updates logged.

---

# FR-6 Device Evidence Collection

## Description

The system shall record device information for investigative purposes.

### Acceptance Criteria

System records:

* Device ID
* Device Type
* Operating System
* IP Address

---

# FR-7 Transaction Monitoring

## Description

The system shall monitor all transactions performed during a duress session.

### Acceptance Criteria

* Transaction amount recorded.
* Recipient information recorded.
* Transaction timestamp recorded.

---

# FR-8 Decoy Profile Enforcement

## Description

The system shall apply a configured decoy profile during a duress session.

### Acceptance Criteria

* Decoy profile automatically activated.
* Profile configuration loaded successfully.
* Customer experience remains unchanged.

---

# FR-9 Fraud Dashboard

## Description

Fraud analysts shall be able to monitor active duress incidents.

### Dashboard Features

* Alert List
* Alert Details
* Customer Information
* Location Timeline
* Transaction Timeline
* Notes Section

---

# FR-10 Alert Investigation

## Description

Fraud analysts shall be able to investigate alerts.

### Acceptance Criteria

Analysts can:

* View evidence
* Add notes
* Update status
* Escalate incidents

---

# FR-11 Incident Escalation

## Description

The system shall support escalation workflows.

### Escalation Types

* Fraud Team Lead
* Security Operations
* Law Enforcement

---

# FR-12 Audit Logging

## Description

The system shall maintain a complete audit trail.

### Acceptance Criteria

The system records:

* User actions
* Analyst actions
* Status changes
* Escalations
* Login events

---

# FR-13 Notifications

## Description

The system shall notify fraud teams when new incidents occur.

### Notification Channels

* Dashboard Alerts
* Email
* SMS (optional)

---

# 5. Non-Functional Requirements

# NFR-1 Performance

### Authentication

* Response time ≤ 3 seconds

### Dashboard Loading

* Initial load ≤ 5 seconds

### Alert Generation

* Alert creation ≤ 2 seconds

---

# NFR-2 Availability

The system shall maintain:

* 99.9% uptime

excluding scheduled maintenance.

---

# NFR-3 Reliability

The system shall:

* Recover from failures automatically.
* Prevent alert data loss.
* Preserve evidence records.

---

# NFR-4 Scalability

The system shall support:

* 100,000+ registered customers
* 10,000 concurrent sessions
* Multiple banking institutions

---

# NFR-5 Security

The system shall:

* Encrypt all data in transit.
* Encrypt sensitive data at rest.
* Enforce role-based access control.
* Require authenticated access to dashboards.

---

# NFR-6 Maintainability

The system shall:

* Support modular architecture.
* Provide structured logging.
* Support automated deployment pipelines.

---

# NFR-7 Usability

The mobile application shall:

* Remain visually identical in normal and duress modes.
* Require minimal user training.

The fraud dashboard shall:

* Be intuitive for fraud analysts.
* Support investigation workflows efficiently.

---

# 6. Data Requirements

## Customer

| Field         | Type   |
| ------------- | ------ |
| CustomerId    | UUID   |
| AccountNumber | String |
| FullName      | String |
| Email         | String |
| PhoneNumber   | String |

---

## Duress Profile

| Field         | Type    |
| ------------- | ------- |
| ProfileId     | UUID    |
| CustomerId    | UUID    |
| DuressPinHash | String  |
| IsEnabled     | Boolean |

---

## Duress Session

| Field       | Type     |
| ----------- | -------- |
| SessionId   | UUID     |
| CustomerId  | UUID     |
| StartTime   | DateTime |
| EndTime     | DateTime |
| SessionType | Enum     |

---

## Fraud Alert

| Field     | Type     |
| --------- | -------- |
| AlertId   | UUID     |
| SessionId | UUID     |
| Severity  | Enum     |
| Status    | Enum     |
| CreatedAt | DateTime |

---

## Investigation Note

| Field     | Type     |
| --------- | -------- |
| NoteId    | UUID     |
| AlertId   | UUID     |
| AnalystId | UUID     |
| Content   | Text     |
| CreatedAt | DateTime |

---

# 7. Assumptions

* Customers possess compatible mobile devices.
* Location permissions have been granted.
* Fraud analysts have dashboard access.
* Network connectivity is available.
* Banking authentication infrastructure already exists.

---

# 8. Constraints

* Mobile application behaviour must remain identical during normal and duress sessions.
* Fraud alerts must not be visible to customers.
* The system must integrate with existing banking infrastructure.
* Customer safety takes precedence over transaction interruption.

---

# 9. Success Criteria

The project shall be considered successful when:

* Duress sessions are detected accurately.
* Fraud alerts are generated in real time.
* Analysts can investigate incidents efficiently.
* Evidence is captured and preserved.
* Customer safety is improved without impacting normal banking operations.

---

# 10. Future Enhancements

* AI-powered risk scoring
* Behavioural anomaly detection
* Geofencing alerts
* Cross-bank fraud intelligence sharing
* Emergency contact integration
* Predictive fraud analytics
* Real-time law enforcement integration

This SRS would typically be followed by the **System Design Document (SDD)**, which describes the architecture, database design, API specifications, UML diagrams, workflows, and implementation details.
