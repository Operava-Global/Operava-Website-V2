# Website V2 deployment

Target: `Operava-Global/Operava-Website-V2`, branch `main`.
Cloudflare account: **Jelvan - Business - Operava** (`d33b1b4666f334f763903c86728a3e74`).
Pages project: `operava-website-v2`.
URL: https://operava-website-v2.pages.dev

## Build
- Node.js: 22
- Build command: `npm run build:pages`
- Output: `dist`; root: repository root.
- Pages compiles the `functions/` directory automatically.
- The optional Express build goes to `build/server.cjs`, outside public assets.

## Bindings
| Binding | Resource |
| --- | --- |
| SUBMISSIONS_DB | D1 `operava-submissions`, ID `19f8a477-6369-49de-bb25-2c9358820757` |
| AI | Workers AI |
| OTP_SECRET | Cloudflare encrypted secret, minimum 32 characters |
| SES_SMTP_USERNAME | Required encrypted SES SMTP credential |
| SES_SMTP_PASSWORD | Required encrypted SES SMTP credential |

`wrangler.jsonc` is the source of truth for bindings and plain variables.
The D1 schema is in `db/submissions.sql`. The business database was initialised with forms, OTP, recruitment, assessment, document verification and resume-text tables.

Email uses Amazon SES SMTP in Sydney on port 587 with STARTTLS. Resend keys are not used.
Set SES credentials in Pages production secrets, then redeploy. Never commit credentials.
Sender: `OPERAVA <noreply@operavaglobal.com>`; inboxes: `hello@`, `talents@`, `academy@operavaglobal.com`.
The sending identity must be verified in SES.

## Optional services and current limitations
R2 is not enabled in the target account as checked on 25 October 2026 (Malaysia).
No RESUMES_BUCKET binding is declared. Extracted resume text and structured fields are stored in D1; original binaries are not retained.
To retain originals, enable R2, create a private bucket, and add RESUMES_BUCKET to the Wrangler configuration.
MEGA backup is optional and needs separate credentials. It is not configured by this deployment.
AWS connection reauthentication is required before SES credentials can be provisioned through the connected app.

## Deployment
Git-connected Pages deploys main automatically. The manual GitHub workflow is an alternative and requires the repository secret OPERAVA_BUSINESS_CF_API_TOKEN scoped to this business account. It no longer uses the old database ID or the other Pages project.
The repository currently has no npm lockfile, so the workflow uses npm install rather than npm ci.

## Verification
The public /api/health route is a minimal liveness check only and intentionally does not disclose binding, secret, database or email readiness. Verify configuration through the authenticated Cloudflare dashboard. A successful site deployment alone does not prove email delivery.
Do not send test submissions to customers. Validate OTP delivery with an authorised test address after SMTP secrets are configured.

## Current form-submission rules
All public Services, Contact, Careers and Academy forms use the same verified submission sequence:
`POST /api/forms/start` → SES SMTP OTP → `POST /api/forms/verify` → atomic D1 submission and OTP consumption → confirmation and staff notifications. A resend uses `/api/forms/resend`.
The server validates required form fields and persists only an allowlist of bounded text fields. Uploaded résumés must be written to D1 before an upload is acknowledged. R2 remains optional for original document binaries.

The legacy unverified direct-email endpoints `/api/inquiry` and `/api/apply` are disabled by default (HTTP 410). To intentionally restore them, set `LEGACY_UNVERIFIED_FORMS_ENABLED=true`, but this bypasses the verified submission workflow and is **not recommended**.

## Recruitment AVA retained but unavailable on the public website
The Recruitment AVA source code, tests/reference assets, and Pages Functions are **preserved** in this repository. The old `/ai-job-screening` route redirects to `/careers/hiring-process`. Public hiring content directs applicants to `/apply`.

The `/api/recruitment/*` and `/api/job-screening-chat` endpoints default to HTTP 404. Explicit `RECRUITMENT_AVA_ENABLED=true` in the Pages environment can restore those APIs if the feature is deliberately relaunched. The main-site business AVA is separate and unaffected.
