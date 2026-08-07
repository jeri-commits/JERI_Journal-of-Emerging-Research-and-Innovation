import { createContext, useContext } from 'react'
import {
    PageContainerHeader,
    PageContainerBody,
    PageContainerFooter,
} from '@/components/template/PageContainer'
import type { PageContainerProps } from '@/components/template/PageContainer'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import { LayoutType } from '@/@types/theme'
import type { ReactNode } from 'react'

export type PageContainerReassembleProps = {
    defaultClass: string
    pageContainerGutterClass: string
    pageContainerDefaultClass: string
    PageContainerHeader: typeof PageContainerHeader
    PageContainerBody: typeof PageContainerBody
    PageContainerFooter: typeof PageContainerFooter
} & PageContainerProps

export interface LayoutContextProps {
    type: LayoutType
    adaptiveCardActive?: boolean
    pageContainerReassemble?: (props: PageContainerReassembleProps) => ReactNode
}

export const LayoutContext = createContext<LayoutContextProps | undefined>(
    undefined,
)

const defaultLayoutContext: LayoutContextProps = {
    type: LAYOUT_COLLAPSIBLE_SIDE as LayoutType,
    adaptiveCardActive: false,
}

const useLayout = (): LayoutContextProps => {
    const context = useContext(LayoutContext)
    return context || defaultLayoutContext
}

export default useLayout
