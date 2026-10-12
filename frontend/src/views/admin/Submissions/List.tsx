import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import StatusBadge from '@/components/shared/StatusBadge'
import { Eye, Download } from 'lucide-react'
import { listAllSubmissions } from '@/services/supabase/submissions'
import { STATUS_LABELS } from '@/@types/submissions'
import type { Submission, SubmissionStatus } from '@/@types/submissions'

const AdminSubmissionsList: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const authorFilter = searchParams.get('authorId')
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'ALL'>('ALL')

    useEffect(() => {
        listAllSubmissions()
            .then(setSubmissions)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        return submissions.filter((s) => {
            if (authorFilter && s.author_id !== authorFilter) return false
            const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
            const q = search.trim().toLowerCase()
            const matchesSearch =
                !q ||
                s.submission_code.toLowerCase().includes(q) ||
                s.title.toLowerCase().includes(q)
            return matchesStatus && matchesSearch
        })
    }, [submissions, search, statusFilter, authorFilter])

    const csvData = useMemo(
        () =>
            filtered.map((s) => ({
                submission_code: s.submission_code,
                title: s.title,
                status: STATUS_LABELS[s.status],
                revision_count: s.revision_count,
                submitted_at: s.submitted_at ?? '',
                reviewer_name: s.reviewer_name ?? '',
                reviewer_email: s.reviewer_email ?? '',
            })),
        [filtered],
    )

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5 font-sans">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink">All Submissions</h1>
                    <p className="text-sm text-body">Every manuscript submitted to JERI.</p>
                </div>
                <CSVLink
                    data={csvData}
                    filename="jeri-submissions.csv"
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-hairline-strong bg-canvas hover:bg-surface-strong text-ink font-medium"
                >
                    <Download className="h-3.5 w-3.5" /> Export CSV
                </CSVLink>
            </div>

            {authorFilter && (
                <div className="flex items-center gap-2 text-xs text-body">
                    <span>Filtered to one author&apos;s submissions</span>
                    <button
                        className="text-text-link font-medium hover:underline"
                        onClick={() => setSearchParams({})}
                    >
                        Clear filter
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
                <Input
                    placeholder="Search by submission ID or title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:max-w-[24rem]"
                />
                <select
                    className="rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink focus:outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as SubmissionStatus | 'ALL')}
                >
                    <option value="ALL">All statuses</option>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Submissions ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-sm text-body">Loading…</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {!loading && !error && filtered.length === 0 && (
                        <p className="text-sm text-body">No submissions match.</p>
                    )}
                    {!loading && filtered.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Submission</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Revisions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="space-y-1">
                                            <div className="text-xs text-text-link font-semibold">
                                                {s.submission_code}
                                            </div>
                                            <div className="text-sm font-medium text-ink line-clamp-1">
                                                {s.title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {s.submitted_at
                                                ? new Date(s.submitted_at).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell><StatusBadge status={s.status} /></TableCell>
                                        <TableCell>{s.revision_count}/3</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-text-link gap-1"
                                                onClick={() => navigate(`/admin/submissions/${s.id}`)}
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Open
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminSubmissionsList
