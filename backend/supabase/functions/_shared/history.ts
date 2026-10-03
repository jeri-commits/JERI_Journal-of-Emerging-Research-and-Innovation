import { supabaseAdmin } from './supabaseAdmin.ts'

/** Every status-changing action records one row here -- the audit
 * trail admins can see per spec sections 12/35. Logs and swallows its
 * own errors: a history-write failure should never block the actual
 * workflow action that already succeeded. */
export async function recordHistory(params: {
    submissionId: string
    actorId: string | null
    action: string
    previousStatus?: string | null
    newStatus?: string | null
    comments?: string | null
}) {
    const { error } = await supabaseAdmin.from('submission_history').insert({
        submission_id: params.submissionId,
        actor_id: params.actorId,
        action: params.action,
        previous_status: params.previousStatus ?? null,
        new_status: params.newStatus ?? null,
        comments: params.comments ?? null,
    })
    if (error) console.error('Failed to record submission history:', error)
}
