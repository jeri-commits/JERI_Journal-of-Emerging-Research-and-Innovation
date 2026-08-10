import { cloneElement } from 'react'
import type { ReactNode, ReactElement } from 'react'
import type { CommonProps } from '@/@types/common'

interface SimpleProps extends CommonProps {
    content?: ReactNode
}

const Simple = ({ children, content, ...rest }: SimpleProps) => {
    return (
        <div className="w-full min-h-screen bg-canvas text-ink flex flex-col">
            {content}
            {children
                ? cloneElement(children as ReactElement, {
                      ...rest,
                  })
                : null}
        </div>
    )
}

export default Simple
