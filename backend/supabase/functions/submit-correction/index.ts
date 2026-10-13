import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse } from '../_shared/errors.ts'
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
    keywords?: string[]
    category?: string
    journalSection?: string
    // A replacement manuscript file -- optional, since some corrections
    // (e.g. "affiliation is incomplete") don't require a new file.
    fileName?: string
    mimeType?: string
    fileBase64?: string
}

/**
 * Lets an author fix and resubmit a RETURNED_FOR_CORRECTION submission.
 * The spec's own state machine never defines this path (see
 * backend/README.md); re-entering at SUBMITTED for a fresh editorial
 * triage is the sensible default. This does NOT count against the
 * 3-revision cap -- that's for post-review revisions, not pre-review
 * corrections.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAuthor(user)
        await enforceRateLimit(`submit-correction:${user.id}`, 5, 600)

        const body = (await req.json()) as RequestBody
        const submission = await loadSubmissionOrThrow(body.submissionId)
        assertOwnership(submission, user.id)
        assertTransition(submission.status, 'SUBMITTED')

        const updates: Record<string, unknown> = {
            status: 'SUBMITTED',
            latest_feedback_note: null,
            latest_feedback_at: null,
        }
        if (body.title?.trim()) updates.title = body.title.trim()
        if (body.abstract?.trim()) updates.abstract = body.abstract.trim()
        if (body.keywords) updates.keywords = body.keywords
        if (body.category !== undefined) updates.category = body.category
        if (body.journalSection !== undefined) updates.journal_section = body.journalSection

        let uploadedObjectKey: string | null = null

        if (body.fileName && body.mimeType && body.fileBase64) {
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
            uploadedObjectKey = objectKey

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
                    version_type: 'REVISION',
                })
                .select('id')
                .single()

            if (versionError || !version) {
                await deleteManuscript(objectKey)
                throw new Error(versionError?.message ?? 'Failed to record manuscript version.')
            }
            updates.current_version_id = version.id
        }

        const { error } = await supabaseAdmin
            .from('submissions')
            .update(updates)
            .eq('id', submission.id)

        if (error) {
            if (uploadedObjectKey) await deleteManuscript(uploadedObjectKey)
            throw new Error(error.message)
        }

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: 'Correction Resubmitted',
            previousStatus: submission.status,
            newStatus: 'SUBMITTED',
        })

        await notifyAllAdmins(
            submission.id,
            'correction_resubmitted',
            `Correction Resubmitted — ${submission.submission_code}`,
            `Author resubmitted ${submission.title} after a correction request.`,
        )

        const admins = await listAdmins()
        await EmailService.notifyAdmins(
            admins.map((a) => a.email).filter((e): e is string => Boolean(e)),
            `Correction Resubmitted — ${submission.submission_code}`,
            `${submission.title} has been corrected and resubmitted for initial editorial triage.`,
            submission.id,
        )

        return jsonResponse({ status: 'SUBMITTED' })
    } catch (error) {
        return errorResponse(error)
    }
})
