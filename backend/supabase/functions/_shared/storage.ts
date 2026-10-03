import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17'
import { HttpError } from './errors.ts'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25MB
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function r2Client(): AwsClient {
    return new AwsClient({
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
        service: 's3',
        region: 'auto',
    })
}

function bucketUrl(): string {
    const accountId = Deno.env.get('R2_ACCOUNT_ID')!
    const bucket = Deno.env.get('R2_BUCKET_NAME')!
    return `https://${accountId}.r2.cloudflarestorage.com/${bucket}`
}

export function sanitizeFileName(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_')
    return cleaned.slice(-150) || 'manuscript'
}

export function validateManuscriptFile(
    fileName: string,
    mimeType: string,
    sizeBytes: number,
) {
    if (!fileName) {
        throw new HttpError(400, 'A manuscript file name is required.')
    }
    if (sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
        throw new HttpError(
            400,
            `Manuscript file must be larger than 0 bytes and under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
        )
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        throw new HttpError(
            400,
            'Manuscript must be a PDF or Word document (.pdf, .doc, .docx).',
        )
    }
}

export function buildObjectKey(
    submissionCode: string,
    versionNumber: number,
    fileName: string,
): string {
    return `papers/${submissionCode}/v${versionNumber}/${sanitizeFileName(fileName)}`
}

/** Uploads manuscript bytes to R2. Throws on failure -- callers are
 * responsible for not leaving an orphaned DB row if this fails. */
export async function uploadManuscript(
    objectKey: string,
    bytes: Uint8Array,
    mimeType: string,
): Promise<void> {
    const client = r2Client()
    // TS's DOM lib types Uint8Array as generic over ArrayBufferLike (which
    // includes SharedArrayBuffer), while BlobPart/BodyInit want it backed
    // by a concrete ArrayBuffer -- true at runtime for every Uint8Array we
    // construct here, just not provable to the type checker. Cast through
    // ArrayBuffer rather than suppressing the whole call.
    const body = new Blob([bytes.buffer as ArrayBuffer])
    const res = await client.fetch(`${bucketUrl()}/${objectKey}`, {
        method: 'PUT',
        body,
        headers: { 'Content-Type': mimeType },
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`R2 upload failed (${res.status}): ${text}`)
    }
}

/** Deletes an object -- used to clean up an upload whose DB write then
 * failed, so R2 and Postgres never drift out of sync (spec section 34). */
export async function deleteManuscript(objectKey: string): Promise<void> {
    const client = r2Client()
    const res = await client.fetch(`${bucketUrl()}/${objectKey}`, {
        method: 'DELETE',
    })
    if (!res.ok && res.status !== 404) {
        console.error(
            `Failed to clean up orphaned R2 object ${objectKey}: ${res.status}`,
        )
    }
}

/** A time-limited signed GET URL -- used for the reviewer's secure
 * manuscript link and for owner/admin downloads. Never a public URL. */
export async function signedDownloadUrl(
    objectKey: string,
    expiresInSeconds = 60 * 60 * 24 * 7,
): Promise<string> {
    const client = r2Client()
    const url = new URL(`${bucketUrl()}/${objectKey}`)
    url.searchParams.set('X-Amz-Expires', String(expiresInSeconds))
    const signedRequest = await client.sign(url.toString(), {
        method: 'GET',
        aws: { signQuery: true },
    })
    return signedRequest.url
}
