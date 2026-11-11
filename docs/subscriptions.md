# MinnaUz 2.0 — Subscriptions & Billing

This document outlines the subscription lifecycles, billing frequencies, and planned payment gateway integration architecture.

---

## 1. Subscription Tiers & Billing Frequencies

| Package | Duration | Target Audience | Benefits |
|---|---|---|---|
| **Monthly (Oylik)** | 1 Month | Learners testing the platform | Flexible, cancel anytime |
| **Quarterly (3 Oylik)** | 3 Months | Intermediate learners targeting single JLPT level | 15% discount |
| **Annual (Yillik)** | 12 Months | Serious students targeting N5 to N3 progression | 35% discount + AI bonus tokens |

---

## 2. Subscription Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Inactive : Account Created
    Inactive --> Active : Payment Succeeded
    Active --> Active : Renewal Succeeded
    Active --> PastDue : Payment Failed (Grace Period 3 Days)
    PastDue --> Active : Retry Payment Succeeded
    PastDue --> Expired : Grace Period Expired
    Active --> Canceled : User Cancels Auto-renew
    Canceled --> Expired : Period End Reached
    Expired --> Active : Resubscribed
```

### Status Definitions:
- **`ACTIVE`**: User enjoys full Premium Pro benefits.
- **`PAST_DUE`**: Automated card charge failed; a 3-day grace period is granted before feature restriction.
- **`CANCELED`**: Auto-renew disabled; access remains until the current billing cycle expires.
- **`EXPIRED`**: Period ended without renewal; account gracefully downgrades to Free tier.

---

## 3. Payment Gateway Architecture (Uzbekistan & Global)

Payment integration connects national payment providers via webhook listeners:

```text
Student -> Next.js Frontend -> Backend API -> Payment Provider (Payme / Click / Uzum / Stripe)
                                    ^                      |
                                    |--- Webhook Callback -|
```

### Supported Payment Providers:
1. **Payme (Merchant API)** — Card-to-card and QR checkout in UZS.
2. **Click (Click Pass & Merchant)** — Local mobile banking integration.
3. **Uzum Bank / Pay** — Ecosystem integration for Uzbek users.
4. **Stripe / Visa / Mastercard** — International student subscriptions.

---

## 4. Webhook Handling & Idempotency Rules

- **Signature Verification**: Every webhook callback must verify HMAC SHA256 signatures before processing state changes.
- **Idempotency**: Webhook events check for unique transaction IDs to avoid duplicate subscription credit.
- **Receipts**: Automated confirmation notification sent to `UserNotification` inbox and student email upon successful transaction.

## Optional Longplay Kaiwa admission

The existing `POST /ai/kaiwa` route can check a Longplay access Feature before calling the model. `LONGPLAY_KAIWA_FEATURE_ID` unset preserves current behavior with no billing network call. To opt in, configure that Feature UUID, server-only `LONGPLAY_SECRET_KEY`, `LONGPLAY_BASE_URL`, `LONGPLAY_APP_ID` and explicit `LONGPLAY_ENVIRONMENT` (`sandbox` or `live`). SDK 0.10.15 is pinned and requires Node.js 22 or newer; its ESM server entry is loaded through native dynamic import in the Nest NodeNext build.

Enabled requests require the existing verified JWT user. The server resolves `minnauz:user:<user-id>`; the caller cannot supply a billing Customer. Missing authentication is 401, denied access is 402, and configuration/service failure is a sanitized 503. Checks happen before Kaiwa model work and do not send lesson text, prompts, answers or model credentials to billing.

This slice covers Kaiwa only. Translation, explanations and Dokkai retain their current behavior. It does not enable checkout, turn the demo `simulate-payment` route into verified payment, reserve credits or implement monthly allowances. Reconcile valid manual grants, payment-provider eligibility, actual purchase/webhook lifecycle and SDK usage terms before enabling a commercial pilot.
