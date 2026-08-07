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
                key: 'authorDashboard',
                path: '/author',
                title: 'Author Dashboard',
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
