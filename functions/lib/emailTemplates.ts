/**
 * OPERAVA transactional email visual contract.
 * Source of truth: email/templates/operava-otp.html, supplied by the owner
 * on 25 October 2026 with the seamless violet-to-black gradient and rounded corners.
 * The real OTP and expiry replace example literals. Confirmation emails reuse
 * the same visual shell with context-specific reference and content.
 */
export const otpEmailTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Your OPERAVA verification code</title>
  <style>
    html, body { width:100%!important; margin:0!important; padding:0!important; background:#070710; }
    table { border-spacing:0; border-collapse:collapse; }
    img { border:0; display:block; }
    a { text-decoration:none; }
    .email-card { max-width:640px; overflow:hidden; border-radius:16px; border-collapse:separate!important; }
    .hero {
      overflow:hidden;
      border-radius:16px 16px 0 0;
      background-color:#000000;
      /* Violet fades to zero at both horizontal edges and all the way to black below. */
      background-image:
        linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.10) 34%,rgba(0,0,0,.55) 67%,#000000 100%),
        linear-gradient(90deg,#000000 0%,#34104f 16%,#6b258f 39%,#6b258f 61%,#34104f 84%,#000000 100%);
    }
    .body-atmosphere { background:#000000; }
    .otp-panel { border:0; border-radius:0; background:#000000; box-shadow:none; }
    .otp-code { text-shadow:none; }
    .footer {
      border-radius:0 0 16px 16px;
      background-color:#210a3a;
      background-image:
        radial-gradient(ellipse 93% 100% at 50% 100%,rgba(200,167,255,.79) 0%,rgba(143,55,236,.75) 27%,rgba(77,21,147,.65) 59%,transparent 88%),
        linear-gradient(180deg,#0a0914 0%,#160a28 38%,#4d138f 72%,#a773ea 100%);
    }
    @media only screen and (max-width:640px) {
      .outer-pad { padding:0!important; }
      .email-card { width:100%!important; }
      .hero-height { height:250px!important; }
      .hero-wordmark { font-size:37px!important; letter-spacing:6px!important; }
      .main-pad { padding:48px 25px 36px!important; }
      .otp-pad { padding:22px 8px!important; }
      .otp-code { font-size:42px!important;letter-spacing:4px!important; }
      .eyebrow { font-size:11px!important; letter-spacing:3px!important; }
      .body-copy { font-size:14px!important;line-height:24px!important; }
    }
  </style>
  <!--[if mso]>
    <style>
      .hero { background:#000000!important; }
      .body-atmosphere { background:#000000!important; }
      .otp-panel { background:#000000!important; }
      .footer { background:#36105b!important; }
    </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#070710;color:#fff;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#070710;font-size:1px;line-height:1px;">
    Your OPERAVA one-time verification code. Valid for 10 minutes.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#070710">
    <tr><td class="outer-pad" align="center" style="padding:34px 12px 45px;">
      <table role="presentation" class="email-card" width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0915"
        style="width:100%;max-width:640px;background:#0b0915;overflow:hidden;border-radius:16px;border-collapse:separate;">

        <!-- Seamless gradient header: no upper line or hard boundary to the black body -->
        <tr><td class="hero hero-height" height="285" valign="middle" align="center" bgcolor="#000000"
          style="height:285px;text-align:center;border-radius:16px 16px 0 0;background-color:#000000;background-image:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.10) 34%,rgba(0,0,0,.55) 67%,#000000 100%),linear-gradient(90deg,#000000 0%,#34104f 16%,#6b258f 39%,#6b258f 61%,#34104f 84%,#000000 100%);">
          <span class="hero-wordmark" style="display:block;padding:0 18px;color:#ffffff;font-family:Inter,Arial,Helvetica,sans-serif;font-size:49px;line-height:1.2;letter-spacing:9px;font-weight:800;text-align:center;text-shadow:0 3px 22px rgba(60,13,111,.24);">OPERAVA</span>
        </td></tr>

        <!-- OTP information -->
        <tr><td class="body-atmosphere main-pad" align="center" bgcolor="#000000"
          style="padding:55px 62px 48px;background-color:#000000;background-image:none;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">
              <h1 class="eyebrow" style="margin:0;color:#ffffff;font-size:12px;line-height:20px;letter-spacing:4px;font-weight:700;text-transform:uppercase;">
                YOUR VERIFICATION CODE
              </h1>
            </td></tr>

            <tr><td style="padding-top:27px;">
              <table role="presentation" class="otp-panel" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000"
                style="width:100%;border:0;border-radius:0;background-color:#000000;box-shadow:none;border-collapse:separate;">
                <tr><td class="otp-pad" align="center" style="padding:30px 10px;">
                  <span class="otp-code" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:53px;line-height:1.15;font-weight:700;letter-spacing:7px;color:#fff;white-space:nowrap;">{{otp_code}}</span>
                </td></tr>
              </table>
            </td></tr>

            <tr><td align="center" style="padding-top:31px;">
              <p class="body-copy" style="margin:0;color:#f4f0fa;font-size:15px;line-height:26px;">
                Use this one-time password to securely sign in to your OPERAVA account.
              </p>
            </td></tr>
            <tr><td align="center" style="padding-top:26px;">
              <p style="margin:0;color:#bcb1d1;font-size:14px;line-height:22px;">
                This code expires in <strong style="color:#fff;">{{expiry_minutes}} minutes.</strong>
              </p>
            </td></tr>
            <tr><td align="center" style="padding-top:62px;">
              <p style="margin:0;color:#a9a1b8;font-size:13px;line-height:22px;">
                If you didn't request this code, you can safely ignore this email.<br>
                Never share it with anyone, including OPERAVA support.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Matching purple-to-lavender smoky footer -->
        <tr><td class="footer" align="center" bgcolor="#210a3a"
          style="padding:43px 18px 61px;border-radius:0 0 16px 16px;background-color:#210a3a;background-image:linear-gradient(180deg,#000000 0%,#190b30 31%,#5e1cb0 70%,#bc9af4 100%);">
          <p style="margin:0 0 11px;font-size:12px;line-height:21px;letter-spacing:2.5px;font-weight:600;">
            <a href="https://www.operavaglobal.com/" target="_blank" style="color:#fff;text-decoration:none;">www.operavaglobal.com</a>
          </p>
          <p style="margin:0;color:#ede3f7;font-size:11px;line-height:18px;">&copy; OPERAVA Global Solutions</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

function replaceRequired(source: string, needle: string, replacement: string): string {
  if (!source.includes(needle)) throw new Error('OPERAVA_EMAIL_MASTER_TEMPLATE_MISMATCH')
  return source.replace(needle, replacement)
}

/**
 * Derive confirmation variants from the exact owner-uploaded 640px HTML shell.
 * Only context text, reference number and wrapping change; styling stays intact.
 */
export function mandatoryEmailShell(
  fullNamePlaceholder: string,
  bodyPlaceholder: string,
  referencePlaceholder = '{{REFERENCE_ID}}',
): string {
  let html = otpEmailTemplate
  html = replaceRequired(html, '<title>Your OPERAVA verification code</title>', '<title>Your OPERAVA submission confirmation</title>')
  html = replaceRequired(html, 'Your OPERAVA one-time verification code. Valid for 10 minutes.', 'Your OPERAVA submission confirmation is ready.')
  html = replaceRequired(html, 'YOUR VERIFICATION CODE', 'SUBMISSION CONFIRMATION')
  html = replaceRequired(html, 'Use this one-time password to securely sign in to your OPERAVA account.',
    'Hi ' + fullNamePlaceholder + ', thank you for contacting OPERAVA. Please find your submission details below.')
  html = replaceRequired(html, '.otp-code { font-size:42px!important;letter-spacing:4px!important; }',
    '.otp-code { font-size:21px!important;letter-spacing:0!important;white-space:normal!important;overflow-wrap:anywhere; }')
  html = replaceRequired(html, 'font-size:53px;line-height:1.15;font-weight:700;letter-spacing:7px;',
    'font-size:23px;line-height:1.3;font-weight:700;letter-spacing:1px;overflow-wrap:anywhere;')
  html = replaceRequired(html, 'white-space:nowrap;">{{otp_code}}</span>',
    'white-space:normal;overflow-wrap:anywhere;">' + referencePlaceholder + '</span>')
  html = replaceRequired(html, 'This code expires in <strong style="color:#fff;">{{expiry_minutes}} minutes.</strong>',
    'Please keep this reference number for future correspondence.')
  html = replaceRequired(html,
    'If you didn\'t request this code, you can safely ignore this email.<br>\n                Never share it with anyone, including OPERAVA support.',
    bodyPlaceholder)
  return html
}

/** Compatibility export for existing integrations. */
export function buildMandatoryEmail(fullName: string, bodyHtml: string): string {
  return mandatoryEmailShell(String(fullName || '').trim() || 'there', bodyHtml)
}

export const otpBodyTemplate = 'Use this one-time code to verify your email before submitting your OPERAVA form.'

/** The layout matches the uploaded OTP design; only form-specific copy differs. */
export const formsOtpEmailTemplate = replaceRequired(
  otpEmailTemplate,
  'Use this one-time password to securely sign in to your OPERAVA account.',
  otpBodyTemplate,
)
export const careersOtpEmailTemplate = replaceRequired(
  replaceRequired(
    otpEmailTemplate,
    '<title>Your OPERAVA verification code</title>',
    '<title>Verify your OPERAVA job application</title>',
  ),
  'Use this one-time password to securely sign in to your OPERAVA account.',
  'Use this one-time code to verify your email and complete your OPERAVA job application.',
)

function careersConfirmationCopy(html: string, staff = false): string {
  let result = html
  result = replaceRequired(result, '<title>Your OPERAVA submission confirmation</title>',
    staff ? '<title>New OPERAVA job application</title>' : '<title>Your OPERAVA job application confirmation</title>')
  result = replaceRequired(result, 'Your OPERAVA submission confirmation is ready.',
    staff ? 'OPERAVA Talent Acquisition has received a new job application notification.'
      : 'Thank you for submitting your application to OPERAVA Global Solutions.')
  result = replaceRequired(result, 'SUBMISSION CONFIRMATION',
    staff ? 'NEW JOB APPLICATION' : 'APPLICATION CONFIRMATION')
  result = replaceRequired(result,
    'Hi ' + (staff ? 'Team' : '{{NAME}}') + ', thank you for contacting OPERAVA. Please find your submission details below.',
    staff
      ? 'Hello Talent Acquisition Team. A new job application has been submitted. The applicant details are below.'
      : 'Hi {{NAME}}, your application has been submitted. Please find your application details below.')
  return result
}

/** Services / contact confirmation body — DETAILS_LIST, REFERENCE_ID */
export const servicesBodyTemplate =
  'Thank you for choosing OPERAVA. We are pleased to begin working with you and look forward to supporting your business requirements.<br><br>' +
  'We received your inquiry. Your submission has been recorded. Reference number: <strong>{{REFERENCE_ID}}</strong>.<br><br>' +
  '<strong>Submitted details</strong><br>' +
  '{{DETAILS_LIST}}<br><br>' +
  'Please use your verified email address when communicating with OPERAVA regarding your account, service, request, documentation, or engagement.<br><br>' +
  'If you have questions or require assistance, please contact the appropriate OPERAVA support channel provided in your communication.'

export const servicesConfirmationTemplate = mandatoryEmailShell('{{NAME}}', servicesBodyTemplate)

/** Careers confirmation body */
export const applicationBodyTemplate =
  'Thank you for submitting your application to OPERAVA Global Solutions.<br><br>' +
  'Your job application has been received and recorded successfully after email verification. Application reference number: <strong>{{REFERENCE_ID}}</strong>.<br><br>' +
  '<strong>Application details</strong><br>' +
  '{{DETAILS_LIST}}<br><br>' +
  'Your application will be reviewed by the appropriate team. If your qualifications match an available position or another suitable opportunity, a member of our Talent Acquisition Team may contact you through your preferred contact method.<br><br>' +
  'Please note that submitting an application does not guarantee employment or an interview. Your information may be considered for current and future opportunities within OPERAVA.'

export const applicationConfirmationTemplate = careersConfirmationCopy(
  mandatoryEmailShell('{{NAME}}', applicationBodyTemplate),
)

/** Staff notification body */
export const staffBodyTemplate =
  '<strong>{{TITLE}}</strong><br><br>' +
  'Reference: <strong>{{REFERENCE_ID}}</strong><br>' +
  '{{PARTY_LABEL}} email: <strong>{{EMAIL}}</strong><br>' +
  'Submitted: {{SUBMITTED_AT}}<br><br>' +
  'Reply to this email to contact the {{PARTY_LABEL}}.<br><br>' +
  '<strong>Submission details</strong><br>' +
  '{{ROWS_HTML}}'

export const staffNotificationTemplate = mandatoryEmailShell('Team', staffBodyTemplate)

/** Careers only: application-focused Talent Acquisition notification wording. */
export const careersStaffNotificationTemplate = careersConfirmationCopy(
  mandatoryEmailShell('Team', staffBodyTemplate),
  true,
)

/** Recruitment pool pass confirmation body */
export const recruitmentPoolBodyTemplate =
  'Thank you for completing the OPERAVA Recruitment AVA assessment.<br><br>' +
  'We confirm that you have <strong>passed</strong> and are eligible for the <strong>Recruitment Pool</strong>, subject to Talent Acquisition review.<br><br>' +
  '<strong>Application number:</strong> {{APPLICATION_ID}}<br>' +
  '<strong>Full name:</strong> {{NAME}}<br>' +
  '<strong>Position:</strong> {{POSITION}}<br>' +
  '<strong>Assessment score:</strong> {{SCORE}}<br><br>' +
  'A member of our Talent Acquisition Team may contact you through your verified email if a suitable opportunity arises.<br><br>' +
  'Passing the assessment and pool eligibility do not guarantee employment or an interview.'

export const recruitmentPoolConfirmationTemplate = mandatoryEmailShell(
  '{{NAME}}',
  recruitmentPoolBodyTemplate,
  '{{APPLICATION_ID}}',
)
