# Image and SVG asset sources

## Original OPERAVA photos

The `public/media/operava-scene-*.webp` images are optimized versions of original AI-generated corporate scenes for OPERAVA, with Filipino-looking, fictional professionals, distinct tasks and the OPERAVA purple/black visual language. They are illustrative brand visuals, **not documentary photographs of actual OPERAVA employees or offices**.

Catalogue cards are assigned unique image asset files. For images displayed in service, automation, or industry catalogues, avoid pointing multiple cards at the same photo.

## Social icons

The social-network SVGs in `public/social/brand-*.svg` are adapted from [Tabler Icons](https://github.com/tabler/tabler-icons) under its [MIT license](https://github.com/tabler/tabler-icons/blob/main/LICENSE).

- [Facebook SVG](https://github.com/tabler/tabler-icons/blob/main/icons/outline/brand-facebook.svg)
- [X SVG](https://github.com/tabler/tabler-icons/blob/main/icons/outline/brand-x.svg)
- [LinkedIn SVG](https://github.com/tabler/tabler-icons/blob/main/icons/outline/brand-linkedin.svg)
- [Instagram SVG](https://github.com/tabler/tabler-icons/blob/main/icons/outline/brand-instagram.svg)
- [TikTok SVG](https://github.com/tabler/tabler-icons/blob/main/icons/outline/brand-tiktok.svg)

Brand names and trademarks remain property of their respective owners. Icons are provided for linking to OPERAVA's public profiles.

## Complete payment and business-platform logos

The payment/technology showcase in `src/components/EcosystemLogos.tsx` uses full brand artwork with readable brand names; no external logo paths at `www.operavaglobal.com/assets/logos/` are used, because those URLs previously returned HTTP 404.

Local SVG artwork in `public/assets/logos/`:

- **Visa, Mastercard, Apple Pay, Meta, TikTok, Apple, Zoho, Google, Stripe:** [gilbarbara/logos on GitHub](https://github.com/gilbarbara/logos), curated original-brand vector paths. Individual source URLs use `logos/<brand>.svg` in that repository. All brands retain their independent trademarks.
- **GCash:** `assets/icons/gcash.svg` in [PalengkeGo/PalengkeGoApp](https://github.com/PalengkeGo/PalengkeGoApp), derived from [GCash logo.svg on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:GCash_logo.svg) (public-domain text logo, trademark retained).

Owner-hosted, full brand wordmarks:

- **Maya (formerly PayMaya):** `https://www.maya.ph/hubfs/Maya/MAYA-Mint%20Green.svg` (official Maya site). For provenance, see also [Maya logo.svg on Commons](https://commons.wikimedia.org/wiki/File:Maya_logo.svg), credited to Maya Bank, Inc. and PayMaya Philippines, Inc. under CC BY 4.0.
- **PayMongo:** `https://www.paymongo.com/company/press/brand/paymongo-logo.svg`, PayMongo's [official press kit](https://www.paymongo.com/company/press). Use unmodified artwork on light background.
- **Wise Business:** Wise wordmark from `https://wise.com/public-resources/assets/logos/wise/brand_logo.svg`, identified as the Wise Business offering through the adjacent card label; [Wise press site](https://wise.com/gb/press).

The presence of logos is for brand identification and does **not** imply payment-method acceptance, merchant account approval, integrations, business relationships, authorization, or endorsements.
