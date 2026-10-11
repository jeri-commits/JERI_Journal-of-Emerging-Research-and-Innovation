import React from 'react'
import { Badge } from '@/components/ui/badge'
import ScrollReveal from '@/components/shared/ScrollReveal'
import MonthArchives from './components/MonthArchives'

const Archives: React.FC = () => {
    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full">
                <ScrollReveal>
                <div className="space-y-4 text-center">
                    <Badge variant="outline" className="py-1 px-4 text-primary border-primary/20 bg-primary/5">
                        Journal Archives
                    </Badge>
                    <h1 className="text-display-lg md:text-display-xl text-ink font-extrabold tracking-tight">
                        Monthly Issues & Publication Records
                    </h1>
                    <p className="text-body-md text-body max-w-2xl mx-auto leading-relaxed">
                        Browse open access monthly issues published by the Journal of Emerging Research and Innovation.
                    </p>
                </div>
                </ScrollReveal>

                {/* Reusable Month Archives Component */}
                <MonthArchives />
            </main>
        </div>
    )
}

export default Archives
