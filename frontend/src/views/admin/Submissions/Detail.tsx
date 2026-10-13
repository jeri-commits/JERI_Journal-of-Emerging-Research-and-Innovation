import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, Download, Paperclip, Send } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import SubmissionTimeline from '@/components/shared/SubmissionTimeline'
import ManuscriptVersionList from '@/components/shared/ManuscriptVersionList'
import MarkdownFeedback from '@/components/shared/MarkdownFeedback'
import FeedbackEditor from '@/components/shared/FeedbackEditor'
import DecisionBadge from '@/components/shared/DecisionBadge'
import CopyButton from '@/components/shared/CopyButton'
import { getSubmissionDetail } from '@/services/supabase/submissions'
import { supabase } from '@/configs/supabase.config'
import {
    returnForCorrection,
    assignReviewer,
    recordReviewerDecision,
    finalApprove,
    publishSubmission,
    getFeedbackAttachmentUrl,
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
    const [decision, setDecision] = useState<ReviewerDecision>('MINOR_REVISION')
    const [decisionFeedback, setDecisionFeedback] = useState('')
    const [decisionAttachment, setDecisionAttachment] = useState<File | null>(null)
    const [finalComments, setFinalComments] = useState('')
    const [downloadingFeedbackId, setDownloadingFeedbackId] = useState<string | null>(null)

    const handleDownloadFeedbackAttachment = async (feedbackId: string) => {
        setDownloadingFeedbackId(feedbackId)
        try {
            const { url } = await getFeedbackAttachmentUrl(feedbackId)
            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setDownloadingFeedbackId(null)
        }
    }

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

    if (loading) return <div className="p-4 sm:p-6">Loading…</div>
    if (error && !submission) {
        return (
            <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                <Alert showIcon type="danger">{error}</Alert>
            </div>
        )
    }
    if (!submission) return null

    const { status } = submission

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 font-sans">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/submissions')}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to all submissions
            </Button>

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-link">{submission.submission_code}</p>
                    <div className="flex items-start gap-2">
                        <h1 className="text-2xl font-bold text-ink break-words">{submission.title}</h1>
                        <CopyButton value={submission.title} label="Copy title" className="mt-1.5" />
                    </div>
                    <p className="text-sm text-body">Author: {authorEmail || submission.author_id}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {error && <Alert showIcon type="danger">{error}</Alert>}

            {status === 'SUBMITTED' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader><CardTitle>Return for Correction</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <FeedbackEditor
                                rows={3}
                                placeholder="Describe what the author needs to fix…"
                                value={correctionComments}
                                onChange={setCorrectionComments}
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
                    <SendForReviewCard
                        busy={busy}
                        onSend={() => runAction(() => assignReviewer(submission.id))}
                    />
                </div>
            )}

            {status === 'REVISED_SUBMISSION' && (
                <SendForReviewCard
                    busy={busy}
                    onSend={() => runAction(() => assignReviewer(submission.id))}
                />
            )}

            {status === 'UNDER_REVIEW' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Record Reviewer Decision</CardTitle>
                        <p className="text-xs text-body">
                            Enter the outcome the reviewer sent back by email.
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
                        <FeedbackEditor
                            rows={3}
                            placeholder="Reviewer feedback… (bold/italic/bullets supported)"
                            value={decisionFeedback}
                            onChange={setDecisionFeedback}
                            attachment={decisionAttachment}
                            onAttachmentChange={setDecisionAttachment}
                        />
                        <Button
                            disabled={busy || !decisionFeedback.trim()}
                            onClick={() =>
                                runAction(async () => {
                                    await recordReviewerDecision({
                                        submissionId: submission.id,
                                        decision,
                                        feedback: decisionFeedback,
                                        attachment: decisionAttachment ?? undefined,
                                    })
                                    setDecisionFeedback('')
                                    setDecisionAttachment(null)
                                })
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
                        <FeedbackEditor
                            rows={2}
                            placeholder="Comments (required for return/reject)…"
                            value={finalComments}
                            onChange={setFinalComments}
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Abstract</CardTitle>
                    <CopyButton value={submission.abstract} label="Copy abstract" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-body leading-relaxed">{submission.abstract}</p>
                    {submission.keywords.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <p className="text-xs text-body">Keywords: {submission.keywords.join(', ')}</p>
                            <CopyButton value={submission.keywords.join(', ')} label="Copy keywords" />
                        </div>
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
                    <CardHeader>
                        <CardTitle>Review Rounds</CardTitle>
                        <p className="text-xs text-body">
                            {submission.reviewer_feedback.length} decision{submission.reviewer_feedback.length === 1 ? '' : 's'} recorded so far.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {submission.reviewer_feedback.map((f, i) => (
                            <div key={f.id} className="relative pl-5">
                                {i < submission.reviewer_feedback.length - 1 && (
                                    <div className="absolute left-[7px] top-6 bottom-[-16px] w-px bg-hairline-strong" />
                                )}
                                <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-surface-card" />
                                <div className="p-3 bg-surface-card border border-hairline rounded-xl text-sm space-y-2">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-body">Round {i + 1}</span>
                                            <DecisionBadge decision={f.decision} />
                                        </div>
                                        <span className="text-[11px] text-body/70">
                                            {new Date(f.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <MarkdownFeedback text={f.feedback} />
                                    {f.attachment_name && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1.5"
                                            disabled={downloadingFeedbackId === f.id}
                                            onClick={() => handleDownloadFeedbackAttachment(f.id)}
                                        >
                                            <Paperclip className="h-3 w-3" />
                                            {f.attachment_name}
                                            <Download className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
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

const SendForReviewCard = ({ busy, onSend }: { busy: boolean; onSend: () => void }) => (
    <Card>
        <CardHeader>
            <CardTitle>Send for Review</CardTitle>
            <p className="text-xs text-body">
                Download the manuscript above and send it to your reviewer directly. Once
                they've replied, come back here to record their decision.
            </p>
        </CardHeader>
        <CardContent>
            <Button disabled={busy} onClick={onSend} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send for Review
            </Button>
        </CardContent>
    </Card>
)

export default AdminSubmissionDetail
