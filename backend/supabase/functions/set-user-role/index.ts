import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'

type RequestBody = { userId: string; role: 'admin' | 'author' | null }

/**
 * The only way a profile's role ever changes. Admin-only, and
 * deliberately not callable by a user on themselves via any other path
 * (profiles.role isn't in the client-writable column grant from
 * migration 0004) -- no self-service escalation to admin is possible.
 *
 * An admin also can't demote themselves away from 'admin' through this
 * function, even directly (not just in the UI, where the control is
 * disabled) -- otherwise a single-admin deployment could accidentally
 * lock itself out with no one left who can undo it.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`set-user-role:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        if (!['admin', 'author', null].includes(body.role)) {
            throw new HttpError(400, 'Role must be admin, author, or null.')
        }
        if (!body.userId) {
            throw new HttpError(400, 'A target user is required.')
        }
        if (body.userId === user.id && body.role !== 'admin') {
            throw new HttpError(
                403,
                'You cannot remove your own admin role. Ask another admin to do it.',
            )
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role: body.role })
            .eq('id', body.userId)

        if (error) throw new Error(error.message)

        return jsonResponse({ status: 'ok', role: body.role })
    } catch (error) {
        return errorResponse(error)
    }
})
