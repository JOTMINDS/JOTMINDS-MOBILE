# Webapp → Mobile Parity Gap Analysis

**Date:** 2026-09-01
**Mobile HEAD:** `809ec9c` (last real feature port: `3b2eccb`, 2026-07-15)
**Webapp analysed:** `JOTMINDS/JOTMINDS-WEBAPP` @ `6c82d71` (2026-08-28)
**Divergence window:** 2026-07-15 → 2026-08-28 — ~152 webapp commits, ~50 feature/refactor.

---

## Implementation status (2026-09-01)

| Step | Status | Branch |
|---|---|---|
| A1 — pro match-score formula sync | ✅ done | `webapp-parity-sync` |
| A2 — re-diff other shared scorers | ✅ done (no drift) | — |
| B — JTIA (data + scoring + screens + teacher wiring) | ✅ done | `jtia-teacher-assessment` |
| C1 — `aiService` shim over `/ai/*` | ✅ done | `ai-layer-ask-jotti` |
| C2 — Ask Jotti chat + dashboard entry points | ✅ done | `ai-layer-ask-jotti` |
| C3 — nudges | ⏸ deferred — needs the webapp's `engagementTracking` layer, which mobile lacks | — |
| C4 — replace static tips/strategies with AI | ⏸ incremental, per-surface follow-up | — |
| D1 — student-code sign-in | ✅ done | `webapp-parity-sync` |
| D2 — surface generated student code after signup + on profile | ✅ done | `webapp-parity-sync` |
| D3 — CSV upload / class mgmt / super admin | ❌ web-only, out of scope | — |

---

## 0. Key finding: the backend is shared

Both apps point at the **same Supabase project** (`femvnconxoefpctiptkj`) and the **same edge function** (`make-server-fc8eb847`).
Mobile's `src/utils/supabase.ts` `EDGE_FN_URL` == webapp's server mount prefix.

**Consequence:** every server-side change the webapp shipped in this window is *already live for mobile*. That includes:

| Server capability added | Route (live now) | Mobile impact |
|---|---|---|
| Structured AI endpoints | `POST /ai/chat`, `/ai/generate-insights`, `/ai/coach-chat`, `/ai/generate-jtia-insights`, `/ai/generate-school-insights`, `/ai/generate-lesson-plan` | Mobile can call these today; no backend work |
| Institutional student codes | `POST /institutions/validate-code`, `/student-code/validate`, `/student-code/signin`, `/student-code/revoke` | Mobile just needs client wiring + UI |
| JTIA result storage | `assessmentType: 'jtia'` accepted by `/assessment/submit`, `/assessment/results/:type`, `/assessment/progress` | JTIA results are interchangeable with webapp once mobile submits them |
| OpenAI/Gemini keys | hardcoded + env in `ai-routes.tsx` | no secret handling needed on mobile |

So **all four porting areas are client-only work.** No new tables, no new edge functions.

The one wrinkle: the webapp's `src/app/utils/aiService.ts` talks to a **Cloudflare Pages Function** (`/api/openai`), which is a raw OpenAI passthrough that only exists in the web deployment. Mobile cannot use it. Mobile's AI service must target the Supabase `/ai/*` routes instead (already deployed, see table above).

---

## Area A — Scoring engine drift

Mobile's `src/utils/*Scoring.ts` files are labelled "verbatim port of the webapp's ...". Since the port, the webapp changed **one** pure-logic scoring file. Everything else in the Aug-19 "scoring fix" commit series (`c815298`, `d4df0ff`, `1ad6028`, `cfcf9b8`, `44c5269`, `6594c22`, `f987a9b`, `e30ba01`, `ea570cf`) landed in **`SupervisorDashboard.tsx` / `ProfessionalDashboard.tsx` (web-only recruiter views)** or in **server `index.tsx` (already live)** — not in shared logic.

