import { sendMail } from './mailer.ts'

const APP_URL = Deno.env.get('PUBLIC_APP_URL') ?? 'http://localhost:5173'
const BRAND = '#0d74ce'
const INK = '#0f172a'

function submissionLink(submissionId: string): string {
    return `${APP_URL}/author/submissions/${submissionId}`
}

/** One shared branded shell -- every template below just supplies the
 * heading + body paragraphs, so the JERI look stays consistent and only
 * lives in one place. Uses a real embedded logo (base64, not a hosted
 * URL) so the mark renders in the recipient's inbox even before this
 * app has a public domain -- a `src="${APP_URL}/..."` pointing at
 * localhost would just show a broken image icon in a real mail client. */
/** Collapses the template literal's indentation/newlines before it goes
 * to the mailer. Without this, lines in the multi-line HTML can end in
 * trailing whitespace, which quoted-printable encodes as a literal
 * "=20" -- some clients (seen in Gmail) then fail to decode that back
 * into a space and show the raw escape sequence in the rendered email. */
function minifyHtml(html: string): string {
    return html
        .split('\n')
        .map((line) => line.trim())
        .join('')
}

function layout(heading: string, bodyHtml: string, preheader = ''): string {
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JERI</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef2f6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f6;padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(15,23,42,0.06);">
          <tr><td style="background-color:#ffffff;padding:24px 32px;border-bottom:1px solid #e2e8f0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="56" valign="middle">
                  <img src="cid:jeri-logo" width="48" alt="JERI" style="display:block;height:auto;max-width:48px;" />
                </td>
                <td valign="middle" style="padding-left:14px;">
                  <div style="color:${INK};font-size:15px;font-weight:700;line-height:1.3;">Journal of Emerging Research and Innovation (JERI)</div>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="height:3px;background-color:${BRAND};line-height:0;font-size:0;">&nbsp;</td></tr>
          <tr><td style="padding:36px 32px;">
            <h1 style="font-size:19px;color:${INK};margin:0 0 18px;font-weight:700;">${heading}</h1>
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:18px 32px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <div style="font-size:11px;color:#94a3b8;line-height:1.6;">
              © ${new Date().getFullYear()} Journal of Emerging Research and Innovation (JERI)<br/>
              Sir Padampat Singhania University, Udaipur, Rajasthan, India
            </div>
          </td></tr>
        </table>
        <div style="padding-top:16px;font-size:11px;color:#94a3b8;">
          This is an automated message. Please do not reply directly to this email.
        </div>
      </td></tr>
    </table>
  </body>
</html>`
    return minifyHtml(html)
}

function p(text: string): string {
    return `<p style="font-size:14px;color:#475569;line-height:1.65;margin:0 0 16px;">${text}</p>`
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

/** A deliberately tiny markdown subset -- **bold**, *italic*, and "- "
 * bullet lines -- matching the same three buttons the admin's feedback
 * editor offers. Not a general markdown parser; just enough to carry
 * reviewer-feedback formatting into the email the author receives. */
function renderFeedback(markdown: string): string {
    const lines = markdown.split('\n')
    const htmlLines: string[] = []
    let inList = false
    for (const rawLine of lines) {
        const line = rawLine.trim()
        if (line.startsWith('- ')) {
            if (!inList) {
                htmlLines.push('<ul style="margin:0 0 12px;padding-left:20px;">')
                inList = true
            }
            htmlLines.push(`<li style="margin-bottom:4px;">${inlineMarkdown(line.slice(2))}</li>`)
            continue
        }
        if (inList) {
            htmlLines.push('</ul>')
            inList = false
        }
        if (line) htmlLines.push(`<div>${inlineMarkdown(line)}</div>`)
    }
    if (inList) htmlLines.push('</ul>')
    return htmlLines.join('')
}

function inlineMarkdown(text: string): string {
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function metaBlock(submissionCode: string, title: string): string {
    return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid ${BRAND};border-radius:8px;padding:14px 18px;margin:0 0 18px;font-size:13px;color:#334155;line-height:1.7;">
        <strong>Submission:</strong> ${submissionCode}<br/>
        <strong>Title:</strong> ${title}
    </div>`
}

