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
  subtitle?: string
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
    subtitle: 'Formerly PayMaya',
    asset: '/assets/logos/maya.svg',
    darkBackground: true,
  },
  {
    name: 'PayMongo',
    asset: '/assets/logos/paymongo.svg',
  },
  {
    name: 'Wise Business',
    subtitle: 'Business payments',
    asset: '/assets/logos/wise.svg',
    darkBackground: true,
  },
  { name: 'GCash', asset: '/assets/logos/gcash.svg' },
  { name: 'Stripe', asset: '/assets/logos/stripe.svg' },
]

export default function EcosystemLogos() {
  return (
    <section aria-label="Payment, commerce and business platform logos" className="relative py-8 px-4 sm:px-6 lg:px-12">
      <div className="ecosystem-float relative max-w-[1480px] mx-auto rounded-2xl border border-neutral-800 bg-[#0c0c12]/95 shadow-[0_22px_55px_rgba(0,0,0,.25)] backdrop-blur-xl px-5 sm:px-8 py-8">
        <p className="text-center uppercase font-bold text-[10px] sm:text-[11px] tracking-[.2em] text-neutral-400">
          Payment, commerce and business platform landscape
        </p>
        <h2 className="text-center text-lg sm:text-xl font-black mt-2 mb-7">
          Platforms businesses recognize
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 items-stretch gap-3 sm:gap-4">
          {brands.map(({ name, asset, subtitle, darkBackground }) => (
            <div key={name} className={`ecosystem-logo min-h-[112px] rounded-xl border border-neutral-800/60 bg-white flex flex-col items-center justify-center p-3 sm:p-4 ${darkBackground ? "ecosystem-logo--contrast" : ""}`} title={name}>
              <div className="h-12 w-full flex items-center justify-center">
                <img
                  src={asset}
                  alt={name + ' full brand logo'}
                  loading="eager"
                  decoding="async"
                  width="160"
                  height="48"
                  className="block w-full max-w-[160px] h-11 object-contain"
                />
              </div>
              <p className="text-[#201a29] font-semibold text-[11px] text-center mt-2 leading-tight">
                {name}
              </p>
              {subtitle && <p className="text-[#655b72] text-[10px] text-center mt-1 leading-tight">{subtitle}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
