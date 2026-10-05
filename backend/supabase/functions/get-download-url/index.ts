import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { tryGetUser } from '../_shared/auth.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow } from '../_shared/submissions.ts'
import { signedDownloadUrl } from '../_shared/storage.ts'

type RequestBody = { versionId: string }

/**
 * Issues a short-lived signed R2 URL for one manuscript version. The
 * bucket itself is private, so this is the only way to get a real
 * download link. Callable anonymously -- the public needs to download
 * published papers without an account -- but anonymous (and any other
 * non-owner/non-admin) callers only ever get a URL for a PUBLISHED
 * submission's FINAL version. Everything else requires being the
 * owning author or an admin.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await tryGetUser(req)
        const body = (await req.json()) as RequestBody

        const { data: version, error } = await supabaseAdmin
            .from('manuscript_versions')
            .select('id, submission_id, r2_object_key, file_name, version_type')
            .eq('id', body.versionId)
            .maybeSingle()

        if (error) throw new Error(error.message)
        if (!version) throw new HttpError(404, 'Manuscript version not found.')

        const submission = await loadSubmissionOrThrow(version.submission_id)
        const isOwner = user !== null && submission.author_id === user.id
        const isAdmin = user?.role === 'admin'
        const isPublishedFinal =
            submission.status === 'PUBLISHED' && version.version_type === 'FINAL'

        if (!isOwner && !isAdmin && !isPublishedFinal) {
            throw new HttpError(
                403,
                'You are not authorized to access this manuscript.',
            )
        }

        const url = await signedDownloadUrl(version.r2_object_key)
        return jsonResponse({ url, fileName: version.file_name })
    } catch (error) {
        return errorResponse(error)
    }
})