function button(url: string, label: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 8px;"><tr><td style="border-radius:8px;background-color:${BRAND};">
        <a href="${url}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
    </td></tr></table>`
}

function note(text: string): string {
    return `<p style="font-size:12.5px;color:#94a3b8;line-height:1.6;margin:20px 0 0;padding-top:16px;border-top:1px solid #f1f5f9;">${text}</p>`
}

export const EmailService = {
    /** Sent right after signup. Deliberately never includes the
     * password -- the password lives only in the user's own head and
     * Supabase's hashed record, never in an email that could sit in an
     * inbox indefinitely. */
    async sendWelcomeEmail(to: string, displayName: string) {
        const html = layout(
            'Welcome to JERI',
            p(`Dear ${displayName},`) +
                p(
                    `Your author account has been created successfully using <strong>${to}</strong>. You can now sign in with your email and password to submit manuscripts and track their review through to publication.`,
                ) +
                button(`${APP_URL}/sign-in`, 'Sign In to JERI') +
                note(
                    `For your security, we never include your password in email. If you ever need to change it, use the "Forgot password?" link on the sign-in page.`,
                ),
            'Your JERI account is ready — sign in to get started.',
        )
        await sendMail(to, 'Your JERI account has been created', html)
    },

    /** Step 1 of the self-service reset flow: a time-limited link to
     * /reset-password?token=... The token itself is only ever handled
     * server-side (generated + hashed in request-password-reset,
     * verified + consumed in reset-password) -- this email just carries
     * the one-time link. */
    async sendPasswordResetEmail(to: string, resetUrl: string, expiresInMinutes: number) {
        const html = layout(
            'Reset your password',
            p(`We received a request to reset the password for the JERI account registered to <strong>${to}</strong>.`) +
                p('Click the button below to choose a new password:') +
                button(resetUrl, 'Reset Password') +
                p(`This link will expire in ${expiresInMinutes} minutes and can only be used once.`) +
                note(
                    `If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.`,
                ),
            'Reset your JERI password — this link expires soon.',
        )
        await sendMail(to, 'Reset your JERI password', html)
    },

    /** Step 2 confirmation: sent only after the password has actually
     * been changed in Supabase Auth, never speculatively -- this is the
     * one email in the flow a user should treat as a security signal. */
    async sendPasswordChangedEmail(to: string) {
        const html = layout(
            'Your password was changed',
            p(`This is a confirmation that the password for your JERI account (<strong>${to}</strong>) was just changed.`) +
                button(`${APP_URL}/sign-in`, 'Sign In to JERI') +
                note(
                    `If you did not make this change, please contact the editorial office immediately at ${Deno.env.get('SMTP_FROM_EMAIL') ?? 'our support address'}.`,
                ),
            'Your JERI account password was just changed.',
        )
        await sendMail(to, 'Your JERI password has been changed', html)
    },

    async sendSubmissionReceived(
        to: string,
        authorName: string,
        submissionCode: string,
        title: string,
    ) {
        const html = layout(
            'Submission received',
            p(`Dear ${authorName},`) +
                p(
                    'Thank you for submitting your manuscript to JERI. Your submission has been received and is now pending initial editorial checks.',
                ) +
                metaBlock(submissionCode, title) +
                button(submissionLink(submissionCode), 'View Submission'),
        )
        await sendMail(to, `Submission Received — ${submissionCode}`, html)
    },

    async sendReturnedForCorrection(
        to: string,
        authorName: string,
        submissionCode: string,
        title: string,
        comments: string,
    ) {
        const html = layout(
            'Correction requested',
            p(`Dear ${authorName},`) +
                p(
                    'The editorial office has reviewed your submission and found the following issues that need correction before it can proceed to peer review:',
                ) +
                metaBlock(submissionCode, title) +
                p(`<strong>Editorial comments:</strong>`) +
                renderFeedback(comments) +
                button(submissionLink(submissionCode), 'View & Correct'),
        )
        await sendMail(
            to,
            `Correction Requested — ${submissionCode}`,
            html,
        )
    },

    async sendRevisionRequired(
        to: string,
        authorName: string,
        submissionCode: string,
        title: string,
        decision: 'MAJOR_REVISION' | 'MINOR_REVISION',
        feedback: string,
        revisionCount: number,
        attachmentName: string | null = null,
    ) {
        const label = decision === 'MAJOR_REVISION' ? 'Major' : 'Minor'
        const html = layout(
            `${label} revision required`,
            p(`Dear ${authorName},`) +
                p(
                    `Following peer review, the editorial office requires a ${label.toLowerCase()} revision of your manuscript (revision ${revisionCount + 1} of 3 allowed).`,
                ) +
                metaBlock(submissionCode, title) +
                p(`<strong>Reviewer feedback:</strong>`) +
                renderFeedback(feedback) +
                (attachmentName
                    ? p(`A file was attached to this feedback (<strong>${escapeHtml(attachmentName)}</strong>) — download it from the submission page.`)
                    : '') +
                button(submissionLink(submissionCode), 'Submit Revision'),
        )
        await sendMail(
            to,
            `${label} Revision Required — ${submissionCode}`,
            html,
        )
    },

    async sendAcceptance(
        to: string,
        authorName: string,
        submissionCode: string,
        title: string,
    ) {
        const html = layout(
            'Your paper has been accepted',
            p(`Dear ${authorName},`) +
                p(
                    'Congratulations — following peer review, your manuscript has been accepted for publication in JERI.',
                ) +
                metaBlock(submissionCode, title) +
                p(
                    'Please upload the final version of your manuscript, incorporating any outstanding corrections.',
                ) +
                button(submissionLink(submissionCode), 'Upload Final Version'),
        )
        await sendMail(to, `Paper Accepted — ${submissionCode}`, html)
    },

    async sendRejection(
        to: string,
        authorName: string,
        submissionCode: string,
        title: string,
        feedback: string,
    ) {
        const html = layout(
            'Decision on your submission',
            p(`Dear ${authorName},`) +
                p(
                    'After careful review, the editorial office has decided not to proceed with your manuscript.',
                ) +
                metaBlock(submissionCode, title) +
                p(`<strong>Reviewer feedback:</strong>`) +
                renderFeedback(feedback),
        )
        await sendMail(to, `Submission Decision — ${submissionCode}`, html)
    },

    async sendFinalReturned(
        to: string,
        authorName: string,
        submissionCode: string,
        title: string,
        comments: string,
    ) {
        const html = layout(
            'Final version needs changes',
            p(`Dear ${authorName},`) +
                p(
                    'The editorial office reviewed your final submission and requires changes before it can be approved for publication.',
                ) +
                metaBlock(submissionCode, title) +
                p(`<strong>Comments:</strong>`) +
                renderFeedback(comments) +
                button(submissionLink(submissionCode), 'Upload Corrected Final Version'),
        )
        await sendMail(
            to,
            `Final Version Returned — ${submissionCode}`,
            html,
        )
    },

    async sendFinalSubmissionReceived(
        adminEmails: string[],
        authorName: string,
        submissionCode: string,
        title: string,
    ) {
        const html = layout(
            'Final version submitted',
            p(
                `${authorName} has submitted the final version of an accepted manuscript.`,
            ) + metaBlock(submissionCode, title),
        )
        for (const to of adminEmails) {
            await sendMail(to, `Final Submission Received — ${submissionCode}`, html)
        }
    },

    async sendPublicationApproval(
        to: string,
        authorName: string,
        submissionCode: string,
        title: string,
    ) {
        const html = layout(
            'Approved for publication',
            p(`Dear ${authorName},`) +
                p(
                    'Your final manuscript has been approved for publication in JERI. It will appear in the public archive shortly.',
                ) +
                metaBlock(submissionCode, title),
        )
        await sendMail(
            to,
            `Approved for Publication — ${submissionCode}`,
            html,
        )
    },

    async sendReviewerAssignment(
        to: string,
        submissionCode: string,
        title: string,
        downloadUrl: string,
    ) {
        const html = layout(
            'Manuscript ready for review',
            p('Dear Reviewer,') +
                p(
                    'You have been asked to review the manuscript below on behalf of JERI\'s editorial office.',
                ) +
                metaBlock(submissionCode, title) +
                button(downloadUrl, 'Download Manuscript') +
                p(
                    'Please send your decision (Accept / Minor Revision / Major Revision / Reject) and feedback directly to the editorial office by reply email.',
                ),
        )
        await sendMail(to, `Review Request — ${submissionCode}`, html)
    },

    async notifyAdmins(adminEmails: string[], subject: string, bodyText: string) {
        const html = layout(subject, p(bodyText))
        for (const to of adminEmails) await sendMail(to, subject, html)
    },

    /** Public "Contact Us" form on the marketing site -- no account
     * involved, just forwards the visitor's message to the editorial
     * inbox with their own address set as reply-to context (shown in
     * the body, since this mailer doesn't set a Reply-To header). */
    async sendContactMessage(
        to: string,
        fromName: string,
        fromEmail: string,
        subject: string,
        message: string,
    ) {
        const html = layout(
            'New message from the public contact form',
            p(`<strong>From:</strong> ${fromName} (${fromEmail})`) +
                p(`<strong>Subject:</strong> ${subject || '(no subject)'}`) +
                p(message.replace(/\n/g, '<br/>')),
        )
        await sendMail(to, `[Contact Form] ${subject || 'New message'}`, html)
    },
}
