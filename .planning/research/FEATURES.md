# Feature Research

**Domain:** Queue/ticket "now serving" display for a clinic waiting room (turnero)
**Researched:** 2026-06-21
**Confidence:** MEDIUM-HIGH (table stakes/anti-features verified across multiple commercial, open-source, and healthcare-display sources; differentiators partly inferred since this is a deliberately minimal exercise app, not a competitive product)

## Feature Landscape

The queue-management category spans a huge range: $2,000+ commercial kiosk hardware with thermal printers and SMS (QLess, Qminder, NemoQ), small open-source web apps (FQM, auroqueue, LineQueue), and DIY single-page "now serving" boards. This project sits at the simplest end deliberately — a single-page, no-backend, no-auth exercise. Below, table stakes are scoped to what THIS category of app needs to feel complete, not what enterprise systems offer.

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or breaks the core "now serving" promise.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Add ticket to queue (auto-numbered) | Foundational — without it there's no queue | LOW | Already in scope. Incremental numbering is the universal convention (no names, see privacy note below). |
| Visible list/count of next-in-line | Patients want to gauge wait without asking staff | LOW | Already in scope ("ver la cola de turnos en espera"). |
| Per-window "current ticket" display | This is the entire point of a multi-window turnero — patients need to know which window to go to | LOW | Already in scope. |
| "Call next" pulls from shared queue, removes it from waiting list | Core interaction loop; if it doesn't atomically remove the ticket, two windows could call the same number | MEDIUM | Already in scope. Flag for requirements: define behavior precisely when queue is empty (button disabled vs no-op vs message). |
| Audible cue on call | In a real waiting room, patients are not staring at the screen — sound is what actually triggers them to look up. Virtually universal in every commercial and DIY system reviewed. | LOW | Already in scope. |
| Visual emphasis/animation on the ticket that just got called | Reinforces the sound cue for patients who are looking at the screen but distracted; also a basic accessibility aid for those who didn't hear the sound | LOW | Already in scope. |
| Large, high-contrast, distance-readable numbers | Verified pattern from hospital digital-signage guidance: content must be readable "in five seconds from ten feet away." A waiting room display is read across a room, not on a desk. | LOW | **Not yet explicit in scope — recommend adding as a UI/design requirement, not a new feature.** Pure CSS/layout concern, near-zero added complexity if addressed during initial styling. |
| State survives page reload | Browser tabs get refreshed/closed accidentally; losing the whole queue would be a real operational failure for an actual waiting room | MEDIUM | Already in scope (localStorage). |
| No patient names/identifying info on the public display | HIPAA-style best practice across every healthcare-display source: use numbers, not names, on public-facing screens | LOW | Already implicit in scope (numeric tickets only) — confirm this stays true through requirements (no "patient name" field should ever be added to the public view). |

### Differentiators (Competitive Advantage)

For most real products in this space, differentiators are things like SMS notifications, AI wait-time prediction, multi-branch analytics, or priority/VIP lanes — none of which apply to a single-page, no-backend exercise app. Given the project's stated goal (practice the GSD lifecycle, not build a sellable product), the meaningful "differentiators" here are really about **polish within the declared scope**, not new capability surface.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Distinct call sound per event (vs. silence on idle) + animation timing tuned so it's noticeable but not jarring on every render | Makes the toy app feel like a real product rather than a prototype; this is the project's one declared "delight" feature | LOW | Already in scope; treat as the polish target, not as new scope. |
| Configurable number of windows (add/remove dynamically) | Most ultra-simple DIY turneros hardcode 1-3 counters; dynamic add/remove is a small but genuinely above-baseline touch for this category | MEDIUM | Already in scope. Complexity comes from state-shape decisions (what happens to a window's "current ticket" when it's removed?), not UI. |
| Clear empty-queue state for "call next" (e.g., disabled button + message) | Most simple OSS examples (queueTicketingApp, Queue-Management-System) don't handle this gracefully; doing it well is a noticeable quality signal in an otherwise minimal app | LOW | Not yet explicit in scope — recommend folding into requirements for the "call next" behavior, not as a separate feature. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that appear in real queue products and might feel like "obviously should add this," but which would be over-engineering for this exercise's declared goals and explicit out-of-scope decisions.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Recall / "call again" for a missed ticket | Universal in commercial systems (QLess, NemoQ) — patients who didn't hear/see the call need a way to be re-summoned | Requires deciding whether recall re-triggers sound/animation, whether it affects queue order, and how it's exposed in UI — meaningfully more state and UX surface than declared scope | If patients miss a call in real life, staff just call the next number manually (walk over) — acceptable for a 1-page exercise app with no real staff workflow tooling. Explicitly punt; note as a "v2 if ever revisited" item, not core. |
| Separate queue per window | Seems intuitive (each window "owns" its line) | Project's PROJECT.md already explicitly rejected this to keep "call next" logic simple — correctly scoped out | Single shared queue, as already decided. |
| Multi-device / cross-tab real-time sync | Feels necessary for a "real" multi-window system (one screen per window in real life) | Requires either a backend, WebSockets, or BroadcastChannel/storage-event tricks — directly contradicts the explicit no-backend, single-page constraint | Single shared browser tab/screen is the documented constraint; don't quietly reintroduce sync via clever localStorage polling — that's solving a problem out of scope. |
| Authentication / window operator login | Real systems gate "call next" behind staff login | Explicitly out of scope already; adds an entire auth domain to a 1-page exercise | None needed — anyone with the page open can operate any window, as decided. |
| Ticket printing / physical number dispenser | Standard in commercial hardware kits | Requires hardware integration; meaningless for a software-only exercise | The "Agregar turno" button is the dispenser; no physical artifact needed. |
| Priority/VIP queue lanes | Common in healthcare queue products (elderly, urgent cases) | Adds branching logic to "call next" (which queue to pull from) that has no requirement basis here and wasn't requested | Single FIFO queue, as scoped. If ever needed, it's a clear v2 feature, not a v1 addition. |
| Analytics/reporting (avg wait time, tickets per window) | Real systems sell this as a core value-add to clinic admins | Requires tracking timestamps, computing aggregates, and a reporting UI — none of which serves the stated Core Value ("cualquier ventanilla pueda llamar... y la pantalla refleje correctamente") | Skip entirely; this is a display tool, not a management dashboard. |
| SMS / push notifications to patients' phones | Major differentiator for commercial products (let patients leave the waiting room) | Requires backend, phone number collection, and a messaging provider — directly contradicts no-backend/no-auth constraints | Patients stay in the room and watch the shared screen, as the single-page design assumes. |
| Undo "call next" (put ticket back in queue) | Feels like a reasonable safety net for operator mis-clicks | Adds queue-reordering logic and ambiguity (does undo go back to front of queue or original position?) not requested in scope | Not addressed by current scope; flag as an open question for requirements only if mis-click recovery turns out to matter — otherwise leave out. |

