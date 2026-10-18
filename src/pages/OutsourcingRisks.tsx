import { Link } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, Section, SectionHead } from '../site/ui'
import { PHOTO } from '../site/media'

const scenarios = [
  {
    name:'Direct-hire VA with unrestricted accounts',
    sector:'Virtual assistance · Access security',
    situation:'A business owner hires a freelance assistant and gives them a shared inbox password, billing access and administrator privileges to move quickly.',
    risk:'When responsibilities change, the business cannot reliably tell who took which action or whether old devices and sessions still have access.',
    response:'Scope role-specific access, use named accounts and MFA, assign a manager to approve sensitive actions, log changes, and rehearse account offboarding.',
    operava:'A proposed OPERAVA virtual-assistance engagement could define task boundaries, shared SOPs, review checkpoints, and access handover responsibilities.',
  },
  {
    name:'One-person dependency during a busy week',
    sector:'Remote workforce · Continuity',
    situation:'A single direct-hire assistant owns the company calendar, order issues, vendor messages and undocumented spreadsheet processes.',
    risk:'An unexpected absence or resignation causes a backlog because no one knows the current status, workarounds or the escalation rules.',
    response:'Create a shared task register, process playbooks, coverage priorities, cross-training, and a named backup before demand peaks.',
    operava:'OPERAVA can scope a documented delivery plan, management reporting, and additional coverage options when continuity is a critical requirement.',
  },
  {
    name:'Customer support without quality standards',
    sector:'BPO · Brand consistency',
    situation:'Support is outsourced casually, but agents use personal scripts and inconsistent refund authority across chat, email and calls.',
    risk:'Customers receive conflicting answers, recurring defects remain invisible, and escalations go unanswered or duplicate refunds are issued.',
    response:'Create approved knowledge articles, a QA sampling process, refund limits, escalation ownership, service-level targets and customer feedback reviews.',
    operava:'A scoped customer service team can work against approved scripts, tracked queues and an agreed quality and reporting cadence.',
  },
  {
    name:'Sensitive files in an unmanaged workflow',
    sector:'Data processing · Privacy',
    situation:'A business emails HR records, customer identities or supplier documents to multiple external assistants without access or retention rules.',
    risk:'Sensitive information could be copied, retained too long, exposed through unmanaged devices, or sent to unapproved third-party tools.',
    response:'Classify data, minimize what is shared, agree lawful processing terms, use secure repositories, restrict exports, and define deletion and breach response.',
    operava:'OPERAVA can help document handling requirements and implement controls agreed with the client and relevant privacy advisers.',
  },
  {
    name:'Automation silently sends the wrong action',
    sector:'AI & workflow automation · Reliability',
    situation:'An automated workflow emails customers, updates invoices or triggers approvals without validation, monitoring or a manual override.',
    risk:'Incorrect records, accidental notifications or repeated actions can scale faster than staff can detect and reverse them.',
    response:'Run test cases, place approval gates on consequential actions, validate inputs, enforce idempotency, monitor failures and maintain a rollback path.',
    operava:'An automation engagement can explicitly include exception paths, logging, review steps and post-launch operational monitoring.',
  },
  {
    name:'Software vendor lock-in and abandoned code',
    sector:'Technology · Delivery ownership',
    situation:'A small business commissions a portal without clarifying code ownership, documentation, hosting accounts, service levels or support after launch.',
    risk:'The company may be unable to maintain critical operations, transfer hosting, fix vulnerabilities or commission another developer.',
    response:'Specify deliverable ownership, repository access, documentation, test evidence, credentials custody, backups, acceptance milestones and exit terms.',
    operava:'OPERAVA could scope repository handover, architecture documentation, releases and support expectations as part of a transparent proposal.',
  },
  {
    name:'Invoice fraud through weak approvals',
    sector:'Finance operations · Fraud',
    situation:'A virtual assistant or finance workflow can change bank details and initiate payment based on a single email instruction.',
    risk:'A spoofed request or compromised mailbox might redirect payments with no independent verification.',
    response:'Use dual approval, trusted-channel verification for bank changes, limited privileges, change logs and exception reporting.',
    operava:'Back-office or finance automation delivery can separate preparation from approval and provide visible exception tracking.',
  },
  {
    name:'Unclear contracts and cross-border obligations',
    sector:'Hiring & outsourcing · Governance',
    situation:'A company hires remotely across borders without documenting worker classification, confidentiality, deliverables or personal-data handling.',
    risk:'Ambiguous accountability, labor obligations and data-processing requirements can lead to disputes or compliance work later.',
    response:'Use locally informed legal advice, clear written terms, scope, confidentiality, IP assignment, invoicing, privacy roles and escalation procedures.',
    operava:'OPERAVA may propose a documented engagement model, but both parties should review applicable contracts, employment and privacy obligations.',
  },
]

