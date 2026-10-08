import { supabase } from '@/configs/supabase.config'
import { getProfile } from '@/services/supabase/profiles'
import type { User } from '@/@types/auth'

/**
 * Creates the account with Supabase Auth (it hashes and stores the
 * password itself -- this code never sees it again after this call) and
 * fires the "account created" welcome email through the project's
 * Hostinger SMTP mailbox. Email confirmation is intentionally off: the
 * account is usable immediately after signup.
 */
export async function apiSignUp(
    email: string,
    password: string,
    username?: string,
): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error || !data.user) {
        throw error ?? new Error('Unable to create your account.')
    }

    if (username?.trim()) {
        await supabase
            .from('profiles')
            .update({ full_name: username.trim() })
            .eq('id', data.user.id)
    }

    // Best-effort -- a welcome-email failure should never block account
    // creation, which has already succeeded by this point.
    try {
        await supabase.functions.invoke('send-welcome-email', {
            body: { username: username?.trim() },
        })
    } catch {
        // logged server-side either way (email_log); nothing to do here
    }

    const profile = await getProfile(data.user.id)

    return {
        userId: data.user.id,
        email: profile.email || data.user.email,
        userName: username?.trim() || null,
        role: profile.role,
        authority: profile.role ? [profile.role] : [],
    }
}

export async function apiSignIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error || !data.user) {
        throw error ?? new Error('Invalid email or password.')
    }

    const profile = await getProfile(data.user.id)

    return {
        userId: data.user.id,
        email: profile.email || data.user.email,
        role: profile.role,
        authority: profile.role ? [profile.role] : [],
    }
}

export async function apiSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        throw error
    }
}
