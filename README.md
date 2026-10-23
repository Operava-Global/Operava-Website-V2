# OPERAVA Global Solutions — Official Web Platform

> **"We Operate in Advance"**  
> Enterprise Digital Engineering, Cloud/DevSecOps Architecture, and 24/7 Global Business Process Outsourcing (BPO).

---

## 🔒 Confidentiality & License Notice

**PROPRIETARY AND CONFIDENTIAL — STRICTLY PRIVATE & ONLY FOR OPERAVA GLOBAL SOLUTIONS.**

Copyright &copy; 2026 OPERAVA Global Solutions. All rights reserved.

This codebase, including all design assets, architectural specifications, proprietary copy, business logic, AVA intelligence models, and source code, is the exclusive intellectual property of **OPERAVA Global Solutions**. 

- Unauthorized copying, reverse-engineering, distribution, public hosting, cloning, or commercial use in whole or in part without express written authorization from OPERAVA Global Solutions executive leadership is strictly prohibited.
- This repository is strictly for authorized OPERAVA personnel, engineering contractors, and designated automated build pipelines.

---

## Website release status (verified 23 October 2026)

**CURRENT OFFICIAL WEBSITE — v4:** [operavaglobal.com](https://operavaglobal.com) ([www](https://www.operavaglobal.com)), served by Cloudflare Pages project `ax-website` and this repository's `main` branch.

All other website deployments below are **legacy / historical variants**, not alternate official websites. Keep existing Pages URLs available for reference; do not promote them as production.

| Archive label | Website | Status | Latest successful production deployment (UTC) |
| --- | --- | --- | --- |
| **v1 — Legacy original** | [operava-website.pages.dev](https://operava-website.pages.dev) | Archived/reference | 28 Sep 2026 |
| **v2 — Legacy official-named copy** | [operava-global-official-website.pages.dev](https://operava-global-official-website.pages.dev) | Archived/reference | 11 Oct 2026 |
| **v3 — Legacy alternate website & utilities** | [newwebsite-7jn.pages.dev](https://newwebsite-7jn.pages.dev) | Archived/reference | 20 Oct 2026 |
| **v4 — Current official** | [operavaglobal.com](https://operavaglobal.com) | **Production** | 21 Oct 2026 |

**[View version documentation and screenshots](docs/website-version-history/README.md)** (captured 23 Oct 2026).

> Version numbers are **archive inventory labels**, assigned from the deployment chronology. These separately deployed projects are not verified to be sequential releases of one codebase. Pages project names / `pages.dev` URLs have not been renamed because Cloudflare does not allow renaming the existing `pages.dev` subdomain in place. No older project or live domain was deleted or redirected.

![Current official Operava homepage — desktop capture](docs/website-version-history/screenshots/v4-current-official.png)

---

## 🌐 Project Overview & Purpose

The **OPERAVA Web Platform** is an enterprise-grade digital experience presenting OPERAVA's dual capabilities:
1. **High-Velocity Technology & Software Engineering**: Custom web and cloud applications, multi-cloud infrastructure (AWS/GCP/Azure), Kubernetes orchestration, cybersecurity SOC, and AI dataset engineering.
2. **24/7 Global Business Operations & BPO**: Omnichannel customer experience (CX), Tier 1–3 technical support, back-office data processing, KYC/AML compliance, and dedicated engineering squads.
3. **AVA Virtual Intelligence**: Real-time conversational AI assistant powered by **Cloudflare Workers AI** (Llama 3.3 70B) with a resilient client-side reasoning engine fallback for direct consultations, qualification, and candidate onboarding. Knowledge is grounded in `AVA-INSTRUCTIONS/`.
4. **Multilingual Architecture**: Native 8-language localization (English, Spanish, French, German, Tagalog/Filipino, Arabic, Chinese, Japanese) with automated RTL direction support.

---

## 📁 Repository Structure

```
operava-website/
├── .github/                       # GitHub Actions workflows & CI/CD configs
├── functions/                     # Cloudflare Pages Functions (Edge Serverless)
│   └── api/
│       ├── chat.ts                # AVA chat → Cloudflare Workers AI (+ local fallback)
│       └── health.ts              # Edge health check endpoint
├── public/                        # Static assets served at root
│   ├── _headers                   # Cloudflare security headers & caching rules
│   ├── _redirects                 # Cloudflare SPA fallback routing (/* /index.html 200)
│   ├── robots.txt                 # Search engine crawler policies
│   └── sitemap.xml                # SEO URL structure & priority mappings
├── src/
│   ├── components/                # Modular UI & Layout Components
│   │   ├── AvaAssistant.tsx       # AVA Interactive Virtual Intelligence Drawer
│   │   ├── AvaVideoAvatar.tsx     # Conic-gradient video avatar with glow aura
│   │   ├── DraggableMarquee.tsx   # Interactive horizontal technology marquee
│   │   ├── Footer.tsx             # Enterprise footer with brand video & links
│   │   ├── HangingFeaturesBanner.tsx # Interactive pull-down features banner
│   │   ├── HeroVisual.tsx         # Responsive hero graphic & stats cards
│   │   ├── HomeMediaLoader.tsx    # White-themed pre-flight stream loader
│   │   ├── LanguageSwitcher.tsx   # 8-language dropdown selector
│   │   ├── Navigation.tsx         # Fixed navbar with brand logo & navigation
│   │   ├── PurpleRunningBorderBeam.tsx # SVG perimeter beam animation
│   │   ├── ScrollToTopButton.tsx  # Dynamic floating scroll-to-top button
│   │   ├── Skeleton.tsx           # Route progress bars & loading skeletons
│   │   ├── SmoothScroll.tsx       # Lenis momentum smooth scrolling engine
│   │   ├── StackedPlaybooks.tsx   # Interactive industry playbook cards
│   │   ├── TestimonialsCarousel.tsx # Enterprise client testimonial carousel
│   │   └── TypewriterHero.tsx     # Multi-phrase dynamic typewriter hero headline
│   ├── data/                      # Structured Business Data & Content
│   │   ├── careers.ts             # Active job openings, benefits & hiring stages
│   │   ├── industries.ts          # Vertical solutions (Fintech, Health, SaaS, etc.)
│   │   ├── insights.ts            # Thought leadership articles & whitepapers
│   │   ├── playbooks.ts           # Operational deployment playbooks
│   │   └── services.ts            # Detailed IT & BPO service catalog items
│   ├── hooks/                     # Custom React Hooks
│   │   └── useScrollReveal.ts     # IntersectionObserver reveal animation hook
│   ├── i18n/                      # Internationalization Engine
│   │   ├── LanguageContext.tsx    # React Context & Translation Hook (useTranslation)
│   │   └── translations/          # Localized string dictionaries (en, es, fr, de, fil, ar, zh, ja)
│   ├── pages/                     # Full-Page Route Views
│   │   ├── About.tsx              # Company mission, leadership & certifications
│   │   ├── BPOServices.tsx        # 24/7 BPO operations & support models
│   │   ├── Careers.tsx            # Global career opportunities & application form
│   │   ├── Contact.tsx            # Consultation booking & office contact details
│   │   ├── Home.tsx               # Homepage with hero, capabilities & playbooks
│   │   ├── ITServices.tsx         # Cloud & custom software engineering services
│   │   ├── Industries.tsx         # Enterprise vertical solutions
│   │   ├── Insights.tsx           # Technical insights & market reports
│   │   ├── NotFound.tsx           # Custom 404 error page
│   │   ├── Privacy.tsx            # GDPR & DPA privacy policy
│   │   ├── ServiceDetail.tsx      # Dynamic service detail drilldown view
│   │   └── Terms.tsx              # Terms of service & SLA covenants
│   ├── utils/                     # Helpers & Conversation Engines
│   │   └── avaConversationEngine.ts # Autonomous conversational logic for AVA (fallback)
│   ├── App.tsx                    # Route definitions, layout wrapper & router
│   ├── index.css                  # Tailwind CSS v4 entrypoint & brand theme tokens
│   ├── main.tsx                   # React 19 application entrypoint
│   └── vite-env.d.ts              # Vite environment typings
├── AVA-INSTRUCTIONS/              # Authoritative knowledge base consumed by AVA
├── .env.example                   # Environment variable documentation template
├── .gitignore                     # Git exclusion rules
├── .nvmrc                         # Node.js version pinning (v20)
├── DEPLOYMENT.md                  # Detailed Cloudflare Pages & GitHub deployment guide
├── metadata.json                  # Application platform manifest
├── package.json                   # Dependencies, scripts & engine requirements
├── server.ts                      # Full-stack Express server with Vite middleware (local)
├── tsconfig.json                  # TypeScript compiler configuration
├── vite.config.ts                 # Vite bundler, React plugin & Tailwind v4 setup
└── wrangler.jsonc                 # Cloudflare Pages / Workers project configuration (+ AI binding)
```

---

## 🎨 AI Developer & Contributor Design System Guide

> **MANDATORY INSTRUCTION FOR ALL AI AGENTS AND FUTURE DEVELOPERS:**
> The site follows the dark editorial design introduced in `index.html` (October 2026): black canvas, Inter black uppercase display type, hairline neutral borders, 12px cards and a single violet accent. Reuse the building blocks in `src/site/ui.tsx` instead of inventing new styles.

### 1. Where things live

| Path | Purpose |
| :--- | :--- |
| `src/site/Layout.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx` | Shell: sticky header with 5 mega-menu tabs, mobile drawer, search, footer quick links |
| `src/site/nav.ts` | **Single source** for every mega-menu subtab and footer quick link |
| `src/site/ui.tsx` | Primitives: `PageHero`, `SectionHead`, `NumberPanel`, `ListPanel`, `ImageCard`, `StoryCard`, `CtaBanner`, `Card`, `Faq`, `SplitText` |
| `src/site/content/` | Page copy from `create/Business References` (`serviceReferences.ts` and `legal/*.ts` are generated — regenerate, don’t hand-edit) |
| `src/site/media.ts` | Every image/video URL |
| `public/brand/operava-mark.svg` | OPERAVA mark (white striped circle). Favicons: `public/favicon.svg`, `favicon-*.png`, `apple-touch-icon.png` |

### 2. Color tokens (`src/index.css` `@theme`)

| Role | Token / class | Hex |
| :--- | :--- | :--- |
| Canvas | `bg-black` | `#000000` |
| Surfaces | `bg-[#0a0a0a]`, `bg-[#0f0f0f]` | `#0A0A0A` / `#0F0F0F` |
| Hairlines | `border-neutral-900` | `#171717` |
| Body / muted text | `text-neutral-300` / `-400` / `-500` | — |
| Accent (text, borders, hover) | `text-accent`, `border-accent` | `#9F67FF` (5.9:1 on black) |
| Accent fill (with white text) | `bg-accent-solid` | `#7C3AED` (5.7:1) |

### 3. Typography

- **Inter** only (400–900, Google Fonts).
- Display: `font-black uppercase leading-[0.85]` with tight tracking (hero 84–108px, sections 34–64px).
- Kickers: `text-[11px] tracking-[0.3em] uppercase text-accent font-bold`.
- Nav / buttons: `text-[11px] tracking-widest uppercase font-semibold`.

### 4. Motion (all disabled under `prefers-reduced-motion`)

- Logo gaps cut in on load and the mark quarter-turns on hover (`OperavaMark.tsx`).
- Route change: three accent lines sweep across at the mark’s 34° angle; content fades up.
- Headlines rise line-by-line; hero copy blurs in; hero images settle from a slow zoom.
- `.reveal` / `.reveal-child` stagger on scroll; `.spotlight` pointer glow on cards; `.btn-sweep` outline buttons.
- Home carousel autoplay is driven by its progress bar (pauses on hover/focus).

### 5. Content rules

- Copy comes from `create/Business References`, `BUSINESSINFO.md` and `AVA-INSTRUCTIONS/`.
- Do **not** publish unverified certifications (ISO, SOC 2, HIPAA, PCI), prices, client names, awards or performance guarantees.

### 6. Authoritative Cloudinary Media URLs

| Asset Description | Direct Cloudinary HTTPS URL |
| :--- | :--- |
| **Technology & Cloud Video** | `https://res.cloudinary.com/mgyosgsm/video/upload/Video_otwv5l.mp4` |
| **Global Workforce Video** | `https://res.cloudinary.com/mgyosgsm/video/upload/Video_nmdtfe.mp4` |
| **Business Processes Video** | `https://res.cloudinary.com/mgyosgsm/video/upload/Video_pmorrn.mp4` |
| **OPERAVA Motion Logo Video**| `https://res.cloudinary.com/mgyosgsm/video/upload/Video_ffvnwd.mp4` |
| **AVA Assistant Video Avatar**| `https://res.cloudinary.com/mgyosgsm/video/upload/Video_vpaaxl.mp4` |
| **Hero Cover Graphic** | `https://res.cloudinary.com/sdaxzncs/image/upload/v1786240859/Cover%20Photo.png` |

---

## 🤖 AVA & Cloudflare Workers AI

Production chat (`functions/api/chat.ts`) uses the **Workers AI** binding named `AI` (configured in `wrangler.jsonc`).

**Model:** `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (Llama 3.3 70B, fp8-fast — larger active variant; older 8B / non-fast 70B IDs were deprecated).

System knowledge is aligned with the markdown under **`AVA-INSTRUCTIONS/`** (company profile, services, engagement models, careers, FAQ). The client-side engine in `src/utils/avaConversationEngine.ts` remains the offline / failure fallback.

No external Gemini key is required for production. Ensure the Pages project has Workers AI enabled and the binding is present after deploy.

---

## 🚀 Local Development & Build

### Prerequisites
- Node.js version `20.x` or higher
- npm, pnpm, or bun

```bash
# 1. Clone the private repository
git clone https://github.com/jelvan-operava/Operava-Website.git
cd Operava-Website

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env
# Production AVA uses Cloudflare AI binding. GEMINI_API_KEY is only for optional local Express testing.

# 4. Start local development server (hosts on port 3000)
npm run dev

# 5. Run TypeScript typecheck & lint verification
npm run lint

# 6. Build for production
npm run build

# 7. Preview production build locally
npm run preview

# Optional: Pages + AI binding locally
npx wrangler pages dev dist
```

---

## 🚢 Deployment Guide

For complete, detailed instructions on deploying to **Cloudflare Pages**, configuring custom domains, setting edge variables, and full-stack Docker deployments, refer to:

👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

After deploy, confirm the **AI** binding is attached to the Pages project so `/api/chat` can call Workers AI.

---

## 📞 Contact & Governance

**OPERAVA Global Solutions**  
- **Website**: [https://www.operavaglobal.com](https://operavaglobal.com)  
- **Location**: Philippine-Based, operating remotely and globally  
- **Global Delivery**: North America &bull; Europe &bull; Australia &bull; Asia-Pacific  
- **Enterprise Support**: `hello@operavaglobal.com`
