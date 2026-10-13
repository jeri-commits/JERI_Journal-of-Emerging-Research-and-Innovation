import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

const CopyButton: React.FC<{ value: string; label?: string; className?: string }> = ({
    value,
    label = 'Copy',
    className = '',
}) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // clipboard API unavailable -- nothing to recover from
        }
    }

    return (
        <button
            type="button"
            title={label}
            onClick={handleCopy}
            className={`text-body hover:text-ink transition-colors shrink-0 ${className}`}
        >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    )
}

export default CopyButton
