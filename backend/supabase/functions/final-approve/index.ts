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

type Action = 'approve' | 'return' | 'reject'

type RequestBody = {
    submissionId: string
    action: Action
    comments?: string
}

const NEXT_STATUS: Record<Action, SubmissionStatus> = {
    approve: 'APPROVED_FOR_PUBLICATION',
    return: 'RETURNED_FINAL',
    reject: 'REJECTED',
}

Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`final-approve:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        if (!['approve', 'return', 'reject'].includes(body.action)) {
            throw new HttpError(400, 'Invalid final-submission action.')
        }
        if (body.action !== 'approve' && !body.comments?.trim()) {
            throw new HttpError(
                400,
                'Comments are required when returning or rejecting a final submission.',
            )
        }

        const submission = await loadSubmissionOrThrow(body.submissionId)
        const newStatus = NEXT_STATUS[body.action]
        assertTransition(submission.status, newStatus)

        const timestampColumn =
            body.action === 'reject' ? { rejected_at: new Date().toISOString() } : {}

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({
                status: newStatus,
                ...timestampColumn,
                latest_feedback_note: body.action === 'return' ? body.comments ?? null : null,
                latest_feedback_at: body.action === 'return' ? new Date().toISOString() : null,
            })
            .eq('id', submission.id)
        if (error) throw new Error(error.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: `Final Submission ${body.action === 'approve' ? 'Approved' : body.action === 'return' ? 'Returned' : 'Rejected'}`,
            previousStatus: submission.status,
            newStatus,
            comments: body.comments ?? null,
        })

        await notifyUser(
            submission.author_id,
            submission.id,
            'final_decision',
            `Final Submission ${body.action === 'approve' ? 'Approved' : body.action === 'return' ? 'Returned' : 'Rejected'} — ${submission.submission_code}`,
            body.comments ?? 'Your final submission has been approved for publication.',
        )

        const { data: authorProfile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', submission.author_id)
            .single()
        const authorEmail = authorProfile?.email

        if (authorEmail) {
            if (body.action === 'approve') {
                await EmailService.sendPublicationApproval(
                    authorEmail,
                    authorEmail,
                    submission.submission_code,
                    submission.title,
                )
            } else if (body.action === 'return') {
                await EmailService.sendFinalReturned(
                    authorEmail,
                    authorEmail,
                    submission.submission_code,
                    submission.title,
                    body.comments!,
                )
            } else {
                await EmailService.sendRejection(
                    authorEmail,
                    authorEmail,
                    submission.submission_code,
                    submission.title,
                    body.comments!,
                )
            }
        }

        return jsonResponse({ status: newStatus })
    } catch (error) {
        return errorResponse(error)
    }
})
