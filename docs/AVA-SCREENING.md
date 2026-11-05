# Ava Screening — operational setup and trust boundaries

Public **email-OTP-only** applicant route: `/ava-screening/`. Anyone may register with name, email and role, verify a six-digit email code, complete their profile and start the assessment immediately. **No password, OAuth or recruitment invitation is required.** Existing signed recruiter invitations remain backward compatible. The original `/ai-job-screening` redirect and legacy `RECRUITMENT_AVA_ENABLED` gate are unchanged. Keep `/recruitment-admin/` protected by Cloudflare Access; never expose reviewer credentials in frontend JavaScript.

Public signup uses Cloudflare Turnstile verification *server-side* before sending codes and requires an allowed browser origin. Each email is limited to one new OTP every 60 seconds, five codes per rolling 24-hour window, with a maximum of five guesses per OTP. The same email always maps to the same assessment record and may sign in again with a fresh OTP. Public OTP send timestamps are recorded separately in `ava_screening_public_otp_events` to enforce an actual rolling 24-hour quota. Applicants confirm their name and chosen track only after successful OTP verification; previously verified invitation applicants can also recover their session through this public path. Sessions last up to seven days and can be explicitly revoked by signing out. The identity-document requirement is **not** part of the public self-registration journey; optional manual identity review is retained for legacy recruiter-managed flows.

## Required Cloudflare Pages bindings

- `AVA_SCREENING_ENABLED=true` — intentionally off by default. Do not enable before verifying the bindings and retention policy.
- `AVA_SCREENING_SECRET` — random secret of at least 32 characters used for signed invitations, sessions, and OTP HMAC; set as encrypted secret. Do not recycle `OTP_SECRET` or store in Git.
- `AVA_REVIEWER_SECRET` — *different* random secret (32+ characters), accessible only to authorized Talent Acquisition reviewers; set as encrypted secret.
- `AVA_DELETION_SECRET` — a third, independent encrypted secret (32+ characters), required in the additional `X-AVA-Deletion-Key` header for irreversible `deleteScreening` operations. Keep it exclusively with the privacy/data administrator.
- `SUBMISSIONS_DB` — existing D1 database binding; API creates isolated `ava_screening_*` tables if needed. Schema is also documented in `db/submissions.sql` for repeatable provisioning.
- `AVA_ID_BUCKET` — optional *legacy* private R2 bucket for recruiter-managed manual ID uploads only. The new public phone-verification flow sends identity media directly to Veriff and stores only decision metadata in OPERAVA D1.
- `AVA_VERIFF_BASE_URL` — the exact HTTPS API base URL issued for OPERAVA's Veriff integration (plain-text Pages variable; hostname must be under `veriff.com` or `veriff.me`).
- `AVA_VERIFF_API_KEY` — Veriff integration API key; encrypted Pages secret.
- `AVA_VERIFF_SHARED_SECRET` — Veriff HMAC shared secret; encrypted Pages secret, minimum 24 characters. The app authenticates the Veriff session-creation response and decision webhook. Without all three settings, the secure phone identity link is disabled and the assessment remains locked.
- In Veriff Customer Portal, configure the **Decision webhook URL** as `https://www.operavaglobal.com/api/ava-identity-callback`. Enable a document + selfie identity-verification product with live liveness and document authenticity checks. Do not use a document-only flow. Test the exact integration in Veriff sandbox before switching to production.
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

Ava V2 code was merged into main on 26 October 2026 and the website was deployed successfully; however the certified live ID provider, proctor R2 storage and controlled applicant flows have NOT been activated or verified. New assessments fail closed until their configured prerequisites are available. V3 onboarding improvements remain in a separate development PR until private document storage, retention, reviewer permissions, integration tests and required security/privacy approvals are complete. A successful site build or Cloudflare Access deployment does *not* prove end-to-end email, NFC, liveness, or recorded assessments work.

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

