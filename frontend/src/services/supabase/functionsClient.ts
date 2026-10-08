import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/configs/supabase.config'

/**
 * Shared Edge Function invoker. supabase-js does NOT parse the response
 * body into `data` when a function returns a non-2xx status -- `data` is
 * always null on failure, and the real `{ error: string }` body our
 * functions send back only exists on `error.context` (a raw Response).
 * Every call site that skipped this and read `data` directly was
 * silently showing the SDK's generic "Edge Function returned a non-2xx
 * status code" instead of the real, useful message (e.g. "This reset
 * link is invalid or has expired.").
 */
export async function invokeFunction<T>(
    name: string,
    body: Record<string, unknown>,
): Promise<T> {
    const { data, error } = await supabase.functions.invoke(name, { body })

    if (error) {
        let message = error.message
        if (error instanceof FunctionsHttpError) {
            try {
                const parsed = (await error.context.json()) as { error?: string }
                if (parsed?.error) message = parsed.error
            } catch {
                // response body wasn't JSON -- fall back to the generic SDK message
            }
        }
        throw new Error(message)
    }

    return data as T
}
