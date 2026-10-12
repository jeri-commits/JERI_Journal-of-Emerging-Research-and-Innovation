import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/auth'
import { Plus, FileText, Clock, CheckCircle, RefreshCw, Eye, Copy, Check, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import { listMySubmissions } from '@/services/supabase/submissions'
import type { Submission } from '@/@types/submissions'

const PAGE_SIZE = 10

const AuthorDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.userId) return
        listMySubmissions(user.userId)
            .then(setSubmissions)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [user?.userId])

    const pageCount = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE))
    const pageStart = (page - 1) * PAGE_SIZE
    const pagedSubmissions = submissions.slice(pageStart, pageStart + PAGE_SIZE)

    const handleCopyCode = async (id: string, code: string) => {
        try {
            await navigator.clipboard.writeText(code)
            setCopiedId(id)
            setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500)
        } catch {
            // clipboard API unavailable -- nothing to recover from, the
            // user can still select and copy the text manually
        }
    }

    const underReview = submissions.filter((s) => s.status === 'UNDER_REVIEW').length
    const revisionsNeeded = submissions.filter((s) =>
        ['MAJOR_REVISION', 'MINOR_REVISION'].includes(s.status),
    ).length
    const acceptedOrPublished = submissions.filter((s) =>
        ['ACCEPTED', 'FINAL_SUBMISSION', 'APPROVED_FOR_PUBLICATION', 'PUBLISHED'].includes(s.status),
    ).length

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
                <div>
                    <h1 className="text-display-lg text-ink dark:text-on-dark font-semibold">
                        Welcome back{user?.userName ? `, ${user.userName}` : ''}
                    </h1>
                    <p className="text-body-sm text-body dark:text-on-dark-soft">
                        {user?.email} · Track your manuscript submissions and submit new research.
                    </p>
                </div>
                <Button onClick={() => navigate('/author/submissions/new')} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Submit New Manuscript</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <FileText className="h-4 w-4 text-text-link" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{submissions.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime articles submitted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{underReview}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active peer reviews</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revisions Needed</CardTitle>
                        <RefreshCw className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{revisionsNeeded}</div>
                        <p className="text-xs text-muted-foreground mt-1">Action required by author</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accepted & Published</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{acceptedOrPublished}</div>
                        <p className="text-xs text-muted-foreground mt-1">Published in JERI</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Submissions</CardTitle>
                    <p className="text-sm text-body dark:text-on-dark-soft">
                        Every manuscript you&apos;ve submitted to JERI, with its current status.
                    </p>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-sm text-body">Loading…</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {!loading && !error && submissions.length === 0 && (
                        <p className="text-sm text-body">
                            You haven&apos;t submitted any manuscripts yet.
                        </p>
                    )}
                    {!loading && submissions.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paper ID & Title</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Revisions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagedSubmissions.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-text-link font-semibold">
                                                    {s.submission_code}
                                                </span>
                                                <button
                                                    type="button"
                                                    title="Copy Manuscript ID"
                                                    onClick={() => handleCopyCode(s.id, s.submission_code)}
                                                    className="text-body hover:text-ink transition-colors"
                                                >
                                                    {copiedId === s.id ? (
                                                        <Check className="h-3 w-3 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="text-sm font-medium text-ink dark:text-on-dark line-clamp-1">
                                                {s.title}
                                            </div>
                                            {s.latest_feedback_note && (
                                                <div className="flex items-start gap-1 text-xs text-amber-700 dark:text-amber-400">
                                                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                                    <span className="line-clamp-1">
                                                        {s.latest_feedback_note.replace(/[*_`#>-]/g, '')}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {s.submitted_at
                                                ? new Date(s.submitted_at).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={s.status} />
                                        </TableCell>
                                        <TableCell>{s.revision_count}/3</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-text-link gap-1"
                                                onClick={() => navigate(`/author/submissions/${s.id}`)}
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                {!loading && submissions.length > 0 && (
                    <div className="px-6 py-3 border-t border-hairline flex items-center justify-between gap-4">
                        <p className="text-xs text-body">
                            Showing {pageStart + 1} to {Math.min(pageStart + PAGE_SIZE, submissions.length)} of{' '}
                            {submissions.length} result{submissions.length === 1 ? '' : 's'}
                        </p>
                        {pageCount > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="gap-1"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                                </Button>
                                <span className="text-xs text-body">
                                    Page {page} of {pageCount}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page >= pageCount}
                                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                                    className="gap-1"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AuthorDashboard
