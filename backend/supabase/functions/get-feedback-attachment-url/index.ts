import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser } from '../_shared/auth.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow } from '../_shared/submissions.ts'
import { signedDownloadUrl } from '../_shared/storage.ts'

type RequestBody = { feedbackId: string }

/**
 * Issues a short-lived signed R2 URL for a file an admin attached to a
 * reviewer decision (e.g. an annotated manuscript). Owner author or
 * admin only -- unlike get-download-url there is no public case, since
 * reviewer feedback is never shown outside the submission's own owner.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        const body = (await req.json()) as RequestBody

        const { data: feedback, error } = await supabaseAdmin
            .from('reviewer_feedback')
            .select('id, submission_id, attachment_key, attachment_name')
            .eq('id', body.feedbackId)
            .maybeSingle()

        if (error) throw new Error(error.message)
        if (!feedback) throw new HttpError(404, 'Feedback entry not found.')
        if (!feedback.attachment_key) {
            throw new HttpError(404, 'This feedback entry has no attachment.')
        }

        const submission = await loadSubmissionOrThrow(feedback.submission_id)
        const isOwner = submission.author_id === user.id
        const isAdmin = user.role === 'admin'
        if (!isOwner && !isAdmin) {
            throw new HttpError(403, 'You are not authorized to access this attachment.')
        }

        const url = await signedDownloadUrl(feedback.attachment_key)
        return jsonResponse({ url, fileName: feedback.attachment_name })
    } catch (error) {
        return errorResponse(error)
    }
})
