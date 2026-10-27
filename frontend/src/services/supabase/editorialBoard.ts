import { supabase } from '@/configs/supabase.config'

export type EditorialBoardRole = 'EDITOR_IN_CHIEF' | 'ASSOCIATE_EDITOR_IN_CHIEF' | 'EDITOR'

export type EditorialBoardMember = {
    id: string
    name: string
    role: EditorialBoardRole
    position: string | null
    department: string | null
    display_order: number
    created_at: string
}

export const EDITORIAL_BOARD_ROLE_LABELS: Record<EditorialBoardRole, string> = {
    EDITOR_IN_CHIEF: 'Editor-in-Chief',
    ASSOCIATE_EDITOR_IN_CHIEF: 'Associate Editor-in-Chief',
    EDITOR: 'Editor',
}

/** Public read -- no account required (RLS: "Anyone can read editorial
 * board members"). Used by both the admin management page and the
 * public Editorial Board page. */
export async function listEditorialBoardMembers(): Promise<EditorialBoardMember[]> {
    const { data, error } = await supabase
        .from('editorial_board_members')
        .select('*')
        .order('role', { ascending: true })
        .order('display_order', { ascending: true })

    if (error) throw new Error(error.message)
    return data ?? []
}

/** Returns the inserted row so the caller can append it to local state
 * directly instead of refetching the whole list. */
export async function createEditorialBoardMember(member: {
    name: string
    role: EditorialBoardRole
    position?: string
    department?: string
    displayOrder?: number
}): Promise<EditorialBoardMember> {
    const { data, error } = await supabase
        .from('editorial_board_members')
        .insert({
            name: member.name,
            role: member.role,
            position: member.position || null,
            department: member.department || null,
            display_order: member.displayOrder ?? 0,
        })
        .select('*')
        .single()
    if (error) throw new Error(error.message)
    return data
}

/** Returns the updated row for the same reason -- so the caller can
 * patch local state instead of refetching. */
export async function updateEditorialBoardMember(
    id: string,
    member: {
        name: string
        role: EditorialBoardRole
        position?: string
        department?: string
    },
): Promise<EditorialBoardMember> {
    const { data, error } = await supabase
        .from('editorial_board_members')
        .update({
            name: member.name,
            role: member.role,
            position: member.position || null,
            department: member.department || null,
        })
        .eq('id', id)
        .select('*')
        .single()
    if (error) throw new Error(error.message)
    return data
}

export async function deleteEditorialBoardMember(id: string): Promise<void> {
    const { error } = await supabase.from('editorial_board_members').delete().eq('id', id)
    if (error) throw new Error(error.message)
}

/** Persists a drag-and-drop reorder: `orderedIds` is the full, new
 * top-to-bottom id order for one role group. Writes a fresh sequential
 * display_order (0, 1, 2, ...) to every row in that group, since a drag
 * can move an item past more than one neighbor at once -- a single
 * two-row swap isn't enough to represent that. */
export async function reorderEditorialBoardMembers(orderedIds: string[]): Promise<void> {
    const results = await Promise.all(
        orderedIds.map((id, index) =>
            supabase.from('editorial_board_members').update({ display_order: index }).eq('id', id),
        ),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) throw new Error(failed.error.message)
}
