import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type ScrollRevealProps = {
    children: ReactNode
    className?: string
    delay?: number
    /** Pixels the content rises as it reveals. Keep small -- subtle, not a slide-in. */
    distance?: number
}

/**
 * Fades + lifts content in as it scrolls into view. Runs once per element
 * (won't re-trigger scrolling back up) and triggers slightly before the
 * element is fully in the viewport so it never feels late.
 */
const ScrollReveal = ({
    children,
    className,
    delay = 0,
    distance = 18,
}: ScrollRevealProps) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: distance }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    )
}

export default ScrollReveal
