import { useLocation } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, ListPanel, SolidButton, OutlineButton } from '../site/ui'

export default function NotFound() {
  const { pathname } = useLocation()
  usePageMeta({ title: 'Page not found', description: 'The page you were looking for could not be found on operavaglobal.com.' })

  return (
    <Page className="py-16 lg:py-24">
      <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold">Error 404</p>
      <h1 className="mt-6 text-[56px] sm:text-[80px] lg:text-[128px] font-black uppercase leading-[0.85] tracking-[-0.04em]">
        Page not
        <br />
        <span className="text-neutral-600">found</span>
      </h1>
      <p className="mt-8 max-w-[560px] text-neutral-400 leading-relaxed">
        <span className="font-mono text-neutral-300 break-all">{pathname}</span> doesn’t exist or has moved. Try one of these instead, or use search in
        the header.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <SolidButton to="/">Back to home →</SolidButton>
        <OutlineButton to="/contact" className="h-12 px-8">
          Contact us
        </OutlineButton>
      </div>
      <div className="mt-16">
        <ListPanel
          cols="lg:grid-cols-3"
          items={[
            { label: 'Services', to: '/services' },
            { label: 'Industries', to: '/industries' },
            { label: 'Insights', to: '/insights' },
            { label: 'Careers', to: '/careers' },
            { label: 'About', to: '/about' },
            { label: 'FAQ', to: '/faq' },
          ]}
        />
      </div>
    </Page>
  )
}
