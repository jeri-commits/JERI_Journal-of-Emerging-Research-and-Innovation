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
                {/* Row 1: Logo & Journal Title Banner on Clean White Background */}
                <div className="bg-canvas border-b border-hairline py-8 md:py-12">
                    <div className="container mx-auto px-8 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6 text-left flex-1 min-w-0">
                            <Link to="/" className="shrink-0 block">
                                <img 
                                    src="/img/logo/logo-full.png" 
                                    alt="JERI Journal Logo" 
                                    className="h-16 md:h-20 w-auto max-w-[260px] md:max-w-[300px] object-contain drop-shadow-sm transition-transform hover:scale-[1.02]" 
                                />
                            </Link>
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <h1 className="font-extrabold text-4xl md:text-4xl lg:text-5xl text-ink tracking-tight leading-tight">
                                    Journal of Emerging Research and Innovation (JERI)
                                </h1>
                                <p className="text-sm md:text-base text-body font-medium">
                                    Published By JERI Publishing Group · Open Access Peer-Reviewed International Journal
                                </p>
                            </div>
                        </div>

                        <div className="hidden lg:flex flex-col items-end text-xs font-semibold text-body tracking-wider uppercase bg-surface-strong/70 px-4 py-2.5 rounded-md border border-hairline shadow-xs shrink-0">
                            <span>ISSN : 2789-9123 (Online)</span>
                            <span className="text-[10px] text-muted font-normal uppercase">Impact Factor : 4.8</span>
                        </div>
                    </div>
                </div>

                {/* Row 2: Sub-Navbar Bar with Brand Blue (#0d74ce) Background */}
                <div 
                    style={{ backgroundColor: '#0d74ce' }} 
                    className="text-white border-b border-hairline py-3 md:py-4 shadow-md"
                >
                    <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-6">
                        <nav className="flex flex-wrap items-center gap-6 md:gap-8 text-sm md:text-base font-semibold">
                            {publicNavLinks.map((link) => (
                                <Link 
                                    key={link.path}
                                    to={link.path} 
                                    className={`transition-all whitespace-nowrap py-1 ${
                                        location.pathname === link.path 
                                            ? 'text-white font-bold border-b-2 border-white pb-0.5' 
                                            : 'text-white/90 hover:text-white hover:underline'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3 shrink-0">
                            {authenticated ? (
                                <div className="flex items-center gap-2">
                                    <Button 
                                        size="sm" 
                                        onClick={handleDashboardRedirect} 
                                        style={{ backgroundColor: '#ffffff', color: '#0d74ce' }}
                                        className="hover:bg-gray-100 flex items-center gap-1.5 rounded-full px-4 text-xs font-bold shadow-xs"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                        <span>{userRole === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={signOut} 
                                        title="Sign Out" 
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    size="sm"
                                    onClick={() => navigate('/sign-in')} 
                                    style={{ backgroundColor: '#ffffff', color: '#0d74ce' }}
                                    className="hover:bg-gray-100 font-bold rounded-full px-6 flex items-center gap-1.5 text-xs shadow-sm whitespace-nowrap"
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
            <main className="flex-1 w-full">{children}</main>

            {/* Public Layout Footer */}
            <footer className="bg-canvas border-t border-hairline py-12 mt-auto">
                <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-body-sm text-body">
                    <div className="flex items-center gap-3">
                        <img src="/img/logo/logo-full.png" alt="JERI Logo" className="h-8 w-auto max-w-[160px] object-contain" />
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
