/** Onboarding form sections (1–6). Step 0 is reserved for resume-upload gate only. */
export const ONBOARDING_SECTION_COUNT = 6;

/** UI step for `/doctor/onboarding` — always 1..6. */
export function clampOnboardingSectionStep(step: number | undefined | null): number {
    const n = typeof step === 'number' && Number.isFinite(step) ? Math.trunc(step) : 1;
    if (n < 1) return 1;
    if (n > ONBOARDING_SECTION_COUNT) return ONBOARDING_SECTION_COUNT;
    return n;
}

/** Normalise persisted mock/local step (legacy values 7–8 meant “finished”). */
export function normalizeStoredOnboardingStep(step: number | undefined | null): number {
    const n = typeof step === 'number' && Number.isFinite(step) ? Math.trunc(step) : 0;
    if (n <= 0) return 0;
    if (n > ONBOARDING_SECTION_COUNT) return ONBOARDING_SECTION_COUNT;
    return n;
}
