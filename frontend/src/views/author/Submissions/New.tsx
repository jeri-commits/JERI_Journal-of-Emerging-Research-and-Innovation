import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import { Plus, Trash2, UploadCloud, ChevronDown } from 'lucide-react'
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
const ATTACHMENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

const PAPER_TYPES = [
    'Research Article',
    'Review Article',
    'Survey Article',
    'Short Communication',
    'Others',
]

const REVISABLE = ['MAJOR_REVISION', 'MINOR_REVISION']
const FINALIZABLE = ['ACCEPTED', 'RETURNED_FINAL']

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
        return allowedTypes === ATTACHMENT_TYPES
            ? `${label} must be a PDF, PNG, or JPG file.`
            : `${label} must be a Word document (.doc or .docx).`
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
}> = ({ value, onChange, options, placeholder = 'Select Type', required }) => (
    <div className="relative">
        <select
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 appearance-none rounded-md border border-hairline-strong bg-canvas pl-3 pr-9 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        <ChevronDown className="h-4 w-4 text-body absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
}> = ({ file, onChange, accept, label, allowedTypes, error, setError }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">{label}</label>
        <label className="p-4 border-2 border-dashed border-hairline-strong rounded-lg flex flex-col items-center gap-2 cursor-pointer bg-canvas-soft block">
            <UploadCloud className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-ink text-center">
                {file ? file.name : 'No file chosen'}
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
        {error && <p className="text-xs text-red-500">{error}</p>}
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
    const [paperType, setPaperType] = useState('')
    const [submissionMode] = useState('Regular')
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
    const [registeredEmail, setRegisteredEmail] = useState('')
    const [rTitle, setRTitle] = useState('')
    const [rAbstract, setRAbstract] = useState('')
    const [rFile, setRFile] = useState<File | null>(null)
    const [rFileError, setRFileError] = useState('')
    const [copyrightForm, setCopyrightForm] = useState<File | null>(null)
    const [copyrightFormError, setCopyrightFormError] = useState('')
    const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
    const [paymentSlipError, setPaymentSlipError] = useState('')

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
                keywords: [],
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
        if (!rFile) return setError('Please attach your revised manuscript file.')

        setSubmitting(true)
        try {
            const submission = await resolveLookup(REVISABLE, 'a revised submission')
            await submitRevision({
                submissionId: submission.id,
                title: rTitle,
                abstract: rAbstract,
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
        if (!rFile) return setError('Please attach your final manuscript file.')
        if (!copyrightForm) return setError('Please attach the copyright form.')
        if (!paymentSlip) return setError('Please attach the payment slip.')

        setSubmitting(true)
        try {
            const submission = await resolveLookup(FINALIZABLE, 'a final submission')
            await submitFinal({
                submissionId: submission.id,
                title: rTitle,
                abstract: rAbstract,
                file: rFile,
                copyrightForm,
                paymentSlip,
            })
            navigate(`/author/submissions/${submission.id}`)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-ink">Paper Submission</h1>
                <p className="text-sm text-body">Signed in as {user?.email}.</p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-1.5 max-w-sm">
                        <label className="text-sm font-medium">Submission Type *</label>
                        <Select
                            value={submissionType}
                            onChange={(v) => {
                                setSubmissionType(v as SubmissionType)
                                setError('')
                            }}
                            options={['New Submission', 'Revised Submission', 'Final Submission']}
                            placeholder="Select Type"
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            {error && <Alert showIcon type="danger">{error}</Alert>}

            {submissionType === 'New Submission' && (
                <form onSubmit={handleNewSubmit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Manuscript Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Manuscript Title *</label>
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
                                    <label className="text-sm font-medium">Paper Type *</label>
                                    <Select value={paperType} onChange={setPaperType} options={PAPER_TYPES} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Submission Mode *</label>
                                    <Select value={submissionMode} onChange={() => {}} options={['Regular']} required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Author Info ({coAuthors.length}/{MAX_AUTHORS})</CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={addAuthor} disabled={coAuthors.length >= MAX_AUTHORS}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Author
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {coAuthors.map((author, idx) => (
                                <div key={idx} className="p-4 border border-hairline rounded-xl space-y-3 bg-surface-card">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                            {idx === 0 ? 'First Author' : `Author ${idx + 1}`}
                                        </span>
                                        {coAuthors.length > 1 && (
                                            <Button type="button" size="sm" variant="ghost" onClick={() => removeAuthor(idx)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input placeholder="Name *" value={author.name} onChange={(e) => updateAuthor(idx, { name: e.target.value })} required />
                                        <Input type="email" placeholder="Email *" value={author.email} onChange={(e) => updateAuthor(idx, { email: e.target.value })} required />
                                        <Input placeholder="Department *" value={author.department} onChange={(e) => updateAuthor(idx, { department: e.target.value })} required />
                                        <Input placeholder="Institution *" value={author.institution} onChange={(e) => updateAuthor(idx, { institution: e.target.value })} required />
                                        <Input placeholder="Country *" value={author.country} onChange={(e) => updateAuthor(idx, { country: e.target.value })} required />
                                    </div>
                                    <label className="flex items-center gap-2 text-xs font-medium text-ink">
                                        <input
                                            type="radio"
                                            name="correspondingAuthor"
                                            checked={Boolean(author.correspondingAuthor)}
                                            onChange={() =>
                                                setCoAuthors((prev) => prev.map((a, i) => ({ ...a, correspondingAuthor: i === idx })))
                                            }
                                        />
                                        Corresponding Author
                                    </label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Contact No. *</label>
                                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Address Line 1 *</label>
                                <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Address Line 2</label>
                                <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">City *</label>
                                    <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">State / Province *</label>
                                    <Input value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Pin / Zip Code *</label>
                                    <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Country *</label>
                                    <Input value={contactCountry} onChange={(e) => setContactCountry(e.target.value)} required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Manuscript Upload</CardTitle></CardHeader>
                        <CardContent>
                            <FileDrop
                                label="Choose Paper * (doc or docx)"
                                file={manuscriptFile}
                                onChange={setManuscriptFile}
                                accept=".doc,.docx"
                                allowedTypes={MANUSCRIPT_TYPES}
                                error={manuscriptFileError}
                                setError={setManuscriptFileError}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate('/author')}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting…' : 'Submit for Editorial Review'}
                        </Button>
                    </div>
                </form>
            )}

            {submissionType === 'Revised Submission' && (
                <form onSubmit={handleRevisedSubmit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Revised Submission</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Manuscript ID *</label>
                                    <Input placeholder="e.g. JERI-00001" value={manuscriptId} onChange={(e) => setManuscriptId(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Registered Email *</label>
                                    <Input type="email" value={registeredEmail} onChange={(e) => setRegisteredEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Manuscript Title *</label>
                                <Input value={rTitle} onChange={(e) => setRTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Abstract *</label>
                                <textarea
                                    rows={5}
                                    className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                                    value={rAbstract}
                                    onChange={(e) => setRAbstract(e.target.value)}
                                    required
                                />
                            </div>
                            <FileDrop
                                label="Choose Paper * (doc or docx)"
                                file={rFile}
                                onChange={setRFile}
                                accept=".doc,.docx"
                                allowedTypes={MANUSCRIPT_TYPES}
                                error={rFileError}
                                setError={setRFileError}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate('/author')}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting…' : 'Submit Revised Manuscript'}
                        </Button>
                    </div>
                </form>
            )}

            {submissionType === 'Final Submission' && (
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Final Submission</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Manuscript ID *</label>
                                    <Input placeholder="e.g. JERI-00001" value={manuscriptId} onChange={(e) => setManuscriptId(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Registered Email *</label>
                                    <Input type="email" value={registeredEmail} onChange={(e) => setRegisteredEmail(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Manuscript Title *</label>
                                <Input value={rTitle} onChange={(e) => setRTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Manuscript Abstract *</label>
                                <textarea
                                    rows={5}
                                    className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                                    value={rAbstract}
                                    onChange={(e) => setRAbstract(e.target.value)}
                                    required
                                />
                            </div>
                            <FileDrop
                                label="Final Manuscript * (doc or docx)"
                                file={rFile}
                                onChange={setRFile}
                                accept=".doc,.docx"
                                allowedTypes={MANUSCRIPT_TYPES}
                                error={rFileError}
                                setError={setRFileError}
                            />
                            <FileDrop
                                label="Copyright Form * (pdf, png, or jpg)"
                                file={copyrightForm}
                                onChange={setCopyrightForm}
                                accept=".pdf,.png,.jpg,.jpeg"
                                allowedTypes={ATTACHMENT_TYPES}
                                error={copyrightFormError}
                                setError={setCopyrightFormError}
                            />
                            <FileDrop
                                label="Payment Slip * (pdf, png, or jpg)"
                                file={paymentSlip}
                                onChange={setPaymentSlip}
                                accept=".pdf,.png,.jpg,.jpeg"
                                allowedTypes={ATTACHMENT_TYPES}
                                error={paymentSlipError}
                                setError={setPaymentSlipError}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate('/author')}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Submitting…' : 'Submit Final Manuscript'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default NewSubmission
