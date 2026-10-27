import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Crown, Award, UserCheck, ArrowDown, GripVertical } from 'lucide-react'
import {
    listEditorialBoardMembers,
    createEditorialBoardMember,
    updateEditorialBoardMember,
    deleteEditorialBoardMember,
    reorderEditorialBoardMembers,
    EDITORIAL_BOARD_ROLE_LABELS,
} from '@/services/supabase/editorialBoard'
import type { EditorialBoardMember, EditorialBoardRole } from '@/services/supabase/editorialBoard'

const ROLE_ORDER: EditorialBoardRole[] = ['EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR_IN_CHIEF', 'EDITOR']
const ROLE_ICON: Record<EditorialBoardRole, typeof Crown> = {
    EDITOR_IN_CHIEF: Crown,
    ASSOCIATE_EDITOR_IN_CHIEF: Award,
    EDITOR: UserCheck,
}

type DraftState = {
    name: string
    role: EditorialBoardRole
    position: string
    department: string
}

const emptyDraft = (role: EditorialBoardRole = 'EDITOR'): DraftState => ({
    name: '',
    role,
    position: '',
    department: '',
})

const AdminEditorialBoard: React.FC = () => {
    const [members, setMembers] = useState<EditorialBoardMember[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [draggedId, setDraggedId] = useState<string | null>(null)
    const [dragOverId, setDragOverId] = useState<string | null>(null)
    const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after'>('before')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [draft, setDraft] = useState<DraftState>(emptyDraft())
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const refresh = () => {
        setLoading(true)
        listEditorialBoardMembers()
            .then(setMembers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(refresh, [])

    const openAddDialog = (role: EditorialBoardRole) => {
        setEditingId(null)
        setDraft(emptyDraft(role))
        setFormError('')
        setDialogOpen(true)
    }

    const openEditDialog = (member: EditorialBoardMember) => {
        setEditingId(member.id)
        setDraft({
            name: member.name,
            role: member.role,
            position: member.position ?? '',
            department: member.department ?? '',
        })
        setFormError('')
        setDialogOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!draft.name.trim()) return setFormError('Name is required.')
        setSaving(true)
        setFormError('')
        try {
            const payload = {
                name: draft.name.trim(),
                role: draft.role,
                position: draft.position.trim() || undefined,
                department: draft.department.trim() || undefined,
            }
            if (editingId) {
                const updated = await updateEditorialBoardMember(editingId, payload)
                setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
            } else {
                const inRole = members.filter((m) => m.role === draft.role)
                const nextOrder = inRole.length > 0 ? Math.max(...inRole.map((m) => m.display_order)) + 1 : 0
                const created = await createEditorialBoardMember({ ...payload, displayOrder: nextOrder })
                setMembers((prev) => [...prev, created])
            }
            setDialogOpen(false)
        } catch (err) {
            setFormError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        setError('')
        try {
            await deleteEditorialBoardMember(id)
            setPendingDeleteId(null)
            setMembers((prev) => prev.filter((m) => m.id !== id))
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setDeletingId(null)
        }
    }

    // The dragged id travels through the native DataTransfer object, not
    // React state -- state set from onDragStart isn't guaranteed to have
    // committed/re-rendered by the time onDrop's closure runs (the two
    // can fire in the same tick), so reading it back out of state here
    // risked seeing a stale (null) value. DataTransfer is populated and
    // read synchronously on the same native event pair, so it can't race.
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id)
        e.dataTransfer.effectAllowed = 'move'
        setDraggedId(id)
    }

    // Which half of the hovered row the pointer is over decides whether
    // the dragged item lands above or below it -- without this, dropping
    // "on" a row always inserted before it, so dragging something down
    // past its target and dropping felt like it landed in the wrong spot
    // (or, at the very top of the list, that it hadn't moved at all).
    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        const position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
        if (id !== dragOverId) setDragOverId(id)
        if (position !== dragOverPosition) setDragOverPosition(position)
    }

    const handleDragEnd = () => {
        setDraggedId(null)
        setDragOverId(null)
    }

    const handleDrop = async (e: React.DragEvent, role: EditorialBoardRole, targetId: string) => {
        e.preventDefault()
        const sourceId = e.dataTransfer.getData('text/plain')
        // Computed fresh from this event's own coordinates, not read back
        // out of dragOverPosition state -- same race as draggedId above:
        // the dragover that set that state and this drop can land in the
        // same tick, before React has re-rendered with the new value.
        const rect = e.currentTarget.getBoundingClientRect()
        const position: 'before' | 'after' = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
        setDraggedId(null)
        setDragOverId(null)
        if (!sourceId || sourceId === targetId) return

        const inRole = members.filter((m) => m.role === role)
        const fromIdx = inRole.findIndex((m) => m.id === sourceId)
        if (fromIdx === -1 || inRole.findIndex((m) => m.id === targetId) === -1) return

        const reordered = [...inRole]
        const [moved] = reordered.splice(fromIdx, 1)
        // Recompute the target's index *after* removing the dragged item --
        // removing it can shift the target left by one, so looking it up
        // fresh (rather than reusing the pre-removal index) is what keeps
        // "drop at the top" actually land at index 0.
        const targetIdx = reordered.findIndex((m) => m.id === targetId)
        const insertAt = position === 'after' ? targetIdx + 1 : targetIdx
        reordered.splice(insertAt, 0, moved)
        const orderedIds = reordered.map((m) => m.id)

        // Optimistic: apply the new sequential order to local state
        // immediately so the list reorders instantly.
        const previousMembers = members
        setMembers((prev) =>
            prev.map((m) => {
                const newIndex = orderedIds.indexOf(m.id)
                return newIndex === -1 ? m : { ...m, display_order: newIndex }
            }),
        )
        setError('')
        try {
            await reorderEditorialBoardMembers(orderedIds)
        } catch (err) {
            setMembers(previousMembers)
            setError((err as Error).message)
        }
    }

    // Sorted by display_order on every render, not just on fetch --
    // reorder-related state updates only ever change each member's
    // display_order value in place, never their position in the
    // `members` array itself, so without re-sorting here the rendered
    // list would keep showing the pre-drag order until the next full
    // reload even though the underlying data (and the database) is
    // already correct.
    const grouped = ROLE_ORDER.map((role) => ({
        role,
        items: members
            .filter((m) => m.role === role)
            .sort((a, b) => a.display_order - b.display_order),
    }))

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-ink">Manage Editorial Board</h1>
                <p className="text-sm text-body">
                    Add, edit, remove, and reorder the Editor-in-Chief, Associate Editor-in-Chief,
                    and Editors shown on the public Editorial Board page.
                </p>
            </div>

            {error && <Alert showIcon type="danger">{error}</Alert>}

            {loading && <p className="text-sm text-body">Loading…</p>}

            {!loading && grouped.map(({ role, items }) => {
                const Icon = ROLE_ICON[role]
                return (
                    <Card key={role}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-primary" />
                                {EDITORIAL_BOARD_ROLE_LABELS[role]}
                                <Badge variant="secondary" className="font-bold text-xs">{items.length}</Badge>
                            </CardTitle>
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openAddDialog(role)}>
                                <Plus className="h-3.5 w-3.5" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {items.length === 0 && (
                                <p className="text-sm text-body">No one in this role yet.</p>
                            )}
                            {items.map((m) => {
                                const isDragTarget = dragOverId === m.id && draggedId !== null && draggedId !== m.id
                                return (
                                <div
                                    key={m.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, m.id)}
                                    onDragOver={(e) => handleDragOver(e, m.id)}
                                    onDragEnd={handleDragEnd}
                                    onDrop={(e) => handleDrop(e, role, m.id)}
                                    className={`relative p-3 border rounded-lg flex items-center justify-between gap-3 transition-colors ${
                                        draggedId === m.id ? 'opacity-40 border-hairline' : 'border-hairline'
                                    }`}
                                >
                                    {/* Drop indicator -- a line showing exactly above or
                                        below this row where the dragged item will land. */}
                                    {isDragTarget && (
                                        <div
                                            className={`absolute left-0 right-0 h-0.5 bg-primary rounded-full ${
                                                dragOverPosition === 'before' ? '-top-1' : '-bottom-1'
                                            }`}
                                        />
                                    )}
                                    <div
                                        title="Drag to reorder"
                                        className="cursor-grab active:cursor-grabbing text-body hover:text-ink shrink-0 touch-none"
                                    >
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-ink truncate">{m.name}</p>
                                        {m.position && (
                                            <p className="text-xs text-body truncate">{m.position}</p>
                                        )}
                                        {m.department && (
                                            <p className="text-xs text-body/70 truncate">{m.department}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5"
                                            onClick={() => openEditDialog(m)}
                                        >
                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                        {pendingDeleteId === m.id ? (
                                            <>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingId === m.id}
                                                    onClick={() => handleDelete(m.id)}
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={deletingId === m.id}
                                                    onClick={() => setPendingDeleteId(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1.5 text-red-500 hover:text-red-600"
                                                onClick={() => setPendingDeleteId(m.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                )
            })}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-[28rem]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Member' : 'Add Member'}</DialogTitle>
                        <DialogDescription>
                            Changes appear on the public Editorial Board page immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-3">
                        {formError && <Alert showIcon type="danger">{formError}</Alert>}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Name *</label>
                            <Input
                                value={draft.name}
                                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                placeholder="Prof. (Dr.) Jane Doe"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Role *</label>
                            <div className="relative">
                                <select
                                    value={draft.role}
                                    onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as EditorialBoardRole }))}
                                    className="w-full h-10 appearance-none rounded-md border border-hairline-strong bg-canvas pl-3 pr-10 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                                >
                                    {ROLE_ORDER.map((r) => (
                                        <option key={r} value={r}>{EDITORIAL_BOARD_ROLE_LABELS[r]}</option>
                                    ))}
                                </select>
                                <ArrowDown className="h-4 w-4 text-body absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Position</label>
                            <Input
                                value={draft.position}
                                onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))}
                                placeholder="e.g. Dean"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Department</label>
                            <Input
                                value={draft.department}
                                onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))}
                                placeholder="e.g. Department of Computing and Informatics"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Member'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AdminEditorialBoard
