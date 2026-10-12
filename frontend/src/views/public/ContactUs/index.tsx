import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/Alert'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { invokeFunction } from '@/services/supabase/functionsClient'
import { SITE_NAME_FULL } from '@/constants/site.constant'
import {
    Mail,
    Globe,
    MapPin,
    Send,
    CheckCircle2,
    Building2,
    Sparkles,
    MessageSquareText
} from 'lucide-react'

const ContactUs: React.FC = () => {
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [sentToEmail, setSentToEmail] = useState('')
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (submitting) return
        if (!formData.fullName || !formData.email || !formData.message) return

        setSubmitting(true)
        setError('')
        try {
            await invokeFunction('send-contact-message', formData)
            setSentToEmail(formData.email)
            setSubmitted(true)
            setFormData({ fullName: '', email: '', subject: '', message: '' })
        } catch (err) {
            setError((err as Error).message || 'Could not send your message. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full">
                
                {/* Header Banner */}
                <ScrollReveal>
                <div className="space-y-4 text-center">
                    <Badge variant="outline" className="gap-2 py-1 px-4 text-primary border-primary/20 bg-primary/5">
                        <MessageSquareText className="h-3.5 w-3.5" />
                        <span>JERI Editorial Office Assistance</span>
                    </Badge>
                    <h1 className="text-display-lg md:text-display-xl text-ink font-extrabold tracking-tight">
                        Contact Us
                    </h1>
                    <p className="text-body-md text-body max-w-3xl mx-auto leading-relaxed">
                        Have questions regarding manuscript submission, peer review, publication policies, or the editorial process? The {SITE_NAME_FULL} Editorial Office is here to assist you. For all journal-related inquiries, please contact us using the details below.
                    </p>
                </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Official Contact Details & Support Scope (5 cols) */}
                    <ScrollReveal className="lg:col-span-5">
                    <div className="space-y-6">
                        
                        {/* Official Publisher & Address Card */}
                        <Card className="p-6 space-y-4 border border-hairline bg-surface-card shadow-xs">
                            <div className="flex items-center gap-3 border-b border-hairline pb-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-ink">Editorial Office</h3>
                                    <p className="text-xs text-primary font-semibold">Published by Sir Padampat Singhania University</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-xs text-body font-medium leading-relaxed">
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-ink">Sir Padampat Singhania University</p>
                                    <p>Bhatewar, Udaipur – 313 601</p>
                                    <p>Rajasthan, India</p>
                                </div>
                            </div>
                        </Card>

                        {/* Email & Subdomain Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            
                            {/* Email Card */}
                            <Card className="p-5 flex items-center gap-4 border border-hairline bg-surface-card hover:border-primary/40 transition-all shadow-xs">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5 truncate">
                                    <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-body">Official Email</h4>
                                    <a 
                                        href="mailto:jeri@spsu.ac.in" 
                                        className="text-sm font-bold text-primary hover:underline block truncate"
                                    >
                                        jeri@spsu.ac.in
                                    </a>
                                </div>
                            </Card>

                            {/* Subdomain Website Card */}
                            <Card className="p-5 flex items-center gap-4 border border-hairline bg-surface-card hover:border-primary/40 transition-all shadow-xs">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5 truncate">
                                    <h4 className="font-bold text-ink text-xs uppercase tracking-wider text-body">Official Subdomain</h4>
                                    <a 
                                        href="https://jeri.spsu.ac.in" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-sm font-bold text-primary hover:underline block truncate"
                                    >
                                        jeri.spsu.ac.in
                                    </a>
                                </div>
                            </Card>

                        </div>
                    </div>
                    </ScrollReveal>

                    {/* Right Column: Contact Form UI Component (7 cols) */}
                    <ScrollReveal className="lg:col-span-7" delay={0.1}>
                    <div>
                        <Card className="p-6 md:p-8 space-y-6 border-2 border-primary/20 bg-surface-card shadow-md rounded-3xl">
                            <div className="space-y-1.5 border-b border-hairline pb-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-extrabold text-ink tracking-tight">
                                        Send Message to Editorial Desk
                                    </h3>
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-xs text-body font-medium">
                                    Fill out the form below and our editorial team will respond to your query promptly.
                                </p>
                            </div>

                            {submitted ? (
                                <div className="p-8 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl text-center space-y-3">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                                    <h4 className="text-lg font-bold text-ink">Message Sent Successfully!</h4>
                                    <p className="text-xs text-body max-w-[28rem] mx-auto font-medium">
                                        Thank you for contacting JERI Editorial Office. We have received your inquiry and will get back to you shortly at <span className="font-bold text-ink">{sentToEmail}</span>.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSubmitted(false)}
                                        className="mt-2"
                                    >
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <Alert showIcon type="danger" className="text-xs">
                                            {error}
                                        </Alert>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-ink">Full Name <span className="text-red-500">*</span></label>
                                            <Input 
                                                required
                                                placeholder="Enter your full name" 
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="bg-canvas border-hairline focus:border-primary text-xs h-10 rounded-xl"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-ink">Email Address <span className="text-red-500">*</span></label>
                                            <Input 
                                                required
                                                type="email" 
                                                placeholder="e.g. author@university.edu" 
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-canvas border-hairline focus:border-primary text-xs h-10 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink">Subject</label>
                                        <Input 
                                            placeholder="e.g. Query regarding manuscript submission #1024" 
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="bg-canvas border-hairline focus:border-primary text-xs h-10 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink">Message <span className="text-red-500">*</span></label>
                                        <textarea 
                                            required
                                            rows={5}
                                            placeholder="Write your detailed inquiry or question here..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full rounded-xl border border-hairline bg-canvas p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary text-on-primary hover:bg-primary-active font-bold h-11 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs"
                                    >
                                        <span>{submitting ? 'Sending…' : 'Send Message'}</span>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            )}
                        </Card>
                    </div>
                    </ScrollReveal>

                </div>

            </main>
        </div>
    )
}

export default ContactUs
