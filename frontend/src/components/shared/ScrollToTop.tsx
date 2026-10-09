import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router does not reset scroll position on navigation (that's a
 * browser-native behavior for full page loads, not SPA route changes).
 * Without this, navigating to a new page while scrolled down leaves the
 * viewport scrolled down too -- on public pages that meant a full-screen
 * loading transition could visually overlap the previous page's footer,
 * since the footer was still in view when the loader appeared.
 */
const ScrollToTop: React.FC = () => {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if (hash) return
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [pathname, hash])

    return null
}

export default ScrollToTop
