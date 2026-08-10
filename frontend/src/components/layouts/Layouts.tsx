import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import PageLoader from '@/components/shared/PageLoader'
import RouteLoader from '@/components/shared/RouteLoader'
import type { CommonProps } from '@/@types/common'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/store/themeStore'
import { useLocation } from 'react-router-dom'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'
import PublicLayout from './PublicLayout'
import AdminLayout from './AdminLayout'
import AuthorLayout from './AuthorLayout'

const publicPaths = [
    '/',
    '/about',
    '/authors-info',
    '/author-guidelines',
    '/archives',
    '/paper-submissions',
    '/editorial-board',
    '/ethics-statements',
    '/contact-us',
]

const Layout = ({ children }: CommonProps) => {
    const layoutType = useThemeStore((state) => state.layout.type)
    const { authenticated } = useAuth()
    const location = useLocation()
    const { pathname } = location

    const isPublicPath = publicPaths.includes(pathname)
    const isAdminPath = pathname.startsWith('/admin')
    const isAuthorPath = pathname.startsWith('/author')

    return (
        <>
            <RouteLoader />
            <Suspense fallback={<PageLoader />}>
                {isPublicPath ? (
                    <PublicLayout>{children}</PublicLayout>
                ) : isAdminPath ? (
                    <AdminLayout>{children}</AdminLayout>
                ) : isAuthorPath ? (
                    <AuthorLayout>{children}</AuthorLayout>
                ) : authenticated ? (
                    <PostLoginLayout layoutType={layoutType}>
                        {children}
                    </PostLoginLayout>
                ) : (
                    <PreLoginLayout>{children}</PreLoginLayout>
                )}
            </Suspense>
        </>
    )
}

export default Layout
