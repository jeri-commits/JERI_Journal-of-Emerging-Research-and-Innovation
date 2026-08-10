import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    Lock, 
    LogIn, 
    UserPlus, 
    CheckCircle2, 
    FileText, 
    UploadCloud, 
    Clock, 
    Download, 
    MessageSquare, 
    FileCheck, 
    Sparkles, 
    ShieldAlert,
    LayoutDashboard
} from 'lucide-react'

const PaperSubmissions: React.FC = () => {
    const navigate = useNavigate()

    const authorCapabilities = [
        { label: 'Submit a New Manuscript', icon: UploadCloud },
        { label: 'View Submitted Papers', icon: FileText },
        { label: 'Track Submission Status', icon: Clock },
        { label: 'Upload Revised Manuscripts', icon: FileCheck },
        { label: 'View Editorial Decisions', icon: CheckCircle2 },
        { label: 'Download Decision Letters', icon: Download },
        { label: 'Communicate with Editorial Office', icon: MessageSquare },
    ]

    const afterLoginFeatures = [
        'New Submission',
        'My Manuscripts',
        'Revision Requests',
        'Accepted Papers',
        'Profile Settings',
    ]

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans relative overflow-hidden">
            <main className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4 w-full relative z-10">
                
                {/* Compact Header Title */}
                <div className="space-y-1.5 text-center">
                    <Badge variant="outline" className="gap-1.5 py-0.5 px-3 text-primary border-primary/20 bg-primary/5 text-[11px]">
                        <Sparkles className="h-3 w-3" />
                        <span>Online Submission Portal</span>
                    </Badge>
                    <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
                        Submit Your Manuscript
                    </h1>
                </div>

                {/* Single Frame Submission Container */}
                <div className="relative rounded-2xl overflow-hidden p-0.5">
                    
                    {/* Blurred Background Layer (Submission Guidelines) */}
                    <div className="absolute inset-0 z-0 p-6 blur-[5px] opacity-35 select-none pointer-events-none bg-surface-card border border-hairline rounded-2xl space-y-3">
                        <h2 className="text-lg font-bold text-ink">Submission Guidelines</h2>
                        <p className="text-xs text-body leading-relaxed">
                            Authors are required to submit their manuscripts through the JERI Online Submission System.
                        </p>
                        <div className="space-y-1 text-xs text-body">
                            <p className="font-semibold text-ink">Manuscripts submitted to JERI must:</p>
                            <ul className="space-y-1 pl-4 list-disc">
                                <li>Be original and unpublished.</li>
                                <li>Not be under consideration for publication elsewhere.</li>
                                <li>Follow the journal's submission and ethical guidelines.</li>
                                <li>Include complete and accurate author information.</li>
                                <li>Clearly state the contribution and significance of the research.</li>
                                <li>Meet the required formatting and manuscript preparation guidelines.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Compact Single-Frame Foreground Glassmorphic Login Modal */}
                    <div className="relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-5 md:p-7 shadow-xl space-y-4 max-w-2xl mx-auto text-center">
                        
                        {/* Lock Icon & Login Required Badge */}
                        <div className="flex items-center justify-center gap-2.5">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Lock className="h-5 w-5" />
                            </div>
                            <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-xs">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span>Login Required — Must Login to Submit a Paper</span>
                            </Badge>
                        </div>

                        {/* Title & Explanatory Text */}
                        <div className="space-y-1.5 max-w-lg mx-auto">
                            <h2 className="text-lg md:text-xl font-extrabold text-ink tracking-tight">
                                Authentication Required
                            </h2>
                        </div>

                        {/* After Login Capabilities Grid (Compact 2-Column) */}
                        <div className="space-y-2 text-left bg-surface-strong/50 p-4 rounded-xl border border-hairline">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-primary text-center">
                                After logging in, you will be able to:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {authorCapabilities.map((item, idx) => {
                                    const IconComp = item.icon
                                    return (
                                        <div key={idx} className="flex items-center gap-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg border border-hairline text-[11px] font-semibold text-ink truncate">
                                            <IconComp className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 pt-1">
                            <Button 
                                size="sm" 
                                onClick={() => navigate('/sign-in')}
                                className="bg-primary text-on-primary hover:bg-primary-active font-bold px-7 rounded-full shadow-xs flex items-center gap-1.5 text-xs"
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                <span>Login</span>
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate('/sign-up')}
                                className="border-primary/30 text-primary font-bold px-7 rounded-full hover:bg-primary/10 text-xs"
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Create an Account</span>
                            </Button>
                        </div>

                        {/* Integrated Author Dashboard Features Bar */}
                        <div className="pt-2 border-t border-hairline flex flex-wrap items-center justify-center gap-2 text-[11px]">
                            <span className="font-bold text-body flex items-center gap-1">
                                <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                                <span>Author Dashboard Access:</span>
                            </span>
                            {afterLoginFeatures.map((feat, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-surface-strong rounded-md font-semibold text-ink text-[10px]">
                                    {feat}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>

            </main>
        </div>
    )
}

export default PaperSubmissions
