import { supabaseAdmin } from './supabaseAdmin.ts'
import { HttpError } from './errors.ts'
import type { SubmissionStatus } from './statusTransitions.ts'

export type SubmissionRow = {
    id: string
    submission_code: string
    author_id: string
    title: string
    status: SubmissionStatus
    revision_count: number
    current_version_id: string | null
    reviewer_name: string | null
    reviewer_email: string | null
}

export async function loadSubmissionOrThrow(
    submissionId: string,
): Promise<SubmissionRow> {
    const { data, error } = await supabaseAdmin
        .from('submissions')
        .select(
            'id, submission_code, author_id, title, status, revision_count, current_version_id, reviewer_name, reviewer_email',
        )
        .eq('id', submissionId)
        .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw new HttpError(404, 'Submission not found.')
    return data as SubmissionRow
}

export function assertOwnership(submission: SubmissionRow, userId: string) {
    if (submission.author_id !== userId) {
        throw new HttpError(
            403,
            'You are not authorized to access this submission.',
        )
    }
}

export async function nextVersionNumber(submissionId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
        .from('manuscript_versions')
        .select('version_number')
        .eq('submission_id', submissionId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) throw new Error(error.message)
    return (data?.version_number ?? 0) + 1
}

/** Decodes the base64 manuscript payload the frontend sends. */
export function decodeFileBase64(fileBase64: string): Uint8Array {
    const binary = atob(fileBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

/** Decoded byte size from a base64 string's length, without allocating --
 * for the pre-upload size check. Base64 is ~4/3 the size of the raw
 * bytes, so comparing the encoded string's length directly against a
 * byte limit would be wrong in either direction; this corrects for it. */
export function estimateBase64Bytes(base64: string): number {
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
    return Math.floor((base64.length * 3) / 4) - padding
}
