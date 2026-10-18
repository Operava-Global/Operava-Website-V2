import { useState, type FormEvent } from 'react'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SplitText } from '../site/ui'
import { verificationEmail } from '../data/contacts'
import { normalizeReferenceId } from '../data/documentVerifications'
import { LOCAL } from '../site/media'

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'verified'; referenceId: string; title?: string; issuedAt?: string }
  | { status: 'not_found'; referenceId: string }
  | { status: 'error'; message: string }

export default function Verification() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<LookupState>({ status: 'idle' })

  usePageMeta({
    title: 'Document Verification',
    description: 'Verify an OPERAVA-issued document reference ID in the official OPERAVA Global Solutions registry.',
    crumbs: [{ name: 'Document Verification', path: '/verification' }],
  })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const id = normalizeReferenceId(query)
    if (!id) {
      setResult({ status: 'error', message: 'Enter a document reference ID.' })
      return
    }
    setResult({ status: 'loading' })
    try {
      const res = await fetch(`/api/verification/lookup?id=${encodeURIComponent(id)}`)
      const data = (await res.json()) as {
        verified?: boolean
        referenceId?: string
        title?: string
        issuedAt?: string
        message?: string
      }
      if (!res.ok) {
        setResult({ status: 'error', message: data.message || 'Lookup failed. Try again.' })
        return
      }
      if (data.verified && data.referenceId) {
        setResult({ status: 'verified', referenceId: data.referenceId, title: data.title, issuedAt: data.issuedAt })
      } else {
        setResult({ status: 'not_found', referenceId: id })
      }
    } catch {
      setResult({ status: 'error', message: 'Network error. Please try again.' })
    }
  }

  return (
    <Page>
      <Crumbs items={[{ label: 'About', to: '/about' }, { label: 'Document Verification' }]} />
      <PageHero
        image={LOCAL.dataCenter}
        alt="OPERAVA verification portal"
        kicker="Verification portal"
        title={
          <>
            Document
            <br />
            verification
          </>
        }
        lead="Enter the reference ID issued by OPERAVA Global Solutions to confirm whether it is verified in our registry."
        height="h-[440px]"
      />

      <section className="max-w-3xl mx-auto py-12 lg:py-16">
        <form onSubmit={onSubmit} className="bg-[#0a0a0a] border border-neutral-900 rounded-[12px] p-6 sm:p-8 lg:p-10" role="search">
          <label htmlFor="doc-id" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-3">
            Document reference ID
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              id="doc-id"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. OPERAVA-DOC-00000001"
              className="flex-1 min-w-0 bg-black border border-neutral-800 px-5 h-12 text-sm font-mono tracking-wider uppercase outline-none focus:border-accent placeholder:text-neutral-600"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={result.status === 'loading'}
              className="h-12 px-8 bg-white text-black text-xs tracking-widest font-bold uppercase hover:bg-accent-solid hover:text-white transition-colors disabled:opacity-60"
            >
              {result.status === 'loading' ? 'Checking…' : 'Verify'}
            </button>
          </div>
        </form>

        <div className="mt-6" aria-live="polite">
          {result.status === 'verified' && (
            <div className="border border-emerald-500/40 bg-emerald-500/5 rounded-[12px] p-8">
              <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 font-bold">✓ Verified</p>
              <p className="mt-4 font-mono text-lg font-bold">{result.referenceId}</p>
              {result.title && <p className="mt-2 text-sm text-neutral-300">Record: {result.title}</p>}
              {result.issuedAt && <p className="mt-1 text-xs text-neutral-500">Issued: {result.issuedAt}</p>}
              <p className="mt-6 pt-6 border-t border-neutral-800 text-xs text-neutral-400 leading-relaxed">
                This ID is verified and issued by <strong className="text-white">OPERAVA GLOBAL SOLUTIONS</strong>. Document content may be updated or
                changed over time; this verification confirms only the reference ID provided. For the specific content of a document, email the
                Verification Team at{' '}
                <a href={`mailto:${verificationEmail}`} className="text-white underline underline-offset-4">
                  {verificationEmail}
                </a>
                .
              </p>
            </div>
          )}
          {result.status === 'not_found' && (
            <div className="border border-amber-500/40 bg-amber-500/5 rounded-[12px] p-8">
              <p className="text-[11px] tracking-[0.3em] uppercase text-amber-400 font-bold">Not found</p>
              <p className="mt-4 text-sm text-neutral-300">
                No verified record for <span className="font-mono font-semibold text-white">{result.referenceId}</span>.
              </p>
              <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
                Double-check the ID. If you believe this is an error, contact{' '}
                <a href={`mailto:${verificationEmail}`} className="text-white underline underline-offset-4">
                  {verificationEmail}
                </a>
                .
              </p>
            </div>
          )}
          {result.status === 'error' && (
            <div role="alert" className="border border-red-500/40 bg-red-500/10 rounded-[12px] p-5 text-sm text-red-300">
              {result.message}
            </div>
          )}
        </div>
      </section>

      <SplitText label="About verification" title={<>What this confirms</>}>
        <p>
          The portal checks whether a reference ID printed on an OPERAVA-issued document — such as an employment or engagement record — exists in the
          official registry. It does not display the document itself.
        </p>
        <p className="text-neutral-400">
          <span className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold">Need more?</span> For confirmation of specific document content beyond the ID status, email{' '}
          <a href={`mailto:${verificationEmail}`} className="text-white underline underline-offset-4">
            {verificationEmail}
          </a>
          .
        </p>
      </SplitText>
    </Page>
  )
}
