export type UserRole = 'admin' | 'author' | null

export type SignUpCredential = {
    email: string
    password: string
    username?: string
}

export type SignInCredential = {
    email: string
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type User = {
    userId?: string | null
    avatar?: string | null
    userName?: string | null
    email?: string | null
    role?: UserRole
    authority?: string[]
}

export type Token = {
    accessToken: string
}
