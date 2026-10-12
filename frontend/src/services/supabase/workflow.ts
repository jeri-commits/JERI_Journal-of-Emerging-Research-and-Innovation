import { invokeFunction as invoke } from './functionsClient'
import type { ReviewerDecision } from '@/@types/submissions'

export async function readFileAsBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export type CoAuthorInput = {
    name: string
    email: string
    department?: string
    institution?: string
    country?: string
    correspondingAuthor?: boolean
}

export async function createSubmission(params: {
    title: string
    abstract: string
    paperType: string
    submissionMode?: string
    keywords: string[]
    category?: string
    journalSection?: string
    coAuthors: CoAuthorInput[]
    contactPhone: string
    addressLine1: string
    addressLine2?: string
    city: string
    stateProvince: string
    postalCode: string
    contactCountry: string
    file: File
}): Promise<{ submissionId: string; submissionCode: string }> {
    const fileBase64 = await readFileAsBase64(params.file)
    return invoke('create-submission', {
        title: params.title,
        abstract: params.abstract,
        paperType: params.paperType,
        submissionMode: params.submissionMode,
        keywords: params.keywords,
        category: params.category,
        journalSection: params.journalSection,
        coAuthors: params.coAuthors,
        contactPhone: params.contactPhone,
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2,
        city: params.city,
        stateProvince: params.stateProvince,
        postalCode: params.postalCode,
        contactCountry: params.contactCountry,
        fileName: params.file.name,
        mimeType: params.file.type,
        fileBase64,
    })
}

export async function submitRevision(params: {
    submissionId: string
    title?: string
    abstract?: string
    file: File
}) {
    const fileBase64 = await readFileAsBase64(params.file)
    return invoke<{ status: string; revisionCount: number }>('submit-revision', {
        submissionId: params.submissionId,
        title: params.title,
        abstract: params.abstract,
        fileName: params.file.name,
        mimeType: params.file.type,
        fileBase64,
    })
}

export async function submitCorrection(params: {
    submissionId: string
    title?: string
    abstract?: string
    keywords?: string[]
    category?: string
    journalSection?: string
    file?: File
}) {
    const fileFields = params.file
        ? {
              fileName: params.file.name,
              mimeType: params.file.type,
              fileBase64: await readFileAsBase64(params.file),
          }
        : {}
    return invoke<{ status: string }>('submit-correction', {
        submissionId: params.submissionId,
        title: params.title,
        abstract: params.abstract,
        keywords: params.keywords,
        category: params.category,
        journalSection: params.journalSection,
        ...fileFields,
    })
}

export async function submitFinal(params: {
    submissionId: string
    title?: string
    abstract?: string
    file: File
}) {
    const fileBase64 = await readFileAsBase64(params.file)
    return invoke<{ status: string }>('submit-final', {
        submissionId: params.submissionId,
        title: params.title,
        abstract: params.abstract,
        fileName: params.file.name,
        mimeType: params.file.type,
        fileBase64,
    })
}

export async function returnForCorrection(submissionId: string, comments: string) {
    return invoke<{ status: string }>('return-for-correction', {
        submissionId,
        comments,
    })
}

export async function assignReviewer(submissionId: string) {
    return invoke<{ status: string }>('assign-reviewer', { submissionId })
}

export async function recordReviewerDecision(params: {
    submissionId: string
    decision: ReviewerDecision
    feedback: string
    attachment?: File
}) {
    const { attachment, ...rest } = params
    const attachmentFields = attachment
        ? {
              attachmentFileName: attachment.name,
              attachmentMimeType: attachment.type,
              attachmentBase64: await readFileAsBase64(attachment),
          }
        : {}
    return invoke<{ status: string }>('record-reviewer-decision', {
        ...rest,
        ...attachmentFields,
    })
}

export async function getFeedbackAttachmentUrl(feedbackId: string) {
    return invoke<{ url: string; fileName: string }>('get-feedback-attachment-url', {
        feedbackId,
    })
}

export async function deleteUser(userId: string) {
    return invoke<{ status: string }>('delete-user', { userId })
}

export async function finalApprove(params: {
    submissionId: string
    action: 'approve' | 'return' | 'reject'
    comments?: string
}) {
    return invoke<{ status: string }>('final-approve', params)
}

export async function publishSubmission(submissionId: string) {
    return invoke<{ status: string }>('publish', { submissionId })
}

export async function setUserRole(userId: string, role: 'admin' | 'author' | null) {
    return invoke<{ status: string; role: 'admin' | 'author' | null }>('set-user-role', {
        userId,
        role,
    })
}

export async function getDownloadUrl(versionId: string) {
    return invoke<{ url: string; fileName: string }>('get-download-url', {
        versionId,
    })
}
