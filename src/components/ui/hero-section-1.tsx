import React from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import NudgeLogo from '@/components/NudgeLogo'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
} as const;

interface HeroSectionProps {
    onTakeTest?: () => void;
    onSignup?: () => void;
    onLogin?: () => void;
}

export function HeroSection({ onTakeTest, onSignup, onLogin }: HeroSectionProps) {
    return (
        <>
            <HeroHeader onLogin={onLogin} onSignup={onSignup} />
            <main className="overflow-hidden">
                <section className="relative">
                    <div className="relative pt-24 md:pt-36 pb-24 md:pb-32">
                        {/* Clear subtle background glow */}
                        <div className="absolute inset-0 overflow-hidden -z-20 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,111,255,0.08)_0,transparent_70%)]" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]" />
                        </div>

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <button
                                        onClick={onTakeTest}
                                        className="hover:bg-white/10 bg-white/5 group mx-auto flex w-fit items-center gap-4 rounded-full border border-white/10 p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 cursor-pointer">
                                        <span className="text-white/80 text-sm">AI-Powered Financial Intelligence</span>
                                        <span className="block h-4 w-0.5 border-l border-white/20 bg-white/10"></span>

                                        <div className="bg-white/10 group-hover:bg-white/20 size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                        
                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold tracking-tighter text-white">
                                        Master Your Money With <span style={{background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Zero Effort</span>
                                    </h1>
                                    <p
                                        className="mx-auto mt-6 max-w-2xl text-balance text-lg md:text-xl text-white/80 leading-relaxed">
                                        Nudgé analyzes your spending, optimizes your bills, and builds your credit passively — so you can focus on living.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-white/10 rounded-[14px] border border-white/10 p-0.5">
                                        <Button
                                            onClick={onTakeTest}
                                            size="lg"
                                            className="rounded-xl px-5 text-base bg-action border-0 text-white font-bold shadow-lg shadow-accent-600/25 hover:shadow-accent-600/40 cursor-pointer">
                                            <span className="text-nowrap">Take Free Financial Test</span>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        onClick={onSignup}
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer">
                                        <span className="text-nowrap">Sign Up Directly</span>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
]

interface HeroHeaderProps {
    onLogin?: () => void;
    onSignup?: () => void;
}

const HeroHeader = ({ onLogin, onSignup }: HeroHeaderProps) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-[var(--bg-primary)]/70 max-w-4xl rounded-2xl border border-white/10 backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <NudgeLogo iconSize={28} textSize="text-lg" />

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200 text-white" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 text-white" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm font-medium">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <a
                                            href={item.href}
                                            className="text-white/70 hover:text-white block duration-150">
                                            <span>{item.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-[var(--bg-secondary)] group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-white/10 p-6 shadow-2xl shadow-black/30 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <a
                                                href={item.href}
                                                className="text-white/60 hover:text-white block duration-150">
                                                <span>{item.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    onClick={onLogin}
                                    variant="outline"
                                    size="sm"
                                    className={cn('border-white/10 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer', isScrolled && 'lg:hidden')}>
                                    <span>Login</span>
                                </Button>
                                <Button
                                    onClick={onSignup}
                                    size="sm"
                                    className={cn('bg-action text-white border-0 font-bold cursor-pointer shadow-lg shadow-accent-600/25', isScrolled && 'lg:hidden')}>
                                    <span>Sign Up</span>
                                </Button>
                                <Button
                                    onClick={onLogin}
                                    size="sm"
                                    className={cn('bg-action text-white border-0 font-bold cursor-pointer', isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <span>Get Started</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default HeroSection;
