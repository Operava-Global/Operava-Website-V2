import '../site/philgeps-approved.css'

/**
 * PhilGEPS "Approved Merchant / Partner" band, rendered above the site footer.
 * Phones get the stacked 4:3 composition; wider screens get the panorama.
 * The Procurement Service + PhilGEPS logo is shown unmodified as its own layer.
 */
const ART = '/media/philgeps'

export default function PhilgepsApproved() {
  return (
    <section className="pg-approved" aria-labelledby="pg-approved-title">
      <div className="pg-card">
        <div className="pg-stage">
          <picture>
            <source media="(min-width: 768px)" srcSet={`${ART}/philgeps-buildings-desktop.webp`} width={2400} height={960} />
            <img
              className="pg-buildings"
              src={`${ART}/philgeps-buildings-mobile.webp`}
              width={1600}
              height={1100}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="pg-wash" aria-hidden="true" />
          <img
            className="pg-logo"
            src={`${ART}/philgeps-ps-logo.webp`}
            width={1800}
            height={980}
            alt="Procurement Service and PhilGEPS (Philippine Government Electronic Procurement System) logo"
            loading="lazy"
            decoding="async"
          />
          <h2 id="pg-approved-title" className="pg-head">
            <span className="pg-approved-row">
              <svg className="pg-shield" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="pg-shield-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#2bb35a" />
                    <stop offset="1" stopColor="#127a37" />
                  </linearGradient>
                </defs>
                <path d="M60 4 L114 22 V66 C114 100 90 124 60 136 C30 124 6 100 6 66 V22 Z" fill="url(#pg-shield-fill)" />
                <path
                  d="M60 14 L105 29 V66 C105 95 85 115 60 126 C35 115 15 95 15 66 V29 Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity=".35"
                  strokeWidth="3"
                />
                <path d="M34 70 L53 89 L88 50" fill="none" stroke="#ffffff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="pg-word">Approved</span>
            </span>
            <span className="pg-pill">
              Merchant<b>/</b>Partner
            </span>
          </h2>
        </div>
        <p className="pg-caption">
          <b>PhilGEPS</b>{' '}
          <span aria-hidden="true">—</span>{' '}
          Philippine Government Electronic Procurement System
        </p>
      </div>
    </section>
  )
}
