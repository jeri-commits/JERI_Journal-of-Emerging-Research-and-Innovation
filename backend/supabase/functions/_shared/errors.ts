import { corsHeaders } from './cors.ts'

/** Carries a real HTTP status + a message meant to be shown to the user
 *  verbatim (per the "no generic 'something went wrong'" requirement) --
 *  anything that isn't an HttpError is treated as an unexpected bug and
 *  logged server-side instead of leaked to the client. */
export class HttpError extends Error {
    status: number
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

export function errorResponse(error: unknown): Response {
    if (error instanceof HttpError) {
        return jsonResponse({ error: error.message }, error.status)
    }
    console.error('Unexpected error:', error)
    return jsonResponse(
        { error: 'Unexpected server error. Please try again.' },
        500,
    )
}
