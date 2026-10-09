import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS } from '@/@types/submissions'
import type { SubmissionStatus } from '@/@types/submissions'

const VARIANT_BY_STATUS: Record<
    SubmissionStatus,
    'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple'
> = {
    SUBMITTED: 'outline',
    RETURNED_FOR_CORRECTION: 'destructive',
    UNDER_REVIEW: 'warning',
    MAJOR_REVISION: 'purple',
    MINOR_REVISION: 'purple',
    REVISED_SUBMISSION: 'outline',
    ACCEPTED: 'success',
    REJECTED: 'destructive',
    FINAL_SUBMISSION: 'warning',
    RETURNED_FINAL: 'destructive',
    APPROVED_FOR_PUBLICATION: 'success',
    PUBLISHED: 'success',
}

const StatusBadge = ({ status }: { status: SubmissionStatus }) => (
    <Badge variant={VARIANT_BY_STATUS[status]}>{STATUS_LABELS[status]}</Badge>
)

export default StatusBadge
