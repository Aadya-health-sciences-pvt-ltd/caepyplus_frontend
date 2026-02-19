export const validateSection1 = (formData: any) => {
    const requiredFields = [
        { key: 'fullName', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'specialty', label: 'Specialty' },
        { key: 'primaryLocation', label: 'Primary Location' },
        { key: 'experience', label: 'Experience' },
        { key: 'postSpecialisationExperience', label: 'Post-specialization Experience' },
        { key: 'registrationNumber', label: 'Registration Number' }
        // practiceLocations check needs special handling if it's an array
    ];

    const missingFields: string[] = [];

    requiredFields.forEach(field => {
        if (!formData[field.key] || !formData[field.key].toString().trim()) {
            missingFields.push(field.label);
        }
    });

    // Check practiceLocations (array)
    // If requirement is "at least one", check length.
    // However, the UI might manage it differently. Let's assume non-empty array.
    if (!formData.practiceLocations || formData.practiceLocations.length === 0) {
        missingFields.push('Practice Locations');
    }

    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};
