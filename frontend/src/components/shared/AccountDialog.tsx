import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import { UserCircle, KeyRound } from 'lucide-react'
import { supabase } from '@/configs/supabase.config'
import { updateMyProfile } from '@/services/supabase/profiles'
import { useSessionUser } from '@/store/authStore'

interface AccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

/** Lightweight "account settings" dialog opened from the header avatar --
 * replaces a dedicated profile page for personas that have nothing else
 * to manage: just their display name and their password. */
const AccountDialog: React.FC<AccountDialogProps> = ({ open, onOpenChange }) => {
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)

    const [name, setName] = useState(user?.userName ?? '')
    const [nameSaving, setNameSaving] = useState(false)
    const [nameError, setNameError] = useState('')
    const [nameSuccess, setNameSuccess] = useState('')

    const [showPasswordFields, setShowPasswordFields] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')

    const resetPasswordFields = () => {
        setShowPasswordFields(false)
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
    }

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next)
        if (!next) {
            setNameError('')
            setNameSuccess('')
            resetPasswordFields()
            setPasswordSuccess('')
        }
    }

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.userId || !name.trim() || nameSaving) return

        setNameSaving(true)
        setNameError('')
        setNameSuccess('')
        try {
            await updateMyProfile(user.userId, { full_name: name.trim() })
            setUser({ ...user, userName: name.trim() })
            setNameSuccess('Name updated.')
        } catch (err) {
            setNameError((err as Error).message || 'Could not update your name.')
        } finally {
            setNameSaving(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordSaving) return

        setPasswordError('')
        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.')
            return
        }

        setPasswordSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error
            resetPasswordFields()
            setPasswordSuccess('Password changed.')
        } catch (err) {
            setPasswordError((err as Error).message || 'Could not change your password.')
        } finally {
            setPasswordSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[28rem]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        <span>My Account</span>
                    </DialogTitle>
                    <DialogDescription>{user?.email}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSaveName} className="space-y-3">
                    {nameError && <Alert showIcon type="danger">{nameError}</Alert>}
                    {nameSuccess && <Alert showIcon type="success">{nameSuccess}</Alert>}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Display Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <Button type="submit" disabled={nameSaving} size="sm">
                        {nameSaving ? 'Saving…' : 'Save Name'}
                    </Button>
                </form>

                <div className="pt-3 border-t border-hairline space-y-3">
                    {!showPasswordFields ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => {
                                setPasswordSuccess('')
                                setShowPasswordFields(true)
                            }}
                        >
                            <KeyRound className="h-3.5 w-3.5" />
                            <span>Change Password</span>
                        </Button>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            {passwordError && <Alert showIcon type="danger">{passwordError}</Alert>}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Confirm Password</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={passwordSaving} size="sm">
                                    {passwordSaving ? 'Changing…' : 'Change Password'}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={resetPasswordFields}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                    {passwordSuccess && <Alert showIcon type="success">{passwordSuccess}</Alert>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AccountDialog
