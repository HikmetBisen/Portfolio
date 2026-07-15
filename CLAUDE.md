# Hikmet Bisen — Personal Portfolio

## Owner
- **Name:** Hikmet Bisen · Austin, TX
- **Email:** hikmetbisen@gmail.com · **Phone:** 737-351-8670
- **GitHub:** https://github.com/HikmetBisen · **LinkedIn:** https://www.linkedin.com/in/hikmetbisen/
- Live: https://hikmetbisen.github.io/Portfolio/ (GitHub Pages, deploys on push to main)

## Design system — "Porcelain Studio"
Light minimal gallery + cursor-reactive 3D. Chosen 2026-07-15 over two competing mocks; replaces the Mountain World theme.
| Token | Value |
|---|---|
| bg | #F6F7F5 (alt #FAFAF9) |
| ink | #101214 · secondary #6B7076 |
| hairline | rgba(16,18,20,0.10) |
| accent (gold) | #B8905F — links hover, indexes, ruler fill ONLY |
| display/body | Schibsted Grotesk 400/500/600 |
| mono | JetBrains Mono 400/500, tabular-nums |
Signature: top measurement-ruler strip whose gold fill grows with scroll; chrome 3D object on index leans toward cursor (Three.js 0.165 via CDN importmap, index.html ONLY); ink cursor dot; magnetic links; 2–3% grain. Motion: expo-out, ≤630ms, prefers-reduced-motion honored. Vanilla HTML/CSS/JS, no frameworks, no build step.

## Structure
- `index.html` — hero (3D) + selected work (3 flagships + 6-row ledger) + footer
- `Project/projects.html` — All work index (09 rows)
- `Project/project-*.html` — 9 case studies; shared skeleton: ruler, topbar, project-hero, sidebar (timeline/role/category/tools/status), body + contributions, prevnext, footer
- `Resume/resume.html` + `Resume/assets/Hikmet_Bisen_Resume.pdf`
- `css/style.css` (whole system) · `js/studio.js` (ruler, cursor, magnetic, reveal — classic script, every page)

## Content rules (enforced — do not regress)
- Deliverable-first titles. NO mountain/peak/K2/camp references anywhere.
- Sensing device: heart rate, respiration, voice, motion. NEVER "blood pressure".
- Patent phrasing exactly: "patent filing in progress".
- No slogans, no adjectives-as-copy. Nouns and numbers. Sentence case. Underclaim.
- Keep URLs stable (GitHub Pages can't redirect).

## TODO
- [ ] Real artifact photos (E30, climbing, PCB render) — the evidence gap; stock/none currently
- [ ] New OG card (assets/og-card.jpg is still K2-themed)
- [ ] WPI sign-off on what earbud material is publishable
- [ ] hikmetbisen.com domain
