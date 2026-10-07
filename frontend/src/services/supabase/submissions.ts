import { supabase } from '@/configs/supabase.config'
import type {
    NotificationRow,
    Submission,
    SubmissionDetail,
} from '@/@types/submissions'

const SUBMISSION_COLUMNS =
    'id, submission_code, author_id, title, abstract, keywords, category, journal_section, status, revision_count, current_version_id, reviewer_name, reviewer_email, reviewer_institution, reviewer_notes, created_at, updated_at, submitted_at, accepted_at, rejected_at, published_at'

/** Every submission belonging to the signed-in author (RLS already
 * scopes this to their own rows -- no author_id filter needed, but it's
 * harmless to be explicit). */
export async function listMySubmissions(authorId: string): Promise<Submission[]> {
    const { data, error } = await supabase
        .from('submissions')
        .select(SUBMISSION_COLUMNS)
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
}

/** Admin-only in practice (RLS: owner or admin) -- every submission in
 * the system, for the editorial queue. */
export async function listAllSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
        .from('submissions')
        .select(SUBMISSION_COLUMNS)
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
}

export async function listPublishedSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
        .from('submissions')
        .select(SUBMISSION_COLUMNS)
        .eq('status', 'PUBLISHED')
        .order('published_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
}

export async function getSubmissionDetail(
    submissionId: string,
): Promise<SubmissionDetail> {
    const { data: submission, error } = await supabase
        .from('submissions')
        .select(SUBMISSION_COLUMNS)
        .eq('id', submissionId)
        .single()
    if (error) throw new Error(error.message)

    const [authors, versions, feedback, history] = await Promise.all([
        supabase
            .from('submission_authors')
            .select('*')
            .eq('submission_id', submissionId)
            .order('author_order', { ascending: true }),
        supabase
            .from('manuscript_versions')
            .select('*')
            .eq('submission_id', submissionId)
            .order('version_number', { ascending: true }),
        supabase
            .from('reviewer_feedback')
            .select('*')
            .eq('submission_id', submissionId)
            .order('created_at', { ascending: true }),
        supabase
            .from('submission_history')
            .select('*')
            .eq('submission_id', submissionId)
            .order('created_at', { ascending: true }),
    ])

    if (authors.error) throw new Error(authors.error.message)
    if (versions.error) throw new Error(versions.error.message)
    if (feedback.error) throw new Error(feedback.error.message)
    if (history.error) throw new Error(history.error.message)

    return {
        ...(submission as Submission),
        submission_authors: authors.data ?? [],
        manuscript_versions: versions.data ?? [],
        reviewer_feedback: feedback.data ?? [],
        submission_history: history.data ?? [],
    }
}

export async function listMyNotifications(
    userId: string,
): Promise<NotificationRow[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) throw new Error(error.message)
    return data ?? []
}

export async function markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

    if (error) throw new Error(error.message)
}
