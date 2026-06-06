import { normalizeIndianPhoneForForm } from './indianMobile';

export interface AuthoritativeLoginIdentityOptions {
    loginPhone?: string | null;
    loginEmail?: string | null;
}

/**
 * Restore OTP/Google login identifiers over resume-extracted contact fields.
 *
 * Phone OTP users keep `mobile_number`; Google users keep `user_email`.
 * When options are omitted, reads from localStorage in the browser.
 */
export function applyAuthoritativeLoginIdentity(
    formData: Record<string, unknown>,
    options?: AuthoritativeLoginIdentityOptions,
): void {
    let loginPhone = options?.loginPhone;
    let loginEmail = options?.loginEmail;

    if (typeof window !== 'undefined') {
        if (loginPhone == null || loginPhone === '') {
            loginPhone = localStorage.getItem('mobile_number');
        }
        if (loginEmail == null || loginEmail === '') {
            loginEmail = localStorage.getItem('user_email');
        }
    }

    if (loginPhone) {
        formData.phone = normalizeIndianPhoneForForm(loginPhone);
    }
    if (loginEmail) {
        formData.email = loginEmail.trim();
    }
}
