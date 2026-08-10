import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Calendar, FileText, ExternalLink, ArrowRight, BookOpen, Sparkles } from 'lucide-react'

export interface Paper {
    id: string
    title: string
    authors: string
    category: string
    link: string
}

export interface MonthArchiveData {
    monthName: string
    year: string
    issueCode: string
    status: 'Current Issue' | 'Published' | 'In Progress'
    papers: Paper[]
}

export interface YearArchiveGroup {
    year: string
    months: MonthArchiveData[]
}

const archiveDataByYear: YearArchiveGroup[] = [
    {
        year: '2026',
        months: [
            {
                monthName: 'August 2026',
                year: '2026',
                issueCode: 'Vol. 1 Issue 1',
                status: 'Current Issue',
                papers: [
                    {
                        id: 'p1',
                        title: 'Deep Learning Approaches in Autonomous Robotics & Edge Computing',
                        authors: 'Dr. A. Sharma, Prof. R. Mehta',
                        category: 'Computer Science',
                        link: '/sign-in',
                    },
                    {
                        id: 'p2',
                        title: 'Quantum Computing Algorithms for Renewable Energy Grid Optimization',
                        authors: 'Dr. S. Patel, Eng. M. Kumar',
                        category: 'Applied Technology',
                        link: '/sign-in',
                    },
                    {
                        id: 'p3',
                        title: 'Blockchain-Based Decentralized Identity Verification Frameworks',
                        authors: 'Prof. K. Verma, Dr. N. Gupta',
                        category: 'Cybersecurity',
                        link: '/sign-in',
                    },
                ],
            },
            {
                monthName: 'July 2026',
                year: '2026',
                issueCode: 'Vol. 1 Special Issue',
                status: 'Published',
                papers: [
                    {
                        id: 'p4',
                        title: 'Artificial Intelligence in Modern Healthcare & Biomedical Diagnostic Tools',
                        authors: 'Dr. R. Iyer, Dr. L. Chopra',
                        category: 'Biotechnology',
                        link: '/sign-in',
                    },
                    {
                        id: 'p5',
                        title: 'Sustainable Infrastructure & Smart Materials for Clean Urban Systems',
                        authors: 'Eng. H. Singh, Prof. V. Roy',
                        category: 'Environmental Science',
                        link: '/sign-in',
                    },
                ],
            },
            {
                monthName: 'June 2026',
                year: '2026',
                issueCode: 'Vol. 1 Pre-Issue',
                status: 'Published',
                papers: [
                    {
                        id: 'p6',
                        title: 'Digital Transformation Paradigms in Global Innovation Management',
                        authors: 'Dr. T. Agarwal, Dr. C. Joshi',
                        category: 'Management & Business',
                        link: '/sign-in',
                    },
                    {
                        id: 'p7',
                        title: 'Next-Generation IoT Protocols for Smart Grid Communications',
                        authors: 'Prof. D. Sen, Eng. B. Paul',
                        category: 'Electronics & Networks',
                        link: '/sign-in',
                    },
                ],
            },
        ],
    },
]

const MonthArchives: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="space-y-12">
            {archiveDataByYear.map((yearGroup) => (
                <div key={yearGroup.year} className="space-y-6">
                    {/* Year Header Badge */}
                    <div className="flex items-center gap-3 border-b border-hairline pb-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary font-extrabold text-lg">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Year {yearGroup.year} Archives
                        </h2>
                        <Badge variant="outline" className="ml-auto font-bold text-xs">
                            {yearGroup.months.length} Monthly Issues
                        </Badge>
                    </div>

                    {/* Months Grid (2 to 3 Months per Row) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {yearGroup.months.map((monthData) => (
                            <Card 
                                key={monthData.monthName} 
                                className="p-6 border border-hairline bg-surface-card hover:border-primary/40 transition-all flex flex-col justify-between space-y-5 shadow-xs"
                            >
                                <div className="space-y-4">
                                    {/* Month Card Header */}
                                    <div className="flex items-center justify-between border-b border-hairline pb-3">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-ink tracking-tight">
                                                {monthData.monthName}
                                            </h3>
                                            <p className="text-[11px] font-semibold text-primary">
                                                {monthData.issueCode}
                                            </p>
                                        </div>
                                        <Badge 
                                            variant={monthData.status === 'Current Issue' ? 'default' : 'outline'}
                                            className={monthData.status === 'Current Issue' ? 'bg-primary text-on-primary font-bold text-[10px]' : 'text-xs font-semibold'}
                                        >
                                            {monthData.status}
                                        </Badge>
                                    </div>

                                    {/* List of Paper Names & Visit Links */}
                                    <div className="space-y-3">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-body">
                                            Published Papers ({monthData.papers.length}):
                                        </p>
                                        <ul className="space-y-2.5">
                                            {monthData.papers.map((paper) => (
                                                <li 
                                                    key={paper.id}
                                                    className="p-3 bg-surface-strong/60 rounded-xl border border-hairline hover:border-primary/30 transition-all space-y-1.5 group"
                                                >
                                                    <h4 className="text-xs font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                                                        {paper.title}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-[11px] text-body font-medium pt-0.5">
                                                        <span className="truncate max-w-[160px]">{paper.authors}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(paper.link)}
                                                            className="h-6 px-2 text-primary hover:bg-primary/10 font-bold text-[11px] flex items-center gap-1 shrink-0"
                                                        >
                                                            <span>Visit</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Month Card Footer Action */}
                                <div className="pt-3 border-t border-hairline flex items-center justify-between">
                                    <span className="text-[11px] text-body font-medium">Open Access (CC-BY 4.0)</span>
                                    <Button 
                                        variant="outline"
                                        size="sm" 
                                        onClick={() => navigate('/sign-in')}
                                        className="text-xs font-bold text-primary border-primary/30 hover:bg-primary hover:text-white transition-colors"
                                    >
                                        View Full Issue
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MonthArchives
