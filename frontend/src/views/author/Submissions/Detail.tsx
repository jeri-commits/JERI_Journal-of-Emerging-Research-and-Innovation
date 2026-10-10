import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/Alert'
import { ArrowLeft, UploadCloud } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import SubmissionTimeline from '@/components/shared/SubmissionTimeline'
import ManuscriptVersionList from '@/components/shared/ManuscriptVersionList'
import { getSubmissionDetail } from '@/services/supabase/submissions'
import { submitRevision, submitFinal, submitCorrection } from '@/services/supabase/workflow'
import type { SubmissionDetail } from '@/@types/submissions'

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

    const handleUpload = async (kind: 'revision' | 'final') => {
        if (!submission || !file) return
        setUploading(true)
        setError('')
        try {
            if (kind === 'revision') {
                await submitRevision(submission.id, file)
            } else {
                await submitFinal(submission.id, file)
            }
            setFile(null)
            load()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setUploading(false)
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

    const canRevise = REVISABLE.includes(submission.status)
    const canFinalize = FINALIZABLE.includes(submission.status)
    const latestFeedback = submission.reviewer_feedback.at(-1)

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 font-sans">
            <Button variant="ghost" size="sm" onClick={() => navigate('/author/submissions')}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to submissions
            </Button>

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold text-text-link">{submission.submission_code}</p>
                    <h1 className="text-2xl font-bold text-ink">{submission.title}</h1>
                </div>
                <StatusBadge status={submission.status} />
            </div>

            {error && <Alert showIcon type="danger">{error}</Alert>}

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
                            {canFinalize ? 'Upload Final Version' : `Upload Revision (${submission.revision_count}/3 used)`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {latestFeedback && canRevise && (
                            <div className="p-3 bg-surface-strong/60 rounded-xl text-sm text-ink">
                                <strong>Reviewer feedback:</strong> {latestFeedback.feedback}
                            </div>
                        )}
                        <label className="p-5 border-2 border-dashed border-hairline-strong rounded-lg flex flex-col items-center gap-2 cursor-pointer bg-canvas-soft block">
                            <UploadCloud className="h-7 w-7 text-primary" />
                            <span className="text-sm font-medium text-ink">
                                {file ? file.name : 'Click to choose a PDF, DOC, or DOCX file'}
                            </span>
                            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                        </label>
                        {fileError && <p className="text-xs text-red-500">{fileError}</p>}
                        <Button
                            disabled={!file || uploading}
                            onClick={() => handleUpload(canFinalize ? 'final' : 'revision')}
                        >
                            {uploading ? 'Uploading…' : canFinalize ? 'Submit Final Version' : 'Submit Revision'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Abstract</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-body leading-relaxed">{submission.abstract}</p>
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
                <CardHeader><CardTitle>Submission History</CardTitle></CardHeader>
                <CardContent>
                    <SubmissionTimeline entries={submission.submission_history} />
                </CardContent>
            </Card>
        </div>
    )
}

export default AuthorSubmissionDetail
