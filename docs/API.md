# API Reference — Northgate Dental Live Build

> **Demo notice:** This API does not exist in the concept/demo version. All behaviour is simulated client-side. This document defines the **production API contract** for the live integration layer described in TRD §11.

---

## Overview

| Property | Value |
|---|---|
| Base URL | `https://api.northgatedental.co.uk/v1` |
| Protocol | HTTPS only |
| Format | JSON (`Content-Type: application/json`) |
| Auth | Bearer token (practice-side) / Public endpoint + Turnstile (patient-side) |
| References | `NGD-XXXXX` format (5 uppercase base-36 chars — matches the demo) |
| Idempotency | Required on create calls via `Idempotency-Key` header |

---

## Authentication

```http
Authorization: Bearer <API_KEY>
```

Patient-facing form endpoints use a **public endpoint** (no Bearer key) protected by:
- Cloudflare Turnstile (bot protection)
- Rate limiting: 60 submissions/hour per IP
- Honeypot field validation

---

## Endpoints

### `POST /appointment-requests`

Create a new appointment request from a patient.

**Headers:**
```
Content-Type: application/json
Idempotency-Key: <uuid-v4>          (required — prevents duplicate submissions)
CF-Turnstile-Token: <turnstile-token>   (required — from Cloudflare widget)
```

**Request body:**
```json
{
  "name":        "Sarah Ahmed",
  "phone":       "07700 900123",
  "treatmentId": "checkup-hygiene",
  "clinicianId": "first-available",
  "date":        "2026-12-15",
  "time":        "09:00",
  "notes":       "Nervous patient, haven't been in 3 years"
}
```

**201 Created:**
```json
{
  "reference":    "NGD-K7M2X",
  "status":       "requested",
  "message":      "Your appointment request has been received. We will confirm your slot within 2 hours.",
  "submittedAt":  "2026-12-10T14:32:00Z"
}
```

**422 Unprocessable Entity:**
```json
{
  "error":  "VALIDATION_ERROR",
  "fields": {
    "phone": "Phone number must be a valid UK mobile or landline number.",
    "date":  "Date must be a future weekday (Monday–Saturday)."
  }
}
```

**429 Too Many Requests:**
```json
{
  "error":       "RATE_LIMIT_EXCEEDED",
  "retryAfter":  3600
}
```

---

### `GET /availability`

Returns bookable time slots for a clinician on a given date. Replaces static `<option>` list in the demo.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `clinicianId` | string | Yes | Clinician ID or `first-available` |
| `date` | string (ISO 8601 `YYYY-MM-DD`) | Yes | Date to check |
| `treatmentId` | string | No | Filters slots by treatment duration |

**Request:**
```http
GET /availability?clinicianId=dr-patel&date=2026-12-15&treatmentId=checkup-hygiene
```

**200 OK:**
```json
{
  "clinicianId":   "dr-patel",
  "clinicianName": "Dr Patel",
  "date":          "2026-12-15",
  "slots": [
    { "time": "09:00", "available": true  },
    { "time": "10:30", "available": false },
    { "time": "12:00", "available": true  },
    { "time": "14:15", "available": true  },
    { "time": "16:00", "available": false },
    { "time": "17:30", "available": true  }
  ]
}
```

---

### `POST /appointment-requests/{reference}/confirm`

Practice-side confirmation of a request. Triggers SMS to the patient.

**Path parameter:** `reference` — e.g. `NGD-K7M2X`

**Request body:**
```json
{
  "confirmedDate":  "2026-12-15",
  "confirmedTime":  "09:00",
  "clinicianId":    "dr-patel",
  "practiceNote":   "Please arrive 10 minutes early to complete new patient registration forms."
}
```

**200 OK:**
```json
{
  "reference":    "NGD-K7M2X",
  "status":       "confirmed",
  "smsSent":      true,
  "confirmedAt":  "2026-12-10T16:45:00Z"
}
```

---

## Reference Data

### Treatment IDs

| `treatmentId` | Display Name | Typical Duration |
|---|---|---|
| `checkup-hygiene` | Check-up & hygiene | 45 min |
| `teeth-whitening` | Teeth whitening | 60 min |
| `invisalign` | Invisalign® aligners | 60 min (consultation) |
| `implants-crowns` | Implants & crowns | 90 min |
| `childrens-dentistry` | Children's dentistry | 30 min |
| `emergency-care` | Emergency care | 30 min (priority slot) |

### Clinician IDs

| `clinicianId` | Display Name |
|---|---|
| `first-available` | First available |
| `dr-patel` | Dr Patel |
| `dr-okafor` | Dr Okafor |
| `dr-lindqvist` | Dr Lindqvist |

### Appointment Status Values

| Status | Meaning |
|---|---|
| `requested` | Submitted by patient, awaiting practice review |
| `confirmed` | Practice has confirmed the slot; SMS sent to patient |
| `cancelled` | Cancelled by patient or practice |
| `completed` | Appointment attended |
| `dna` | Did-not-attend |

---

## Error Codes

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON or missing required headers |
| 422 | `VALIDATION_ERROR` | Field-level validation failure |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests from this IP |
| 409 | `DUPLICATE_REQUEST` | Idempotency key already used |
| 503 | `DIARY_UNAVAILABLE` | PMS/diary integration temporarily unavailable |

---

*SPManchester Private Limited — [spmanchester.com](https://spmanchester.com/) — [info@spmanchester.com](mailto:info@spmanchester.com)*
