import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import type { ReviewerDecision } from '@/@types/submissions'

const VARIANT_BY_DECISION: Record<
    ReviewerDecision,
    'success' | 'destructive' | 'purple'
> = {
    ACCEPTED: 'success',
    REJECTED: 'destructive',
    MAJOR_REVISION: 'purple',
    MINOR_REVISION: 'purple',
}

const ICON_BY_DECISION: Record<ReviewerDecision, typeof CheckCircle2> = {
    ACCEPTED: CheckCircle2,
    REJECTED: XCircle,
    MAJOR_REVISION: RefreshCw,
    MINOR_REVISION: RefreshCw,
}

const LABEL_BY_DECISION: Record<ReviewerDecision, string> = {
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    MAJOR_REVISION: 'Major Revision',
    MINOR_REVISION: 'Minor Revision',
}

const DecisionBadge = ({ decision }: { decision: ReviewerDecision }) => {
    const Icon = ICON_BY_DECISION[decision]
    return (
        <Badge variant={VARIANT_BY_DECISION[decision]} className="gap-1">
            <Icon className="h-3 w-3" />
            {LABEL_BY_DECISION[decision]}
        </Badge>
    )
}

export default DecisionBadge
