/** Platform logos mirror the eight SVG assets on the original OPERAVA website.
 * Independent platform trademarks are shown only as ecosystem references,
 * not as proof of a contractual partnership or endorsement.
 */
const platforms = [
  {name:'Visa',file:'visa.svg'},
  {name:'Mastercard',file:'mastercard.svg'},
  {name:'Apple Pay',file:'apple-pay.svg'},
  {name:'Meta',file:'meta.svg'},
  {name:'TikTok',file:'tiktok.svg'},
  {name:'Apple',file:'apple.svg'},
  {name:'Zoho',file:'zoho.svg'},
  {name:'Google',file:'google.svg'},
] as const

export default function EcosystemLogos() {
  return (
    <section aria-label="Technology and commerce platform ecosystem" className="relative py-7 px-4 sm:px-6 lg:px-12">
      <div className="ecosystem-float relative max-w-[1480px] mx-auto rounded-2xl border border-neutral-800 bg-[#0c0c12]/95 shadow-[0_22px_55px_rgba(0,0,0,.25)] backdrop-blur-xl px-5 sm:px-8 py-7">
        <p className="text-center uppercase font-bold text-[10px] sm:text-[11px] tracking-[.2em] text-neutral-400 mb-6">Platforms across the OPERAVA technology & commerce ecosystem</p>
        <div className="grid grid-cols-4 md:grid-cols-8 items-center gap-3 sm:gap-4">
          {platforms.map(({name,file}) => (
            <div key={name} title={name} className="ecosystem-logo min-h-16 rounded-lg border border-neutral-800/60 bg-[#101017] flex items-center justify-center px-3 py-4">
              <img src={`https://www.operavaglobal.com/assets/logos/${file}`} alt={name} loading="lazy" width="120" height="40" className="h-8 sm:h-9 w-full object-contain" />
            </div>
          ))}
        </div>
        <p className="text-center text-neutral-500 text-[10px] leading-relaxed mt-5 max-w-[790px] mx-auto">Trademarks belong to their respective owners. Logos are illustrative platform references and do not represent an endorsement, authorized partnership, or client relationship.</p>
      </div>
    </section>
  )
}
