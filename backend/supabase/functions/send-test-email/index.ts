import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type TestEmailType = 'welcome' | 'password_reset' | 'password_changed' | 'all'

type RequestBody = { email?: string; type?: TestEmailType }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const APP_URL = Deno.env.get('PUBLIC_APP_URL') ?? 'http://localhost:5173'

async function sendOne(type: Exclude<TestEmailType, 'all'>, to: string) {
    switch (type) {
        case 'welcome':
            await EmailService.sendWelcomeEmail(to, 'Test Author')
            return
        case 'password_reset':
            await EmailService.sendPasswordResetEmail(
                to,
                `${APP_URL}/reset-password?token=this-is-a-test-token-and-will-not-work`,
                30,
            )
            return
        case 'password_changed':
            await EmailService.sendPasswordChangedEmail(to)
            return
    }
}

/**
 * Admin-only. Lets the editorial team preview/verify what each
 * transactional email actually looks like in a real inbox without
 * walking through the real signup or password-reset flow end to end.
 * Sends the exact same templates real users get -- this is a delivery
 * test, not a mockup.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)

        const body = (await req.json().catch(() => ({}))) as RequestBody
        const email = body.email?.trim()
        const type = body.type

        if (!email || !EMAIL_RE.test(email)) {
            throw new HttpError(400, 'Please enter a valid email address.')
        }
        if (!type || !['welcome', 'password_reset', 'password_changed', 'all'].includes(type)) {
            throw new HttpError(400, 'Please choose which email to send.')
        }

        await enforceRateLimit(`send-test-email:${user.id}`, 20, 600)

        if (type === 'all') {
            await sendOne('welcome', email)
            await sendOne('password_reset', email)
            await sendOne('password_changed', email)
        } else {
            await sendOne(type, email)
        }

        return jsonResponse({ status: 'sent' })
    } catch (error) {
        return errorResponse(error)
    }
})
