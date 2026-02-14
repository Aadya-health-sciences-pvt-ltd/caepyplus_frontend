import { useState, useEffect, useCallback } from 'react';
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
        target: 'ai-banner',
        title: 'Voice-Powered Assistant',
        description: 'Click the microphone and speak naturally. CAEPY AI will listen, understand, and fill in your profile fields automatically.',
        position: 'bottom',
    },
    {
        target: 'form-section',
        title: 'Your Profile Form',
        description: 'Fill in your details section by section. Required fields are marked with an asterisk (*). You can also type if you prefer.',
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
];

const GuidedTour = ({ isActive, onComplete, onSkip }: GuidedTourProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const [spotlightRect, setSpotlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const currentStep = TOUR_STEPS[currentStepIndex];

    const calculatePositions = useCallback(() => {
        if (!isActive || !currentStep) return;

        const targetEl = document.querySelector(`[data-tour="${currentStep.target}"]`);
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const padding = 8;

        // Spotlight rectangle
        setSpotlightRect({
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
        });

        // Tooltip position
        const tooltipWidth = 320;
        const tooltipHeight = 200; // approximate
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
    }, [isActive, currentStep]);

    useEffect(() => {
        calculatePositions();

        const handleResize = () => calculatePositions();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize, true);
        };
    }, [calculatePositions, currentStepIndex]);

    // Scroll target into view
    useEffect(() => {
        if (!isActive || !currentStep) return;

        const targetEl = document.querySelector(`[data-tour="${currentStep.target}"]`);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Recalculate after scroll
            const timer = setTimeout(calculatePositions, 400);
            return () => clearTimeout(timer);
        }
    }, [currentStepIndex, isActive, currentStep, calculatePositions]);

    const handleNext = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    if (!isActive) return null;

    const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

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
                    key={currentStepIndex}
                    className={styles.tooltip}
                    style={{
                        top: tooltipPos.top,
                        left: tooltipPos.left,
                    }}
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
                            {currentStepIndex + 1} / {TOUR_STEPS.length}
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
                            {TOUR_STEPS.map((_, i) => (
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
