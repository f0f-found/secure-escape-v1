# Secure Escape — System Design Document (SDD)

## 1. Introduction

* Purpose
* Scope
* Intended Audience
* Definitions and Acronyms

---

## 2. System Overview

Describe the overall architecture and explain how the three applications work together.

Include:

* Mobile Banking App (React Native / Expo)
* Backend API (ASP.NET Core .NET 8)
* Fraud Dashboard (React)
* MySQL Database

A simple architecture diagram would go here.

```
                Customer
                   │
                   ▼
        Mobile Banking App
        (React Native/Expo)
                   │
              HTTPS REST API
                   │
                   ▼
      ASP.NET Core Backend (.NET 8)
     ┌───────────┬─────────────┬─────────────┐
     │           │             │
 Authentication  Fraud Engine  Notification Service
     │           │             │
     └───────────┴─────────────┘
                   │
              Entity Framework
                   │
                   ▼
              MySQL Database
                   ▲
                   │
          Fraud Dashboard (React)
```

---

# 3. Design Goals

* Customer safety first
* No visible indication of duress mode
* High availability
* Secure communications
* Auditability
* Scalable architecture
* Separation of concerns

---

# 4. Technology Stack

## Frontend

* React Native
* Expo
* React Navigation
* Axios

## Dashboard

* React
* TypeScript
* Tailwind CSS
* React Router

## Backend

* ASP.NET Core 8
* Entity Framework Core
* JWT Authentication
* AutoMapper
* FluentValidation

## Database

* MySQL
* Entity Framework Migrations

---

# 5. High-Level Architecture

Describe each layer.

## Presentation Layer

* Mobile App
* Fraud Dashboard

Responsibilities:

* Display information
* User interaction
* Input validation

---

## Business Layer

Contains:

* AuthService
* AccountService
* TransactionService
* AdminAlertService
* NotificationService
* AuditService

Responsibilities:

* Business rules
* Risk evaluation
* Alert generation
* Session handling

---

## Data Layer

Repositories

Entity Framework

Database

---

# 6. Module Design

Separate each module.

Example:

## Authentication Module

Responsibilities

* Login
* JWT generation
* PIN verification
* Duress PIN verification

Inputs

Outputs

Dependencies

---

## Transaction Module

Responsibilities

* Process transactions
* Apply decoy profile
* Generate fraud events

---

## Alert Module

Responsibilities

* Create alerts
* Update status
* Notify fraud analysts

---

## Dashboard Module

Responsibilities

* Display active alerts
* Search
* Filtering
* Investigation workflow

---

## Audit Module

Responsibilities

* Log every action
* Record analyst activity
* Store timestamps

---

# 7. Database Design

This becomes your ERD section.

Include your entities.

* Users
* Accounts
* Sessions
* Transactions
* FraudAlerts
* AlertActions
* LocationEvents
* AuditLogs
* NotificationAttempts

Show relationships.

---

# 8. API Design

Example:

POST

```
/api/auth/login
```

POST

```
/api/auth/setup-duress-pin
```

POST

```
/api/transactions
```

GET

```
/api/admin/alerts
```

GET

```
/api/admin/alerts/{id}
```

PATCH

```
/api/admin/alerts/{id}
```

etc.

---

# 9. Security Design

Authentication

JWT Tokens

Role-Based Authorization

Roles:

* Customer
* Fraud Analyst
* Fraud Manager
* Administrator

Encryption

Password Hashing

HTTPS

Audit Logging

Input Validation

---

# 10. Sequence Diagrams

One of the strongest parts of the report.

Include diagrams for:

* Normal Login
* Duress Login
* Transaction Flow
* Fraud Alert Generation
* Fraud Investigation

---

# 11. Activity Diagrams

Examples:

Customer Login

↓

PIN Validation

↓

Normal?

↓

Duress?

↓

Alert

↓

Dashboard

↓

Investigation

---

# 12. Class Diagrams

Your main classes.

Example:

```
AuthService

TransactionService

AlertService

AuditService

NotificationService

AdminAlertService
```

Along with your models.

---

# 13. Error Handling

Authentication failures

Network failures

Database failures

Notification failures

Location unavailable

---

# 14. Deployment Architecture

Azure

```
React Dashboard
        │
        ▼
Azure App Service
        │
ASP.NET API
        │
Azure MySQL
```

Mobile App communicates via HTTPS.

---

# 15. Future Improvements

* Push notifications
* AI fraud prediction
* Machine learning risk scoring
* Offline evidence caching
* Multi-bank support
* SIEM integration
* Emergency services integration

---

1. Business Analysis Document
2. Software Requirements Specification (SRS)
3. System Design Document (SDD)
4. Database Design (ERD & Data Dictionary)
5. UML Diagrams (Use Case, Class, Sequence, Activity)
6. API Specification (OpenAPI/Swagger or endpoint documentation)
7. Test Plan
8. Test Cases
9. User Manual
10. Deployment Guide
11. Maintenance & Operations Guide
12. Project Reflection / Lessons Learned

