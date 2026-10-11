import AllRoutes from '@/components/route/AllRoutes'
import type { LayoutType } from '@/@types/theme'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

/**
 * No Suspense boundary here on purpose -- Layouts.tsx already wraps the
 * whole layout (header/main/footer) in one. A second, closer boundary here
 * used to "win" React's nearest-boundary-catches-first rule, which meant
 * the loading fallback rendered *inside* the layout's content area instead
 * of replacing the whole page, and could visually collide with the footer
 * during the transition. One shared loader, one shared boundary.
 */
const Views = (props: ViewsProps) => {
    return <AllRoutes {...props} />
}

export default Views