1. Anyone can open `/ava-screening/`, register or sign in with email OTP only, and complete the profile. No recruiter invitation or password is required.
2. Before identity verification, the applicant explicitly consents to sharing name/email with Veriff and to the live ID + selfie/liveness process. The server creates a Veriff session and emails a 256-bit random one-time OPERAVA link. The link expires after 15 minutes. Its GET landing page does not consume the token (to avoid mail-security scanners); only a deliberate same-origin POST consumes it once and redirects to the authenticated Veriff-hosted HTTPS session URL.
3. The applicant opens the email on their phone, taps the link, and completes Veriff's live document + selfie flow. The desktop applicant portal polls status every five seconds. The Veriff decision webhook is HMAC-authenticated against the raw request body and API key before the status is accepted.
4. The identity gate opens only when Veriff returns `status=approved`, decision code `9001`, a document type, and an exact normalized match between the provider's verified name and the saved applicant profile. `review`, declined, resubmission, unknown, mismatched-name or incomplete results never self-approve; the assessment remains locked.
5. The applicant reads a three-part pre-start flow: identity, assessment rules/prohibited conduct, then device/recording permissions. The rules acknowledgement is stored server-side and required by the `begin` API.
6. The applicant explicitly consents to screen, webcam and microphone recording. The desktop browser must grant webcam/microphone and share the entire display (not a tab or single window). Screen and camera+microphone recordings are segmented and stored in private R2. The bucket lifecycle deletes `ava-proctor/` objects after 30 days.
7. During the assessment, supported focus loss, hidden-page, full-screen exit, microphone/capture interruption events immediately pause answer submission server-side. The unsaved current answer is cleared; previously submitted answers remain saved; the 45-minute timer continues. The applicant must restore both fresh recording streams and explicitly resume. Each incident is recorded for recruiter review.
8. Browser APIs cannot reliably detect every operating-system switch, screenshot, external device or off-screen assistance. The UI states this limitation; do not market browser proctoring as tamper-proof or guaranteed full-device surveillance.

Veriff's own retention and processing of ID images/selfie video follow the provider contract, privacy terms and the retention settings configured for OPERAVA's Veriff account. Complete the provider DPA, cross-border transfer review, privacy impact assessment and retention configuration before enabling real identity checks. OPERAVA stores the provider reference, decision/status, document type/country, name-match flag and timestamps, not the provider's raw ID image/selfie media. The assessment's separate proctor recordings are stored in private R2 with a verified 30-day lifecycle rule. in `sessionStorage`. Session tokens are signed, hashed in D1, and expire after seven days. A candidate changing devices must use a fresh invitation if their previous session was already consumed.
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
## Veriff hosted mobile identity and proctoring behavior

The public applicant flow uses a provider-hosted identity journey. The OPERAVA backend creates a Veriff session using the integration's HTTPS base URL and API key, authenticates the raw create-session response with the Veriff HMAC shared secret, and emails a short-lived, single-use OPERAVA redirect link. The desktop portal polls the server-owned identity status; it never trusts a browser-supplied approval boolean or receives the Veriff session URL.

The email redirect uses a scanner-safe GET interstitial: GET does not consume the token. A deliberate same-origin POST consumes the token once and redirects to the provider-hosted HTTPS session URL. The token hash, provider URL, expiry and used timestamp are stored in D1; the raw token is only sent by email. Veriff's decision webhook is accepted only after checking X-AUTH-CLIENT and HMAC-SHA256 over the exact raw request body in X-HMAC-SIGNATURE. Event/attempt IDs are deduplicated.

Only a Veriff decision with verification.status=approved, verification.code=9001, a document type, and an exact normalized match between the provider's verified name and the saved applicant legal name sets identity_status=approved. Provider review remains pending; a Veriff resubmission request reuses the same provider session with a newly issued single-use OPERAVA email link; expired/abandoned sessions can be replaced. A declined, invalid-code or mismatched-name result is locked for Talent Acquisition and cannot be retried by the applicant. None of these outcomes unlocks the assessment. Do not fabricate a face-match score or independent liveness booleans from fields Veriff does not return; configure the Veriff integration for document + selfie IDV with liveness and document-authenticity checks, and rely only on its final approved decision.

### Required provider setup

