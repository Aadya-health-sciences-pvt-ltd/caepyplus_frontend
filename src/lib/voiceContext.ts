export interface FieldContext {
    key: string;
    label: string;
    description?: string;
    required?: boolean;
}

export interface StepContext {
    step: number;
    section_name: string;
    fields: FieldContext[];
}

export const ONBOARDING_VOICE_CONTEXT: Record<number, StepContext> = {
    1: {
        step: 1,
        section_name: "Professional Identity",
        fields: [
            { key: "fullName", label: "Full Name", description: "Your full name as per registration", required: true },
            { key: "specialty", label: "Specialty", description: "Your primary medical specialty", required: true },
            { key: "primaryLocation", label: "Primary Location", description: "City or hospital where you practice", required: true },
        ]
    },
    2: {
        step: 2,
        section_name: "Credentials & Qualifications",
        fields: [
            { key: "experience", label: "Years of Experience", description: "Total years of medical practice", required: true },
            { key: "postSpecialisationExperience", label: "Post-Specialization Experience", description: "Years since specialization" },
            // Note: qualifications is a list, might be hard to extract directly as key-value. 
            // We'll trust the AI to return simple string values or we might need to enhance parsing later.
            // For now, let's stick to simple fields.
        ]
    },
    3: {
        step: 3,
        section_name: "Clinical Profile",
        fields: [
            { key: "commonConditions", label: "Common Conditions", description: "List of conditions you treat frequently" },
            { key: "areasOfInterest", label: "Areas of Interest", description: "Specific medical interests" }
        ]
    },
    4: {
        step: 4,
        section_name: "Personal Journey",
        fields: [
            { key: "bio", label: "Bio / Motivation", description: "Why you became a doctor" }
        ]
    },
    5: {
        step: 5,
        section_name: "Patient Care",
        fields: [
            { key: "consultationStyle", label: "Consultation Style", description: "How you approach patient care" }
        ]
    },
    6: {
        step: 6,
        section_name: "Content Strategy",
        fields: [
            { key: "contentSeed", label: "Content Topic", description: "A topic you'd like to educate patients about" }
        ]
    }
};
