# OPERAVA Global Solutions — Website Version Archive

**Last verified:** 23 October 2026 (Cloudflare Pages deployment metadata and fresh desktop captures).

> **Only [operavaglobal.com](https://operavaglobal.com) is the current official OPERAVA website.** The three `pages.dev` entries below are former or alternate website deployments retained as historical references. Do not send clients to these legacy addresses as the official company site.

## Version register

| Version label | Classification | URL / Pages project | Last successful **production** deployment (UTC) | Deployed revision |
| --- | --- | --- | --- | --- |
| **v1 — Legacy original** | Historical, superseded website | [operava-website.pages.dev](https://operava-website.pages.dev) / `operava-website` | 2026-09-28 10:38 | `67b81bc3b1e8` |
| **v2 — Legacy official-named copy** | Historical, superseded website | [operava-global-official-website.pages.dev](https://operava-global-official-website.pages.dev) / `operava-global-official-website` | 2026-10-11 21:49 | `4b3f7dfa93ca` |
| **v3 — Legacy alternate website & utilities** | Historical variant, not official | [newwebsite-7jn.pages.dev](https://newwebsite-7jn.pages.dev) / `newwebsite` | 2026-10-20 08:38 | `6ee27b017dab` |
| **v4 — CURRENT OFFICIAL** | **Current production website** | [operavaglobal.com](https://operavaglobal.com) and [www](https://www.operavaglobal.com) / `ax-website` | 2026-10-21 10:36 | `251ae3c4a54f` |

**Verified GitHub source mapping:** v1's deployed commit exists in the history of [`Dev-Jel-Works/Operava-Website`](https://github.com/Dev-Jel-Works/Operava-Website), also the source of the current v4 site (branch `main`). v2's deployed commit exists in [`Dev-Jel-Works/Website`](https://github.com/Dev-Jel-Works/Website) ([archived v2 README](https://github.com/Dev-Jel-Works/Website/blob/main/README.md)). v3's deployed commit exists in [`Dev-Jel-Works/newwebsite`](https://github.com/Dev-Jel-Works/newwebsite) ([archived v3 README](https://github.com/Dev-Jel-Works/newwebsite/blob/main/README.md)). **Do not infer that v1 → v2 → v3 → v4 are successive revisions of the same repository.** These are archive catalogue labels; v2 and v3 came from different repository histories.

## Verified desktop screenshots

All images below were captured **23 October 2026** directly from the listed public URLs, using Cloudflare Browser Rendering at a 1280×800 desktop viewport. Each screenshot captures the *site as it appeared on the capture date*, not a reconstruction of the page on its deployment date. The date in the version register is from deployment records and is separate from the screenshot capture date.

### v1 — Legacy original

**URL:** https://operava-website.pages.dev

![v1 archived website — captured 23 Oct 2026](screenshots/v1-legacy-website.png)

### v2 — Legacy official-named copy

**URL:** https://operava-global-official-website.pages.dev

![v2 archived website — captured 23 Oct 2026](screenshots/v2-legacy-official-copy.png)

### v3 — Legacy alternate website and utilities

**URL:** https://newwebsite-7jn.pages.dev

![v3 archived website — captured 23 Oct 2026](screenshots/v3-legacy-newwebsite.png)

### v4 — CURRENT OFFICIAL

**URL:** https://operavaglobal.com

![Current official website — captured 23 Oct 2026](screenshots/v4-current-official.png)

## Release and publishing rules

1. **One production identity:** `operavaglobal.com` and `www.operavaglobal.com` only. Both map to Cloudflare Pages project `ax-website`. For future official releases, deploy and verify that project; do not update an older Pages project expecting to change the live site.
2. **Archival URLs:** Retain `operava-website.pages.dev`, `operava-global-official-website.pages.dev` and `newwebsite-7jn.pages.dev` as reference deployments. Their names are immutable in place on Cloudflare Pages; recreating and deleting them to rename URLs would break the references.
3. **Historic sources:** Keep old repositories and production commits for auditability. The version labels in this document describe deployed website snapshots, not Git tags or proof of a single code lineage.
4. **Future release process:** Record production deployment time, production commit, feature notes and a screenshot in this archive when publishing a new official version. Test desktop/mobile, links, forms, search indexing, security headers and error routes. Do not assume a successful build means these are functioning.
5. **Rollback:** Use the known-good production deployment in the `ax-website` Pages deployment history after verification; do not point the official domain to the legacy projects without an explicit migration decision.
6. **No deployment changes in this documentation-only archive:** Screenshots, labels and Markdown are documentation; no DNS, routing, project deletion, frontend source code or customer traffic changes are intended.

## Provenance and limits

- Source: Cloudflare Pages project metadata and production/canonical deployment records checked 23 October 2026.
- Main domain: active `operavaglobal.com` DNS CNAME to `ax-website-c4y.pages.dev`.
- Screenshot method: Cloudflare Browser Rendering `/browser-rendering/snapshot`, desktop width 1280 pixels, initial viewport 800 pixels; screenshot is a current visual sample, **not** an exhaustive visual/functional audit.
- The live project’s `latest_deployment` can be a *preview*. For v4 the table uses its **canonical production deployment** from 21 Oct 2026, not the later-created preview on that same day.
- A Pages deployment marked `success` does not itself verify authentication, email sending, payments or API correctness.
