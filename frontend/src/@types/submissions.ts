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

export type ManuscriptVersionType = 'INITIAL' | 'REVISION' | 'FINAL'

export type ReviewerDecision =
    | 'MAJOR_REVISION'
    | 'MINOR_REVISION'
    | 'REJECTED'
    | 'ACCEPTED'

export type PaperType =
    | 'Research Article'
    | 'Review Article'
    | 'Survey Article'
    | 'Short Communication'
    | 'Others'

export type Submission = {
    id: string
    submission_code: string
    author_id: string
    title: string
    abstract: string
    paper_type: PaperType | null
    submission_mode: string | null
    keywords: string[]
    category: string | null
    journal_section: string | null
    status: SubmissionStatus
    revision_count: number
    current_version_id: string | null
    reviewer_name: string | null
    reviewer_email: string | null
    reviewer_institution: string | null
    reviewer_notes: string | null
    contact_phone: string | null
    address_line1: string | null
    address_line2: string | null
    city: string | null
    state_province: string | null
    postal_code: string | null
    contact_country: string | null
    copyright_form_key: string | null
    payment_slip_key: string | null
    latest_feedback_note: string | null
    latest_feedback_at: string | null
    created_at: string
    updated_at: string
    submitted_at: string | null
    accepted_at: string | null
    rejected_at: string | null
    published_at: string | null
}

export type SubmissionAuthor = {
    id: string
    submission_id: string
    name: string
    email: string
    affiliation: string | null
    institution: string | null
    department: string | null
    country: string | null
    author_order: number
    corresponding_author: boolean
}

export type ManuscriptVersion = {
    id: string
    submission_id: string
    version_number: number
    revision_number: number
    file_name: string
    file_size: number
    mime_type: string
    r2_object_key: string
    uploaded_by: string
    uploaded_at: string
    version_type: ManuscriptVersionType
}

export type ReviewerFeedback = {
    id: string
    submission_id: string
    version_id: string
    feedback: string
    decision: ReviewerDecision
    created_by: string
    created_at: string
    attachment_key: string | null
    attachment_name: string | null
}

export type SubmissionHistoryEntry = {
    id: string
    submission_id: string
    actor_id: string | null
    action: string
    previous_status: SubmissionStatus | null
    new_status: SubmissionStatus | null
    comments: string | null
    created_at: string
}

export type NotificationRow = {
    id: string
    user_id: string
    submission_id: string | null
    type: string
    title: string
    message: string
    is_read: boolean
    created_at: string
}

export type SubmissionDetail = Submission & {
    submission_authors: SubmissionAuthor[]
    manuscript_versions: ManuscriptVersion[]
    reviewer_feedback: ReviewerFeedback[]
    submission_history: SubmissionHistoryEntry[]
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
    SUBMITTED: 'Submitted',
    RETURNED_FOR_CORRECTION: 'Returned for Correction',
    UNDER_REVIEW: 'Under Review',
    MAJOR_REVISION: 'Major Revision Required',
    MINOR_REVISION: 'Minor Revision Required',
    REVISED_SUBMISSION: 'Revision Submitted',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    FINAL_SUBMISSION: 'Final Version Submitted',
    RETURNED_FINAL: 'Final Version Returned',
    APPROVED_FOR_PUBLICATION: 'Approved for Publication',
    PUBLISHED: 'Published',
}
