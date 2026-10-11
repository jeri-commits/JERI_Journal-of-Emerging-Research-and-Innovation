import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import SubmissionTimeline from '@/components/shared/SubmissionTimeline'
import ManuscriptVersionList from '@/components/shared/ManuscriptVersionList'
import { getSubmissionDetail } from '@/services/supabase/submissions'
import { supabase } from '@/configs/supabase.config'
import {
    returnForCorrection,
    assignReviewer,
    recordReviewerDecision,
    finalApprove,
    publishSubmission,
} from '@/services/supabase/workflow'
import type { ReviewerDecision, SubmissionDetail } from '@/@types/submissions'

const AdminSubmissionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
    const [authorEmail, setAuthorEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const [correctionComments, setCorrectionComments] = useState('')
    const [reviewerName, setReviewerName] = useState('')
    const [reviewerEmail, setReviewerEmail] = useState('')
    const [reviewerInstitution, setReviewerInstitution] = useState('')
    const [decision, setDecision] = useState<ReviewerDecision>('MINOR_REVISION')
    const [decisionFeedback, setDecisionFeedback] = useState('')
    const [finalComments, setFinalComments] = useState('')

    const load = () => {
        if (!id) return
        setLoading(true)
        getSubmissionDetail(id)
            .then(async (detail) => {
                setSubmission(detail)
                const { data } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('id', detail.author_id)
                    .single()
                setAuthorEmail(data?.email ?? '')
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(load, [id])

    const runAction = async (fn: () => Promise<unknown>) => {
        setBusy(true)
        setError('')
        try {
            await fn()
            load()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setBusy(false)
        }
    }

    if (loading) return <div className="p-6">Loading…</div>
    if (error && !submission) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Alert showIcon type="danger">{error}</Alert>
            </div>
        )
    }
    if (!submission) return null

    const { status } = submission

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 font-sans">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/submissions')}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to all submissions
            </Button>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-text-link">{submission.submission_code}</p>
                    <h1 className="text-2xl font-bold text-ink">{submission.title}</h1>
                    <p className="text-sm text-body">Author: {authorEmail || submission.author_id}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {error && <Alert showIcon type="danger">{error}</Alert>}

            {status === 'SUBMITTED' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Return for Correction</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <textarea
                                rows={3}
                                className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                                placeholder="Describe what the author needs to fix…"
                                value={correctionComments}
                                onChange={(e) => setCorrectionComments(e.target.value)}
                            />
                            <Button
                                variant="outline"
                                disabled={busy || !correctionComments.trim()}
                                onClick={() => runAction(() => returnForCorrection(submission.id, correctionComments))}
                            >
                                Return for Correction
                            </Button>
                        </CardContent>
                    </Card>
                    <ReviewerAssignmentCard
                        busy={busy}
                        reviewerName={reviewerName}
                        reviewerEmail={reviewerEmail}
                        reviewerInstitution={reviewerInstitution}
                        setReviewerName={setReviewerName}
                        setReviewerEmail={setReviewerEmail}
                        setReviewerInstitution={setReviewerInstitution}
                        onAssign={() =>
                            runAction(() =>
                                assignReviewer({
                                    submissionId: submission.id,
                                    reviewerName,
                                    reviewerEmail,
                                    reviewerInstitution,
                                }),
                            )
                        }
                    />
                </div>
            )}

            {status === 'REVISED_SUBMISSION' && (
                <ReviewerAssignmentCard
                    busy={busy}
                    reviewerName={reviewerName}
                    reviewerEmail={reviewerEmail}
                    reviewerInstitution={reviewerInstitution}
                    setReviewerName={setReviewerName}
                    setReviewerEmail={setReviewerEmail}
                    setReviewerInstitution={setReviewerInstitution}
                    onAssign={() =>
                        runAction(() =>
                            assignReviewer({
                                submissionId: submission.id,
                                reviewerName,
                                reviewerEmail,
                                reviewerInstitution,
                            }),
                        )
                    }
                />
            )}

            {status === 'UNDER_REVIEW' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Record Reviewer Decision</CardTitle>
                        <p className="text-xs text-body">
                            Reviewer: {submission.reviewer_name} &lt;{submission.reviewer_email}&gt;
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <select
                            className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:outline-none"
                            value={decision}
                            onChange={(e) => setDecision(e.target.value as ReviewerDecision)}
                        >
                            <option value="MINOR_REVISION">Minor Revision</option>
                            <option value="MAJOR_REVISION">Major Revision</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <textarea
                            rows={3}
                            className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                            placeholder="Reviewer feedback…"
                            value={decisionFeedback}
                            onChange={(e) => setDecisionFeedback(e.target.value)}
                        />
                        <Button
                            disabled={busy || !decisionFeedback.trim()}
                            onClick={() =>
                                runAction(() =>
                                    recordReviewerDecision({
                                        submissionId: submission.id,
                                        decision,
                                        feedback: decisionFeedback,
                                    }),
                                )
                            }
                        >
                            Record Decision
                        </Button>
                    </CardContent>
                </Card>
            )}

            {status === 'FINAL_SUBMISSION' && (
                <Card>
                    <CardHeader><CardTitle>Final Submission Decision</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <textarea
                            rows={2}
                            className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                            placeholder="Comments (required for return/reject)…"
                            value={finalComments}
                            onChange={(e) => setFinalComments(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button
                                disabled={busy}
                                onClick={() => runAction(() => finalApprove({ submissionId: submission.id, action: 'approve' }))}
                            >
                                Approve for Publication
                            </Button>
                            <Button
                                variant="outline"
                                disabled={busy || !finalComments.trim()}
                                onClick={() => runAction(() => finalApprove({ submissionId: submission.id, action: 'return', comments: finalComments }))}
                            >
                                Return Final Version
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={busy || !finalComments.trim()}
                                onClick={() => runAction(() => finalApprove({ submissionId: submission.id, action: 'reject', comments: finalComments }))}
                            >
                                Reject
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {status === 'APPROVED_FOR_PUBLICATION' && (
                <Card>
                    <CardHeader><CardTitle>Ready to Publish</CardTitle></CardHeader>
                    <CardContent>
                        <Button disabled={busy} onClick={() => runAction(() => publishSubmission(submission.id))}>
                            Publish to Archive
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Abstract</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-body leading-relaxed">{submission.abstract}</p>
                    {submission.keywords.length > 0 && (
                        <p className="text-xs text-body mt-2">Keywords: {submission.keywords.join(', ')}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Authors</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {submission.submission_authors.map((a) => (
                        <div key={a.id} className="text-sm text-ink">
                            {a.name} &lt;{a.email}&gt;
                            {a.corresponding_author && (
                                <span className="text-xs text-primary font-semibold ml-2">(Corresponding)</span>
                            )}
                            {a.institution && <span className="text-body"> — {a.institution}</span>}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Manuscript Versions</CardTitle></CardHeader>
                <CardContent>
                    <ManuscriptVersionList versions={submission.manuscript_versions} />
                </CardContent>
            </Card>

            {submission.reviewer_feedback.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Reviewer Feedback History</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {submission.reviewer_feedback.map((f) => (
                            <div key={f.id} className="p-3 bg-surface-card border border-hairline rounded-xl text-sm">
                                <p className="font-semibold text-ink">{f.decision.replace('_', ' ')}</p>
                                <p className="text-body">{f.feedback}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Audit History</CardTitle></CardHeader>
                <CardContent>
                    <SubmissionTimeline entries={submission.submission_history} />
                </CardContent>
            </Card>
        </div>
    )
}

type ReviewerAssignmentCardProps = {
    busy: boolean
    reviewerName: string
    reviewerEmail: string
    reviewerInstitution: string
    setReviewerName: (v: string) => void
    setReviewerEmail: (v: string) => void
    setReviewerInstitution: (v: string) => void
    onAssign: () => void
}

const ReviewerAssignmentCard = ({
    busy,
    reviewerName,
    reviewerEmail,
    reviewerInstitution,
    setReviewerName,
    setReviewerEmail,
    setReviewerInstitution,
    onAssign,
}: ReviewerAssignmentCardProps) => (
    <Card>
        <CardHeader><CardTitle>Assign Reviewer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
            <Input placeholder="Reviewer name" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
            <Input type="email" placeholder="Reviewer email" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} />
            <Input placeholder="Institution (optional)" value={reviewerInstitution} onChange={(e) => setReviewerInstitution(e.target.value)} />
            <Button disabled={busy || !reviewerName.trim() || !reviewerEmail.trim()} onClick={onAssign}>
                Send for Review
            </Button>
        </CardContent>
    </Card>
)

export default AdminSubmissionDetail
