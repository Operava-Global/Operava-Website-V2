import type { LegalDoc } from './types'

/**
 * Public-facing confidentiality policy for OPERAVA Global Solutions.
 * Individual client, employee, contractor and vendor agreements may impose
 * stricter or more specific confidentiality obligations.
 */
export const CONFIDENTIALITY_POLICY: LegalDoc = {
  title: 'Confidentiality Policy',
  effective: '9 November 2026',
  jurisdiction: 'Republic of the Philippines',
  contact: 'compliance@operavaglobal.com',
  source: 'OPERAVA Confidentiality Policy',
  sections: [
    { num: '1', title: 'Purpose and Commitment', blocks: [
      { t: 'p', text: 'OPERAVA GLOBAL SOLUTIONS OPC, operating under the brand name OPERAVA Global Solutions (OPERAVA), recognizes that its technology, outsourcing, workforce and business operations may involve confidential information belonging to clients, customers, applicants, employees, contractors, suppliers, business partners and OPERAVA itself. This Policy establishes minimum rules for receiving, accessing, using, storing, disclosing, returning and securely disposing of such information.' },
      { t: 'p', text: 'Confidentiality is a continuing responsibility. Access to information is permitted only for an authorized business purpose and only to the extent necessary for the assigned role or service.' }
    ]},
    { num: '2', title: 'Who Must Follow This Policy', blocks: [
      { t: 'p', text: 'This Policy applies to OPERAVA personnel, directors, officers, employees, applicants when given access to non-public information, independent contractors, consultants, temporary personnel, outsourced professionals, agents, authorized representatives and third-party service providers who receive or access confidential information through OPERAVA.' },
      { t: 'p', text: 'Clients and other counterparties must follow their own contractual confidentiality obligations. Where a signed agreement imposes stricter requirements, the stricter applicable requirement controls.' }
    ]},
    { num: '3', title: 'What Is Confidential Information', blocks: [
      { t: 'p', text: 'Confidential Information means non-public information disclosed, accessed, generated or handled in connection with OPERAVA or an engagement, whether marked confidential or which reasonably should be understood to be confidential given its nature or the circumstances.' },
      { t: 'ul', items: [
        'Client identities, business plans, strategies, pricing, proposals, contracts, financial information and commercial terms.',
        'Customer, employee, applicant, supplier and business-contact information, including personal data and sensitive personal information.',
        'Credentials, passwords, authentication factors, API keys, tokens, encryption keys, security configurations and access procedures.',
        'Source code, object code, architecture, databases, algorithms, models, prompts, workflows, technical designs, product roadmaps and system documentation.',
        'Trade secrets, inventions, research, know-how, processes, methods, internal reports and unpublished materials.',
        'Operational procedures, workforce information, schedules, performance records, quality reports, incident records and internal communications.',
        'Any information a client or other owner is contractually or legally required to keep confidential.'
      ]}
    ]},
    { num: '4', title: 'Information Not Covered', blocks: [
      { t: 'p', text: 'Information is not Confidential Information to the extent the receiving party can demonstrate through contemporaneous records that it became public through no breach of duty; was lawfully known without confidentiality restrictions before disclosure; was lawfully received from a third party without a duty of confidence; or was independently developed without use of or reference to protected information.' },
      { t: 'p', text: 'A combination of public elements may still be confidential where the combination, selection or arrangement is not public.' }
    ]},
    { num: '5', title: 'Permitted Use and Purpose Limitation', blocks: [
      { t: 'p', text: 'Confidential Information may be used only to perform an authorized role, evaluate or deliver a proposed or existing engagement, provide support, meet a legal obligation, or exercise or defend legal rights. It must not be used for personal benefit, competitive advantage, unrelated marketing, unauthorized profiling, solicitation, publication or any purpose outside the authorized scope.' },
      { t: 'p', text: 'Personnel must follow client instructions and the applicable statement of work, security requirements, access rules and data-processing terms. Instructions that appear unlawful, unsafe or outside the agreed scope must be escalated before action.' }
    ]},
    { num: '6', title: 'Need-to-Know Access', blocks: [
      { t: 'p', text: 'Access must be role-based, limited to the minimum information necessary, approved through the applicable access process and removed promptly when no longer required. Shared accounts, credential sharing, unauthorized account borrowing and attempts to bypass access controls are prohibited.' },
      { t: 'p', text: 'Personnel must not access client or internal systems merely because technical access is available. Access must have a documented, legitimate work purpose.' }
    ]},
    { num: '7', title: 'Safeguarding and Secure Handling', blocks: [
      { t: 'p', text: 'Confidential Information must be protected using safeguards appropriate to its sensitivity and risk. These may include approved devices and software, strong authentication, encryption where appropriate, secure transfer channels, locked storage, screen privacy, endpoint protection, access logging, secure backups and controlled printing.' },
      { t: 'p', text: 'Personnel must not transfer Confidential Information to personal email, personal cloud drives, unapproved messaging applications, public file-sharing services, removable media or unapproved AI tools. A client-approved exception must be documented and appropriately secured.' }
    ]},
    { num: '8', title: 'Remote and Work-from-Anywhere Security', blocks: [
      { t: 'p', text: 'When working remotely, personnel must use a private and reasonably secure workspace, protect screens and conversations from unauthorized observation, secure devices when unattended, avoid public or shared computers, use approved networks and follow any client-specific remote access or VPN requirements.' },
      { t: 'p', text: 'Confidential discussions must not be conducted where family members, visitors, public audiences or other unauthorized persons can hear or view the information. Lost devices or suspected exposure must be reported immediately.' }
    ]},
    { num: '9', title: 'Client and Customer Information', blocks: [
      { t: 'p', text: 'Client data remains subject to the client agreement and applicable data-protection law. OPERAVA personnel may process client information only on documented authorized instructions and within the assigned service. Personnel must not copy client data to build personal portfolios, demonstrations, datasets, training materials or unrelated products.' },
      { t: 'p', text: 'Client information must not be mixed across accounts or disclosed to another client. Production data must not be used in testing or demonstrations unless specifically authorized and appropriately protected or de-identified.' }
    ]},
    { num: '10', title: 'Personal Data and Privacy', blocks: [
      { t: 'p', text: 'Personal data must be handled consistently with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing Rules and Regulations, applicable National Privacy Commission issuances, the OPERAVA Privacy Policy and any client privacy notice or data-processing agreement that applies.' },
      { t: 'p', text: 'Confidentiality does not replace privacy compliance. Personal data must also be processed lawfully, transparently, for a legitimate purpose, proportionately, accurately, securely and only for as long as necessary.' }
    ]},
    { num: '11', title: 'AI Tools, Automation and External Services', blocks: [
      { t: 'p', text: 'Confidential Information, personal data, source code, credentials, client prompts, assessment records and internal documents must not be entered into public or third-party AI systems, code assistants, transcription services or automation tools unless the tool and use have been approved for that data classification and the applicable contractual and privacy safeguards are in place.' },
      { t: 'p', text: 'Personnel must review AI-generated outputs before use, avoid exposing one client’s information in another client’s workflow, and must not represent that an external AI provider is bound by OPERAVA confidentiality terms unless an applicable agreement confirms it.' }
    ]},
    { num: '12', title: 'Disclosure to Authorized Recipients', blocks: [
      { t: 'p', text: 'Disclosure is permitted only to authorized personnel, clients, professional advisers, auditors, regulators, hosting or technology providers, subcontractors or other recipients who need the information for a lawful and authorized purpose and are subject to appropriate confidentiality, privacy and security obligations.' },
      { t: 'p', text: 'Before sharing information with a subcontractor or service provider, the responsible team must confirm that the disclosure is authorized by the client agreement, privacy requirements and internal approval process.' }
    ]},
    { num: '13', title: 'Legally Required Disclosure', blocks: [
      { t: 'p', text: 'If disclosure is required by law, court order, subpoena or a competent government authority, the recipient must, where legally permitted, promptly notify OPERAVA Compliance and the information owner, disclose only the minimum legally required information, and reasonably cooperate in seeking confidential treatment or protective measures.' },
      { t: 'p', text: 'Nothing in this Policy prevents a person from making a protected report to a competent authority or exercising a non-waivable legal right.' }
    ]},
    { num: '14', title: 'Incident Reporting', blocks: [
      { t: 'p', text: 'Any suspected or actual loss, unauthorized access, disclosure, alteration, copying, misuse, phishing compromise, misdirected email, exposed credential, malware event or other confidentiality or security incident must be reported immediately through the designated OPERAVA security or compliance channel. Personnel must preserve relevant evidence and must not conceal, independently investigate beyond their authority, or make external notifications unless authorized.' },
      { t: 'p', text: 'OPERAVA will assess and respond to incidents and make notifications required by law and contract. Where the Data Privacy Act and its rules require notification of a personal data breach, the applicable 72-hour notification requirement and other NPC procedures will be followed.' }
    ]},
    { num: '15', title: 'Retention, Return and Secure Disposal', blocks: [
      { t: 'p', text: 'Confidential Information must be retained only for the authorized business, contractual, legal or operational period. Upon request, completion of the engagement, termination of access or other applicable trigger, it must be returned, securely deleted or destroyed in accordance with the client agreement, retention schedule and legal requirements.' },
      { t: 'p', text: 'Routine system backups may retain residual copies until overwritten under the applicable backup cycle, provided they remain protected and are not restored or used except for legitimate recovery, security or legal purposes. Legal holds and mandatory retention obligations take precedence over routine deletion.' }
    ]},
    { num: '16', title: 'Intellectual Property and Work Product', blocks: [
      { t: 'p', text: 'Confidentiality does not by itself transfer ownership of intellectual property. Ownership, licensing and assignment of software, deliverables, inventions, documentation, designs and other work product are governed by the applicable written agreement and Philippine intellectual-property law, including Republic Act No. 8293.' },
      { t: 'p', text: 'Personnel must not publish, reuse, sell, disclose or place client-owned deliverables or proprietary materials in a public repository or portfolio without prior written authorization from the rightful owner.' }
    ]},
    { num: '17', title: 'Recruitment and Workforce Records', blocks: [
      { t: 'p', text: 'Applicant, employee, contractor and workforce records are confidential and may be accessed only by authorized recruitment, HR, management, compliance or client personnel with a legitimate role-based need. Assessment recordings, identity-verification information, resumes, references, compensation records and performance information require heightened care and must follow their specific notices and retention rules.' },
      { t: 'p', text: 'A recruitment application, assessment or interview does not authorize public disclosure of applicant information or guarantee employment.' }
    ]},
    { num: '18', title: 'Publicity and References', blocks: [
      { t: 'p', text: 'No person may use a client name, logo, testimonial, project screenshot, case study, service metrics, personnel identity or engagement details in publicity, marketing, social media, a resume or portfolio without the required written approval and any necessary individual consent.' },
      { t: 'p', text: 'General skills and experience may be described without disclosing protected information, client identity or proprietary details.' }
    ]},
    { num: '19', title: 'Third-Party and Vendor Confidentiality', blocks: [
      { t: 'p', text: 'Information received from vendors, partners and other third parties must be protected according to the restrictions communicated by the disclosing party and applicable agreements. OPERAVA personnel must not assume that information is public merely because it was supplied by an external provider.' }
    ]},
    { num: '20', title: 'Duration and Survival', blocks: [
      { t: 'p', text: 'Confidentiality obligations apply while information is accessed or held and continue after an assignment, contract, employment or other relationship ends for as long as the information remains confidential or protected by law or contract. Trade secrets and personal data remain protected for as long as applicable law or their confidential nature requires.' },
      { t: 'p', text: 'A specific NDA, employment agreement, client contract or law may prescribe a longer or more specific survival period and will control to the extent applicable.' }
    ]},
    { num: '21', title: 'Enforcement and Remedies', blocks: [
      { t: 'p', text: 'A breach may result in access suspension, investigation, contractual remedies, disciplinary action up to and including termination of an engagement or employment where lawful, injunctive relief where available, recovery of proven damages, or referral to competent authorities. Any action will be subject to due process, applicable law and the governing agreement.' },
      { t: 'p', text: 'No provision in this Policy creates a penalty or remedy that is unavailable under applicable law.' }
    ]},
    { num: '22', title: 'Relationship With Other Documents', blocks: [
      { t: 'p', text: 'This Policy supplements, and does not replace, signed non-disclosure agreements, Master Service Agreements, Statements of Work, employment or contractor agreements, client security policies, data-processing agreements, privacy notices and other binding obligations. If terms conflict, the specific signed agreement or mandatory law controls for the subject matter it governs.' }
    ]},
    { num: '23', title: 'Governing Law', blocks: [
      { t: 'p', text: 'This Policy is intended to be interpreted consistently with the laws of the Republic of the Philippines, including the Civil Code, the Data Privacy Act of 2012, the Intellectual Property Code and other applicable laws. Mandatory laws of another jurisdiction may also apply to a particular engagement or data subject.' }
    ]},
    { num: '24', title: 'Changes and Contact', blocks: [
      { t: 'p', text: 'OPERAVA may update this Policy to reflect changes in services, technology, security practices, contractual requirements or applicable law. The current version and effective date will be published on the official website.' },
      { t: 'contact', lines: ['OPERAVA Global Solutions', 'Compliance Team', 'Pagudpud, Ilocos Norte 2919, Philippines'], email: 'compliance@operavaglobal.com' }
    ]},
    { num: '25', title: 'Important Notice', blocks: [
      { t: 'p', text: 'This public Policy describes general confidentiality expectations. It is not a substitute for a negotiated NDA, client-specific security schedule, employment agreement, contractor agreement or data-processing agreement. Before a regulated, sensitive or high-risk engagement begins, the parties should document the specific data categories, permitted purposes, security controls, incident contacts, subprocessors, retention periods, audit rights and return or deletion requirements.' }
    ]}
  ]
}
