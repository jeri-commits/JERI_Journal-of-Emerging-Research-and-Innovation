import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/auth'
import { 
    Users, 
    FileCheck, 
    Clock, 
    ShieldCheck, 
    CheckCircle2, 
    Sparkles
} from 'lucide-react'

interface AdminSubmission {
    id: string
    title: string
    author: string
    track: string
    submittedDate: string
    status: 'Pending Assignment' | 'In Peer Review' | 'Decision Needed' | 'Published'
    reviewersAssigned: number
}

interface UserAccount {
    id: string
    name: string
    email: string
    role: 'admin' | 'author'
    status: 'Active' | 'Pending Verification'
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth()
    const adminName = user?.userName || 'Dr. Sarah Jenkins'

    const [submissions, setSubmissions] = useState<AdminSubmission[]>([
        {
            id: 'JERI-2026-089',
            title: 'Zero-Knowledge Cryptographic Verification in Decentralized AI Model Sharing',
            author: 'Prof. Alex Rivera',
            track: 'Computer Science & Security',
            submittedDate: '2026-07-28',
            status: 'Decision Needed',
            reviewersAssigned: 3
        },
        {
            id: 'JERI-2026-092',
            title: 'Photonic Quantum Interconnects for Distributed Supercomputing',
            author: 'Dr. Michael Chen',
            track: 'Quantum Physics',
            submittedDate: '2026-08-01',
            status: 'Pending Assignment',
            reviewersAssigned: 0
        },
        {
            id: 'JERI-2026-064',
            title: 'High-Efficiency Perovskite Tandem Solar Cells with 32.4% Power Conversion',
            author: 'Dr. Elena Rostova',
            track: 'Clean Energy & Materials',
            submittedDate: '2026-06-15',
            status: 'In Peer Review',
            reviewersAssigned: 2
        }
    ])

    const [users] = useState<UserAccount[]>([
        {
            id: 'USR-01',
            name: 'Dr. Sarah Jenkins',
            email: 'admin@jeri.org',
            role: 'admin',
            status: 'Active'
        },
        {
            id: 'USR-02',
            name: 'Prof. Alex Rivera',
            email: 'author@jeri.org',
            role: 'author',
            status: 'Active'
        },
        {
            id: 'USR-03',
            name: 'Dr. Michael Chen',
            email: 'm.chen@mit.edu',
            role: 'author',
            status: 'Active'
        }
    ])

    const handleUpdateStatus = (id: string, newStatus: AdminSubmission['status']) => {
        setSubmissions(submissions.map(s => s.id === id ? { ...s, status: newStatus, reviewersAssigned: newStatus === 'In Peer Review' ? Math.max(s.reviewersAssigned, 2) : s.reviewersAssigned } : s))
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-6">
                <div>
                    <div className="flex items-center gap-2 text-caption-uppercase text-purple-600 dark:text-purple-400 font-semibold">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin & Editorial Control Panel</span>
                    </div>
                    <h1 className="text-display-lg text-ink dark:text-on-dark font-semibold mt-1">
                        Welcome back, {adminName}
                    </h1>
                    <p className="text-body-sm text-body dark:text-on-dark-soft">
                        Manage global journal submissions, peer reviewer assignments, publication releases, and user roles.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button>
                        Publish Current Volume
                    </Button>
                </div>
            </div>

            {/* Admin Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Triage</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {submissions.filter(s => s.status === 'Pending Assignment' || s.status === 'Decision Needed').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Requires editorial action</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Peer Review</CardTitle>
                        <FileCheck className="h-4 w-4 text-text-link" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {submissions.filter(s => s.status === 'In Peer Review').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Under external evaluation</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Authors</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter(u => u.role === 'author').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Registered contributors</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published Papers</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground mt-1">Indexed in Scopus / WoS</p>
                    </CardContent>
                </Card>
            </div>

            {/* Editorial Triage Queue */}
            <Card>
                <CardHeader>
                    <CardTitle>Editorial Triage & Decision Queue</CardTitle>
                    <p className="text-sm text-body dark:text-on-dark-soft">
                        Assign external peer reviewers and issue formal editorial decisions.
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Manuscript</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Track</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Editorial Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="space-y-1">
                                        <div className="text-xs text-text-link font-semibold">{s.id}</div>
                                        <div className="text-sm font-medium text-ink dark:text-on-dark line-clamp-1">{s.title}</div>
                                    </TableCell>
                                    <TableCell>{s.author}</TableCell>
                                    <TableCell>{s.track}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            s.status === 'Decision Needed' ? 'purple' :
                                            s.status === 'Pending Assignment' ? 'warning' : 'default'
                                        }>
                                            {s.status} ({s.reviewersAssigned} reviewers)
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {s.status === 'Pending Assignment' && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(s.id, 'In Peer Review')}
                                            >
                                                Assign Reviewers
                                            </Button>
                                        )}
                                        {s.status === 'Decision Needed' && (
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleUpdateStatus(s.id, 'Published')}
                                            >
                                                Accept & Publish
                                            </Button>
                                        )}
                                        {s.status === 'In Peer Review' && (
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => handleUpdateStatus(s.id, 'Decision Needed')}
                                                className="text-text-link"
                                            >
                                                Log Decision
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Persona & User Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle>User Personas & Role Assignments</CardTitle>
                    <p className="text-sm text-body dark:text-on-dark-soft">
                        System user accounts and active authority personas.
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Email Address</TableHead>
                                <TableHead>Persona Role</TableHead>
                                <TableHead className="text-right">Account Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-mono text-xs">{u.id}</TableCell>
                                    <TableCell className="font-medium text-ink dark:text-on-dark">{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'admin' ? 'purple' : 'default'}>
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">{u.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminDashboard
