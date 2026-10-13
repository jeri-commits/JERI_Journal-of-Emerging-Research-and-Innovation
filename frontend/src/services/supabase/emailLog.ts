import { supabase } from '@/configs/supabase.config'
import { invokeFunction } from './functionsClient'

export type TestEmailType =
    | 'welcome'
    | 'password_reset'
    | 'password_changed'
    | 'submission_received'
    | 'returned_for_correction'
    | 'revision_required'
    | 'revision_received'
    | 'acceptance'
    | 'rejection'
    | 'final_returned'
    | 'final_submission_received'
    | 'publication_approval'
    | 'contact_message'
    | 'all'

/** Admin-only -- sends a real copy of the chosen transactional email
 * template to the given address through the same Edge Function + SMTP
 * path real users go through. */
export async function sendTestEmail(email: string, type: TestEmailType): Promise<void> {
    await invokeFunction('send-test-email', { email, type })
}

export type EmailLogRow = {
    id: string
    to_email: string
    subject: string
    status: 'sent' | 'failed'
    error_message: string | null
    submission_id: string | null
    body_html: string | null
    created_at: string
}

/** Admin-only (RLS: "Admins can read the email log"). Page-based: pass
 * the zero-indexed page number and how many rows per page. Returns the
 * page's rows plus the total row count so the UI can render "Page X of
 * Y" / row-count controls. */
export async function listEmailLog(
    page: number,
    pageSize: number,
): Promise<{ rows: EmailLogRow[]; total: number }> {
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await supabase
        .from('email_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) throw new Error(error.message)
    return { rows: data ?? [], total: count ?? 0 }
}
