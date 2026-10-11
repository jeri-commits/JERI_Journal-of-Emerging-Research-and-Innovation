import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * A slim top-of-viewport progress bar for route changes -- not a
 * full-screen shutter. Route chunks are lazy-loaded but cached after first
 * visit, so most navigations are instant; this gives a quick, honest
 * "something happened" cue without blocking the page or re-flashing a
 * full loading screen on every click. Genuine first-time loading (an
 * uncached lazy chunk) is still covered by the Suspense fallback
 * (PageLoader).
 */
const RouteLoader: React.FC = () => {
    const location = useLocation()
    const [active, setActive] = useState(false)

    useEffect(() => {
        setActive(true)
        const timer = setTimeout(() => setActive(false), 260)
        return () => clearTimeout(timer)
    }, [location.pathname])

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    key={location.pathname}
                    className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-primary/20 pointer-events-none"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                    <motion.div
                        className="h-full bg-primary shadow-[0_0_8px_var(--primary)] origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 0.85 }}
                        transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default RouteLoader
