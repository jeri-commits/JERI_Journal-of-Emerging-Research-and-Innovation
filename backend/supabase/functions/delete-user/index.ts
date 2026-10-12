import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'

type RequestBody = { userId: string }

/**
 * Admin-only account deletion. Deletes the Supabase Auth user, which
 * cascades to their `profiles` row (on delete cascade, migration 0001).
 * `submissions.author_id` has no cascade (migration 0002), so Postgres
 * itself blocks deleting anyone who has submitted a paper -- the
 * editorial record must stay intact, so that's surfaced as a clear
 * error rather than silently losing a submission's author.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`delete-user:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        if (!body.userId) {
            throw new HttpError(400, 'A target user is required.')
        }
        if (body.userId === user.id) {
            throw new HttpError(403, 'You cannot delete your own account.')
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(body.userId)
        if (error) {
            if (/submissions/i.test(error.message) || /foreign key/i.test(error.message)) {
                throw new HttpError(
                    409,
                    'This user has submitted manuscripts and cannot be deleted. Remove their role instead if they should lose access.',
                )
            }
            throw new Error(error.message)
        }

        return jsonResponse({ status: 'ok' })
    } catch (error) {
        return errorResponse(error)
    }
})
