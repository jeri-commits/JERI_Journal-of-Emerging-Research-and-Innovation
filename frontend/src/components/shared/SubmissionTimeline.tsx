import { Clock } from 'lucide-react'
import type { SubmissionHistoryEntry } from '@/@types/submissions'

const SubmissionTimeline = ({ entries }: { entries: SubmissionHistoryEntry[] }) => {
    if (entries.length === 0) {
        return <p className="text-sm text-body">No history yet.</p>
    }

    return (
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-[9px] before:w-0.5 before:bg-hairline">
            {entries
                .slice()
                .reverse()
                .map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 relative pl-6">
                        <div className="absolute left-0 top-1 w-[19px] h-[19px] rounded-full bg-surface-card border-2 border-primary flex items-center justify-center">
                            <Clock className="h-2.5 w-2.5 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-ink">{entry.action}</p>
                            {entry.comments && (
                                <p className="text-xs text-body whitespace-pre-line">
                                    {entry.comments}
                                </p>
                            )}
                            <p className="text-[11px] text-body/70">
                                {new Date(entry.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
        </div>
    )
}

export default SubmissionTimeline
