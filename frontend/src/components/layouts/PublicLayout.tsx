import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth'
import LayoutBase from '@/components/template/LayoutBase'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import {
    ArrowRight,
    LogOut,
    LayoutDashboard,
    BookOpen,
    Atom,
    GraduationCap,
    ScrollText,
    Menu,
    X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CommonProps } from '@/@types/common'

const PublicLayout: React.FC<CommonProps> = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { authenticated, user, signOut } = useAuth()
    const userRole = user?.authority?.[0]
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    useEffect(() => {
        setMobileNavOpen(false)
    }, [location.pathname])

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

    // Tasteful Academic & Research Ambient Floating Icons (Minimal Background Touch)
    const bodyFloatingIcons = [
        { Icon: BookOpen, className: 'top-[10%] right-[6%] w-12 h-12 text-primary', opacity: 0.12, duration: 10, delay: 0, y: [0, -14, 0], rotate: [0, 8, -4, 0] },
        { Icon: GraduationCap, className: 'top-[30%] left-[4%] w-14 h-14 text-primary', opacity: 0.12, duration: 12, delay: 1, y: [0, -16, 0], rotate: [0, -10, 5, 0] },
        { Icon: Atom, className: 'top-[58%] right-[7%] w-12 h-12 text-primary', opacity: 0.10, duration: 11, delay: 0.5, y: [0, -14, 0], rotate: [0, 12, -6, 0] },
        { Icon: ScrollText, className: 'top-[82%] left-[5%] w-11 h-11 text-primary', opacity: 0.12, duration: 9, delay: 1.5, y: [0, -12, 0], rotate: [0, -8, 6, 0] },
    ]

    return (
        <LayoutBase type={LAYOUT_COLLAPSIBLE_SIDE} className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
            {/* Non-Sticky Public Header */}
            <header className="w-full bg-canvas border-b border-hairline-strong">
                {/* Row 1: Logo & Journal Title Banner on Clean White Background */}
                <div className="bg-canvas border-b border-hairline py-3.5 md:py-6">
                    <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3 md:gap-6 text-left flex-1 min-w-0">
                            <Link to="/" className="shrink-0 block">
                                <img
                                    src="/img/logo/jeri-logo.png"
                                    alt="JERI Journal Logo"
                                    className="h-12 md:h-24 w-auto max-w-[140px] md:max-w-[300px] object-contain drop-shadow-sm transition-transform hover:scale-[1.02]"
                                />
                            </Link>
                            <div className="flex-1 min-w-0 space-y-1">
                                <h1 className="font-extrabold text-base sm:text-xl md:text-3xl lg:text-4xl text-ink tracking-tight leading-tight">
                                    Journal of Emerging Research and Innovation (JERI)
                                </h1>
                                <p className="text-[11px] sm:text-sm md:text-base text-body font-medium">
                                    Published By Sir Padampat Singhania University, Udaipur
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Sub-Navbar Bar with Brand Blue (bg-primary) Background */}
                <div 
                    className="bg-primary text-on-primary py-2 md:py-2.5 shadow-md relative"
                >
                    <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4 md:gap-6">
                        <nav className="hidden lg:flex flex-nowrap items-center gap-1 xl:gap-2 text-sm font-bold">
                            {publicNavLinks.map((link) => {
                                const isActive = location.pathname === link.path
                                return (
                                    <Link 
                                        key={link.path}
                                        to={link.path} 
                                        className={`relative px-4 py-2 rounded-full font-bold transition-all duration-300 whitespace-nowrap group ${
                                            isActive 
                                                ? 'text-white' 
                                                : 'text-white/80 hover:text-white hover:bg-white/12'
                                        }`}
                                    >
                                        {/* Silky-Smooth Animated Pill Background */}
                                        {isActive && (
                                            <motion.div 
                                                layoutId="activeNavPill"
                                                className="absolute inset-0 bg-white/20 rounded-full border border-white/25 shadow-sm backdrop-blur-xs"
                                                transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.8 }}
                                            />
                                        )}

                                        {/* Nav Label Text */}
                                        <span className="relative z-10 font-bold tracking-wide">{link.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="hidden lg:flex items-center gap-3 shrink-0 py-1">
                            {authenticated ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={handleDashboardRedirect}
                                        className="bg-canvas text-primary hover:bg-gray-100 flex items-center gap-1.5 rounded-full px-4 text-xs font-bold shadow-xs transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                        <span>{userRole === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={signOut}
                                        title="Sign Out"
                                        className="h-8 w-8 text-white hover:bg-white/20 transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/sign-in')}
                                    className="bg-canvas text-primary hover:bg-gray-100 font-bold rounded-full px-6 flex items-center gap-1.5 text-xs shadow-sm whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
                                >
                                    <span>Login</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>

                        {/* Mobile: hamburger toggle replaces the full nav row */}
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen((v) => !v)}
                            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileNavOpen}
                            className="lg:hidden ml-auto flex items-center justify-center h-9 w-9 rounded-full text-white hover:bg-white/15 transition-colors"
                        >
                            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Mobile Nav Panel */}
                    <AnimatePresence>
                        {mobileNavOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="lg:hidden overflow-hidden border-t border-white/15"
                            >
                                <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
                                    {publicNavLinks.map((link) => {
                                        const isActive = location.pathname === link.path
                                        return (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                className={`px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                                                    isActive ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        )
                                    })}
                                    <div className="pt-2 mt-2 border-t border-white/15">
                                        {authenticated ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handleDashboardRedirect}
                                                    className="flex-1 bg-canvas text-primary hover:bg-gray-100 flex items-center justify-center gap-1.5 rounded-full text-xs font-bold"
                                                >
                                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                                    <span>{userRole === 'admin' ? 'Admin Dashboard' : 'Author Dashboard'}</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={signOut}
                                                    aria-label="Sign Out"
                                                    className="h-9 w-9 text-white hover:bg-white/20"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => navigate('/sign-in')}
                                                className="w-full bg-canvas text-primary hover:bg-gray-100 font-bold rounded-full flex items-center justify-center gap-1.5 text-xs"
                                            >
                                                <span>Login</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </nav>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Public Layout Main Content Area with Perfectly Blended Ambient Wash */}
            <main className="flex-1 w-full relative overflow-hidden bg-canvas">
                {/* 1. Ultra-Soft Ambient Glassmorphic Mesh Lighting (Subtle & Blended) */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden min-h-full">
                    <motion.div 
                        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary/[0.05] blur-[140px]"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div 
                        className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full bg-primary/[0.05] blur-[150px]"
                        animate={{ scale: [1.08, 1, 1.08], opacity: [0.4, 0.6, 0.4] }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />
                    <motion.div 
                        className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[130px]"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    />
                </div>

                {/* 2. Ambient Floating Academic & Journal Icons Layer (decorative -- stays behind real content) */}
                <div className="absolute inset-0 pointer-events-none select-none z-[1] overflow-hidden min-h-full">
                    {bodyFloatingIcons.map((item, idx) => {
                        const IconComponent = item.Icon
                        return (
                            <motion.div
                                key={idx}
                                className={`absolute ${item.className}`}
                                style={{ opacity: item.opacity }}
                                animate={{
                                    y: item.y,
                                    rotate: item.rotate,
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: item.duration,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: item.delay,
                                }}
                            >
                                <IconComponent className="w-full h-full stroke-[1.5]" />
                            </motion.div>
                        )
                    })}
                </div>

                {/* 3. Main View Content -- always paints above the decorative layers */}
                <div className="relative z-10">{children}</div>
            </main>

            {/* Public Layout Footer with Brand Blue (bg-primary) */}
            <footer className="bg-primary text-on-primary border-t border-white/10 pt-12 pb-8 mt-auto shadow-lg">
                <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    {/* Column 1 (Leftmost): Enlarged Logo & Journal Title */}
                    <div className="space-y-3.5 sm:col-span-2 lg:col-span-1">
                        <img 
                            src="/img/logo/jeri-logo.png" 
                            alt="JERI Logo" 
                            className="h-20 md:h-24 w-auto max-w-[300px] md:max-w-[340px] object-contain drop-shadow-md mb-1 block" 
                        />
                        <h3 className="font-extrabold text-white text-base md:text-lg tracking-tight leading-snug">
                            Journal of Emerging Research and Innovation (JERI)
                        </h3>
                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                            Premier Open Access Peer-Reviewed International Journal advancing discovery in science and technology.
                        </p>
                    </div>

                    {/* Column 2: Quick Links (Vertically Stacked) */}
                    <div className="space-y-3">
                        <h4 className="text-base font-bold text-white tracking-wide">Quick Links</h4>
                        <div className="flex flex-col space-y-2 text-xs font-medium">
                            {publicNavLinks.map((link) => (
                                <Link 
                                    key={link.path} 
                                    to={link.path} 
                                    className="text-white/85 hover:text-white transition-colors duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Talk & Email Us */}
                    <div className="space-y-3">
                        <h4 className="text-base font-bold text-white tracking-wide">Talk & Email Us</h4>
                        <div className="text-xs text-white/85 space-y-2.5 leading-relaxed font-medium">
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Editorial Desk</p>
                                <a href="mailto:editor@jeri-journal.org" className="hover:text-white transition-colors">editor@jeri-journal.org</a>
                            </div>
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">General Enquiries</p>
                                <a href="mailto:info@spsu.ac.in" className="hover:text-white transition-colors">info@spsu.ac.in</a>
                            </div>
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Phone Contact</p>
                                <a href="tel:+912942657800" className="hover:text-white transition-colors">+91 (294) 2657800</a>
                            </div>
                        </div>
                    </div>

                    {/* Column 4 (Last Column): Contact Us & Publisher Info */}
                    <div className="space-y-3">
                        <h4 className="text-base font-bold text-white tracking-wide">Contact Us</h4>
                        <div className="text-xs text-white/85 space-y-2 leading-relaxed font-medium">
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Publisher</p>
                                <p className="font-bold text-white">Sir Padampat Singhania University (SPSU)</p>
                            </div>
                            <div>
                                <p className="text-white/60 text-[11px] uppercase tracking-wider font-semibold">Address</p>
                                <p>Bhatewar, NH-76, Udaipur-Chittorgarh Expressway</p>
                                <p>Udaipur, Rajasthan 313601, India</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright Strip */}
                <div className="border-t border-white/15 pt-6 text-center text-xs text-white/75 space-y-1 font-medium">
                    <p>Copyright © {new Date().getFullYear()}: Journal of Emerging Research and Innovation (JERI). All Rights Reserved.</p>
                    <p className="text-white/60 text-[11px]">Published & Maintained By Sir Padampat Singhania University, Udaipur</p>
                </div>
            </footer>
        </LayoutBase>
    )
}

export default PublicLayout
