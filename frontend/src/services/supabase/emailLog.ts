import { supabase } from '@/configs/supabase.config'
import { invokeFunction } from './functionsClient'

export type TestEmailType = 'welcome' | 'password_reset' | 'password_changed' | 'all'

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
    created_at: string
}

/** Admin-only (RLS: "Admins can read the email log"). */
export async function listEmailLog(): Promise<EmailLogRow[]> {
    const { data, error } = await supabase
        .from('email_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

    if (error) throw new Error(error.message)
    return data ?? []
}
