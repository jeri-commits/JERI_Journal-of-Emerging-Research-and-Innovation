export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/author',
    unAuthenticatedEntryPath: '/',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
}

export default appConfig
