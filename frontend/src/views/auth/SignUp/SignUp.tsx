import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Alert from '@/components/ui/Alert'
import SignUpForm from './components/SignUpForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { ArrowLeft, BookOpen, GraduationCap, Atom, ScrollText, Globe, Sparkles } from 'lucide-react'

// Exactly 6 subtle transparent floating icons across background layout
const authFloatingIcons = [
    { Icon: BookOpen, className: 'top-[12%] left-[12%] w-11 h-11 text-primary', opacity: 0.12, y: [0, -10, 0], rotate: [-12, 4, -12] },
    { Icon: GraduationCap, className: 'top-[16%] right-[14%] w-12 h-12 text-primary', opacity: 0.14, y: [0, -12, 0], rotate: [16, -6, 16] },
    { Icon: Atom, className: 'bottom-[18%] left-[15%] w-10 h-10 text-primary', opacity: 0.12, y: [0, -10, 0], rotate: [-10, 8, -10] },
    { Icon: ScrollText, className: 'bottom-[16%] right-[16%] w-11 h-11 text-primary', opacity: 0.14, y: [0, -10, 0], rotate: [20, -8, 20] },
    { Icon: Globe, className: 'top-[50%] left-[6%] w-9 h-9 text-primary', opacity: 0.10, y: [0, -8, 0], rotate: [-14, 6, -14] },
    { Icon: Sparkles, className: 'top-[52%] right-[8%] w-9 h-9 text-primary', opacity: 0.12, y: [0, -8, 0], rotate: [12, -4, 12] },
]

export const SignUp: React.FC = () => {
    const navigate = useNavigate()
    const [message, setMessage] = useTimeOutMessage()

    return (
        <div className="w-full min-h-screen bg-canvas text-ink flex flex-col justify-between p-2 md:p-4 font-sans relative overflow-hidden select-none">

            {/* 95% Embossed Background Watermark Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-2 md:-mt-4 z-0 pointer-events-none select-none opacity-60 flex items-center justify-center w-full">
                <img
                    src="/img/logo/jeri-logo.png"
                    alt="JERI Background Watermark"
                    className="w-[85vw] max-w-[850px] h-auto object-contain drop-shadow-md"
                />
            </div>

            {/* Ambient Transparent Icons */}
            <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden min-h-full">
                {authFloatingIcons.map((item, idx) => {
                    const IconComp = item.Icon
                    return (
                        <motion.div
                            key={idx}
                            className={`absolute ${item.className}`}
                            style={{ opacity: item.opacity }}
                            animate={{
                                y: item.y,
                                rotate: item.rotate,
                                scale: [1, 1.05, 1],
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

            {/* Top Bar Header */}
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 relative pt-2 px-2">
                <img
                    src="/img/logo/jeri-logo.png"
                    alt="JERI Logo"
                    className="h-14 md:h-16 w-auto max-w-[260px] md:max-w-[340px] object-contain cursor-pointer hover:opacity-90 transition-opacity drop-shadow-xs"
                    onClick={() => navigate('/')}
                />
            </div>

            {/* Main Auth Card */}
            <div className="w-full flex-1 flex flex-col items-center justify-center -mt-2 md:-mt-4 my-1 z-10 relative">
                <div className="w-[410px] max-w-[95vw] shrink-0 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-3xl p-5 md:p-6 space-y-3.5 relative mx-auto">

                    <div className="text-center space-y-0.5">
                        <h2 className="text-lg font-extrabold text-ink tracking-tight">Create Your Account</h2>
                        <p className="text-xs text-body font-medium">Join JERI to submit and track your manuscripts</p>
                    </div>

                    {message && (
                        <Alert showIcon className="mb-1 text-xs py-1" type="danger">
                            <span className="break-all">{message}</span>
                        </Alert>
                    )}

                    <SignUpForm setMessage={setMessage} />

                    <div className="pt-2 border-t border-hairline/40 flex flex-col items-center gap-2 text-[11px] text-body">
                        <div>
                            <span>Already have an account? </span>
                            <Link to="/sign-in" className="font-bold text-primary hover:underline ml-0.5">
                                Sign In
                            </Link>
                        </div>

                        <Link
                            to="/"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-md text-ink hover:text-primary font-bold text-[11px] border border-hairline hover:border-primary/40 shadow-xs transition-all hover:scale-105"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 text-primary" />
                            <span>Back to Main Website</span>
                        </Link>
                    </div>

                </div>
            </div>

            <div className="text-center text-[10px] text-body font-medium z-10 relative pb-1">
                © {new Date().getFullYear()} Journal of Emerging Research and Innovation (JERI). All rights reserved.
            </div>

        </div>
    )
}

export const SignUpBase = SignUp

export default SignUp
