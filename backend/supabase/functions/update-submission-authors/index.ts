import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAuthor } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { loadSubmissionOrThrow, assertOwnership } from '../_shared/submissions.ts'
import { recordHistory } from '../_shared/history.ts'

type CoAuthor = {
    name: string
    email: string
    department?: string
    institution?: string
    country?: string
    correspondingAuthor?: boolean
}

type RequestBody = {
    submissionId: string
    coAuthors: CoAuthor[]
}

/**
 * Lets an author add, remove, or edit the co-author list on their own
 * submission after it's already been created. Deliberately narrow: this
 * is the *only* thing an author can change post-submission outside of
 * the normal revision/final-submission flow -- title, abstract, paper
 * type, etc. never go through this endpoint.
 *
 * Blocked once a paper is PUBLISHED -- the public archive record is
 * final at that point.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAuthor(user)
        await enforceRateLimit(`update-submission-authors:${user.id}`, 20, 600)

        const body = (await req.json()) as RequestBody
        const submission = await loadSubmissionOrThrow(body.submissionId)
        assertOwnership(submission, user.id)

        if (submission.status === 'PUBLISHED') {
            throw new HttpError(409, 'Author details can no longer be changed once a paper is published.')
        }

        if (!Array.isArray(body.coAuthors) || body.coAuthors.length === 0) {
            throw new HttpError(400, 'At least one author is required.')
        }
        if (body.coAuthors.length > 6) {
            throw new HttpError(
                400,
                'A maximum of 6 authors is permitted unless approved by the Editorial Board.',
            )
        }
        for (const a of body.coAuthors) {
            if (!a.name?.trim() || !a.email?.trim() || !a.department?.trim() || !a.institution?.trim() || !a.country?.trim()) {
                throw new HttpError(400, 'Each author needs a name, email, department, institution, and country.')
            }
        }
        if (!body.coAuthors.some((a) => a.correspondingAuthor)) {
            throw new HttpError(400, 'One author must be marked as the corresponding author.')
        }

        const { error: deleteError } = await supabaseAdmin
            .from('submission_authors')
            .delete()
            .eq('submission_id', submission.id)
        if (deleteError) throw new Error(deleteError.message)

        const authorsRows = body.coAuthors.map((a, idx) => ({
            submission_id: submission.id,
            name: a.name.trim(),
            email: a.email.trim(),
            department: a.department?.trim() || null,
            institution: a.institution?.trim() || null,
            country: a.country?.trim() || null,
            author_order: idx,
            corresponding_author: Boolean(a.correspondingAuthor),
        }))
        const { error: insertError } = await supabaseAdmin
            .from('submission_authors')
            .insert(authorsRows)
        if (insertError) throw new Error(insertError.message)

        await recordHistory({
            submissionId: submission.id,
            actorId: user.id,
            action: 'Author Details Updated',
            previousStatus: submission.status,
            newStatus: submission.status,
        })

        return jsonResponse({ status: 'ok' })
    } catch (error) {
        return errorResponse(error)
    }
})
