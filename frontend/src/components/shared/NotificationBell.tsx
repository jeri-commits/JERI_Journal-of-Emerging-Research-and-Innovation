import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import {
    listMyNotifications,
    markNotificationRead,
} from '@/services/supabase/submissions'
import type { NotificationRow } from '@/@types/submissions'

const NotificationBell = ({
    userId,
    basePath,
}: {
    userId: string
    basePath: '/author/submissions' | '/admin/submissions'
}) => {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState<NotificationRow[]>([])
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const refresh = () => {
        listMyNotifications(userId).then(setNotifications)
    }

    useEffect(refresh, [userId])

    // Light polling so a new reviewer decision / status change shows up
    // without the author or admin needing to reload the page.
    useEffect(() => {
        const interval = setInterval(refresh, 60_000)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const unreadCount = notifications.filter((n) => !n.is_read).length

    const handleClick = async (n: NotificationRow) => {
        setOpen(false)
        if (!n.is_read) {
            await markNotificationRead(n.id)
            setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
            )
        }
        if (n.submission_id) navigate(`${basePath}/${n.submission_id}`)
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => {
                    setOpen((v) => !v)
                    if (!open) refresh()
                }}
                className="relative p-2 rounded-lg hover:bg-surface-strong transition-colors text-body hover:text-ink"
                aria-label="Notifications"
            >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-4 text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-hairline-strong bg-surface-card dark:bg-surface-dark-elevated shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
                        <span className="text-sm font-semibold text-ink">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="text-[11px] text-body">{unreadCount} unread</span>
                        )}
                    </div>
                    {notifications.length === 0 && (
                        <p className="text-sm text-body p-4">No notifications yet.</p>
                    )}
                    {notifications.slice(0, 10).map((n) => (
                        <button
                            key={n.id}
                            type="button"
                            onClick={() => handleClick(n)}
                            className={`w-full text-left px-4 py-3 border-b border-hairline last:border-0 hover:bg-surface-strong transition-colors ${
                                n.is_read ? '' : 'bg-primary/5'
                            }`}
                        >
                            <div className="flex items-start gap-2">
                                {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-ink truncate">{n.title}</p>
                                    <p className="text-xs text-body line-clamp-2 mt-0.5">{n.message}</p>
                                    <p className="text-[10px] text-body/70 mt-1">
                                        {new Date(n.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default NotificationBell
