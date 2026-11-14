# Email HTML Marketing

This is the email-marketing source folder inside the **Operava-Global/Operava-Website-V2** repository. It is not a separate GitHub repository.

## Purpose

A branded Operava Global Solutions email preview for the AI Specialist / Engineer application update. The existing message, decision, explanation, and next-step content have been preserved.

## Folder contents

```text
email-html-marketing/
├── App.tsx
├── index.css
├── readme.md
└── assets/
    ├── 0eaaabe8d2e5d9f6-operava_hero.png
    ├── 2d71eead6d18f1e9-operava_ai_specialist.png
    ├── 5d5075bb5016bc1a-operava_future.png
    ├── 12a55ecd7a76734b-image_20261114_082603.webp
    ├── 951e26451b507c7d-image_20261114_082606.webp
    ├── c3030fc0862f72c4-image_20261114_082607.webp
    ├── OPERAVA_Business_Automation_with_Confidentiality.pdf
    ├── OPERAVA_Business_Outsourcing_with_Confidentiality.pdf
    └── OPERAVA_IT_Services_with_Confidentiality.pdf
```

The three PNG images listed above are used by `App.tsx`. The imports are relative to this folder (for example, `./assets/...`) so they do not depend on a local container or machine-specific path. The existing supplemental WebP assets and three Operava service collateral PDFs are retained in this folder. The PDFs are not currently linked from the React preview component.

## Content placeholders

Before sending a personalized message, replace the placeholders in `App.tsx`:

- `[First Name]`
- `[Your Name]`
- `[Your Title]`
- `careers@yourdomain.com`

The careers address is still a placeholder in the source; it has intentionally not been replaced with an assumed mailbox.

## Build and publishing note

This folder contains a React email-preview component and its stylesheet. It is stored at the repository root, outside the main Vite application's `src/main.tsx` entry point. Renaming this source folder does **not** by itself publish a live `/email-html-marketing/` URL or generate a standalone, email-client-ready HTML file.

To publish it as a website preview or generate a production email HTML artifact, it needs a dedicated build/export step or a static output under `public/`. No production route, Cloudflare Pages configuration, or deployment has been changed as part of this folder rename.

## Preserve

- Keep the email preview separate from the main website homepage.
- Keep all referenced images under `assets/`.
- Preserve responsive layout and the existing email copy unless a separate content update is requested.
