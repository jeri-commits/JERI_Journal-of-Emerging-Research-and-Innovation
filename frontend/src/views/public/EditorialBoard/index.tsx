import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Users, Award, Globe } from 'lucide-react'

const EditorialBoard: React.FC = () => {
    const editors = [
        {
            name: 'Dr. Sarah Jenkins',
            role: 'Editor-in-Chief',
            affiliation: 'Stanford University, Department of Computer Science',
            domain: 'Artificial Intelligence & Neural Architectures',
            avatar: 'SJ'
        },
        {
            name: 'Prof. Michael Zhang',
            role: 'Associate Editor',
            affiliation: 'MIT Quantum Laboratory',
            domain: 'Quantum Information & Condensed Matter',
            avatar: 'MZ'
        },
        {
            name: 'Dr. Elena Vance',
            role: 'Section Editor',
            affiliation: 'University of Cambridge, Bioengineering',
            domain: 'Computational Biology & Genomics',
            avatar: 'EV'
        },
        {
            name: 'Prof. Rajesh Kumar',
            role: 'Editorial Board Member',
            affiliation: 'Indian Institute of Technology (IIT) Delhi',
            domain: 'Renewable Energy & Power Electronics',
            avatar: 'RK'
        }
    ]

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-5xl mx-auto px-6 py-16 space-y-12 w-full">
                <div className="space-y-4 text-center">
                    <Badge variant="outline">Peer Review Oversight</Badge>
                    <h1 className="text-display-xl text-ink font-semibold">International Editorial Board</h1>
                    <p className="text-body-md text-body max-w-2xl mx-auto">
                        Distinguished international scholars leading peer review, research ethics, and publication standards for JERI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {editors.map((editor) => (
                        <Card key={editor.name} className="p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold text-lg flex items-center justify-center shrink-0">
                                {editor.avatar}
                            </div>
                            <div className="space-y-1">
                                <Badge variant="secondary" className="text-xs mb-1">
                                    {editor.role}
                                </Badge>
                                <h3 className="text-title-md text-ink font-semibold">{editor.name}</h3>
                                <p className="text-body-sm text-body font-medium">{editor.affiliation}</p>
                                <p className="text-caption text-text-link pt-1">{editor.domain}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default EditorialBoard