- Set AVA_VERIFF_BASE_URL to the exact HTTPS base URL in the Veriff integration portal.
- Set AVA_VERIFF_API_KEY and AVA_VERIFF_SHARED_SECRET as encrypted Cloudflare Pages secrets.
- Configure the Veriff Decision webhook URL to https://www.operavaglobal.com/api/ava-identity-callback.
- Enable a document + selfie verification product that includes live liveness and document authenticity. Verify supported IDs and countries for OPERAVA's candidate population.
- Complete the provider contract/data-processing agreement, cross-border transfer review, provider retention settings, privacy impact assessment and applicant notice before live identity capture.
- No Veriff credentials are currently connected to the Cloudflare Pages project. Until the three variables and provider webhook are configured and tested, identityProviderAvailable remains false, the email-link action is disabled, and the assessment stays locked. Public email-OTP registration remains available.

For the Veriff-hosted flow, ID images and selfie/liveness media are sent directly to Veriff. OPERAVA stores the provider reference, status/decision code, document type/country, name-match flag and timestamps in D1, not the provider's raw ID media in AVA_ID_BUCKET. Veriff's media retention follows its service agreement and account settings. Proctor recordings remain separate in private AVA_PROCTOR_BUCKET and are deleted by the 30-day R2 lifecycle.

### Pre-start briefing and proctor enforcement

The candidate must complete three readiness panels: verified identity, assessment instructions/prohibited conduct, then device/recording permissions. The rules acknowledgment is recorded server-side and begin rejects sessions without it. The candidate must separately consent to camera, microphone and screen recording, share the entire display, and enter browser full-screen mode before starting.

During the assessment, supported focus_lost, visibility_hidden, fullscreen_exited, microphone and capture interruption events set proctor_paused_at in D1. The answer endpoint rejects submissions while paused. The client clears the current unsaved draft; previously submitted answers remain saved. The 45-minute timer continues. Resumption requires fresh screen and camera/microphone segments recorded after the pause and an explicit Resume assessment action. A visible, focused, full-screen heartbeat is also required every three seconds; the server pauses answer submission if the heartbeat is missing for more than ten seconds. If a browser keepalive focus event is dropped, the heartbeat timeout and fresh-stream requirement still fail closed; recovery is logged.

The app blocks copy/cut/paste during the active assessment and logs those events. Browser APIs cannot reliably detect every operating-system window switch, screenshot, external device, virtualized environment or off-screen assistance. Do not describe browser proctoring as tamper-proof or as guaranteed full-device surveillance.

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

## Identity and proctoring readiness hardening (November 2026)

### Provisioned infrastructure

The private R2 bucket operava-ava-proctor-evidence is provisioned in APAC and bound in Pages as AVA_PROCTOR_BUCKET. It has no public r2.dev access and deletes ava-proctor/ recording objects after 30 days. Incomplete multipart uploads are aborted after one day. The separate legacy identity evidence bucket is private; the Veriff hosted flow does not write raw ID/selfie media to it. The R2 lifecycle is a technical configuration and does not replace the required privacy/legal retention approval.

### Consent, permission and capture sequence

1. Applicant completes public email OTP registration/sign-in and profile. Identity verification requires a separate explicit Veriff consent and a verified email address.
2. The backend creates the Veriff session and sends the one-time email link. The applicant opens it on a phone and completes Veriff's hosted live ID + selfie/liveness capture. The desktop stays open and polls for the signed provider decision. Only final approved + code 9001, exact legal-name match and a document type unlock identity.
3. The applicant reads the assessment rules and prohibited-conduct briefing. The server records the acknowledgment in assessment_rules_accepted_at; the begin endpoint rejects unacknowledged sessions.
4. The applicant separately consents to screen, webcam and microphone recording. Device diagnostics stop their temporary streams and never upload test media. For the assessment, webcam+microphone and the entire desktop display are captured. Full-screen mode is required before the begin request.
5. Two MediaRecorder streams (camera+audio and screen) upload private 8-second segments. Both tracks must have fresh server-stored segments before the assessment begins and before each answer can be submitted.
6. Focus loss, hidden-page, full-screen exit, capture or microphone interruption pauses the session server-side. The current unsaved answer is cleared; already submitted answers remain saved; the 45-minute timer continues. The candidate must restore all required capture streams and explicitly resume. Repeated incidents are recorded for recruiter review.
7. The candidate is told that browser monitoring cannot guarantee detection of every operating-system action, external device, screenshot or off-screen activity. It is not presented as a full device lock or tamper-proof proctoring.

