# Ava Screening — operational setup and trust boundaries

New, separate **invitation-only** route: `/ava-screening/`. The original `/ai-job-screening` redirect and `RECRUITMENT_AVA_ENABLED` gate are unchanged. The new Ava screening API defaults to **disabled**. Do not advertise `/ava-screening/` publicly or expose reviewer credentials in frontend JavaScript.

## Required Cloudflare Pages bindings

- `AVA_SCREENING_ENABLED=true` — intentionally off by default. Do not enable before verifying the bindings and retention policy.
- `AVA_SCREENING_SECRET` — random secret of at least 32 characters used for signed invitations, sessions, and OTP HMAC; set as encrypted secret. Do not recycle `OTP_SECRET` or store in Git.
- `AVA_REVIEWER_SECRET` — *different* random secret (32+ characters), accessible only to authorized Talent Acquisition reviewers; set as encrypted secret.
- `SUBMISSIONS_DB` — existing D1 database binding; API creates isolated `ava_screening_*` tables if needed. Schema is also documented in `db/submissions.sql` for repeatable provisioning.
- `AVA_ID_BUCKET` — private R2 bucket binding for original ID/passport media; bucket must not have a public domain. **Without this binding, identity upload returns HTTP 503 and assessment cannot start.**
- `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`, `SES_EMAIL_FROM` — existing AWS SES SMTP delivery from Sydney; verified domain must allow outgoing messages.
- `AI` (optional Workers AI binding) — role and English *written* feedback only. Without an AI binding, answers remain `pending` for human review; no fake numerical grades are produced.

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
- Delete one candidate record and its private identity file (irreversible): `{ "action":"deleteScreening", "id":"<session_id>", "confirm":"DELETE" }`. Confirm retention requirements and backups first.
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