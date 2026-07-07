---
status: partial
phase: 04-call-next-atomic-dequeue
source: [04-VERIFICATION.md]
started: 2026-07-07T17:05:00Z
updated: 2026-07-07T17:05:00Z
---

## Current Test

[approved by user during Plan 04-02 checkpoint]

## Tests

### 1. Button visibility (D-07, D-01)
expected: Button is visible, full-width, at the bottom of every VentanillaCard
result: approved

### 2. Successful call flow (CALL-01)
expected: Ticket moves from queue to ventanilla, previous ticket replaced
result: approved

### 3. Empty-queue warning (CALL-02)
expected: Warning appears inline in clicked card only, auto-dismisses after 2 seconds
result: approved

### 4. WR-01 stale warning regression
expected: Removal warning disappears when CALL_NEXT clears the active ticket
result: approved

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
