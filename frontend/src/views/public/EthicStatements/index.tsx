import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, FileCheck, AlertTriangle } from 'lucide-react'

const EthicStatements: React.FC = () => {
    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 space-y-12 w-full">
                <div className="space-y-4 text-center">
                    <Badge variant="outline">Publication Integrity</Badge>
                    <h1 className="text-display-xl text-ink font-semibold">Publication Ethics & Malpractice Statements</h1>
                    <p className="text-body-md text-body max-w-2xl mx-auto">
                        JERI strictly adheres to the COPE (Committee on Publication Ethics) guidelines for peer review and research integrity.
                    </p>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-ink font-semibold text-lg">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span>Authorship & Originality</span>
                        </div>
                        <p className="text-body-sm text-body leading-relaxed">
                            Submissions must represent original, unpublished research. Plagiarism in any form, including self-plagiarism or verbatim text copying without proper citation, will result in immediate rejection.
                        </p>
                    </Card>

                    <Card className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-ink font-semibold text-lg">
                            <FileCheck className="h-5 w-5 text-text-link" />
                            <span>Peer Review Responsibility</span>
                        </div>
                        <p className="text-body-sm text-body leading-relaxed">
                            All prospective reviewers are required to declare any conflicts of interest and maintain complete confidentiality regarding submitted manuscripts.
                        </p>
                    </Card>

                    <Card className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-ink font-semibold text-lg">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <span>Conflict of Interest Disclosure</span>
                        </div>
                        <p className="text-body-sm text-body leading-relaxed">
                            Authors must disclose all financial, institutional, or commercial support related to the submitted work at the time of online manuscript upload.
                        </p>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default EthicStatements
