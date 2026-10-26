# Ava Screening — operational setup and trust boundaries

Public **email-OTP-only** applicant route: `/ava-screening/`. Anyone may register with name, email and role, verify a six-digit email code, complete their profile and start the assessment immediately. **No password, OAuth or recruitment invitation is required.** Existing signed recruiter invitations remain backward compatible. The original `/ai-job-screening` redirect and legacy `RECRUITMENT_AVA_ENABLED` gate are unchanged. Keep `/recruitment-admin/` protected by Cloudflare Access; never expose reviewer credentials in frontend JavaScript.

Public signup uses Cloudflare Turnstile verification *server-side* before sending codes and requires an allowed browser origin. Each email is limited to one new OTP every 60 seconds, five codes per rolling 24-hour window, with a maximum of five guesses per OTP. The same email always maps to the same assessment record and may sign in again with a fresh OTP. Sessions last up to seven days and can be explicitly revoked by signing out. The identity-document requirement is **not** part of the public self-registration journey; optional manual identity review is retained for legacy recruiter-managed flows.

## Required Cloudflare Pages bindings

- `AVA_SCREENING_ENABLED=true` — intentionally off by default. Do not enable before verifying the bindings and retention policy.
- `AVA_SCREENING_SECRET` — random secret of at least 32 characters used for signed invitations, sessions, and OTP HMAC; set as encrypted secret. Do not recycle `OTP_SECRET` or store in Git.
- `AVA_REVIEWER_SECRET` — *different* random secret (32+ characters), accessible only to authorized Talent Acquisition reviewers; set as encrypted secret.
- `AVA_DELETION_SECRET` — a third, independent encrypted secret (32+ characters), required in the additional `X-AVA-Deletion-Key` header for irreversible `deleteScreening` operations. Keep it exclusively with the privacy/data administrator.
- `SUBMISSIONS_DB` — existing D1 database binding; API creates isolated `ava_screening_*` tables if needed. Schema is also documented in `db/submissions.sql` for repeatable provisioning.
- `AVA_ID_BUCKET` — private R2 bucket binding for original ID/passport media; bucket must not have a public domain. **Without this binding, identity upload returns HTTP 503 and assessment cannot start.**
- `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`, `SES_EMAIL_FROM` — existing AWS SES SMTP delivery from Sydney; verified domain must allow outgoing messages.
- `AI` (optional Workers AI binding) — role and English *written* feedback only. Without an AI binding, answers remain `pending` for human review; no fake numerical grades are produced.

## Private Recruitment Admin dashboard (Cloudflare Access)

The private reviewer workspace is at `https://www.operavaglobal.com/recruitment-admin/`.
It is implemented in the **same GitHub repository** and shares the existing `SUBMISSIONS_DB`,
private identity bucket and `/api/ava-screening` backend with the candidate assessment.
There is no public website header/footer, public navigation link, or sitemap listing
for this route. The candidate assessment at `/ava-screening/` uses the same isolated
app-only shell and stage-specific SVG illustrations from `public/media/ava-assessment-*.svg`.

Cloudflare Access application: **OPERAVA Recruitment Admin — Private**.
It protects `www.operavaglobal.com/recruitment-admin/*`, uses one-hour sessions,
is hidden from the Access app launcher and currently authorizes only the existing
`admin@operavaglobal.com` admin account using the existing OTP login method.
To add Recruitment Team members, have the Zero Trust administrator explicitly
amend the *Access Allow policy* with their individually approved addresses/groups.
**Never** broaden the policy to any internet user, and do not treat the hidden URL
as sufficient access control.

The admin Pages Functions at `functions/recruitment-admin/` revalidate the
signed `Cf-Access-Jwt-Assertion` JWT (Cloudflare certs, RSA signature, audience,
issuer and expiration). Production and preview Pages settings require:
`AVA_ACCESS_AUD` and `AVA_ACCESS_TEAM_DOMAIN` (configured as nonsecret environment
variables). The protected origin-side `/recruitment-admin/api` proxy additionally
checks the same-origin POST request and injects `AVA_REVIEWER_SECRET` server-side
before invoking the underlying reviewer actions. It never delivers reviewer
or deletion secrets to the browser. The privileged irreversible deletion action
remains excluded from the browser dashboard.

The dashboard provides:
1. **Send Invitation** — enter applicant name, invited email and position. The
   server signs a unique 7-day invitation link and emails it via existing Amazon SES.
2. **Invitation Tracking** — shows the most recent 100 recruiter-sent invitations.
   **Public applicants** is a separate queue, showing OTP verification, saved profile and
   assessment progress for up to 100 self-registered candidates.
3. **Identity Review** — download evidence from private R2, manually inspect
   the original, then approve or ask for resubmission.
4. **Assessment Reports** — review candidate profile and actual written answers,
   and save human review or follow-up notes. No automated hire/reject result.

Production must retain `AVA_SCREENING_ENABLED=false` until private ID R2,
32+ character Ava-specific secrets, retention schedule, review permissions and
full synthetic end-to-end tests are verified and approved. A successful website
build or Cloudflare Access deployment does *not* prove invitation mail or ID
upload flows function. The initial allowlist is intentionally narrow.

