import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'
import {
    listMyNotifications,
    markNotificationRead,
} from '@/services/supabase/submissions'
import type { NotificationRow } from '@/@types/submissions'

const NotificationsPanel = ({
    userId,
    basePath,
}: {
    userId: string
    basePath: '/author/submissions' | '/admin/submissions'
}) => {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState<NotificationRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listMyNotifications(userId)
            .then(setNotifications)
            .finally(() => setLoading(false))
    }, [userId])

    const handleClick = async (n: NotificationRow) => {
        if (!n.is_read) {
            await markNotificationRead(n.id)
            setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
            )
        }
        if (n.submission_id) navigate(`${basePath}/${n.submission_id}`)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notifications
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {loading && <p className="text-sm text-body">Loading…</p>}
                {!loading && notifications.length === 0 && (
                    <p className="text-sm text-body">No notifications yet.</p>
                )}
                {notifications.slice(0, 8).map((n) => (
                    <button
                        key={n.id}
                        type="button"
                        onClick={() => handleClick(n)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                            n.is_read
                                ? 'border-hairline bg-surface-card'
                                : 'border-primary/30 bg-primary/5'
                        }`}
                    >
                        <p className="text-sm font-semibold text-ink">{n.title}</p>
                        <p className="text-xs text-body line-clamp-2">{n.message}</p>
                        <p className="text-[11px] text-body/70 mt-1">
                            {new Date(n.created_at).toLocaleString()}
                        </p>
                    </button>
                ))}
            </CardContent>
        </Card>
    )
}

export default NotificationsPanel
