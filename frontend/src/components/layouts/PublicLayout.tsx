import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth'
import LayoutBase from '@/components/template/LayoutBase'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import { ArrowRight, LogOut, LayoutDashboard } from 'lucide-react'
import type { CommonProps } from '@/@types/common'

const PublicLayout: React.FC<CommonProps> = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { authenticated, user, signOut } = useAuth()
    const userRole = user?.authority?.[0]

    const handleDashboardRedirect = () => {
        if (userRole === 'admin') {
            navigate('/admin')
        } else if (userRole === 'author') {
            navigate('/author')
        } else {
            navigate('/author')
        }
    }

    const publicNavLinks = [
        { label: 'Home', path: '/' },
        { label: 'Author Guidelines', path: '/author-guidelines' },
        { label: 'Archives', path: '/archives' },
        { label: 'Paper Submissions', path: '/paper-submissions' },
        { label: 'Editorial Board', path: '/editorial-board' },
        { label: 'Ethics Statements', path: '/ethics-statements' },
        { label: 'Contact Us', path: '/contact-us' },
    ]

    return (
        <LayoutBase type={LAYOUT_COLLAPSIBLE_SIDE} className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
            {/* Non-Sticky Public Header */}
            <header className="w-full bg-canvas border-b border-hairline-strong">
                {/* Row 1: Logo & Journal Data Side-by-Side (Centered Block) */}
                <div className="bg-surface-strong border-b border-hairline py-8 px-6 w-full flex items-center justify-center">
                    <div className="flex items-center gap-5 text-left">
                        <Link to="/" className="shrink-0">
                            <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-3xl shadow-md border-2 border-white/20">
                                J
                            </div>
                        </Link>
                        <div className="space-y-1">
                            <h1 className="font-extrabold text-2xl md:text-3xl text-ink tracking-tight">
                                Journal of Emerging Research and Innovation (JERI)
                            </h1>
                            <p className="text-xs md:text-sm text-body font-medium">
                                Published By JERI Publishing Group · ISSN: 2789-9123 (Online) · Impact Factor: 4.8
                            </p>
                        </div>
                    </div>
                </div>

                {/* Row 2: Sub-Navbar Navigation Bar (All Public Sections + Login Button) */}
                <div className="bg-canvas border-b border-hairline py-2.5 px-4 md:px-8 w-full">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <nav className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm font-semibold text-body">
                            {publicNavLinks.map((link) => (
                                <Link 
                                    key={link.path}
                                    to={link.path} 
                                    className={`hover:text-ink transition-colors whitespace-nowrap ${
                                        location.pathname === link.path 
                                            ? 'text-primary font-bold border-b-2 border-primary pb-0.5' 
                                            : ''
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 shrink-0">
                            {authenticated ? (
                                <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={handleDashboardRedirect} className="flex items-center gap-1.5 rounded-full px-4 text-xs">
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                        <span>{userRole === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out" className="h-8 w-8">
                                        <LogOut className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    size="sm"
                                    onClick={() => navigate('/sign-in')} 
                                    className="rounded-full px-5 flex items-center gap-1.5 text-xs shadow-sm whitespace-nowrap"
                                >
                                    <span>Login</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Public Layout Main View */}
            <main className="flex-1">{children}</main>

            {/* Public Layout Footer */}
            <footer className="bg-canvas border-t border-hairline py-12 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-body-sm text-body">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-primary text-on-primary rounded flex items-center justify-center font-bold text-sm">
                            J
                        </div>
                        <span className="font-semibold text-ink">Journal of Emerging Research and Innovation (JERI)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        {publicNavLinks.map((link) => (
                            <Link key={link.path} to={link.path} className="hover:text-ink">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="text-caption text-muted">
                        © {new Date().getFullYear()} JERI Publishing Group. Open Access Peer-Reviewed Journal.
                    </div>
                </div>
            </footer>
        </LayoutBase>
    )
}

export default PublicLayout
