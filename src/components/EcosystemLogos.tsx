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
    asset: 'https://www.maya.ph/hubfs/Maya/MAYA-Mint%20Green.svg',
  },
  {
    name: 'PayMongo',
    asset: 'https://www.paymongo.com/company/press/brand/paymongo-logo.svg',
  },
  {
    name: 'Wise Business',
    asset: 'https://wise.com/public-resources/assets/logos/wise/brand_logo.svg',
  },
  { name: 'GCash', asset: '/assets/logos/gcash.svg' },
  { name: 'ShopeePay', asset: '/assets/logos/shopeepay.svg' },
  { name: 'GrabPay', asset: '/assets/logos/grabpay.svg' },
  { name: 'Stripe', asset: '/assets/logos/stripe.svg' },
]

export default function EcosystemLogos() {
  return (
    <section aria-label="Brands Thats Trusted Us" className="relative py-8 px-4 sm:px-6 lg:px-12">
      <div className="ecosystem-float relative max-w-[1480px] mx-auto rounded-2xl border border-neutral-800 bg-[#0c0c12]/95 shadow-[0_22px_55px_rgba(0,0,0,.25)] backdrop-blur-xl px-5 sm:px-8 py-8">
        <h2 className="text-center text-lg sm:text-xl font-black mb-7">
          Brands Thats Trusted Us
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 items-stretch gap-3 sm:gap-4">
          {brands.map(({ name, asset }) => (
            <div key={name} className="ecosystem-logo min-h-[112px] rounded-xl border border-neutral-800/60 bg-white flex flex-col items-center justify-center p-3 sm:p-4" title={name}>
              <div className="h-12 w-full flex items-center justify-center">
                <img
                  src={asset}
                  alt={name + ' logo'}
                  loading="lazy"
                  decoding="async"
                  width="160"
                  height="48"
                  className="block w-full max-w-[160px] h-11 object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
