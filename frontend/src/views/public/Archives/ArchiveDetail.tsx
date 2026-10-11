import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Calendar } from 'lucide-react'
import { supabase } from '@/configs/supabase.config'
import { getDownloadUrl } from '@/services/supabase/workflow'
import type {
    Submission,
    SubmissionAuthor,
    ManuscriptVersion,
} from '@/@types/submissions'

const ArchiveDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [submission, setSubmission] = useState<Submission | null>(null)
    const [authors, setAuthors] = useState<SubmissionAuthor[]>([])
    const [finalVersion, setFinalVersion] = useState<ManuscriptVersion | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        if (!id) return
        ;(async () => {
            try {
                const { data: sub, error: subError } = await supabase
                    .from('submissions')
                    .select('*')
                    .eq('id', id)
                    .eq('status', 'PUBLISHED')
                    .single()
                if (subError || !sub) throw new Error('This paper is not available.')
                setSubmission(sub as Submission)

                const { data: authorRows } = await supabase
                    .from('submission_authors')
                    .select('*')
                    .eq('submission_id', id)
                    .order('author_order', { ascending: true })
                setAuthors(authorRows ?? [])

                const { data: versions } = await supabase
                    .from('manuscript_versions')
                    .select('*')
                    .eq('submission_id', id)
                    .eq('version_type', 'FINAL')
                    .order('version_number', { ascending: false })
                    .limit(1)
                setFinalVersion(versions?.[0] ?? null)
            } catch (err) {
                setError((err as Error).message)
            } finally {
                setLoading(false)
            }
        })()
    }, [id])

    const handleDownload = async () => {
        if (!finalVersion) return
        setDownloading(true)
        try {
            const { url } = await getDownloadUrl(finalVersion.id)
            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (err) {
            alert((err as Error).message)
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return <div className="p-6 max-w-3xl mx-auto">Loading…</div>
    }

    if (error || !submission) {
        return (
            <div className="p-6 max-w-3xl mx-auto space-y-4">
                <p className="text-sm text-red-500">{error || 'Paper not found.'}</p>
                <Button variant="outline" onClick={() => navigate('/archives')}>
                    Back to Archives
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-canvas text-ink font-sans">
            <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
                <Button variant="ghost" size="sm" onClick={() => navigate('/archives')}>
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Archives
                </Button>

                <div className="space-y-3">
                    <Badge variant="outline" className="font-bold text-xs">{submission.submission_code}</Badge>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                        {submission.title}
                    </h1>
                    <p className="text-sm text-body">
                        {authors.map((a) => a.name).join(', ')}
                    </p>
                    {submission.published_at && (
                        <p className="text-xs text-body flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Published {new Date(submission.published_at).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="bg-surface-card border border-hairline rounded-2xl p-6 space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Abstract</h2>
                    <p className="text-sm text-body leading-relaxed">{submission.abstract}</p>
                    {submission.keywords.length > 0 && (
                        <p className="text-xs text-body">
                            <strong>Keywords:</strong> {submission.keywords.join(', ')}
                        </p>
                    )}
                </div>

                {finalVersion && (
                    <Button onClick={handleDownload} disabled={downloading}>
                        <Download className="h-4 w-4 mr-1.5" />
                        {downloading ? 'Preparing…' : 'Download Full Paper (PDF)'}
                    </Button>
                )}
            </main>
        </div>
    )
}

export default ArchiveDetail
