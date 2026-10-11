import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { Award, Crown, Building2, UserCheck, ShieldCheck } from 'lucide-react'

const EditorialBoard: React.FC = () => {
    // 1. Leadership
    const leadership = [
        {
            name: 'Prof. (Dr.) Prasun Chakrabarti',
            role: 'Editor-in-Chief',
            designation: 'Pro-President (Research & Academics)',
            affiliation: 'Senior Professor, DCI, SPSU',
            isChief: true,
        },
        {
            name: 'Prof. (Dr.) Amit Kumar Goel',
            role: 'Associate Editor-in-Chief',
            designation: 'Dean',
            affiliation: 'Dean DCI, SPSU',
            isChief: false,
        },
    ]

    // 2. Advisory Editors
    const advisoryEditors = [
        {
            name: 'Prof. Naveen Kumar',
            affiliation: 'DIAT',
        },
        {
            name: 'Prof. (Dr.) Anandkumar Atalbihari Bhaskar',
            affiliation: 'Department of Computing and Informatics, Sir Padampat Singhania University, Udaipur, Rajasthan, India',
        },
        {
            name: 'Dr. Kamal Kant Hiran',
            affiliation: 'Department of Computing and Informatics, Sir Padampat Singhania University, Udaipur, Rajasthan, India',
        },
        {
            name: 'Dr. Chandani Joshi',
            affiliation: 'Department of Computing and Informatics, Sir Padampat Singhania University, Udaipur, Rajasthan, India',
        },
        {
            name: 'Dr. Rahul Kumar',
            affiliation: 'Department of Computing and Informatics, Sir Padampat Singhania University, Udaipur, Rajasthan, India',
        },
    ]

    // 3. Editorial Board Members (37 Members)
    const boardMembers = [
        'Dr. Poonam Saini',
        'Dr. Harish Tiwari',
        'Dr. Manish Tiwari',
        'Dr. Manuj Joshi',
        'Dr. Brajesh Kumar Sharma',
        'Dr. Arun Vaishnav',
        'Dr. Priyanka Sisodia',
        'Mr. Ajay Shankar',
        'Mr. Dipesh Vaya',
        'Ms. Sonali Dhave',
        'Mr. Sunit Kumar Meena',
        'Mr. Arvind Singh Rathore',
        'Mr. Adnan Pipawala',
        'Ms. Konika Abid',
        'Ms. Roopali Kachhi',
        'Mr. Ashish Sen',
        'Ms. Priyanka Jaroli',
        'Mr. Anurag Anand Duvey',
        'Dr. Emmanuel Daanoba Sunkari',
        'Dr. Pankaj Mohan Rastogi',
        'Dr. Deepak Pandey',
        'Dr. Manjeet Singh',
        'Dr. Avinash Ojha',
        'Dr. Lokesh Gupta',
        'Lt. (Dr.) D. S. Chouhan',
        'Dr. Prithvi Singh',
        'Dr. Arvind Sharma',
        'Dr. Yashovardhan Vyas',
        'Dr. Shibani Banerjee',
        'Mr. Abhinav Kumar Suryavanshi',
        'Ms. Yasha Purohit',
        'Er. Anil Kumar',
        'Dr. Disha Mathur',
        'Dr. Imran Anwar',
        'Dr. Neeti Mathur',
        'Dr. Mohd. Tariq Jamal',
        'Dr. Sanjay Kumar Yadav',
    ]

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full">
                
                {/* Header Banner */}
                <div className="space-y-4 text-center">
                    <Badge variant="outline" className="gap-2 py-1 px-4 text-primary border-primary/20 bg-primary/5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Academic Governance & Oversight</span>
                    </Badge>
                    <h1 className="text-display-lg md:text-display-xl text-ink font-extrabold tracking-tight">
                        Editorial Board
                    </h1>
                    <p className="text-body-md text-body max-w-3xl mx-auto leading-relaxed">
                        The Journal of Emerging Research and Innovation (JERI) is guided by an experienced Editorial Board comprising distinguished academicians, researchers, and professionals committed to maintaining the highest standards of scholarly publishing and peer review.
                    </p>
                </div>

                {/* Section 1: Executive Leadership (Editor-in-Chief & Associate Editor-in-Chief) */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-hairline pb-3">
                        <Crown className="h-5 w-5 text-primary" />
                        <h2 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
                            Executive Leadership
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {leadership.map((item) => (
                            <Card 
                                key={item.name} 
                                className={`p-6 border-2 transition-all shadow-sm space-y-4 ${
                                    item.isChief 
                                        ? 'border-primary/40 bg-gradient-to-br from-primary/5 via-surface-card to-surface-card' 
                                        : 'border-hairline bg-surface-card'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <Badge 
                                            className={item.isChief ? 'bg-primary text-on-primary font-bold' : 'bg-primary/10 text-primary border border-primary/20 font-bold'}
                                        >
                                            {item.role}
                                        </Badge>
                                        <h3 className="text-xl font-extrabold text-ink pt-1 tracking-tight">
                                            {item.name}
                                        </h3>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                                        {item.isChief ? <Crown className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                                    </div>
                                </div>

                                <div className="space-y-1 text-xs md:text-sm text-body pt-2 border-t border-hairline">
                                    <p className="font-semibold text-ink flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                                        <span>{item.designation}</span>
                                    </p>
                                    <p className="text-body/80 pl-6 font-medium">
                                        {item.affiliation}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
                </ScrollReveal>

                {/* Section 2: Advisory Editors */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center gap-2.5 border-b border-hairline pb-3">
                        <Award className="h-5 w-5 text-primary" />
                        <h2 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
                            Advisory Editors
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {advisoryEditors.map((adv, idx) => (
                            <Card key={idx} className="p-5 space-y-2 border border-hairline bg-surface-card hover:border-primary/40 transition-all shadow-xs">
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/20 bg-primary/5">
                                    Advisory Editor
                                </Badge>
                                <h3 className="text-base font-bold text-ink leading-snug">
                                    {adv.name}
                                </h3>
                                <p className="text-xs text-body leading-relaxed font-medium">
                                    {adv.affiliation}
                                </p>
                            </Card>
                        ))}
                    </div>
                </section>
                </ScrollReveal>

                {/* Section 3: Editorial Board Members (37 Members Grid) */}
                <ScrollReveal>
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-hairline pb-3">
                        <div className="flex items-center gap-2.5">
                            <UserCheck className="h-5 w-5 text-primary" />
                            <h2 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
                                Editorial Board Members
                            </h2>
                        </div>
                        <Badge variant="secondary" className="font-bold text-xs">
                            {boardMembers.length} Members
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {boardMembers.map((member, idx) => (
                            <div 
                                key={idx} 
                                className="p-3.5 bg-surface-card rounded-2xl border border-hairline hover:border-primary/40 transition-all shadow-xs flex items-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {member.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors truncate">
                                        {member}
                                    </p>
                                    <p className="text-[10px] text-body font-medium">Editorial Board Member</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                </ScrollReveal>

            </main>
        </div>
    )
}

export default EditorialBoard
