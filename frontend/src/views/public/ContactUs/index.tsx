import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

const ContactUs: React.FC = () => {
    return (
        <div className="bg-canvas text-ink flex flex-col font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 space-y-12 w-full">
                <div className="space-y-4 text-center">
                    <Badge variant="outline">Get in Touch</Badge>
                    <h1 className="text-display-xl text-ink font-semibold">Contact Editorial Office</h1>
                    <p className="text-body-md text-body max-w-2xl mx-auto">
                        Have questions about manuscript submission, peer review status, or special issue proposals?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Card className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-ink text-sm">Editorial Inquiry</h4>
                                <p className="text-body-sm text-body">editor@jeri-journal.org</p>
                            </div>
                        </Card>

                        <Card className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-ink text-sm">Publishing Desk</h4>
                                <p className="text-body-sm text-body">+1 (650) 555-0198</p>
                            </div>
                        </Card>

                        <Card className="p-5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-ink text-sm">Headquarters</h4>
                                <p className="text-body-sm text-body">JERI Publishing Group, Palo Alto, CA</p>
                            </div>
                        </Card>
                    </div>

                    <Card className="p-6 space-y-4">
                        <h3 className="text-title-md text-ink font-semibold">Send Direct Message</h3>
                        <div className="space-y-3">
                            <Input placeholder="Your Name" />
                            <Input type="email" placeholder="Your Email Address" />
                            <textarea 
                                rows={4}
                                placeholder="Write your message here..."
                                className="w-full rounded-md border border-hairline bg-canvas p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button className="w-full flex items-center justify-center gap-2">
                                <span>Send Inquiry</span>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default ContactUs