Activation state: Production public email-OTP registration is enabled and the private proctor R2 bucket is bound with a 30-day lifecycle. The Veriff base URL, API key and shared secret are not currently present in Cloudflare Pages, so automatic phone identity verification is not yet available and the assessment cannot begin. Add the provider credentials, configure the Veriff Decision webhook and complete sandbox plus controlled real-device testing before treating the full journey as live. Do not send real applicants into a flow that cannot verify identity.

### Validation

Test in Veriff sandbox first: provider session creation and response HMAC; email delivery; GET scanner prefetch without token consumption; one-time POST redirect; expired/replayed token rejection; webhook HMAC rejection/acceptance; duplicate webhook deduplication; name mismatch; approved/declined/review/resubmission statuses; desktop polling; and assessment gate behavior. Then test supported desktop browsers with physical webcam/microphone, entire-display sharing, denied/revoked permissions, focus/visibility/fullscreen events, clipboard blocking, dropped keepalive recovery, 8-second R2 chunks, refresh/resume, and timer expiry. Verify Access-only reviewer retrieval, private R2 lifecycle, D1 metadata retention/deletion, privacy notice and accessible alternatives before live applicant use.

## AVA lateral assessment workspace and permission recovery (28 October 2026)

- The applicant workspace retains Bolekpad's fixed `100dvh`, compact 60px toolbar, shared Inter typography, theme toggle, and OPERAVA `#A000F0` accent. The workspace now presents one horizontal animated scene at a time, including the individual assessment question. Profile collection uses three panels; identity verification, assessment rules and capture permissions use three panels. A contained overflow fallback remains for zoom, assistive technology and small displays; the outer page does not scroll. Reduced-motion preferences remove slide movement.
- The former animated cyber-mermaid visual guide has been retired from the AVA applicant portal. It is not an identity-validation or scoring agent.
- A resumed or interrupted 30-question assessment hides the active question behind an explicit **Restore screen, camera and microphone** consent/permission action. No answer can be submitted while browser capture is unavailable, and failed R2 segment uploads stop capture rather than leaving a misleading healthy state. The server separately verifies the authenticated session, approved live identity attestation, recording consent, fresh stored media evidence and server-controlled deadline.
- The API rejects cross-origin browser requests, rate-limits repeat identity-provider link issuance, uses the saved legal profile name in the provider request, requires an approved identity to remain approved on every v2 answer, and stops accepting media uploads after expiry.
- Browser screen permissions **must be requested again after reload/revocation**; browsers do not allow persistent grants. A browser-side check and recent uploaded segments cannot cryptographically prove the webcam or screen content is genuine. Production use requires a contracted and tested certified identity verification provider, approved private R2 lifecycle/deletion controls, suitable recording transparency and alternatives, a DPIA/legal and accessibility review, and end-to-end real-device testing. This change does not declare regulatory compliance or activate external services.
- CI source contracts check the new gates and structure, alongside TypeScript and Pages build. They do not replace security penetration testing, provider callback contract tests, human reviewer access testing or an actual proctored assessment dry run.

## AVA viewport correction, white-first entry and persistent mascot (28 October 2026)

- Applicant routes `/ava-screening/` and `/applicant-portal/` intentionally open in the **light/white OPERAVA theme**, without overwriting the saved theme for other website pages. Users may still toggle modes while inside the portal.
- The vertical-scrolling inner assessment scene has been replaced by a viewport-fit lateral scene. Each card/form occupies one screen; application and document records use explicit next/previous controls. A scale-to-fit measurement reduces panel sizes when necessary. The page and dashboard do not scroll vertically in the standard app layout.
- The previously introduced mermaid side panel has been removed in favor of a full-width question-board experience. AVA's automated assessment remains subject to human hiring review and server-side integrity requirements.
- Very short viewports, large accessibility font settings and mobile keyboards can reduce available display space; inspect readability and input focus with real devices. The requested non-scrolling behavior must not justify inaccessible form controls or unreadably tiny text. If those constraints conflict in production, revise the layout with accessibility testing before release.
- OTP, certified identity requirements, evidence privacy and the server-enforced 45-minute assessment remain unchanged.

