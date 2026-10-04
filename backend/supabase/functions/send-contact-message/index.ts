import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type RequestBody = {
    fullName?: string
    email?: string
    subject?: string
    message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Public "Contact Us" form, callable anonymously -- there's no account
 * involved. Forwards the message to the editorial inbox via the same
 * Hostinger SMTP path every other notification in this project uses
 * (_shared/mailer.ts), so a submission here is a real sent email, not a
 * client-side-only success message.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const body = (await req.json().catch(() => ({}))) as RequestBody
        const fullName = body.fullName?.trim() ?? ''
        const email = body.email?.trim() ?? ''
        const subject = body.subject?.trim() ?? ''
        const message = body.message?.trim() ?? ''

        if (!fullName || !email || !message) {
            throw new HttpError(400, 'Name, email, and message are required.')
        }
        if (!EMAIL_RE.test(email)) {
            throw new HttpError(400, 'Please enter a valid email address.')
        }
        if (message.length > 5000) {
            throw new HttpError(400, 'Message is too long (5000 characters max).')
        }

        // Keyed by the submitter's own email -- anonymous callers have no
        // user id or session to key on, and this still caps how often the
        // same person can spam the form without blocking distinct visitors
        // behind a shared IP (e.g. a university network).
        await enforceRateLimit(`send-contact-message:${email.toLowerCase()}`, 5, 600)

        const inbox = Deno.env.get('CONTACT_INBOX_EMAIL') ?? Deno.env.get('SMTP_FROM_EMAIL')
        if (!inbox) throw new HttpError(500, 'Contact inbox is not configured.')

        await EmailService.sendContactMessage(inbox, fullName, email, subject, message)

        return jsonResponse({ status: 'sent' })
    } catch (error) {
        return errorResponse(error)
    }
})
