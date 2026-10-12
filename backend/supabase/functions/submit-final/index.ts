import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAuthor } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import {
    loadSubmissionOrThrow,
    assertOwnership,
    nextVersionNumber,
    decodeFileBase64,
    estimateBase64Bytes,
} from '../_shared/submissions.ts'
import { assertTransition } from '../_shared/statusTransitions.ts'
import {
    buildObjectKey,
    uploadManuscript,
    deleteManuscript,
    validateManuscriptFile,
} from '../_shared/storage.ts'
import { recordHistory } from '../_shared/history.ts'
import { notifyAllAdmins, listAdmins } from '../_shared/notifications.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

type RequestBody = {
    submissionId: string
    title?: string
    abstract?: string
    fileName: string
    mimeType: string
    fileBase64: string
}

Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAuthor(user)
        await enforceRateLimit(`submit-final:${user.id}`, 5, 600)

        const body = (await req.json()) as RequestBody
        const submission = await loadSubmissionOrThrow(body.submissionId)
        assertOwnership(submission, user.id)

        if (submission.status !== 'ACCEPTED' && submission.status !== 'RETURNED_FINAL') {
            throw new HttpError(
                409,
                'The final version can only be submitted after your paper has been accepted (or a final version was returned for correction).',
            )
        }
        validateManuscriptFile(
            body.fileName,
            body.mimeType,
            estimateBase64Bytes(body.fileBase64),
        )

        const versionNumber = await nextVersionNumber(submission.id)
        const objectKey = buildObjectKey(
            submission.submission_code,
            versionNumber,
            body.fileName,
        )
        const bytes = decodeFileBase64(body.fileBase64)

        try {
            await uploadManuscript(objectKey, bytes, body.mimeType)
        } catch (uploadErr) {
            throw new Error(`Manuscript upload failed: ${(uploadErr as Error).message}`)
        }

        const { data: version, error: versionError } = await supabaseAdmin
            .from('manuscript_versions')
            .insert({
                submission_id: submission.id,
                version_number: versionNumber,
                revision_number: submission.revision_count,
                file_name: body.fileName,
                file_size: bytes.byteLength,
                mime_type: body.mimeType,
                r2_object_key: objectKey,
                uploaded_by: user.id,
                version_type: 'FINAL',
            })
            .select('id')
            .single()

        if (versionError || !version) {
            await deleteManuscript(objectKey)
            throw new Error(versionError?.message ?? 'Failed to record manuscript version.')
        }

        const previousStatus = submission.status
        assertTransition(previousStatus, 'FINAL_SUBMISSION')

        const { error } = await supabaseAdmin
            .from('submissions')
            .update({
                current_version_id: version.id,
                status: 'FINAL_SUBMISSION',
                latest_feedback_note: null,
                latest_feedback_at: null,
                ...(body.title?.trim() ? { title: body.title.trim() } : {}),
                ...(body.abstract?.trim() ? { abstract: body.abstract.trim() } : {}),
            })
            .eq('id', submission.id)
        if (error) throw new Error(error.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: 'Final Version Submitted',
            previousStatus,
            newStatus: 'FINAL_SUBMISSION',
        })

        await notifyAllAdmins(
            submission.id,
            'final_submitted',
            `Final Version Submitted — ${submission.submission_code}`,
            `${submission.title} final version is ready for publication approval.`,
        )

        const { data: authorProfile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', submission.author_id)
            .single()

        const admins = await listAdmins()
        await EmailService.sendFinalSubmissionReceived(
            admins.map((a) => a.email).filter((e): e is string => Boolean(e)),
            authorProfile?.email ?? 'The author',
            submission.submission_code,
            submission.title,
        )

        return jsonResponse({ status: 'FINAL_SUBMISSION' })
    } catch (error) {
        return errorResponse(error)
    }
})