## Reviewer operations

The reviewer API is `POST https://www.operavaglobal.com/api/ava-screening` with `Content-Type: application/json`, header `X-AVA-Reviewer-Key: <AVA_REVIEWER_SECRET>`, and one of these bodies:

- Send invite: `{ "action":"invite", "name":"Candidate", "email":"candidate@example.com", "role":"tech" }` (`ops` or `cx` are valid).
- View pending queue: `{ "action":"pendingReviews" }`.
- Privately download document: `{ "action":"identityDocument", "id":"<session_id>" }`. Save the binary response securely; do not use third-party viewers or public links.
- Approve manual identity review: `{ "action":"reviewIdentity", "id":"<session_id>", "decision":"approved" }`.
- Request resubmission: `{ "action":"reviewIdentity", "id":"<session_id>", "decision":"needs_resubmission" }`.
- List completed / time-expired assessments (100/page): `{ "action":"screeningResults", "offset":0 }`.
- Review original candidate answers, profile, optional AI writing suggestions and consented event totals: `{ "action":"screeningDetail", "id":"<session_id>" }`. This data is reviewer-only and includes sensitive personal information.
- Record manual reviewer disposition: `{ "action":"reviewScreening", "id":"<session_id>", "status":"reviewed", "note":"Human review summary" }`. Use `status:"follow_up_required"` with a meaningful note when additional human follow-up is necessary. This does **not** hire, reject, score, or automatically notify candidates.
- Delete one candidate record and its private identity file (irreversible): `{ "action":"deleteScreening", "id":"<session_id>", "confirm":"DELETE" }`. Requires both reviewer authorization and an independent `X-AVA-Deletion-Key` header. Confirm retention requirements and backups first.
- `ava_screening_review_events` stores manual identity/review actions for audit. A shared reviewer secret does not identify individual reviewers. **Before live use, require Cloudflare Access with individual authenticated accounts, review access logs, and implement organization-specific attribution for each reviewer.**


Only reviewers should have the `AVA_REVIEWER_SECRET`. Set rate limits at Cloudflare WAF for `/api/ava-screening`, and protect reviewer operations behind additional access controls where possible. Don't put the reviewer key in a query string or browser-shipped dashboard.

## Candidate experience

1. Reviewer sends an email invitation, expiring after seven days.
2. Candidate opens private URL and requests a six-digit OTP from the invited email (10-minute expiry, five attempts, at most five OTP sends with a one-minute cooldown).
3. Email verification creates a single browser-tab session held in `sessionStorage`. Session tokens are signed, hashed in D1, and expire after seven days. A candidate changing devices must use a fresh invitation if their previous session was already consumed.
4. Candidate submits full name, optional phone, education, experience, role motivation, privacy consent, monitoring consent, and optional AI-feedback consent.
5. Candidate uploads an authentic JPEG/PNG/PDF under 5 MB to *private* R2. The secure upload accepts images captured using a phone camera. Identity is **not** marked approved without human review. Rejected evidence may be replaced.
6. Reviewer sees pending entries, fetches original evidence, and approves or requests resubmission.
7. The verified candidate begins a 45-minute, server-enforced, ten-question assessment. Questions vary by Technology Executive, Business Operations Executive, and Customer Experience Executive; three questions focus on English writing, grammar and clarity. Each answer is saved to D1, independent of connection interruptions. The timer does not restart on refresh or tab changes.
8. With optional AI consent, Workers AI can asynchronously review relevance, grammar, clarity and coherence of *text*. The results are advisory for a human reviewer; no hiring pass/fail is generated. Browser speech recognition can dictate and edit answers, but a transcript alone cannot establish pronunciation or spoken fluency.

## Privacy, accessibility, and monitoring

Only explicit focus, tab visibility, fullscreen exit, and microphone permission-denial events are recorded; events are capped at 300 per session. The application **does not** stealthily record webcam, screen, microphone audio, or biometric data. Fullscreen is requested when possible but not required. Consent is shown before monitoring begins. Browsers do not expose passport NFC chip validation via their general-purpose Web NFC API; real eMRTD chip authentication requires an approved specialized provider and app/SDK. Do not present manual review or OCR as automated document authenticity verification.

Identity and personal data require an approved data-retention/deletion policy, restricted access, encryption-at-rest controls, documented consent and privacy/legal review prior to processing real candidates. Implement scheduled deletion of expired records and R2 documents under your approved retention window; it is not automatically configured here. Also perform a controlled end-to-end email/OTP and reviewer/download/upload test before enabling live candidates.

## Production release checklist

- Verify private R2 is active, bound, and access-controlled; check manual identity download and review.
- Confirm D1 table creation, strict storage permissions, and backup/deletion lifecycle.
- Confirm actual SES delivery, OTP expiry/attempt limits, single-use code, and invitation limit behavior.
- Test dark/light, desktop/mobile, no speech recognition, microphone denied, refresh/resume, time expiry, offline, and screen readers.
- Confirm Pages build, TypeScript, Cloudflare deployment success, and WAF/CAPTCHA/rate limiting before setting `AVA_SCREENING_ENABLED=true`.
- Confirm HR/legal approved bias controls, AI consent practices, and human-reviewed results.