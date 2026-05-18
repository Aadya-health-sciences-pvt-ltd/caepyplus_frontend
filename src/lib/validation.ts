export const validateSection1 = (formData: any) => {
    const requiredFields = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'specialty', label: 'Specialty' },
        { key: 'primaryLocation', label: 'Primary Location' },
        { key: 'experience', label: 'Experience' },
        { key: 'registrationNumber', label: 'Registration Number' },
        { key: 'medicalCouncil', label: 'Medical Council' }
        // practiceLocations check needs special handling if it's an array
    ];

    const errors: string[] = [];

    requiredFields.forEach(field => {
        if (!formData[field.key] || !formData[field.key].toString().trim()) {
            errors.push(`${field.label} is required`);
        }
    });

    // Check practiceLocations (array)
    // If requirement is "at least one", check length.
    // However, the UI might manage it differently. Let's assume non-empty array.
    if (!formData.practiceLocations || formData.practiceLocations.length === 0) {
        errors.push('At least one Practice Location is required');
    } else {
        // Validate each location's pincode
        formData.practiceLocations.forEach((loc: any, idx: number) => {
            if (loc.pincode && loc.pincode.replace(/\D/g, '').length !== 6) {
                errors.push(`Practice Location ${idx + 1} pincode must be exactly 6 digits`);
            }
        });
    }

    // Phone format validation (Max length 13, only numbers and +)
    if (formData.phone) {
        const phone = formData.phone.toString();
        // Allow + at start and numbers only
        if (!/^\+?[0-9]*$/.test(phone) || phone.length > 13) {
            errors.push('Phone Number must contain only numbers (and optional + prefix) with a maximum length of 13 characters');
        }
    }


    return {
        isValid: errors.length === 0,
        errors
    };
};

/** Inclusive; use for credentials year fields (MBBS / specialisation). */
export const CREDENTIALS_YEAR_MIN = 1950;

export function getCredentialsYearMax(): number {
    return new Date().getFullYear();
}

/** Returns null if valid; otherwise a single user-facing message. Empty requires MBBS. */
export function validateMbbsYearValue(value: unknown): string | null {
    const max = getCredentialsYearMax();
    const raw = value == null ? '' : String(value).trim();
    if (!raw) return 'Year of MBBS is required';
    if (!/^\d+$/.test(raw)) return 'Enter a valid year';
    const y = parseInt(raw, 10);
    if (y < CREDENTIALS_YEAR_MIN || y > max) {
        return `Year must be between ${CREDENTIALS_YEAR_MIN} and ${max}`;
    }
    return null;
}

/**
 * Optional field: empty is valid. If set, must be a year in range and strictly after MBBS year.
 */
export function validateSpecialisationYearValue(specValue: unknown, mbbsValue: unknown): string | null {
    const raw = specValue == null ? '' : String(specValue).trim();
    if (!raw) return null;

    const max = getCredentialsYearMax();
    if (!/^\d+$/.test(raw)) return 'Enter a valid year';
    const specY = parseInt(raw, 10);
    if (specY < CREDENTIALS_YEAR_MIN || specY > max) {
        return `Year must be between ${CREDENTIALS_YEAR_MIN} and ${max}`;
    }

    const mbbsRaw = mbbsValue == null ? '' : String(mbbsValue).trim();
    const mbbsErr = validateMbbsYearValue(mbbsValue);
    if (mbbsErr || !mbbsRaw) {
        return 'Enter a valid Year of MBBS before specialisation year';
    }
    const mbbsY = parseInt(mbbsRaw, 10);
    if (specY <= mbbsY) {
        return 'Year of Specialisation must be greater than Year of MBBS';
    }
    return null;
}

export const validateSection2 = (formData: any) => {
    const errors: string[] = [];

    const mbbsErr = validateMbbsYearValue(formData.mbbsYear);
    if (mbbsErr) errors.push(mbbsErr);

    const exp = formData.experience;
    if (exp === undefined || exp === null || !String(exp).trim()) {
        errors.push('Years of Experience is required');
    }

    const specErr = validateSpecialisationYearValue(formData.specialisationYear, formData.mbbsYear);
    if (specErr) errors.push(specErr);

    return {
        isValid: errors.length === 0,
        errors
    };
};
