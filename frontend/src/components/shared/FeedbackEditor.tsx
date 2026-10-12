import React, { useRef } from 'react'
import { Bold, Italic, List, Paperclip, X } from 'lucide-react'

type FeedbackEditorProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    attachment?: File | null
    onAttachmentChange?: (file: File | null) => void
}

/** A plain textarea with a small toolbar that wraps the current
 * selection in markdown (bold/italic) or prefixes the current line with
 * a bullet. Deliberately not a WYSIWYG editor -- the textarea's value
 * stays plain markdown text the whole way through (stored as-is,
 * rendered later via MarkdownFeedback / the email templates' own tiny
 * markdown subset). */
const FeedbackEditor: React.FC<FeedbackEditorProps> = ({
    value,
    onChange,
    placeholder,
    rows = 4,
    attachment,
    onAttachmentChange,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const wrapSelection = (prefix: string, suffix: string) => {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart
        const end = el.selectionEnd
        const selected = value.slice(start, end)
        const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end)
        onChange(next)
        requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
        })
    }

    const prefixLine = (prefix: string) => {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
        onChange(next)
        requestAnimationFrame(() => {
            el.focus()
            el.setSelectionRange(start + prefix.length, start + prefix.length)
        })
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1 rounded-t-md border border-b-0 border-hairline-strong bg-surface-strong/40 px-1.5 py-1">
                <button
                    type="button"
                    title="Bold"
                    onClick={() => wrapSelection('**', '**')}
                    className="p-1.5 rounded hover:bg-surface-strong text-body hover:text-ink"
                >
                    <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    title="Italic"
                    onClick={() => wrapSelection('*', '*')}
                    className="p-1.5 rounded hover:bg-surface-strong text-body hover:text-ink"
                >
                    <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    title="Bullet point"
                    onClick={() => prefixLine('- ')}
                    className="p-1.5 rounded hover:bg-surface-strong text-body hover:text-ink"
                >
                    <List className="h-3.5 w-3.5" />
                </button>
                {onAttachmentChange && (
                    <>
                        <div className="w-px h-4 bg-hairline-strong mx-1" />
                        <button
                            type="button"
                            title="Attach file"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 rounded hover:bg-surface-strong text-body hover:text-ink"
                        >
                            <Paperclip className="h-3.5 w-3.5" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)}
                        />
                        {attachment && (
                            <span className="flex items-center gap-1 text-xs text-body bg-surface-strong rounded px-1.5 py-0.5">
                                {attachment.name}
                                <button
                                    type="button"
                                    onClick={() => onAttachmentChange(null)}
                                    className="hover:text-ink"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </>
                )}
            </div>
            <textarea
                ref={textareaRef}
                rows={rows}
                className="w-full rounded-b-md border border-hairline-strong bg-canvas p-3 text-sm text-ink focus:outline-none"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}

export default FeedbackEditor
