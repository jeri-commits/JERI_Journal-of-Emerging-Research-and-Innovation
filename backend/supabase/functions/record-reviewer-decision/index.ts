import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import {
    loadSubmissionOrThrow,
    decodeFileBase64,
    estimateBase64Bytes,
} from '../_shared/submissions.ts'
import { assertTransition } from '../_shared/statusTransitions.ts'
import type { SubmissionStatus } from '../_shared/statusTransitions.ts'
import {
    buildFeedbackAttachmentObjectKey,
    uploadManuscript,
    validateAttachmentFile,
} from '../_shared/storage.ts'
import { recordHistory } from '../_shared/history.ts'
import { notifyUser } from '../_shared/notifications.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type Decision = 'MAJOR_REVISION' | 'MINOR_REVISION' | 'REJECTED' | 'ACCEPTED'

type RequestBody = {
    submissionId: string
    decision: Decision
    feedback: string
    // Optional file the admin attaches on behalf of the reviewer (e.g. an
    // annotated manuscript the reviewer emailed back).
    attachmentFileName?: string
    attachmentMimeType?: string
    attachmentBase64?: string
}

function snippet(text: string, max = 160): string {
    const plain = text.replace(/[*_`#>-]/g, '').replace(/\s+/g, ' ').trim()
    return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain
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

        let attachmentKey: string | null = null
        let attachmentName: string | null = null
        if (body.attachmentFileName && body.attachmentMimeType && body.attachmentBase64) {
            validateAttachmentFile(
                'Reviewer attachment',
                body.attachmentFileName,
                body.attachmentMimeType,
                estimateBase64Bytes(body.attachmentBase64),
            )
            attachmentKey = buildFeedbackAttachmentObjectKey(
                submission.submission_code,
                body.attachmentFileName,
            )
            attachmentName = body.attachmentFileName
            await uploadManuscript(
                attachmentKey,
                decodeFileBase64(body.attachmentBase64),
                body.attachmentMimeType,
            )
        }

        const { error: feedbackError } = await supabaseAdmin
            .from('reviewer_feedback')
            .insert({
                submission_id: submission.id,
                version_id: submission.current_version_id,
                feedback: body.feedback,
                decision: body.decision,
                created_by: user.id,
                attachment_key: attachmentKey,
                attachment_name: attachmentName,
            })
        if (feedbackError) throw new Error(feedbackError.message)

        const needsAuthorAction = body.decision === 'MAJOR_REVISION' || body.decision === 'MINOR_REVISION'
        const timestampColumn =
            body.decision === 'ACCEPTED'
                ? { accepted_at: new Date().toISOString() }
                : body.decision === 'REJECTED'
                  ? { rejected_at: new Date().toISOString() }
                  : {}

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({
                status: newStatus,
                ...timestampColumn,
                latest_feedback_note: needsAuthorAction ? body.feedback : null,
                latest_feedback_at: needsAuthorAction ? new Date().toISOString() : null,
            })
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
            `${body.decision.replace('_', ' ')}: ${snippet(body.feedback)}${attachmentName ? ` (attachment: ${attachmentName})` : ''}`,
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
                    submission.id,
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
                    attachmentName,
                    submission.id,
                )
            }
        }

        return jsonResponse({ status: newStatus })
    } catch (error) {
        return errorResponse(error)
    }
})
