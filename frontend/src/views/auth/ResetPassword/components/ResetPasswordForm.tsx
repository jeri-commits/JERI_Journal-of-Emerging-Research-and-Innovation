import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { resetPassword } from '@/services/supabase/passwordReset'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface ResetPasswordFormProps extends CommonProps {
    token: string
    setMessage?: (message: string) => void
    onReset?: () => void
}

type ResetPasswordFormSchema = {
    password: string
    confirmPassword: string
}

const validationSchema: ZodType<ResetPasswordFormSchema> = z
    .object({
        password: z
            .string({ required_error: 'Please enter a new password' })
            .min(8, { message: 'Password must be at least 8 characters' }),
        confirmPassword: z.string({
            required_error: 'Please confirm your new password',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const { className, token, setMessage, onReset } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ResetPasswordFormSchema>({
        defaultValues: { password: '', confirmPassword: '' },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (values: ResetPasswordFormSchema) => {
        setSubmitting(true)
        try {
            await resetPassword(token, values.password)
            onReset?.()
        } catch (err) {
            setMessage?.((err as Error).message || 'Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={classNames('w-full', className)}>
            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-2 w-full">
                <FormItem
                    label="New Password"
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
                    label="Confirm New Password"
                    invalid={Boolean(errors.confirmPassword)}
                    errorMessage={errors.confirmPassword?.message}
                    className="mb-1"
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                placeholder="Re-enter your new password"
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
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
            </Form>
        </div>
    )
}

export default ResetPasswordForm
