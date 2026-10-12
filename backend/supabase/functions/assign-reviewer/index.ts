import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow } from '../_shared/submissions.ts'
import { assertTransition } from '../_shared/statusTransitions.ts'
import { recordHistory } from '../_shared/history.ts'
import { notifyUser } from '../_shared/notifications.ts'

type RequestBody = { submissionId: string }

/**
 * Moves a submission into peer review. The reviewer has no account and
 * is never emailed by this app -- per spec, the admin downloads the
 * manuscript themselves (Manuscript Versions card) and sends it to
 * whichever reviewer they've lined up entirely outside this system.
 * This endpoint's only job is the status transition + notifying the
 * author, so it deliberately takes no reviewer name/email at all.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`assign-reviewer:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        if (!body.submissionId) {
            throw new HttpError(400, 'A submission is required.')
        }

        const submission = await loadSubmissionOrThrow(body.submissionId)
        assertTransition(submission.status, 'UNDER_REVIEW')

        if (!submission.current_version_id) {
            throw new HttpError(
                409,
                'This submission has no manuscript version to send for review.',
            )
        }

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({ status: 'UNDER_REVIEW' })
            .eq('id', submission.id)
        if (error) throw new Error(error.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: 'Sent for Review',
            previousStatus: submission.status,
            newStatus: 'UNDER_REVIEW',
            comments: 'The manuscript was sent out for peer review.',
        })

        await notifyUser(
            submission.author_id,
            submission.id,
            'under_review',
            `Sent for Review — ${submission.submission_code}`,
            'Your submission has been sent for peer review.',
        )

        return jsonResponse({ status: 'UNDER_REVIEW' })
    } catch (error) {
        return errorResponse(error)
    }
})
