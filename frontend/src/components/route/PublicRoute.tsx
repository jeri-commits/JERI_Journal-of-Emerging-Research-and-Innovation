import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth'

/** A signed-in user has no reason to see the public site or the
 * sign-in/sign-up pages -- once authenticated, every public route sends
 * them straight to their dashboard. The only way back to the public
 * site is Logout. */
const PublicRoute = () => {
    const { authenticated, user } = useAuth()

    if (authenticated) {
        const userAuthorities = user?.authority || []
        const redirectPath = userAuthorities.includes('admin') ? '/admin' : '/author'
        return <Navigate to={redirectPath} replace />
    }

    return <Outlet />
}

export default PublicRoute
