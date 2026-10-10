import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import { Plus, Trash2, UploadCloud } from 'lucide-react'
import { useAuth } from '@/auth'
import { createSubmission } from '@/services/supabase/workflow'
import type { CoAuthorInput } from '@/services/supabase/workflow'

const MAX_AUTHORS = 6
const MAX_FILE_SIZE = 25 * 1024 * 1024
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const emptyAuthor = (correspondingAuthor = false): CoAuthorInput => ({
    name: '',
    email: '',
    affiliation: '',
    institution: '',
    correspondingAuthor,
})

const NewSubmission: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [title, setTitle] = useState('')
    const [abstract, setAbstract] = useState('')
    const [keywordsInput, setKeywordsInput] = useState('')
    const [category, setCategory] = useState('')
    const [journalSection, setJournalSection] = useState('')
    const [coAuthors, setCoAuthors] = useState<CoAuthorInput[]>([
        emptyAuthor(true),
    ])
    const [file, setFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const updateAuthor = (idx: number, patch: Partial<CoAuthorInput>) => {
        setCoAuthors((prev) =>
            prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
        )
    }

    const addAuthor = () => {
        if (coAuthors.length >= MAX_AUTHORS) return
        setCoAuthors((prev) => [...prev, emptyAuthor()])
    }

    const removeAuthor = (idx: number) => {
        setCoAuthors((prev) => prev.filter((_, i) => i !== idx))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null
        setFileError('')
        if (!selected) {
            setFile(null)
            return
        }
        if (!ALLOWED_TYPES.includes(selected.type)) {
            setFileError('Manuscript must be a PDF or Word document (.pdf, .doc, .docx).')
            setFile(null)
            return
        }
        if (selected.size > MAX_FILE_SIZE) {
            setFileError('Manuscript file must be under 25MB.')
            setFile(null)
            return
        }
        setFile(selected)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!title.trim() || !abstract.trim()) {
            setError('Title and abstract are required.')
            return
        }
        if (coAuthors.some((a) => !a.name.trim() || !a.email.trim())) {
            setError('Every author needs a name and email.')
            return
        }
        if (!coAuthors.some((a) => a.correspondingAuthor)) {
            setError('Please mark one author as the corresponding author.')
            return
        }
        if (!file) {
            setError('Please attach your manuscript file.')
            return
        }

        setSubmitting(true)
        try {
            const result = await createSubmission({
                title,
                abstract,
                keywords: keywordsInput
                    .split(',')
                    .map((k) => k.trim())
                    .filter(Boolean),
                category: category || undefined,
                journalSection: journalSection || undefined,
                coAuthors,
                file,
            })
            navigate(`/author/submissions/${result.submissionId}`)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-ink">Submit New Manuscript</h1>
                <p className="text-sm text-body">
                    Signed in as {user?.email}. Fields marked required must be
                    completed before editorial review can begin.
                </p>
            </div>

            {error && (
                <Alert showIcon type="danger">
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Manuscript Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Title *</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Abstract *</label>
                            <textarea
                                rows={5}
                                className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Category</label>
                                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Computer Science & Security" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Journal Section</label>
                                <Input value={journalSection} onChange={(e) => setJournalSection(e.target.value)} placeholder="e.g. Research Article" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Keywords (comma-separated)</label>
                            <Input value={keywordsInput} onChange={(e) => setKeywordsInput(e.target.value)} placeholder="e.g. machine learning, robotics, IoT" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Authors ({coAuthors.length}/{MAX_AUTHORS})</CardTitle>
                        <Button type="button" size="sm" variant="outline" onClick={addAuthor} disabled={coAuthors.length >= MAX_AUTHORS}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Author
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {coAuthors.map((author, idx) => (
                            <div key={idx} className="p-4 border border-hairline rounded-xl space-y-3 bg-surface-card">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                        Author {idx + 1}
                                    </span>
                                    {coAuthors.length > 1 && (
                                        <Button type="button" size="sm" variant="ghost" onClick={() => removeAuthor(idx)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input placeholder="Full name *" value={author.name} onChange={(e) => updateAuthor(idx, { name: e.target.value })} required />
                                    <Input type="email" placeholder="Email *" value={author.email} onChange={(e) => updateAuthor(idx, { email: e.target.value })} required />
                                    <Input placeholder="Affiliation" value={author.affiliation} onChange={(e) => updateAuthor(idx, { affiliation: e.target.value })} />
                                    <Input placeholder="Institution" value={author.institution} onChange={(e) => updateAuthor(idx, { institution: e.target.value })} />
                                </div>
                                <label className="flex items-center gap-2 text-xs font-medium text-ink">
                                    <input
                                        type="radio"
                                        name="correspondingAuthor"
                                        checked={Boolean(author.correspondingAuthor)}
                                        onChange={() =>
                                            setCoAuthors((prev) =>
                                                prev.map((a, i) => ({
                                                    ...a,
                                                    correspondingAuthor: i === idx,
                                                })),
                                            )
                                        }
                                    />
                                    Corresponding author
                                </label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Manuscript File</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <label className="p-6 border-2 border-dashed border-hairline-strong rounded-lg flex flex-col items-center gap-2 cursor-pointer bg-canvas-soft block">
                            <UploadCloud className="h-8 w-8 text-primary" />
                            <span className="text-sm font-medium text-ink">
                                {file ? file.name : 'Click to choose a PDF, DOC, or DOCX file'}
                            </span>
                            <span className="text-xs text-body">Max file size 25MB</span>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        {fileError && <p className="text-xs text-red-500 mt-2">{fileError}</p>}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate('/author/submissions')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Submit for Editorial Review'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default NewSubmission
