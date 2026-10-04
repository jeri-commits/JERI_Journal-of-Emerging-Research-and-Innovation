import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse } from '../_shared/errors.ts'
import { requireUser } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type RequestBody = { username?: string }

/**
 * Called by the frontend immediately after a successful
 * supabase.auth.signUp(). Confirms the account was created -- deliberately
 * never echoes the password back (see EmailService.sendWelcomeEmail).
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        await enforceRateLimit(`send-welcome-email:${user.id}`, 5, 600)

        const body = (await req.json().catch(() => ({}))) as RequestBody

        if (user.email) {
            await EmailService.sendWelcomeEmail(
                user.email,
                body.username?.trim() || user.email,
            )
        }

        return jsonResponse({ status: 'sent' })
    } catch (error) {
        return errorResponse(error)
    }
})
