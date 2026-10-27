import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/auth'
import LayoutBase from '@/components/template/LayoutBase'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import { SITE_NAME } from '@/constants/site.constant'
import {
    LayoutDashboard,
    FileCheck,
    Users,
    Mail,
    GraduationCap,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react'
import NotificationBell from '@/components/shared/NotificationBell'
import AccountDialog from '@/components/shared/AccountDialog'
import type { CommonProps } from '@/@types/common'

const initials = (label: string) =>
    label
        .split(/[@\s]/)[0]
        .slice(0, 2)
        .toUpperCase()

const AdminLayout: React.FC<CommonProps> = ({ children }) => {
    const location = useLocation()
    const { user, signOut } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [accountOpen, setAccountOpen] = useState(false)

    const displayName = user?.userName || user?.email || 'Admin'

    const navItems = [
        { label: 'Control Panel', path: '/admin', icon: LayoutDashboard },
        { label: 'All Submissions', path: '/admin/submissions', icon: FileCheck },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Email Log', path: '/admin/email-log', icon: Mail },
        { label: 'Editorial Board', path: '/admin/editorial-board', icon: GraduationCap },
    ]

    const isNavActive = (path: string) => {
        if (path === '/admin') return location.pathname === path
        return location.pathname.startsWith(path)
    }

    return (
        <LayoutBase type={LAYOUT_COLLAPSIBLE_SIDE} className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
            {/* Admin Header */}
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

                    <Link to="/admin" className="flex items-center gap-2.5">
                        <img src="/img/logo/jeri-logo.png" alt="JERI" className="h-8 w-auto object-contain shrink-0" />
                        <div className="hidden sm:flex flex-col leading-tight">
                            <span className="font-semibold text-xs md:text-sm tracking-tight text-ink whitespace-nowrap">
                                {SITE_NAME}
                            </span>
                            <span className="text-[11px] text-purple-600 font-medium tracking-wide uppercase">
                                Admin Panel
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {user?.userId && (
                        <NotificationBell userId={user.userId} basePath="/admin/submissions" />
                    )}
                    <button
                        type="button"
                        onClick={() => setAccountOpen(true)}
                        className="hidden sm:flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-surface-strong transition-colors"
                        title="Account settings"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                {initials(displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight text-left">
                            <span className="text-xs font-semibold text-ink truncate max-w-[160px]">{displayName}</span>
                            <span className="text-[11px] text-body truncate max-w-[160px]">{user?.email}</span>
                        </div>
                    </button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={signOut}
                        className="flex items-center gap-1.5 text-xs text-body hover:text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
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

                {/* Admin Sidebar Navigation */}
                <aside 
                    className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] bg-surface-card dark:bg-surface-dark-elevated border-r border-hairline-strong transition-all duration-300 flex flex-col justify-between ${
                        sidebarOpen 
                            ? 'w-64 translate-x-0' 
                            : '-translate-x-full md:translate-x-0 md:w-16'
                    } overflow-y-auto min-h-0`}
                >
                    <div className={sidebarOpen ? "p-4 space-y-6" : "p-2 py-4 space-y-6"}>
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
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-canvas p-4 md:p-8">
                    {children}
                </main>
            </div>

            <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
        </LayoutBase>
    )
}

export default AdminLayout