const controls = [
  ['Discover','Map the actual work: who handles data, which accounts are used, where approvals occur, and where backlogs appear.'],
  ['Design','Specify scope, service levels, privacy boundaries, escalation owners, continuity coverage and accepted deliverables.'],
  ['Deliver','Use documented workflows, role-specific access, training, quality reviews and measurable milestones.'],
  ['Review','Monitor errors, incidents, customer outcomes, turnaround and changing business requirements; adjust the plan.'],
]

const sources=[
  {title:'FTC — Protecting Personal Information',url:'https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business',note:'Inventory, least privilege, contractor practices and offboarding'},
  {title:'FTC — Start with Security',url:'https://www.ftc.gov/business-guidance/resources/start-security-guide-business',note:'Vendor contracts, sensible access and oversight'},
  {title:'NIST SP 1305 — Supply Chain Risk Management',url:'https://csrc.nist.gov/pubs/sp/1305/final',note:'Third-party cybersecurity requirements and governance'},
  {title:'Philippine National Privacy Commission — Third Parties',url:'https://privacy.gov.ph/third-parties/',note:'Due diligence and data-processing arrangements'},
]

export default function OutsourcingRisks() {
  usePageMeta({
    title:'Outsourcing Risks & Practical Controls',
    description:'Illustrative risk scenarios for direct-hire virtual assistants, outsourced operations, software delivery, privacy and automation — plus practical controls to discuss with a provider.',
    crumbs:[{name:'Services',path:'/services'},{name:'Outsourcing Risks',path:'/insights/outsourcing-risks'}],
  })
  return (
    <Page>
      <Crumbs items={[{label:'Services',to:'/services'},{label:'Outsourcing risks'}]}/>
      <PageHero image={PHOTO.backOffice} alt="OPERAVA operational risk review" kicker="Operational resilience" title={<>Reduce the risk.<br/>Keep the opportunity.</>} lead="Direct hiring, managed services and automation can all succeed — when roles, access, review and continuity are designed deliberately." brightness="brightness-[0.4]" />
      <Section>
        <div className="max-w-4xl">
          <p className="uppercase tracking-[.24em] text-[11px] text-accent font-bold">A practical guide, not a fear campaign</p>
          <h2 className="mt-3 text-3xl lg:text-5xl uppercase font-black">The hidden cost of undefined work</h2>
          <p className="mt-6 text-neutral-300 leading-relaxed">Hiring a virtual assistant directly is not inherently unsafe, and working with a provider does not automatically remove risk. The difference is whether your business has the capacity to document, manage and verify day-to-day work. OPERAVA's role is to help clients scope technology, people and processes under an agreed operating model — not to promise risk-free delivery.</p>
          <p className="mt-4 text-neutral-400 leading-relaxed">The cases below are <strong>hypothetical teaching scenarios</strong>, not accounts of actual OPERAVA clients, incidents or measured outcomes. They illustrate questions to ask before engaging a person, team or automation vendor.</p>
        </div>
      </Section>
      <Section className="!pt-0">
        <SectionHead kicker="Eight risk scenarios" title={<>Problems worth planning for</>} note="Understand the exposure, see reasonable controls, and compare what a scoped service could contribute."/>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {scenarios.map((s,i)=>(
            <article key={s.name} className="bg-[#0b0b10] border border-neutral-800 rounded-xl p-7 lg:p-10">
              <p className="text-xs text-accent tracking-widest font-bold">0{i+1} · {s.sector}</p>
              <h3 className="font-black uppercase text-2xl mt-4">{s.name}</h3>
              <div className="mt-6 space-y-5 text-sm leading-relaxed">
                <div><h4 className="uppercase font-bold tracking-wider text-xs">Scenario</h4><p className="mt-2 text-neutral-400">{s.situation}</p></div>
                <div><h4 className="uppercase font-bold tracking-wider text-xs">What could go wrong</h4><p className="mt-2 text-neutral-400">{s.risk}</p></div>
                <div><h4 className="uppercase font-bold tracking-wider text-xs">Practical controls</h4><p className="mt-2 text-neutral-300">{s.response}</p></div>
                <div className="border-t border-neutral-800 pt-5"><h4 className="uppercase font-bold tracking-wider text-xs text-accent">Where OPERAVA may help</h4><p className="mt-2 text-neutral-300">{s.operava}</p></div>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHead kicker="A more controlled approach" title={<>Turn risks into operating rules</>} note="Agree on the boundaries and responsibilities before work starts."/>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {controls.map(([title,text],i)=><div key={title} className="bg-[#0b0b10] border border-neutral-800 rounded-lg p-7"><p className="text-accent font-bold text-xs">0{i+1}</p><h3 className="text-xl font-black uppercase mt-5">{title}</h3><p className="text-sm text-neutral-400 leading-relaxed mt-3">{text}</p></div>)}
        </div>
      </Section>
      <Section>
        <SectionHead kicker="Responsible decision-making" title={<>Choose the right model</>} />
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="border border-neutral-800 p-8 rounded-xl bg-[#0b0b10]"><h3 className="font-black text-xl uppercase">Direct hiring may work well when</h3><p className="mt-4 text-neutral-300 leading-relaxed">You already have in-house managers, written procedures, secure access controls, recruitment and labor-law support, backup coverage, and the capacity to review performance and resolve incidents.</p></div>
          <div className="border border-neutral-800 p-8 rounded-xl bg-[#0b0b10]"><h3 className="font-black text-xl uppercase">Managed delivery may help when</h3><p className="mt-4 text-neutral-300 leading-relaxed">You need help organizing recruitment, responsibilities, documented workflows, reporting, project delivery or escalation. Confirm exactly which services, safeguards and liabilities your agreement covers.</p></div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/quote" className="inline-flex px-6 py-3 bg-accent-solid text-white text-xs font-bold uppercase tracking-widest rounded hover:opacity-90">Discuss your requirements →</Link>
          <Link to="/services/engagement-models" className="inline-flex px-6 py-3 border border-neutral-700 rounded text-xs font-bold uppercase tracking-widest hover:border-accent">Compare engagement models →</Link>
          <Link to="/learning" className="inline-flex px-6 py-3 border border-neutral-700 rounded text-xs font-bold uppercase tracking-widest hover:border-accent">Free AI & automation learning →</Link>
        </div>
      </Section>
      <Section>
        <SectionHead kicker="Independent guidance" title={<>Further reading & sources</>}/>
        <div className="grid sm:grid-cols-2 gap-4">
          {sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="border border-neutral-800 p-6 rounded-xl hover:border-accent transition-colors"><h3 className="font-bold">{s.title} ↗</h3><p className="text-sm text-neutral-400 mt-2">{s.note}</p></a>)}
        </div>
        <p className="text-sm text-neutral-500 mt-5">This article is general business guidance, not legal, cybersecurity certification or regulatory advice. Actual controls, employment classification, privacy obligations and contractual responsibilities depend on your jurisdictions, systems and agreed service scope.</p>
      </Section>
    </Page>
  )
}
