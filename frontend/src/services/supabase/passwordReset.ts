import { invokeFunction } from './functionsClient'

export async function requestPasswordReset(email: string): Promise<void> {
    await invokeFunction('request-password-reset', { email })
}

export async function resetPassword(token: string, password: string): Promise<void> {
    await invokeFunction('reset-password', { token, password })
}
