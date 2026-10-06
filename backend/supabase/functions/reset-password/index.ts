import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type RequestBody = { token?: string; password?: string }

async function sha256Hex(input: string): Promise<string> {
    const bytes = new TextEncoder().encode(input)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * Public, anonymous-callable -- the caller only has what was in the
 * emailed link, no session. The token is single-use (used_at set the
 * moment it's consumed) and time-limited (checked against expires_at),
 * both enforced here server-side against the row inserted by
 * request-password-reset.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const body = (await req.json().catch(() => ({}))) as RequestBody
        const token = body.token?.trim()
        const password = body.password ?? ''

        if (!token) throw new HttpError(400, 'Missing or invalid reset link.')
        if (password.length < 8) {
            throw new HttpError(400, 'Password must be at least 8 characters.')
        }

        await enforceRateLimit(`reset-password:${token}`, 10, 600)

        const tokenHash = await sha256Hex(token)
        const { data: row, error } = await supabaseAdmin
            .from('password_reset_tokens')
            .select('id, user_id, expires_at, used_at')
            .eq('token_hash', tokenHash)
            .maybeSingle()

        if (error) throw new Error(error.message)
        if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
            throw new HttpError(
                400,
                'This reset link is invalid or has expired. Please request a new one.',
            )
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            row.user_id,
            { password },
        )
        if (updateError) throw new Error(updateError.message)

        await supabaseAdmin
            .from('password_reset_tokens')
            .update({ used_at: new Date().toISOString() })
            .eq('id', row.id)

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', row.user_id)
            .maybeSingle()

        if (profile?.email) {
            await EmailService.sendPasswordChangedEmail(profile.email)
        }

        return jsonResponse({ status: 'ok' })
    } catch (error) {
        return errorResponse(error)
    }
})
