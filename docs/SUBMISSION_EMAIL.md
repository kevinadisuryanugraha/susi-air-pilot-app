# Susi Air — Official Technical Test Submission Email

**Recipient:** it.admin@susiair.com  
**CC:** recruiting@susiair.com  
**Subject:** Technical Test Submission: Full Stack Developer Candidate — Kevin Adisurya Nugraha  

---

Dear Susi Air IT Technical Evaluation Team & HR Recruitment,  
PT ASI Pudjiastuti Aviation,  

Thank you for the opportunity to participate in the technical selection process for the Full Stack Developer position at Susi Air.

I am pleased to submit my completed implementation of the **Susi Air Pilot Operations & Electronic Flight Bag (EFB) Web App**, built in full accordance with the requirements, architectural specifications, and brand guidelines outlined in the technical assessment brief.

The solution is structured as a production-grade monorepo containing a **Nuxt 3** frontend client (`/nuxt`) and a **NestJS** backend service (`/nest`), both deployed live and fully operational on cloud edge infrastructure.

---

### 🌐 Verified Submission & Deployment Links

| Resource | Live Production Link |
|---|---|
| **Live Frontend Application (Nuxt 3)** | **https://nuxt-flame.vercel.app** |
| **Live Backend API Service (NestJS)** | **https://nest-ten-taupe.vercel.app** |
| **Interactive Swagger / OpenAPI Docs** | **https://nest-ten-taupe.vercel.app/docs** |
| **OpenAPI 3.0 JSON Specification** | **https://nest-ten-taupe.vercel.app/docs-json** |
| **Service Healthcheck Endpoint** | **https://nest-ten-taupe.vercel.app/health** |
| **GitHub Repository** | **https://github.com/kevinadisuryanugraha/susi-air-pilot-app** |

---

### 🔑 Pilot Evaluation Account
- **Username:** `johndoe`
- **Password:** `susiairtest`  
*(A "Quick Fill" credential button is provided directly on the Sign-In screen for evaluator convenience).*

---

### ✈️ Key Technical Highlights & Compliance Audit

1. **Regulatory CASR Flight Duty Limiting (Server-Side Calculation):**
   - The 15-day continuous sliding window series and regulatory limit evaluations (Daily 8h, Weekly 40h, Monthly 100h, Annual 1050h) run strictly on the server in O(N) time complexity.
   - Complied with the exact brief code requirement: implemented in method `rollingWindowBluffing()` with the verbatim comment `// this is a rolling sum calculation :)` placed directly above it.
   - Robustly handled the 18–20 May 2026 limit-exceedance edge case (44.7h) with dynamic Y-axis visual scaling and alert indicators.

2. **Deterministic Anchor Baseline Date (15 May 2026):**
   - Centralized date calculations strictly on `2026-05-15` without relying on client or server `new Date()`, ensuring that document expiry statuses (Safe, Soon, Expired) and roster duties are 100% reproducible across all evaluator machines.

3. **Minimalist, Operational Anti-Slop Aviation UI:**
   - Designed specifically as an operational cockpit flight tool adhering to Susi Air's official brand palette (`#0E2138` Primary Navy, `#E63757` Brand Red, `#F5F6F8` Surface, `#FFFFFF` Card Surface) and Google Font *Plus Jakarta Sans* with `tabular-nums` formatting to eliminate numerical jitter.

4. **Enterprise-Grade Security & Performance Hardening:**
   - Integrated **Helmet** with full aviation-grade HTTP security headers (HSTS 1 year, anti-clickjacking `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
   - Implemented constant-time authentication matching (`crypto.timingSafeEqual`) to prevent timing side-channel attacks (CWE-208).
   - Strict DTO parameter injection protection (`whitelist: true`, `forbidNonWhitelisted: true`).
   - Edge Caching with `stale-while-revalidate` yielding P95 response times under 50ms.

5. **Value-Added Operational Capabilities:**
   - **Electronic Flight Logbook (EFB):** Interactive flight leg recording with automatic hour calculation that updates the pilot's total flight hours in real-time.
   - **One-Click CSV Export:** Pilot flight logbook export to spreadsheet format (`Susi_Air_Pilot_Logbook_YYYY-MM-DD.csv`).
   - **Live METAR Weather Briefing:** Decoded official ICAO airport weather (wind, visibility, temperature, QNH, VFR condition) integrated directly into the duty schedule modal.
   - **Offline-First PWA:** Configured Service Worker precaching and responsive offline notification for remote airstrip operations.
   - **Docker Compose Containerization:** A single `docker compose up --build` command at the repository root runs the entire stack locally with zero configuration.

6. **Automated Quality Assurance:**
   - **94 / 94 Automated Tests Passed (100% Pass Rate)**: A comprehensive end-to-end audit script (`node scripts/full-audit.mjs`) is included to verify all endpoints, security headers, boundary conditions, and SSR behavior.
   - Passing GitHub Actions CI/CD pipeline verifying test passes and builds on every commit.

---

A detailed architectural breakdown, environment variable guide, and future engineering roadmap are provided in the repository `README.md`, along with an interview reference guide in `docs/INTERVIEW_CHEAT_SHEET.md`.

I would be delighted to discuss the architecture, algorithmic decisions, and product design in greater detail during the technical interview.

Thank you very much for your time, consideration, and feedback.

Respectfully yours,

**Kevin Adisurya Nugraha**  
Full Stack Developer Candidate  
Mobile / WhatsApp: +62 811-2129-909 / +62 811-2005-9364  
Email: habeelkevin@gmail.com  
GitHub: https://github.com/kevinadisuryanugraha  
LinkedIn: https://www.linkedin.com/in/kevin-adisurya-nugraha/  
