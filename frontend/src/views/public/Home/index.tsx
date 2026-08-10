import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    Target, 
    Compass, 
    Rocket, 
    CheckCircle2, 
    Layers, 
    Cpu, 
    TrendingUp, 
    Users, 
    BookOpen, 
    Leaf, 
    Activity, 
    GitFork, 
    Calendar,
    ArrowRight,
    Sparkles,
    Globe,
    GraduationCap,
    ShieldCheck
} from 'lucide-react'

const Home: React.FC = () => {
    const navigate = useNavigate()

    const keyHighlights = [
        {
            title: 'Rigorous Double-Blind Peer Review',
            desc: 'All submitted manuscripts undergo double-blind peer review by international experts to ensure analytical rigor, reproducibility, and originality.',
            icon: GraduationCap,
        },
        {
            title: 'Global Open Access',
            desc: 'Full text of all published articles is made freely available worldwide under Creative Commons licensing with zero paywall barriers.',
            icon: Globe,
        },
        {
            title: 'High Editorial Standards',
            desc: 'Strict adherence to COPE publication ethics, transparent review workflows, and dedicated author support throughout the submission process.',
            icon: ShieldCheck,
        },
    ]

    const scopeDomains = [
        {
            title: 'Engineering & Technology',
            desc: 'Computer science, electronics, mechanical, civil, and electrical engineering research.',
            icon: Cpu,
        },
        {
            title: 'Applied & Emerging Technologies',
            desc: 'Artificial intelligence, machine learning, IoT, robotics, quantum computing, and nanotechnology.',
            icon: Sparkles,
        },
        {
            title: 'Management & Business Innovation',
            desc: 'Organizational strategy, entrepreneurship, fintech, and innovation management.',
            icon: TrendingUp,
        },
        {
            title: 'Social Sciences & Humanities',
            desc: 'Interdisciplinary inquiry into society, culture, policy, ethics, and human behavior.',
            icon: Users,
        },
        {
            title: 'Education & Pedagogical Innovation',
            desc: 'Teaching methods, modern curriculum design, and digital learning technologies.',
            icon: BookOpen,
        },
        {
            title: 'Environmental Science & Sustainability',
            desc: 'Climate change, conservation, clean energy, and sustainable engineering systems.',
            icon: Leaf,
        },
        {
            title: 'Health Sciences & Biotechnology',
            desc: 'Biomedical research, public health, computational biology, and biotechnological innovation.',
            icon: Activity,
        },
        {
            title: 'Interdisciplinary & Applied Research',
            desc: 'Cross-cutting research crossing conventional disciplinary boundaries in pursuit of practical impact.',
            icon: GitFork,
        },
    ]

    const historyTimeline = [
        {
            year: '2026',
            status: 'Founded',
            desc: 'JERI is established as an open-access, multidisciplinary journal, with an international editorial board and double-blind peer review process set up ahead of the first call for papers.',
            current: false,
        },
        {
            year: '2026',
            status: 'In Progress',
            desc: 'Volume 1 opens for submissions. Manuscripts are accepted on a rolling basis and reviewed through a double-blind process.',
            current: true,
        },
        {
            year: 'Ahead',
            status: 'Planned',
            desc: "Volume 1 publication, followed by pursuit of indexing in major scientific databases and discovery services as the journal's publication record grows.",
            current: false,
        },
    ]

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-16">
                
                {/* Hero Title Section */}
                <div className="bg-gradient-to-br from-[#0d74ce]/[0.08] via-canvas to-canvas border border-[#0d74ce]/15 p-8 md:p-12 rounded-3xl text-center space-y-5 shadow-xs">
                    <Badge variant="outline" className="gap-2 py-1 px-4 bg-white/90 dark:bg-gray-900/90 text-primary border-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Peer-Reviewed Open Access Scientific Journal</span>
                    </Badge>
                    <h1 className="text-display-lg md:text-display-xl text-ink font-extrabold tracking-tight">
                        Journal of Emerging Research and Innovation (JERI)
                    </h1>
                    <p className="text-base md:text-lg text-primary font-bold tracking-wide">
                        Published By Sir Padampat Singhania University, Udaipur
                    </p>
                    <p className="text-body-md text-body max-w-3xl mx-auto pt-2">
                        JERI is a peer-reviewed open access scientific journal committed to publishing groundbreaking interdisciplinary research across engineering, emerging technologies, science, management, and humanities.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Button 
                            size="lg" 
                            onClick={() => navigate('/sign-in')}
                            className="bg-primary text-on-primary hover:bg-primary/90 font-bold px-8 rounded-full shadow-md flex items-center gap-2"
                        >
                            <span>Submit Manuscript</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => navigate('/author-guidelines')}
                            className="font-bold px-8 rounded-full border-hairline hover:bg-surface-strong"
                        >
                            Author Guidelines
                        </Button>
                    </div>
                </div>

                {/* Key Highlights Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {keyHighlights.map((item, idx) => {
                        const IconComp = item.icon
                        return (
                            <Card key={idx} className="p-6 space-y-3 border border-hairline bg-surface-card hover:shadow-md transition-shadow">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit">
                                    <IconComp className="h-6 w-6" />
                                </div>
                                <h3 className="text-title-md text-ink font-semibold">{item.title}</h3>
                                <p className="text-body-sm text-body leading-relaxed">
                                    {item.desc}
                                </p>
                            </Card>
                        )
                    })}
                </section>

                {/* About the Journal Detailed Overview */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            About the Journal
                        </h2>
                    </div>

                    <div className="bg-surface-card border border-hairline p-6 md:p-8 rounded-2xl space-y-5 text-body-md text-body leading-relaxed shadow-xs">
                        <p>
                            The <strong className="text-ink font-semibold">Journal of Emerging Research and Innovation (JERI)</strong> is a peer-reviewed, open-access platform dedicated to publishing high-quality original research, review articles, case studies, and innovative ideas across multiple disciplines. JERI aims to serve as a bridge between academia, industry, and society by promoting cutting-edge research that addresses real-world challenges and contributes to knowledge advancement.
                        </p>
                        <p>
                            The journal welcomes contributions from students, researchers, academicians, and professionals working in emerging fields of science, engineering, technology, management, and social sciences. JERI is committed to maintaining high standards of academic integrity through a rigorous double-blind peer-review process, ensuring that published work is original, relevant, and impactful.
                        </p>
                        <p className="font-medium text-ink">
                            Our mission is to provide a credible and accessible platform where new and innovative ideas can be shared with the global research community, fostering collaboration and driving progress in emerging areas of research.
                        </p>
                    </div>
                </section>

                {/* Aim, Vision & Mission Cards */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Target className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Aim & Scope
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Aim Card */}
                        <Card className="p-6 md:p-8 space-y-4 border border-hairline bg-surface-card hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Target className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-ink">Aim</h3>
                            </div>
                            <p className="text-body-sm text-body leading-relaxed">
                                JERI aims to promote and disseminate high-quality, original research that explores emerging trends, innovative solutions, and interdisciplinary approaches to contemporary problems — encouraging young researchers and established scholars alike to publish work that pushes the boundaries of existing knowledge.
                            </p>
                        </Card>

                        {/* Vision Card */}
                        <Card className="p-6 md:p-8 space-y-4 border border-hairline bg-surface-card hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Compass className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-ink">Vision</h3>
                            </div>
                            <p className="text-body-sm text-body leading-relaxed">
                                To be a globally recognized platform where emerging research — regardless of discipline or the author's career stage — can reach a wider academic and professional audience, and where early ideas are given the same editorial rigor as established ones.
                            </p>
                        </Card>
                    </div>

                    {/* Mission Full-Width Card */}
                    <Card className="p-6 md:p-8 space-y-6 border border-hairline bg-surface-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 border-b border-hairline pb-4">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Rocket className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-ink">Mission</h3>
                                <p className="text-xs text-body font-medium">Core commitments guiding our editorial philosophy</p>
                            </div>
                        </div>

                        <p className="text-body-sm text-body leading-relaxed font-medium">
                            To publish rigorously reviewed, original research with genuine real-world relevance, and to keep that research freely accessible — removing the barriers that often separate good work from the people who need to read it.
                        </p>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">In practice, this means:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-3.5 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs md:text-sm text-ink font-medium leading-normal">
                                        Supporting early-career researchers and students alongside established scholars, with the same editorial standard applied to both.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3 p-3.5 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs md:text-sm text-ink font-medium leading-normal">
                                        Encouraging interdisciplinary work that doesn't fit neatly into a single field or a single journal's usual scope.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3 p-3.5 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs md:text-sm text-ink font-medium leading-normal">
                                        Running a transparent, double-blind review process with clear timelines and constructive feedback.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3 p-3.5 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs md:text-sm text-ink font-medium leading-normal">
                                        Publishing under open access, so no reader is stopped by a paywall.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Scope Grid Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-hairline pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Layers className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                                    Journal Scope & Key Domains
                                </h2>
                                <p className="text-xs text-body font-medium">Multidisciplinary fields & research domains covered by JERI</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {scopeDomains.map((domain, idx) => {
                            const IconComp = domain.icon
                            return (
                                <Card key={idx} className="p-5 space-y-3 border border-hairline bg-surface-card hover:border-primary/40 hover:shadow-sm transition-all group">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary w-fit group-hover:scale-105 transition-transform">
                                        <IconComp className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">
                                        {domain.title}
                                    </h4>
                                    <p className="text-xs text-body leading-relaxed">
                                        {domain.desc}
                                    </p>
                                </Card>
                            )
                        })}
                    </div>
                </section>

                {/* Journal History & Timeline Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                                Journal History
                            </h2>
                            <p className="text-xs text-body font-medium">Founding timeline & milestones ahead</p>
                        </div>
                    </div>

                    <Card className="p-6 md:p-8 border border-hairline bg-surface-card space-y-6">
                        <p className="text-body-sm text-body">
                            JERI is a newly established journal. Rather than a long publication record, here's the founding timeline and the milestones ahead:
                        </p>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-hairline">
                            {historyTimeline.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 relative pl-8">
                                    <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                                        item.current ? 'bg-primary border-primary text-white' : 'bg-surface-card border-primary text-primary'
                                    }`}>
                                        <span className="w-2 h-2 rounded-full bg-current" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-extrabold text-ink">{item.year}</span>
                                            <Badge variant={item.current ? 'default' : 'outline'} className="text-[10px] uppercase font-bold py-0.5">
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs md:text-sm text-body leading-relaxed font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                {/* Call to Action Banner */}
                <div className="bg-primary text-on-primary p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-lg relative overflow-hidden">
                    <div className="max-w-2xl mx-auto space-y-3 relative z-10">
                        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Ready to Publish Your Innovation with JERI?
                        </h3>
                        <p className="text-xs md:text-sm text-white/85 font-medium leading-relaxed">
                            Submit your original manuscript for double-blind peer review and share your research with the global scientific community.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
                        <Button 
                            size="lg" 
                            onClick={() => navigate('/sign-in')}
                            className="bg-canvas text-primary hover:bg-gray-100 font-bold px-8 rounded-full shadow-md flex items-center gap-2"
                        >
                            <span>Submit Manuscript</span>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => navigate('/author-guidelines')}
                            className="border-white/40 text-white hover:bg-white/10 font-bold px-8 rounded-full"
                        >
                            Author Guidelines
                        </Button>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default Home
