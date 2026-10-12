import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/auth'
import { useSessionUser } from '@/store/authStore'
import { getFullProfile, updateMyProfile } from '@/services/supabase/profiles'
import type { FullProfile, ProfileEditableFields } from '@/services/supabase/profiles'

const emptyFields: ProfileEditableFields = {
    full_name: '',
    institution: '',
    department: '',
    bio: '',
}

/** Used by /admin/profile. Authors manage their name/password through the
 * lightweight AccountDialog instead (opened from the header avatar) --
 * authors have nothing else on their profile worth a dedicated page. */
const ProfileEditor: React.FC = () => {
    const { user } = useAuth()
    const setUser = useSessionUser((state) => state.setUser)
    const [profile, setProfile] = useState<FullProfile | null>(null)
    const [fields, setFields] = useState<ProfileEditableFields>(emptyFields)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user?.userId) return
        getFullProfile(user.userId)
            .then((p) => {
                setProfile(p)
                setFields({
                    full_name: p.full_name ?? '',
                    institution: p.institution ?? '',
                    department: p.department ?? '',
                    bio: p.bio ?? '',
                })
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [user?.userId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.userId) return
        setSaving(true)
        setError('')
        setMessage('')
        try {
            await updateMyProfile(user.userId, fields)
            // Keep the header (and anywhere else `user.userName` is read)
            // in sync immediately -- without this, a name change here only
            // shows up after the next sign-in, since nothing re-fetches
            // the profile otherwise.
            setUser({ ...user, userName: fields.full_name || undefined })
            setMessage('Profile updated.')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-6">Loading…</div>

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6 font-sans">
            <div>
                <h1 className="text-2xl font-bold text-ink">My Profile</h1>
                <p className="text-sm text-body">
                    {profile?.email} · {profile?.role ?? 'pending role assignment'}
                </p>
            </div>

            {message && <Alert showIcon type="success">{message}</Alert>}
            {error && <Alert showIcon type="danger">{error}</Alert>}

            <Card>
                <CardHeader><CardTitle>Contact & Affiliation</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                value={fields.full_name ?? ''}
                                onChange={(e) => setFields({ ...fields, full_name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Institution</label>
                                <Input
                                    value={fields.institution ?? ''}
                                    onChange={(e) => setFields({ ...fields, institution: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Department</label>
                                <Input
                                    value={fields.department ?? ''}
                                    onChange={(e) => setFields({ ...fields, department: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Bio</label>
                            <textarea
                                rows={4}
                                className="w-full rounded-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                                value={fields.bio ?? ''}
                                onChange={(e) => setFields({ ...fields, bio: e.target.value })}
                            />
                        </div>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfileEditor
