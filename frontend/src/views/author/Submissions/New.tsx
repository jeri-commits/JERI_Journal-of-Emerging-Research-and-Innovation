import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import {
    Plus,
    Trash2,
    UploadCloud,
    ChevronDown,
    PlusCircle,
    FileEdit,
    CheckCircle2,
    FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth'
import { createSubmission, submitRevision, submitFinal } from '@/services/supabase/workflow'
import { findMySubmissionByCode } from '@/services/supabase/submissions'
import type { CoAuthorInput } from '@/services/supabase/workflow'

type SubmissionType = 'New Submission' | 'Revised Submission' | 'Final Submission'

const MAX_AUTHORS = 6
const MAX_FILE_SIZE = 25 * 1024 * 1024
const MANUSCRIPT_TYPES = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const PAPER_TYPES = [
    'Research Article',
    'Review Article',
    'Survey Article',
    'Short Communication',
    'Others',
]

const REVISABLE = ['MAJOR_REVISION', 'MINOR_REVISION']
const FINALIZABLE = ['ACCEPTED', 'RETURNED_FINAL']
const ABSTRACT_MIN_WORDS = 150
const ABSTRACT_MAX_WORDS = 300

function countWords(text: string): number {
    return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length
}

function parseKeywords(raw: string): string[] {
    return raw
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
}

const emptyAuthor = (correspondingAuthor = false): CoAuthorInput => ({
    name: '',
    email: '',
    department: '',
    institution: '',
    country: '',
    correspondingAuthor,
})

function validateFile(
    file: File,
    allowedTypes: string[],
    label: string,
): string {
    if (!allowedTypes.includes(file.type)) {
        return `${label} must be a Word document (.doc or .docx).`
    }
    if (file.size > MAX_FILE_SIZE) {
        return `${label} must be under 25MB.`
    }
    return ''
}

const Select: React.FC<{
    value: string
    onChange: (v: string) => void
    options: string[]
    placeholder?: string
    required?: boolean
    className?: string
}> = ({ value, onChange, options, placeholder = 'Select Option', required, className }) => (
    <div className={cn("relative w-full min-w-0", className)}>
        <select
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 sm:h-10 appearance-none rounded-md border border-hairline-strong bg-canvas pl-3 pr-8 text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-colors"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        <ChevronDown className="h-4 w-4 text-body absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
)

const FileDrop: React.FC<{
    file: File | null
    onChange: (f: File | null) => void
    accept: string
    label: string
    allowedTypes: string[]
    error: string
    setError: (e: string) => void
    description?: string
}> = ({ file, onChange, accept, label, allowedTypes, error, setError, description }) => (
    <div className="space-y-1 w-full min-w-0">
        <div className="flex items-center justify-between text-xs font-medium text-ink">
            <span className="truncate">{label}</span>
            {file && (
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="text-[11px] text-red-500 hover:text-red-700 font-normal shrink-0 ml-2 cursor-pointer"
                >
                    Remove
                </button>
            )}
        </div>
        <label className={`p-2.5 sm:p-3 border border-dashed rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
            file
                ? 'border-primary/50 bg-primary/5'
                : 'border-hairline-strong bg-canvas hover:bg-canvas-soft/80'
        }`}>
            <div className={`p-2 rounded-md shrink-0 ${file ? 'bg-primary text-white' : 'bg-surface-strong text-body'}`}>
                <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink truncate">
                    {file ? file.name : 'Choose file or drag here'}
                </p>
                <p className="text-[11px] text-body truncate">
                    {file
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready`
                        : (description || `Format: ${accept} (max 25MB)`)}
                </p>
            </div>
            <span className="text-[11px] font-medium text-primary px-2.5 py-1 rounded-md border border-primary/25 bg-primary/5 shrink-0 hidden sm:inline-block">
                {file ? 'Change' : 'Browse'}
            </span>
            <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null
                    setError('')
                    if (!selected) return onChange(null)
                    const err = validateFile(selected, allowedTypes, label)
                    if (err) {
                        setError(err)
                        return onChange(null)
                    }
                    onChange(selected)
                }}
            />
        </label>
        {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
)

const NewSubmission: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [submissionType, setSubmissionType] = useState<SubmissionType>('New Submission')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // ---- New Submission state ----
    const [title, setTitle] = useState('')
    const [abstract, setAbstract] = useState('')
    const [keywords, setKeywords] = useState('')
    const [paperType, setPaperType] = useState('')
    const submissionMode = 'Regular'
    const [coAuthors, setCoAuthors] = useState<CoAuthorInput[]>([emptyAuthor(true)])
    const [contactPhone, setContactPhone] = useState('')
    const [addressLine1, setAddressLine1] = useState('')
    const [addressLine2, setAddressLine2] = useState('')
    const [city, setCity] = useState('')
    const [stateProvince, setStateProvince] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [contactCountry, setContactCountry] = useState('')
    const [manuscriptFile, setManuscriptFile] = useState<File | null>(null)
    const [manuscriptFileError, setManuscriptFileError] = useState('')

    // ---- Revised / Final shared lookup state ----
    const [manuscriptId, setManuscriptId] = useState('')
    const [registeredEmail, setRegisteredEmail] = useState(user?.email || '')
    const [rTitle, setRTitle] = useState('')
    const [rAbstract, setRAbstract] = useState('')
    const [rKeywords, setRKeywords] = useState('')
    const [rFile, setRFile] = useState<File | null>(null)
    const [rFileError, setRFileError] = useState('')

    // Auto pre-populate user details for initial author & email
    useEffect(() => {
        if (user?.email && !registeredEmail) {
            setRegisteredEmail(user.email)
        }
        if (user && coAuthors.length === 1 && !coAuthors[0].name && !coAuthors[0].email) {
            setCoAuthors([{
                name: user.userName || '',
                email: user.email || '',
                department: '',
                institution: '',
                country: '',
                correspondingAuthor: true,
            }])
        }
    }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

    const updateAuthor = (idx: number, patch: Partial<CoAuthorInput>) => {
        setCoAuthors((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)))
    }
    const addAuthor = () => {
        if (coAuthors.length >= MAX_AUTHORS) return
        setCoAuthors((prev) => [...prev, emptyAuthor()])
    }
    const removeAuthor = (idx: number) => {
        setCoAuthors((prev) => prev.filter((_, i) => i !== idx))
    }

    const handleNewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!title.trim() || !abstract.trim()) return setError('Title and abstract are required.')
        const abstractWords = countWords(abstract)
        if (abstractWords < ABSTRACT_MIN_WORDS || abstractWords > ABSTRACT_MAX_WORDS) {
            return setError(`Abstract must be between ${ABSTRACT_MIN_WORDS} and ${ABSTRACT_MAX_WORDS} words (currently ${abstractWords}).`)
        }
        const keywordList = parseKeywords(keywords)
        if (keywordList.length === 0) return setError('Please provide at least one keyword.')
        if (!paperType) return setError('Please select a paper type.')
        if (coAuthors.some((a) => !a.name.trim() || !a.email.trim() || !a.department?.trim() || !a.institution?.trim() || !a.country?.trim())) {
            return setError('Every author needs a name, email, department, institution, and country.')
        }
        if (!coAuthors.some((a) => a.correspondingAuthor)) {
            return setError('Please mark one author as the corresponding author.')
        }
        if (!contactPhone.trim() || !addressLine1.trim() || !city.trim() || !stateProvince.trim() || !postalCode.trim() || !contactCountry.trim()) {
            return setError('Contact number, address line 1, city, state/province, pin/zip code, and country are required.')
        }
        if (!manuscriptFile) return setError('Please attach your manuscript file.')

        setSubmitting(true)
        try {
            const result = await createSubmission({
                title,
                abstract,
                paperType,
                submissionMode,
                keywords: keywordList,
                coAuthors,
                contactPhone,
                addressLine1,
                addressLine2: addressLine2 || undefined,
                city,
                stateProvince,
                postalCode,
                contactCountry,
                file: manuscriptFile,
            })
            navigate(`/author/submissions/${result.submissionId}`)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSubmitting(false)
        }
    }

    const resolveLookup = async (expectedStatuses: string[], label: string) => {
        if (!manuscriptId.trim()) throw new Error('Manuscript ID is required.')
        if (!registeredEmail.trim()) throw new Error('Registered email is required.')
        const submission = await findMySubmissionByCode(manuscriptId.trim())
        if (!submission) {
            throw new Error('No submission found with that Manuscript ID on your account.')
        }
        if (submission.author_id !== user?.userId || registeredEmail.trim().toLowerCase() !== user?.email?.toLowerCase()) {
            throw new Error('That Manuscript ID and registered email do not match your account.')
        }
        if (!expectedStatuses.includes(submission.status)) {
            throw new Error(`This paper is not currently eligible for ${label} (current status: ${submission.status}).`)
        }
        return submission
    }

    const handleRevisedSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!rTitle.trim() || !rAbstract.trim()) return setError('Manuscript title and abstract are required.')
        const revisedWords = countWords(rAbstract)
        if (revisedWords < ABSTRACT_MIN_WORDS || revisedWords > ABSTRACT_MAX_WORDS) {
            return setError(`Abstract must be between ${ABSTRACT_MIN_WORDS} and ${ABSTRACT_MAX_WORDS} words (currently ${revisedWords}).`)
        }
        const revisedKeywords = parseKeywords(rKeywords)
        if (revisedKeywords.length === 0) return setError('Please provide at least one keyword.')
        if (!rFile) return setError('Please attach your revised manuscript file.')

        setSubmitting(true)
        try {
            const submission = await resolveLookup(REVISABLE, 'a revised submission')
            await submitRevision({
                submissionId: submission.id,
                title: rTitle,
                abstract: rAbstract,
                keywords: revisedKeywords,
                file: rFile,
            })
            navigate(`/author/submissions/${submission.id}`)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!rTitle.trim() || !rAbstract.trim()) return setError('Manuscript title and abstract are required.')
        const finalWords = countWords(rAbstract)
        if (finalWords < ABSTRACT_MIN_WORDS || finalWords > ABSTRACT_MAX_WORDS) {
            return setError(`Abstract must be between ${ABSTRACT_MIN_WORDS} and ${ABSTRACT_MAX_WORDS} words (currently ${finalWords}).`)
        }
        const finalKeywords = parseKeywords(rKeywords)
        if (finalKeywords.length === 0) return setError('Please provide at least one keyword.')
        if (!rFile) return setError('Please attach your final manuscript file.')

        setSubmitting(true)
        try {
            const submission = await resolveLookup(FINALIZABLE, 'a final submission')
            await submitFinal({
                submissionId: submission.id,
                title: rTitle,
                abstract: rAbstract,
                keywords: finalKeywords,
                file: rFile,
            })
            navigate(`/author/submissions/${submission.id}`)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSubmitting(false)
        }
    }

    const submissionTypeOptions = [
        {
            type: 'New Submission' as const,
            title: 'New Submission',
            desc: 'Initial manuscript for peer review',
            icon: PlusCircle,
        },
        {
            type: 'Revised Submission' as const,
            title: 'Revised Submission',
            desc: 'Upload revised paper with Manuscript ID',
            icon: FileEdit,
        },
        {
            type: 'Final Submission' as const,
            title: 'Final Submission',
            desc: 'Camera-ready manuscript for publication',
            icon: CheckCircle2,
        },
    ]

    return (
        <div className="max-w-[56rem] mx-auto p-1 sm:p-3 space-y-3.5 sm:space-y-4 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-0.5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Paper Submission</h1>
                    <p className="text-xs sm:text-sm text-body">
                        Signed in as <span className="font-medium text-ink">{user?.email}</span>
                    </p>
                </div>
            </div>

            {/* Submission Type Card */}
            <Card className="overflow-hidden border-hairline-strong shadow-xs">
                <CardHeader className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-hairline bg-canvas-soft/40">
                    <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        Submission Type <span className="text-primary">*</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 sm:p-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {submissionTypeOptions.map((item) => {
                            const isSelected = submissionType === item.type
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => {
                                        setSubmissionType(item.type)
                                        setError('')
                                    }}
                                    className={`relative flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-primary/5 border-primary ring-1 ring-primary text-ink shadow-xs'
                                            : 'bg-surface-card border-hairline-strong hover:bg-surface-strong/60 text-body hover:text-ink'
                                    }`}
                                >
                                    <div className={`mt-0.5 rounded-md p-1.5 shrink-0 ${
                                        isSelected ? 'bg-primary text-white' : 'bg-canvas-soft text-body'
                                    }`}>
                                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-ink'}`}>
                                                {item.title}
                                            </span>
                                            {isSelected && (
                                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[11px] leading-snug text-body mt-0.5 line-clamp-2">
                                            {item.desc}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {error && <Alert showIcon type="danger">{error}</Alert>}

            {/* ---- NEW SUBMISSION ---- */}
            {submissionType === 'New Submission' && (
                <form onSubmit={handleNewSubmit} className="space-y-3.5 sm:space-y-4">
                    {/* Manuscript Info */}
                    <Card className="border-hairline-strong shadow-xs">
                        <CardHeader className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-hairline bg-canvas-soft/40">
                            <CardTitle className="text-xs sm:text-sm font-semibold">Manuscript Info</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-4 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm font-medium text-ink">Manuscript Title *</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter full manuscript title"
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Abstract *</label>
                                    <span className={`text-[11px] ${countWords(abstract) < ABSTRACT_MIN_WORDS || countWords(abstract) > ABSTRACT_MAX_WORDS ? 'text-red-500' : 'text-body'}`}>
                                        {countWords(abstract)} / {ABSTRACT_MIN_WORDS}–{ABSTRACT_MAX_WORDS} words
                                    </span>
                                </div>
                                <textarea
                                    rows={5}
                                    className="w-full rounded-md border border-hairline-strong bg-canvas p-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                                    placeholder="Provide a concise abstract summarizing your research (150-300 words)..."
                                    value={abstract}
                                    onChange={(e) => setAbstract(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm font-medium text-ink">Keywords *</label>
                                <Input
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g. machine learning, IoT, anomaly detection"
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                    required
                                />
                                <p className="text-[11px] text-body">Comma-separated.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Paper Type *</label>
                                    <Select
                                        value={paperType}
                                        onChange={setPaperType}
                                        options={PAPER_TYPES}
                                        placeholder="Select Paper Type"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Submission Mode</label>
                                    <div className="h-9 sm:h-10 flex items-center px-3 rounded-md border border-hairline-strong bg-canvas-soft text-xs sm:text-sm text-ink">
                                        {submissionMode}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Author Info */}
                    <Card className="border-hairline-strong shadow-xs">
                        <CardHeader className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-hairline bg-canvas-soft/40 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs sm:text-sm font-semibold">
                                Author Info ({coAuthors.length}/{MAX_AUTHORS})
                            </CardTitle>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addAuthor}
                                disabled={coAuthors.length >= MAX_AUTHORS}
                                className="h-7 sm:h-8 px-2.5 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Author
                            </Button>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-4 space-y-3">
                            {coAuthors.map((author, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 border border-hairline-strong rounded-lg space-y-2.5 bg-canvas-soft/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                            {idx === 0 ? 'First Author (Primary)' : `Author ${idx + 1}`}
                                        </span>
                                        {coAuthors.length > 1 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeAuthor(idx)}
                                                className="h-6 w-6 p-0 text-body hover:text-red-500"
                                                title="Remove Author"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <Input
                                            placeholder="Full Name *"
                                            value={author.name}
                                            onChange={(e) => updateAuthor(idx, { name: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                            required
                                        />
                                        <Input
                                            type="email"
                                            placeholder="Email Address *"
                                            value={author.email}
                                            onChange={(e) => updateAuthor(idx, { email: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <Input
                                            placeholder="Department *"
                                            value={author.department}
                                            onChange={(e) => updateAuthor(idx, { department: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                            required
                                        />
                                        <Input
                                            placeholder="Institution / Affiliation *"
                                            value={author.institution}
                                            onChange={(e) => updateAuthor(idx, { institution: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                            required
                                        />
                                        <Input
                                            placeholder="Country *"
                                            value={author.country}
                                            onChange={(e) => updateAuthor(idx, { country: e.target.value })}
                                            className="h-8 sm:h-9 text-xs"
                                            required
                                        />
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-xs font-medium text-ink cursor-pointer pt-0.5">
                                        <input
                                            type="radio"
                                            name="correspondingAuthor"
                                            checked={Boolean(author.correspondingAuthor)}
                                            onChange={() =>
                                                setCoAuthors((prev) => prev.map((a, i) => ({ ...a, correspondingAuthor: i === idx })))
                                            }
                                            className="text-primary focus:ring-primary h-3.5 w-3.5"
                                        />
                                        <span>Mark as Corresponding Author</span>
                                    </label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="border-hairline-strong shadow-xs">
                        <CardHeader className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-hairline bg-canvas-soft/40">
                            <CardTitle className="text-xs sm:text-sm font-semibold">Contact Info</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Contact No. *</label>
                                    <Input
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        placeholder="+91 9876543210"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Country *</label>
                                    <Input
                                        value={contactCountry}
                                        onChange={(e) => setContactCountry(e.target.value)}
                                        placeholder="e.g. India"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Address Line 1 *</label>
                                    <Input
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        placeholder="Street address or university campus"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Address Line 2 (Optional)</label>
                                    <Input
                                        value={addressLine2}
                                        onChange={(e) => setAddressLine2(e.target.value)}
                                        placeholder="Apartment, suite, building, or floor"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">City *</label>
                                    <Input
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="e.g. Udaipur"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">State / Province *</label>
                                    <Input
                                        value={stateProvince}
                                        onChange={(e) => setStateProvince(e.target.value)}
                                        placeholder="e.g. Rajasthan"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Pin / Zip Code *</label>
                                    <Input
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        placeholder="e.g. 313601"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Manuscript Upload */}
                    <Card className="border-hairline-strong shadow-xs">
                        <CardHeader className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-hairline bg-canvas-soft/40">
                            <CardTitle className="text-xs sm:text-sm font-semibold">Manuscript Document</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-4">
                            <FileDrop
                                label="Choose Paper File * (.doc or .docx)"
                                file={manuscriptFile}
                                onChange={setManuscriptFile}
                                accept=".doc,.docx"
                                allowedTypes={MANUSCRIPT_TYPES}
                                error={manuscriptFileError}
                                setError={setManuscriptFileError}
                                description="Word Document (.doc, .docx) up to 25MB"
                            />
                        </CardContent>
                    </Card>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/author')}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                        >
                            {submitting ? 'Submitting…' : 'Submit for Editorial Review'}
                        </Button>
                    </div>
                </form>
            )}

            {/* ---- REVISED SUBMISSION ---- */}
            {submissionType === 'Revised Submission' && (
                <form onSubmit={handleRevisedSubmit} className="space-y-3.5 sm:space-y-4">
                    <Card className="border-hairline-strong shadow-xs">
                        <CardHeader className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-hairline bg-canvas-soft/40">
                            <CardTitle className="text-xs sm:text-sm font-semibold">Revised Manuscript Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Manuscript ID *</label>
                                    <Input
                                        placeholder="e.g. JERI-00001"
                                        value={manuscriptId}
                                        onChange={(e) => setManuscriptId(e.target.value)}
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Registered Email *</label>
                                    <Input
                                        type="email"
                                        value={registeredEmail}
                                        onChange={(e) => setRegisteredEmail(e.target.value)}
                                        placeholder="author@example.com"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm font-medium text-ink">Manuscript Title *</label>
                                <Input
                                    value={rTitle}
                                    onChange={(e) => setRTitle(e.target.value)}
                                    placeholder="Enter revised title"
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Abstract *</label>
                                    <span className={`text-[11px] ${countWords(rAbstract) < ABSTRACT_MIN_WORDS || countWords(rAbstract) > ABSTRACT_MAX_WORDS ? 'text-red-500' : 'text-body'}`}>
                                        {countWords(rAbstract)} / {ABSTRACT_MIN_WORDS}–{ABSTRACT_MAX_WORDS} words
                                    </span>
                                </div>
                                <textarea
                                    rows={5}
                                    className="w-full rounded-md border border-hairline-strong bg-canvas p-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                                    placeholder="Updated abstract (150-300 words)..."
                                    value={rAbstract}
                                    onChange={(e) => setRAbstract(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm font-medium text-ink">Keywords *</label>
                                <Input
                                    value={rKeywords}
                                    onChange={(e) => setRKeywords(e.target.value)}
                                    placeholder="e.g. machine learning, IoT, anomaly detection"
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                    required
                                />
                                <p className="text-[11px] text-body">Comma-separated.</p>
                            </div>
                            <FileDrop
                                label="Revised Manuscript File * (.doc or .docx)"
                                file={rFile}
                                onChange={setRFile}
                                accept=".doc,.docx"
                                allowedTypes={MANUSCRIPT_TYPES}
                                error={rFileError}
                                setError={setRFileError}
                                description="Word Document (.doc, .docx) up to 25MB"
                            />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/author')}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                        >
                            {submitting ? 'Submitting…' : 'Submit Revised Manuscript'}
                        </Button>
                    </div>
                </form>
            )}

            {/* ---- FINAL SUBMISSION ---- */}
            {submissionType === 'Final Submission' && (
                <form onSubmit={handleFinalSubmit} className="space-y-3.5 sm:space-y-4">
                    <Card className="border-hairline-strong shadow-xs">
                        <CardHeader className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-hairline bg-canvas-soft/40">
                            <CardTitle className="text-xs sm:text-sm font-semibold">Final Camera-Ready Submission</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Manuscript ID *</label>
                                    <Input
                                        placeholder="e.g. JERI-00001"
                                        value={manuscriptId}
                                        onChange={(e) => setManuscriptId(e.target.value)}
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Registered Email *</label>
                                    <Input
                                        type="email"
                                        value={registeredEmail}
                                        onChange={(e) => setRegisteredEmail(e.target.value)}
                                        placeholder="author@example.com"
                                        className="h-9 sm:h-10 text-xs sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm font-medium text-ink">Manuscript Title *</label>
                                <Input
                                    value={rTitle}
                                    onChange={(e) => setRTitle(e.target.value)}
                                    placeholder="Final paper title"
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs sm:text-sm font-medium text-ink">Manuscript Abstract *</label>
                                    <span className={`text-[11px] ${countWords(rAbstract) < ABSTRACT_MIN_WORDS || countWords(rAbstract) > ABSTRACT_MAX_WORDS ? 'text-red-500' : 'text-body'}`}>
                                        {countWords(rAbstract)} / {ABSTRACT_MIN_WORDS}–{ABSTRACT_MAX_WORDS} words
                                    </span>
                                </div>
                                <textarea
                                    rows={5}
                                    className="w-full rounded-md border border-hairline-strong bg-canvas p-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
                                    placeholder="Final abstract (150-300 words)..."
                                    value={rAbstract}
                                    onChange={(e) => setRAbstract(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs sm:text-sm font-medium text-ink">Keywords *</label>
                                <Input
                                    value={rKeywords}
                                    onChange={(e) => setRKeywords(e.target.value)}
                                    placeholder="e.g. machine learning, IoT, anomaly detection"
                                    className="h-9 sm:h-10 text-xs sm:text-sm"
                                    required
                                />
                                <p className="text-[11px] text-body">Comma-separated.</p>
                            </div>

                            <div className="pt-1 border-t border-hairline">
                                <p className="text-xs font-semibold text-ink mb-2">Final Manuscript</p>
                                <FileDrop
                                    label="Final Manuscript * (.doc/.docx)"
                                    file={rFile}
                                    onChange={setRFile}
                                    accept=".doc,.docx"
                                    allowedTypes={MANUSCRIPT_TYPES}
                                    error={rFileError}
                                    setError={setRFileError}
                                    description="Camera-ready .doc/.docx"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/author')}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="h-9 sm:h-10 text-xs sm:text-sm"
                        >
                            {submitting ? 'Submitting…' : 'Submit Final Manuscript'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default NewSubmission
