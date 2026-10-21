import { useState } from 'react'

/**
 * Complete brand artwork (wordmarks where provided) from the owners' press kits
 * and openly available logo assets, not icon-only substitutes.
 *
 * Locally hosted originals avoid third-party hotlinking; pale brand art is shown
 * on dark cards to maintain its intended contrast in light and dark themes.
 * Logo inclusion is informational and does not imply OPERAVA accepts all these
 * payment methods or has a partnership / merchant integration with any brand.
 */
type Brand = {
  name: string
  asset: string
  darkBackground?: boolean
}

const brands: Brand[] = [
  { name: 'Visa', asset: '/assets/logos/visa.svg' },
  { name: 'Mastercard', asset: '/assets/logos/mastercard.svg' },
  { name: 'Apple Pay', asset: '/assets/logos/apple-pay.svg' },
  { name: 'Meta', asset: '/assets/logos/meta.svg' },
  { name: 'TikTok', asset: '/assets/logos/tiktok.svg' },
  { name: 'Apple', asset: '/assets/logos/apple.svg' },
  { name: 'Zoho', asset: '/assets/logos/zoho.svg' },
  { name: 'Google', asset: '/assets/logos/google.svg' },
  {
    name: 'Maya',
    asset: '/assets/logos/maya.svg',
    darkBackground: true,
  },
  {
    name: 'PayMongo',
    asset: '/assets/logos/paymongo.svg',
  },
  {
    name: 'Wise Business',
    asset: '/assets/logos/wise.svg',
    darkBackground: true,
  },
  { name: 'GCash', asset: '/assets/logos/gcash.svg' },
  { name: 'ShopeePay', asset: '/assets/logos/shopeepay.svg' },
  { name: 'GrabPay', asset: '/assets/logos/grabpay.svg' },
  { name: 'Stripe', asset: '/assets/logos/stripe.svg' },
]

export default function EcosystemLogos() {
  const [activeBrand, setActiveBrand] = useState<string | null>(null)

  return (
    <section aria-label="Brands Thats Trusted Us" className="relative py-8 px-4 sm:px-6 lg:px-12">
      <div className="ecosystem-float relative max-w-[1480px] mx-auto rounded-2xl border border-neutral-800 bg-[#0c0c12]/95 shadow-[0_22px_55px_rgba(0,0,0,.25)] backdrop-blur-xl px-5 sm:px-8 py-8">
        <h2 className="text-center text-lg sm:text-xl font-black mb-7">
          Brands Thats Trusted Us
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 items-stretch gap-3 sm:gap-4">
          {brands.map(({ name, asset, darkBackground }) => (
            <button
              key={name}
              type="button"
              aria-label={`Highlight ${name} logo`}
              aria-pressed={activeBrand === name}
              onClick={() => setActiveBrand((current) => current === name ? null : name)}
              className={`ecosystem-logo ecosystem-logo--interactive min-h-[112px] w-full rounded-xl border border-neutral-800/60 bg-white flex flex-col items-center justify-center p-3 sm:p-4 ${darkBackground ? "ecosystem-logo--contrast" : ""}`}
              title={name}
            >
              <div className="h-12 w-full flex items-center justify-center">
                <img
                  src={asset}
                  alt={name + ' logo'}
                  loading="eager"
                  decoding="async"
                  width="160"
                  height="48"
                  className="block w-full max-w-[160px] h-11 object-contain"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