### A1. `professionalCognitiveScoring.ts` — `calculateMatchScore()` formula changed
**Webapp commit:** `c815298`
**Webapp:** `src/app/utils/professionalCognitiveScoring.ts:267`
**Mobile:** [src/utils/professionalCognitiveScoring.ts](src/utils/professionalCognitiveScoring.ts)

```diff
- const balanceBonus = Math.max(0, 10 - (variance / 2));
- return Math.min(99, Math.round(baseScore + balanceBonus));
+ const balanceBonus = Math.max(0, 6 - (variance / 4));
+ return Math.max(50, Math.min(98, Math.round(baseScore + balanceBonus)));
```

Effect: smaller balance bonus, hard floor of 50, ceiling 98 (was 99). Mobile currently produces higher and occasionally-lower match scores than the webapp for the same responses — results are **not** interchangeable until this is synced.

- **Effort:** ~15 min (2-line change + update `src/utils/__tests__/` expectations).
- **Risk:** low. Pure function, well covered by tests.

### A2. Verify the other "verbatim" scorers are still in sync
`scoring.ts`, `shsScoring.ts`, `jhsScoring.ts`, `adultScoring.ts`, `teachingStyleScoring.ts` — diffed, **no algorithmic drift** in the window (only the mobile-side header comments and RN import shims differ). No action, but worth a re-diff at port time.

- **Effort:** ~30 min re-diff pass.

---

## Area B — JTIA (JotMinds Teacher Intelligence Assessment)

The webapp **replaced** the legacy teaching-style assessment with JTIA across all educator views (`0e1b94d` "completely remove legacy teaching-style assessment", `f27ad7c`, `c923542` "18 platform enhancements"). Mobile still ships the **old** `teachingStyle*` flow (`TeachingStyleAssessmentScreen`, `TeachingStyleResultsScreen`, `TeacherDevelopmentScreen`, `utils/teachingStyleScoring.ts`, `utils/teachingStyleStatus.ts`, `data/teachingStyleQuestions.ts`).

### What JTIA is
- 5 domains: Cognitive, Instructional, Classroom Leadership, Relationship, Professional Intelligence.
- ~120-item bank, sub-competencies per domain.
- **12 / 60 / 120 question** length selector ("Quick Snapshot" / "Standard" / "Full").
- Pure scoring → domain scores, sub-competency scores, top-5 strengths, bottom-4 growth areas, overall score, **static** development recommendations (resources / activities / coaching / pathways).
- Optional AI overlay via `POST /ai/generate-jtia-insights` (live).

### Files to port
| Webapp source | LOC | Portability | Mobile target |
|---|---|---|---|
| `src/app/utils/jtiaQuestions.ts` | 1027 | copy as-is (pure data) | `src/data/jtiaQuestions.ts` |
| `src/app/utils/jtiaScoring.ts` (`calculateJTIAScore`, `generateSchoolJTIAInsights`) | ~340 | copy as-is — pure, only imports `jtiaQuestions` | `src/utils/jtiaScoring.ts` |
| `src/app/utils/jtiaExpandedItemBank.ts` | 37KB | copy if the 120-item mode pulls from it | `src/data/` |
| `src/app/components/JTIAAssessmentTaking.tsx` | 373 | **rebuild** for RN (length selector + Likert list) | `src/screens/teacher/JTIAAssessmentScreen.tsx` |
| `src/app/components/JTIAReport.tsx` | 924 | **rebuild** for RN (radar + domain bars + strengths/growth + recs) | `src/screens/teacher/JTIAReportScreen.tsx` |

### Integration points
- Add `'jtia'` to mobile's assessment type unions / `WIRE_TYPE` map in `src/utils/scoring.ts` and `src/utils/api.ts`.
- Route the Teacher tab (`TeacherDevelopmentScreen`, `AppNavigator` teacher stack) to JTIA; keep the old teaching-style screens reachable only for historical results (mirrors webapp).
- `recordAssessmentCompletion` / gamification hook — reuse existing.
- `GrowthTrackerScreen` currently reads teaching-style status; point it at JTIA completion.

