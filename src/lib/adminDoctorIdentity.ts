/** Synthetic bootstrap values that should not be shown in admin UI. */
const PLACEHOLDER_IDENTITY_EMAIL = /^placeholder_\d+@caepy\.com$/i;
const DOCTOR_PLACEHOLDER_NAME = /^Doctor \d+$/i;
const UNKNOWN_IDENTITY_PHONE = /^UNKNOWN_\d+$/i;

export function isSyntheticIdentityEmail(email?: string | null): boolean {
    const value = (email ?? '').trim();
    return !value || PLACEHOLDER_IDENTITY_EMAIL.test(value);
}

export function isSyntheticIdentityName(name?: string | null): boolean {
    const value = (name ?? '').trim();
    return !value || DOCTOR_PLACEHOLDER_NAME.test(value);
}

export function isSyntheticIdentityPhone(phone?: string | null): boolean {
    const value = (phone ?? '').trim();
    return !value || UNKNOWN_IDENTITY_PHONE.test(value);
}

/**
 * Prefer a real identity email; use doctors.email when identity is a bootstrap placeholder.
 */
export function resolveDoctorDisplayEmail(
    identityEmail?: string | null,
    doctorEmail?: string | null,
): string {
    const identity = (identityEmail ?? '').trim();
    const doctor = (doctorEmail ?? '').trim();

    if (identity && !isSyntheticIdentityEmail(identity)) {
        return identity;
    }
    if (doctor && !doctor.toLowerCase().startsWith('pending_')) {
        return doctor;
    }
    return identity || doctor || '';
}

/**
 * Prefer doctors.full_name; skip synthetic identity names like "Doctor 42".
 */
export function resolveDoctorDisplayName(
    doctorFullName?: string | null,
    identityFullName?: string | null,
    identityJoined?: string | null,
): string {
    const doctor = (doctorFullName ?? '').trim();
    const identity = (identityFullName ?? '').trim();
    const joined = (identityJoined ?? '').trim();

    if (doctor && !isSyntheticIdentityName(doctor)) {
        return doctor;
    }
    if (joined) {
        return joined;
    }
    if (identity && !isSyntheticIdentityName(identity)) {
        return identity;
    }
    return doctor || joined || identity || '';
}

/**
 * Prefer doctors.phone; skip synthetic identity phones like "UNKNOWN_42".
 */
export function resolveDoctorDisplayPhone(
    identityPhone?: string | null,
    doctorPhone?: string | null,
): string {
    const identity = (identityPhone ?? '').trim();
    const doctor = (doctorPhone ?? '').trim();

    if (doctor && !isSyntheticIdentityPhone(doctor)) {
        return doctor;
    }
    if (identity && !isSyntheticIdentityPhone(identity)) {
        return identity;
    }
    return doctor || identity || '';
}
