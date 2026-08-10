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
    userName: string
    password: string
    email: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        userName: z.string({ required_error: 'Please enter your full name' }).min(2, { message: 'Name must be at least 2 characters' }),
        email: z.string({ required_error: 'Please enter your email' }).email({ message: 'Please enter a valid email address' }),
        password: z.string({ required_error: 'Password Required' }).min(6, { message: 'Password must be at least 6 characters' }),
        confirmPassword: z.string({
            required_error: 'Confirm Password Required',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

const SignUpForm = (props: SignUpFormProps) => {
    const { disableSubmit = false, className, setMessage } = props
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { signUp } = useAuth()

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignUpFormSchema>({
        defaultValues: {
            userName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const onSignUp = async (values: SignUpFormSchema) => {
        const { userName, password, email } = values

        if (!disableSubmit) {
            setSubmitting(true)
            const result = await signUp({ userName, password, email })

            if (result?.status === 'failed') {
                setMessage?.(result.message)
            }
        }

        setSubmitting(false)
    }

    return (
        <div className={classNames('w-full', className)}>
            <Form onSubmit={handleSubmit(onSignUp)} className="space-y-2.5 w-full">
                <FormItem
                    label="Full Name"
                    invalid={Boolean(errors.userName)}
                    errorMessage={errors.userName?.message}
                    className="mb-2"
                >
                    <Controller
                        name="userName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder="Enter your full name"
                                autoComplete="name"
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
                    className="mb-2"
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="Enter your email address"
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
                    className="mb-2"
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                placeholder="Create a password"
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
                    className="mb-2"
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                placeholder="Confirm your password"
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
                    {isSubmitting ? 'Creating Account...' : 'Register Account'}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
