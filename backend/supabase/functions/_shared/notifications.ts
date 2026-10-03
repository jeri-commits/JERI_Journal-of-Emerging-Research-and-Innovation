import { supabaseAdmin } from './supabaseAdmin.ts'

export async function notifyUser(
    userId: string,
    submissionId: string | null,
    type: string,
    title: string,
    message: string,
) {
    const { error } = await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        submission_id: submissionId,
        type,
        title,
        message,
    })
    if (error) console.error('Failed to create notification:', error)
}

export async function listAdmins(): Promise<
    { id: string; email: string | null }[]
> {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('role', 'admin')

    if (error) {
        console.error('Failed to load admin profiles:', error)
        return []
    }
    return data ?? []
}

export async function notifyAllAdmins(
    submissionId: string | null,
    type: string,
    title: string,
    message: string,
) {
    const admins = await listAdmins()
    for (const admin of admins) {
        await notifyUser(admin.id, submissionId, type, title, message)
    }
}
