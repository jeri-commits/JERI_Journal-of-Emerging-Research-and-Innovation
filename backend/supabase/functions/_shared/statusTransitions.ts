import { HttpError } from './errors.ts'

export const MAX_REVISIONS = 3

export type SubmissionStatus =
    | 'SUBMITTED'
    | 'RETURNED_FOR_CORRECTION'
    | 'UNDER_REVIEW'
    | 'MAJOR_REVISION'
    | 'MINOR_REVISION'
    | 'REVISED_SUBMISSION'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'FINAL_SUBMISSION'
    | 'RETURNED_FINAL'
    | 'APPROVED_FOR_PUBLICATION'
    | 'PUBLISHED'

/**
 * The single source of truth for which status transitions are legal.
 * Every mutation function imports this instead of re-deriving its own
 * notion of "is this allowed" -- one place to audit, matches the spec's
 * state machine in section 7.
 */
const VALID_TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
    SUBMITTED: ['RETURNED_FOR_CORRECTION', 'UNDER_REVIEW'],
    // The spec never defines how an author gets back into the pipeline
    // after a correction request -- treating a correction as "fixed, back
    // to square one" (re-triage from SUBMITTED) is the sensible default.
    RETURNED_FOR_CORRECTION: ['SUBMITTED'],
    UNDER_REVIEW: ['MAJOR_REVISION', 'MINOR_REVISION', 'ACCEPTED', 'REJECTED'],
    MAJOR_REVISION: ['REVISED_SUBMISSION'],
    MINOR_REVISION: ['REVISED_SUBMISSION'],
    REVISED_SUBMISSION: ['UNDER_REVIEW'],
    ACCEPTED: ['FINAL_SUBMISSION'],
    REJECTED: [],
    FINAL_SUBMISSION: ['APPROVED_FOR_PUBLICATION', 'RETURNED_FINAL', 'REJECTED'],
    RETURNED_FINAL: ['FINAL_SUBMISSION'],
    APPROVED_FOR_PUBLICATION: ['PUBLISHED'],
    PUBLISHED: [],
}

export function assertTransition(
    from: SubmissionStatus,
    to: SubmissionStatus,
) {
    const allowed = VALID_TRANSITIONS[from] ?? []
    if (!allowed.includes(to)) {
        throw new HttpError(
            409,
            `Invalid submission status transition: ${from} -> ${to}.`,
        )
    }
}

export function assertRevisionsRemaining(revisionCount: number) {
    if (revisionCount >= MAX_REVISIONS) {
        throw new HttpError(
            403,
            `Maximum revision limit reached (${MAX_REVISIONS} revisions). The editorial office must make a final decision.`,
        )
    }
}
