import { supabase } from '@/configs/supabase.config'
import type { UserRole } from '@/@types/auth'

export type ProfileRow = {
    id: string
    email: string
    role: UserRole
    full_name: string | null
}

/**
 * Reads the profile row seeded by the on_auth_user_created trigger.
 * Returns role: null if the row hasn't appeared yet (e.g. the trigger
 * hasn't committed the instant sign-in completes) so callers can treat the
 * user as "public" rather than fail outright.
 */
export async function getProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, full_name')
        .eq('id', userId)
        .maybeSingle()

    if (error || !data) {
        return { id: userId, email: '', role: null, full_name: null }
    }

    return data
}

export type FullProfile = ProfileRow & {
    institution: string | null
    department: string | null
    bio: string | null
    created_at: string
}

export type ProfileEditableFields = Pick<
    FullProfile,
    'full_name' | 'institution' | 'department' | 'bio'
>

export async function getFullProfile(userId: string): Promise<FullProfile> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, full_name, institution, department, bio, created_at')
        .eq('id', userId)
        .single()

    if (error) throw new Error(error.message)
    return data as FullProfile
}

/**
 * Updates only the display-info columns. RLS restricts this to the
 * caller's own row, and a column-level GRANT (see migration
 * 0004_profile_fields.sql) restricts it to exactly these columns -- role
 * and id can't be changed this way even if a caller tried to sneak them
 * into the payload client-side.
 */
export async function updateMyProfile(
    userId: string,
    fields: Partial<ProfileEditableFields>,
): Promise<void> {
    const { error } = await supabase.from('profiles').update(fields).eq('id', userId)
    if (error) throw new Error(error.message)
}
