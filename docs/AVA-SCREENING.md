# Ava Screening — operational setup and trust boundaries

Public **email-OTP-only** applicant route: `/ava-screening/`. Anyone may register with name, email and role, verify a six-digit email code, complete their profile and start the assessment immediately. **No password, OAuth or recruitment invitation is required.** Existing signed recruiter invitations remain backward compatible. The original `/ai-job-screening` redirect and legacy `RECRUITMENT_AVA_ENABLED` gate are unchanged. Keep `/recruitment-admin/` protected by Cloudflare Access; never expose reviewer credentials in frontend JavaScript.

Public signup uses Cloudflare Turnstile verification *server-side* before sending codes and requires an allowed browser origin. Each email is limited to one new OTP every 60 seconds, five codes per rolling 24-hour window, with a maximum of five guesses per OTP. The same email always maps to the same assessment record and may sign in again with a fresh OTP. Public OTP send timestamps are recorded separately in `ava_screening_public_otp_events` to enforce an actual rolling 24-hour quota. Applicants confirm their name and chosen track only after successful OTP verification; previously verified invitation applicants can also recover their session through this public path. Sessions last up to seven days and can be explicitly revoked by signing out. The identity-document requirement is **not** part of the public self-registration journey; optional manual identity review is retained for legacy recruiter-managed flows.

## Required Cloudflare Pages bindings

- `AVA_SCREENING_ENABLED=true` — intentionally off by default. Do not enable before verifying the bindings and retention policy.
- `AVA_SCREENING_SECRET` — random secret of at least 32 characters used for signed invitations, sessions, and OTP HMAC; set as encrypted secret. Do not recycle `OTP_SECRET` or store in Git.
- `AVA_REVIEWER_SECRET` — *different* random secret (32+ characters), accessible only to authorized Talent Acquisition reviewers; set as encrypted secret.
- `AVA_DELETION_SECRET` — a third, independent encrypted secret (32+ characters), required in the additional `X-AVA-Deletion-Key` header for irreversible `deleteScreening` operations. Keep it exclusively with the privacy/data administrator.
- `SUBMISSIONS_DB` — existing D1 database binding; API creates isolated `ava_screening_*` tables if needed. Schema is also documented in `db/submissions.sql` for repeatable provisioning.
- `AVA_ID_BUCKET` — optional *legacy* private R2 bucket for recruiter-managed manual ID uploads only. The public app does not expose an attachment upload.
- `AVA_IDV_API_URL`, `AVA_IDV_API_KEY`, `AVA_IDV_WEBHOOK_SECRET` — required certified external mobile live ID/liveness provider adapter. Configure only after verifying the provider API request, callback signature and full result mapping; the API URL must be HTTPS. Keep API key/webhook secret encrypted. Without all three settings, a candidate cannot request verified live ID checks.
- `AVA_PROCTOR_BUCKET` — private R2 bucket binding for continuous, explicitly consented webcam+microphone and screen recording segments. Never expose it publicly. Its retention and authorized retrieval require deployment approval. Without it, new assessments cannot start.
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

New 30-question assessments must remain on a draft/preview release until a certified ID/liveness/NFC provider, private proctor recording storage, retention policies,
32+ character Ava-specific secrets, retention schedule, review permissions and
full synthetic end-to-end tests are verified and approved. The existing live public Ava v1 is a separate release: do not merge this fail-closed v2 into production until the prerequisites are satisfied. A successful website
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
7. For new v2 sessions: candidate completes certified *live* selfie, government ID/passport and (for passport) NFC provider verification from an emailed phone link, with explicit camera/biometric consent. The vendor must attest document authenticity, exact normalized applicant name match, liveness, NFC for passports, and a face score of at least 95/100. All must pass for `Verified Applicant Profile`; otherwise review remains pending. These results are not self-reported or generated locally. Existing v1 sessions retain their historical assessment version. The assessment cannot start if provider attestation is absent.
8. Before a new assessment begins, the applicant grants explicit consent and starts browser screen, webcam and microphone recording. The Worker verifies that fresh private screen and camera recording segments have been received. No recording credentials or evidence are exposed to the browser. If any capture permission is rejected or revoked, the assessment cannot start or accept further answers until recording is restored.
9. New sessions then begin a 45-minute, server-enforced, **30-question** assessment: 15 role questions and 15 English writing, reading, grammar and comprehension questions. Workers AI varies the *current* question when available and the Worker stores the actual question in D1 before displaying it. The reviewed bank provides a fallback. Future questions and answer keys are never revealed to applicants. Every answer is saved separately; refresh/tab changes do not reset the deadline.
10. With optional AI consent, Workers AI can asynchronously review relevance, grammar, clarity and coherence of *text*. The results are advisory for a human reviewer; no hiring pass/fail is generated. Browser speech recognition can dictate and edit answers, but a transcript alone cannot establish pronunciation or spoken fluency.

