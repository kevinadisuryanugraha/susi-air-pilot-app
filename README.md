# Susi Air — Pilot Operations App (Technical Assessment)

> **Candidate:** Kevin Adisurya Nugraha  
> **Position:** Full Stack Developer Candidate  
> **Client:** PT ASI Pudjiastuti Aviation (Susi Air)  
> **Tech Stack:** Nuxt 3 (Composition API, Pinia, SCSS) + NestJS (Node.js, TypeScript)

---

## ✈️ Executive Summary

This repository contains the complete implementation of the **Susi Air Pilot Operations App**, designed as an operational mobile-first web tool for pilots to monitor flight schedules, track rolling flight hours against DGCA/CASR regulatory duty limits, and review legal aviation document validities.

The codebase is organized as a clean monorepo separating the backend API service (`/nest`) and the frontend client (`/nuxt`).

---

## 📁 Repository Structure

```text
SusiAir/
├── nest/                       # NestJS Backend REST API Service
│   ├── src/
│   │   ├── auth/               # JWT authentication & credentials guard
│   │   ├── pilot/              # Pilot profile & identity
│   │   ├── flight-hours/       # Rolling sum calculations & regulatory limit cards
│   │   ├── documents/          # Pilot document tracking & urgency thresholds
│   │   ├── schedules/          # Monthly duty calendar & legend
│   │   ├── data-store/         # In-memory mock data loader & indexer
│   │   ├── common/             # Filters, guards, constants, decorators
│   │   └── data/               # Seed JSON files (flight hours, documents, schedules)
│   ├── test/                   # Vitest unit test suite
│   └── package.json
│
├── nuxt/                       # Nuxt 3 Mobile Frontend Application
│   ├── components/             # Reusable UI components (Header, BottomNav, Chart, Calendar)
│   ├── pages/                  # Route screens (Login, Home, Schedule, Logbook, More)
│   ├── stores/                 # Pinia reactive state stores (Auth, FlightHours, Docs, Sched)
│   ├── middleware/             # Global route authentication guard
│   ├── assets/scss/            # Susi Air design tokens & operational styling
│   ├── public/images/          # Official Susi Air branding assets
│   └── package.json
│
├── docs/                       # Original Technical Test Brief & Mock Data
└── README.md                   # Technical documentation & architecture decisions
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20.x` or higher (tested on Node `v24.19.0`)
- **npm**: `v10.x` or higher

---

### 1. Backend Service (`/nest`)

```bash
cd nest

# Install dependencies
npm install

# Run unit tests
npm test

# Build production bundle
npm run build

# Start server (Runs on http://localhost:3001)
npm run start:prod
# or for development with hot-reload:
# npm run start:dev
```

### 2. Frontend Application (`/nuxt`)

Open a new terminal window:

```bash
cd nuxt

# Install dependencies
npm install

# Build production bundle
npm run build

# Start client server (Runs on http://localhost:3000)
npm run preview
# or for development with hot-reload:
# npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Account Credentials

| Attribute | Value |
|---|---|
| **Username** | `johndoe` |
| **Password** | `susiairtest` |

*(A quick-fill button is also provided directly on the Sign-In page for evaluator convenience).*

---

## ⚙️ Environment Variables

### Backend (`nest/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3001` | Port for the NestJS HTTP listener. |
| `JWT_SECRET` | `susiair-pilot-ops-secret-key-2026` | Secret key used to sign and verify bearer JWTs. |

### Frontend (`nuxt/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Base URL of the backend API service (replace with live backend URL in production). |

---

## 🏛️ Key Architectural Choices & Rationale

### 1. Server-Side Rolling Sum Calculation (`rollingWindowBluffing`)
* **Regulatory Compliance**: Civil Aviation Safety Regulations (CASR) define strict flight duty limits:
  * **Daily Limit**: 8 hours (Today only)
  * **Weekly Limit**: 40 hours (Rolling 7-day window)
  * **Monthly Limit**: 100 hours (Rolling 30-day window)
  * **Annual Limit**: 1,050 hours (Rolling 365-day window)
* **Design Decision**: All rolling sum calculations are performed strictly on the NestJS server inside `rollingWindowBluffing()` in O(N) sliding window time complexity. The frontend acts solely as a consumer of pure calculation results, preventing discrepancies between client-side clocks and official operational audit logs.
* **Comment & Method Name Requirement**: Complied with exact requirement:
  ```typescript
  // this is a rolling sum calculation :)
  rollingWindowBluffing(range: ChartRange = '1w'): FlightHoursSummaryResponse { ... }
  ```

