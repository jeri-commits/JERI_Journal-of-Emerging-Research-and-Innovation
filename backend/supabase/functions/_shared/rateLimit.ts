import { supabaseAdmin } from './supabaseAdmin.ts'
import { HttpError } from './errors.ts'

/**
 * Fixed-window rate limit backed by the check_rate_limit() Postgres
 * function (migration 0006), which does the check-and-increment
 * atomically in one round trip. Call this first thing in any function
 * that's expensive (file upload) or abusable (sending email to a
 * reviewer-supplied address) -- it throws a 429 the caller can show
 * directly, same as every other HttpError in this codebase.
 */
export async function enforceRateLimit(
    key: string,
    maxCount: number,
    windowSeconds: number,
) {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
        p_key: key,
        p_max_count: maxCount,
        p_window_seconds: windowSeconds,
    })

    if (error) {
        // A rate-limit infrastructure failure should never be the thing
        // that blocks a legitimate request -- log it and let the call
        // through rather than fail closed on an internal error.
        console.error('Rate limit check failed:', error)
        return
    }

    if (!data) {
        throw new HttpError(
            429,
            'Too many requests. Please wait a moment and try again.',
        )
    }
}
