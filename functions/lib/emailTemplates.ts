/**
 * OPERAVA transactional email visual contract.
 * Source of truth: email/templates/operava-otp.html, supplied by the owner.
 * The OTP design remains byte-for-byte the supplied HTML except the footer
 * link text displays www.operavaglobal.com. Do not change layout, typography,
 * color, gradient, spacing, content, or branding without explicit approval.
 * Confirmation and staff messages reuse the exact same email shell.
 */
export const otpEmailTemplate = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Your OPERAVA verification code</title>
</head>
<body style="margin:0;padding:0;background-color:#070710;color:#f6f4ff;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;color:#070710;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">Your OPERAVA verification code is ready. Never share this code.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#070710" style="background-color:#070710;">
<tr><td align="center" style="padding:48px 16px;">
<!--[if mso]><table role="presentation" width="560" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
<tr><td style="padding:0 8px 28px;text-align:center;">
<a href="https://www.operavaglobal.com/" style="color:#ffffff;text-decoration:none;font-size:25px;font-weight:700;letter-spacing:6px;">OPERAVA</a>
<p style="margin:10px 0 0;color:#aaa5bc;font-size:10px;letter-spacing:3px;">GLOBAL SOLUTIONS</p>
</td></tr>
<tr><td bgcolor="#101019" style="background-color:#101019;border:1px solid #2c253e;border-radius:20px;overflow:hidden;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="padding:40px 32px 32px;">
<p style="margin:0 0 20px;font-size:10px;font-weight:700;letter-spacing:2.5px;color:#c4afff;">EMAIL VERIFICATION</p>
<h1 style="margin:0 0 16px;font-size:30px;line-height:38px;font-weight:600;letter-spacing:-0.7px;color:#ffffff;">Your access, secured.</h1>
<p style="margin:0 0 28px;font-size:15px;line-height:25px;color:#b9b5c7;">Use the one-time code below to verify your email address and continue with OPERAVA.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td align="center" bgcolor="#211332" style="padding:25px 8px;background-color:#211332;border:1px solid #69429b;border-radius:12px;">
<p style="margin:0;font-family:'Courier New',monospace;font-size:36px;line-height:44px;font-weight:700;letter-spacing:8px;color:#eee5ff;">{{otp_code}}</p>
</td></tr></table>
<p style="margin:18px 0 0;font-size:12px;line-height:20px;color:#aaa4ba;text-align:center;">Expires in {{expiry_minutes}} minutes. Do not share this code.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="padding-top:28px;border-bottom:1px solid #2a2635;"></td></tr></table>
<p style="margin:24px 0 0;font-size:12px;line-height:21px;color:#aaa4ba;">If you didn’t request this code, you can safely ignore this email.</p>
</td></tr>
<tr><td align="center" bgcolor="#6220ad" style="padding:42px 24px 30px;background-color:#6220ad;background-image:linear-gradient(180deg,#101019 0%,#310752 24%,#850bfa 58%,#c7c5fb 100%);border-radius:0 0 19px 19px;">
<p style="margin:0 0 10px;font-size:12px;line-height:20px;font-weight:700;color:#ffffff;letter-spacing:1px;">A WORLD OF POSSIBILITIES.</p>
<p style="margin:0;font-size:11px;line-height:18px;color:#ffffff;">Philippines, Remote Globally.</p>
</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:24px 12px 0;">
<p style="margin:0;font-size:10px;line-height:18px;color:#9690a6;">© OPERAVA GLOBAL SOLUTIONS</p>
<p style="margin:8px 0 0;font-size:11px;line-height:18px;"><a href="https://www.operavaglobal.com/" style="color:#b9a4df;text-decoration:underline;">www.operavaglobal.com</a></p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body>
</html>`

function replaceRequired(source: string, needle: string, replacement: string): string {
  if (!source.includes(needle)) throw new Error('OPERAVA_EMAIL_MASTER_TEMPLATE_MISMATCH')
  return source.replace(needle, replacement)
}

/**
 * Confirmation messages follow the same 560px dark, responsive, table-based
 * design as the owner's OTP master; only the message-specific copy and
 * reference number replace the OTP-specific copy.
 * Do not modify the OTP master itself to create confirmation variants.
 */
export function mandatoryEmailShell(
  fullNamePlaceholder: string,
  bodyPlaceholder: string,
  referencePlaceholder = '{{REFERENCE_ID}}',
): string {
  let html = otpEmailTemplate
  html = replaceRequired(html, '<title>Your OPERAVA verification code</title>', '<title>Your OPERAVA submission confirmation</title>')
  html = replaceRequired(html, 'Your OPERAVA verification code is ready. Never share this code.', 'Your OPERAVA submission confirmation is ready.')
  html = replaceRequired(html, '>EMAIL VERIFICATION</p>', '>SUBMISSION CONFIRMATION</p>')
  html = replaceRequired(html, '>Your access, secured.</h1>', '>Your submission, confirmed.</h1>')
  html = replaceRequired(
    html,
    '>Use the one-time code below to verify your email address and continue with OPERAVA.</p>',
    '>Hi ' + fullNamePlaceholder + ', thank you for contacting OPERAVA. Please find your submission details below.</p>',
  )
  html = replaceRequired(html, 'font-size:36px;line-height:44px;font-weight:700;letter-spacing:8px;', 'font-size:23px;line-height:34px;font-weight:700;letter-spacing:1px;overflow-wrap:anywhere;')
  html = replaceRequired(html, '{{otp_code}}', referencePlaceholder)
  html = replaceRequired(html, 'Expires in {{expiry_minutes}} minutes. Do not share this code.', 'Please keep this reference number for future correspondence.')
  html = replaceRequired(
    html,
    '<p style="margin:24px 0 0;font-size:12px;line-height:21px;color:#aaa4ba;">If you didn’t request this code, you can safely ignore this email.</p>',
    '<div style="margin:24px 0 0;font-size:13px;line-height:22px;color:#b9b5c7;">' + bodyPlaceholder + '</div>',
  )
  return html
}

/** Kept as a compatibility export for existing integrations. */
export function buildMandatoryEmail(fullName: string, bodyHtml: string): string {
  const safeName = String(fullName || '').trim() || 'there'
  return mandatoryEmailShell(safeName, bodyHtml)
}

/** OTP body text is managed by the attached canonical OTP HTML. */
export const otpBodyTemplate = 'Use the one-time code below to verify your email address and continue with OPERAVA.'

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
  'Thank you for contacting OPERAVA and for your interest in our opportunities.<br><br>' +
  'We confirm that we have received your application. Your submitted information has been recorded. Reference number: <strong>{{REFERENCE_ID}}</strong>.<br><br>' +
  '<strong>Submitted details</strong><br>' +
  '{{DETAILS_LIST}}<br><br>' +
  'Your application will be reviewed by the appropriate team. If your qualifications match an available position or another suitable opportunity, a member of our Talent Acquisition Team may contact you through your preferred contact method.<br><br>' +
  'Please note that submitting an application does not guarantee employment or an interview. Your information may be considered for current and future opportunities within OPERAVA.'

export const applicationConfirmationTemplate = mandatoryEmailShell(
  '{{NAME}}',
  applicationBodyTemplate,
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
