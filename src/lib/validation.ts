export const validateSection1 = (formData: any) => {
    const requiredFields = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'specialty', label: 'Specialty' },
        { key: 'primaryLocation', label: 'Primary Location' },
        { key: 'experience', label: 'Experience' },
        { key: 'postSpecialisationExperience', label: 'Post-specialization Experience' },
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
