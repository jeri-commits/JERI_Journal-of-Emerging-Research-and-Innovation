import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'

const PublicRoute = () => {
    const { authenticated, user } = useAuth()
    const { pathname } = useLocation()

    // Auth routes should redirect already logged-in users to their dashboard
    const isAuthPage = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'].includes(pathname)

    if (authenticated && isAuthPage) {
        const userAuthorities = user?.authority || []
        const redirectPath = userAuthorities.includes('admin') ? '/admin' : '/author'
        return <Navigate to={redirectPath} replace />
    }

    return <Outlet />
}

export default PublicRoute
