import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/auth'
import { 
    ArrowRight, 
    Sparkles, 
    CheckCircle2, 
    GraduationCap,
    Users
} from 'lucide-react'

const PublicLanding: React.FC = () => {
    const navigate = useNavigate()
    const { authenticated, user } = useAuth()
    const userRole = user?.authority?.[0]

    const handleDashboardRedirect = () => {
        if (userRole === 'admin') {
            navigate('/admin')
        } else if (userRole === 'author') {
            navigate('/author')
        } else {
            navigate('/author')
        }
    }

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            {/* Hero Section with Sky Gradient Wash */}
            <section className="hero-sky-wash pt-20 pb-24 px-6 relative overflow-hidden border-b border-hairline">
                <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
                    <Badge variant="outline" className="gap-2 py-1 px-4 bg-white/80 backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5 text-text-link" />
                        <span>Peer-Reviewed Open Access Research Journal</span>
                    </Badge>

                    <h1 className="text-display-mega text-ink max-w-4xl mx-auto">
                        Advancing Global Discovery in Science & Technology
                    </h1>

                    <p className="text-body-md text-body max-w-2xl mx-auto leading-relaxed">
                        JERI is a premier double-blind peer-reviewed international publication dedicated to cutting-edge research in Artificial Intelligence, Quantum Systems, Renewable Energy, and Biotechnology.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        {authenticated ? (
                            <Button size="lg" onClick={handleDashboardRedirect}>
                                Open My Dashboard
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" onClick={() => navigate('/sign-in')} className="flex items-center gap-2">
                                    <span>Author Login & Submission</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => navigate('/authors-info')}>
                                    Author Guidelines
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Key Metrics Strip */}
                    <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <Card className="bg-white/90 backdrop-blur-sm text-center py-5">
                            <div className="text-display-md text-ink font-semibold">4.8</div>
                            <div className="text-caption text-body">Impact Factor</div>
                        </Card>
                        <Card className="bg-white/90 backdrop-blur-sm text-center py-5">
                            <div className="text-display-md text-ink font-semibold">14 Days</div>
                            <div className="text-caption text-body">First Decision</div>
                        </Card>
                        <Card className="bg-white/90 backdrop-blur-sm text-center py-5">
                            <div className="text-display-md text-ink font-semibold">100%</div>
                            <div className="text-caption text-body">Open Access</div>
                        </Card>
                        <Card className="bg-white/90 backdrop-blur-sm text-center py-5">
                            <div className="text-display-md text-ink font-semibold">Double-Blind</div>
                            <div className="text-caption text-body">Peer Review</div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Featured Articles Section */}
            <section id="issues" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-6">
                    <div>
                        <span className="text-caption-uppercase text-text-link">Current Issue · Vol 12 No 4</span>
                        <h2 className="text-display-lg text-ink font-semibold mt-1">Featured Published Research</h2>
                    </div>
                    <Link to="/about" className="text-text-link font-medium text-sm flex items-center gap-1 hover:underline">
                        <span>View Journal Index</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                            <Badge>Artificial Intelligence</Badge>
                            <h3 className="text-title-md text-ink hover:text-text-link cursor-pointer transition-colors">
                                Scalable Neural Architecture Search for Edge Devices in Autonomous Systems
                            </h3>
                            <p className="text-body-sm text-body line-clamp-3">
                                We propose a lightweight NAS framework utilizing multi-objective Pareto optimization to reduce memory bandwidth requirements by 42% on embedded micro-controllers.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-hairline mt-6 flex items-center justify-between text-caption text-body">
                            <span>Dr. E. Vance et al.</span>
                            <span>DOI: 10.1016/jeri.2026.041</span>
                        </div>
                    </Card>

                    <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                            <Badge>Quantum Physics</Badge>
                            <h3 className="text-title-md text-ink hover:text-text-link cursor-pointer transition-colors">
                                Room-Temperature Superconducting Qubits via Diamond Nitrogen-Vacancy Centers
                            </h3>
                            <p className="text-body-sm text-body line-clamp-3">
                                Experimental validation of spin coherence times exceeding 1.2 milliseconds at room ambient pressure, establishing a new paradigm for fault-tolerant quantum computing.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-hairline mt-6 flex items-center justify-between text-caption text-body">
                            <span>Prof. M. Zhang et al.</span>
                            <span>DOI: 10.1016/jeri.2026.042</span>
                        </div>
                    </Card>

                    <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                            <Badge>Biotechnology</Badge>
                            <h3 className="text-title-md text-ink hover:text-text-link cursor-pointer transition-colors">
                                CRISPR-Cas14 Precision Editing for Targeted Gene Suppression in Cancer Immunotherapy
                            </h3>
                            <p className="text-body-sm text-body line-clamp-3">
                                In vitro analysis demonstrating 98.4% target specificity with zero off-target genomic cleavage, unlocking novel therapeutic pathways for solid tumor treatment.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-hairline mt-6 flex items-center justify-between text-caption text-body">
                            <span>Dr. K. Patel et al.</span>
                            <span>DOI: 10.1016/jeri.2026.043</span>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Editorial Personas & Workflow Section */}
            <section className="bg-surface-dark text-on-dark py-20 px-6 border-t border-b border-surface-dark">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <Badge variant="outline" className="text-white border-white/20">Dedicated Workspaces</Badge>
                        <h2 className="text-display-lg text-white">Streamlined Workflows for Authors and Editors</h2>
                        <p className="text-body-md text-on-dark-soft">
                            Our integrated editorial platform provides tailored persona dashboards designed for real-time submission tracking, peer review management, and decision publishing.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {/* Author Workspace Card */}
                        <div className="bg-surface-dark-elevated rounded-xl p-8 border border-white/10 space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-text-link/20 text-accent-link-bright flex items-center justify-center text-2xl">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-display-sm text-white">Author Workspace</h3>
                                <p className="text-body-sm text-on-dark-soft">
                                    Submit manuscripts, track peer review progression stage-by-stage, upload revised drafts, and interact directly with assigned section editors.
                                </p>
                                <ul className="space-y-2 text-body-sm text-on-dark-soft">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span>Real-time manuscript status dashboard</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span>Automated reviewer comment timelines</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span>Instant PDF proof & citation exports</span>
                                    </li>
                                </ul>
                            </div>
                            <Button 
                                onClick={() => navigate('/sign-in')}
                                className="bg-white text-surface-dark hover:bg-gray-100 font-semibold w-full"
                            >
                                Author Sign In / Dashboard
                            </Button>
                        </div>

                        {/* Admin / Editor Workspace Card */}
                        <div className="bg-surface-dark-elevated rounded-xl p-8 border border-white/10 space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/20 text-accent-preview flex items-center justify-center text-2xl">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-display-sm text-white">Admin & Editor Portal</h3>
                                <p className="text-body-sm text-on-dark-soft">
                                    Comprehensive oversight over journal submissions, reviewer invitations, decision logging, volume publications, and user access roles.
                                </p>
                                <ul className="space-y-2 text-body-sm text-on-dark-soft">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span>Editorial submission triage queue</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span>Automated peer reviewer assignment</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span>Volume & Issue publication controls</span>
                                    </li>
                                </ul>
                            </div>
                            <Button 
                                onClick={() => navigate('/sign-in')}
                                className="bg-white text-surface-dark hover:bg-gray-100 font-semibold w-full"
                            >
                                Admin Sign In / Portal
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PublicLanding
