import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDownloadUrl } from '@/services/supabase/workflow'
import type { ManuscriptVersion } from '@/@types/submissions'

const VERSION_TYPE_LABEL: Record<ManuscriptVersion['version_type'], string> = {
    INITIAL: 'Initial Submission',
    REVISION: 'Revision',
    FINAL: 'Final Version',
}

const ManuscriptVersionList = ({ versions }: { versions: ManuscriptVersion[] }) => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null)

    const handleDownload = async (versionId: string) => {
        setDownloadingId(versionId)
        try {
            const { url } = await getDownloadUrl(versionId)
            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (err) {
            alert((err as Error).message)
        } finally {
            setDownloadingId(null)
        }
    }

    if (versions.length === 0) {
        return <p className="text-sm text-body">No manuscript versions yet.</p>
    }

    return (
        <div className="space-y-2">
            {versions
                .slice()
                .reverse()
                .map((version) => (
                    <div
                        key={version.id}
                        className="flex items-center justify-between gap-3 p-3 bg-surface-card border border-hairline rounded-xl"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink truncate">
                                    v{version.version_number} —{' '}
                                    {VERSION_TYPE_LABEL[version.version_type]}
                                </p>
                                <p className="text-xs text-body truncate">
                                    {version.file_name} ·{' '}
                                    {(version.file_size / 1024).toFixed(0)} KB
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={downloadingId === version.id}
                            onClick={() => handleDownload(version.id)}
                        >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            {downloadingId === version.id ? 'Preparing…' : 'Download'}
                        </Button>
                    </div>
                ))}
        </div>
    )
}

export default ManuscriptVersionList
