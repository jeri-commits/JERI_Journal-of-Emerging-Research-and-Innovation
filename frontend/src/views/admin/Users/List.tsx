import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/Alert'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/auth'
import { listAllUsers } from '@/services/supabase/adminUsers'
import { setUserRole } from '@/services/supabase/workflow'
import type { AdminUserRow } from '@/services/supabase/adminUsers'

const AdminUsersList: React.FC = () => {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<AdminUserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const load = () => {
        listAllUsers()
            .then(setUsers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const handleRoleChange = async (userId: string, role: 'admin' | 'author' | '') => {
        setUpdatingId(userId)
        setError('')
        try {
            await setUserRole(userId, role === '' ? null : role)
            load()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setUpdatingId(null)
        }
    }

    const filtered = users.filter((u) =>
        u.email.toLowerCase().includes(search.trim().toLowerCase()),
    )

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-ink">Users</h1>
                <p className="text-sm text-body">Every registered account and its role.</p>
            </div>

            {error && <Alert showIcon type="danger">{error}</Alert>}

            <Input
                placeholder="Search by email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            <Card>
                <CardHeader>
                    <CardTitle>Accounts ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-sm text-body">Loading…</p>}
                    {!loading && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium text-ink">{u.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={u.role === 'admin' ? 'purple' : u.role === 'author' ? 'default' : 'outline'}>
                                                    {u.role ?? 'Pending'}
                                                </Badge>
                                                <select
                                                    className="rounded-md border border-hairline-strong bg-canvas px-2 py-1 text-xs text-ink focus:outline-none disabled:opacity-50"
                                                    value={u.role ?? ''}
                                                    disabled={updatingId === u.id || u.id === currentUser?.userId}
                                                    onChange={(e) =>
                                                        handleRoleChange(u.id, e.target.value as 'admin' | 'author' | '')
                                                    }
                                                >
                                                    <option value="">No role</option>
                                                    <option value="author">Author</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-body">
                                            {new Date(u.created_at).toLocaleDateString()}
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

export default AdminUsersList
