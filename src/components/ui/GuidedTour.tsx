'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import styles from './GuidedTour.module.css';

interface TourStep {
    target: string; // data-tour attribute value
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
    isActive: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

const TOUR_STEPS: TourStep[] = [
    {
        target: 'stepper',
        title: 'Track Your Progress',
        description: 'This stepper shows your onboarding progress across 6 sections. Click on completed steps to review them anytime.',
        position: 'bottom',
    },
    {
        target: 'form-section',
        title: 'Your Profile Form',
        description: 'Fill in your details section by section. Required fields are marked with an asterisk (*). Your progress is saved as you go.',
        position: 'right',
    },
    {
        target: 'live-preview',
        title: 'Live Preview',
        description: 'See your profile update in real-time as you fill in the form. Click the edit icon on any field to jump directly to it.',
        position: 'left',
    },
    {
        target: 'next-button',
        title: 'Navigate Sections',
        description: 'Click "Next" to move to the next section when you\'re ready. Your progress is auto-saved, so you won\'t lose anything.',
        position: 'top',
    },
    {
        target: 'sidebar-dashboard',
        title: 'Dashboard',
        description: 'Use Dashboard in the left menu anytime for your overview, profile card, and quick access to key areas of your practice presence.',
        position: 'right',
    },
    {
        target: 'sidebar-profile',
        title: 'Profile',
        description: 'Open Profile from the sidebar to view and manage your professional details, summary, and visibility settings.',
        position: 'right',
    },
];

/** Tablet + mobile only — desktop web uses full tour (min-width: 1025px). */
const COMPACT_TOUR_MEDIA = '(max-width: 1024px)';
const LIVE_PREVIEW_STEP_TARGET = 'live-preview';

const COMPACT_TOOLTIP_WIDTH = 260;
const COMPACT_VIEWPORT_MARGIN = 12;

const GuidedTour = ({ isActive, onComplete, onSkip }: GuidedTourProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const [compactTooltipTop, setCompactTooltipTop] = useState<number | null>(null);
    const [spotlightRect, setSpotlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [isCompactTour, setIsCompactTour] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia(COMPACT_TOUR_MEDIA);
        const sync = () => setIsCompactTour(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    const activeSteps = isCompactTour
        ? TOUR_STEPS.filter((step) => step.target !== LIVE_PREVIEW_STEP_TARGET)
        : TOUR_STEPS;

    const currentStep = activeSteps[currentStepIndex] ?? activeSteps[0];

    useEffect(() => {
        if (currentStepIndex >= activeSteps.length) {
            setCurrentStepIndex(Math.max(0, activeSteps.length - 1));
        }
    }, [activeSteps.length, currentStepIndex]);

    const calculatePositions = useCallback(() => {
        if (!isActive || !currentStep) return;

        const targetEl = document.querySelector(`[data-tour="${currentStep.target}"]`);
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const padding = isCompactTour ? 6 : 8;

        // Spotlight rectangle
        setSpotlightRect({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
        });

        const tooltipWidth = isCompactTour
            ? Math.min(COMPACT_TOOLTIP_WIDTH, window.innerWidth - COMPACT_VIEWPORT_MARGIN * 2)
            : 320;
        const tooltipHeight = isCompactTour
            ? (tooltipRef.current?.getBoundingClientRect().height ?? 180)
            : 200;

        if (isCompactTour) {
            const viewHeight = window.visualViewport?.height ?? window.innerHeight;
            const spotTop = rect.top - padding;
            const spotBottom = rect.bottom + padding;
            const gap = 10;
            const left = Math.max(COMPACT_VIEWPORT_MARGIN, (window.innerWidth - tooltipWidth) / 2);

            // Default: anchor to bottom so actions stay on-screen.
            let top = viewHeight - tooltipHeight - COMPACT_VIEWPORT_MARGIN;

            const overlapsSpotlight = top < spotBottom + gap && top + tooltipHeight > spotTop - gap;
            if (overlapsSpotlight) {
                const aboveTop = spotTop - gap - tooltipHeight;
                const belowTop = spotBottom + gap;

                if (aboveTop >= COMPACT_VIEWPORT_MARGIN) {
                    top = aboveTop;
                } else if (belowTop + tooltipHeight <= viewHeight - COMPACT_VIEWPORT_MARGIN) {
                    top = belowTop;
                } else {
                    top = COMPACT_VIEWPORT_MARGIN;
                }
            }

            top = Math.max(
                COMPACT_VIEWPORT_MARGIN,
                Math.min(top, viewHeight - tooltipHeight - COMPACT_VIEWPORT_MARGIN),
            );

            setCompactTooltipTop(top);
            setTooltipPos({ top, left });
            return;
        }

        setCompactTooltipTop(null);

        // Desktop tooltip position (unchanged)
        let top = 0;
        let left = 0;

        switch (currentStep.position) {
            case 'bottom':
                top = rect.bottom + padding + 12;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'top':
                top = rect.top - padding - tooltipHeight - 12;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - padding - tooltipWidth - 12;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + padding + 12;
                break;
            default:
                top = rect.bottom + padding + 12;
                left = rect.left;
        }

        // Clamp to viewport
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

        setTooltipPos({ top, left });
    }, [isActive, currentStep, isCompactTour]);

    useEffect(() => {
        calculatePositions();

        const handleReposition = () => calculatePositions();
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);
        window.visualViewport?.addEventListener('resize', handleReposition);

        const tooltipEl = tooltipRef.current;
        let resizeObserver: ResizeObserver | undefined;
        if (tooltipEl && isCompactTour) {
            resizeObserver = new ResizeObserver(handleReposition);
            resizeObserver.observe(tooltipEl);
        }

        return () => {
            window.removeEventListener('resize', handleReposition);
            window.removeEventListener('scroll', handleReposition, true);
            window.visualViewport?.removeEventListener('resize', handleReposition);
            resizeObserver?.disconnect();
        };
    }, [calculatePositions, currentStepIndex, isCompactTour]);

    // Scroll target into view
    useEffect(() => {
        if (!isActive || !currentStep) return;

        const targetEl = document.querySelector(`[data-tour="${currentStep.target}"]`);
        if (targetEl) {
            const block = isCompactTour ? 'start' : 'center';
            targetEl.scrollIntoView({ behavior: 'smooth', block });
            // Recalculate after scroll
            const timer = setTimeout(calculatePositions, 400);
            return () => clearTimeout(timer);
        }
    }, [currentStepIndex, isActive, currentStep, calculatePositions, isCompactTour]);

    // Re-measure compact tooltip after step content paints.
    useEffect(() => {
        if (!isActive || !isCompactTour) return;
        const frame = requestAnimationFrame(() => {
            calculatePositions();
        });
        return () => cancelAnimationFrame(frame);
    }, [currentStepIndex, isActive, isCompactTour, calculatePositions]);

    const handleNext = () => {
        if (currentStepIndex < activeSteps.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    if (!isActive || !currentStep) return null;

    const isLastStep = currentStepIndex === activeSteps.length - 1;

    return (
        <>
            {/* Spotlight highlight */}
            <motion.div
                className={styles.spotlightRing}
                animate={{
                    top: spotlightRect.top,
                    left: spotlightRect.left,
                    width: spotlightRect.width,
                    height: spotlightRect.height,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />

            {/* Pulse ring */}
            <motion.div
                className={styles.pulseRing}
                animate={{
                    top: spotlightRect.top - 4,
                    left: spotlightRect.left - 4,
                    width: spotlightRect.width + 8,
                    height: spotlightRect.height + 8,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />

            {/* Click blocker (allows clicking skip/next but blocks everything else) */}
            <div className={styles.spotlightMask} onClick={handleNext} />

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    ref={tooltipRef}
                    key={currentStepIndex}
                    className={`${styles.tooltip} ${isCompactTour ? styles.tooltipCompact : ''}`}
                    style={
                        isCompactTour
                            ? {
                                top: compactTooltipTop ?? 'auto',
                                bottom: compactTooltipTop == null
                                    ? `calc(${COMPACT_VIEWPORT_MARGIN}px + env(safe-area-inset-bottom, 0px))`
                                    : 'auto',
                                left: tooltipPos.left,
                                width: Math.min(
                                    COMPACT_TOOLTIP_WIDTH,
                                    typeof window !== 'undefined'
                                        ? window.innerWidth - COMPACT_VIEWPORT_MARGIN * 2
                                        : COMPACT_TOOLTIP_WIDTH,
                                ),
                            }
                            : {
                                top: tooltipPos.top,
                                left: tooltipPos.left,
                            }
                    }
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                    }}
                >
                    <div className={styles.tooltipHeader}>
                        <span className={styles.stepBadge}>
                            {currentStepIndex + 1} / {activeSteps.length}
                        </span>
                    </div>

                    <h3 className={styles.tooltipTitle}>{currentStep.title}</h3>
                    <p className={styles.tooltipDescription}>{currentStep.description}</p>

                    <div className={styles.tooltipFooter}>
                        <button className={styles.skipButton} onClick={handleSkip}>
                            <X size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            Skip
                        </button>

                        <div className={styles.dots}>
                            {activeSteps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`${styles.dot} ${i === currentStepIndex ? styles.dotActive : ''}`}
                                />
                            ))}
                        </div>

                        <button className={styles.nextButton} onClick={handleNext}>
                            {isLastStep ? 'Done' : 'Next'}
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default GuidedTour;