## AVA full-width question board (28 October 2026)

- Remove the mermaid widget, its right-side panel, associated styling/animations and unused SVG asset. The assessment scene now uses the entire content column; the outer workspace remains a single, viewport-fitted horizontal application.
- Present a conversational **AVA Question board**: compact header with remaining server-controlled time, answered-question progress bar, AVA instructions message, one current server-delivered question, response composer, dictation option, and **Submit & next question**. Question transitions retain horizontal motion with reduced-motion support.
- Preserve server-provided question prompts, sequential answer submission, server timer, email OTP identity requirements, recording-consent and camera/screen/microphone recovery gates. The UI does not invent live AI content or claim every prompt was generated by an available AI binding; a fallback question bank may be used.
- Keep the production default light/white theme and OPERAVA `#A000F0` styling. Recruiting review and applicant application/document routes remain unchanged.

## OPERAVA-owned identity verification (29 October 2026)

The default public identity verification no longer needs a third-party identity service or certified provider. A candidate with email-OTP session, complete profile and explicit privacy consent requests a single-use 10-minute challenge. The browser collects three **live camera photos**: a legible ID/passport/driving licence image, a neutral selfie, and a second selfie after the user turns slightly. The images are MIME/header-checked server-side, limited to 2.5 MB each and privately stored in the bound R2 bucket `operava-ava-identity-evidence`. D1 retains only challenge hashes, timestamps, reviewer notes and R2 object keys.

**Human verification is essential.** A Cloudflare Access-authenticated, signed, private recruitment reviewer must inspect all three photos, document readability/expiry, legal-name agreement and two selfie moments, and record four checkboxes and a written rationale. Only the authorized reviewer can mark an applicant `manual_verified`. This state unlocks existing consent-based assessment recording and timed questions via server-side attestation checks. Reviewer identity and decision are audit-logged. A failed review requires a fresh challenge and recapture; an applicant cannot approve their own record.

**Limitations:** This owned service is not government-certified, does not authenticate issuer records, passport NFC cryptography or physical security features, and does not offer high-assurance anti-spoof liveness or validated automated face matching. Different camera frames and a browser challenge alone cannot prove a live person or genuine ID. It must never be marketed as equivalent to a contracted KYC or formal identity-proofing standard. Reviewer uncertainty should trigger resubmission or additional lawful verification; no automated hiring or rejection is permitted.

**Privacy and operations:** Captured identity photos are restricted to the dedicated private R2 bucket and are automatically removed by a bucket lifecycle after 30 days. Reviewer access runs only through Cloudflare Access. Account deletion additionally removes all owned identity objects and their metadata. No external vision LLM or third-party ID vendor receives these photos in this owned workflow. Obtain a privacy/legal review and test camera permissions and reviewer procedures on real phones before relying on it for production hiring. R2 lifecycle expiry can make old evidence unavailable for later audits; preserve only minimal human-decision logs with approved retention.

**Runtime:** `AVA_ID_BUCKET` is bound to `operava-ava-identity-evidence`; no document images may be published as static site assets. Optional `functions/lib/avaVision.ts` and text prompts are **not wired** into identity approval and do not perform biometric decisions. The legacy signed identity callback remains for backward compatibility but is no longer invoked by the owned applicant path.

## Camera activation and browser permission recovery (29 October 2026)

**Root cause:** `public/_headers` previously applied `Permissions-Policy: camera=()` globally and on `/ava-screening/*`, while `/applicant-portal/*` inherited the global denial. Even a successful `getUserMedia` implementation cannot access a camera when the browser enforces this header.

**Correction:** Maintain `camera=(), microphone=()` for unrelated website pages. Because Cloudflare Pages combines matching `_headers` rules, each AVA-specific route first declares `! Permissions-Policy` to remove the inherited global denial, then sets `camera=(self), microphone=(self)`. Without this detach, the browser may receive conflicting `camera=()` and `camera=(self)` directives and still block capture. Cover `/ava-screening` and `/applicant-portal` (including slash/subpaths); retain no-store, no-index and no-referrer. Browser permission must still be granted explicitly; headers never grant access silently.

