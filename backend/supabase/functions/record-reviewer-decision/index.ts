import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow } from '../_shared/submissions.ts'
import { assertTransition } from '../_shared/statusTransitions.ts'
import type { SubmissionStatus } from '../_shared/statusTransitions.ts'
import { recordHistory } from '../_shared/history.ts'
import { notifyUser } from '../_shared/notifications.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type Decision = 'MAJOR_REVISION' | 'MINOR_REVISION' | 'REJECTED' | 'ACCEPTED'

type RequestBody = {
    submissionId: string
    decision: Decision
    feedback: string
}

const VALID_DECISIONS: Decision[] = [
    'MAJOR_REVISION',
    'MINOR_REVISION',
    'REJECTED',
    'ACCEPTED',
]

Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`record-reviewer-decision:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        if (!VALID_DECISIONS.includes(body.decision)) {
            throw new HttpError(400, 'Invalid reviewer decision.')
        }
        if (!body.feedback?.trim()) {
            throw new HttpError(400, 'Reviewer feedback is required.')
        }

        const submission = await loadSubmissionOrThrow(body.submissionId)
        const newStatus = body.decision as SubmissionStatus
        assertTransition(submission.status, newStatus)

        if (!submission.current_version_id) {
            throw new HttpError(409, 'This submission has no manuscript version.')
        }

        const { error: feedbackError } = await supabaseAdmin
            .from('reviewer_feedback')
            .insert({
                submission_id: submission.id,
                version_id: submission.current_version_id,
                feedback: body.feedback,
                decision: body.decision,
                created_by: user.id,
            })
        if (feedbackError) throw new Error(feedbackError.message)

        const timestampColumn =
            body.decision === 'ACCEPTED'
                ? { accepted_at: new Date().toISOString() }
                : body.decision === 'REJECTED'
                  ? { rejected_at: new Date().toISOString() }
                  : {}

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({ status: newStatus, ...timestampColumn })
            .eq('id', submission.id)
        if (error) throw new Error(error.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: `Reviewer Decision Recorded: ${body.decision}`,
            previousStatus: submission.status,
            newStatus,
            comments: body.feedback,
        })

        await notifyUser(
            submission.author_id,
            submission.id,
            'reviewer_decision',
            `Decision Recorded — ${submission.submission_code}`,
            `Reviewer decision: ${body.decision.replace('_', ' ')}.`,
        )

        const { data: authorProfile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', submission.author_id)
            .single()
        const authorEmail = authorProfile?.email

        if (authorEmail) {
            if (body.decision === 'ACCEPTED') {
                await EmailService.sendAcceptance(
                    authorEmail,
                    authorEmail,
                    submission.submission_code,
                    submission.title,
                )
            } else if (body.decision === 'REJECTED') {
                await EmailService.sendRejection(
                    authorEmail,
                    authorEmail,
                    submission.submission_code,
                    submission.title,
                    body.feedback,
                )
            } else {
                await EmailService.sendRevisionRequired(
                    authorEmail,
                    authorEmail,
                    submission.submission_code,
                    submission.title,
                    body.decision,
                    body.feedback,
                    submission.revision_count,
                )
            }
        }

        return jsonResponse({ status: newStatus })
    } catch (error) {
        return errorResponse(error)
    }
})
