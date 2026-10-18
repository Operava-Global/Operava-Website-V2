/** Proposed illustrations of work OPERAVA may scope, not proof of delivered engagements. */
export interface ServicePlaybook { summary:string; examples:string[]; deliverables:string[]; measure:string[] }
export const SERVICE_PLAYBOOKS: Record<string,ServicePlaybook> = {
  "it/software-development": {
    "summary": "When teams have outgrown spreadsheet-driven work or disconnected apps, scoped software delivery can consolidate tasks and make changes easier to maintain.",
    "examples": [
      "A distributor needs an internal order approval system with role-based access.",
      "A service company needs to replace email status updates with a shared operations portal."
    ],
    "deliverables": [
      "Custom internal dashboard, approval workflows, and integration-ready APIs.",
      "A tested web application, documentation, and a maintainable release process."
    ],
    "measure": [
      "User acceptance criteria, error rates, and deployment readiness.",
      "Ownership of source code, support procedures, and recovery plans."
    ]
  },
  "it/web-mobile-development": {
    "summary": "Customer-facing digital journeys should work across devices and account for slow connections, accessibility, and support workflows.",
    "examples": [
      "A retailer wants product browsing and service requests on mobile.",
      "A field team needs to submit forms and photos without spreadsheets."
    ],
    "deliverables": [
      "Responsive customer portal with forms, account status, and notifications.",
      "Mobile-ready workflows, accessible UI components, and analytics events."
    ],
    "measure": [
      "Task-completion rate and mobile responsiveness.",
      "Accessibility checks, secure authentication, and browser testing."
    ]
  },
  "it/saas-platform-development": {
    "summary": "Multi-user SaaS products need clear account boundaries, subscription events, tenant controls, and predictable release governance.",
    "examples": [
      "A training provider needs a subscription-based member portal.",
      "An agency needs separate customer workspaces within one platform."
    ],
    "deliverables": [
      "Tenant-aware onboarding, role permissions, billing events, and admin views.",
      "Product analytics, feature flags, and account-management APIs."
    ],
    "measure": [
      "Tenant isolation and authorized access testing.",
      "Activation, churn indicators, and platform reliability."
    ]
  },
  "it/it-systems-development": {
    "summary": "Operational systems should connect people, data, and approvals without locking knowledge into individual inboxes.",
    "examples": [
      "An operations team needs a service request queue with audit history.",
      "A multi-location business needs central asset and staff request tracking."
    ],
    "deliverables": [
      "Workflow-driven internal web system with statuses, roles, and reporting.",
      "Integration points for identity providers, ticketing, and records."
    ],
    "measure": [
      "Change approval and access review.",
      "Queue aging, process cycle time, and incident reporting."
    ]
  },
  "it/computer-programming": {
    "summary": "Purpose-built scripts and services can eliminate fragile repetitive tasks when tested, monitored, and documented.",
    "examples": [
      "Finance needs scheduled checks for duplicate entries.",
      "Operations needs a utility to transform partner data formats."
    ],
    "deliverables": [
      "Validated scripts, command-line tools, scheduled jobs, and APIs.",
      "Automated testing, error alerts, and versioned deployment instructions."
    ],
    "measure": [
      "Input validation, failure handling, and rerun behavior.",
      "Time saved per batch and defect rate."
    ]
  },
  "it/it-consulting": {
    "summary": "Good technology choices start with business requirements, constraints, ownership, security obligations, and a feasible implementation sequence.",
    "examples": [
      "A growing company needs an architecture review before investing in new apps.",
      "A business with many SaaS subscriptions needs consolidation priorities."
    ],
    "deliverables": [
      "Systems inventory, risk register, and phased digital roadmap.",
      "Vendor evaluation matrix and proof-of-concept plan."
    ],
    "measure": [
      "Business outcomes, decision ownership, and cost visibility.",
      "Implementation milestones and adoption readiness."
    ]
  },
  "it/systems-integration": {
    "summary": "Reliable integration reduces double entry but requires careful mapping, permission boundaries, and exception handling.",
    "examples": [
      "Sales wants CRM updates passed to invoicing without copy-paste.",
      "Support agents need an account view shared across approved systems."
    ],
    "deliverables": [
      "Versioned API connections, transformation rules, and monitored sync jobs.",
      "Retry queues, error dashboards, and reconciliation reports."
    ],
    "measure": [
      "Missing or duplicated record rate.",
      "API authorization, observability, and recovery tests."
    ]
  },
  "it/database-services": {
    "summary": "Database reliability depends on schema decisions, controlled access, backup testing, and measured query performance.",
    "examples": [
      "An internal app slows when reports and transactions share a database.",
      "A team needs safe migration from spreadsheets to structured records."
    ],
    "deliverables": [
      "Relational schema, index strategy, migration scripts, and access rules.",
      "Backup/recovery runbooks, retention schedules, and reporting views."
    ],
    "measure": [
      "Restore drills, integrity checks, and query latency.",
      "Least-privilege access and data-retention requirements."
    ]
  },
  "bpo/customer-service": {
    "summary": "Customer service works best when agents use one approved source of truth and escalation ownership is visible.",
    "examples": [
      "An online store needs email, live chat, and returns handling.",
      "A subscription company needs first-response coverage with clear escalation."
    ],
    "deliverables": [
      "Customer knowledge base, agent scripts, ticket taxonomy, and QA scorecards.",
      "Daily volume dashboard, response-time reporting, and escalation matrix."
    ],
    "measure": [
      "First-response time and customer satisfaction trends.",
      "Escalation quality, refund permissions, and data exposure checks."
    ]
  },
  "bpo/technical-support": {
    "summary": "Technical tickets need troubleshooting depth, product knowledge, and a route to engineering without losing context.",
    "examples": [
      "A SaaS team needs first-line investigation before developer escalation.",
      "A hardware provider needs guided diagnostics and follow-up workflows."
    ],
    "deliverables": [
      "Tiered playbooks, triage forms, known-issue library, and escalation templates.",
      "Root-cause labels and trend reports to product teams."
    ],
    "measure": [
      "Resolution time and reopened-ticket rate.",
      "Diagnostic access approvals and incident severity handling."
    ]
  },
  "bpo/help-desk": {
    "summary": "A help desk should capture every request, assign priorities, and create a verifiable trail from intake to closure.",
    "examples": [
      "Employees need password-reset routing and access-request tracking.",
      "A multi-office team needs one place for facilities and IT support."
    ],
    "deliverables": [
      "Intake portal, categorization rules, service catalog, and support queue.",
      "Escalation schedule and recurring issue dashboard."
    ],
    "measure": [
      "Service-level adherence and backlog health.",
      "Identity verification, ownership, and ticket auditability."
    ]
  },
  "bpo/back-office-operations": {
    "summary": "Structured back-office delivery separates routine processing from exception decisions and preserves accountable review.",
    "examples": [
      "An agency needs supplier updates, reconciliation, and document follow-ups.",
      "A fast-growing company needs invoice-status tracking and coordination."
    ],
    "deliverables": [
      "Standard operating procedures, workflow checklists, and review queues.",
      "Daily exception reporting and controlled handoff templates."
    ],
    "measure": [
      "Processing turnaround and rework volume.",
      "Segregation of duties and approval boundaries."
    ]
  },
  "bpo/data-processing": {
    "summary": "Repeatable data operations need input standards, checks for anomalies, and clear rules for sensitive information.",
    "examples": [
      "A company receives inconsistent spreadsheets from partners.",
      "A reporting team needs records cleaned before dashboard publication."
    ],
    "deliverables": [
      "Data validation workbook, processing templates, and exception queues.",
      "Quality sampling framework and structured handoff logs."
    ],
    "measure": [
      "Completeness and validation pass rate.",
      "Restricted access, retention, and secure file transfer."
    ]
  },
  "bpo/data-entry": {
    "summary": "Accurate entry at scale requires a defined source, double-check process, and consistent field definitions.",
    "examples": [
      "A retailer needs thousands of product records updated accurately.",
      "An accounting team needs approved receipts entered into a system."
    ],
    "deliverables": [
      "Field-level instructions, intake batching, and duplicate detection.",
      "Spot-check QA reports and exception escalation."
    ],
    "measure": [
      "Error rate per record and throughput.",
      "Source-document permissions and change traceability."
    ]
  },
  "bpo/document-processing": {
    "summary": "Document-heavy work benefits from standardized classification, extraction, exception review, and retention controls.",
    "examples": [
      "An insurer needs incoming claim documents categorized for review.",
      "A logistics team needs shipping paperwork matched to orders."
    ],
    "deliverables": [
      "Document intake checklist, indexing schema, and verification steps.",
      "Controlled repository, audit trail, and escalation workflow."
    ],
    "measure": [
      "Classification accuracy and turnaround time.",
      "Privacy, document retention, and exception ownership."
    ]
  },
  "bpo/virtual-assistance": {
    "summary": "Virtual assistance should be defined by outcomes, boundaries, and managed access—not unlimited inbox or admin permissions.",
    "examples": [
      "A founder needs calendar, CRM, and customer follow-up coordination.",
      "An agency needs vendor research, meeting preparation, and task tracking."
    ],
    "deliverables": [
      "Role-specific work plan, scheduling standards, and approval paths.",
      "Shared task board, SOP library, and weekly performance review."
    ],
    "measure": [
      "Task completion and handoff accuracy.",
      "MFA, scoped access, confidentiality, and offboarding."
    ]
  },
  "automation/workflow-automation": {
    "summary": "Structured triggers and exceptions remove repeated manual chasing while keeping people in control of sensitive decisions.",
    "examples": [
      "A form submission should route to the correct team automatically.",
      "A purchase approval should notify owners and record the decision."
    ],
    "deliverables": [
      "Trigger/action workflow, conditional routing, and notification engine.",
      "Failure alerts, retry policy, and approval audit log."
    ],
    "measure": [
      "Time to complete workflow and missed-step rate.",
      "Fallback procedure and monitoring of failed executions."
    ]
  },
  "automation/business-process-automation": {
    "summary": "End-to-end automation joins departments, data, and approvals under a single documented process.",
    "examples": [
      "Procurement needs coordinated requests, approvals, and purchase records.",
      "Employee onboarding needs IT, HR, and manager tasks sequenced."
    ],
    "deliverables": [
      "Process map, orchestration workflow, and role-specific dashboards.",
      "Exception queue, status tracking, and governance checklist."
    ],
    "measure": [
      "End-to-end process duration and manual handoffs.",
      "Approval authority and rollback process."
    ]
  },
  "automation/ai-automation": {
    "summary": "AI can assist classification or drafting, but sensitive, uncertain, or consequential decisions need controls and review.",
    "examples": [
      "A support team wants draft replies grounded in approved knowledge.",
      "A team needs long incoming documents summarized for human review."
    ],
    "deliverables": [
      "Retrieval-supported assistant, classification workflow, and review UI.",
      "Evaluation dataset, logging plan, and human escalation triggers."
    ],
    "measure": [
      "Answer quality, exception rate, and reviewer workload.",
      "Data handling policy, prompt-injection testing, and hallucination checks."
    ]
  },
  "automation/customer-service-automation": {
    "summary": "Automated support should quickly resolve common requests without blocking access to a human for difficult cases.",
    "examples": [
      "Customers want order-status updates without waiting for an agent.",
      "Ticket requests need smart routing and suggested replies."
    ],
    "deliverables": [
      "Customer self-service flow, intent routing, and CRM lookup with consent.",
      "Human handoff button and agent context summary."
    ],
    "measure": [
      "Self-service resolution and escalation success.",
      "Wrong-account prevention and clear disclosure of automation."
    ]
  },
  "automation/email-automation": {
    "summary": "Email automations need opt-in rules, frequency controls, personalization, and safe unsubscribe handling.",
    "examples": [
      "An account team needs lifecycle reminders after approved events.",
      "Sales needs follow-ups based on customer actions, not mass blasts."
    ],
    "deliverables": [
      "Triggered email sequences, approval templates, and list hygiene rules.",
      "Delivery monitoring, suppression handling, and A/B testing plan."
    ],
    "measure": [
      "Delivery, bounce, unsubscribe, and conversion rates.",
      "Consent, segmentation, and suppression list enforcement."
    ]
  },
  "automation/lead-sales-automation": {
    "summary": "Sales automation should preserve clean records and human judgment while reducing repetitive pipeline administration.",
    "examples": [
      "New leads should be qualified and routed by territory.",
      "Sales representatives need reminders for stalled opportunities."
    ],
    "deliverables": [
      "Lead scoring rules, CRM stage automation, and routing alerts.",
      "Pipeline dashboard, duplicate handling, and follow-up schedule."
    ],
    "measure": [
      "Qualified-lead response time and handoff quality.",
      "Data accuracy, fair routing, and manual override."
    ]
  },
  "automation/data-reporting-automation": {
    "summary": "Reporting automation should produce trustworthy numbers with traceable sources and reconciliation checks.",
    "examples": [
      "Managers need a scheduled operational performance report.",
      "A finance team needs daily exceptions and trend summaries."
    ],
    "deliverables": [
      "Data pipelines, scheduled dashboards, and distribution rules.",
      "Quality gates, metric definitions, and source lineage."
    ],
    "measure": [
      "Report freshness and reconciliation pass rate.",
      "Access permissions and exception monitoring."
    ]
  },
  "automation/document-automation": {
    "summary": "Document automation can speed intake and extraction if low-confidence fields go to qualified human review.",
    "examples": [
      "An operations team needs invoices captured into records.",
      "Legal operations needs metadata extracted for routing, not automated judgment."
    ],
    "deliverables": [
      "Document capture, extraction templates, and routing workflows.",
      "Human review queue, confidence thresholds, and audit export."
    ],
    "measure": [
      "Extraction accuracy and manual correction rate.",
      "Secure storage and retention approvals."
    ]
  },
  "automation/hr-workforce-automation": {
    "summary": "Employee lifecycle automation should coordinate people and systems while respecting private HR information.",
    "examples": [
      "New hires need coordinated onboarding tasks across departments.",
      "Managers need automated reminders for time-off approvals and reviews."
    ],
    "deliverables": [
      "Onboarding/offboarding workflows, access requests, and reminders.",
      "HR task dashboard, approval tracking, and role-based records."
    ],
    "measure": [
      "Completion timelines and overdue tasks.",
      "Sensitive HR access, authorized approvers, and legal review."
    ]
  },
  "automation/finance-invoicing-automation": {
    "summary": "Finance workflows should prevent duplicates, enforce approval levels, and keep people responsible for payments.",
    "examples": [
      "Vendors submit invoices requiring matching and approvals.",
      "A team needs aging reminders and reconciled invoice statuses."
    ],
    "deliverables": [
      "Invoice intake, three-way match checks, and approval routing.",
      "Exception dashboard, aging reports, and audit history."
    ],
    "measure": [
      "Invoice cycle time and matching exceptions.",
      "Dual authorization, fraud checks, and segregation of duties."
    ]
  }
}
