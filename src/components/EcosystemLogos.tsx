/**
 * Complete brand artwork (wordmarks where provided) from the owners' press kits
 * and openly available logo assets, not icon-only substitutes.
 *
 * Logo inclusion is informational and does not imply OPERAVA accepts all these
 * payment methods or has a partnership / merchant integration with any brand.
 */
type Brand = {
  name: string
  asset: string
  subtitle?: string
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
    asset: 'https://www.maya.ph/hubfs/Maya/MAYA-Mint%20Green.svg',
  },
  {
    name: 'PayMongo',
    asset: 'https://www.paymongo.com/company/press/brand/paymongo-logo.svg',
  },
  {
    name: 'Wise Business',
    subtitle: 'Business payments',
    asset: 'https://wise.com/public-resources/assets/logos/wise/brand_logo.svg',
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
          {brands.map(({ name, asset, subtitle }) => (
            <div key={name} className="ecosystem-logo min-h-[112px] rounded-xl border border-neutral-800/60 bg-white flex flex-col items-center justify-center p-3 sm:p-4" title={name}>
              <div className="h-12 w-full flex items-center justify-center">
                <img
                  src={asset}
                  alt={name + ' full brand logo'}
                  loading="lazy"
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
        <p className="text-center text-neutral-500 text-[11px] leading-relaxed mt-6 max-w-[960px] mx-auto">
          Illustrative references to independent payment, commerce and technology brands.
          Their inclusion does not confirm availability as an OPERAVA payment method, integration,
          client, partner or endorsement. All trademarks belong to their respective owners.
        </p>
      </div>
    </section>
  )
}
