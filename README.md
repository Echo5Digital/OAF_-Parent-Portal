# Open Arms Foster Care Platform — UI Prototype

A React + TypeScript + Vite prototype of the Open Arms Foster Care Management Platform, built from the client-provided mockup (`../Open Arms Foster Care Dashboard Mockup (1).png`).

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. Use the top-right switcher (or the "Demo:" buttons on the sign-in screen) to jump between the three views:

- **Parent Portal** (`/parent`) — the main priority: independent, per-child weekly logs. Switching between Emma / Liam / Sophie never overwrites another child's saved data. Each child has 7 independently clickable day tabs. Start/stop time auto-calculates duration against the 30-minute Basic Living Skills compliance rule. Liam is flagged ITFC (shows extra safety questions); Sophie is flagged in respite (form swaps to a respite-only layout). Day 7 reveals the end-of-week summary and signature capture.
- **Staff Dashboard** (`/staff`) — operational stat tiles and a submissions table.
- **AI Insights & Reporting** (`/ai`) — natural-language query bar, AI summary with record references, compliance trend chart, and KPIs.

## Structure

- `src/data/model.ts` — the in-memory data model (children, weekly log entries, seeded example data).
- `src/components/` — shared UI: app shell/sidebar, child/day tab rails, the daily log form, toast notifications, icons.
- `src/pages/` — the three top-level views.
- `src/styles/` — design tokens (`tokens.css`), base styles, and per-area stylesheets. Supports light/dark via `prefers-color-scheme`.

This is a front-end-only prototype for design review — state lives in React component state and resets on reload. No backend, auth, or persistence yet; see the project brief for the phased build plan.
