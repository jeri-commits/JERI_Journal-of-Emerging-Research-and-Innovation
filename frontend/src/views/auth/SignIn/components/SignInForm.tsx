import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useAuth } from '@/auth'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface SignInFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

type SignInFormSchema = {
    email: string
    password: string
}

const validationSchema: ZodType<SignInFormSchema> = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .email({ message: 'Please enter a valid email address' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { disableSubmit = false, className, setMessage } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const { signIn } = useAuth()

    const onSignIn = async (values: SignInFormSchema) => {
        const { email, password } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signIn(email, password)

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        }

        setSubmitting(false)
    }

    return (
        <div className={classNames('w-full', className)}>
            <Form onSubmit={handleSubmit(onSignIn)} className="space-y-2 w-full">
                <FormItem
                    label="Email Address"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                    className="mb-1.5"
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                size="sm"
                                className="h-9 text-xs"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">Password</span>
                    <Link to="/forgot-password" className="text-[11px] font-bold text-primary hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <FormItem
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className="mb-1 -mt-1"
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                size="sm"
                                className="h-9 text-xs"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <Button
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    variant="default"
                    type="submit"
                    size="sm"
                    className="w-full h-9 bg-primary text-on-primary hover:bg-primary-active font-bold rounded-xl shadow-xs text-xs mt-1"
                >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
