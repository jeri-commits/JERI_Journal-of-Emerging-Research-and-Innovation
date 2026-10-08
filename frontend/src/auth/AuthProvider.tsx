import { useEffect, useRef, useState, useImperativeHandle } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { supabase } from '@/configs/supabase.config'
import { getProfile } from '@/services/supabase/profiles'
import { useSessionUser } from '@/store/authStore'
import { apiSignUp, apiSignIn, apiSignOut } from '@/services/AuthService'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import type { AuthResult, User } from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router-dom'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(
        ref,
        () => {
            return {
                navigate,
            }
        },
        [navigate],
    )

    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const [loading, setLoading] = useState(true)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser(
        (state) => state.setSessionSignedIn,
    )
    const signedIn = useSessionUser((state) => state.session.signedIn)

    const authenticated = signedIn

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const redirect = (signedInUser?: User) => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)

        if (redirectUrl) {
            navigatorRef.current?.navigate(redirectUrl)
            return
        }

        const authorities = signedInUser?.authority || user?.authority || []
        if (authorities.includes('admin')) {
            navigatorRef.current?.navigate('/admin')
        } else if (authorities.includes('author')) {
            navigatorRef.current?.navigate('/author')
        } else {
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }

    useEffect(() => {
        let ignore = false

        const syncUser = async (
            sessionUser: { id: string; email?: string | null } | undefined,
        ) => {
            if (!sessionUser) {
                if (!ignore) {
                    setUser({})
                    setSessionSignedIn(false)
                }
                return
            }

            const profile = await getProfile(sessionUser.id)

            if (ignore) return

            setUser({
                userId: sessionUser.id,
                email: profile.email || sessionUser.email,
                userName: profile.full_name || undefined,
                role: profile.role,
                authority: profile.role ? [profile.role] : [],
            })
            setSessionSignedIn(true)
        }

        supabase.auth.getSession().then(({ data }) => {
            syncUser(data.session?.user).finally(() => {
                if (!ignore) setLoading(false)
            })
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            syncUser(session?.user)
        })

        return () => {
            ignore = true
            subscription.unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const signUp = async (
        email: string,
        password: string,
        username?: string,
    ): AuthResult => {
        try {
            const signedInUser = await apiSignUp(email, password, username)
            setUser(signedInUser)
            setSessionSignedIn(true)
            redirect(signedInUser)
            return { status: 'success', message: '' }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.message || 'Unable to create your account.',
            }
        }
    }

    const signIn = async (email: string, password: string): AuthResult => {
        try {
            const signedInUser = await apiSignIn(email, password)
            setUser(signedInUser)
            setSessionSignedIn(true)
            redirect(signedInUser)
            return { status: 'success', message: '' }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.message || 'Invalid email or password.',
            }
        }
    }

    const signOut = async () => {
        try {
            await apiSignOut()
        } finally {
            setUser({})
            setSessionSignedIn(false)
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                loading,
                user,
                signUp,
                signIn,
                signOut,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
