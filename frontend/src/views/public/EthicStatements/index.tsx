import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    ShieldCheck, 
    FileText, 
    AlertTriangle, 
    CheckCircle2, 
    Sparkles, 
    Lock, 
    FileCheck, 
    Scale, 
    Users, 
    BookOpen, 
    HeartHandshake, 
    BrainCircuit, 
    Eye, 
    Award,
    Ban
} from 'lucide-react'

const EthicStatements: React.FC = () => {
    const ethicsSections = [
        {
            number: '1',
            title: 'Publication Ethics',
            icon: ShieldCheck,
            content: `JERI expects all manuscripts to represent original scholarly work and to follow accepted standards of research and publication ethics.
Authors must ensure that:
• The manuscript is original and has not been published previously.
• The manuscript is not simultaneously under consideration by another journal.
• All sources and previously published work are appropriately acknowledged and cited.
• The research findings are reported accurately and transparently.
• Fabrication, falsification, plagiarism, duplicate publication, and other forms of research misconduct are strictly prohibited.
• Appropriate permissions are obtained when copyrighted materials are reproduced.
• All relevant ethical approvals are obtained where research involves human participants, animals, personal data, or other regulated materials.
JERI reserves the right to investigate suspected ethical violations and take appropriate action in accordance with established publication-ethics practices.`
        },
        {
            number: '2',
            title: 'Plagiarism and Similarity',
            icon: Ban,
            content: `JERI enforces a zero-tolerance policy against plagiarism, text recycling, and self-plagiarism. All submitted manuscripts undergo rigorous similarity analysis using advanced plagiarism detection software prior to peer review. Manuscripts exceeding acceptable similarity thresholds or containing uncited verbatim text will be returned to the authors or rejected immediately.`
        },
        {
            number: '3',
            title: 'Authorship and Contribution',
            icon: Users,
            content: `Authorship credit must be restricted to individuals who made substantial contributions to the conception, design, execution, data collection, or interpretation of the study. All listed co-authors must approve the final manuscript before submission. A maximum of six (6) co-authors is permitted per manuscript unless explicit interdisciplinary justification is approved by the Editorial Office.`
        },
        {
            number: '4',
            title: 'Responsibilities of Authors',
            icon: FileCheck,
            content: `Authors must present an accurate account of research performed, maintain raw data records for verification upon request, properly cite all sources, declare any financial or non-financial conflicts of interest, and proactively notify the Editorial Office if a significant error or inaccuracy is discovered post-publication.`
        },
        {
            number: '5',
            title: 'Duplicate and Redundant Publication',
            icon: AlertTriangle,
            content: `Simultaneous submission of the same manuscript to multiple journals or publishing duplicate papers based on identical datasets without clear cross-referencing is strictly prohibited. Manuscripts found to be redundant will be rejected or retracted immediately.`
        },
        {
            number: '6',
            title: 'Research Data and Reproducibility',
            icon: FileText,
            content: `JERI encourages authors to deposit research datasets, code scripts, and experimental protocols into public repositories to facilitate scientific reproducibility, verification, and knowledge advancement.`
        },
        {
            number: '7',
            title: 'Conflicts of Interest',
            icon: Scale,
            content: `All authors, reviewers, and editors must disclose any personal, commercial, academic, or financial conflicts of interest that could inappropriately influence or bias their judgment during submission, review, or publication.`
        },
        {
            number: '8',
            title: 'Funding Disclosure',
            icon: Award,
            content: `Authors must explicitly state all sources of research funding, grant numbers, and sponsor roles in the Acknowledgements or Funding section of the manuscript prior to peer review.`
        },
        {
            number: '9',
            title: 'Ethical Approval and Human/Animal Research',
            icon: HeartHandshake,
            content: `Research involving human subjects must comply with the Declaration of Helsinki and have written approval from an Institutional Review Board (IRB) or Ethics Committee. Informed consent must be obtained from all human participants. Studies involving animals must provide formal animal ethics committee approval.`
        },
        {
            number: '10',
            title: 'Use of Artificial Intelligence and Generative AI',
            icon: BrainCircuit,
            content: `Artificial Intelligence (AI) tools, Large Language Models (LLMs), and automated writing assistants cannot be credited as authors. Authors using generative AI for drafting or data analysis must transparently disclose the AI tool name, version, and scope of usage in the manuscript methodology or acknowledgements.`
        },
        {
            number: '11',
            title: "Reviewer's Responsibilities",
            icon: Eye,
            content: `Peer reviewers must evaluate manuscripts objectively, constructively, and impartially without personal bias. Reviewers are required to maintain strict confidentiality of manuscript content, complete reviews within agreed timelines, and immediately disclose any potential conflict of interest.`
        },
        {
            number: '12',
            title: "Editor's Responsibilities",
            icon: ShieldCheck,
            content: `Editors are responsible for maintaining double-blind peer review integrity, guarding confidential author and reviewer data, evaluating manuscripts solely on scientific merit, and ensuring fair, unbiased editorial decisions free from commercial interest.`
        },
        {
            number: '13',
            title: 'Peer-Review Ethics',
            icon: Lock,
            content: `JERI employs a rigorous double-blind peer-review system. Both reviewer identities and author identities remain strictly anonymous throughout evaluation to ensure complete objectivity and fairness.`
        },
        {
            number: '14',
            title: 'Editorial Decisions',
            icon: CheckCircle2,
            content: `Acceptance, revision, or rejection decisions are governed strictly by the manuscript's academic quality, originality, methodological validity, reviewer assessments, and alignment with the journal's scope.`
        },
        {
            number: '15',
            title: 'Corrections and Retractions',
            icon: AlertTriangle,
            content: `When genuine errors, data inaccuracies, or ethical breaches are identified in published articles, JERI will issue Errata, Corrigenda, or Retraction Notices promptly in alignment with Committee on Publication Ethics (COPE) guidelines.`
        },
        {
            number: '16',
            title: 'Complaints and Appeals',
            icon: Scale,
            content: `Authors have the right to submit a formal written appeal to the Editorial Office regarding an editorial decision or peer-review grievance. Appeals are reviewed impartially by the Associate Editor-in-Chief and Advisory Board.`
        },
        {
            number: '17',
            title: 'Copyright and Open Access',
            icon: BookOpen,
            content: `All articles published in JERI are distributed under the Creative Commons Attribution 4.0 International License (CC-BY 4.0). Authors retain full copyright of their work while granting JERI first publication rights.`
        },
        {
            number: '18',
            title: 'Article Processing Charges (APC)',
            icon: Sparkles,
            content: `JERI is a completely non-commercial, open-access journal and does NOT charge any Article Processing Charges (APC), submission fees, or publishing fees to authors.`
        },
        {
            number: '19',
            title: 'Publication Schedule',
            icon: FileText,
            content: `JERI maintains a continuous open-access publication schedule, making peer-reviewed articles publicly available immediately upon final typesetting and proof approval.`
        },
        {
            number: '20',
            title: 'Ethical Commitment',
            icon: ShieldCheck,
            content: `JERI remains steadfastly committed to upholding these core publication ethics principles and actively investigating any suspected violations to protect the integrity of the scholarly record.`
        },
    ]

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full">
                
                {/* Header Banner */}
                <div className="space-y-4 text-center">
                    <Badge variant="outline" className="gap-2 py-1 px-4 text-primary border-primary/20 bg-primary/5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Publication Ethics & Integrity</span>
                    </Badge>
                    <h1 className="text-display-lg md:text-display-xl text-ink font-extrabold tracking-tight">
                        Ethics Statements
                    </h1>
                    <p className="text-sm md:text-base font-bold text-primary">
                        Journal of Emerging Research and Innovation (JERI)
                    </p>
                    <p className="text-body-md text-body max-w-3xl mx-auto leading-relaxed">
                        The Journal of Emerging Research and Innovation (JERI) is committed to maintaining the highest standards of publication ethics, academic integrity, transparency, and responsible scholarly communication.
                    </p>
                </div>

                {/* Free APC Banner Notice */}
                <div className="p-6 bg-surface-card border-2 border-primary/30 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="space-y-1">
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-xs">
                            100% Free Open Access • Zero APC
                        </Badge>
                        <h3 className="text-base font-bold text-ink">Zero Article Processing Charges</h3>
                        <p className="text-xs text-body font-medium">
                            JERI does not charge authors any APC, submission fees, or publication fees. Editorial decisions are based solely on academic quality, originality, and methodological rigor.
                        </p>
                    </div>
                    <Sparkles className="h-10 w-10 text-primary shrink-0 opacity-80" />
                </div>

                {/* 20 Ethics Sections Grid */}
                <div className="space-y-6">
                    {ethicsSections.map((sec) => {
                        const IconComp = sec.icon
                        return (
                            <Card key={sec.number} className="p-6 md:p-8 space-y-4 border border-hairline bg-surface-card hover:border-primary/40 transition-all shadow-xs">
                                <div className="flex items-center gap-3 border-b border-hairline pb-3">
                                    <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-extrabold text-xs flex items-center justify-center shrink-0">
                                        {sec.number}
                                    </span>
                                    <h2 className="text-lg md:text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
                                        <IconComp className="h-5 w-5 text-primary shrink-0" />
                                        <span>{sec.title}</span>
                                    </h2>
                                </div>
                                <div className="text-body-sm text-body leading-relaxed whitespace-pre-line font-medium">
                                    {sec.content}
                                </div>
                            </Card>
                        )
                    })}
                </div>

                {/* Section 20 Core Values Ending Banner */}
                <Card className="p-8 md:p-10 border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-surface-card to-surface-card text-center space-y-6 shadow-md rounded-3xl">
                    <div className="flex justify-center">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
                            Core Ethical Values
                        </h3>
                        <p className="text-xs md:text-sm font-extrabold text-primary tracking-wide uppercase">
                            Originality • Integrity • Transparency • Accountability • Fairness • Confidentiality • Academic Excellence
                        </p>
                    </div>

                    <p className="text-xs md:text-sm text-body leading-relaxed max-w-2xl mx-auto font-medium">
                        JERI remains steadfastly committed to upholding these core publication ethics principles and actively investigating any suspected violations to protect the integrity of the scholarly record.
                    </p>
                </Card>

            </main>
        </div>
    )
}

export default EthicStatements
