import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    // Author Persona Section
    {
        key: 'authorSection',
        path: '',
        title: 'Author Workspace',
        translateKey: 'nav.authorSection',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['author', 'admin'],
        subMenu: [
            {
                key: 'authorSubmissionsNew',
                path: '/author/submissions/new',
                title: 'Paper Submission',
                translateKey: 'nav.authorSubmissionsNew',
                icon: 'singleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['author'],
                subMenu: [],
            },
            {
                key: 'authorDashboard',
                path: '/author',
                title: 'My Submissions',
                translateKey: 'nav.authorDashboard',
                icon: 'home',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['author', 'admin'],
                subMenu: [],
            },
        ],
    },
    // Admin Persona Section
    {
        key: 'adminSection',
        path: '',
        title: 'Editorial Administration',
        translateKey: 'nav.adminSection',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['admin'],
        subMenu: [
            {
                key: 'adminDashboard',
                path: '/admin',
                title: 'Admin Control Panel',
                translateKey: 'nav.adminDashboard',
                icon: 'groupSingleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'adminSubmissions',
                path: '/admin/submissions',
                title: 'All Submissions',
                translateKey: 'nav.adminSubmissions',
                icon: 'groupCollapseMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'adminUsers',
                path: '/admin/users',
                title: 'Users',
                translateKey: 'nav.adminUsers',
                icon: 'groupMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'adminEmailLog',
                path: '/admin/email-log',
                title: 'Email Log',
                translateKey: 'nav.adminEmailLog',
                icon: 'groupCollapseMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'adminProfile',
                path: '/admin/profile',
                title: 'My Profile',
                translateKey: 'nav.adminProfile',
                icon: 'collapseMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
        ],
    },
    // Public Website Link
    {
        key: 'publicWebsiteSection',
        path: '',
        title: 'Journal Site',
        translateKey: 'nav.publicWebsiteSection',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['author', 'admin'],
        subMenu: [
            {
                key: 'publicLanding',
                path: '/',
                title: 'Public Homepage',
                translateKey: 'nav.publicLanding',
                icon: 'singleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['author', 'admin'],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
