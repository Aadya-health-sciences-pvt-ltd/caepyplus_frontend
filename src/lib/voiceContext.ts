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
            { key: "email", label: "Email", description: "Your email address", required: true },
            { key: "phone", label: "Phone Number", description: "Your mobile number", required: true },
            { key: "specialty", label: "Specialty", description: "Your primary medical specialty", required: true },
            { key: "primaryLocation", label: "Primary Location", description: "City or hospital where you practice", required: true },
            { key: "practiceLocations", label: "Practice Locations", description: "List of clinics or hospitals you practice at", required: false },
            { key: "experience", label: "Years of Experience", description: "Total years of medical practice", required: true },
            { key: "postSpecialisationExperience", label: "Post-Specialization Experience", description: "Years since specialization", required: false },
            { key: "registrationNumber", label: "Registration Number", description: "Your medical registration or license number", required: true },
        ]
    },
    2: {
        step: 2,
        section_name: "Credentials & Qualifications",
        fields: [
            { key: "mbbsYear", label: "MBBS Year", description: "Year of MBBS completion", required: true },
            { key: "specialisationYear", label: "Specialisation Year", description: "Year of specialization completion", required: false },
            { key: "fellowships", label: "Fellowships", description: "Any fellowships completed", required: false },
            { key: "qualifications", label: "Qualifications", description: "List of degrees (MD, DM, etc.)", required: false },
            { key: "memberships", label: "Memberships", description: "Professional memberships", required: false },
            { key: "awards", label: "Awards / Honors", description: "Any awards received", required: false },
        ]
    },
    3: {
        step: 3,
        section_name: "Clinical Focus & Expertise",
        fields: [
            { key: "areasOfInterest", label: "Areas of Interest", description: "Your specific medical interests", required: false },
            { key: "practiceSegments", label: "Practice Segments", description: "Segments you practice in", required: false },
            { key: "commonConditions", label: "Common Conditions", description: "Most common conditions you treat", required: true },
            { key: "knownForConditions", label: "Known For", description: "Conditions you are known for treating", required: true },
            { key: "wantToTreatConditions", label: "Target Conditions", description: "Conditions you want to treat more", required: false },
        ]
    },
    4: {
        step: 4,
        section_name: "The Human Side",
        fields: [
            { key: "trainingExperience", label: "Training Challenges", description: "Challenging parts of training (Max 2)", required: false },
            { key: "motivation", label: "Motivation", description: "What keeps you going (Max 2)", required: false },
            { key: "unwinding", label: "Unwinding", description: "How you unwind", required: false },
            { key: "recognition", label: "Recognition", description: "How you like to be recognised", required: false },
            { key: "qualityTime", label: "Quality Time", description: "Preferred way to spend quality time", required: false },
            { key: "proudAchievement", label: "Proud Achievement", description: "A professional achievement", required: false },
            { key: "personalAchievement", label: "Personal Achievement", description: "A personal achievement", required: false },
            { key: "professionalAspiration", label: "Professional Aspiration", description: "Your professional goal", required: false },
            { key: "personalAspiration", label: "Personal Aspiration", description: "Your personal goal", required: false },
        ]
    },
    5: {
        step: 5,
        section_name: "Patient Value & Choice Factors",
        fields: [
            { key: "patientValue", label: "Patient Value", description: "What patients value most in your practice", required: false },
            { key: "careApproach", label: "Care Approach", description: "Your approach to patient care", required: false },
            { key: "practicePhilosophy", label: "Practice Philosophy", description: "Your philosophy of practice", required: false },
        ]
    },
    6: {
        step: 6,
        section_name: "Content Seed",
        fields: [
            { key: "contentSeed.conditionName", label: "Condition Name", description: "Name of the condition to discuss", required: false },
            { key: "contentSeed.presentation", label: "Presentation", description: "Typical symptoms and presentation", required: false },
            { key: "contentSeed.investigations", label: "Investigations", description: "Required tests and investigations", required: false },
            { key: "contentSeed.treatment", label: "Treatment", description: "Treatment options available", required: false },
            { key: "contentSeed.delayConsequences", label: "Delay Consequences", description: "Risks of delaying treatment", required: false },
            { key: "contentSeed.prevention", label: "Prevention", description: "Preventive measures", required: false },
            { key: "contentSeed.additionalInsights", label: "Additional Insights", description: "Any other important information", required: false },
        ]
    }
};
