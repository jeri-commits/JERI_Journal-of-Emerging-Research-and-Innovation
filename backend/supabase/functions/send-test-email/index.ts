import { handlePreflight } from '../_shared/cors.ts'
import { jsonResponse, errorResponse, HttpError } from '../_shared/errors.ts'
import { requireUser, requireAdmin } from '../_shared/auth.ts'
import { enforceRateLimit } from '../_shared/rateLimit.ts'
import { EmailService } from '../_shared/emailTemplates.ts'

const TEST_EMAIL_TYPES = [
    'welcome',
    'password_reset',
    'password_changed',
    'submission_received',
    'returned_for_correction',
    'revision_required',
    'revision_received',
    'acceptance',
    'rejection',
    'final_returned',
    'final_submission_received',
    'publication_approval',
    'contact_message',
    'all',
] as const

type TestEmailType = (typeof TEST_EMAIL_TYPES)[number]

type RequestBody = { email?: string; type?: TestEmailType }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const APP_URL = Deno.env.get('PUBLIC_APP_URL') ?? 'http://localhost:5173'

const SAMPLE_CODE = 'JERI-00000'
const SAMPLE_TITLE = 'Sample Manuscript Title for Testing'
const SAMPLE_FEEDBACK =
    'This is **sample reviewer feedback** for testing. It includes:\n- A bullet point\n- Another bullet point'
// A test email has no real submission row to link to -- this is just a
// syntactically valid UUID so the "View Submission" button has somewhere
// to point (it won't resolve to a real page, which is fine for a preview).
const SAMPLE_SUBMISSION_ID = '00000000-0000-0000-0000-000000000000'

async function sendOne(type: Exclude<TestEmailType, 'all'>, to: string) {
    switch (type) {
        case 'welcome':
            await EmailService.sendWelcomeEmail(to, 'Test Author')
            return
        case 'password_reset':
            await EmailService.sendPasswordResetEmail(
                to,
                `${APP_URL}/reset-password?token=this-is-a-test-token-and-will-not-work`,
                30,
            )
            return
        case 'password_changed':
            await EmailService.sendPasswordChangedEmail(to)
            return
        case 'submission_received':
            await EmailService.sendSubmissionReceived(to, 'Test Author', SAMPLE_CODE, SAMPLE_TITLE, SAMPLE_SUBMISSION_ID)
            return
        case 'returned_for_correction':
            await EmailService.sendReturnedForCorrection(
                to,
                'Test Author',
                SAMPLE_CODE,
                SAMPLE_TITLE,
                'Please fix the formatting of Table 2 and resubmit.',
                SAMPLE_SUBMISSION_ID,
            )
            return
        case 'revision_required':
            await EmailService.sendRevisionRequired(
                to,
                'Test Author',
                SAMPLE_CODE,
                SAMPLE_TITLE,
                'MINOR_REVISION',
                SAMPLE_FEEDBACK,
                0,
                null,
                SAMPLE_SUBMISSION_ID,
            )
            return
        case 'revision_received':
            await EmailService.sendRevisionReceived(to, 'Test Author', SAMPLE_CODE, SAMPLE_TITLE, 1, SAMPLE_SUBMISSION_ID)
            return
        case 'acceptance':
            await EmailService.sendAcceptance(to, 'Test Author', SAMPLE_CODE, SAMPLE_TITLE, SAMPLE_SUBMISSION_ID)
            return
        case 'rejection':
            await EmailService.sendRejection(to, 'Test Author', SAMPLE_CODE, SAMPLE_TITLE, SAMPLE_FEEDBACK)
            return
        case 'final_returned':
            await EmailService.sendFinalReturned(
                to,
                'Test Author',
                SAMPLE_CODE,
                SAMPLE_TITLE,
                'The copyright form is missing a signature.',
                SAMPLE_SUBMISSION_ID,
            )
            return
        case 'final_submission_received':
            await EmailService.sendFinalSubmissionReceived([to], 'Test Author', SAMPLE_CODE, SAMPLE_TITLE, SAMPLE_SUBMISSION_ID)
            return
        case 'publication_approval':
            await EmailService.sendPublicationApproval(to, 'Test Author', SAMPLE_CODE, SAMPLE_TITLE)
            return
        case 'contact_message':
            await EmailService.sendContactMessage(
                to,
                'Test Sender',
                to,
                'Test contact form subject',
                'This is a sample message from the public contact form, for testing.',
            )
            return
    }
}

/**
 * Admin-only. Lets the editorial team preview/verify what each
 * transactional email actually looks like in a real inbox without
 * walking through the real flow end to end. Sends the exact same
 * templates real users get -- this is a delivery test, not a mockup.
 * Covers every template in emailTemplates.ts so nothing goes untested.
 */
Deno.serve(async (req) => {
    const preflight = handlePreflight(req)
    if (preflight) return preflight

    try {
        const user = await requireUser(req)
        requireAdmin(user)

        const body = (await req.json().catch(() => ({}))) as RequestBody
        const email = body.email?.trim()
        const type = body.type

        if (!email || !EMAIL_RE.test(email)) {
            throw new HttpError(400, 'Please enter a valid email address.')
        }
        if (!type || !TEST_EMAIL_TYPES.includes(type)) {
            throw new HttpError(400, 'Please choose which email to send.')
        }

        await enforceRateLimit(`send-test-email:${user.id}`, 40, 600)

        if (type === 'all') {
            for (const t of TEST_EMAIL_TYPES) {
                if (t === 'all') continue
                await sendOne(t, email)
            }
        } else {
            await sendOne(type, email)
        }

        return jsonResponse({ status: 'sent' })
    } catch (error) {
        return errorResponse(error)
    }
})
