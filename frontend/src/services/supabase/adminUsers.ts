import { supabase } from '@/configs/supabase.config'

export type AdminUserRow = {
    id: string
    email: string
    role: 'admin' | 'author' | null
    created_at: string
}

/** Admin-only (RLS: "Admins can read all profiles"). */
export async function listAllUsers(): Promise<AdminUserRow[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
}
