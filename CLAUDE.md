# Hikmet Bisen — Personal Portfolio

## Owner
- **Name:** Hikmet Bisen · Austin, TX
- **Email:** hikmetbisen@gmail.com · **Phone:** 737-351-8670
- **GitHub:** https://github.com/HikmetBisen · **LinkedIn:** https://www.linkedin.com/in/hikmetbisen/
- Live: https://hikmetbisen.com/ (GitHub Pages, deploys on push to main)

## Design system — "Porcelain Studio"
Light minimal gallery + cursor-reactive 3D. Chosen 2026-07-15 over two competing mocks; replaces the Mountain World theme.
| Token | Value |
|---|---|
| bg | #F6F7F5 (alt #FAFAF9) |
| ink | #101214 · secondary #6B7076 |
| hairline | rgba(16,18,20,0.10) |
| accent (gold) | #B8905F — links hover, indexes, ruler fill ONLY |
| display/body | Schibsted Grotesk 400/500/600 |
| mono | JetBrains Mono 400/500, tabular-nums (`--mono`) |
Signature: top measurement-ruler strip whose gold fill grows with scroll; full-bleed interactive topo hero from real ASTER GDEM contours; ink cursor dot *alongside* the native cursor; magnetic links; 2–3% grain. Motion: expo-out, ≤630ms, prefers-reduced-motion honored. Vanilla HTML/CSS/JS, no frameworks, no build step. (The Three.js chrome object was replaced by the survey system on 2026-07-15 — no WebGL anywhere now.)

## Accessibility invariants (2026-08-13 — do not regress)
- **Never `cursor:none`.** It overrides OS pointer accessibility settings. The `#dot` is additive.
- **Gold is decorative only** — 2.7:1 on porcelain. Never a text colour, never the sole focus indicator. Focus ring is ink + a gold halo (17.5:1).
- **`.topbar` is `position:fixed`**, not absolute — the index is one scroll and its anchors have to stay reachable. `html.scrolled` adds the wash.
- Every page: skip link first in `<body>`, `<nav class="topbar" aria-label="Primary">`, `<main id="main" tabindex="-1">`, exactly one `<h1>`.
- Every `<img>` carries real `width`/`height` (layout shift) — **re-sync them whenever a file is replaced**.
- Verify with `PortfolioV2/.tooling/a11y.mjs` (13 pages + mobile) against `python3 -m http.server 8099`.

## Structure
- `index.html` — hero (topo) + selected work (3 flagships + 7-row ledger) + about + resume + contact, one scroll
- `Project/projects.html` — All work index (09 rows)
- `Project/project-*.html` — 10 case studies (LinkRing/Fuji added 2026-07-16; flagships: earbud, LinkRing, E30 — FORGE leads the ledger); shared skeleton: ruler, topbar, project-hero, sidebar (timeline/role/category/tools/status), body + contributions, prevnext, footer
- `Resume/resume.html` + `Resume/assets/Hikmet_Bisen_Resume.pdf`
- `css/style.css` (whole system) · `js/studio.js` (ruler, cursor, magnetic, reveal — classic script, every page)

## Maintenance traps
- Resume content lives in TWO places: index.html `#resume` and Resume/resume.html — edit both.
- Topo heroes: `js/survey.js` + `assets/topo/*.json` (regenerate via the DEM pipeline, do not hand-edit).

## Content rules (enforced — do not regress)
- Deliverable-first titles. NO mountain/peak/K2/camp references anywhere.
- Sensing device: heart rate, respiration, voice, motion. NEVER "blood pressure".
- Patent phrasing exactly: "patent filing in progress".
- No slogans, no adjectives-as-copy. Nouns and numbers. Sentence case. Underclaim.
- Keep URLs stable (GitHub Pages can't redirect).

## TODO
- [x] ~~Real artifact photos~~ — E30 (4), earbud (3), LinkRing (3) shipped 2026-07-16
- [x] ~~New OG card~~ — regenerated 2026-08-13 from the site's own CSS + K2 contours; rebuild with `PortfolioV2/.tooling/og.mjs`
- [ ] Climbing photo for the About section (the one evidence gap left)
- [ ] Resume PDF is stale — old mechanical-first identity line, no LinkRing, and prints the DEAD `hikmetbisen.github.io/Portfolio` URL. Master is a Google Doc (Producer: Google Docs Renderer) — must be edited there and re-exported to `Resume/assets/Hikmet_Bisen_Resume.pdf`.
- [ ] Make the topo probe keyboard/touch operable (currently fine-pointer only)
- [ ] WPI sign-off on what earbud material is publishable
- [x] ~~hikmetbisen.com domain~~ — live 2026-08-31 (Cloudflare DNS). `hikmetbisen.github.io/Portfolio` now 404s; all references migrated.
