'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PartyPopper, ArrowRight } from 'lucide-react';
import styles from './WelcomeDialog.module.css';

interface WelcomeDialogProps {
    isOpen: boolean;
    isNewUser: boolean;
    userName?: string;
    currentStep?: number;
    totalSteps?: number;
    /** Real 0–100 completion from filled fields (e.g. `calculateProfileProgress`). When set for returning users, overrides step-based estimate. */
    profileCompletionPercent?: number;
    showSkipButton?: boolean;
    onStartTour: () => void;
    onSkip: () => void;
    onSkipToReview?: () => void;
}

const SECTION_NAMES: Record<number, string> = {
    1: 'Professional Identity',
    2: 'Credentials & Trust Markers',
    3: 'Clinical Focus & Expertise',
    4: 'The Human Side',
    5: 'Patient Value & Choice Factors',
    6: 'Content Seed',
};

const WelcomeDialog = ({
    isOpen,
    isNewUser,
    userName,
    currentStep = 1,
    totalSteps = 6,
    profileCompletionPercent,
    showSkipButton = false,
    onStartTour,
    onSkip,
    onSkipToReview,
}: WelcomeDialogProps) => {
    const stepBasedPercent = Math.round(((currentStep - 1) / totalSteps) * 100);
    const completionPercent =
        typeof profileCompletionPercent === 'number' && !Number.isNaN(profileCompletionPercent)
            ? Math.min(100, Math.max(0, Math.round(profileCompletionPercent)))
            : stepBasedPercent;
    const displayName = userName || 'Doctor';
    const nextSection = SECTION_NAMES[currentStep] || `Section ${currentStep}`;

    const confettiColors = ['#0F766E', '#10B981', '#39C8CE', '#FCD34D', '#818CF8', '#F472B6'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className={styles.dialog}
                        initial={{ opacity: 0, scale: 0.85, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 30 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                            delay: 0.1,
                        }}
                    >
                        {/* Confetti for new users */}
                        {isNewUser && (
                            <div className={styles.confetti}>
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={styles.confettiPiece}
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            background: confettiColors[i % confettiColors.length],
                                            animationDelay: `${Math.random() * 0.8}s`,
                                            animationDuration: `${2 + Math.random() * 2}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {isNewUser ? (
                            /* ============ NEW USER ============ */
                            <>
                                <motion.div
                                    className={`${styles.iconWrapper} ${styles.iconNew}`}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                                >
                                    <PartyPopper size={28} />
                                </motion.div>

                                <motion.h2
                                    className={styles.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Welcome to Caepy!
                                </motion.h2>

                                <motion.p
                                    className={styles.description}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    You've started a new registration. We'll guide you through a simple onboarding process to build your professional profile. It takes just 12–15 minutes, and you can save & resume anytime.
                                </motion.p>

                                <motion.div
                                    className={styles.buttonGroup}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <button className={styles.secondaryButton} onClick={onSkip}>
                                        Skip Tour
                                    </button>
                                    <button className={styles.primaryButton} onClick={onStartTour}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                            Take a Quick Tour <ArrowRight size={16} />
                                        </span>
                                    </button>
                                </motion.div>
                            </>
                        ) : (
                            /* ============ RETURNING USER ============ */
                            <>
                                <motion.div
                                    className={`${styles.iconWrapper} ${styles.iconReturning}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                                >
                                    <Sparkles size={28} />
                                </motion.div>

                                <motion.h2
                                    className={styles.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Welcome Back, {displayName}!
                                </motion.h2>

                                <motion.p
                                    className={styles.description}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Your profile is in progress. Pick up right where you left off.
                                </motion.p>

                                <motion.div
                                    className={styles.statusCard}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55 }}
                                >
                                    <div className={styles.statusRow}>
                                        <span className={styles.statusLabel}>Profile Completion</span>
                                        <span className={styles.statusValue}>{completionPercent}%</span>
                                    </div>
                                    <div className={styles.progressBarOuter}>
                                        <motion.div
                                            className={styles.progressBarInner}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercent}%` }}
                                            transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className={styles.statusRow} style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                                        <span className={styles.statusLabel}>Next Section</span>
                                        <span className={styles.statusValue}>{nextSection}</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className={styles.buttonGroup}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.65 }}
                                    style={{ justifyContent: showSkipButton ? 'space-between' : 'center' }}
                                >
                                    {showSkipButton && onSkipToReview && (
                                        <button className={styles.secondaryButton} onClick={onSkipToReview}>
                                            Skip to Review
                                        </button>
                                    )}
                                    <button className={styles.primaryButton} onClick={onSkip} style={{ flex: 'unset' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                            Continue <ArrowRight size={16} />
                                        </span>
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeDialog;
