import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

const AuthorsGuide: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
                <div className="space-y-4 text-center">
                    <Badge variant="outline">Submission Guidelines</Badge>
                    <h1 className="text-display-xl text-ink font-semibold">Author Guidelines & Submission Workflow</h1>
                    <p className="text-body-md text-body">
                        Everything you need to prepare, format, and submit your research manuscript for publication in JERI.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 space-y-3">
                        <div className="w-10 h-10 rounded-md bg-surface-strong text-ink flex items-center justify-center font-bold text-lg">
                            1
                        </div>
                        <h3 className="text-title-md text-ink font-semibold">Manuscript Prep</h3>
                        <p className="text-body-sm text-body">
                            Format your paper using LaTeX or MS Word according to JERI 2-column guidelines with embedded vector figures.
                        </p>
                    </Card>

                    <Card className="p-6 space-y-3">
                        <div className="w-10 h-10 rounded-md bg-surface-strong text-ink flex items-center justify-center font-bold text-lg">
                            2
                        </div>
                        <h3 className="text-title-md text-ink font-semibold">Online Submission</h3>
                        <p className="text-body-sm text-body">
                            Log in to the Author Workspace, enter manuscript metadata, co-authors, and upload source files.
                        </p>
                    </Card>

                    <Card className="p-6 space-y-3">
                        <div className="w-10 h-10 rounded-md bg-surface-strong text-ink flex items-center justify-center font-bold text-lg">
                            3
                        </div>
                        <h3 className="text-title-md text-ink font-semibold">Peer Review</h3>
                        <p className="text-body-sm text-body">
                            Track reviewer feedback in real-time and submit revised drafts directly through your dashboard.
                        </p>
                    </Card>
                </div>

                <Card className="p-6 space-y-6">
                    <h2 className="text-display-sm text-ink font-semibold">Required Manuscript Sections</h2>
                    <div className="space-y-4 text-body-sm text-body">
                        <div className="p-4 bg-canvas-soft rounded-lg border border-hairline">
                            <strong className="text-ink">1. Title & Abstract:</strong> Concise title (under 20 words) and structured abstract (200-250 words) summarizing Problem, Method, Results, and Impact.
                        </div>
                        <div className="p-4 bg-canvas-soft rounded-lg border border-hairline">
                            <strong className="text-ink">2. Source Files & Figures:</strong> High-resolution figures (300+ DPI, PNG/EPS) and full bibtex bibliography file.
                        </div>
                        <div className="p-4 bg-canvas-soft rounded-lg border border-hairline">
                            <strong className="text-ink">3. Author Declaration:</strong> Conflicts of interest declaration and confirmation of original unpublished work.
                        </div>
                    </div>
                </Card>

                <div className="text-center pt-6">
                    <Button size="lg" onClick={() => navigate('/sign-in')} className="flex items-center gap-2 mx-auto">
                        <span>Sign In to Submit Manuscript</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </main>
        </div>
    )
}

export default AuthorsGuide
