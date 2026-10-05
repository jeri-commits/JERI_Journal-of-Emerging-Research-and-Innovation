import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow } from '../_shared/submissions.ts'
import { assertTransition } from '../_shared/statusTransitions.ts'
import { recordHistory } from '../_shared/history.ts'
import { notifyUser } from '../_shared/notifications.ts'
import { signedDownloadUrl } from '../_shared/storage.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type RequestBody = {
    submissionId: string
    reviewerName: string
    reviewerEmail: string
    reviewerInstitution?: string
    reviewerNotes?: string
}

Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)
        await enforceRateLimit(`assign-reviewer:${user.id}`, 30, 3600)

        const body = (await req.json()) as RequestBody
        if (!body.reviewerName?.trim() || !body.reviewerEmail?.trim()) {
            throw new HttpError(400, 'Reviewer name and email are required.')
        }

        const submission = await loadSubmissionOrThrow(body.submissionId)
        assertTransition(submission.status, 'UNDER_REVIEW')

        if (!submission.current_version_id) {
            throw new HttpError(
                409,
                'This submission has no manuscript version to send for review.',
            )
        }

        const { data: version, error: versionError } = await supabaseAdmin
            .from('manuscript_versions')
            .select('r2_object_key')
            .eq('id', submission.current_version_id)
            .single()
        if (versionError || !version) {
            throw new Error(versionError?.message ?? 'Manuscript version not found.')
        }

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({
                status: 'UNDER_REVIEW',
                reviewer_name: body.reviewerName,
                reviewer_email: body.reviewerEmail,
                reviewer_institution: body.reviewerInstitution ?? null,
                reviewer_notes: body.reviewerNotes ?? null,
            })
            .eq('id', submission.id)
        if (error) throw new Error(error.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: 'Reviewer Assigned',
            previousStatus: submission.status,
            newStatus: 'UNDER_REVIEW',
            comments: `Assigned to ${body.reviewerName} <${body.reviewerEmail}>`,
        })

        await notifyUser(
            submission.author_id,
            submission.id,
            'under_review',
            `Sent for Review — ${submission.submission_code}`,
            'Your submission has been sent to a reviewer and is now under review.',
        )

        const downloadUrl = await signedDownloadUrl(version.r2_object_key)
        await EmailService.sendReviewerAssignment(
            body.reviewerEmail,
            submission.submission_code,
            submission.title,
            downloadUrl,
        )

        return jsonResponse({ status: 'UNDER_REVIEW' })
    } catch (error) {
        return errorResponse(error)
    }
})
