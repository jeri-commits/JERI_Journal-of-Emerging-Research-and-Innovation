import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { SITE_NAME_FULL } from '@/constants/site.constant'
import { 
    FileText, 
    ShieldAlert, 
    Layers, 
    Grid, 
    Upload, 
    FileCheck, 
    Table, 
    Download, 
    Eye, 
    Copyright, 
    AlertOctagon, 
    CheckCircle2, 
    Mail, 
    Globe, 
    ArrowRight,
    Sparkles,
    DollarSign,
    BookOpen,
    UserCheck,
    Award
} from 'lucide-react'

const AuthorsGuide: React.FC = () => {
    const navigate = useNavigate()

    const paperTypes = [
        { title: 'Research Articles', desc: 'Original empirical research papers demonstrating analytical rigor, novel methodologies, and significant impact.' },
        { title: 'Review Articles', desc: 'Comprehensive critical evaluations of existing research literature and emerging technological developments.' },
        { title: 'Survey Articles', desc: 'Structured analytical surveys summarizing current trends, frameworks, and future research directions.' },
        { title: 'Short Communications', desc: 'Concise reports of significant preliminary research findings or novel experimental observations.' },
        { title: 'Technical Articles', desc: 'In-depth descriptions of novel engineering systems, algorithm implementations, or practical tools.' },
        { title: 'Case Studies', desc: 'Detailed real-world applications, industry deployments, or institutional observational analyses.' },
        { title: 'Innovative/Conceptual Articles', desc: 'High-potential theoretical frameworks, transformative concepts, and visionary paradigms.' },
    ]

    const areasOfInterest = [
        'Artificial Intelligence and Machine Learning',
        'Data Science and Big Data Analytics',
        'Computer Science and Information Technology',
        'Computer Networks and Cybersecurity',
        'Cloud Computing and Edge Computing',
        'Internet of Things and Smart Technologies',
        'Blockchain and Distributed Systems',
        'Software Engineering and Information Systems',
        'Robotics and Autonomous Systems',
        'Emerging Computing Technologies',
        'Electronics and Communication Engineering',
        'Electrical and Computer Engineering',
        'Healthcare Technologies and Biomedical Engineering',
        'Sustainable Technologies and Green Computing',
        'Engineering and Applied Sciences',
        'Digital Transformation and Industry 4.0',
        'Educational Technology and E-Learning',
        'Management, Innovation and Entrepreneurship',
        'Interdisciplinary and Emerging Research Domains',
    ]

    const formattingSpecifications = [
        { section: 'Title', format: 'Times New Roman, 24 pt, Bold' },
        { section: 'Author Names & Affiliations', format: 'Times New Roman, 11 pt' },
        { section: 'Abstract & Keywords', format: 'Times New Roman, 9 pt, Bold' },
        { section: 'Major Headings', format: 'Times New Roman, 10 pt, Uppercase' },
        { section: 'Subheadings', format: 'Times New Roman, 10 pt, Bold' },
        { section: 'Main Content', format: 'Times New Roman, 10 pt' },
        { section: 'References', format: 'Times New Roman, 8 pt' },
        { section: 'Author Biography', format: 'Times New Roman, 8 pt' },
    ]

    const peerReviewSteps = [
        {
            title: '1. Double-Blind Peer Review',
            desc: 'Every manuscript is evaluated anonymously by independent subject matter experts. Neither reviewers nor authors know each other’s identities.',
        },
        {
            title: '2. Reviewer Evaluation Criteria',
            desc: 'Submissions are assessed on novelty, technical correctness, methodological soundness, clarity of presentation, and relevance to the journal scope.',
        },
        {
            title: '3. Editorial Decision',
            desc: 'Based on peer recommendations, the handling editor renders a decision: Accept, Minor Revisions, Major Revisions, or Reject.',
        },
        {
            title: '4. Revision Policy',
            desc: 'Authors receiving revision requests must submit a point-by-point response alongside their revised manuscript within the stipulated timeframe.',
        },
        {
            title: '5. Acceptance and Publication',
            desc: 'Upon final acceptance, production formatting and proofing take place, culminating in open-access online publication.',
        },
    ]

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-16">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-[#0d74ce]/[0.08] via-canvas to-canvas border border-[#0d74ce]/15 p-8 md:p-12 rounded-3xl text-center space-y-4 shadow-xs">
                    <Badge variant="outline" className="gap-2 py-1 px-4 bg-white/90 dark:bg-gray-900/90 text-primary border-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Author Guidelines</span>
                    </Badge>
                    <h1 className="text-display-lg md:text-display-xl text-ink font-extrabold tracking-tight">
                        Welcome to {SITE_NAME_FULL}
                    </h1>
                    <p className="text-body-md text-body max-w-3xl mx-auto leading-relaxed">
                        Comprehensive guidelines for preparing, submitting, and publishing your research with complete editorial transparency and zero paywall barriers.
                    </p>
                </div>

                {/* Journal Introduction Section */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            About Author Submissions
                        </h2>
                    </div>

                    <div className="bg-surface-card border border-hairline p-6 md:p-8 rounded-2xl space-y-4 text-body-md text-body leading-relaxed shadow-xs">
                        <p>
                            <strong className="text-ink font-semibold">{SITE_NAME_FULL}</strong> is a scholarly, peer-reviewed, open-access international journal dedicated to publishing high-quality original research, innovative ideas, emerging technologies, and interdisciplinary studies across science, engineering, technology, management, and related academic domains.
                        </p>
                        <p>
                            JERI provides a global platform for researchers, academicians, scientists, industry professionals, and research scholars to share innovative research findings, emerging methodologies, technological developments, and practical solutions to contemporary challenges.
                        </p>
                        <p>
                            The journal aims to promote research excellence, innovation, interdisciplinary collaboration, and knowledge sharing among the global research community. JERI welcomes original and significant contributions that demonstrate novelty, technical quality, academic rigor, and potential impact.
                        </p>
                        <p className="font-medium text-ink">
                            All submitted manuscripts undergo a rigorous peer-review process by experts in the relevant subject area. Accepted papers are published online in the forthcoming issue after completion of the final publication formalities.
                        </p>
                    </div>
                </section>
                </ScrollReveal>

                {/* Article Processing Charges (APC) Zero Fee Highlight */}
                <ScrollReveal>
                <section className="bg-emerald-500/10 border border-emerald-500/30 p-6 md:p-8 rounded-3xl space-y-3">
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="h-7 w-7 shrink-0" />
                        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
                            Article Processing Charges (APC) — 100% Free
                        </h3>
                    </div>
                    <p className="text-body-md text-ink font-semibold leading-relaxed">
                        JERI does not charge any Article Processing Charges (APC). There are no submission fees, processing fees, or publication fees for authors.
                    </p>
                    <p className="text-xs text-body font-medium">
                        All accepted research is published open-access with full global availability under Creative Commons licensing.
                    </p>
                </section>
                </ScrollReveal>

                {/* Plagiarism Policy Warning */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Plagiarism Policy
                        </h2>
                    </div>

                    <Card className="p-6 md:p-8 border border-red-500/20 bg-red-500/[0.02] space-y-4">
                        <p className="text-body-sm text-body leading-relaxed">
                            Plagiarism and other forms of academic misconduct are considered serious violations of research and publication ethics.
                        </p>
                        <p className="text-body-sm text-body leading-relaxed">
                            JERI follows a strict policy against plagiarism, duplicate publication, self-plagiarism, fabrication, falsification, and other forms of research misconduct. All submitted manuscripts may be screened using recognized plagiarism-detection tools.
                        </p>
                        <p className="text-body-sm text-body leading-relaxed">
                            Manuscripts containing significant plagiarism or unethical content may be rejected immediately. If plagiarism or research misconduct is identified after publication, JERI reserves the right to investigate the matter and take appropriate action, which may include correction, retraction, or removal of the published article in accordance with applicable publication-ethics guidelines.
                        </p>
                        <div className="p-4 bg-white/80 dark:bg-gray-900/80 rounded-xl border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertOctagon className="h-4 w-4 shrink-0" />
                            <span>Authors are solely responsible for ensuring that their submissions are original and appropriately acknowledge all sources.</span>
                        </div>
                    </Card>
                </section>
                </ScrollReveal>

                {/* Types of Papers Accepted */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                                Types of Papers Accepted
                            </h2>
                            <p className="text-xs text-body font-medium">Categories of scholarly contributions welcomed by JERI</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {paperTypes.map((item, idx) => (
                            <Card key={idx} className="p-5 space-y-2 border border-hairline bg-surface-card hover:border-primary/40 transition-all">
                                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </div>
                                <p className="text-xs text-body leading-relaxed">
                                    {item.desc}
                                </p>
                            </Card>
                        ))}
                    </div>

                    <p className="text-xs font-semibold text-body italic text-center pt-2">
                        The submitted work should demonstrate academic relevance, originality, methodological soundness, and meaningful contribution to the selected field.
                    </p>
                </section>
                </ScrollReveal>

                {/* Areas of Interest (Scope) */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Grid className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                                Areas of Interest
                            </h2>
                            <p className="text-xs text-body font-medium">Multidisciplinary domains & research topics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {areasOfInterest.map((topic, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-3.5 bg-surface-card border border-hairline rounded-xl text-xs font-semibold text-ink hover:border-primary/40 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                <span>{topic}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs font-semibold text-body text-center pt-2">
                        JERI also encourages interdisciplinary research addressing real-world problems through innovative scientific and technological approaches.
                    </p>
                </section>
                </ScrollReveal>

                {/* Online Submission Requirements */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Upload className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Online Submission
                        </h2>
                    </div>

                    <Card className="p-6 md:p-8 space-y-6 border border-hairline bg-surface-card">
                        <p className="text-body-sm text-body leading-relaxed font-medium">
                            Authors are required to submit their manuscripts through the JERI Online Submission System.
                        </p>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Manuscripts submitted to JERI must:</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-ink font-medium">
                                <li className="flex items-center gap-2.5 p-3 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    <span>Be original and unpublished.</span>
                                </li>
                                <li className="flex items-center gap-2.5 p-3 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    <span>Not be under consideration for publication elsewhere.</span>
                                </li>
                                <li className="flex items-center gap-2.5 p-3 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    <span>Follow the journal&apos;s submission and ethical guidelines.</span>
                                </li>
                                <li className="flex items-center gap-2.5 p-3 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    <span>Include complete and accurate author information.</span>
                                </li>
                                <li className="flex items-center gap-2.5 p-3 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    <span>Clearly state the contribution and significance of research.</span>
                                </li>
                                <li className="flex items-center gap-2.5 p-3 bg-surface-strong/60 rounded-xl border border-hairline">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                    <span>Meet required formatting and preparation guidelines.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-2 flex justify-center">
                            <Button 
                                size="lg" 
                                onClick={() => navigate('/sign-in')}
                                className="bg-primary text-on-primary hover:bg-primary-active font-bold px-8 rounded-full shadow-md flex items-center gap-2"
                            >
                                <span>Access Online Submission Portal</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </section>
                </ScrollReveal>

                {/* Initial Submission & Author Rules */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FileCheck className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Initial Submission & Author Rules
                        </h2>
                    </div>

                    <Card className="p-6 md:p-8 space-y-4 border border-hairline bg-surface-card">
                        <p className="text-body-sm text-body leading-relaxed">
                            Authors may submit their original manuscripts in <strong className="text-ink">.doc</strong> or <strong className="text-ink">.docx</strong> format through the online submission system. The manuscript should contain sufficient information for editorial screening and peer review.
                        </p>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Mandatory Author Guidelines:</h4>
                            <ul className="space-y-2.5 text-xs text-ink font-medium">
                                <li className="flex items-start gap-3 p-3 bg-surface-strong/50 rounded-xl border border-hairline">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                    <span>A maximum of <strong>6 authors</strong> is permitted for a manuscript unless prior approval is obtained from the Editorial Board.</span>
                                </li>
                                <li className="flex items-start gap-3 p-3 bg-surface-strong/50 rounded-xl border border-hairline">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                    <span>All author names, affiliations, email addresses, and corresponding-author details must be entered correctly at the time of initial submission.</span>
                                </li>
                                <li className="flex items-start gap-3 p-3 bg-surface-strong/50 rounded-xl border border-hairline">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                    <span>Changes to authorship, author order, or corresponding author after submission will generally not be permitted without appropriate justification and approval from the Editorial Board.</span>
                                </li>
                                <li className="flex items-start gap-3 p-3 bg-surface-strong/50 rounded-xl border border-hairline">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                    <span>The manuscript must not have been published previously or be simultaneously submitted to another journal.</span>
                                </li>
                                <li className="flex items-start gap-3 p-3 bg-surface-strong/50 rounded-xl border border-hairline">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                    <span>Authors must ensure that all necessary permissions and ethical approvals, wherever applicable, have been obtained.</span>
                                </li>
                            </ul>
                        </div>
                    </Card>
                </section>
                </ScrollReveal>

                {/* Accepted Version Preparation */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Award className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Accepted Version
                        </h2>
                    </div>

                    <Card className="p-6 md:p-8 space-y-4 border border-hairline bg-surface-card">
                        <p className="text-body-sm text-body leading-relaxed">
                            After acceptance, authors must submit the final version of the manuscript through the online submission portal.
                        </p>
                        <p className="text-body-sm text-body leading-relaxed">
                            The final manuscript should be prepared according to the JERI Manuscript Template and must incorporate all corrections and recommendations provided during the review process.
                        </p>
                        <p className="text-xs font-semibold text-primary">
                            The editorial/production team may make necessary formatting and production adjustments to ensure consistency across published articles.
                        </p>
                    </Card>
                </section>
                </ScrollReveal>

                {/* Final Formatting Guidelines Table */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Table className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                                Final Manuscript Formatting Specifications
                            </h2>
                            <p className="text-xs text-body font-medium">Recommended typography & layout parameters</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-hairline rounded-2xl bg-surface-card shadow-xs">
                        <table className="w-full text-left border-collapse text-xs md:text-sm">
                            <thead>
                                <tr className="bg-primary/10 text-primary border-b border-hairline font-bold">
                                    <th className="p-4">Section</th>
                                    <th className="p-4">Recommended Format</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hairline font-medium text-ink">
                                {formattingSpecifications.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-surface-strong/50 transition-colors">
                                        <td className="p-4 font-semibold text-primary">{row.section}</td>
                                        <td className="p-4">{row.format}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs font-semibold text-body text-center pt-1">
                        Authors should ensure that tables, figures, equations, references, and other manuscript elements are clearly presented and appropriately numbered.
                    </p>
                </section>
                </ScrollReveal>

                {/* JERI Manuscript Templates Downloads */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Download className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                                JERI Manuscript Templates
                            </h2>
                            <p className="text-xs text-body font-medium">Official author templates for manuscript preparation</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 space-y-4 border border-hairline bg-surface-card flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 w-fit">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-ink">Template in Word Document</h3>
                                <p className="text-xs text-body leading-relaxed">
                                    Official Microsoft Word template (.docx) with formatted styles, headers, and reference styles.
                                </p>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 border-primary/30 text-primary font-bold hover:bg-primary hover:text-white transition-colors"
                            >
                                <a href="mailto:editor@jeri-journal.org?subject=Request%20for%20JERI%20Word%20Template">
                                    <Mail className="h-4 w-4" />
                                    <span>Request Word Template</span>
                                </a>
                            </Button>
                        </Card>

                        <Card className="p-6 space-y-4 border border-hairline bg-surface-card flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="p-2.5 bg-red-500/10 rounded-xl text-red-600 w-fit">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-ink">Template in PDF Document</h3>
                                <p className="text-xs text-body leading-relaxed">
                                    Sample PDF layout specification detailing column dimensions, margins, and typography.
                                </p>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 border-primary/30 text-primary font-bold hover:bg-primary hover:text-white transition-colors"
                            >
                                <a href="mailto:editor@jeri-journal.org?subject=Request%20for%20JERI%20PDF%20Specification">
                                    <Mail className="h-4 w-4" />
                                    <span>Request PDF Specification</span>
                                </a>
                            </Button>
                        </Card>
                    </div>
                </section>
                </ScrollReveal>

                {/* Peer Review Process */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Eye className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Peer-Review Process
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {peerReviewSteps.map((step, idx) => (
                            <Card key={idx} className="p-4 space-y-2 border border-hairline bg-surface-card">
                                <h4 className="text-xs font-extrabold text-primary">{step.title}</h4>
                                <p className="text-[11px] text-body leading-relaxed font-medium">{step.desc}</p>
                            </Card>
                        ))}
                    </div>
                </section>
                </ScrollReveal>

                {/* Copyright and Licensing */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Copyright className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Copyright and Licensing
                        </h2>
                    </div>

                    <Card className="p-6 md:p-8 space-y-4 border border-hairline bg-surface-card">
                        <p className="text-body-sm text-body leading-relaxed">
                            All articles published in JERI are licensed under Creative Commons Attribution 4.0 International (CC-BY 4.0). Authors retain copyright to their work while granting JERI a license to publish and distribute the article globally.
                        </p>
                        <div className="pt-2">
                            <Button asChild variant="outline" className="flex items-center gap-2 border-primary/30 text-primary font-bold">
                                <a href="mailto:editor@jeri-journal.org?subject=Request%20for%20JERI%20Copyright%20Form">
                                    <Mail className="h-4 w-4" />
                                    <span>Request Copyright Form</span>
                                </a>
                            </Button>
                        </div>
                    </Card>
                </section>
                </ScrollReveal>

                {/* Manuscript Withdrawal Policy */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <AlertOctagon className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Manuscript Withdrawal Policy
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-5 space-y-2 border border-hairline bg-surface-card">
                            <h4 className="text-sm font-bold text-ink">Withdrawal Before Acceptance</h4>
                            <p className="text-xs text-body leading-relaxed">
                                Authors may request withdrawal of their manuscript prior to editorial decision by submitting a formal written request signed by all co-authors.
                            </p>
                        </Card>
                        <Card className="p-5 space-y-2 border border-hairline bg-surface-card">
                            <h4 className="text-sm font-bold text-ink">Withdrawal After Acceptance</h4>
                            <p className="text-xs text-body leading-relaxed">
                                Withdrawal requests after formal acceptance are discouraged and permitted only under compelling, documented ethical or legal circumstances.
                            </p>
                        </Card>
                        <Card className="p-5 space-y-2 border border-hairline bg-surface-card">
                            <h4 className="text-sm font-bold text-ink">Withdrawal After Publication</h4>
                            <p className="text-xs text-body leading-relaxed">
                                Post-publication removal is subject to formal retraction procedures in compliance with international publication ethics guidelines.
                            </p>
                        </Card>
                    </div>
                </section>
                </ScrollReveal>

                {/* Quality & Ethics, Author Responsibilities, Disclaimer */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-hairline pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                            Ethics, Responsibilities & Editorial Disclaimer
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 space-y-3 border border-hairline bg-surface-card">
                            <h3 className="text-base font-bold text-ink">Quality & Publication Ethics</h3>
                            <p className="text-xs text-body leading-relaxed">
                                JERI adheres strictly to international publication ethics standards. Falsification, image manipulation, and duplicate publication are strictly prohibited.
                            </p>
                        </Card>
                        <Card className="p-6 space-y-3 border border-hairline bg-surface-card">
                            <h3 className="text-base font-bold text-ink">Author Responsibilities</h3>
                            <p className="text-xs text-body leading-relaxed">
                                Authors are responsible for data accuracy, proper citation of sources, reporting conflicts of interest, and obtaining ethical review approvals.
                            </p>
                        </Card>
                        <Card className="p-6 space-y-3 border border-hairline bg-surface-card">
                            <h3 className="text-base font-bold text-ink">Editorial Disclaimer</h3>
                            <p className="text-xs text-body leading-relaxed">
                                Statements and opinions expressed in published articles are solely those of the individual authors and do not reflect the endorsement of the Editorial Board.
                            </p>
                        </Card>
                    </div>
                </section>
                </ScrollReveal>

                {/* Contact the Editorial Office */}
                <ScrollReveal>
                <section className="bg-primary text-on-primary p-8 md:p-12 rounded-3xl space-y-6 shadow-lg">
                    <div className="space-y-2">
                        <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                            Editorial Office
                        </Badge>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            Contact the Editorial Office
                        </h3>
                        <p className="text-xs md:text-sm text-white/85 font-medium">
                            {SITE_NAME_FULL}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-xs font-medium">
                        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-xs">
                            <Mail className="h-6 w-6 text-white shrink-0" />
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Official Email</p>
                                <a href="mailto:editor@jeri-journal.org" className="text-white font-bold hover:underline">editor@jeri-journal.org</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-xs">
                            <Globe className="h-6 w-6 text-white shrink-0" />
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Official Website</p>
                                <span className="text-white font-bold">www.jeri-journal.org</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-xs">
                            <Upload className="h-6 w-6 text-white shrink-0" />
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Online Submission</p>
                                <span className="text-white font-bold">JERI Submission Portal</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-white/75 pt-2 leading-relaxed">
                        For queries regarding manuscript submission, peer review, publication, editorial policies, or technical issues, authors may contact the JERI Editorial Office.
                    </p>
                </section>
                </ScrollReveal>

            </main>
        </div>
    )
}

export default AuthorsGuide
