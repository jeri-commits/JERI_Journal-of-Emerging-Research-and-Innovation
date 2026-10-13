import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, ArrowRight, UploadCloud, Paperclip, Download, AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import SubmissionTimeline from '@/components/shared/SubmissionTimeline'
import ManuscriptVersionList from '@/components/shared/ManuscriptVersionList'
import MarkdownFeedback from '@/components/shared/MarkdownFeedback'
import DecisionBadge from '@/components/shared/DecisionBadge'
import { getSubmissionDetail } from '@/services/supabase/submissions'
import {
    submitCorrection,
    getFeedbackAttachmentUrl,
    updateSubmissionAuthors,
} from '@/services/supabase/workflow'
import type { SubmissionDetail } from '@/@types/submissions'
import type { CoAuthorInput } from '@/services/supabase/workflow'

const MAX_AUTHORS = 6

const emptyAuthor = (): CoAuthorInput => ({
    name: '',
    email: '',
    department: '',
    institution: '',
    country: '',
    correspondingAuthor: false,
})

const MAX_FILE_SIZE = 25 * 1024 * 1024
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const REVISABLE = ['MAJOR_REVISION', 'MINOR_REVISION']
const FINALIZABLE = ['ACCEPTED', 'RETURNED_FINAL']

const AuthorSubmissionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState('')
    const [uploading, setUploading] = useState(false)
    const [correctedTitle, setCorrectedTitle] = useState('')
    const [correctedAbstract, setCorrectedAbstract] = useState('')
    const [downloadingFeedbackId, setDownloadingFeedbackId] = useState<string | null>(null)
    const [editingAuthors, setEditingAuthors] = useState(false)
    const [authorDrafts, setAuthorDrafts] = useState<CoAuthorInput[]>([])
    const [authorsError, setAuthorsError] = useState('')
    const [authorsSaving, setAuthorsSaving] = useState(false)

    const startEditingAuthors = () => {
        if (!submission) return
        setAuthorDrafts(
            submission.submission_authors.map((a) => ({
                name: a.name,
                email: a.email,
                department: a.department ?? '',
                institution: a.institution ?? '',
                country: a.country ?? '',
                correspondingAuthor: a.corresponding_author,
            })),
        )
        setAuthorsError('')
        setEditingAuthors(true)
    }

    const updateAuthorDraft = (idx: number, patch: Partial<CoAuthorInput>) => {
        setAuthorDrafts((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)))
    }
    const addAuthorDraft = () => {
        if (authorDrafts.length >= MAX_AUTHORS) return
        setAuthorDrafts((prev) => [...prev, emptyAuthor()])
    }
    const removeAuthorDraft = (idx: number) => {
        setAuthorDrafts((prev) => prev.filter((_, i) => i !== idx))
    }

    const saveAuthors = async () => {
        if (!submission) return
        setAuthorsError('')
        if (authorDrafts.some((a) => !a.name.trim() || !a.email.trim() || !a.department?.trim() || !a.institution?.trim() || !a.country?.trim())) {
            return setAuthorsError('Every author needs a name, email, department, institution, and country.')
        }
        if (!authorDrafts.some((a) => a.correspondingAuthor)) {
            return setAuthorsError('Please mark one author as the corresponding author.')
        }
        setAuthorsSaving(true)
        try {
            await updateSubmissionAuthors({ submissionId: submission.id, coAuthors: authorDrafts })
            setEditingAuthors(false)
            load()
        } catch (err) {
            setAuthorsError((err as Error).message)
        } finally {
            setAuthorsSaving(false)
        }
    }

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
            .then(setSubmission)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(load, [id])

    useEffect(() => {
        if (submission?.status === 'RETURNED_FOR_CORRECTION') {
            setCorrectedTitle(submission.title)
            setCorrectedAbstract(submission.abstract)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submission?.id])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null
        setFileError('')
        if (!selected) return setFile(null)
        if (!ALLOWED_TYPES.includes(selected.type)) {
            setFileError('Must be a PDF or Word document (.pdf, .doc, .docx).')
            return setFile(null)
        }
        if (selected.size > MAX_FILE_SIZE) {
            setFileError('File must be under 25MB.')
            return setFile(null)
        }
        setFile(selected)
    }

    const handleResubmitCorrection = async () => {
        if (!submission) return
        setUploading(true)
        setError('')
        try {
            await submitCorrection({
                submissionId: submission.id,
                title: correctedTitle,
                abstract: correctedAbstract,
                file: file ?? undefined,
            })
            setFile(null)
            load()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setUploading(false)
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

    const canRevise = REVISABLE.includes(submission.status)
    const canFinalize = FINALIZABLE.includes(submission.status)
    const latestFeedback = submission.reviewer_feedback.at(-1)

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 font-sans">
            <Button variant="ghost" size="sm" onClick={() => navigate('/author')}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to submissions
            </Button>

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-text-link">{submission.submission_code}</p>
                    <h1 className="text-2xl font-bold text-ink break-words">{submission.title}</h1>
                </div>
                <StatusBadge status={submission.status} />
            </div>

            {error && <Alert showIcon type="danger">{error}</Alert>}

            {submission.latest_feedback_note && (
                <Card className="border-amber-300 bg-amber-50/60">
                    <CardContent className="py-4 flex gap-3">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-ink">Action required</p>
                            <MarkdownFeedback text={submission.latest_feedback_note} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {submission.status === 'RETURNED_FOR_CORRECTION' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Correct & Resubmit</CardTitle>
                        <p className="text-sm text-body">
                            See the latest entry in the history below for the
                            editorial office&apos;s comments. Fix what&apos;s
                            needed and resubmit — this does not count as a
                            peer-review revision.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Title</label>
                            <input
                                className="w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:outline-none"
                                value={correctedTitle}
                                onChange={(e) => setCorrectedTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Abstract</label>
                            <textarea
                                rows={4}
                                className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                                value={correctedAbstract}
                                onChange={(e) => setCorrectedAbstract(e.target.value)}
                            />
                        </div>
                        <label className="p-4 border-2 border-dashed border-hairline-strong rounded-lg flex flex-col items-center gap-2 cursor-pointer bg-canvas-soft block">
                            <UploadCloud className="h-6 w-6 text-primary" />
                            <span className="text-sm font-medium text-ink">
                                {file ? file.name : 'Replace manuscript file (optional)'}
                            </span>
                            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                        </label>
                        {fileError && <p className="text-xs text-red-500">{fileError}</p>}
                        <Button disabled={uploading} onClick={handleResubmitCorrection}>
                            {uploading ? 'Resubmitting…' : 'Resubmit for Editorial Review'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {(canRevise || canFinalize) && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {canFinalize ? 'Final Version Due' : `Revision Due (${submission.revision_count}/3 used)`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {latestFeedback && canRevise && (
                            <div className="p-3 bg-surface-strong/60 rounded-xl text-sm text-ink">
                                <strong>Reviewer feedback:</strong> {latestFeedback.feedback}
                            </div>
                        )}
                        <p className="text-sm text-body">
                            {canFinalize
                                ? 'Submit your final manuscript, copyright form, and payment slip from the Paper Submission page — select "Final Submission" and enter this paper\'s Manuscript ID.'
                                : 'Submit your revised manuscript from the Paper Submission page — select "Revised Submission" and enter this paper\'s Manuscript ID.'}
                        </p>
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs font-mono text-ink">
                            Manuscript ID: <strong>{submission.submission_code}</strong>
                        </div>
                        <Button
                            className="flex items-center gap-2"
                            onClick={() => navigate('/author/submissions/new')}
                        >
                            <span>Go to Paper Submission</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Manuscript Info</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-xs font-medium text-body mb-1">Abstract</p>
                        <p className="text-sm text-body leading-relaxed">{submission.abstract}</p>
                    </div>
                    {submission.keywords.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-body mb-1">Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                                {submission.keywords.map((kw) => (
                                    <span key={kw} className="text-xs bg-surface-strong text-ink px-2 py-0.5 rounded-full">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-medium text-body mb-1">Paper Type</p>
                            <p className="text-sm text-ink">{submission.paper_type ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-body mb-1">Submission Mode</p>
                            <p className="text-sm text-ink">{submission.submission_mode ?? '—'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Author Info</CardTitle>
                    {submission.status !== 'PUBLISHED' && !editingAuthors && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={startEditingAuthors}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-3">
                    {!editingAuthors && submission.submission_authors.map((author) => (
                        <div
                            key={author.id}
                            className="p-3 bg-surface-card border border-hairline rounded-xl text-sm space-y-1"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-ink">{author.name}</span>
                                {author.corresponding_author && (
                                    <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                        Corresponding Author
                                    </span>
                                )}
                            </div>
                            <p className="text-body">{author.email}</p>
                            <p className="text-body">
                                {[author.department, author.institution, author.country]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </div>
                    ))}

                    {editingAuthors && (
                        <div className="space-y-3">
                            {authorsError && <Alert showIcon type="danger">{authorsError}</Alert>}
                            {authorDrafts.map((author, idx) => (
                                <div key={idx} className="p-3 border border-hairline-strong rounded-lg space-y-2.5 bg-canvas-soft/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                            Author {idx + 1}
                                        </span>
                                        {authorDrafts.length > 1 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeAuthorDraft(idx)}
                                                className="h-6 w-6 p-0 text-body hover:text-red-500"
                                                title="Remove Author"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <Input
                                            placeholder="Full Name *"
                                            value={author.name}
                                            onChange={(e) => updateAuthorDraft(idx, { name: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                        />
                                        <Input
                                            type="email"
                                            placeholder="Email Address *"
                                            value={author.email}
                                            onChange={(e) => updateAuthorDraft(idx, { email: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <Input
                                            placeholder="Department *"
                                            value={author.department}
                                            onChange={(e) => updateAuthorDraft(idx, { department: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                        />
                                        <Input
                                            placeholder="Institution *"
                                            value={author.institution}
                                            onChange={(e) => updateAuthorDraft(idx, { institution: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                        />
                                        <Input
                                            placeholder="Country *"
                                            value={author.country}
                                            onChange={(e) => updateAuthorDraft(idx, { country: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                        />
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-xs font-medium text-ink cursor-pointer pt-0.5">
                                        <input
                                            type="radio"
                                            name="editCorrespondingAuthor"
                                            checked={Boolean(author.correspondingAuthor)}
                                            onChange={() =>
                                                setAuthorDrafts((prev) => prev.map((a, i) => ({ ...a, correspondingAuthor: i === idx })))
                                            }
                                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                                        />
                                        <span>Mark as Corresponding Author</span>
                                    </label>
                                </div>
                            ))}
                            <div className="flex items-center justify-between gap-2 pt-1">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={addAuthorDraft}
                                    disabled={authorDrafts.length >= MAX_AUTHORS}
                                    className="gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add Author
                                </Button>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingAuthors(false)}
                                        disabled={authorsSaving}
                                        className="gap-1.5"
                                    >
                                        <X className="h-3.5 w-3.5" /> Cancel
                                    </Button>
                                    <Button type="button" size="sm" onClick={saveAuthors} disabled={authorsSaving}>
                                        {authorsSaving ? 'Saving…' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-medium text-body mb-1">Contact No.</p>
                        <p className="text-sm text-ink">{submission.contact_phone ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-body mb-1">Country</p>
                        <p className="text-sm text-ink">{submission.contact_country ?? '—'}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs font-medium text-body mb-1">Address</p>
                        <p className="text-sm text-ink">
                            {[submission.address_line1, submission.address_line2]
                                .filter(Boolean)
                                .join(', ') || '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-body mb-1">City</p>
                        <p className="text-sm text-ink">{submission.city ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-body mb-1">State / Province</p>
                        <p className="text-sm text-ink">{submission.state_province ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-body mb-1">Pin / Zip Code</p>
                        <p className="text-sm text-ink">{submission.postal_code ?? '—'}</p>
                    </div>
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
                            Editorial decisions on your manuscript so far.
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
                <CardHeader><CardTitle>Submission History</CardTitle></CardHeader>
                <CardContent>
                    <SubmissionTimeline entries={submission.submission_history} />
                </CardContent>
            </Card>
        </div>
    )
}

export default AuthorSubmissionDetail
