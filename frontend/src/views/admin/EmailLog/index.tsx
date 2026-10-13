import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Send, Mail, ChevronDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { listEmailLog, sendTestEmail } from '@/services/supabase/emailLog'
import type { EmailLogRow, TestEmailType } from '@/services/supabase/emailLog'

const TEST_EMAIL_OPTIONS: { value: TestEmailType; label: string; description: string }[] = [
    { value: 'welcome', label: 'Account Created (Welcome)', description: 'Sent right after a successful signup.' },
    { value: 'password_reset', label: 'Password Reset Link', description: 'Sent when a user requests a password reset.' },
    { value: 'password_changed', label: 'Password Changed', description: 'Sent after a password has been reset.' },
    { value: 'submission_received', label: 'Submission Received', description: 'Sent right after a new manuscript is submitted.' },
    { value: 'returned_for_correction', label: 'Returned for Correction', description: 'Sent when the editorial office requests pre-review fixes.' },
    { value: 'revision_required', label: 'Revision Required', description: 'Sent when a reviewer decision requires changes.' },
    { value: 'revision_received', label: 'Revision Submitted (Author)', description: 'Sent to the author confirming their revision went through.' },
    { value: 'acceptance', label: 'Paper Accepted', description: 'Sent when a manuscript is accepted after review.' },
    { value: 'rejection', label: 'Submission Rejected', description: 'Sent when a manuscript is rejected.' },
    { value: 'final_returned', label: 'Final Version Returned', description: 'Sent when a final submission needs changes.' },
    { value: 'final_submission_received', label: 'Final Submission Received (Admin)', description: 'Sent to admins when an author submits their final version.' },
    { value: 'publication_approval', label: 'Approved for Publication', description: 'Sent when a final version is approved.' },
    { value: 'contact_message', label: 'Public Contact Form', description: 'Sent when a visitor uses the public contact form.' },
    { value: 'all', label: 'All of the above', description: 'Sends every template above, one after another.' },
]

const PAGE_SIZE_OPTIONS = [10, 50, 100, 500]

const AdminEmailLog: React.FC = () => {
    const [rows, setRows] = useState<EmailLogRow[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [testEmail, setTestEmail] = useState('')
    const [testType, setTestType] = useState<TestEmailType>('welcome')
    const [sending, setSending] = useState(false)
    const [sendError, setSendError] = useState('')
    const [sendSuccess, setSendSuccess] = useState('')

    const [viewing, setViewing] = useState<EmailLogRow | null>(null)

    const refresh = () => {
        setLoading(true)
        listEmailLog(page, pageSize)
            .then(({ rows, total }) => {
                setRows(rows)
                setTotal(total)
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(refresh, [page, pageSize])

    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    const pageStart = total === 0 ? 0 : page * pageSize + 1
    const pageEnd = Math.min((page + 1) * pageSize, total)

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setPage(0)
    }

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!testEmail.trim() || sending) return

        setSending(true)
        setSendError('')
        setSendSuccess('')
        try {
            await sendTestEmail(testEmail.trim(), testType)
            setSendSuccess(`Sent to ${testEmail.trim()}. Check the log below shortly.`)
            setPage(0)
            refresh()
        } catch (err) {
            setSendError((err as Error).message || 'Could not send the test email.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Email Delivery Log</h1>
                    <p className="text-sm text-body">
                        Every notification email the system has attempted to send.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) {
                        setSendError('')
                        setSendSuccess('')
                    }
                }}>
                    <Button
                        className="flex items-center gap-2 shrink-0"
                        onClick={() => setDialogOpen(true)}
                    >
                        <Send className="h-4 w-4" />
                        <span>Send Test Email</span>
                    </Button>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                <span>Send Test Email</span>
                            </DialogTitle>
                            <DialogDescription>
                                Sends a real copy of the chosen template through the same
                                SMTP path real users get -- use this to verify delivery and
                                formatting, not just preview it.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSendTest} className="space-y-5">
                            {sendError && <Alert showIcon type="danger">{sendError}</Alert>}
                            {sendSuccess && <Alert showIcon type="success">{sendSuccess}</Alert>}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Send to</label>
                                <Input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Which email?</label>
                                <div className="relative">
                                    <select
                                        value={testType}
                                        onChange={(e) => setTestType(e.target.value as TestEmailType)}
                                        className="w-full h-11 appearance-none rounded-md border border-hairline-strong bg-canvas pl-3 pr-10 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                                    >
                                        {TEST_EMAIL_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-4 w-4 text-body absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <p className="text-xs text-body">
                                    {TEST_EMAIL_OPTIONS.find((o) => o.value === testType)?.description}
                                </p>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={sending} className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    <span>{sending ? 'Sending…' : 'Send'}</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                    <CardTitle>All Attempts ({total})</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-body">
                        <span>Rows per page</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="rounded-md border border-hairline-strong bg-canvas px-2 py-1 text-xs text-ink focus:outline-none"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-sm text-body">Loading…</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {!loading && !error && rows.length === 0 && (
                        <p className="text-sm text-body">No emails sent yet.</p>
                    )}
                    {!loading && rows.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead className="text-right">Content</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.to_email}</TableCell>
                                        <TableCell className="max-w-[20rem] truncate">{r.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant={r.status === 'sent' ? 'success' : 'destructive'}>
                                                {r.status}
                                            </Badge>
                                            {r.error_message && (
                                                <p className="text-[11px] text-red-500 mt-1">{r.error_message}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-body">
                                            {new Date(r.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1.5"
                                                disabled={!r.body_html}
                                                onClick={() => setViewing(r)}
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
                {!loading && total > 0 && (
                    <div className="px-6 py-3 border-t border-hairline flex items-center justify-between gap-4">
                        <p className="text-xs text-body">
                            Showing {pageStart} to {pageEnd} of {total} result{total === 1 ? '' : 's'}
                        </p>
                        {pageCount > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page <= 0}
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    className="gap-1"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                                </Button>
                                <span className="text-xs text-body">
                                    Page {page + 1} of {pageCount}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={page >= pageCount - 1}
                                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                                    className="gap-1"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
                <DialogContent className="max-w-[40rem]">
                    <DialogHeader>
                        <DialogTitle>{viewing?.subject}</DialogTitle>
                        <DialogDescription>
                            To {viewing?.to_email} · {viewing && new Date(viewing.created_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    {viewing?.body_html && (
                        <iframe
                            title="Email content"
                            srcDoc={viewing.body_html}
                            sandbox=""
                            className="w-full h-[28rem] rounded-md border border-hairline-strong bg-white"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminEmailLog
