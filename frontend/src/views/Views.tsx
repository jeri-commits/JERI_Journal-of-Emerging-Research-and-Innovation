import { Suspense } from 'react'
import PageLoader from '@/components/shared/PageLoader'
import AllRoutes from '@/components/route/AllRoutes'
import type { LayoutType } from '@/@types/theme'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

const Views = (props: ViewsProps) => {
    return (
        <Suspense fallback={<PageLoader />}>
            <AllRoutes {...props} />
        </Suspense>
    )
}

export default Views