**Applicant flow:**
1. Detect HTTPS, feature-policy availability, media devices, and an optional browser `Permissions API` camera status. The Permissions API is missing/incomplete on some browsers; unknown does **not** mean denied and never bypasses browser prompts.
2. Issue the short-lived server identity challenge, then **render** the live preview and an explicit `Enable back camera` button. Do not call `getUserMedia` after awaiting a network request or before the video element exists.
3. On direct user gesture, request the rear camera for the ID (with a fallback video constraint on older browsers). Require a **live, enabled, unmuted track**, successful muted/inline `video.play()`, and a decoded frame before displaying `Camera is active` and enabling `Capture ID & next`.
4. Capture the JPEG in memory, close the rear camera, then request the front camera through a **second user gesture** for selfie. After the first selfie, leave the front stream active for the turned selfie. Each capture advances only after the actual JPEG is produced.
5. On permission denial, busy camera, missing device, playback failure, device disconnect, or unsupported environment: show actionable guidance, allow a retry, and prevent advancing or submitting without all three images. Stop tracks and discard pending permission requests on cancel, logout or unmount.
6. Identity evidence upload is unchanged: the backend validates the challenge and private photos and requires human approval before assessment/proctoring begins. Browser permission state alone never approves identity.

**Browser support:** use a recent HTTPS version of Safari, Chrome, Edge or Firefox. If access is denied, enable Camera via browser site permissions and operating-system privacy permissions; restart the capture step. In-app browsers and cross-origin iframes may refuse capture despite a correct site configuration. Do not attempt to automatically change browser permissions or update installed browsers: the browser and OS own these user-controlled settings.

**Validation:** CI includes a focused camera/permissions contract test, TypeScript and Vite build. Confirm actual response headers, desktop/mobile Safari and Chrome camera permissions, denial/retry, in-app browsing, switching rear/front cameras, and the complete reviewer approval flow on real devices before asserting full end-to-end operation. Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia .

## Media capture interoperability repair (29 October 2026)

**ID and selfie:** In browsers where live `getUserMedia` playback fails or an in-app browser cannot open its preview, AVA now offers an explicit native `<input type="file" accept="image/*" capture="environment|user">` fallback for the ID and two selfie steps. The browser/device may offer the photo library instead of camera, and uploaded photos are **not proof of live identity**. The client decodes and converts device photos to bounded JPEG, then submits the same one-time challenge and three separate images to private R2. The backend records `captureMethod` in restricted object metadata so a human reviewer can distinguish live preview from camera-picker evidence. Review/consent and backend verification are unchanged.

**Proctored assessment:** A direct user gesture now grants webcam and microphone first; a second gesture invokes `getDisplayMedia` to share the **entire screen**, as required by the existing integrity policy. This separation avoids losing a granted webcam permission when a separate screen picker fails. The UI checks whether HTTPS, browser media devices, `MediaRecorder` and the optional Permissions Policy APIs are supported, and shows targeted guidance instead of a generic failed button. The recorder selects an appropriate MIME type for screen (usually video-only) versus camera/microphone; it uses timesliced private uploads and an explicit `requestData` watchdog when an engine delays chunks. Both saved recording kinds are still required before beginning or answering an assessment. Camera permission and screen sharing never occur silently.

**Browser limitations:** Browser APIs are the correct capture SDK here; a third-party JavaScript library cannot override browser or OS permission denials or add full-screen capture to an engine that does not implement `getDisplayMedia`. If a phone browser lacks full-screen share support, complete the ID verification on the phone and continue the proctored assessment in a compatible HTTPS desktop browser, using the same applicant account. Never replace full-screen capture with a webcam-only or fake success state.

**Release checks:** Validate actual media permissions on at least Chrome/Edge desktop, Safari desktop, and a smartphone for native camera fallback, plus R2 upload and recruiter approval. Automated tests validate recording capability rules, consent gating, per-track codec selection, browser failures, and fallback media metadata, but cannot grant physical camera/screen permissions in CI.
