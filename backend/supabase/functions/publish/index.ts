import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow } from '../_shared/submissions.ts'
import { assertTransition } from '../_shared/statusTransitions.ts'
import { recordHistory } from '../_shared/history.ts'
import { notifyUser } from '../_shared/notifications.ts'

type RequestBody = { submissionId: string }

Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`publish:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        const submission = await loadSubmissionOrThrow(body.submissionId)
        assertTransition(submission.status, 'PUBLISHED')

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({ status: 'PUBLISHED', published_at: new Date().toISOString() })
            .eq('id', submission.id)
        if (error) throw new Error(error.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: 'Published',
            previousStatus: submission.status,
            newStatus: 'PUBLISHED',
        })

        await notifyUser(
            submission.author_id,
            submission.id,
            'published',
            `Published — ${submission.submission_code}`,
            'Your paper has been published and is now live in the public archive.',
        )

        return jsonResponse({ status: 'PUBLISHED' })
    } catch (error) {
        return errorResponse(error)
    }
})
