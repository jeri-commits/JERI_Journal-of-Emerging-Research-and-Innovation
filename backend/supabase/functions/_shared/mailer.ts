import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { supabaseAdmin } from './supabaseAdmin.ts'
import { JERI_LOGO_BASE64 } from './logoBase64.ts'

/**
 * Thin wrapper around Hostinger SMTP. Credentials come only from Edge
 * Function secrets (`supabase secrets set SMTP_*`) -- never hardcoded,
 * never sent to the frontend. A send failure is logged (both to
 * `email_log`, so an admin can actually look it up, and to stderr), not
 * thrown: an email outage must never roll back or block a workflow
 * action that already succeeded in the database.
 */
export async function sendMail(
    to: string,
    subject: string,
    html: string,
    submissionId: string | null = null,
): Promise<void> {
    const fromName = Deno.env.get('SMTP_FROM_NAME') ?? 'JERI Journal'
    const fromEmail = Deno.env.get('SMTP_FROM_EMAIL')

    if (!fromEmail) {
        await logEmail(to, subject, 'failed', 'SMTP_FROM_EMAIL is not configured.', submissionId, html)
        return
    }

    const client = new SMTPClient({
        connection: {
            hostname: Deno.env.get('SMTP_HOST') ?? '',
            port: Number(Deno.env.get('SMTP_PORT') ?? '465'),
            tls: true,
            auth: {
                username: Deno.env.get('SMTP_USER') ?? '',
                password: Deno.env.get('SMTP_PASSWORD') ?? '',
            },
        },
    })

    try {
        await client.send({
            from: `${fromName} <${fromEmail}>`,
            to,
            subject,
            html,
            content: 'This email requires an HTML-capable mail client.',
            // Embedded as a CID inline attachment, not a `data:` URI in the
            // HTML -- Gmail (and several other major clients) strip inline
            // base64 image sources from HTML email entirely, so a data URI
            // just renders as a broken-image icon. A CID attachment is the
            // standard, actually-reliable way to put a logo in an email.
            attachments: [
                {
                    filename: 'jeri-logo.png',
                    contentType: 'image/png',
                    contentID: 'jeri-logo',
                    encoding: 'base64',
                    content: JERI_LOGO_BASE64,
                },
            ],
        })
        await logEmail(to, subject, 'sent', null, submissionId, html)
    } catch (err) {
        console.error(`Failed to send email to ${to} ("${subject}"):`, err)
        await logEmail(to, subject, 'failed', (err as Error).message, submissionId, html)
    } finally {
        try {
            await client.close()
        } catch {
            // connection already closed/never opened -- nothing to do
        }
    }
}

async function logEmail(
    to: string,
    subject: string,
    status: 'sent' | 'failed',
    errorMessage: string | null,
    submissionId: string | null,
    bodyHtml: string,
) {
    const { error } = await supabaseAdmin.from('email_log').insert({
        to_email: to,
        subject,
        status,
        error_message: errorMessage,
        submission_id: submissionId,
        body_html: bodyHtml,
    })
    if (error) console.error('Failed to write email_log row:', error)
}
