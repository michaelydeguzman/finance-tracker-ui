# Phase 1002: Dashboard analytics — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `1002-CONTEXT.md`.

**Date:** 2026-04-01
**Phase:** 1002-dashboard-analytics
**Areas discussed:** Data source (API vs mock), date filtering via `from/to`, dashboard semantics

---

## Data source: live API + fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Live API only | Dashboard fails hard if backend unavailable | |
| Live API + fallback mock | Use API when available; fall back to mock for demo/dev resilience; show toast | ✓ |
| Mock only | Never call API; keep demo-only | |

**User’s choice:** Live API + fallback mock
**Notes:** Backend GET transactions API has been updated; dashboard should use the real API now.

---

## Date range query params

| Option | Description | Selected |
|--------|-------------|----------|
| Use `from/to` (ISO) | Filter dashboard by selected period using `from` and `to` | ✓ |
| Defer query params | Keep local-only filtering for now | |

**User’s choice:** Use `from/to` (ISO)

---

## Savings semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Net cashflow | Income − expenses; allow negative | ✓ |
| Clamp | Never show negative savings | |

**User’s choice:** Net cashflow (allow negative)

---

## Default preset

| Option | Description | Selected |
|--------|-------------|----------|
| `last_3_months` | Default dashboard view for recent activity | ✓ |
| `ytd` | Year-to-date as default | |

**User’s choice:** `last_3_months`

