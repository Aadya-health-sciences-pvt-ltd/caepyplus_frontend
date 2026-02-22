import React from 'react';
import styles from './Stepper.module.css';

interface StepperProps {
    currentStep: number;
    totalSteps: number;
    onStepClick?: (step: number) => void;
}



const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, onStepClick }) => {
    const handleStepClick = (step: number) => {
        if (onStepClick && step < currentStep) {
            onStepClick(step);
        }
    };

    return (
        <div className={styles.stepperContainer}>
            <div className={styles.stepsWrapper}>
                {/* Background Line */}
                <div className={styles.stepLine}>
                    <div
                        className={styles.stepLineFill}
                        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    />
                </div>
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                    const isCompleted = step < currentStep;
                    const isClickable = isCompleted && onStepClick;

                    return (
                        <div
                            key={step}
                            className={styles.stepItem}
                            onClick={() => isClickable && handleStepClick(step)}
                            style={{ cursor: isClickable ? 'pointer' : 'default' }}
                        >
                            <div className={`${styles.stepCircle} ${step === currentStep ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                                {isCompleted ? (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    step
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
