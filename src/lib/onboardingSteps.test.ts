import { describe, expect, it } from 'vitest';
import {
    ONBOARDING_SECTION_COUNT,
    clampOnboardingSectionStep,
    normalizeStoredOnboardingStep,
} from './onboardingSteps';

describe('onboardingSteps', () => {
    it('clamps UI steps to 1..6', () => {
        expect(ONBOARDING_SECTION_COUNT).toBe(6);
        expect(clampOnboardingSectionStep(8)).toBe(6);
        expect(clampOnboardingSectionStep(7)).toBe(6);
        expect(clampOnboardingSectionStep(0)).toBe(1);
    });

    it('normalizes stored legacy completed steps', () => {
        expect(normalizeStoredOnboardingStep(8)).toBe(6);
        expect(normalizeStoredOnboardingStep(0)).toBe(0);
    });
});