## Feature Dependencies

```
Configurable number of windows
    └──requires──> Per-window "current ticket" state model
                       └──requires──> Shared queue data structure

"Call next" (per window)
    └──requires──> Shared queue data structure
    └──requires──> Per-window "current ticket" state model

Sound on call ──enhances──> "Call next"
Animation on call ──enhances──> "Call next"

localStorage persistence ──requires──> Final shape of queue + window state model
    (persistence should be implemented after the state model is settled,
     not before, to avoid migrating localStorage schema mid-build)

Window removal ──conflicts──> Window's "current ticket" must be resolved
    (decide: does removing a window discard its current ticket, or
     does removal get disallowed while a ticket is being "served"?)
```

### Dependency Notes

- **Configurable windows requires a per-window state model first:** Before "add/remove window" can be built, the shape of "window state" (id, current ticket, maybe a name/label) needs to be settled — otherwise add/remove logic has nothing stable to operate on.
- **"Call next" requires the shared queue to support atomic dequeue:** Because multiple windows pull from one queue, the dequeue operation must be a single state transition (remove-and-assign), not two separate steps, to avoid two windows claiming the same ticket in rapid double-clicks.
- **localStorage persistence depends on the state model being finalized:** Persisting too early risks needing a migration/versioning scheme when the queue/window shape changes during build. Recommend building the in-memory model first, validating it works, then wiring persistence last.
- **Window removal conflicts with "current ticket" semantics:** This is the one real open design question in the existing scope. Options: (a) removing a window silently discards its current ticket from view, (b) removal is blocked/warned if the window has a ticket that hasn't been "completed," (c) there's no "completed" concept at all and any current ticket is just overwritten on next call — simplest, and likely the right choice given the explicit goal of keeping scope small.
- **Sound and animation both enhance "call next" but are independent of each other:** Either could ship without the other; no technical coupling, just both fire on the same event.

## MVP Definition

The project's PROJECT.md Active Requirements already constitute a correctly-scoped MVP. No additions recommended — only clarifications.

### Launch With (v1) — matches current Active Requirements

- [ ] Add ticket button with auto-incrementing number — the entry point to the whole system
- [ ] Visible waiting queue (ordered) — lets patients self-gauge wait
- [ ] Configurable number of windows (add/remove) — already explicitly wanted by user
- [ ] Per-window current ticket display (with "sin turno" empty state) — the core "now serving" promise
- [ ] "Call next" per window, atomically pulling from shared queue — the core interaction
- [ ] Sound on call — the cue that makes the display actually functional in a real room
- [ ] Animation on ticket change — reinforces the call visually
- [ ] localStorage persistence across reloads — protects against accidental refresh/close

### Add After Validation (v1.x) — only if the exercise continues past the initial milestone

