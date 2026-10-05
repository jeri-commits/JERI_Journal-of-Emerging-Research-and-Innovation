import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow } from '../_shared/submissions.ts'
import { assertTransition } from '../_shared/statusTransitions.ts'
import { recordHistory } from '../_shared/history.ts'
import { notifyUser } from '../_shared/notifications.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type RequestBody = { submissionId: string; comments: string }

Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`return-for-correction:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        if (!body.comments?.trim()) {
            throw new HttpError(
                400,
                'A correction message is required so the author knows what to fix.',
            )
        }

        const submission = await loadSubmissionOrThrow(body.submissionId)
        assertTransition(submission.status, 'RETURNED_FOR_CORRECTION')

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({ status: 'RETURNED_FOR_CORRECTION' })
            .eq('id', submission.id)
        if (error) throw new Error(error.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: 'Submission Returned for Correction',
            previousStatus: submission.status,
            newStatus: 'RETURNED_FOR_CORRECTION',
            comments: body.comments,
        })

        await notifyUser(
            submission.author_id,
            submission.id,
            'returned_for_correction',
            `Correction Requested — ${submission.submission_code}`,
            body.comments,
        )

        const { data: authorProfile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', submission.author_id)
            .single()

        if (authorProfile?.email) {
            await EmailService.sendReturnedForCorrection(
                authorProfile.email,
                authorProfile.email,
                submission.submission_code,
                submission.title,
                body.comments,
            )
        }

        return jsonResponse({ status: 'RETURNED_FOR_CORRECTION' })
    } catch (error) {
        return errorResponse(error)
    }
})
