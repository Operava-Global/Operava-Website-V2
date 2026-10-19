# Amazon SES SMTP for OPERAVA forms

All public verification-code, application, inquiry, and submission-confirmation messages are sent through **Amazon Simple Email Service (SES)** in **Sydney / ap-southeast-2**, rather than the Resend HTTP API.

## Sender and endpoint

- SMTP host: `email-smtp.ap-southeast-2.amazonaws.com`
- Port: **587**
- Encryption: **STARTTLS is required before SMTP authentication**
- Sender: `OPERAVA <noreply@operavaglobal.com>`; the sender domain must be verified for sending in the same SES region.
- Uses username/password created specifically under Amazon SES **SMTP Settings > Create SMTP credentials**. Do **not** use your AWS console password and do not commit these credentials.

## Configure Cloudflare Pages secrets

Open Cloudflare > Workers & Pages > `ax-website` > Settings > Variables and Secrets. Add in both Production and Preview as **encrypted secrets**:

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
- If SMTP credentials are missing, the API returns HTTP **503** with code `SES_SMTP_NOT_CONFIGURED`. Do not claim successful delivery or a completed email verification.
- `/api/health` exposes a boolean `sesSmtpConfigured`, not credential values.

## Before enabling in production

Test the full form workflow with an inbox you control: visit Contact, request a code, receive and enter the code, confirm a D1 submission record and both recipient/staff email, then try the same code again to ensure it cannot be reused. Repeat for service inquiry, Academy inquiry and Careers application. Check SMTP delivery logs/SES sending reputation if messages are delayed.

Security: Always store SMTP credentials as Cloudflare encrypted secrets, never as public `vars` or browser configuration.
