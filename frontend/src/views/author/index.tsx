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
import { Plus, FileText, Clock, CheckCircle, RefreshCw, Eye } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import { listMySubmissions } from '@/services/supabase/submissions'
import type { Submission } from '@/@types/submissions'

const AuthorDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user?.userId) return
        listMySubmissions(user.userId)
            .then(setSubmissions)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [user?.userId])

    const underReview = submissions.filter((s) => s.status === 'UNDER_REVIEW').length
    const revisionsNeeded = submissions.filter((s) =>
        ['MAJOR_REVISION', 'MINOR_REVISION'].includes(s.status),
    ).length
    const acceptedOrPublished = submissions.filter((s) =>
        ['ACCEPTED', 'FINAL_SUBMISSION', 'APPROVED_FOR_PUBLICATION', 'PUBLISHED'].includes(s.status),
    ).length

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                {submissions.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="space-y-1">
                                            <div className="text-xs text-text-link font-semibold">
                                                {s.submission_code}
                                            </div>
                                            <div className="text-sm font-medium text-ink dark:text-on-dark line-clamp-1">
                                                {s.title}
                                            </div>
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
                    <div className="px-6 py-3 border-t border-hairline text-xs text-body">
                        {submissions.length} submission{submissions.length === 1 ? '' : 's'} total
                    </div>
                )}
            </Card>
        </div>
    )
}

export default AuthorDashboard
