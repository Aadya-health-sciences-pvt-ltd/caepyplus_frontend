export interface FieldContext {
    key: string;
    label: string;
    description?: string;
    required?: boolean;
    voiceSkip?: boolean; // If true, bot skips this field and tells user to fill manually
}

export interface StepContext {
    step: number;
    section_name: string;
    fields: FieldContext[];
    isLastStep?: boolean;
}

export interface VoiceConfig {
    context: Record<number, StepContext>;
    instructions: Record<string, string>;
}

export const ONBOARDING_VOICE_CONTEXT: Record<number, StepContext> = {
    1: {
        step: 1,
        section_name: "Professional Identity",
        fields: [
            { key: "profileImage", label: "Profile Image", description: "Profile picture", required: false, voiceSkip: true },
            { key: "fullName", label: "Full Name", description: "Your full name as per registration", required: true },
            { key: "email", label: "Email", description: "Your email address", required: true },
            { key: "phone", label: "Phone Number", description: "Your mobile number", required: true },
            { key: "specialty", label: "Specialty", description: "Your primary medical specialty", required: true },
            { key: "languages", label: "Languages", description: "Languages spoken", required: false },
            { key: "primaryLocation", label: "Primary Location", description: "City or hospital where you practice", required: true },
            { key: "practiceLocations", label: "Practice location and Schedule", description: "List of clinics or hospitals you practice at", required: true, voiceSkip: true },
            { key: "experience", label: "Years of Experience", description: "Total years of medical practice", required: true },
            { key: "postSpecialisationExperience", label: "Post-Specialization Experience", description: "Years since specialization", required: false },
            { key: "registrationNumber", label: "Medical Registration Number", description: "Your medical registration or license number", required: true },
            { key: "medicalCouncil", label: "Medical Council", description: "State or national medical council name", required: true },
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
            { key: "trainingExperience", label: "Training Challenges", description: "Challenging parts of training — capture the doctor's full response as-is", required: false },
            { key: "motivation", label: "Motivation", description: "What keeps you going in medicine — capture the doctor's full response as-is", required: false },
            { key: "unwinding", label: "Unwinding", description: "How you unwind after work — capture the full answer", required: false },
            { key: "recognition", label: "Recognition", description: "How you like to be recognised — capture the full answer", required: false },
            { key: "qualityTime", label: "Quality Time", description: "Preferred way to spend quality time — capture the full answer", required: false },
            { key: "proudAchievement", label: "Proud Achievement", description: "A professional achievement you are proud of — capture the doctor's full detailed answer word-for-word", required: false },
            { key: "personalAchievement", label: "Personal Achievement", description: "A personal achievement — capture the doctor's full detailed answer word-for-word", required: false },
            { key: "professionalAspiration", label: "Professional Aspiration", description: "Your professional goal or aspiration — capture the doctor's full detailed answer word-for-word", required: false },
            { key: "personalAspiration", label: "Personal Aspiration", description: "Your personal goal or aspiration — capture the doctor's full detailed answer word-for-word", required: false },
        ]
    },
    5: {
        step: 5,
        section_name: "Patient Value & Choice Factors",
        fields: [
            { key: "patientValue", label: "Patient Value", description: "What patients value most in your practice — capture the doctor's full detailed answer", required: false },
            { key: "careApproach", label: "Care Approach", description: "Your approach to patient care — capture the doctor's full detailed answer", required: false },
            { key: "practicePhilosophy", label: "Practice Philosophy", description: "Your philosophy of practice — capture the doctor's full detailed answer", required: false },
            { key: "consultationFee", label: "Consultation Fee", description: "Your standard consultation fee", required: false },
        ]
    },
    6: {
        step: 6,
        section_name: "Content Seed",
        isLastStep: true,
        fields: [
            { key: "contentSeed.conditionName", label: "Condition Name", description: "Name of the condition to discuss", required: false },
            { key: "contentSeed.presentation", label: "Presentation", description: "Typical symptoms and presentation — capture the doctor's full detailed answer", required: false },
            { key: "contentSeed.investigations", label: "Investigations", description: "Required tests and investigations — capture the doctor's full detailed answer", required: false },
            { key: "contentSeed.treatment", label: "Treatment", description: "Treatment options available — capture the doctor's full detailed answer", required: false },
            { key: "contentSeed.delayConsequences", label: "Delay Consequences", description: "Risks of delaying treatment — capture the doctor's full detailed answer", required: false },
            { key: "contentSeed.prevention", label: "Prevention", description: "Preventive measures — capture the doctor's full detailed answer", required: false },
            { key: "contentSeed.additionalInsights", label: "Additional Insights", description: "Any other important information — capture the doctor's full detailed answer", required: false },
        ]
    }
};

export const VOICE_INSTRUCTIONS: Record<string, string> = {
    complete: "All fields for this section are complete. Greet the user with EXACTLY: 'Hi, all the details are filled, how can I help you today? If you want to make any changes let me know.' Do NOT ask for any specific fields unless the user asks to change them. If the user does not respond, remain absolutely silent and do NOT prompt them again.",
    incomplete: "Wait for the user to FULLY finish speaking before calling 'update_form'. For fields marked 'required: false', tell the user they can skip it by saying 'skip' — if skipped, set its value to exactly '[SKIPPED]'. For fields marked 'required: true', you MUST strictly refuse to skip them. If the user tries to skip a required field, politely explain that it is mandatory and ask them to provide it. CRITICAL: If the user says nothing, just says 'hello', or if there is only background noise, DO NOT call `update_form` with empty data. Wait for actual field data."
};

export const VOICE_CONFIG: VoiceConfig = {
    context: ONBOARDING_VOICE_CONTEXT,
    instructions: VOICE_INSTRUCTIONS
};