## Privacy, accessibility, and monitoring

New v2 assessments require explicit consented webcam/microphone and display capture; video/audio chunks are uploaded only to a private R2 bucket. Browser focus, tab visibility and fullscreen events are recorded, and a coarse loud-sound activity flag may be logged. These are indicators for authorized human review, not proof of cheating. Do not imply browsers can block every tab switch, detect arbitrary installed extensions, distinguish individual voices, or reliably prevent virtual devices. Capture starts only after the applicant affirmatively grants browser permissions. Phones are used for the certified external liveness and passport workflow; the general Web NFC browser interface cannot read and authenticate passport eMRTD chips. Screen sharing may require a supported desktop browser.

Identity and personal data require an approved data-retention/deletion policy, restricted access, encryption-at-rest controls, documented consent and privacy/legal review prior to processing real candidates. Implement scheduled deletion of expired records and R2 documents under your approved retention window; it is not automatically configured here. Also perform a controlled end-to-end email/OTP and reviewer/download/upload test before enabling live candidates.

## Production release checklist

- Verify private R2 is active, bound, and access-controlled; check manual identity download and review.
- Confirm D1 table creation, strict storage permissions, and backup/deletion lifecycle.
- Confirm actual SES delivery, OTP expiry/attempt limits, single-use code, and invitation limit behavior.
- Test dark/light, desktop/mobile, no speech recognition, microphone denied, refresh/resume, time expiry, offline, and screen readers.
- Confirm Pages build, TypeScript, Cloudflare deployment success, and WAF/CAPTCHA/rate limiting before setting `AVA_SCREENING_ENABLED=true`.
- Confirm HR/legal approved bias controls, AI consent practices, and human-reviewed results.
## V2 release and external-provider integration contract

**Release status:** this is a staging feature specification. A UI, mocked callback, test webcam, manually approved identity photo, raw OCR comparison, or score estimated by a general-purpose AI model **must never** set `Verified Applicant Profile`.

- Applicant login: `/applicant-portal`, using the existing email OTP registration and session. A signed-in applicant can see existing verified Careers form submissions from `form_submissions` using the server-side verified email and select the corresponding application's independent assessment session. An outstanding assessment shows `Complete Profile & Assessment`, `Complete Assessment`, or `Continue Assessment`.
- The `/api/ava-screening` `identityStart` action creates an external provider verification session, stores the vendor reference and emails the vendor-hosted HTTPS link to the verified applicant. The provider supplies its own live camera interface. Do not expose local file upload or allow users to pass arbitrary result scores.
- The example external provider **adapter contract must be verified and adapted** to the chosen SDK/API. It currently expects an HTTPS JSON POST accepting a `reference` and `callbackUrl` and replying `verificationUrl` plus `reference`. It is not a claim that a specific vendor already implements those fields.
- The provider callback is `POST /api/ava-identity-callback` and expects raw-body HMAC-SHA256 `X-Ava-Identity-Signature` using `AVA_IDV_WEBHOOK_SECRET`, a recent `timestamp` (epoch milliseconds), a known vendor `reference`, and authoritative booleans for `livenessPassed`, `documentAuthentic`, `passportNfcPassed`, with `documentType`, `documentFullName` and a calibrated `faceMatchScore` in 0–100. The specific provider's signed payload and signature scheme **must be translated and tested** before activation. Include replay protection, provider account verification and event-id deduplication in the production adapter.
- No claim that the score of 95% corresponds to a universal assurance or FAR/FMR threshold across vendors. Select and calibrate the metric and false-match protections according to the provider's validated guidance. A negative or uncertain result needs an accessible human-review path.
- `proctorChunk` accepts only streamed recordings by an authenticated profile holder and saves the associated private R2 key. The server checks recently stored screen and camera segments before and during assessment. Configure strict file retention, authorized access, deletion, cost quotas, abuse rate limits and support/appeals before production.
- These new recording and identity requirements intentionally **block** new assessment starts on environments lacking an external verification provider or private proctor R2 binding. Existing sessions with assessment_version 1 retain their ten-question bank and saved work.
- **Do not merge or deploy V2** until the external provider, signed callbacks, secure R2 buckets, retention policy, data-protection/biometric consent, accessibility alternatives and controlled live tests have been approved. Document explicit lawful basis and access/deletion procedures for recordings and biometric identity signals.


