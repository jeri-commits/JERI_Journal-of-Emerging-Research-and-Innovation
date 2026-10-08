import { createContext } from 'react'
import type { AuthResult, User } from '@/@types/auth'

type Auth = {
    authenticated: boolean
    loading: boolean
    user: User
    signUp: (email: string, password: string, username?: string) => AuthResult
    signIn: (email: string, password: string) => AuthResult
    signOut: () => void
}

const AuthContext = createContext<Auth>({
    authenticated: false,
    loading: true,
    user: {},
    signUp: async () => ({ status: '', message: '' }),
    signIn: async () => ({ status: '', message: '' }),
    signOut: () => {},
})

export default AuthContext
