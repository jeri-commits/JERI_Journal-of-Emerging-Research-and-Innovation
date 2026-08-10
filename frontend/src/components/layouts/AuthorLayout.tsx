import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/auth'
import LayoutBase from '@/components/template/LayoutBase'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import { 
    GraduationCap, 
    FileText, 
    PlusCircle, 
    Clock, 
    LogOut, 
    Menu, 
    X,
    ExternalLink,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import type { CommonProps } from '@/@types/common'

const AuthorLayout: React.FC<CommonProps> = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, signOut } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const authorName = user?.userName || 'Prof. Alex Rivera'

    const navItems = [
        { label: 'Author Workspace', path: '/author', icon: GraduationCap },
        { label: 'My Submissions', path: '/author#submissions', icon: FileText },
        { label: 'Submit Manuscript', path: '/author#submit', icon: PlusCircle },
        { label: 'Peer Reviews', path: '/author#reviews', icon: Clock },
    ]

    const isNavActive = (path: string) => {
        const currentFull = location.pathname + location.hash
        if (path.includes('#')) {
            return currentFull === path
        }
        return location.pathname === path && !location.hash
    }

    return (
        <LayoutBase type={LAYOUT_COLLAPSIBLE_SIDE} className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
            {/* Author Header */}
            <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline-strong h-16 px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-body hover:text-ink focus:outline-none"
                        aria-label="Toggle Navigation Sidebar"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>

                    <Link to="/author" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-text-link text-white rounded-md flex items-center justify-center font-bold text-base shadow-sm">
                            J
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm tracking-tight leading-none text-ink">JERI Author</span>
                            <span className="text-[10px] text-text-link font-medium tracking-wider uppercase">Author Workspace</span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="hidden sm:inline-flex gap-1 py-1 px-3 border-text-link/30 text-text-link">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>Author Persona</span>
                    </Badge>

                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/')} 
                        className="hidden md:flex items-center gap-1 text-xs"
                    >
                        <span>Public Site</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={signOut}
                        className="flex items-center gap-1.5 text-xs text-body hover:text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 relative">
                {/* Mobile Backdrop Overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 top-16 bg-black/50 backdrop-blur-xs z-30 md:hidden transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Author Sidebar Navigation */}
                <aside 
                    className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] bg-surface-card dark:bg-surface-dark-elevated border-r border-hairline-strong transition-all duration-300 flex flex-col justify-between ${
                        sidebarOpen 
                            ? 'w-64 translate-x-0' 
                            : '-translate-x-full md:translate-x-0 md:w-16'
                    } overflow-y-auto min-h-0`}
                >
                    <div className={sidebarOpen ? "p-4 space-y-6" : "p-2 py-4 space-y-6"}>
                        {/* Sidebar Header Badge */}
                        {sidebarOpen ? (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50 space-y-1">
                                <div className="text-xs font-semibold text-text-link flex items-center gap-1">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Research Contributor</span>
                                </div>
                                <div className="text-xs text-blue-900 dark:text-blue-200 font-medium truncate">
                                    {authorName}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center" title={`Research Contributor: ${authorName}`}>
                                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-text-link rounded-lg flex items-center justify-center font-bold text-xs">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                            </div>
                        )}

                        {/* Sidebar Nav Items */}
                        <nav className="space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = isNavActive(item.path)

                                return (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        title={!sidebarOpen ? item.label : undefined}
                                        onClick={() => {
                                            if (window.innerWidth < 768) {
                                                setSidebarOpen(false)
                                            }
                                        }}
                                        className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                                            sidebarOpen 
                                                ? 'gap-3 px-3 py-2.5' 
                                                : 'justify-center p-2.5'
                                        } ${
                                            isActive
                                                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                                                : 'text-body hover:bg-surface-strong hover:text-ink'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {sidebarOpen && <span className="truncate flex-1">{item.label}</span>}
                                        {sidebarOpen && isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Sidebar Footer Link */}
                    <div className={sidebarOpen ? "p-4 border-t border-hairline" : "p-2 py-3 border-t border-hairline flex justify-center"}>
                        <Link 
                            to="/authors-info" 
                            title={!sidebarOpen ? "Author Guidelines" : undefined}
                            className="text-xs text-text-link hover:underline flex items-center justify-between gap-1"
                        >
                            {sidebarOpen ? (
                                <>
                                    <span>Author Guidelines</span>
                                    <ExternalLink className="h-3 w-3" />
                                </>
                            ) : (
                                <ExternalLink className="h-4 w-4" />
                            )}
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-canvas p-4 md:p-8">
                    {children}
                </main>
            </div>
        </LayoutBase>
    )
}

export default AuthorLayout
