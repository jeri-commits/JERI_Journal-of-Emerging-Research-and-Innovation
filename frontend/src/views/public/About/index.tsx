import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Globe, GraduationCap } from 'lucide-react'

const AboutJournal: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
                <div className="space-y-4 text-center">
                    <Badge variant="outline">About the Journal</Badge>
                    <h1 className="text-display-xl text-ink font-semibold">Journal of Emerging Research and Innovation</h1>
                    <p className="text-body-md text-body">
                        JERI is a peer-reviewed open access scientific journal committed to publishing groundbreaking interdisciplinary research across physical sciences, computer science, and engineering.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    <Card className="p-6 space-y-3">
                        <GraduationCap className="h-8 w-8 text-text-link" />
                        <h3 className="text-title-md text-ink font-semibold">Rigorous Peer Review</h3>
                        <p className="text-body-sm text-body">
                            All submitted manuscripts undergo double-blind peer review by international experts to ensure analytical rigor, reproducibility, and originality.
                        </p>
                    </Card>

                    <Card className="p-6 space-y-3">
                        <Globe className="h-8 w-8 text-text-link" />
                        <h3 className="text-title-md text-ink font-semibold">Global Open Access</h3>
                        <p className="text-body-sm text-body">
                            Full text of all published articles is made freely available worldwide under Creative Commons licensing with zero paywall barriers.
                        </p>
                    </Card>
                </div>

                <Card className="p-6 space-y-6">
                    <h2 className="text-display-sm text-ink font-semibold">Editorial Scope & Key Domains</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-body-sm text-body">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Artificial Intelligence & Machine Learning</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Quantum Computing & Nanotechnology</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Biotechnology & Computational Biology</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Clean Energy & Environmental Engineering</span>
                        </li>
                    </ul>
                </Card>

                <div className="text-center pt-8">
                    <Button size="lg" onClick={() => navigate('/sign-in')}>
                        Submit Your Manuscript to JERI
                    </Button>
                </div>
            </main>
        </div>
    )
}

export default AboutJournal
