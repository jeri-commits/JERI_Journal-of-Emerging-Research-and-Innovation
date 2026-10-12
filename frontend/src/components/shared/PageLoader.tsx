import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Atom, ScrollText, Globe } from 'lucide-react'

interface PageLoaderProps {
    text?: string
}

// Exactly 5 mid-sized, organically scattered academic icons (minimal & clean)
const loaderFloatingIcons = [
    { Icon: BookOpen, className: 'top-[18%] left-[14%] w-10 h-10 text-primary', opacity: 0.11, y: [0, -10, 0], rotate: [-14, 4, -14] },
    { Icon: GraduationCap, className: 'top-[22%] right-[16%] w-10 h-10 text-primary', opacity: 0.11, y: [0, -12, 0], rotate: [18, -6, 18] },
    { Icon: Atom, className: 'bottom-[24%] left-[18%] w-9 h-9 text-primary', opacity: 0.10, y: [0, -10, 0], rotate: [-10, 10, -10] },
    { Icon: ScrollText, className: 'bottom-[22%] right-[18%] w-10 h-10 text-primary', opacity: 0.11, y: [0, -10, 0], rotate: [22, -10, 22] },
    { Icon: Globe, className: 'top-[54%] left-[8%] w-9 h-9 text-primary', opacity: 0.08, y: [0, -8, 0], rotate: [-16, 6, -16] },
]

const PageLoader: React.FC<PageLoaderProps> = ({ text = 'Journal of Emerging Research & Innovation' }) => {
    return (
        <motion.div 
            className="fixed inset-0 z-[99999] bg-white dark:bg-gray-950 flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden select-none"
            initial={{ y: '-100%', opacity: 1 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
            transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        >
            {/* Top Brand Blue Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary shadow-[0_0_12px_var(--primary)]" />

            {/* Subtle Mid-Sized Scattered Background Icons */}
            <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                {loaderFloatingIcons.map((item, idx) => {
                    const IconComp = item.Icon
                    return (
                        <motion.div
                            key={idx}
                            className={`absolute ${item.className}`}
                            style={{ opacity: item.opacity }}
                            animate={{
                                y: item.y,
                                rotate: item.rotate,
                                scale: [1, 1.04, 1],
                            }}
                            transition={{
                                duration: 6 + idx,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <IconComp className="w-full h-full stroke-[1.5]" />
                        </motion.div>
                    )
                })}
            </div>

            <div className="flex flex-col items-center space-y-6 max-w-[32rem] text-center relative z-10">
                {/* Large Direct Logo (No Box) */}
                <motion.img 
                    src="/img/logo/jeri-logo.png" 
                    alt="JERI Logo" 
                    className="h-24 md:h-32 w-auto max-w-[320px] md:max-w-[420px] object-contain drop-shadow-xl"
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: [0.95, 1.02, 1], opacity: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                />

                {/* Minimal Brand Dots */}
                <div className="flex items-center gap-2.5 pt-2">
                    <motion.span 
                        className="w-3 h-3 rounded-full bg-primary"
                        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span 
                        className="w-3 h-3 rounded-full bg-primary"
                        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span 
                        className="w-3 h-3 rounded-full bg-primary"
                        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                </div>

                {/* Subtitle Caption */}
                <p className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 tracking-wider uppercase opacity-90 pt-1">
                    {text}
                </p>
            </div>
        </motion.div>
    )
}

export default PageLoader