- [ ] Distance-readable / high-contrast display styling — should really be addressed during initial build (it's a CSS concern, not a new feature), but flag explicitly in requirements if not already covered by a "looks like a real waiting-room display" acceptance criterion
- [ ] Empty-queue handling polish for "call next" (disabled state / message) — small UX detail, cheap to add once the core loop works

### Future Consideration (v2+) — explicitly defer, not because they're bad ideas but because they fight the stated goal of a small, fast exercise

- [ ] Recall/"call again" for a ticket — defer until/unless the exercise scope formally expands; meaningfully increases state complexity
- [ ] Undo last call — defer; not requested, ambiguous semantics
- [ ] Any cross-tab/cross-device sync — defer indefinitely; directly conflicts with the no-backend constraint that defines this exercise

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Add ticket (auto-number) | HIGH | LOW | P1 |
| Shared waiting queue display | HIGH | LOW | P1 |
| Configurable windows | HIGH | MEDIUM | P1 |
| Per-window current ticket | HIGH | LOW | P1 |
| Call next (atomic dequeue) | HIGH | MEDIUM | P1 |
| Sound on call | HIGH | LOW | P1 |
| Animation on call | MEDIUM | LOW | P1 |
| localStorage persistence | MEDIUM | MEDIUM | P1 |
| Distance-readable styling | HIGH | LOW | P2 (fold into P1 build, not a separate phase) |
| Empty-queue UX polish | LOW | LOW | P2 |
| Recall/call-again | MEDIUM | MEDIUM | P3 |
| Undo last call | LOW | MEDIUM | P3 |
| Cross-tab/device sync | LOW (out of scope) | HIGH | Not planned |

**Priority key:**
- P1: Must have for launch (already reflected in PROJECT.md Active Requirements)
- P2: Should have, cheap enough to fold into the same build rather than deferring
- P3: Nice to have, future consideration only if the exercise scope is deliberately expanded

## Competitor Feature Analysis

"Competitors" here are split into two very different tiers — commercial healthcare queue products and minimal open-source/DIY implementations — because the gap between them illustrates exactly where this project's scope sits.

| Feature | Commercial (QLess, NemoQ, igaleno) | Small OSS (FQM, auroqueue, queueTicketingApp) | This Project's Approach |
|---------|--------------------------------------|------------------------------------------------|--------------------------|
| Ticket numbering | Printed ticket from kiosk/SMS | Button click in admin UI | Button click, in-browser, auto-increment (matches OSS tier) |
| Multi-counter calling | Dedicated hardware display + keypad per counter | Web UI button per counter | Per-window "call next" button, same page (matches OSS tier) |
| Notification | SMS, voice announcement, LED display | Browser sound/beep | Sound + animation in-page (matches OSS tier, slightly more polish via animation) |
| Persistence | Server database, multi-device | Server database (Flask/SQL) or in-memory | localStorage only — single tier below OSS, by deliberate constraint |
| Patient privacy | Anonymized number, no name shown publicly | Anonymized number | Anonymized number (correctly aligned with both tiers — this is non-negotiable) |
| Recall/skip | Standard feature | Inconsistent — many OSS examples lack it | Deliberately out of scope (v2+ at most) |
| Analytics | Standard feature | Rare | Out of scope — not aligned with Core Value |

## Sources

- [QLess — Queue Management Systems](https://www.qless.com/) — commercial feature baseline (priority, SMS, recall)
- [QLess — Queue Line Management use case](https://www.qless.com/use-cases/queue-line-management/)
- [Hospital Digital Signage: The 2025 Waiting Room Display Guide](https://www.digitalsignage-supplier.com/hospital-digital-signage/) — distance-readability, accessibility guidance
- [HIPAA in the Waiting Room — Jackson LLP](https://jacksonllp.com/hipaa-in-the-waiting-room/) — privacy/no-names-on-public-display best practice
- [Savance Health — Waiting Room Display](https://savancehealth.com/solutions/waiting-room-display/) — anonymized token pattern for HIPAA compliance
- [GitHub — 2color/auroqueue](https://github.com/2color/auroqueue) — minimal multi-desk queue implementation, confirms small-scope feature set (no recall/skip documented)
- [GitHub — AlanLeeHaoXi/queueTicketingApp](https://github.com/AlanLeeHaoXi/queueTicketingApp) — "Call Next" / "Complete Current" pattern in a simple counter-manager app
- [GitHub — yuvisidhu19/Queue-Management-System](https://github.com/yuvisidhu19/Queue-Management-System) — simple per-counter "next customer" pattern
- [GitHub — mrf345/FQM (Free Queue Manager)](https://github.com/mrf345/FQM) — small web-based queue manager, representative of OSS tier
- [Amazon — Take a Number System for Medical Clinics](https://www.amazon.com/Wireless-Management-Restaurant-Hospital-Waitting/dp/B081NBSFLR) — confirms hardware-tier feature set (keypad, display, printer, voice prompt) as the "above" comparison tier
- [igaleno — Gestor de Turnos para Salas de Espera](https://www.igaleno.com/salas-espera-gestor-turnos/) — Spanish-language clinic turnero feature description (real-time display, module assignment, priority rules)
- [Mediciphealth — Gestión de turnos en hospitales](https://www.mediciphealth.com/sanitario-hospitales/gestion-turnos-colas/) — Spanish-language hospital queue management context

---
*Feature research for: Clinic waiting-room queue/ticket display (turnero)*
*Researched: 2026-06-21*
