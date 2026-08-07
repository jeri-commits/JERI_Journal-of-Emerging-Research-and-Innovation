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
        key: 'publicAbout',
        path: '/about',
        component: lazy(() => import('@/views/public/About')),
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
    },
    {
        key: 'authorDashboardAlias',
        path: '/author/dashboard',
        component: lazy(() => import('@/views/author')),
        authority: ['author', 'admin'],
    },
    // Admin Dashboard Routes
    {
        key: 'adminDashboard',
        path: '/admin',
        component: lazy(() => import('@/views/admin')),
        authority: ['admin'],
    },
    {
        key: 'adminDashboardAlias',
        path: '/admin/dashboard',
        component: lazy(() => import('@/views/admin')),
        authority: ['admin'],
    },
    // General Protected Home Route
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: ['author', 'admin'],
    },
]
