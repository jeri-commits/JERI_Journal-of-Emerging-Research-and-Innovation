import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'

type ParallaxLayerProps = {
    children: ReactNode
    className?: string
    /** Pixels of vertical drift across the element's scroll range. Small on purpose. */
    range?: number
}

/**
 * Subtle vertical drift tied to scroll position -- for background/decorative
 * layers only (hero gradients, floating icons), not body content. Kept to a
 * small pixel range so it reads as depth, not motion sickness.
 */
const ParallaxLayer = ({
    children,
    className,
    range = 40,
}: ParallaxLayerProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })
    const y = useTransform(scrollYProgress, [0, 1], [-range / 2, range / 2])

    return (
        <div ref={ref} className={className}>
            <motion.div style={{ y }}>{children}</motion.div>
        </div>
    )
}

export default ParallaxLayer
