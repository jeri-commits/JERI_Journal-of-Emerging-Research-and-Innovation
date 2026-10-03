import { supabaseAdmin } from './supabaseAdmin.ts'
import { HttpError } from './errors.ts'

export type AuthedUser = {
    id: string
    email: string | null
    role: 'admin' | 'author' | null
}

/**
 * Verifies the caller's Supabase session server-side and loads their
 * *real* role from the profiles table -- never trusts a role the
 * frontend might claim. Every function that touches a submission calls
 * this first.
 */
export async function requireUser(req: Request): Promise<AuthedUser> {
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) throw new HttpError(401, 'Missing authorization token.')

    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
        throw new HttpError(401, 'Your session is invalid or has expired.')
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, email')
        .eq('id', data.user.id)
        .single()

    if (profileError || !profile) {
        throw new HttpError(403, 'No profile found for this account.')
    }

    return { id: data.user.id, email: profile.email, role: profile.role }
}

/** Same as requireUser, but returns null instead of throwing when
 * there's no/invalid token -- for endpoints the public may legitimately
 * call anonymously (e.g. downloading a published paper), where a signed-
 * in caller still gets extra permissions (owner/admin) over an anon one. */
export async function tryGetUser(req: Request): Promise<AuthedUser | null> {
    try {
        return await requireUser(req)
    } catch {
        return null
    }
}

export function requireAdmin(user: AuthedUser) {
    if (user.role !== 'admin') {
        throw new HttpError(403, 'Only administrators can perform this action.')
    }
}

export function requireAuthor(user: AuthedUser) {
    if (user.role !== 'author') {
        throw new HttpError(403, 'Only authors can perform this action.')
    }
}
