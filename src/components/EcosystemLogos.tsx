import { useState } from 'react'

/**
 * Locally hosted, OPERAVA-supplied 2400x800 WebP logos. displayWidth compensates
 * for generous white padding within the original artwork, avoiding distortion.
 * Stripe remains an SVG because its replacement image was not supplied.
 * Logo inclusion is informational; it does not imply a partnership.
 */
type Brand = {
  name: string
  asset: string
  displayWidth?: number
}

const brands: Brand[] = [
  { name: 'Visa', asset: '/assets/logos/visa.webp', displayWidth: 442 },
  { name: 'Mastercard', asset: '/assets/logos/mastercard.webp', displayWidth: 392 },
  { name: 'Apple Pay', asset: '/assets/logos/apple-pay.webp', displayWidth: 239 },
  { name: 'Meta', asset: '/assets/logos/meta.webp', displayWidth: 440 },
  { name: 'TikTok', asset: '/assets/logos/tiktok.webp', displayWidth: 240 },
  { name: 'Apple', asset: '/assets/logos/apple.webp', displayWidth: 147 },
  { name: 'Zoho', asset: '/assets/logos/zoho.webp', displayWidth: 372 },
  { name: 'Google', asset: '/assets/logos/google.webp', displayWidth: 177 },
  {
    name: 'Maya',
    asset: '/assets/logos/maya.webp', displayWidth: 440,
  },
  {
    name: 'PayMongo',
    asset: '/assets/logos/paymongo.webp', displayWidth: 440,
  },
  {
    name: 'Wise Business',
    asset: '/assets/logos/wise.webp', displayWidth: 442,
  },
  { name: 'GCash', asset: '/assets/logos/gcash.webp', displayWidth: 504 },
  { name: 'ShopeePay', asset: '/assets/logos/shopeepay.webp', displayWidth: 543 },
  { name: 'GrabPay', asset: '/assets/logos/grabpay.webp', displayWidth: 481 },
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
          {brands.map(({ name, asset, displayWidth }) => (
            <button
              key={name}
              type="button"
              aria-label={`Highlight ${name} logo`}
              aria-pressed={activeBrand === name}
              onClick={() => setActiveBrand((current) => current === name ? null : name)}
              className="ecosystem-logo ecosystem-logo--interactive min-h-[112px] w-full rounded-xl border border-neutral-800/60 bg-white flex flex-col items-center justify-center p-3 sm:p-4"
              title={name}
            >
              <div className="h-12 w-full flex items-center justify-center overflow-hidden">
                <img
                  src={asset}
                  alt={name + ' logo'}
                  loading="eager"
                  decoding="async"
                  width={displayWidth ? 2400 : 160}
                  height={displayWidth ? 800 : 48}
                  className={displayWidth ? 'block h-auto max-w-none shrink-0 object-contain' : 'block w-full max-w-[160px] h-11 object-contain'}
                  style={displayWidth ? { width: displayWidth } : undefined}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
