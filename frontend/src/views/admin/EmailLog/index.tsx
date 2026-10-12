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
import { Send, Mail, ChevronDown } from 'lucide-react'
import { listEmailLog, sendTestEmail } from '@/services/supabase/emailLog'
import type { EmailLogRow, TestEmailType } from '@/services/supabase/emailLog'

const TEST_EMAIL_OPTIONS: { value: TestEmailType; label: string; description: string }[] = [
    { value: 'welcome', label: 'Account Created (Welcome)', description: 'Sent right after a successful signup.' },
    { value: 'password_reset', label: 'Password Reset Link', description: 'Sent when a user requests a password reset.' },
    { value: 'password_changed', label: 'Password Changed', description: 'Sent after a password has been reset.' },
    { value: 'all', label: 'All of the above', description: 'Sends all three templates, one after another.' },
]

const AdminEmailLog: React.FC = () => {
    const [rows, setRows] = useState<EmailLogRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [testEmail, setTestEmail] = useState('')
    const [testType, setTestType] = useState<TestEmailType>('welcome')
    const [sending, setSending] = useState(false)
    const [sendError, setSendError] = useState('')
    const [sendSuccess, setSendSuccess] = useState('')

    const refresh = () => {
        setLoading(true)
        listEmailLog()
            .then(setRows)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(refresh, [])

    const failedCount = rows.filter((r) => r.status === 'failed').length

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!testEmail.trim() || sending) return

        setSending(true)
        setSendError('')
        setSendSuccess('')
        try {
            await sendTestEmail(testEmail.trim(), testType)
            setSendSuccess(`Sent to ${testEmail.trim()}. Check the log below shortly.`)
            refresh()
        } catch (err) {
            setSendError((err as Error).message || 'Could not send the test email.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink">Email Delivery Log</h1>
                    <p className="text-sm text-body">
                        Every notification email the system has attempted to send
                        (most recent 200). {failedCount > 0 && (
                            <span className="text-red-500 font-semibold">
                                {failedCount} failed.
                            </span>
                        )}
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
                <CardHeader><CardTitle>Recent Attempts</CardTitle></CardHeader>
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

export default AdminEmailLog
