import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/auth'
import { 
    Plus, 
    FileText, 
    Clock, 
    CheckCircle, 
    Eye, 
    RefreshCw,
    UploadCloud,
    Sparkles
} from 'lucide-react'

interface Manuscript {
    id: string
    title: string
    track: string
    submittedDate: string
    status: 'Under Review' | 'Revision Requested' | 'Accepted' | 'In Editorial Review'
    reviewersCount: number
    lastUpdated: string
}

const AuthorDashboard: React.FC = () => {
    const { user } = useAuth()
    const authorName = user?.userName || 'Prof. Alex Rivera'

    const [manuscripts, setManuscripts] = useState<Manuscript[]>([
        {
            id: 'JERI-2026-089',
            title: 'Zero-Knowledge Cryptographic Verification in Decentralized AI Model Sharing',
            track: 'Computer Science & Security',
            submittedDate: '2026-07-28',
            status: 'Under Review',
            reviewersCount: 3,
            lastUpdated: '2 days ago'
        },
        {
            id: 'JERI-2026-064',
            title: 'High-Efficiency Perovskite Tandem Solar Cells with 32.4% Power Conversion',
            track: 'Clean Energy & Materials',
            submittedDate: '2026-06-15',
            status: 'Revision Requested',
            reviewersCount: 2,
            lastUpdated: 'Yesterday'
        },
        {
            id: 'JERI-2026-012',
            title: 'Autonomous Multi-Agent Robotic Swarms for Space Exploration',
            track: 'Robotics & Control Systems',
            submittedDate: '2026-04-10',
            status: 'Accepted',
            reviewersCount: 4,
            lastUpdated: '3 weeks ago'
        }
    ])

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [newTitle, setNewTitle] = useState<string>('')
    const [newTrack, setNewTrack] = useState<string>('Computer Science & AI')
    const [newAbstract, setNewAbstract] = useState<string>('')

    const handleCreateSubmission = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle.trim()) return

        const newManuscript: Manuscript = {
            id: `JERI-2026-${Math.floor(100 + Math.random() * 900)}`,
            title: newTitle,
            track: newTrack,
            submittedDate: new Date().toISOString().split('T')[0],
            status: 'In Editorial Review',
            reviewersCount: 0,
            lastUpdated: 'Just now'
        }

        setManuscripts([newManuscript, ...manuscripts])
        setNewTitle('')
        setNewAbstract('')
        setIsDialogOpen(false)
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
                <div>
                    <div className="flex items-center gap-2 text-caption-uppercase text-text-link">
                        <Sparkles className="h-4 w-4" />
                        <span>Author Persona Workspace</span>
                    </div>
                    <h1 className="text-display-lg text-ink dark:text-on-dark font-semibold mt-1">
                        Welcome back, {authorName}
                    </h1>
                    <p className="text-body-sm text-body dark:text-on-dark-soft">
                        Track your manuscript submissions, review notifications, and submit new research.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    <span>Submit New Manuscript</span>
                </Button>
            </div>

            {/* Author Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <FileText className="h-4 w-4 text-text-link" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{manuscripts.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime articles submitted</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {manuscripts.filter(m => m.status === 'Under Review' || m.status === 'In Editorial Review').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Active peer reviews</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revisions Needed</CardTitle>
                        <RefreshCw className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {manuscripts.filter(m => m.status === 'Revision Requested').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Action required by author</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accepted & Published</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {manuscripts.filter(m => m.status === 'Accepted').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Published in JERI</p>
                    </CardContent>
                </Card>
            </div>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>My Manuscripts</CardTitle>
                    <p className="text-sm text-body dark:text-on-dark-soft">
                        Manage ongoing submissions and view reviewer decision reports.
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Manuscript ID & Title</TableHead>
                                <TableHead>Field Track</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Review Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {manuscripts.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell className="space-y-1">
                                        <div className="text-xs text-text-link font-semibold">{m.id}</div>
                                        <div className="text-sm font-medium text-ink dark:text-on-dark line-clamp-1">{m.title}</div>
                                    </TableCell>
                                    <TableCell>{m.track}</TableCell>
                                    <TableCell>{m.submittedDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            m.status === 'Accepted' ? 'success' :
                                            m.status === 'Revision Requested' ? 'purple' :
                                            m.status === 'Under Review' ? 'warning' : 'default'
                                        }>
                                            {m.status} ({m.reviewersCount} reviewers)
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="text-text-link gap-1">
                                            <Eye className="h-3.5 w-3.5" /> View Decision
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Submission Dialog Component */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit New Research Manuscript</DialogTitle>
                        <p className="text-sm text-body dark:text-on-dark-soft">
                            Enter details for double-blind peer review evaluation.
                        </p>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmission} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Manuscript Title</label>
                            <Input 
                                placeholder="e.g. Scalable Machine Learning Architectures for Edge Devices" 
                                value={newTitle} 
                                onChange={(e) => setNewTitle(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Research Track</label>
                            <select 
                                className="w-full rounded-md border border-hairline-strong bg-canvas dark:bg-surface-dark px-3 py-2 text-sm text-ink dark:text-on-dark focus:outline-none"
                                value={newTrack}
                                onChange={(e) => setNewTrack(e.target.value)}
                            >
                                <option>Computer Science & AI</option>
                                <option>Quantum Physics & Materials</option>
                                <option>Biotechnology & Life Sciences</option>
                                <option>Renewable Energy & Environment</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Abstract (200-250 words)</label>
                            <textarea 
                                rows={4}
                                className="w-full rounded-md border border-hairline-strong bg-canvas dark:bg-surface-dark p-3 text-sm text-ink dark:text-on-dark focus:outline-none"
                                placeholder="Provide a summary of problem statement, methodology, and key experimental findings..."
                                value={newAbstract}
                                onChange={(e) => setNewAbstract(e.target.value)}
                                required
                            />
                        </div>

                        <div className="p-4 border-2 border-dashed border-hairline-strong rounded-lg text-center space-y-2 cursor-pointer bg-canvas-soft dark:bg-surface-strong">
                            <UploadCloud className="h-8 w-8 text-text-link mx-auto" />
                            <div className="text-sm font-medium text-ink dark:text-on-dark">
                                Upload Manuscript Source File (PDF / TeX / DOCX)
                            </div>
                            <div className="text-xs text-body dark:text-on-dark-soft">Max file size 25MB</div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Submit for Editorial Review
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AuthorDashboard
