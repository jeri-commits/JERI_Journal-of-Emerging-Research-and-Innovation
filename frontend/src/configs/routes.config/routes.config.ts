import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [
    ...authRoute,
    {
        key: 'publicLanding',
        path: '/',
        component: lazy(() => import('@/views/public')),
        authority: [],
    },
    {
        key: 'publicAuthorGuidelines',
        path: '/author-guidelines',
        component: lazy(() => import('@/views/public/AuthorGuidelines')),
        authority: [],
    },
    {
        key: 'publicAuthorsAlias',
        path: '/authors-info',
        component: lazy(() => import('@/views/public/AuthorGuidelines')),
        authority: [],
    },
    {
        key: 'publicArchives',
        path: '/archives',
        component: lazy(() => import('@/views/public/Archives')),
        authority: [],
    },
    {
        key: 'publicArchiveDetail',
        path: '/archives/:id',
        component: lazy(() => import('@/views/public/Archives/ArchiveDetail')),
        authority: [],
    },
    {
        key: 'publicPaperSubmissions',
        path: '/paper-submissions',
        component: lazy(() => import('@/views/public/PaperSubmissions')),
        authority: [],
    },
    {
        key: 'publicEditorialBoard',
        path: '/editorial-board',
        component: lazy(() => import('@/views/public/EditorialBoard')),
        authority: [],
    },
    {
        key: 'publicEthicsStatements',
        path: '/ethics-statements',
        component: lazy(() => import('@/views/public/EthicStatements')),
        authority: [],
    },
    {
        key: 'publicContactUs',
        path: '/contact-us',
        component: lazy(() => import('@/views/public/ContactUs')),
        authority: [],
    },
    {
        key: 'accessDenied',
        path: '/access-denied',
        component: lazy(() => import('@/views/AccessDenied')),
        authority: [],
    },
]

export const protectedRoutes: Routes = [
    // Author Dashboard Routes
    {
        key: 'authorDashboard',
        path: '/author',
        component: lazy(() => import('@/views/author')),
        authority: ['author', 'admin'],
        meta: { footer: false },
    },
    {
        key: 'authorDashboardAlias',
        path: '/author/dashboard',
        component: lazy(() => import('@/views/author')),
        authority: ['author', 'admin'],
        meta: { footer: false },
    },
    {
        key: 'authorSubmissionsNew',
        path: '/author/submissions/new',
        component: lazy(() => import('@/views/author/Submissions/New')),
        authority: ['author'],
        meta: { footer: false },
    },
    {
        key: 'authorSubmissionDetail',
        path: '/author/submissions/:id',
        component: lazy(() => import('@/views/author/Submissions/Detail')),
        authority: ['author', 'admin'],
        meta: { footer: false },
    },
    // Admin Dashboard Routes
    {
        key: 'adminDashboard',
        path: '/admin',
        component: lazy(() => import('@/views/admin')),
        authority: ['admin'],
        meta: { footer: false },
    },
    {
        key: 'adminDashboardAlias',
        path: '/admin/dashboard',
        component: lazy(() => import('@/views/admin')),
        authority: ['admin'],
        meta: { footer: false },
    },
    {
        key: 'adminSubmissionsList',
        path: '/admin/submissions',
        component: lazy(() => import('@/views/admin/Submissions/List')),
        authority: ['admin'],
        meta: { footer: false },
    },
    {
        key: 'adminSubmissionDetail',
        path: '/admin/submissions/:id',
        component: lazy(() => import('@/views/admin/Submissions/Detail')),
        authority: ['admin'],
        meta: { footer: false },
    },
    {
        key: 'adminUsersList',
        path: '/admin/users',
        component: lazy(() => import('@/views/admin/Users/List')),
        authority: ['admin'],
        meta: { footer: false },
    },
    {
        key: 'adminProfile',
        path: '/admin/profile',
        component: lazy(() => import('@/views/admin/Profile')),
        authority: ['admin'],
        meta: { footer: false },
    },
    {
        key: 'adminEmailLog',
        path: '/admin/email-log',
        component: lazy(() => import('@/views/admin/EmailLog')),
        authority: ['admin'],
        meta: { footer: false },
    },
    // General Protected Home Route
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/public/Home')),
        authority: ['author', 'admin'],
    },
]
