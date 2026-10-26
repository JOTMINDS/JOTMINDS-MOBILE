# Plan: port the Pre-school / Early Years level (JM-PDAF v1.0) to mobile

Source: `JOTMINDS/JOTMINDS-WEBAPP` commits `3365203` (level + institution type), `596b28e` (JM-PDAF framework), `deae4a2` (refinements), `c3aea62` (type fixes). About 10k lines, of which about 6k are pure data.

## What the webapp built

| Piece | Files | Lines | Nature |
|---|---|---|---|
| Types, bands P1–P4, 8 domains, rating scale, confidence rules | `types/preschoolDevelopmental.ts` | 540 | pure TS, copy as-is |
| Indicator bank | `data/preschoolIndicators.ts` | 5,562 | pure data, copy as-is |
| Activity bank | `data/preschoolActivities.ts` | 252 | pure data, copy as-is |
| Scoring engine (indicator evaluation, domain progress, school readiness, child profile, class intelligence) | `utils/preschoolEngine.ts` | 610 | pure TS; depends on `calculateAge` only |
| Evidence storage | `utils/preschoolStorage.ts` | 164 | localStorage + best-effort Supabase upsert |
| PDF report | `utils/preschoolPdfGenerator.ts` | 584 | web-only (jsPDF); needs a mobile rewrite |
| 8 teacher/school views + assess modal + container | `components/preschool/*` | 4,183 | web UI; must be rewritten in React Native |

## Findings that change the plan

1. **The webapp's preschool data is not actually shared.** `saveEvidenceEvent` writes to `localStorage`, then tries to upsert into a `preschool_evidence_events` table inside a `try {} catch {}`. That table appears in no migration and no server route (grepped the whole repo). So webapp evidence lives in one browser only, and the upsert fails silently. Mobile cannot "reuse the shared backend" for this feature as it does for the rest of the app.
2. **The webapp seeds fake data.** `seedSamplePreschoolEventsIfEmpty` fills the store with demo observations when it is empty. This must not ship to real teachers on mobile.
3. **Mobile has no institution / school-leader role or dashboard.** There are teacher and parent surfaces only. `PreschoolSchoolInsightsView` therefore has nowhere to live.
4. **Mobile has no Pre-school education level at all.** Registration, class creation, `thinkingStylesTrack`, `kidsMode` (age bands) and the AI context text have no early-years branch. Children aged 2–6 would currently fall into Kids mode or the default track.
5. `isPreschoolChild` / `resolveChildBand` read `age`, `dateOfBirth`, `educationLevel` and `className`. Mobile's `AuthContext` already carries all four, so no schema change is needed there.

## Decisions needed before building

- **D1, persistence.** Evidence must be shared across a teacher's devices and visible to the same school. Recommended: add a real `preschool_evidence_events` table plus server routes in the shared edge function (RLS by observer and institution), and have **both** apps use it. Without it, mobile evidence stays on-device and web/mobile never agree. Alternative: ship mobile as device-local (AsyncStorage) first and say so. Cheaper, but a dead end for parents and school leaders.
- **D2, who sees what.** Teacher records and reviews evidence. Does the parent app show their child's developmental profile and home activities (the webapp has `PreschoolParentsView`)? Recommended: yes, read-only.
- **D3, scope of the school-level views.** Skip `SchoolInsights` and `TeachingInsights` until an institution role exists on mobile.

Recommended answers: D1 server-backed (backend work in the webapp repo first), D2 yes, D3 skip.

## Phases (each its own PR)

**P0, backend (webapp repo, not mobile).** Migration for `preschool_evidence_events` with RLS, routes `GET/PUT/DELETE /preschool/events`, and a removal of the demo seeding. Needed only if D1 is server-backed.

**P1, foundations (mobile, no UI).** Copy the types, both data files and `preschoolEngine.ts` verbatim into `src/types`, `src/data`, `src/utils`. Replace `calculateAge` with mobile's equivalent and drop the web `User` import for a minimal local type. Add Jest tests ported from the engine's behaviour: band resolution at the age boundaries (3.2, 4.2, 5.2), indicator evaluation with 0/1/many events, `isPreschoolChild` for 6.5 and level strings. Risk: low. The `.ts` bank is large, so confirm Metro and Jest load it without a startup-time hit (lazy-require it from the screens).

**P2, early-years level plumbing.** Add Pre-school to the education-level options (signup, class creation, CSV roster), to `thinkingStylesTrack` and `kidsMode`, and the early-years branch for AI context text. Teachers can create a Pre-school class and enrol children. Parents can add a child aged 2–6.

**P3, teacher flow (core value).** Four screens: Children list (with band and progress), Assess (pick child, indicator, rating 0–4, method, optional note, language; the web modal's fields), Activities (browse by band and category, tap to assess mapped indicators), Child Progress (domain progress, readiness profile). Offline-first writes through the existing `outbox.ts`. Entry point from `TeacherDashboard` when the teacher has a Pre-school class.

**P4, class insights and parent view.** Class development intelligence screen (from `calculateClassDevelopmentIntelligence`). Read-only child profile and home activities in the parent app (`ParentChildDetailScreen`).

**P5, report export.** Preschool PDF using the same approach as `pdfReport.ts` (HTML to PDF via expo-print), rewritten from `preschoolPdfGenerator.ts` content. Last, because it is the most rewrite for the least usage.

## Effort and order

P1 is small and safe, so start there. P2 is small. P3 is the bulk (4 screens). P4 and P5 are optional follow-ups. Without D1 settled, P3 can still be built against a storage interface (`getEvents`, `saveEvent`) with an AsyncStorage implementation, and swapped for the server later without touching screens.

## Out of scope

School/institution insights, teaching insights, admin dashboards, and the webapp demo data.
