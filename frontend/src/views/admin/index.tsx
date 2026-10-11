import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Chart from 'react-apexcharts'
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
import { Users, FileCheck, Clock, CheckCircle2 } from 'lucide-react'
import StatusBadge from '@/components/shared/StatusBadge'
import NotificationsPanel from '@/components/shared/NotificationsPanel'
import { listAllSubmissions } from '@/services/supabase/submissions'
import { listAllUsers } from '@/services/supabase/adminUsers'
import { STATUS_LABELS } from '@/@types/submissions'
import type { Submission, SubmissionStatus } from '@/@types/submissions'
import type { AdminUserRow } from '@/services/supabase/adminUsers'

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
        return Array.from(counts.entries()).filter(([, count]) => count > 0)
    }, [submissions])

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <CardContent>
                        <Chart
                            type="bar"
                            height={260}
                            options={{
                                chart: { toolbar: { show: false } },
                                plotOptions: { bar: { borderRadius: 4, horizontal: true } },
                                xaxis: {
                                    categories: statusCounts.map(([status]) => STATUS_LABELS[status]),
                                },
                                dataLabels: { enabled: true },
                                colors: ['#0d74ce'],
                                grid: { strokeDashArray: 4 },
                            }}
                            series={[{ name: 'Submissions', data: statusCounts.map(([, count]) => count) }]}
                        />
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    {user?.userId && (
                        <NotificationsPanel userId={user.userId} basePath="/admin/submissions" />
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
