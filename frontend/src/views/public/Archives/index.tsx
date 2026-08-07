import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, Download } from 'lucide-react'

const Archives: React.FC = () => {
    const navigate = useNavigate()

    const volumes = [
        {
            volume: 'Volume 12 (2026)',
            issues: [
                { issue: 'Issue 4', date: 'October - December 2026', count: '14 Articles Published', status: 'Current Issue' },
                { issue: 'Issue 3', date: 'July - September 2026', count: '18 Articles Published', status: 'Archived' },
                { issue: 'Issue 2', date: 'April - June 2026', count: '16 Articles Published', status: 'Archived' },
                { issue: 'Issue 1', date: 'January - March 2026', count: '15 Articles Published', status: 'Archived' },
            ]
        },
        {
            volume: 'Volume 11 (2025)',
            issues: [
                { issue: 'Issue 4', date: 'October - December 2025', count: '20 Articles Published', status: 'Archived' },
                { issue: 'Issue 3', date: 'July - September 2025', count: '17 Articles Published', status: 'Archived' },
                { issue: 'Issue 2', date: 'April - June 2025', count: '19 Articles Published', status: 'Archived' },
                { issue: 'Issue 1', date: 'January - March 2025', count: '16 Articles Published', status: 'Archived' },
            ]
        }
    ]

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-5xl mx-auto px-6 py-16 space-y-12 w-full">
                <div className="space-y-4 text-center">
                    <Badge variant="outline">Journal Archives</Badge>
                    <h1 className="text-display-xl text-ink font-semibold">Published Volumes & Past Issues</h1>
                    <p className="text-body-md text-body max-w-2xl mx-auto">
                        Explore full-text open access volumes and back issues published by the Journal of Emerging Research and Innovation.
                    </p>
                </div>

                <div className="space-y-10">
                    {volumes.map((vol) => (
                        <div key={vol.volume} className="space-y-4">
                            <h2 className="text-display-sm text-ink font-semibold border-b border-hairline pb-2 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-text-link" />
                                <span>{vol.volume}</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vol.issues.map((iss) => (
                                    <Card key={iss.issue} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-ink text-base">{iss.issue}</span>
                                                <Badge variant={iss.status === 'Current Issue' ? 'default' : 'outline'}>
                                                    {iss.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-body-sm text-body">
                                                <Calendar className="h-4 w-4 text-muted" />
                                                <span>{iss.date}</span>
                                            </div>
                                            <p className="text-caption text-body pt-1">{iss.count}</p>
                                        </div>
                                        <div className="pt-4 mt-4 border-t border-hairline flex items-center justify-between">
                                            <Button variant="ghost" size="sm" onClick={() => navigate('/sign-in')} className="text-text-link text-xs flex items-center gap-1">
                                                <Download className="h-3.5 w-3.5" />
                                                <span>Download PDF Volume</span>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Archives
