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
    medical_council: string | null;
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
        pincode?: string;
        phone_number?: string;
        consultation_fee?: number;
        consultation_type?: string;
        weekly_schedule?: string;
        lat?: number;
        lng?: number;
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

    onboarding_status: string;
    content_seeds: Array<Record<string, string>>;

    // Media
    profile_photo?: string | null;
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
        const formData: Record<string, unknown> = {
            // Initialize basics with defaults to avoid 'undefined' keys
            fullName: '',
            email: '',
            phone: '',
            specialty: '',
            primaryLocation: '',
            practiceLocations: [],
            experience: '',
            postSpecialisationExperience: '',
            registrationNumber: '',
            medicalCouncil: '',
            mbbsYear: '',
            specialisationYear: '',
            fellowships: [],
            qualifications: '',
            memberships: '',
            awards: '',
            areasOfInterest: [],
            practiceSegments: [],
            commonConditions: [],
            knownForConditions: [],
            wantToTreatConditions: '',
            trainingExperience: [],
            motivation: [],
            unwinding: [],
            recognition: '',
            qualityTime: '',
            freeText: '',
            proudAchievement: '',
            personalAchievement: '',
            professionalAspiration: '',
            personalAspiration: '',
            patientValue: '',
            careApproach: '',
            practicePhilosophy: '',
            onboarding_status: 'pending',
            contentSeed: {
                conditionName: '',
                presentation: '',
                investigations: '',
                treatment: '',
                delayConsequences: '',
                prevention: '',
                additionalInsights: ''
            }
        };

        // Block 1: Professional Identity
        if (profile.full_name) {
            formData.fullName = profile.full_name;
        } else if (profile.first_name || profile.last_name) {
            const parts = [profile.first_name, profile.last_name].filter(Boolean);
            if (parts.length) formData.fullName = parts.join(' ');
        }
        if (profile.email && !profile.email.startsWith('pending_')) formData.email = profile.email;
        if (profile.phone_number) formData.phone = profile.phone_number;
        if (profile.specialty) {
            formData.specialty = profile.specialty;
        } else if (profile.primary_specialization) {
            formData.specialty = profile.primary_specialization;
        }
        if (profile.primary_practice_location) formData.primaryLocation = profile.primary_practice_location;

        // Practice locations — the form expects an array of objects:
        //   { name, address, schedule, city?, state?, pincode?, phone_number?, lat?, lng? }
        if (profile.practice_locations?.length) {
            formData.practiceLocations = profile.practice_locations.map(loc => ({
                name: loc.hospital_name || '',
                address: loc.address || '',
                schedule: loc.weekly_schedule || '',
                city: loc.city || '',
                state: loc.state || '',
                pincode: loc.pincode || '',
                phone_number: loc.phone_number || '',
                lat: loc.lat,
                lng: loc.lng,
            }));
        } else if (profile.centres_of_practice?.length) {
            // Fallback: centres_of_practice is a flat string array (just names)
            formData.practiceLocations = profile.centres_of_practice.map(name => ({
                name,
                address: '',
                schedule: '',
            }));
        }

        if (profile.years_of_clinical_experience != null) {
            formData.experience = String(profile.years_of_clinical_experience);
        } else if (profile.years_of_experience != null) {
            formData.experience = String(profile.years_of_experience);
        }
        if (profile.years_post_specialisation != null) formData.postSpecialisationExperience = String(profile.years_post_specialisation);

        // Block 2: Credentials & Trust Markers
        if (profile.year_of_mbbs != null) formData.mbbsYear = String(profile.year_of_mbbs);
        if (profile.year_of_specialisation != null) formData.specialisationYear = String(profile.year_of_specialisation);
        if (profile.fellowships?.length) formData.fellowships = profile.fellowships;
        if (profile.qualifications?.length) formData.qualifications = profile.qualifications.join(', ');
        if (profile.professional_memberships?.length) formData.memberships = profile.professional_memberships.join(', ');
        if (profile.awards_academic_honours?.length) formData.awards = profile.awards_academic_honours.join(', ');
        if (profile.medical_registration_number) formData.registrationNumber = profile.medical_registration_number;
        if (profile.medical_council) formData.medicalCouncil = profile.medical_council;

        // Block 3: Clinical Focus & Expertise
        if (profile.areas_of_clinical_interest?.length) formData.areasOfInterest = profile.areas_of_clinical_interest;
        if (profile.practice_segments) {
            formData.practiceSegments = profile.practice_segments.split(',').map(s => s.trim()).filter(Boolean);
        }
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

        if (profile.onboarding_status) formData.onboarding_status = profile.onboarding_status;

        // Profile photo (S3 URL)
        if (profile.profile_photo) {
            (formData as any).profileImage = profile.profile_photo;
        }

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

        // Map additional legacy fields
        if (profile.languages?.length) (formData as any).languages = profile.languages;
        if (profile.sub_specialties?.length) (formData as any).subSpecialties = profile.sub_specialties;
        if (profile.gender) (formData as any).gender = profile.gender;

        return formData;
    },

    /**
     * Map onboarding form data to the API payload for PUT /onboarding-admin/details/{doctor_id}.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapFormDataToApiPayload: (formData: Record<string, any>): Record<string, unknown> => {
        const toNumberOrNull = (val: string | number | null | undefined): number | null => {
            if (val == null || val === '') return null;
            const n = Number(val);
            return isNaN(n) ? null : n;
        };

        const toArrayOrNull = (val: string | string[] | null | undefined): string[] | null => {
            if (val == null) return null;
            if (Array.isArray(val)) return val.length > 0 ? val : null;
            if (typeof val === 'string' && val.trim()) {
                return val.split(',').map(s => s.trim()).filter(Boolean);
            }
            return null;
        };

        const toStringOrNull = (val: string | null | undefined): string | null => {
            if (val == null || val === '') return null;
            return val;
        };

        // Build content_seeds from contentSeed object
        let contentSeeds = null;
        if (formData.contentSeed) {
            const seed = formData.contentSeed;
            const hasAnyContent = Object.values(seed).some((v: unknown) => typeof v === 'string' && v.trim());
            if (hasAnyContent) {
                contentSeeds = [{
                    condition_name: seed.conditionName || null,
                    presentation: seed.presentation || null,
                    investigations: seed.investigations || null,
                    treatment: seed.treatment || null,
                    delay_consequences: seed.delayConsequences || null,
                    prevention: seed.prevention || null,
                    additional_insights: seed.additionalInsights || null,
                }];
            }
        }

        // Build practice_locations and centres_of_practice from practiceLocations
        let practiceLocations = null;
        let centresOfPractice = null;

        if (formData.practiceLocations?.length) {
            // Check if it's an array of strings or objects
            const isStringArray = typeof formData.practiceLocations[0] === 'string';

            if (isStringArray) {
                // Handle string array (just names)
                centresOfPractice = formData.practiceLocations;
                practiceLocations = formData.practiceLocations.map((name: string) => ({
                    hospital_name: name,
                    address: null,
                    weekly_schedule: null,
                }));
            } else {
                // Handle object array (full details)
                centresOfPractice = formData.practiceLocations
                    .map((l: any) => l.name || l.hospital_name)
                    .filter(Boolean);

                practiceLocations = formData.practiceLocations.map((loc: any) => ({
                    hospital_name: loc.name || loc.hospital_name || null,
                    address: loc.address || null,
                    weekly_schedule: loc.timings || loc.weekly_schedule || loc.schedule || null,
                    city: loc.city || null,
                    state: loc.state || null,
                    pincode: loc.pincode || null,
                    phone_number: loc.phone_number || null,
                    lat: loc.lat || null,
                    lng: loc.lng || null,
                }));
            }
        }

        return {
            // Block 1: Professional Identity
            full_name: toStringOrNull(formData.fullName),
            email: toStringOrNull(formData.email),
            specialty: toStringOrNull(formData.specialty),
            primary_practice_location: toStringOrNull(formData.primaryLocation),
            centres_of_practice: centresOfPractice,
            years_of_clinical_experience: toNumberOrNull(formData.experience),
            years_post_specialisation: toNumberOrNull(formData.postSpecialisationExperience),

            // Block 2: Credentials & Trust Markers
            year_of_mbbs: toNumberOrNull(formData.mbbsYear),
            year_of_specialisation: toNumberOrNull(formData.specialisationYear),
            fellowships: toArrayOrNull(formData.fellowships),
            qualifications: toArrayOrNull(formData.qualifications),
            professional_memberships: toArrayOrNull(formData.memberships),
            awards_academic_honours: toArrayOrNull(formData.awards),

            // Block 3: Clinical Focus & Expertise
            areas_of_clinical_interest: toArrayOrNull(formData.areasOfInterest),
            practice_segments: Array.isArray(formData.practiceSegments)
                ? formData.practiceSegments.join(', ') || null
                : toStringOrNull(formData.practiceSegments),
            conditions_commonly_treated: toArrayOrNull(formData.commonConditions),
            conditions_known_for: toArrayOrNull(formData.knownForConditions),
            conditions_want_to_treat_more: toArrayOrNull(formData.wantToTreatConditions),

            // Block 4: The Human Side
            training_experience: toArrayOrNull(formData.trainingExperience),
            motivation_in_practice: toArrayOrNull(formData.motivation),
            unwinding_after_work: toArrayOrNull(formData.unwinding),
            recognition_identity: toArrayOrNull(formData.recognition),
            quality_time_interests: toArrayOrNull(formData.qualityTime),
            quality_time_interests_text: toStringOrNull(formData.freeText),
            professional_achievement: toStringOrNull(formData.proudAchievement),
            personal_achievement: toStringOrNull(formData.personalAchievement),
            professional_aspiration: toStringOrNull(formData.professionalAspiration),
            personal_aspiration: toStringOrNull(formData.personalAspiration),

            // Block 5: Patient Value & Choice Factors
            what_patients_value_most: toStringOrNull(formData.patientValue),
            approach_to_care: toStringOrNull(formData.careApproach),
            availability_philosophy: toStringOrNull(formData.practicePhilosophy),

            // Block 6: Content Seed
            content_seeds: contentSeeds,

            // Additional legacy fields from the API spec
            gender: toStringOrNull(formData.gender),
            years_of_experience: toNumberOrNull(formData.experience),
            consultation_fee: toNumberOrNull(formData.consultationFee),
            medical_registration_number: toStringOrNull(formData.registrationNumber),
            medical_council: toStringOrNull(formData.medicalCouncil),
            registration_number: toStringOrNull(formData.registrationNumber),
            languages: toArrayOrNull(formData.languages),
            practice_locations: practiceLocations,
        };
    },

    /**
     * Update doctor details via PUT /doctors/{doctor_id}.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateDoctorDetails: async (doctorId: string | number, formData: Record<string, any>): Promise<void> => {
        const payload = doctorService.mapFormDataToApiPayload(formData);
        await api.put(`/doctors/${doctorId}`, payload);
    },

    /**
     * Upload profile photo via POST /doctors/{doctor_id}/profile-photo.
     * Returns the S3 URL from the `profile_photo` field in the response.
     */
    uploadProfilePhoto: async (doctorId: string | number, file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<{ success: boolean; data: { profile_photo: string } }>(
            `/doctors/${doctorId}/profile-photo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );

        // Prefer nested data.profile_photo, but fall back defensively
        const data = response.data as any;
        if (data?.data?.profile_photo) {
            return data.data.profile_photo as string;
        }
        if (data?.profile_photo) {
            return data.profile_photo as string;
        }
        throw new Error('Profile photo URL not found in response');
    },

    /**
     * Submit profile via POST /onboarding/submit/{doctor_id}.
     */
    submitProfile: async (doctorId: string | number): Promise<void> => {
        await api.post(`/onboarding/submit/${doctorId}`);
    },

    /**
     * Extract data from resume file.
     */
    extractResume: async (file: File): Promise<Record<string, unknown>> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<{ success: boolean; data: ResumeExtractedData }>('/onboarding/extract-resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.data.success || !response.data.data) {
            throw new Error('Failed to extract data from resume');
        }

        return doctorService.mapExtractedDataToFormData(response.data.data);
    },

    mapExtractedDataToFormData: (data: ResumeExtractedData): Record<string, unknown> => {
        const formData: Record<string, unknown> = {};

        // Personal Details
        const firstName = data.personal_details?.first_name || '';
        const lastName = data.personal_details?.last_name || '';
        if (firstName || lastName) {
            formData.fullName = [firstName, lastName].filter(Boolean).join(' ');
        }
        if (data.personal_details?.email) formData.email = data.personal_details.email;
        if (data.personal_details?.phone) formData.phone = data.personal_details.phone;

        // Professional Info
        if (data.professional_information?.primary_specialization) {
            formData.specialty = data.professional_information.primary_specialization;
        }

        // Registration
        if (data.registration?.medical_registration_number) {
            formData.registrationNumber = data.registration.medical_registration_number;
        }

        // Qualifications
        if (data.qualifications?.length) {
            // Map structured qualifications to string list
            formData.qualifications = data.qualifications
                .map(q => q.degree || q.field_of_study)
                .filter(Boolean)
                .join(', ');

            // Try to extract MBBS and Specialisation years if possible
            const mbbs = data.qualifications.find(q => q.degree?.toLowerCase().includes('mbbs'));
            if (mbbs?.year_obtained) formData.mbbsYear = String(mbbs.year_obtained);

            const mdMs = data.qualifications.find(q =>
                ['md', 'ms', 'dnb'].some(d => q.degree?.toLowerCase().includes(d))
            );
            if (mdMs?.year_obtained) formData.specialisationYear = String(mdMs.year_obtained);
        }

        // Practice Locations
        if (data.practice_locations?.length) {
            // Map to existing UI structure (text array or object array depending on usage)
            // Onboarding.tsx expects objects in practiceLocations usually?
            // "practiceLocations: [], // Array of { name, address, timings }"
            formData.practiceLocations = data.practice_locations.map(loc => ({
                name: loc.hospital_name,
                address: loc.location || loc.address || '',
                schedule: loc.weekly_schedule || '',
                city: loc.city || '',
                state: loc.state || '',
                pincode: loc.pincode || '',
                phone_number: loc.phone_number || '',
                lat: loc.lat,
                lng: loc.lng,
            }));

            // Also set primary location to the first one
            if (data.practice_locations[0]?.location) {
                formData.primaryLocation = data.practice_locations[0].location;
            }
        }

        // Awards & Memberships
        if (data.awards_and_recognitions?.length) {
            formData.awards = data.awards_and_recognitions.join(', ');
        }
        if (data.memberships?.length) {
            formData.memberships = data.memberships.join(', ');
        }

        // Skills / Areas of Interest
        if (data.skills_and_expertise?.length) {
            formData.areasOfInterest = data.skills_and_expertise;
        }

        return formData;
    }
};

// Define extracted data interfaces based on backend response
export interface ResumeExtractedData {
    personal_details: {
        first_name: string | null;
        last_name: string | null;
        email: string | null;
        phone: string | null;
        title: string | null;
        linkedin_url: string | null;
    };
    professional_information: {
        primary_specialization: string | null;
        sub_specialties: string[];
        current_position: string | null;
        years_of_experience: number | null;
    };
    registration: {
        medical_registration_number: string | null;
        state: string | null;
    };
    qualifications: Array<{
        degree: string | null;
        institution: string | null;
        year_obtained: number | null;
        field_of_study: string | null;
    }>;
    practice_locations: Array<{
        hospital_name: string | null;
        location: string | null;
        address?: string | null;
        city?: string | null;
        state?: string | null;
        pincode?: string | null;
        phone_number?: string | null;
        weekly_schedule?: string | null;
        lat?: number;
        lng?: number;
        is_current: boolean;
    }>;
    skills_and_expertise: string[];
    awards_and_recognitions: string[];
    memberships: string[];
    languages: string[];
    content_seeds: Array<any>;
}
