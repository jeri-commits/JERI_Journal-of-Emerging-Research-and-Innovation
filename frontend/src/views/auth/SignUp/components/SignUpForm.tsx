import { useState } from 'react'
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

interface SignUpFormProps extends CommonProps {
    disableSubmit?: boolean
    setMessage?: (message: string) => void
}

type SignUpFormSchema = {
    username: string
    email: string
    password: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        username: z.string().optional().default(''),
        email: z
            .string({ required_error: 'Please enter your email' })
            .email({ message: 'Please enter a valid email address' }),
        password: z
            .string({ required_error: 'Please enter a password' })
            .min(8, { message: 'Password must be at least 8 characters' }),
        confirmPassword: z.string({
            required_error: 'Please confirm your password',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

const SignUpForm = (props: SignUpFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { disableSubmit = false, className, setMessage } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignUpFormSchema>({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const { signUp } = useAuth()

    const onSignUp = async (values: SignUpFormSchema) => {
        const { username, email, password } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp(email, password, username)

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        }

        setSubmitting(false)
    }

    return (
        <div className={classNames('w-full', className)}>
            <Form onSubmit={handleSubmit(onSignUp)} className="space-y-2 w-full">
                <FormItem
                    label="Username (optional)"
                    invalid={Boolean(errors.username)}
                    errorMessage={errors.username?.message}
                    className="mb-1.5"
                >
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <Input
                                placeholder="How should we address you?"
                                size="sm"
                                className="h-9 text-xs"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

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

                <FormItem
                    label="Password"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                    className="mb-1.5"
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="At least 8 characters"
                                autoComplete="new-password"
                                size="sm"
                                className="h-9 text-xs"
                                {...field}
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="Confirm Password"
                    invalid={Boolean(errors.confirmPassword)}
                    errorMessage={errors.confirmPassword?.message}
                    className="mb-1"
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
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
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