### 2. Date Baseline Resolution (`2026-05-15`)
* Per the specification in Page 5 of the PDF brief:
  > *"Treat today as 15 May 2026 in your logic. Do not use new Date() to represent today. Hardcode it or make it configurable so the app behaves the same way when we review it."*
* The baseline is centralized in `AVIATION_CONSTANTS.DEFAULT_TODAY = '2026-05-15'` across the backend. All document expiry calculations (`daysRemaining`), schedule views, and chart bounds originate from this anchor date.

### 3. Edge-Case Resilience
* **Zero Flight Days**: Days with `0.0` hours flown are never skipped; they are accounted for in continuous chronological order.
* **Early Date Windows**: When querying dates near the beginning of the dataset (Dec 2024), missing dates prior to the earliest record safely contribute 0 hours without throwing `IndexOutOfBounds`.
* **Future Dates Projection**: For dates within the 15-day display window after today (16–22 May 2026), rolling sums calculate based on available recorded flight schedules.
* **Limit Exceedance**: Between 18–20 May 2026, the 7-day rolling sum reaches up to 44.7 hours (exceeding the 40-hour limit). The chart dynamically scales with Y-Max margins so values above the limit line render clearly with red warning highlights without breaking mobile layout.

### 4. Anti-Slop Aviation Operational UI
* The application rejects generic gradient templates in favor of a clean, utilitarian cockpit interface inspired by Susi Air's operational identity:
  * **Palette**: Primary Navy `#0E2138`, Susi Brand Red `#E63757`, Neutral Surface `#F5F6F8`, Card `#FFFFFF`, Accent Cyan `#22C5E8`.
  * **Typography**: Google Fonts *Plus Jakarta Sans* with `tabular-nums` formatting to ensure numerical flight times do not jitter when data updates.
  * **Micro-interactions**: Visual status badges for documents (`Safe` in green, `Soon` in amber, `Expired` in red), checkmark indicators (✔) when scheduled duties match logged flights, and intuitive month-by-month calendar navigation.

---

## 🧪 Automated Testing

Comprehensive unit tests have been written with **Vitest**:
- `flight-hours.service.spec.ts`: Validates rolling window sums, card limits, 15-point series layout, and range toggle scaling.
- `auth.service.spec.ts`: Validates credential matching, JWT issuance, and rejection of invalid passwords.
- `documents.service.spec.ts`: Validates document urgency classifications against the 30-day warning threshold.
- `schedules.service.spec.ts`: Validates monthly schedule retrieval, legend mapping, and completed vs. pending duty status counters.

Run the test suite:
```bash
cd nest && npm test
```

---

## 🌐 Deployment Instructions

### Deploy Backend (`/nest`) to Railway / Render / Fly
1. Connect your repository to Railway or Render.
2. Set **Root Directory** to `nest`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Start Command** to `npm run start:prod`.
5. Expose `PORT` (e.g. `3001`). Note down the assigned public URL (e.g. `https://susiair-api.onrender.com`).

### Deploy Frontend (`/nuxt`) to Vercel / Netlify
1. Connect your repository to Vercel or Netlify.
2. Set **Root Directory** to `nuxt`.
3. Framework Preset: **Nuxt.js**.
4. Configure Environment Variable:
   - `NUXT_PUBLIC_API_BASE` = `https://your-nest-backend.railway.app` (your live backend URL).
5. Deploy.

---

## 🔮 What We Would Enhance With More Time

1. **Persistent Relational Database**: Migrate in-memory JSON seeding to PostgreSQL with Prisma ORM, introducing migrations, audit trails, and multi-tenant pilot records.
2. **Offline-First PWA (Progressive Web App)**: Implement service worker caching and IndexedDB queueing, enabling bush pilots operating in remote Indonesian airstrips (Papua, Maluku) with low/no satellite connectivity to access schedules offline and sync flight hours upon landing.
3. **Electronic Flight Logbook (EFB)**: Build out the Logbook screen with GPS route verification, fuel burn calculation, and digital pilot sign-off with biometric authentication.
4. **WebSocket Live Dispatch Roster**: Integrate NestJS WebSockets (`@nestjs/websockets`) to push real-time schedule modifications directly to the pilot's device when flight dispatchers reassign aircraft or routes due to weather changes.

---

*PT ASI Pudjiastuti Aviation (Susi Air) Technical Assessment · Submitted with Excellence by Kevin Adisurya Nugraha.*