## V3 applicant portal, document-center and protected review enhancements

The applicant profile and status route remains `/applicant-portal`, backed by the
existing verified Careers application reference and Ava OTP session. Each application
can carry its own profile, assessment and onboarding requirements. Incomplete records
show **Required action — Complete Assessment** or **Complete Profile & Assessment**.

Recruitment Admin remains access-gated at `/recruitment-admin`. Authorized reviewers
can request individual onboarding documents **after** the assessment is submitted,
see what is pending, download protected PDFs, approve them or request resubmission.
Candidates see their own requests, instructions, submission and review status. This
workflow is distinct from live government ID or passport verification: **no ID/passport
file-upload bypass is exposed to applicants**. The old manual ID upload API is
disabled unless `AVA_LEGACY_ID_UPLOAD_ENABLED=true` is explicitly and separately set.

To enable private onboarding submission, bind an isolated R2 bucket named
`AVA_ONBOARDING_BUCKET` in Cloudflare Pages; do not publish or expose a public
R2 domain. Uploads accept PDF only, smaller than 5 MB, with a signature and format
check. The API enforces an OTP-verified session and an exact application-specific
request ID. Applicant access never lists or downloads another applicant's documents.
Restricted recruiter downloads require the Cloudflare Access-protected origin proxy.

To enable assessment proctoring, the existing separate `AVA_PROCTOR_BUCKET` binding
must be configured. Reviewers can access saved per-session recording segments and
browser sound/focus flags through the same Access-protected admin proxy; do not
present a sound-activity flag as proof of misconduct, speaker recognition, or
a determination by AI. A retention policy, applicant notice/consent record, audit,
segmented deletion and storage quotas are required before real processing.

The identity-provider callback now requires a **unique provider eventId** inside the
signed payload, in addition to the signed vendor reference and recent timestamp.
The `ava_screening_provider_events` D1 table blocks repeat delivery of the same
event. Before integrating a specific vendor, implement its exact payload/signature
mapping, authoritative document/NFC and face-liveness result semantics, event IDs
and a secure webhook secret; replay protection alone does not certify identity.
Do not activate or change credentials until the real provider is selected and
its contract is verified.

## Outstanding production activation gates

These features are coded but *not yet fully operating* without external services:

- Choose and contract a certified live document/NFC/face-liveness verification
  provider with a calibrated face-match threshold and appeal path.
- Bind **separate private** R2 buckets for `AVA_PROCTOR_BUCKET` and
  `AVA_ONBOARDING_BUCKET`; define object-lifecycle retention and reviewer
  access audits. Existing older assessments remain distinct.
- Approve applicant notices, biometrics/voice/video processing, retention,
  accessibility alternatives, human-review protocols and secure deletion,
  and complete a controlled end-to-end test with permitted test identities.
- Test direct calls, failed permissions, expired codes, concurrent uploads,
  unauthorized/cross-account access, onboarding resubmissions, signed webhook
  replay, timeouts and large upload rejection.

Do not claim that new applicants can pass identity verification or start a
recorded exam until the provider and private R2 bindings have been confirmed
in the actual Cloudflare **production** environment.
