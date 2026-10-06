import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type RequestBody = { email?: string }

const TOKEN_TTL_MINUTES = 30
const APP_URL = Deno.env.get('PUBLIC_APP_URL') ?? 'http://localhost:5173'

async function sha256Hex(input: string): Promise<string> {
    const bytes = new TextEncoder().encode(input)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * Public, anonymous-callable. Always responds the same way regardless of
 * whether the email belongs to a real account -- this is the standard
 * defense against using "forgot password" as an account-enumeration
 * oracle. The actual token + email only get generated/sent when a
 * matching profile is found.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const body = (await req.json().catch(() => ({}))) as RequestBody
        const email = body.email?.trim().toLowerCase()
        if (!email) throw new HttpError(400, 'Please enter your email address.')

        await enforceRateLimit(`request-password-reset:${email}`, 5, 600)

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .ilike('email', email)
            .maybeSingle()

        if (profile) {
            const rawToken = crypto.randomUUID() + crypto.randomUUID()
            const tokenHash = await sha256Hex(rawToken)
            const expiresAt = new Date(
                Date.now() + TOKEN_TTL_MINUTES * 60 * 1000,
            ).toISOString()

            const { error: insertError } = await supabaseAdmin
                .from('password_reset_tokens')
                .insert({ user_id: profile.id, token_hash: tokenHash, expires_at: expiresAt })

            if (insertError) throw new Error(insertError.message)

            const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`
            await EmailService.sendPasswordResetEmail(profile.email, resetUrl, TOKEN_TTL_MINUTES)
        }

        return jsonResponse({
            status: 'ok',
            message: 'If an account exists for that email, a reset link has been sent.',
        })
    } catch (error) {
        return errorResponse(error)
    }
})
