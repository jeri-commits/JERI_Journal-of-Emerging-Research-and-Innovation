import React, { useEffect, useMemo, useState } from 'react'
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
import { Users, FileCheck, Clock, CheckCircle2, Eye } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import { listAllSubmissions } from '@/services/supabase/submissions'
import { listAllUsers } from '@/services/supabase/adminUsers'
import { STATUS_LABELS } from '@/@types/submissions'
import type { Submission, SubmissionStatus } from '@/@types/submissions'
import type { AdminUserRow } from '@/services/supabase/adminUsers'

const STATUS_BAR_COLOR: Partial<Record<SubmissionStatus, string>> = {
    SUBMITTED: 'bg-slate-400',
    RETURNED_FOR_CORRECTION: 'bg-red-400',
    UNDER_REVIEW: 'bg-amber-400',
    MAJOR_REVISION: 'bg-purple-400',
    MINOR_REVISION: 'bg-purple-400',
    REVISED_SUBMISSION: 'bg-slate-400',
    ACCEPTED: 'bg-emerald-400',
    REJECTED: 'bg-red-400',
    FINAL_SUBMISSION: 'bg-amber-400',
    RETURNED_FINAL: 'bg-red-400',
    APPROVED_FOR_PUBLICATION: 'bg-emerald-400',
    PUBLISHED: 'bg-emerald-500',
}

const PENDING_STATUSES = ['SUBMITTED', 'REVISED_SUBMISSION', 'FINAL_SUBMISSION', 'APPROVED_FOR_PUBLICATION']

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [users, setUsers] = useState<AdminUserRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([listAllSubmissions(), listAllUsers()])
            .then(([subs, allUsers]) => {
                setSubmissions(subs)
                setUsers(allUsers)
            })
            .finally(() => setLoading(false))
    }, [])

    const pendingTriage = submissions.filter((s) => PENDING_STATUSES.includes(s.status)).length
    const inReview = submissions.filter((s) => s.status === 'UNDER_REVIEW').length
    const activeAuthors = users.filter((u) => u.role === 'author').length
    const published = submissions.filter((s) => s.status === 'PUBLISHED').length

    const statusCounts = useMemo(() => {
        const counts = new Map<SubmissionStatus, number>()
        for (const s of submissions) counts.set(s.status, (counts.get(s.status) ?? 0) + 1)
        return Array.from(counts.entries())
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
    }, [submissions])
    const maxStatusCount = Math.max(1, ...statusCounts.map(([, count]) => count))

    const recentSubmissions = useMemo(
        () =>
            [...submissions]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5),
        [submissions],
    )

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
                <div>
                    <h1 className="text-display-lg text-ink dark:text-on-dark font-semibold">
                        Welcome back{user?.userName ? `, ${user.userName}` : ''}
                    </h1>
                    <p className="text-body-sm text-body dark:text-on-dark-soft">
                        {user?.email} · Manage journal submissions, reviewer assignments, and publication.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Triage</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTriage}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires editorial action</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Peer Review</CardTitle>
                        <FileCheck className="h-4 w-4 text-text-link" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inReview}</div>
                        <p className="text-xs text-muted-foreground mt-1">Under external evaluation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Authors</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeAuthors}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered contributors</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Papers</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{published}</div>
                        <p className="text-xs text-muted-foreground mt-1">Live in the public archive</p>
                    </CardContent>
                </Card>
            </div>

            {!loading && statusCounts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Submissions by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        {statusCounts.map(([status, count]) => (
                            <div key={status} className="flex items-center gap-3">
                                <span className="text-xs text-body w-40 shrink-0 truncate">
                                    {STATUS_LABELS[status]}
                                </span>
                                <div className="flex-1 h-2.5 rounded-full bg-surface-strong overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${STATUS_BAR_COLOR[status] ?? 'bg-primary'}`}
                                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-ink w-6 text-right shrink-0">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Editorial Triage Queue</CardTitle>
                            <p className="text-sm text-body dark:text-on-dark-soft">
                                Submissions awaiting an editorial decision.
                            </p>
                        </CardHeader>
                        <CardContent>
                            {loading && <p className="text-sm text-body">Loading…</p>}
                            {!loading && submissions.filter((s) => PENDING_STATUSES.includes(s.status)).length === 0 && (
                                <p className="text-sm text-body">Nothing needs attention right now.</p>
                            )}
                            {!loading && submissions.filter((s) => PENDING_STATUSES.includes(s.status)).length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Manuscript</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions
                                            .filter((s) => PENDING_STATUSES.includes(s.status))
                                            .slice(0, 8)
                                            .map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell className="space-y-1">
                                                        <div className="text-xs text-text-link font-semibold">{s.submission_code}</div>
                                                        <div className="text-sm font-medium text-ink dark:text-on-dark line-clamp-1">{s.title}</div>
                                                    </TableCell>
                                                    <TableCell><StatusBadge status={s.status} /></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/submissions/${s.id}`)}>
                                                            Open
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            )}
                            <div className="pt-3 text-right">
                                <Button variant="link" size="sm" onClick={() => navigate('/admin/submissions')}>
                                    View all submissions →
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Submissions</CardTitle>
                            <p className="text-sm text-body dark:text-on-dark-soft">
                                The 5 most recently submitted manuscripts.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {loading && <p className="text-sm text-body">Loading…</p>}
                            {!loading && recentSubmissions.length === 0 && (
                                <p className="text-sm text-body">No submissions yet.</p>
                            )}
                            {recentSubmissions.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => navigate(`/admin/submissions/${s.id}`)}
                                    className="w-full text-left p-2.5 rounded-lg border border-hairline hover:bg-surface-strong transition-colors space-y-1"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold text-text-link">{s.submission_code}</span>
                                        <StatusBadge status={s.status} />
                                    </div>
                                    <p className="text-xs text-ink line-clamp-1">{s.title}</p>
                                    <p className="text-[11px] text-body/70">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </p>
                                </button>
                            ))}
                            <div className="pt-1 text-right">
                                <Button variant="link" size="sm" onClick={() => navigate('/admin/submissions')} className="gap-1">
                                    View all <Eye className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
