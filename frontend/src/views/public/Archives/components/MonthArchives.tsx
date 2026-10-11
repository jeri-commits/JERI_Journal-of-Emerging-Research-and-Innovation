import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Calendar, ExternalLink } from 'lucide-react'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { listPublishedSubmissions } from '@/services/supabase/submissions'
import type { Submission } from '@/@types/submissions'

type MonthGroup = {
    year: string
    monthLabel: string
    papers: Submission[]
}

function groupByMonth(submissions: Submission[]): Record<string, MonthGroup[]> {
    const byYear: Record<string, Map<string, MonthGroup>> = {}

    for (const paper of submissions) {
        if (!paper.published_at) continue
        const date = new Date(paper.published_at)
        const year = String(date.getFullYear())
        const monthLabel = date.toLocaleString('en-US', { month: 'long', year: 'numeric' })

        byYear[year] ??= new Map()
        if (!byYear[year].has(monthLabel)) {
            byYear[year].set(monthLabel, { year, monthLabel, papers: [] })
        }
        byYear[year].get(monthLabel)!.papers.push(paper)
    }

    const result: Record<string, MonthGroup[]> = {}
    for (const [year, monthMap] of Object.entries(byYear)) {
        result[year] = Array.from(monthMap.values())
    }
    return result
}

const MonthArchives = () => {
    const navigate = useNavigate()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        listPublishedSubmissions()
            .then(setSubmissions)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const groups = useMemo(() => groupByMonth(submissions), [submissions])
    const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a))

    if (loading) return <p className="text-sm text-body">Loading published issues…</p>
    if (error) return <p className="text-sm text-red-500">{error}</p>
    if (years.length === 0) {
        return (
            <p className="text-sm text-body">
                No issues have been published yet. Check back soon.
            </p>
        )
    }

    return (
        <div className="space-y-12">
            {years.map((year) => (
                <div key={year} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary font-extrabold text-lg">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Year {year} Archives
                        </h2>
                        <Badge variant="outline" className="ml-auto font-bold text-xs">
                            {groups[year].length} Monthly Issues
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups[year].map((month, idx) => (
                            <ScrollReveal key={month.monthLabel} delay={(idx % 3) * 0.08}>
                                <Card className="p-6 border border-hairline bg-surface-card hover:border-primary/40 transition-all flex flex-col justify-between space-y-5 shadow-xs h-full">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-hairline pb-3">
                                            <h3 className="text-lg font-extrabold text-ink tracking-tight">
                                                {month.monthLabel}
                                            </h3>
                                            <Badge className="bg-primary text-on-primary font-bold text-[10px]">
                                                {month.papers.length} papers
                                            </Badge>
                                        </div>
                                        <ul className="space-y-2.5">
                                            {month.papers.map((paper) => (
                                                <li
                                                    key={paper.id}
                                                    className="p-3 bg-surface-strong/60 rounded-xl border border-hairline hover:border-primary/30 transition-all space-y-1.5 group"
                                                >
                                                    <h4 className="text-xs font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                                                        {paper.title}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-[11px] text-body font-medium pt-0.5">
                                                        <span className="truncate max-w-[160px]">{paper.submission_code}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/archives/${paper.id}`)}
                                                            className="h-6 px-2 text-primary hover:bg-primary/10 font-bold text-[11px] flex items-center gap-1 shrink-0"
                                                        >
                                                            <span>View</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Card>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MonthArchives
