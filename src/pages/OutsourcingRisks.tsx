import { Link } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, Section, SectionHead } from '../site/ui'
import { PHOTO } from '../site/media'

const scenarios = [
  {
    name: 'Access beyond the agreed responsibilities',
    sector: 'Account access · Security',
    situation: 'An individual, contractor or team member receives shared passwords and administrator access even though the work only requires a limited set of tasks.',
    risk: 'An error or compromised account could affect unrelated systems. Shared credentials make it harder to establish who acted or revoke access when the engagement ends.',
    response: 'Use individual accounts, multi-factor authentication, permissions matched to the work and approval for sensitive changes. Record access owners and remove accounts, active sessions and tokens during offboarding.',
    review: 'Can the business show who has access, why they need it, who approved it and when it was last reviewed?',
  },
  {
    name: 'Critical work depends on one person',
    sector: 'Business operations · Continuity',
    situation: 'One individual or specialist team holds the only current knowledge of deadlines, customer issues and undocumented workarounds.',
    risk: 'An absence, outage or change in availability could delay work because no approved backup has the information or authority to continue.',
    response: 'Maintain shared task records, process instructions, coverage priorities and an agreed handover. Train an authorized backup and periodically check that they can complete essential work.',
    review: 'Who takes over the next urgent task, and can they find the current status without relying on a private inbox or device?',
  },
  {
    name: 'Deliverables without agreed quality checks',
    sector: 'Service delivery · Quality',
    situation: 'A business engages an individual or provider without defining acceptance criteria, response targets, revision limits or escalation ownership.',
    risk: 'Different expectations could lead to inconsistent outputs, repeated corrections, missed deadlines and disagreements over whether the work is complete.',
    response: 'Agree on examples of acceptable work, milestones, review responsibilities and a documented correction process. Sample completed work and discuss recurring issues using evidence.',
    review: 'What evidence demonstrates acceptance, and who decides whether an issue needs correction, a scope change or escalation?',
  },
  {
    name: 'Sensitive information in an unmanaged workflow',
    sector: 'Information handling · Privacy',
    situation: 'Records are shared with internal staff, individual contractors or providers through personal accounts and tools without clear handling instructions.',
    risk: 'Information could reach unintended recipients, remain on old devices or be uploaded to tools that have not been reviewed for the task.',
    response: 'Limit shared data, use approved storage and document permitted uses, access, retention and incident reporting. Include return or deletion steps in the exit plan and obtain privacy advice where needed.',
    review: 'Where does the information go, who can access it, and how will the business confirm that the agreed handling steps are followed?',
  },
  {
    name: 'Automation acts without a review point',
    sector: 'AI & automation · Reliability',
    situation: 'A workflow updates records, drafts decisions or sends messages using inputs that have not been checked, with no owner for exceptions.',
    risk: 'An incorrect input or unreliable output could trigger repeated actions before someone notices. A successful technical run does not establish that the business outcome is correct.',
    response: 'Test normal and failure conditions, validate inputs, prevent duplicate processing and require human approval for consequential actions. Assign monitoring, a stop control and a recovery procedure.',
    review: 'Who reviews unexpected outputs, how quickly can the workflow be stopped, and how will affected records be corrected?',
  },
  {
    name: 'Ownership and handover are left undefined',
    sector: 'Technology & projects · Handover',
    situation: 'A project is commissioned without agreeing who controls source files, hosting, domains, documentation, third-party licenses or support after delivery.',
    risk: 'The business could struggle to maintain the work, transfer it to another provider or restore operations when the original engagement ends.',
    response: 'Document ownership and usage rights, business-controlled accounts, repository access, acceptance milestones and support boundaries. Request current documentation, backups and a practical handover before closure.',
    review: 'Could an authorized replacement maintain the delivered work using the materials and access already available to the business?',
  },
  {
    name: 'Payment changes rely on one instruction',
    sector: 'Payment operations · Approvals',
    situation: 'A person or automated process can update payment details and release funds based only on an incoming message.',
    risk: 'A mistaken instruction, impersonation attempt or compromised account could cause a payment to be sent to the wrong destination. This does not imply misconduct by the person processing it.',
    response: 'Separate preparation from approval, limit payment permissions and independently confirm changed details through a previously established contact channel. Keep a record of approvals and exceptions.',
    review: 'Can the approver verify both the reason for the payment and the destination without relying on the same message that requested the change?',
  },
  {
    name: 'Working terms do not match the actual arrangement',
    sector: 'Contracts & cross-border work · Responsibilities',
    situation: 'Work begins with only a brief message about price, while scope, authority, confidentiality, location of delivery and termination arrangements remain unclear.',
    risk: 'The parties could disagree about charges, responsibility for decisions, ownership or the steps required to end the engagement. Applicable obligations may also need closer review.',
    response: 'Record the scope, fees, milestones, change approval, confidentiality, dispute process and exit arrangements. Ask qualified local advisers to review classification and other obligations against the actual working arrangement.',
    review: 'Do both parties understand the same scope and responsibilities, and is there a written process for changes or unresolved concerns?',
  },
  {
    name: 'Required authorization has not been verified',
    sector: 'Credentials & permissions · Due diligence',
    situation: 'An individual or contractor is asked to perform work that may require a specific professional license, permit or authorization, but the requirement and current status have not been checked.',
    risk: 'If an authorization is required and is missing, expired or outside its permitted scope, the work could face restrictions, rework or disputes. An unverified credential is a question to resolve, not proof of wrongdoing.',
    response: 'Identify the exact activity and jurisdiction, confirm requirements with the relevant authority or qualified adviser, and verify applicable credentials with the issuer. Record scope, expiry and renewal checks before assigning regulated tasks.',
    review: 'Does this specific activity require authorization, does the evidence cover the work and location, and who will monitor any expiry?',
  },
  {
    name: 'Work is passed on without agreed boundaries',
    sector: 'Subcontracting & external tools · Oversight',
    situation: 'An engagement permits outside help but does not explain which tasks may be delegated, which tools may be used or whether further approval is needed.',
    risk: 'The business could lose visibility over who performs the work, accesses information or handles an incident when several parties are involved.',
    response: 'Agree on permitted delegation and tools, approval requirements, confidentiality and access limits. Maintain accountable contacts and require equivalent handling and handover expectations for approved additional parties.',
    review: 'Can the responsible contact identify everyone involved and explain how changes, incidents and offboarding will be coordinated?',
  },
]

