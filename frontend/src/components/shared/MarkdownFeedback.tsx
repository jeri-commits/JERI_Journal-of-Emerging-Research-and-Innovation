import React from 'react'
import ReactMarkdown from 'react-markdown'

/** Renders admin-written feedback/comments text. The feedback editor
 * only ever writes bold/italic/bullet-list markdown (see
 * FeedbackEditor.tsx), so this deliberately only allows that small
 * subset of elements -- not arbitrary markdown/HTML from a free-text
 * field. */
const MarkdownFeedback: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
    <div className={`text-sm text-body leading-relaxed [&_p]:mb-2 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-ink ${className ?? ''}`}>
        <ReactMarkdown allowedElements={['p', 'strong', 'em', 'ul', 'li', 'br']} skipHtml>
            {text}
        </ReactMarkdown>
    </div>
)

export default MarkdownFeedback
