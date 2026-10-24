# OPERAVA Global — Website V2 | Developer and AI Agent Instructions

> Mandatory project guidance for any human contributor, AI coding assistant, code-generation workflow, or automation operating in this repository. Applies to all repository paths unless the owner expressly authorizes an exception.

## 1. Authorization and change control — REQUIRED

- **Do not change any repository code, text, visual design, layout, routes, assets, styling, dependencies, configuration, infrastructure, deployments, or documentation unless the change was explicitly requested or an implementation plan was expressly approved by the authorized project owner.**
- Planning or proposing a change yourself is **not** authorization. Do not infer blanket permission from a narrowly scoped request. Ask for approval if a needed change goes beyond the agreed scope.
- Before editing, identify the requested behavior, exact target files and affected routes, existing production design, and invariants. Prefer the smallest targeted diff that fulfills the request.
- Never opportunistically modernize, re-theme, replace cover photos, rebuild a component, rename paths, remove features, or reorganize unrelated files.
- Keep all unrequested features and functionality unchanged. Preserve accessibility, responsiveness, light/dark switching, SEO, existing links, and public tool behavior.
- If a request is specifically for **elements or icons**, change only those elements; do not overwrite section/page background photographs, typography, layout, cards, header, or footer.
- If scope or permission is unclear, present the proposed plan for authorization rather than making extra changes.
- Review diffs, verify build or static assets and routes, and describe exactly what changed. Distinguish GitHub commits from successful Cloudflare production deployment.

## 2. This repository (actual setup)

- Repository: `Operava-Global/Operava-Website-V2`, production branch `main`.
- Cloudflare Pages project: `operava-website-v2`; live domains `operavaglobal.com`, `www.operavaglobal.com`.
- React 19 + TypeScript + Vite 8 + Tailwind CSS 4. `src/main.tsx` mounts `src/App.tsx`.
- `src/site/Layout.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, and `src/site/nav.ts` own the reusable website shell/navigation. `src/components/Footer.tsx` is another footer implementation; update only whichever instance the requested route actually renders.
- The Free Tools are self-contained static HTML pages under `public/utilities/`, not React replacements. Each has an online `/utilities/<slug>/index.html` and a standalone `/utilities/<slug>.html` edition. Preserve both whenever a change is authorized to affect both.

## 3. Exact existing V2 design contract — DO NOT REDESIGN

**Authoritative live code, in descending order:** `src/index.css` (Tailwind tokens, font), `src/site/theme.css` (actual dark/light palette), `src/site/design-polish.css` (nav, spacing, motion), `src/site/SiteHeader.tsx` / `SiteFooter.tsx` / `src/site/ui.tsx` (structure). If documentation differs from the current tested source, confirm the source and request approval before changing a token.

| Design role | Dark (default) | Light (selected) |
| --- | --- | --- |
| Page background `--bg` | `#1b1b21` | `#f7f5fb` |
| Primary surface `--surface` | `#24242b` | `#ffffff` |
| Secondary surface `--surface-2` | `#2b2b33` | `#f1ecf8` |
| Border `--border` | `#3b3b46` | `#dad4e6` |
| Primary text `--text` | `#ffffff` | `#19132b` |
| Muted text (base) | `#888888` | `#554d65` |
| Accent text / links | `#9f67ff` | `#6c27bc` |
| Accent button fill | `#7c3aed` | `#6220ac` |
| Header when not scrolled | `rgba(29,29,36,.95)` | `rgba(250,248,255,.94)` |
| Header on scroll | `rgba(33,33,41,.96)` | `rgba(251,249,255,.97)` |

- Tailwind theme brand stops: blue `#3d4bff`, violet `#9860ee`, magenta `#c04cf0`; accent-deep `#5b21b6`. Some targeted contrast overrides in `theme.css` take precedence over base tokens.
- **Only typeface:** `Inter`, using the Google Fonts weights 300, 400, 500, 600, 700, 800, 900 (and italic 300 where loaded); fallbacks: `system-ui, -apple-system, sans-serif`.
- Editorial aesthetic: charcoal (not pure black) / soft lavender; restrained violet accents; fine neutral hairline borders; typically 12px-radius site cards; generous whitespace. Keep headings bold/black-weight and uppercase where the existing component uses that convention.
- Navigation uses an approximately 64px sticky header, five tabs (Insights, Services, Industries, Careers, About), and a mobile drawer. Existing layout, hover, focus, and breakpoint behavior must be retained.
- Do not replace approved photography with gradient-only panels, illustrations, videos, or new imagery without express authorization.
- Respect `prefers-reduced-motion`; keyboard focus and contrast must remain legible in both modes.

## 4. Theme and Free Tools rules

- Theme state is `document.documentElement.dataset.theme`, set to `light` or `dark` and persisted in `localStorage['operava-theme']`; dark is default. `src/site/ThemeToggle.tsx` is the website authority.
- Utility static theme toggles must honor the **same key and selected mode**, never introduce an independent utility theme.
- Tool style source: `public/utilities/toolkit.css` and `premium.css`; the tools mirror the site's header, footer, font, and palette while retaining their own functionality.
- The **original utility cover photograph** is `public/media/operava-scene-operava-team-collaboration-in-purple-glow.webp`, referenced from the existing utility hero CSS. Keep the photo/overlay in light and dark; do not replace it with a CSS-only gradient.
- `public/utilities/visuals.css` is scoped to transparent hero-element WebP sizing and exact V2 shell/palette parity. It must **not** override `.hero` background, title colors, cards, or page layout.
- Nine transparent WebP element illustrations reside under `public/utilities/media/`: hub `index.webp`, guide `guide.webp`, plus the seven tool illustrations. These are **foreground elements on top of the photo**, not cover-photo replacements.
- Preserve `/utilities/` Free Tools footer navigation and all seven routes: `currency-converter`, `calendar`, `scientific-calculator`, `pdf-viewer`, `word-to-pdf`, `html-editor`, `references`.
- Preserve tool logic and standalone HTML compatibility; only change functionality when specifically authorized.

## 5. Verification for explicitly authorized changes

1. Check the working branch/commit and verify the exact requested scope; do not touch V1.
2. Read existing component styles or route HTML **before** editing; list what must remain visually unchanged.
3. Make the minimal diff. Compare dark and light (including the original photo), desktop and mobile.
4. Verify `npm run lint` / `npm run build:pages` when execution is available; for static pages verify links, CSS, JS and all assets at their paths.
5. After any GitHub push, check Cloudflare deployment status separately; do not call it live until deployment actually succeeds.

## 6. Documentation

- Keep the `README.md` developer design section in sync with this file and with the current CSS; do not silently change either.
- Record new design decisions **only when authorized**. A self-authored plan alone never grants authorization.