const controls = [
  ['Discover', 'Map the work, systems, data and decisions involved. Identify dependencies and ask which requirements apply to the activity and location.'],
  ['Design', 'Agree on scope, acceptance, permissions, escalation, backup coverage and exit terms. Assign an owner to each important control.'],
  ['Deliver', 'Use documented workflows, approved access and regular quality reviews. Keep evidence of decisions, changes and completed milestones.'],
  ['Review', 'Recheck access, performance, credentials where required and recovery arrangements when people, tools or responsibilities change.'],
]

const checks = [
  ['Identity and capability', 'Confirm who is entering the agreement, who may act for them and whether their experience fits the actual work. Request relevant evidence without collecting unnecessary personal information.'],
  ['Applicable authorizations', 'Distinguish business registration, professional licensing, permits and voluntary certifications. Verify only the credentials relevant to the task; record what was checked and any open questions.'],
  ['Scope and commercial terms', 'Write down deliverables, dates, fees, expenses, acceptance, revisions and cancellation terms. Make sure changes require a clear approval instead of an assumption.'],
  ['Information and decision rights', 'List approved tools, data access, payment limits and decisions that require sign-off. Confirm how concerns reach a responsible person and how an incident will be handled.'],
  ['Continuity and exit readiness', 'Agree on backup coverage, current documentation, account ownership, return of work and access removal. Review the handover plan before a disruption occurs.'],
  ['Ongoing, evidence-based review', 'Review actual outputs, missed commitments and agreed controls at a suitable interval. Clarify incomplete information privately and document findings without jumping to allegations.'],
]

const disclaimers = [
  ['Hypothetical examples only', 'These case reviews are fictional educational scenarios. They do not describe, identify or refer to any particular business, individual, contractor, client, competitor or real incident. They are not testimonials, allegations, investigations or findings of misconduct. Any resemblance to actual circumstances is coincidental.'],
  ['No judgment about a group', 'The guide does not target any profession, occupation, nationality or business model. Working independently, directly or through a provider does not itself establish safety, competence or wrongdoing. Assess the specific work, evidence and controls fairly.'],
  ['General information and local requirements', 'This page provides general educational information, not legal, tax, employment, regulatory or professional advice. Requirements depend on the activity, location and facts. Obtain advice from appropriately qualified professionals before relying on it for a specific engagement.'],
  ['No guarantee or implied endorsement', 'Suggested controls reduce exposure but cannot eliminate every risk or guarantee compliance, performance or recovery. References are for further reading and do not imply endorsement of OPERAVA or any provider. Any services and responsibilities must be confirmed in the applicable written agreement.'],
]

