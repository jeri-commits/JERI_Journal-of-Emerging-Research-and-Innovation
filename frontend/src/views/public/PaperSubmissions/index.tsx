import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, CheckCircle2, ShieldCheck } from 'lucide-react'

const PaperSubmissions: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 space-y-12 w-full">
                <div className="space-y-4 text-center">
                    <Badge variant="outline">Online Submissions</Badge>
                    <h1 className="text-display-xl text-ink font-semibold">Submit Your Research Paper</h1>
                    <p className="text-body-md text-body max-w-2xl mx-auto">
                        Submit your research manuscript online via the JERI Author Portal for double-blind peer review.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 space-y-4">
                        <UploadCloud className="h-8 w-8 text-text-link" />
                        <h3 className="text-title-md text-ink font-semibold">Online Submission Portal</h3>
                        <p className="text-body-sm text-body">
                            Registered authors can submit original research articles, review papers, and technical notes directly through the portal.
                        </p>
                        <Button onClick={() => navigate('/sign-in')} className="w-full">
                            Sign In & Submit Paper
                        </Button>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <ShieldCheck className="h-8 w-8 text-purple-600" />
                        <h3 className="text-title-md text-ink font-semibold">Pre-Submission Checklist</h3>
                        <ul className="space-y-2 text-body-sm text-body">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>Manuscript formatted in 2-column format</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>High resolution EPS/PNG vector figures</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>Full bibtex references attached</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default PaperSubmissions
