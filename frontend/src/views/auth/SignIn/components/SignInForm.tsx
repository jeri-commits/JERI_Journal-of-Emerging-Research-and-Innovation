import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { UserCheck, ShieldCheck } from 'lucide-react'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    passwordHint?: string | ReactNode
    setMessage?: (message: string) => void
}

type SignInFormSchema = {
    email: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .min(1, { message: 'Please enter your email' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { disableSubmit = false, className, setMessage, passwordHint } = props

    const {
        handleSubmit,
        setValue,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            email: 'admin@jeri.org',
            password: '123Qwe',
        },
        resolver: zodResolver(validationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
        const { email, password } = values

        if (!disableSubmit) {
            setSubmitting(true)

            const result = await signIn({ email, password })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        }

        setSubmitting(false)
    }

    const fillPersonaCredentials = (email: string) => {
        setValue('email', email)
        setValue('password', '123Qwe')
    }

    return (
        <div className={className}>
            {/* Quick Demo Persona Switcher */}
            <div className="mb-6 p-3 bg-surface-strong dark:bg-surface-dark-elevated rounded-lg border border-hairline-strong space-y-2">
                <span className="text-caption-uppercase text-body dark:text-on-dark-soft block font-semibold">
                    Select Demo Persona:
                </span>
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => fillPersonaCredentials('admin@jeri.org')}
                        className="text-xs flex items-center justify-center gap-1.5"
                    >
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <span>Admin Editor</span>
                    </Button>
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => fillPersonaCredentials('author@jeri.org')}
                        className="text-xs flex items-center justify-center gap-1.5"
                    >
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span>Author User</span>
                    </Button>
                </div>
            </div>

            <Form onSubmit={handleSubmit(onSignIn)}>
                <FormItem
                    label="Email Address"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className={classNames(
                        passwordHint ? 'mb-0' : '',
                        errors.password?.message ? 'mb-8' : '',
                    )}
                >
                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <PasswordInput
                                type="text"
                                placeholder="Password"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {passwordHint}
                <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full mt-4"
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
