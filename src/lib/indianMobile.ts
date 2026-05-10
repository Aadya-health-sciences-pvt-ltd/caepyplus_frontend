/** Display / entry prefix for Indian mobile numbers in onboarding. */
export const INDIAN_MOBILE_PREFIX = '+91';

/** Strip to up to 10 national digits (after removing leading 91 if present). */
function extractNationalDigits(input: string): string {
    const d = input.replace(/\D/g, '');
    if (d.length >= 12 && d.startsWith('91')) return d.slice(2, 12);
    if (d.length >= 11 && d.startsWith('91')) return d.slice(2);
    return d.slice(0, 10);
}

/**
 * Normalize any stored value to `+91` + up to 10 digits (does not enforce first-digit rule).
 */
export function normalizeIndianPhoneForForm(phone: string | undefined | null): string {
    if (!phone || !String(phone).trim()) return INDIAN_MOBILE_PREFIX;
    const national = extractNationalDigits(String(phone));
    return national ? `${INDIAN_MOBILE_PREFIX}${national}` : INDIAN_MOBILE_PREFIX;
}

/**
 * Controlled input: keep `+91` and only allow up to 10 national digits; first digit must be 6–9.
 */
export function sanitizeIndianMobileInput(raw: string): string {
    const without = raw.replace(/^\+?91\s?/, '').replace(/\D/g, '');
    let national = '';
    for (let i = 0; i < without.length && national.length < 10; i++) {
        const ch = without[i];
        if (national.length === 0) {
            if ('6789'.includes(ch)) national += ch;
        } else if (/\d/.test(ch)) {
            national += ch;
        }
    }
    return `${INDIAN_MOBILE_PREFIX}${national}`;
}

/** National 10 digits only; returns null if `+91` + valid 10-digit mobile. */
export function validateIndianMobile(phone: string | undefined | null): string | null {
    const p = (phone ?? '').trim();
    if (!p || p === INDIAN_MOBILE_PREFIX) {
        return 'Phone Number is required';
    }
    if (!p.startsWith(INDIAN_MOBILE_PREFIX)) {
        return 'Phone must start with +91';
    }
    const national = p.slice(INDIAN_MOBILE_PREFIX.length).replace(/\D/g, '');
    if (national.length !== 10) {
        return 'Enter 10 digits after +91';
    }
    if (!/^[6789]/.test(national)) {
        return 'Mobile number must start with 6, 7, 8, or 9';
    }
    return null;
}

/** Same rules as validateIndianMobile but allows empty (e.g. optional when email is present). */
export function validateIndianMobileOptional(phone: string | undefined | null): string | null {
    const p = (phone ?? '').trim();
    if (!p || p === INDIAN_MOBILE_PREFIX) return null;
    return validateIndianMobile(p);
}
