import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/auth'
import { ShieldAlert } from 'lucide-react'

const AccessDenied: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const userRole = user?.authority?.[0] || 'guest'

    const handleGoBack = () => {
        if (userRole === 'admin') {
            navigate('/admin')
        } else if (userRole === 'author') {
            navigate('/author')
        } else {
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-6 font-sans">
            <Card className="max-w-md w-full p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-display-sm text-ink dark:text-on-dark font-semibold">Access Denied</h2>
                    <p className="text-body-md text-body dark:text-on-dark-soft">
                        You do not have the required permissions to access this page. Your current role is{' '}
                        <span className="font-semibold text-ink dark:text-on-dark uppercase">{userRole}</span>.
                    </p>
                </div>
                <div className="pt-2 flex flex-col gap-3">
                    <Button onClick={handleGoBack} className="w-full">
                        Return to {userRole === 'admin' ? 'Admin Dashboard' : userRole === 'author' ? 'Author Dashboard' : 'Homepage'}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/sign-in')}>
                        Sign in as a different user
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default AccessDenied