- **Effort:** ~3–4 days. Data + scoring is a copy (~0.5 day incl. a scoring parity test against webapp). The two screens are the bulk (radar chart already exists in `src/components/RadarChart.tsx`).
- **Risk:** medium — mostly UI surface area; scoring is deterministic and testable.

---

## Area C — AI layer / "Ask Jotti"

Mobile has **zero** AI integration today (`grep` for `openai|gpt|jotti|aiInsight` → nothing). The webapp added a broad AI layer (`ca3e288`, `fd0742b`, `db6c510`, `2c99878`, `6076e7b` "floating Ask Jotti button", `8276000` "NudgesPanel to navbar", `13dc0b1`, `46d7177`).

### C1. AI service shim
Build `src/utils/aiService.ts` for mobile — a thin wrapper over `callEdgeFn('/ai/...')`. Map the webapp's `aiService.ts` exports to live server routes:

| Webapp function | Server route | Priority |
|---|---|---|
| `generateAIInsights` | `POST /ai/generate-insights` | High — assessment results |
| `sendAIChatMessage` / `askAICoach` | `POST /ai/chat`, `/ai/coach-chat` | High — Ask Jotti |
| `generateJTIAAIRecommendations` | `POST /ai/generate-jtia-insights` | With Area B |
| `generateAIReflectionFeedback` | (check `/checkin` or `/ai/chat`) | Med — Mind check-ins |
| `generateAILessonPlan` etc. | `POST /ai/generate-lesson-plan` | Low (educator/web) |

All must degrade gracefully to the existing static content when offline / on error (webapp already does this — returns `null`, caller falls back).

### C2. "Ask Jotti" assistant UI
Floating button + chat sheet, available from dashboards. New: `src/screens/shared/AskJottiScreen.tsx` (or reuse/rename existing `src/screens/shared/ExpertChatScreen.tsx` — check what it currently does). Wire to `sendAIChatMessage` with the user's cognitive profile as context.

### C3. Nudges
**Webapp:** `src/app/utils/nudgeSystem.ts` (12KB, client-side, localStorage) — `generatePersonalizedNudges`, `analyzeUserBehavior`, `getUserNudges`, `dismissNudge`, `refreshNudges`, `getReminderSchedule`. `5539538` restricts generation to **student** accounts and preserves dismissed state.
- Port `nudgeSystem.ts` → `src/utils/nudgeSystem.ts`, swap `localStorage` → `AsyncStorage`.
- Mobile already has `src/utils/notifications.ts` + a `NotificationsScreen` — surface nudges there and/or as a dashboard panel.
- Note: mobile's `src/utils/gamificationApi.ts` and `RadarChart.tsx` already contain the string "nudge" — check for a partial start.

### C4. AI-generated content replacing hardcoded strings
Webapp converted static teaching strategies / parent tips / educational resources to AI generation (`13dc0b1`, `46d7177`). Lower priority for mobile — the static fallbacks are acceptable v1; layer AI in per-surface after C1.

- **Effort:** C1 ~1 day · C2 ~1–1.5 days · C3 ~1 day · C4 incremental. Total ~3–4 days for a solid first cut.
- **Risk:** low–medium. Routes are live and simple; main work is graceful-degradation UX and streaming/latency handling on mobile networks (`callEdgeFn` already has timeouts).

---

## Area D — Institutional student codes

Webapp `e7a7062` "institutional student enrollment system with code-based sign-in", `f58a0ba`, `52eea1a`, `6d8281b` (CSV upload — **web-only**, teacher tooling), `28a786c`.

### D1. Student-code sign-in (mobile-relevant)
**Webapp:** `src/app/components/AuthForm.tsx` — `signInMethod: 'email' | 'studentCode'` toggle; 2-step flow:
1. `validateStudentCode(code)` → `POST /student-code/validate` → `{ valid, studentName, schoolName }`
2. `signInWithStudentCode(code)` → `POST /student-code/signin` → `{ session, user, token }` → `supabase.auth.setSession(...)`

