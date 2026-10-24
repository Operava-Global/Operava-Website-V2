# Amazon SES SMTP for OPERAVA forms

All public verification-code, application, inquiry, and submission-confirmation messages are sent through **Amazon Simple Email Service (SES)** in **Sydney / ap-southeast-2**, rather than the Resend HTTP API.

## Sender and endpoint

- SMTP host: `email-smtp.ap-southeast-2.amazonaws.com`
- Port: **587**
- Encryption: **STARTTLS is required before SMTP authentication**
- Sender: `OPERAVA <noreply@operavaglobal.com>`; the sender domain must be verified for sending in the same SES region.
- Uses username/password created specifically under Amazon SES **SMTP Settings > Create SMTP credentials**. Do **not** use your AWS console password and do not commit these credentials.

## Configure Cloudflare Pages secrets

Open Cloudflare > Workers & Pages > `operava-website-v2` (in **Jelvan - Business - Operava**) > Settings > Variables and Secrets. These are already configured in **Production** as encrypted secrets; configure Preview independently only if preview email sending is intentionally needed:

- `SES_SMTP_USERNAME`: SES SMTP username generated in `ap-southeast-2`
- `SES_SMTP_PASSWORD`: its matching SES SMTP password
- `OTP_SECRET`: a long, random code-signing secret (already provisioned for this project during the migration; **do not overwrite** unless rotating, since doing so invalidates pending verification sessions)

Optional plain-text variable `SES_EMAIL_FROM` defaults to `OPERAVA <noreply@operavaglobal.com>`.

Cloudflare Pages deploys these functions from the `functions/` directory. Trigger a new production deployment after setting secrets. No secrets should appear in any GitHub file, build log, email, or frontend JavaScript.

## Form behavior

- A user's email must receive a six-digit code and successfully verify before the submission is acknowledged.
- Code expiry: 10 minutes; server-side D1 one-use protection and resend limits remain active.
- `cf-turnstile-response`, captcha tokens, and internal secrets are excluded from submitted details and confirmation emails.
- Customer confirmation and internal staff notifications use the same purple OPERAVA email templates.
- Contact, Services/Quote, Academy and Careers accept at most **one optional** `.pdf`, `.doc`, `.docx` or `.txt` attachment, **strictly less than 5,000,000 bytes** (5 MB). Resume OR portfolio link is required for Careers.
- The original file remains in the browser while the user receives their six-digit email code. On successful OTP entry, the browser sends the original bytes in multipart form to `/api/forms/verify`; the Worker checks extension, signature/UTF-8, size and SHA-256 against attachment metadata bound to the signed draft. Changed or missing documents fail **before** the one-use code is consumed.
- The original document is attached **only to the staff notification** in a MIME `multipart/mixed` email through SES SMTP; applicants/customers receive their normal reference-ID confirmation **without** the file. Email receipt is not independently proven by SES SMTP acceptance.
- The attachment bytes are **not put in R2, D1 or MEGA**, and the optional Careers resume parsing endpoint no longer persists the document or extracted text. Only bounded filename/size/hash metadata may be recorded with the submission.
- Optional Careers resume autofill is best-effort and never a prerequisite for sending a valid file. Browser-native spellcheck/autocorrect is enabled for appropriate free-text inputs and disabled for email/phone.
- If the staff email fails, the verified submission remains recorded and the site shows an explicit attachment-delivery warning and reference ID. The one-time file bytes are **not retrievable** after the request; the user must contact the staff mailbox to resend it. Do not silently claim staff receipt.

- If SMTP credentials are missing, the API returns HTTP **503** with code `SES_SMTP_NOT_CONFIGURED`. Do not claim successful delivery or a completed email verification.
- `/api/health` exposes a boolean `sesSmtpConfigured`, not credential values.

## Before enabling in production

Test the full form workflow with an inbox you control: visit Contact, request a code, receive and enter the code, confirm a D1 submission record and both recipient/staff email, then try the same code again to ensure it cannot be reused. Repeat for service inquiry, Academy inquiry and Careers application. Check SMTP delivery logs/SES sending reputation if messages are delayed.

Security: Always store SMTP credentials as Cloudflare encrypted secrets, never as public `vars` or browser configuration.

## Current production state (25 October 2026)
Production has encrypted SES SMTP username/password and OTP secret, the D1 `SUBMISSIONS_DB` binding, and Cloudflare Pages Functions. `/api/health` reports `sesSmtpConfigured: true`, which verifies secret presence, **not successful email delivery**. The full authorized-inbox verification and staff-email delivery test remains necessary before treating the email flow as end-to-end validated.

## Attachment regression tests (required before production)

1. Submit each allowed type under 5,000,000 bytes and verify the MIME attachment actually arrives in the authorized staff inbox after OTP, while the user's confirmation contains no attachment.
2. Reject exactly 5,000,000 bytes and larger, empty files, unsupported extensions, mismatched file signatures, and two attached files. Confirm the API does not write the document to R2 or D1.
3. Confirm a document can be replaced only by returning to the form and generating a **new** signed OTP draft; a changed name, size, or SHA-256 must fail without consuming the valid code.
4. Verify the Academy, Contact, Services/Quote, and Careers flows with real controlled inboxes. Verify a malformed/replayed code cannot send an attachment.
5. Simulate staff SES failure and ensure a truthful visible warning is shown, with no false delivery claim.
