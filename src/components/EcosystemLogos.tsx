/** Mirrors the exact platform-logo assets displayed on the original public OPERAVA website.
 * Logos identify third-party products; presence here does not imply endorsement or partnership.
 */
const platforms = [
  ['Visa', 'visa.svg'], ['Mastercard', 'mastercard.svg'], ['Apple Pay', 'apple-pay.svg'],
  ['Meta', 'meta.svg'], ['TikTok', 'tiktok.svg'], ['Apple', 'apple.svg'],
  ['Zoho', 'zoho.svg'], ['Google', 'google.svg'],
] as const

export default function EcosystemLogos() {
  return (
    <section aria-label="Platform ecosystem" className="border-y border-neutral-900 px-6 lg:px-12 py-8 lg:py-10">
      <div className="max-w-[1450px] mx-auto">
        <p className="text-[10px] uppercase tracking-[.24em] font-semibold text-neutral-500 text-center mb-7">Payment, commerce, and business platforms in the OPERAVA ecosystem</p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-7 items-center justify-items-center">
          {platforms.map(([name, file]) => (
            <div key={name} title={name} className="ecosystem-logo flex items-center justify-center w-full min-h-11 px-2" aria-label={name}>
              <img src={`https://www.operavaglobal.com/assets/logos/${file}`} alt={name} width="102" height="35" loading="lazy" className="object-contain max-h-9 max-w-full" />
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-neutral-500 mt-6">Illustrative technology and payment ecosystems only. All trademarks belong to their respective owners; no partnership or endorsement is implied.</p>
      </div>
    </section>
  )
}