**Mobile changes:**
- `src/screens/auth/LoginScreen.tsx` — add a second sign-in mode (segmented control: "Email" / "Student code"). Currently email/password + OTP only.
- `src/context/AuthContext.tsx` — add `signInWithStudentCode(code)` that calls the two routes and `supabase.auth.setSession`.
- New client fns in `src/utils/api.ts` or `supabase.ts`: `validateStudentCode`, `signInWithStudentCode`.
- Code format is uppercased before send (`.trim().toUpperCase()`).

### D2. Student code display on signup / profile
Webapp shows the generated student code after signup (`f58a0ba`, `AuthForm.tsx:523` `result.studentCode`). Mobile's `SignupScreen` already handles `organizationCode` verification (`/institutions/validate-code`) — extend the post-signup response handling to surface `studentCode` when present, and show it on `ProfileScreen` / `EditProfileScreen`.

### D3. Out of scope for mobile (confirm with product)
- CSV upload for bulk student codes (`6d8281b`) — teacher web tooling.
- Teacher Class Management + Admin Approvals (`4a437e2`, `52eea1a`) — educator web dashboards.
- Super Admin Portal (`4415c43`) — web only.

- **Effort:** D1 ~1 day · D2 ~0.5 day.
- **Risk:** low. Routes live; flow is well-defined in `AuthForm.tsx`.

---

## Also noticed (not in the four areas — decide separately)

| Webapp change | Commit | Mobile relevance |
|---|---|---|
| Daily Challenge **domain-tagged** questions (Kolb/Sternberg/Dual-Process), stop random-slicing | `6637560` | Mobile has **no daily-challenge feature** at all (only a concept in `gamification.ts`). Full feature build if wanted. |
| Parent: profile settings, retake assessment & insights, **3-way alignment** analytics, teacher-observation sharing | `8f065ca` | Mobile has `ParentDashboard` + `ParentObservationScreen`. New `TeacherObservation` type + 3-way alignment view would be a follow-up. |
| Offline Assessment & Lesson-Plan auto-sync engine | `45ba636` | Mobile already has `src/utils/outbox.ts` + `netinfo`. Compare against webapp's `offlineSyncManager.ts` for gaps. |
| 48-hour deferred email verification | `63afec4` | Mobile OTP flow (`OtpVerificationScreen`) — check if the "verify later" grace path is wanted. |
| Kids-mode controls, SHS/JHS/Elementary portal enhancements | `6637560` | Per-tier UI polish; audit mobile kids/SHS/JHS screens against webapp. |
| AI Lesson Planner (10 modules), Jotti Markdown | `b7e4f90`, `3d38857`, `6d8281b` | Educator web feature. Likely **not** mobile v1. |
| PWA / service worker / SEO / sitemap | multiple | Web-only. Skip. |

---

## Recommended sequencing

1. **A1** (pro-scoring 2-liner) — trivial, ship immediately, restores result interchangeability. `~0.5 day` incl. tests.
2. **D1 + D2** (student-code sign-in) — self-contained, high user value for pilot schools. `~1.5 days`.
3. **C1** (AI service shim) + **C2** (Ask Jotti) — unlocks the rest of the AI surface. `~2.5 days`.
4. **B** (JTIA) — largest; depends on nothing but benefits from C1 for the AI overlay. `~3–4 days`.
5. **C3** (nudges), then **C4** and the "also noticed" items as separate scoped tickets.

Suggested as **one PR per numbered step** (A1 and D as small PRs; B split into "data+scoring" and "screens").

### Parity test to add regardless
A `src/utils/__tests__/webapp-parity.test.ts` that runs a fixed set of response vectors through each shared scorer and asserts exact outputs, with the expected values copied from the webapp. This is what keeps "verbatim port" true over time — the pro-scoring drift in A1 would have been caught the day it shipped.
