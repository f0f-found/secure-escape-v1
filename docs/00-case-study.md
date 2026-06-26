# Secure Escape — Case Study

## 1. Overview

Secure Escape is a duress-detection layer integrated into a banking application. It is presented as a feature already adopted by a partner bank — the system is demonstrated as part of a live banking app ecosystem, not as a standalone product.

The application allows a bank customer to silently signal that they are being coerced into making a banking transaction, without alerting the person coercing them. The system responds by activating a protective mode that limits financial exposure, alerts the bank's fraud team, and preserves evidence for law enforcement — all while the banking app continues to function and look completely normal to an observer.

## 2. Problem Statement

Traditional banking authentication answers one question: *is this the correct user?* It does not ask the more important question in a coercion scenario: *is this user safe?*

Existing banking security assumes that a correct PIN or password means a legitimate, voluntary transaction. This assumption fails in cases of robbery, kidnapping, domestic abuse, or any scenario where a customer is forced to authenticate and transact under threat. In these situations, the customer has no safe way to signal distress — triggering a visible alarm, refusing to comply, or behaving suspiciously can escalate the danger they are in.

South Africa has well-documented patterns of this risk, including ATM-adjacent crime and forced bank transfers facilitated by features such as instant cash-send services, which leave minimal trace and are difficult to reverse once redeemed.

## 3. Objective

The system was built to answer the question traditional banking does not ask, while satisfying three constraints simultaneously:

1. The app must behave identically whether the user is safe or under duress — no visual or behavioural difference an observer could detect.
2. The user must be able to signal duress using an action indistinguishable from normal use — entering a PIN.
3. The bank's fraud team and, where appropriate, law enforcement must be notified and equipped to respond without requiring the user to take any further risk.

## 4. Solution Summary

Secure Escape introduces a second, secret PIN — the duress PIN — alongside the user's normal PIN. Both PINs open the banking app identically. The difference is invisible to the user interface and entirely handled by the backend:

- **Normal PIN** → standard session, real account data, full functionality.
- **Duress PIN** → duress session, decoy account data, silent fraud alert, location capture, and notification of the bank's fraud team — all without any visible change to the app.

During a duress session, the system enforces a pre-configured **decoy profile**, which acts as a hard ceiling on how much real money can be extracted before the system intervenes — without ever appearing to block or delay the transaction, since either behaviour could expose the user to further danger. Where a hard limit cannot be enforced safely, transactions are instead allowed to proceed normally and are silently flagged for inter-bank fraud cooperation, so funds can be frozen and recovered after the fact rather than putting the user at risk by stopping the transaction outright.

## 5. System Components

The solution consists of three integrated applications sharing one backend:

- **Mobile banking app** (React Native / Expo) — the customer-facing application, indistinguishable in appearance and behaviour regardless of session mode.
- **Backend API** (ASP.NET Core / .NET 8) — owns all business logic, including authentication, risk evaluation, decoy enforcement, and fraud alerting.
- **Fraud team dashboard** (React) — an internal tool for bank staff to monitor live duress alerts, review session and location evidence, and record response actions.

## 6. Why This Matters

Secure Escape does not attempt to prevent a coerced transaction outright — refusing or visibly delaying a transaction under duress can place the user in greater physical danger. Instead, the system is designed around damage limitation and evidence preservation: capping financial exposure where it can be done invisibly, and ensuring that when it cannot, the bank and authorities have what they need to respond and recover funds after the immediate threat has passed.

In short: traditional banking asks if the user is legitimate. Secure Escape also asks if the user is safe.