const sources = [
  { title: 'FTC — Protecting Personal Information', url: 'https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business', note: 'U.S. guidance on information inventories, access and service-provider practices' },
  { title: 'FTC — Start with Security', url: 'https://www.ftc.gov/business-guidance/resources/start-security-guide-business', note: 'U.S. guidance on access controls, service-provider oversight and security practices' },
  { title: 'NIST SP 1305 — Supply Chain Risk Management', url: 'https://csrc.nist.gov/pubs/sp/1305/final', note: 'A framework for reviewing third-party cybersecurity responsibilities' },
  { title: 'Philippine National Privacy Commission — Third Parties', url: 'https://privacy.gov.ph/third-parties/', note: 'Philippine guidance on due diligence and personal-data processing arrangements' },
  { title: 'U.S. SBA — Licenses and permits', url: 'https://www.sba.gov/counseling/launch-your-business/', note: 'U.S. examples of requirements varying by activity and location; check the authority relevant to your own jurisdiction' },
]

export default function OutsourcingRisks() {
  usePageMeta({
    title: 'Business Risks & Practical Controls',
    description: 'General, hypothetical case reviews covering individuals, contractors, service providers and internal teams, with practical safeguards, due-diligence questions and clear disclaimers.',
    crumbs: [{ name: 'Services', path: '/services' }, { name: 'Business Risks', path: '/insights/outsourcing-risks' }],
  })
  return (
    <Page>
      <Crumbs items={[{ label: 'Services', to: '/services' }, { label: 'Business risks & controls' }]} />
      <PageHero image={PHOTO.backOffice} alt="Planning business processes and safeguards" kicker="Operational resilience" title={<>Understand the risks.<br/>Plan the safeguards.</>} lead="Practical considerations when working with individuals, independent contractors, service providers, internal teams and automated systems." brightness="brightness-[0.4]" />
      <Section>
        <div className="max-w-4xl">
          <p className="uppercase tracking-[.24em] text-[11px] text-accent font-bold">General business guidance</p>
          <h2 className="mt-3 text-3xl lg:text-5xl uppercase font-black">Review the work and its safeguards</h2>
          <p className="mt-6 text-neutral-300 leading-relaxed">Clear responsibilities, appropriate access and regular review matter in every working arrangement. These examples focus on gaps in processes and oversight that may arise across different services and business models. Evaluate the actual scope, capability and safeguards of each engagement.</p>
          <aside aria-labelledby="scenario-disclaimer" className="mt-6 rounded-xl border border-neutral-700 p-6">
            <h3 id="scenario-disclaimer" className="font-bold text-lg">Illustrative case reviews — no specific person or business</h3>
            <p className="mt-3 text-sm text-neutral-300 leading-relaxed">All scenarios below are hypothetical and created for general education. They do not refer to any identifiable person, business or actual incident, and do not assert misconduct by any group. Any resemblance to real circumstances is coincidental.</p>
            <a href="#disclaimers" className="inline-block mt-3 text-accent text-sm font-semibold underline underline-offset-4">Read the full disclaimers</a>
          </aside>
        </div>
      </Section>
      <Section className="!pt-0">
        <SectionHead kicker="Licensing in context" title={<>Check what the work requires</>} />
        <div className="max-w-4xl space-y-4 text-neutral-300 leading-relaxed">
          <p>Individuals and independent contractors may carry out work for which a specific professional license is not required. In this guide, references to non-licensed contractors describe credential status only; they are not a claim that a person is acting unlawfully, is unqualified or is unreliable. First establish whether the particular activity and jurisdiction require a license, permit or other authorization.</p>
          <p>Business registration, professional licensing, permits and voluntary certifications serve different purposes. Verify the authorization relevant to the actual task, including its scope and current validity, where required. Neither a credential nor the absence of one should replace a review of the work, applicable requirements and practical safeguards.</p>
        </div>
      </Section>
      <Section>
        <SectionHead kicker={`${scenarios.length} illustrative case reviews`} title={<>Situations worth planning for</>} note="Each example includes a possible exposure, practical controls and a question to review. These are possibilities, not claims about how often incidents occur." />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {scenarios.map((s, i) => (
            <article key={s.name} className="bg-[#0b0b10] border border-neutral-800 rounded-xl p-7 lg:p-10">
              <p className="text-xs text-accent tracking-widest font-bold">{String(i + 1).padStart(2, '0')} · {s.sector}</p>
              <h3 className="font-black uppercase text-2xl mt-4">{s.name}</h3>
              <div className="mt-6 space-y-5 text-sm leading-relaxed">
                <div><h4 className="uppercase font-bold tracking-wider text-xs">Hypothetical scenario</h4><p className="mt-2 text-neutral-400">{s.situation}</p></div>
                <div><h4 className="uppercase font-bold tracking-wider text-xs">Potential exposure</h4><p className="mt-2 text-neutral-400">{s.risk}</p></div>
                <div><h4 className="uppercase font-bold tracking-wider text-xs">Practical controls</h4><p className="mt-2 text-neutral-300">{s.response}</p></div>
                <div className="border-t border-neutral-800 pt-5"><h4 className="uppercase font-bold tracking-wider text-xs text-accent">Question to review</h4><p className="mt-2 text-neutral-300">{s.review}</p></div>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHead kicker="Before and during an engagement" title={<>A practical due-diligence checklist</>} note="Use checks proportionate to the work, the sensitivity of the information and the possible impact of an error." />
        <div className="grid md:grid-cols-2 gap-5">
          {checks.map(([title, text]) => <div key={title} className="border border-neutral-800 rounded-xl p-7"><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 text-sm text-neutral-300 leading-relaxed">{text}</p></div>)}
        </div>
      </Section>
      <Section>
        <SectionHead kicker="Put the checks into practice" title={<>Turn risks into operating rules</>} note="Agree on boundaries and responsibilities before work starts, then review them as circumstances change." />
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {controls.map(([title, text], i) => <div key={title} className="bg-[#0b0b10] border border-neutral-800 rounded-lg p-7"><p className="text-accent font-bold text-xs">0{i + 1}</p><h3 className="text-xl font-black uppercase mt-5">{title}</h3><p className="text-sm text-neutral-400 leading-relaxed mt-3">{text}</p></div>)}
        </div>
      </Section>
      <Section>
        <SectionHead kicker="Responsible decision-making" title={<>Choose a model that fits the work</>} note="Apply the same fair, evidence-based assessment to individuals, contractors and service providers." />
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="border border-neutral-800 p-8 rounded-xl bg-[#0b0b10]"><h3 className="font-black text-xl uppercase">Direct engagement</h3><p className="mt-4 text-neutral-300 leading-relaxed">Working directly with an individual or contractor may suit a defined scope when the business can manage approvals, access, quality and continuity. Confirm capability, applicable authorizations, availability and written terms for the particular task.</p></div>
          <div className="border border-neutral-800 p-8 rounded-xl bg-[#0b0b10]"><h3 className="font-black text-xl uppercase">Managed service delivery</h3><p className="mt-4 text-neutral-300 leading-relaxed">A provider may help coordinate delivery, documentation and reporting. Verify what the agreement actually includes, who performs the work and which responsibilities remain with the client. A managed model does not automatically eliminate risk.</p></div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/quote" className="inline-flex px-6 py-3 bg-accent-solid text-white text-xs font-bold uppercase tracking-widest rounded hover:opacity-90">Discuss your requirements →</Link>
          <Link to="/services/engagement-models" className="inline-flex px-6 py-3 border border-neutral-700 rounded text-xs font-bold uppercase tracking-widest hover:border-accent">Compare engagement models →</Link>
          <Link to="/learning" className="inline-flex px-6 py-3 border border-neutral-700 rounded text-xs font-bold uppercase tracking-widest hover:border-accent">Free AI & automation learning →</Link>
        </div>
      </Section>
      <Section id="disclaimers">
        <SectionHead kicker="Scope and limitations" title={<>Important disclaimers</>} />
        <div className="grid md:grid-cols-2 gap-5">
          {disclaimers.map(([title, text]) => <div key={title} className="border border-neutral-800 rounded-xl p-7"><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 text-sm text-neutral-300 leading-relaxed">{text}</p></div>)}
        </div>
      </Section>
      <Section>
        <SectionHead kicker="Independent guidance" title={<>Further reading & sources</>} note="These resources provide background guidance. They are not evidence of the fictional scenarios above, and requirements from one jurisdiction should not be assumed to apply elsewhere." />
        <div className="grid sm:grid-cols-2 gap-4">
          {sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="border border-neutral-800 p-6 rounded-xl hover:border-accent transition-colors"><h3 className="font-bold">{s.title} ↗</h3><p className="text-sm text-neutral-400 mt-2">{s.note}</p></a>)}
        </div>
      </Section>
    </Page>
  )
}
