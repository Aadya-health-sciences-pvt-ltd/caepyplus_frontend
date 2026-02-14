import api from '../lib/api';

export interface DoctorProfile {
    id: number;
    title: string | null;
    gender: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
    primary_specialization: string | null;
    years_of_experience: number | null;
    consultation_fee: number | null;
    consultation_currency: string | null;
    medical_registration_number: string | null;
    registration_year: number | null;
    registration_authority: string | null;
    sub_specialties: string[];
    areas_of_expertise: string[];
    languages: string[];
    conditions_treated: string[];
    procedures_performed: string[];
    age_groups_treated: string[];
    awards_recognition: string[];
    memberships: string[];
    publications: string[];
    verbal_intro_file: string | null;
    professional_documents: string[];
    achievement_images: string[];
    external_links: string[];
    practice_locations: Array<{
        hospital_name?: string;
        address?: string;
        city?: string;
        state?: string;
        phone_number?: string;
        consultation_fee?: number;
        consultation_type?: string;
        weekly_schedule?: string;
    }>;
    qualifications: string[];
    onboarding_source: string | null;
    created_at: string;
    updated_at: string | null;

    // Block 1: Professional Identity
    full_name: string | null;
    specialty: string | null;
    primary_practice_location: string | null;
    centres_of_practice: string[];
    years_of_clinical_experience: number | null;
    years_post_specialisation: number | null;

    // Block 2: Credentials & Trust Markers
    year_of_mbbs: number | null;
    year_of_specialisation: number | null;
    fellowships: string[];
    professional_memberships: string[];
    awards_academic_honours: string[];

    // Block 3: Clinical Focus & Expertise
    areas_of_clinical_interest: string[];
    practice_segments: string | null;
    conditions_commonly_treated: string[];
    conditions_known_for: string[];
    conditions_want_to_treat_more: string[];

    // Block 4: The Human Side
    training_experience: string[];
    motivation_in_practice: string[];
    unwinding_after_work: string[];
    recognition_identity: string[];
    quality_time_interests: string[];
    quality_time_interests_text: string | null;
    professional_achievement: string | null;
    personal_achievement: string | null;
    professional_aspiration: string | null;
    personal_aspiration: string | null;

    // Block 5: Patient Value & Choice Factors
    what_patients_value_most: string | null;
    approach_to_care: string | null;
    availability_philosophy: string | null;

    // Block 6: Content Seed
    content_seeds: Array<Record<string, string>>;
}

interface DoctorApiResponse {
    success: boolean;
    message: string;
    data: DoctorProfile;
}

const DOCTOR_PROFILE_KEY = 'doctor_profile';

export const doctorService = {
    /**
     * Fetch doctor profile from API and store in localStorage.
     */
    fetchAndStoreProfile: async (doctorId: string | number): Promise<DoctorProfile> => {
        const response = await api.get<DoctorApiResponse>(`/doctors/${doctorId}`);
        const profile = response.data.data;
        localStorage.setItem(DOCTOR_PROFILE_KEY, JSON.stringify(profile));
        return profile;
    },

    /**
     * Get stored doctor profile from localStorage.
     */
    getStoredProfile: (): DoctorProfile | null => {
        const stored = localStorage.getItem(DOCTOR_PROFILE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        return null;
    },

    /**
     * Map the API doctor profile to the onboarding form data structure.
     */
    mapProfileToFormData: (profile: DoctorProfile): Record<string, unknown> => {
        const formData: Record<string, unknown> = {};

        // Block 1: Professional Identity
        if (profile.full_name) formData.fullName = profile.full_name;
        if (profile.email && !profile.email.startsWith('pending_')) formData.email = profile.email;
        if (profile.phone_number) formData.phone = profile.phone_number;
        if (profile.specialty) formData.specialty = profile.specialty;
        if (profile.primary_practice_location) formData.primaryLocation = profile.primary_practice_location;
        if (profile.centres_of_practice?.length) {
            formData.practiceLocations = profile.centres_of_practice.map(name => ({
                name,
                address: '',
                timings: '',
            }));
        }
        if (profile.years_of_clinical_experience != null) formData.experience = String(profile.years_of_clinical_experience);
        if (profile.years_post_specialisation != null) formData.postSpecialisationExperience = String(profile.years_post_specialisation);

        // Block 2: Credentials & Trust Markers
        if (profile.year_of_mbbs != null) formData.mbbsYear = String(profile.year_of_mbbs);
        if (profile.year_of_specialisation != null) formData.specialisationYear = String(profile.year_of_specialisation);
        if (profile.fellowships?.length) formData.fellowships = profile.fellowships;
        if (profile.qualifications?.length) formData.qualifications = profile.qualifications.join(', ');
        if (profile.professional_memberships?.length) formData.memberships = profile.professional_memberships.join(', ');
        if (profile.awards_academic_honours?.length) formData.awards = profile.awards_academic_honours.join(', ');

        // Block 3: Clinical Focus & Expertise
        if (profile.areas_of_clinical_interest?.length) formData.areasOfInterest = profile.areas_of_clinical_interest;
        if (profile.practice_segments) formData.practiceSegments = profile.practice_segments.split(',').map(s => s.trim());
        if (profile.conditions_commonly_treated?.length) formData.commonConditions = profile.conditions_commonly_treated;
        if (profile.conditions_known_for?.length) formData.knownForConditions = profile.conditions_known_for;
        if (profile.conditions_want_to_treat_more?.length) formData.wantToTreatConditions = profile.conditions_want_to_treat_more.join(', ');

        // Block 4: The Human Side
        if (profile.training_experience?.length) formData.trainingExperience = profile.training_experience;
        if (profile.motivation_in_practice?.length) formData.motivation = profile.motivation_in_practice;
        if (profile.unwinding_after_work?.length) formData.unwinding = profile.unwinding_after_work;
        if (profile.recognition_identity?.length) formData.recognition = profile.recognition_identity.join(', ');
        if (profile.quality_time_interests?.length) formData.qualityTime = profile.quality_time_interests.join(', ');
        if (profile.quality_time_interests_text) formData.freeText = profile.quality_time_interests_text;
        if (profile.professional_achievement) formData.proudAchievement = profile.professional_achievement;
        if (profile.personal_achievement) formData.personalAchievement = profile.personal_achievement;
        if (profile.professional_aspiration) formData.professionalAspiration = profile.professional_aspiration;
        if (profile.personal_aspiration) formData.personalAspiration = profile.personal_aspiration;

        // Block 5: Patient Value & Choice Factors
        if (profile.what_patients_value_most) formData.patientValue = profile.what_patients_value_most;
        if (profile.approach_to_care) formData.careApproach = profile.approach_to_care;
        if (profile.availability_philosophy) formData.practicePhilosophy = profile.availability_philosophy;

        // Block 6: Content Seed (take first seed if available)
        if (profile.content_seeds?.length) {
            const seed = profile.content_seeds[0];
            formData.contentSeed = {
                conditionName: seed.conditionName || seed.condition_name || '',
                presentation: seed.presentation || '',
                investigations: seed.investigations || '',
                treatment: seed.treatment || '',
                delayConsequences: seed.delayConsequences || seed.delay_consequences || '',
                prevention: seed.prevention || '',
                additionalInsights: seed.additionalInsights || seed.additional_insights || '',
            };
        }

        return formData;
    },
};
