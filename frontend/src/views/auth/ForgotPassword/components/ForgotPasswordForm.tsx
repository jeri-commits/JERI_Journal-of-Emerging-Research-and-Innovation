import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import classNames from '@/utils/classNames'
import { requestPasswordReset } from '@/services/supabase/passwordReset'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface ForgotPasswordFormProps extends CommonProps {
    setMessage?: (message: string) => void
    onSent?: () => void
}

type ForgotPasswordFormSchema = { email: string }

const validationSchema: ZodType<ForgotPasswordFormSchema> = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .email({ message: 'Please enter a valid email address' }),
})

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const { className, setMessage, onSent } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ForgotPasswordFormSchema>({
        defaultValues: { email: '' },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (values: ForgotPasswordFormSchema) => {
        setSubmitting(true)
        try {
            await requestPasswordReset(values.email)
            onSent?.()
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
                                placeholder="Enter the email on your account"
                                autoComplete="email"
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
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
            </Form>
        </div>
    )
}

export default ForgotPasswordForm
