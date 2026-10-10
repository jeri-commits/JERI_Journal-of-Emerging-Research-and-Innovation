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
import StatusBadge from '@/components/shared/StatusBadge'
import { Plus, Eye } from 'lucide-react'
import { useAuth } from '@/auth'
import { listMySubmissions } from '@/services/supabase/submissions'
import type { Submission } from '@/@types/submissions'

const AuthorSubmissionsList: React.FC = () => {
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

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-ink">My Submissions</h1>
                    <p className="text-sm text-body">All manuscripts you&apos;ve submitted to JERI.</p>
                </div>
                <Button onClick={() => navigate('/author/submissions/new')}>
                    <Plus className="h-4 w-4 mr-1.5" /> New Submission
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manuscripts</CardTitle>
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
                                    <TableHead>Submission</TableHead>
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
                                            <div className="text-sm font-medium text-ink line-clamp-1">
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
            </Card>
        </div>
    )
}

export default AuthorSubmissionsList
